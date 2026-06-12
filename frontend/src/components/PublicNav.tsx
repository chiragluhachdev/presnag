export function PublicFooter() {
  return (
    <footer className="mt-8 border-t border-slate-150 bg-slate-50/30 py-4 print:hidden">
      <div className="mx-auto max-w-4xl px-4 text-center text-xs text-slate-400">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-y-3">
          <div className="flex items-center gap-1 font-mono tracking-wide select-none">
            <span className="text-slate-700 font-extrabold text-sm">Pre</span>
            <span className="text-brand-500 font-extrabold text-sm">Snag</span>
            <span className="text-slate-300">|</span>
            <span className="text-[10px] text-slate-400">Order ahead & skip queues</span>
          </div>

          <nav className="flex items-center gap-x-4 text-slate-400 font-medium">
            <a href="/about" target="_blank" rel="noopener noreferrer" className="hover:text-brand-600 transition">About</a>
            <a href="/partner" target="_blank" rel="noopener noreferrer" className="hover:text-brand-600 transition">Partners</a>
            <a href="mailto:support@presnag.com" className="hover:text-brand-600 transition">Contact</a>
            <a href="/terms" target="_blank" rel="noopener noreferrer" className="hover:text-brand-600 transition">Terms</a>
            <a href="/privacy" target="_blank" rel="noopener noreferrer" className="hover:text-brand-600 transition">Privacy</a>
          </nav>
        </div>
        <p className="mt-2.5 text-[9px] font-mono text-slate-450 border-t border-slate-200/30 pt-2.5 text-center sm:text-left">
          © {new Date().getFullYear()} PreSnag. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
