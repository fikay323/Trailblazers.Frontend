'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
	UserDto,
	AuthResponseDto,
	LoginPayload,
	RegisterPayload,
	login as apiLogin,
	register as apiRegister,
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<UserDto | null>(null);
	const [token, setToken] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		let activeToken = localStorage.getItem('auth_token');
		let activeUser: UserDto | null = null;

		const storedUser = localStorage.getItem('auth_user');
		if (storedUser) {
			try {
				activeUser = JSON.parse(storedUser);
			} catch {
				localStorage.removeItem('auth_user');
			}
		}

		// Fallback 1: Check shared wildcard cookie across subdomains (Single Sign-On bridge)
		if (!activeToken || !activeUser) {
			const shared = getSharedAuthCookie();
			if (shared && shared.token) {
				activeToken = activeToken || shared.token;
				activeUser = activeUser || shared.user;
			}
		}

		// Fallback 2: If we have a token but user profile is missing, extract claims from JWT
		if (activeToken && !activeUser) {
			activeUser = parseJwtUser(activeToken);
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
				.catch((err) => {
					console.warn('Silent user profile sync noticed:', err);
				});
		}

		setIsLoading(false);
	}, []);

	const saveAuth = (auth: AuthResponseDto) => {
		setToken(auth.token);
		setUser(auth.user);
		localStorage.setItem('auth_token', auth.token);
		localStorage.setItem('auth_refresh_token', auth.refreshToken);
		localStorage.setItem('auth_user', JSON.stringify(auth.user));
		if (auth.user.role === 'Admin' || auth.user.role === 'Instructor') {
			localStorage.setItem('admin_api_key', 'trailblazers-secret-key');
		}
		// Write shared wildcard cookie for cross-subdomain SSO
		setSharedAuthCookie(auth.token, auth.user);
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

	const logout = () => {
		logoutUser();
		clearSharedAuthCookie();
		setUser(null);
		setToken(null);
		localStorage.removeItem('auth_token');
		localStorage.removeItem('auth_refresh_token');
		localStorage.removeItem('auth_user');
		localStorage.removeItem('admin_api_key');
		if (typeof window !== 'undefined') {
			window.location.href = '/auth/login';
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
				refreshUserProfile
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
