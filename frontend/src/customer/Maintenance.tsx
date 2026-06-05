import { Wrench, Phone, Mail } from "lucide-react";

const SUPPORT_EMAIL = "support@presnag.com";
const OWNER_PHONE = "8130809374";

export default function Maintenance() {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-slate-50 px-5 py-10">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-7 text-center shadow-sm sm:p-9">
        {/* Brand */}
        <p className="text-lg font-black tracking-tight">
          <span className="text-slate-900">Pre</span><span className="text-brand-500">Snag</span>
        </p>

        {/* Icon */}
        <div className="mx-auto mt-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
          <Wrench className="h-7 w-7" />
        </div>

        <h1 className="mt-5 text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
          Platform under development
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          We're currently building &amp; improving PreSnag. The platform isn't available right now —
          please check back soon.
        </p>

        {/* Contact support */}
        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50/60 p-4 text-left">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Please contact support
          </p>
          <a
            href={`mailto:${SUPPORT_EMAIL}?subject=PreSnag%20Support`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-600 active:scale-[0.99]"
          >
            <Mail className="h-4 w-4" /> {SUPPORT_EMAIL}
          </a>
          <a
            href={`tel:${OWNER_PHONE}`}
            className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-brand-300 hover:text-brand-600 active:scale-[0.99]"
          >
            <Phone className="h-4 w-4" /> {OWNER_PHONE}
          </a>
        </div>

        <p className="mt-6 text-[11px] text-slate-400">
          © {new Date().getFullYear()} PreSnag. All rights reserved.
        </p>
      </div>
    </div>
  );
}
