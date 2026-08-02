export interface SummerStatus {
  badge: string
  heroTag: string
  heroHeadline: string
  subText: string
  ctaBannerTitle: string
  ctaBannerSub: string
  venueBadge: string
  faqStartAnswer: string
  isOngoing: boolean
}

/**
 * Returns dynamic, date-aware copy for the Summer Coaching campaign.
 * Automatically updates text depending on whether the date is before Monday,
 * on Monday, or after Monday (ongoing session).
 */
export function getSummerStatus(nowDate?: Date): SummerStatus {
  // Target start date: Monday, August 3, 2026
  const targetYear = 2026
  const targetMonth = 7 // 0-indexed: August is 7
  const targetDay = 3

  const startDate = new Date(targetYear, targetMonth, targetDay)
  const now = nowDate || new Date()

  // Clear hours for exact day comparison
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startDay = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())

  const diffTime = startDay.getTime() - today.getTime()
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays > 1) {
    return {
      badge: "Starts Monday!",
      heroTag: "Starting Monday, Aug 3",
      heroHeadline: "Classes Start Monday!",
      subText: "Intensive Summer Coaching starts Monday, August 3! Special classes for JSS1–SS3, JAMB Headstart & Practical CBT.",
      ctaBannerTitle: "Classes Commence Monday, August 3!",
      ctaBannerSub: "Limited seats available for personalized attention. Secure your spot today.",
      venueBadge: "Starts Monday, August 3",
      faqStartAnswer: "Classes officially start on Monday, August 3, 2026! Early arrival is recommended to maximize learning.",
      isOngoing: false,
    }
  } else if (diffDays === 1) {
    return {
      badge: "Starts Tomorrow!",
      heroTag: "Starting Tomorrow, Monday",
      heroHeadline: "Classes Start Tomorrow, Monday!",
      subText: "Intensive Summer Coaching starts tomorrow, Monday, August 3! Special classes for JSS1–SS3, JAMB Headstart & Practical CBT.",
      ctaBannerTitle: "Classes Commence Tomorrow, Monday!",
      ctaBannerSub: "Limited seats available for personalized attention. Secure your spot today.",
      venueBadge: "Starts Tomorrow, Monday, Aug 3",
      faqStartAnswer: "Classes officially start tomorrow, Monday, August 3, 2026! Early arrival is recommended to maximize learning.",
      isOngoing: false,
    }
  } else if (diffDays === 0) {
    return {
      badge: "Starts Today!",
      heroTag: "Starting Today, Monday",
      heroHeadline: "Classes Start Today!",
      subText: "Intensive Summer Coaching starts today, Monday, August 3! Special classes for JSS1–SS3, JAMB Headstart & Practical CBT.",
      ctaBannerTitle: "Classes Commence Today!",
      ctaBannerSub: "First session kicks off today. Registration remains open for late joiners.",
      venueBadge: "Started Today, Monday, Aug 3",
      faqStartAnswer: "Classes officially start today, Monday, August 3, 2026! You can still register and join today.",
      isOngoing: true,
    }
  } else {
    return {
      badge: "Now Ongoing!",
      heroTag: "Classes In Progress",
      heroHeadline: "Summer Lessons Now Ongoing!",
      subText: "Intensive Summer Coaching is now in full swing! Late registration is open for JSS1–SS3, JAMB Headstart & Practical CBT.",
      ctaBannerTitle: "Classes Now In Progress – Join This Week!",
      ctaBannerSub: "Late enrollment is open. Catch up with ongoing sessions and master key subjects.",
      venueBadge: "Currently Ongoing (Mon – Fri)",
      faqStartAnswer: "Summer lessons are currently ongoing! Late registration remains open for students joining this week.",
      isOngoing: true,
    }
  }
}
