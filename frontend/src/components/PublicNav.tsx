export function PublicFooter() {
  return (
    <footer className="mt-6 border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-6 text-center text-sm text-slate-500">
        <p className="text-base font-black tracking-tight">
          <span className="text-slate-900">Pre</span><span className="text-brand-500">Snag</span>
        </p>
        <p className="mt-1">Order Ahead. Skip The Queue. · No app required.</p>
        <nav className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-slate-600">
          <a href="#about" className="hover:text-brand-600">About</a>
          <a href="mailto:hello@presnag.com" className="hover:text-brand-600">Contact</a>
          <a href="#terms" className="hover:text-brand-600">Terms</a>
          <a href="#privacy" className="hover:text-brand-600">Privacy</a>
        </nav>
        <p className="mt-4 text-xs">© {new Date().getFullYear()} PreSnag. All rights reserved.</p>
      </div>
    </footer>
  );
}
