'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
	UserDto,
	AuthResponseDto,
	LoginPayload,
	RegisterPayload,
	login as apiLogin,
	register as apiRegister,
	getCurrentUser
} from '../services/authService';

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
		const storedToken = localStorage.getItem('auth_token');
		const storedUser = localStorage.getItem('auth_user');

		if (storedToken && storedUser) {
			try {
				setToken(storedToken);
				setUser(JSON.parse(storedUser));
			} catch (e) {
				localStorage.removeItem('auth_token');
				localStorage.removeItem('auth_user');
			}
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
		setUser(null);
		setToken(null);
		localStorage.removeItem('auth_token');
		localStorage.removeItem('auth_refresh_token');
		localStorage.removeItem('auth_user');
		localStorage.removeItem('admin_api_key');
	};

	const refreshUserProfile = async () => {
		if (!token) return;
		try {
			const updated = await getCurrentUser(token);
			setUser(updated);
			localStorage.setItem('auth_user', JSON.stringify(updated));
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
