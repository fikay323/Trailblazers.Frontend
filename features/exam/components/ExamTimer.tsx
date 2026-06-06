'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { Timer, AlertTriangle } from 'lucide-react';

interface ExamTimerProps {
	endTime: string;
	onTimeUp: () => void;
}

export function ExamTimer({ endTime, onTimeUp }: ExamTimerProps) {
	const [timeLeft, setTimeLeft] = useState<number>(0);

	useEffect(() => {
		const calculateTimeLeft = () => {
			const difference = +new Date(endTime) - +new Date();
			return difference > 0 ? Math.floor(difference / 1000) : 0;
		};

		// Initial calculation
		const initialTime = calculateTimeLeft();
		setTimeLeft(initialTime);

		if (initialTime <= 0) {
			onTimeUp();
			return;
		}

		const interval = setInterval(() => {
			const remaining = calculateTimeLeft();
			setTimeLeft(remaining);

			if (remaining <= 0) {
				clearInterval(interval);
				onTimeUp();
			}
		}, 1000);

		return () => clearInterval(interval);
	}, [endTime, onTimeUp]);

	const formatTime = (secondsTotal: number) => {
		const hours = Math.floor(secondsTotal / 3600);
		const minutes = Math.floor((secondsTotal % 3600) / 60);
		const seconds = secondsTotal % 60;

		const pad = (num: number) => String(num).padStart(2, '0');
		return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
	};

	// Determine visual urgency colors
	const isUrgent = timeLeft < 600; // Less than 10 minutes (red)
	const isWarning = timeLeft >= 600 && timeLeft < 1800; // 10 to 30 minutes (amber)

	let timerColorClass = 'text-emerald-700 border-emerald-200 bg-emerald-50';
	if (isUrgent) {
		timerColorClass = 'text-red-700 border-red-200 bg-red-50 animate-pulse';
	} else if (isWarning) {
		timerColorClass = 'text-amber-700 border-amber-200 bg-amber-50';
	}

	return (
		<div className={`flex items-center gap-2.5 px-4 py-2 rounded-full border text-sm font-mono font-bold tracking-wider shadow-inner transition-colors duration-500 ${timerColorClass}`}>
			{isUrgent ? (
				<AlertTriangle className="h-4 w-4 shrink-0 text-red-600" />
			) : (
				<Timer className={`h-4 w-4 shrink-0 ${isWarning ? 'text-amber-600' : 'text-emerald-600'}`} />
			)}
			<span>{formatTime(timeLeft)}</span>
		</div>
	);
}
