'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
	UserDto,
	AuthResponseDto,
	LoginPayload,
	RegisterPayload,
	login as apiLogin,
	register as apiRegister,
	refreshAccessToken,
	getCurrentUser,
	logoutUser,
	parseJwtUser
} from '../services/authService';
import {
	setSharedAuthCookie,
	getSharedAuthCookie,
	clearSharedAuthCookie
} from '../utils/subdomain';

interface AuthContextType {
	user: UserDto | null;
	token: string | null;
	isLoading: boolean;
	login: (payload: LoginPayload) => Promise<UserDto>;
	register: (payload: RegisterPayload) => Promise<UserDto>;
	logout: () => void;
	refreshUserProfile: () => Promise<void>;
	setSession: (auth: AuthResponseDto) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<UserDto | null>(null);
	const [token, setToken] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const isBrowser = typeof window !== 'undefined';
		if (!isBrowser) {
			setIsLoading(false);
			return;
		}

		const hostname = window.location.hostname.toLowerCase();
		const isProductionDomain = hostname === 'trailblazer-academy.com' || hostname.endsWith('.trailblazer-academy.com');

		const shared = getSharedAuthCookie();

		let activeToken: string | null = null;
		let activeUser: UserDto | null = null;

		if (isProductionDomain) {
			// In production, the shared wildcard cookie (.trailblazer-academy.com) is the single source of truth across subdomains.
			if (shared && shared.token) {
				activeToken = shared.token;
				activeUser = shared.user || parseJwtUser(shared.token);
			} else {
				// User logged out or session expired on another subdomain — purge local storage to prevent session resurrection
				localStorage.removeItem('auth_token');
				localStorage.removeItem('auth_user');
				localStorage.removeItem('auth_refresh_token');
				localStorage.removeItem('admin_api_key');
			}
		} else {
			// Local development / non-production environment
			if (shared && shared.token) {
				activeToken = shared.token;
				activeUser = shared.user;
			} else {
				activeToken = localStorage.getItem('auth_token');
				const storedUser = localStorage.getItem('auth_user');
				if (storedUser) {
					try {
						activeUser = JSON.parse(storedUser);
					} catch {
						localStorage.removeItem('auth_user');
					}
				}
				if (activeToken && !activeUser) {
					activeUser = parseJwtUser(activeToken);
				}
			}
		}

		if (activeToken && activeUser) {
			setToken(activeToken);
			setUser(activeUser);
			localStorage.setItem('auth_token', activeToken);
			localStorage.setItem('auth_user', JSON.stringify(activeUser));
			setSharedAuthCookie(activeToken, activeUser);

			if (activeUser.role === 'Admin' || activeUser.role === 'Instructor') {
				localStorage.setItem('admin_api_key', 'trailblazers-secret-key');
			}

			// Silently re-verify with database to sync any role or status changes
			getCurrentUser(activeToken)
				.then((freshUser) => {
					setUser(freshUser);
					localStorage.setItem('auth_user', JSON.stringify(freshUser));
					setSharedAuthCookie(activeToken!, freshUser);
				})
				.catch(async (err) => {
					console.warn('Silent user profile sync noticed:', err);
					const refreshToken = localStorage.getItem('auth_refresh_token');
					if (refreshToken) {
						try {
							const refreshed = await refreshAccessToken(refreshToken);
							setToken(refreshed.token);
							setUser(refreshed.user);
							localStorage.setItem('auth_token', refreshed.token);
							localStorage.setItem('auth_refresh_token', refreshed.refreshToken);
							localStorage.setItem('auth_user', JSON.stringify(refreshed.user));
							setSharedAuthCookie(refreshed.token, refreshed.user);
						} catch (refreshErr) {
							console.warn('Silent session refresh failed:', refreshErr);
						}
					}
				});
		} else {
			setUser(null);
			setToken(null);
		}

		setIsLoading(false);
	}, []);

	const saveAuth = (auth: any) => {
		const userObj: UserDto = auth.user || {
			id: auth.userId || auth.id || '',
			email: auth.email || '',
			fullName: auth.fullName || '',
			role: auth.role || 'Student',
			isActive: auth.isActive ?? true
		};
		setToken(auth.token);
		setUser(userObj);
		localStorage.setItem('auth_token', auth.token);
		localStorage.setItem('auth_refresh_token', auth.refreshToken || '');
		localStorage.setItem('auth_user', JSON.stringify(userObj));
		if (userObj.role === 'Admin' || userObj.role === 'Instructor') {
			localStorage.setItem('admin_api_key', 'trailblazers-secret-key');
		} else {
			localStorage.removeItem('admin_api_key');
		}
		// Write shared wildcard cookie for cross-subdomain SSO
		setSharedAuthCookie(auth.token, userObj);
	};

	const login = async (payload: LoginPayload): Promise<UserDto> => {
		const auth = await apiLogin(payload);
		saveAuth(auth);
		return auth.user;
	};

	const register = async (payload: RegisterPayload): Promise<UserDto> => {
		const auth = await apiRegister(payload);
		saveAuth(auth);
		return auth.user;
	};

	const logout = async () => {
		try {
			await logoutUser();
		} catch (e) {
			console.error('Logout error on backend:', e);
		}
		clearSharedAuthCookie();
		setUser(null);
		setToken(null);
		localStorage.removeItem('auth_token');
		localStorage.removeItem('auth_refresh_token');
		localStorage.removeItem('auth_user');
		localStorage.removeItem('admin_api_key');
		if (typeof window !== 'undefined') {
			const host = window.location.hostname.toLowerCase();
			if (host.startsWith('staff.') || host.startsWith('learn.')) {
				window.location.href = '/auth/login';
			} else {
				window.location.href = '/';
			}
		}
	};

	const refreshUserProfile = async () => {
		if (!token) return;
		try {
			const updated = await getCurrentUser(token);
			setUser(updated);
			localStorage.setItem('auth_user', JSON.stringify(updated));
			setSharedAuthCookie(token, updated);
		} catch (err) {
			console.error('Failed to refresh profile:', err);
		}
	};

	return (
		<AuthContext.Provider
			value={{
				user,
				token,
				isLoading,
				login,
				register,
				logout,
				refreshUserProfile,
				setSession: saveAuth
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error('useAuth must be used within an AuthProvider');
	}
	return context;
}
