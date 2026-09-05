'use client';

import * as React from 'react';
import { useAuth } from '@/core/contexts/AuthContext';
import { AppHeader } from './app-header';
import { WebsiteHeader } from './website-header';

/**
 * Top-level Header switcher:
 * - If a user is logged in: Renders the dedicated, clutter-free AppHeader (LMS portal topbar with NO public website links).
 * - If guest/visitor: Renders the promotional WebsiteHeader (marketing pages, programs, gallery, etc.).
 */
export function Header() {
	const { user, isLoading } = useAuth();

	// Render a consistent height placeholder during initial client auth hydration to prevent layout shift
	if (isLoading) {
		return <div className="h-16 w-full border-b border-border/40 bg-background/95" />;
	}

	if (user) {
		return <AppHeader />;
	}

	return <WebsiteHeader />;
}
