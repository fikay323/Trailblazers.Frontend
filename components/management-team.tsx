"use client"

import React, { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Users, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "@/components/ui/dialog"
import { Member, managementTeam } from "@/lib/team-data"

export type { Member }
export { managementTeam }

export interface ManagementTeamProps {
	teamMembers?: Member[]
}

export function ManagementTeam({ teamMembers }: ManagementTeamProps = {}) {
	const currentTeam = teamMembers && teamMembers.length > 0 ? teamMembers : managementTeam
	const [selectedMember, setSelectedMember] = useState<Member | null>(null)

	// Proprietor and Proprietress come first
	const leaders = currentTeam.slice(0, 2)
	// Remaining members
	const members = currentTeam.slice(2)

	return (
		<section className="bg-slate-50 py-16 lg:py-24">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
				<span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary">
					Our Leadership
				</span>
				<h2 className="mt-4 text-3xl font-bold text-foreground lg:text-4xl">Management Team</h2>
				<p className="mx-auto mt-4 max-w-2xl text-muted-foreground mb-16">
					The visionary leaders driving Trailblazer Academy & Edukonsult's commitment to academic success.
				</p>

				{/* Primary Leaders (Proprietor and Proprietress) */}
				<div className="grid gap-8 sm:grid-cols-2 max-w-3xl mx-auto mb-16 justify-center">
					{leaders.map((member, i) => (
						<div
							key={i}
							onClick={() => setSelectedMember(member)}
							className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/50 bg-card p-6 text-center shadow-xs transition-all duration-300 hover:-translate-y-1.5 hover:shadow-md cursor-pointer"
						>
							<div>
								{/* Photo */}
								<div className="relative mx-auto mb-6 h-40 w-40 overflow-hidden rounded-full border-4 border-slate-100 shadow-inner">
									<Image
										src={member.image}
										alt={member.name}
										fill
										className="object-cover transition-transform duration-500 group-hover:scale-105"
									/>
								</div>
								<h3 className="text-xl font-bold text-foreground">{member.name}</h3>
								<p className="text-sm font-medium text-primary mt-1">{member.title}</p>
								<p className="mt-4 text-sm text-muted-foreground line-clamp-3 leading-relaxed">
									{member.excerpt}
								</p>
							</div>

							<div className="mt-6 pt-4 border-t border-border/40 flex items-center justify-center gap-1.5 text-xs font-semibold text-primary group-hover:underline">
								<span>Read full profile</span>
								<ChevronRight className="h-3.5 w-3.5" />
							</div>
						</div>
					))}
				</div>

				{/* Other Management Members Grid */}
				<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
					{members.map((member, i) => (
						<div
							key={i}
							onClick={() => setSelectedMember(member)}
							className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/50 bg-card p-6 text-center shadow-xs transition-all duration-300 hover:-translate-y-1.5 hover:shadow-md cursor-pointer"
						>
							<div>
								{/* Photo */}
								<div className="relative mx-auto mb-5 h-28 w-28 overflow-hidden rounded-full border-2 border-slate-100 shadow-xs">
									<Image
										src={member.image}
										alt={member.name}
										fill
										className="object-cover transition-transform duration-500 group-hover:scale-105"
									/>
								</div>
								<h3 className="text-lg font-bold text-foreground">{member.name}</h3>
								<p className="text-xs font-medium text-primary mt-1 line-clamp-1">{member.title}</p>
								<p className="mt-3 text-xs text-muted-foreground line-clamp-3 leading-relaxed">
									{member.excerpt}
								</p>
							</div>

							<div className="mt-5 pt-3 border-t border-border/40 flex items-center justify-center gap-1 text-xs font-semibold text-primary group-hover:underline">
								<span>Read full bio</span>
								<ChevronRight className="h-3 w-3" />
							</div>
						</div>
					))}
				</div>
			</div>

			{/* Full Bio Modal Dialog */}
			<Dialog open={!!selectedMember} onOpenChange={(open) => !open && setSelectedMember(null)}>
				<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto sm:rounded-2xl p-6 sm:p-8">
					{selectedMember && (
						<div>
							<DialogHeader className="text-left border-b border-border/60 pb-6 mb-6">
								<div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
									<div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full border-2 border-primary/20 shadow-sm">
										<Image
											src={selectedMember.image}
											alt={selectedMember.name}
											fill
											className="object-cover"
										/>
									</div>
									<div className="text-center sm:text-left">
										<DialogTitle className="text-2xl font-bold text-foreground">
											{selectedMember.name}
										</DialogTitle>
										<DialogDescription className="text-sm font-medium text-primary mt-1">
											{selectedMember.title}
										</DialogDescription>
									</div>
								</div>
							</DialogHeader>

							{/* Bio Paragraphs */}
							<div className="space-y-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
								{selectedMember.paragraphs.map((paragraph, index) => (
									<p key={index}>{paragraph}</p>
								))}
							</div>

							<div className="mt-8 pt-4 border-t border-border/40 flex justify-end">
								<Button
									variant="outline"
									onClick={() => setSelectedMember(null)}
									className="rounded-lg"
								>
									Close
								</Button>
							</div>
						</div>
					)}
				</DialogContent>
			</Dialog>
		</section>
	)
}
