export default function Footer() {
  return (
    <footer className="w-full border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 py-6 shadow-sm">
      <div className="container flex items-center justify-between">
        <p className="text-sm text-gray-500 dark:text-gray-400">© 2024 nchat</p>
        <nav className="flex gap-4">
          <a href="/about" className="text-sm text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">About</a>
          <a href="/privacy" className="text-sm text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Privacy</a>
          <a href="/terms" className="text-sm text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Terms</a>
        </nav>
      </div>
    </footer>
  );
} 