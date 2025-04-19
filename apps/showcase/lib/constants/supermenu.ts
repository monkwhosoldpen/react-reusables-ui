import { MaterialIcons } from "@expo/vector-icons"

export const essentialServices = [
  { icon: "badge", title: "Aadhaar" },
  { icon: "how-to-vote", title: "Voter ID" },
  { icon: "credit-card", title: "PAN" },
  { icon: "passport", title: "Passport" },
  { icon: "directions-car", title: "DL" },
] as const

export const citizenServices = [
  { icon: "report-problem", title: "File Complaint", subtitle: "Report civic issues" },
  { icon: "location-on", title: "Find Office", subtitle: "Locate government offices" },
  { icon: "event", title: "Events", subtitle: "Community events & campaigns" },
  { icon: "volunteer-activism", title: "Volunteer", subtitle: "Join civic initiatives" },
] as const

export const patrioticStore = [
  { icon: "flag", title: "Flags" },
  { icon: "local-offer", title: "Stickers" },
  { icon: "shopping-bag", title: "T-Shirts" },
  { icon: "book", title: "Books" },
] as const

export const newsAndUpdates = [
  { icon: "newspaper", title: "National\nNews" },
  { icon: "public", title: "State\nNews" },
  { icon: "location-city", title: "Local\nNews" },
  { icon: "campaign", title: "Announcements" },
] as const

export const civicEngagement = [
  { 
    icon: "poll", 
    title: "Public Polls", 
    subtitle: "Share your opinion on important issues",
  },
  { 
    icon: "forum", 
    title: "Townhall", 
    subtitle: "Connect with elected representatives",
  },
  { 
    icon: "school", 
    title: "Know Your Rights", 
    subtitle: "Learn about your constitutional rights",
  },
] as const

export const educationAndAwareness = [
  { icon: "menu-book", title: "Constitution" },
  { icon: "gavel", title: "Laws" },
  { icon: "history", title: "History" },
  { icon: "quiz", title: "Quiz" },
] as const

export const governmentServices = [
  { icon: "receipt", title: "Certificates" },
  { icon: "account-balance", title: "Tax" },
  { icon: "local-police", title: "Police" },
  { icon: "health-and-safety", title: "Health" },
] as const

export const quickLinks = [
  { icon: "help", title: "Help" },
  { icon: "info", title: "About" },
  { icon: "settings", title: "Settings" },
  { icon: "contact-support", title: "Support" },
] as const 