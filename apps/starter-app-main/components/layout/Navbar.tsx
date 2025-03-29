import { useAuth } from "@/lib/contexts/AuthContext"
import { Input } from "@/components/ui/input"
import { Search, Globe } from "lucide-react"
import Link from "next/link"
import { useNotification } from "@/lib/contexts/NotificationContext"
import LanguageChanger from "@/components/common/LanguageChanger"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export default function Navbar() {
  const pathname = usePathname();
  
  // Only use emerald styling in specific pages like explore and channels
  const isInAppSection = pathname !== '/' && !pathname.includes('/login') && !pathname.includes('/register');

  return (
    <div className="flex items-center justify-between h-full px-4 w-full bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 border-b border-gray-100 dark:border-gray-800 shadow-sm">
      {/* Logo */}
      <div className="flex items-center gap-8">
        <Link 
          href="/" 
          className="text-xl font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
        >
          nchat
        </Link>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        {/* Desktop Language Selector */}
        <LanguageChanger 
          variant="settings"
        />
      </div>
    </div>
  );
}
