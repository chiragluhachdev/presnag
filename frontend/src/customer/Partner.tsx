import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight, LogIn, Store, UploadCloud, Wallet, PackageCheck, Rocket, Clock,
  CreditCard, TrendingUp, Smartphone, Target, BadgeIndianRupee, Globe,
  CheckCircle2, ShieldCheck, LayoutDashboard, Bell, ChevronDown, Sparkles, Check,
} from "lucide-react";
import { PublicFooter } from "@/components/PublicNav";
import { cn } from "@/lib/utils";

export default function Partner() {
  // ---- SEO ----
  useEffect(() => {
    const prevTitle = document.title;
    document.title = "Partner with PreSnag | Grow Your Cafe";
    const meta = document.querySelector('meta[name="description"]') || (() => {
      const m = document.createElement("meta");
      m.name = "description";
      document.head.appendChild(m);
      return m;
    })();
    const prevDesc = meta.getAttribute("content");
    meta.setAttribute(
      "content",
      "Join PreSnag and accept pre-orders, reduce queues, and grow your business with zero per-order commission."
    );
    // Smooth-scroll for the in-page anchor nav (scoped to this page).
    document.documentElement.classList.add("scroll-smooth");
    return () => {
      document.title = prevTitle;
      if (prevDesc) meta.setAttribute("content", prevDesc);
      document.documentElement.classList.remove("scroll-smooth");
    };
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <PartnerHeader />
      <Hero />
      <WhatIs />
      <HowItWorks />
      <Benefits />
      <WhyChoose />
      <Pricing />
      <Faq />
      <FinalCta />
      <PublicFooter />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Dedicated partner header (section-scroll nav)                       */
/* ------------------------------------------------------------------ */
const NAV = [
  { label: "How it works", href: "#how" },
  { label: "Benefits", href: "#benefits" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

function PartnerHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-[1400px] items-center justify-between px-4 md:h-20 md:px-10">
        <Link to="/" className="flex items-center gap-1.5 md:gap-3">
          <img src="/PreSnaglogo.png" alt="PreSnag" className="h-9 w-9 object-contain md:h-12 md:w-12" />
          <div className="leading-none">
            <div className="text-lg font-black tracking-tight md:text-3xl">
              <span className="text-slate-900">Pre</span><span className="text-brand-500">Snag</span>
            </div>
            <div className="mt-0.5 text-[8px] font-semibold uppercase tracking-[0.18em] text-slate-500 md:mt-1 md:text-[10px] md:tracking-[0.22em]">
              For Partners
            </div>
          </div>
        </Link>

        <div className="flex items-center gap-4 md:gap-6">
          {NAV.map((n) => (
            <a
              key={n.href}
              href={n.href}
              className="hidden text-sm font-semibold text-slate-600 transition hover:text-brand-600 md:block"
            >
              {n.label}
            </a>
          ))}
          <Link
            to="/vendor/login"
            className="hidden text-sm font-semibold text-slate-600 transition hover:text-brand-600 md:block"
          >
            Vendor Login
          </Link>
          <Link
            to="/vendor/register"
            className="inline-flex items-center gap-1.5 rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-brand-500/20 transition hover:bg-brand-600 md:px-5 md:py-2.5"
          >
            <Store className="h-4 w-4" /> Become a Partner
          </Link>
        </div>
      </div>
    </header>
  );
}

/* ------------------------------------------------------------------ */
/* 1. HERO                                                             */
/* ------------------------------------------------------------------ */
function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-brand-500 via-orange-500 to-orange-600 text-white">
      <div className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 right-10 h-[28rem] w-[28rem] rounded-full bg-amber-300/20 blur-3xl" />

      <div className="relative mx-auto grid w-full max-w-[1400px] items-center gap-10 px-5 py-14 md:grid-cols-[1.1fr_0.9fr] md:gap-12 md:px-10 md:py-20">
        <div className="text-center md:text-left">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" /> For Cafes & Restaurants
          </span>
          <h1 className="mt-5 text-4xl font-extrabold leading-[1.05] tracking-tight text-white md:text-5xl lg:text-6xl xl:text-7xl">
            Grow Your Cafe<br className="hidden md:block" /> with <span className="text-amber-200">PreSnag</span>
          </h1>
          <p className="mx-auto mt-5 max-w-lg text-base text-brand-50/90 md:mx-0 md:text-lg">
            Accept pre-orders, reduce queues, increase sales, and delight customers — all from one
            simple dashboard.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row md:items-start">
            <Link
              to="/vendor/register"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-brand-600 shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:shadow-xl sm:w-auto"
            >
              Become a Partner <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/vendor/login"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/40 bg-white/10 px-6 py-3.5 text-sm font-bold text-white backdrop-blur transition hover:bg-white/20 sm:w-auto"
            >
              <LogIn className="h-4 w-4" /> Vendor Login
            </Link>
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-semibold text-white/90 md:justify-start">
            <span className="inline-flex items-center gap-1.5"><Check className="h-4 w-4 text-amber-200" /> Zero per-order commission</span>
            <span className="inline-flex items-center gap-1.5"><Check className="h-4 w-4 text-amber-200" /> No app required</span>
            <span className="inline-flex items-center gap-1.5"><Check className="h-4 w-4 text-amber-200" /> Live in minutes</span>
          </div>
        </div>

        {/* Dashboard mock */}
        <div className="relative mx-auto w-full max-w-md">
          <div className="rotate-1 rounded-2xl border border-white/20 bg-white/95 p-4 shadow-2xl backdrop-blur transition hover:rotate-0">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <img src="/PreSnaglogo.png" alt="" className="h-7 w-7 object-contain" />
                <span className="text-sm font-black"><span className="text-slate-900">Pre</span><span className="text-brand-500">Snag</span></span>
              </div>
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-600">● Live</span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <MockStat label="Today's earnings" value="₹4,820" highlight />
              <MockStat label="Orders" value="37" />
            </div>
            <div className="mt-3 space-y-2">
              {[
                { n: "PS-8F2K1", item: "2× Cappuccino", amt: "₹240" },
                { n: "PS-3J9L7", item: "1× Veg Sandwich", amt: "₹120" },
                { n: "PS-1A4M2", item: "3× Masala Chai", amt: "₹60" },
              ].map((o) => (
                <div key={o.n} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-xs">
                  <div>
                    <div className="font-bold text-slate-800">{o.n}</div>
                    <div className="text-slate-500">{o.item}</div>
                  </div>
                  <span className="font-bold text-slate-900">{o.amt}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="absolute -bottom-4 -left-4 flex items-center gap-2 rounded-xl bg-white px-3 py-2 shadow-xl">
            <Bell className="h-4 w-4 text-brand-500" />
            <span className="text-xs font-semibold text-slate-700">New prepaid order!</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function MockStat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={cn("rounded-lg p-3", highlight ? "bg-gradient-to-br from-brand-500 to-orange-600 text-white" : "bg-slate-50")}>
      <div className={cn("text-[10px] font-medium", highlight ? "text-brand-50" : "text-slate-400")}>{label}</div>
      <div className={cn("text-lg font-extrabold", highlight ? "text-white" : "text-slate-900")}>{value}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 2. WHAT IS PRESNAG                                                  */
/* ------------------------------------------------------------------ */
function WhatIs() {
  return (
    <Section className="bg-white">
      <div className="mx-auto max-w-3xl text-center">
        <Eyebrow>What is PreSnag?</Eyebrow>
        <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
          Pre-orders that skip the queue
        </h2>
        <p className="mt-4 text-base leading-relaxed text-slate-600 md:text-lg">
          PreSnag is a pre-order platform that lets your customers order and pay <span className="font-semibold text-slate-800">before they arrive</span>.
          No more long lines at the counter — orders come in ahead of time, your team prepares them,
          and customers simply walk in and pick up. Less waiting, happier customers, and more orders
          served during your busiest hours.
        </p>
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/* 3. HOW IT WORKS                                                     */
/* ------------------------------------------------------------------ */
function HowItWorks() {
  const steps = [
    { icon: Store, title: "Register your cafe", desc: "Sign up in minutes and set up your shop profile." },
    { icon: UploadCloud, title: "Upload your menu", desc: "Add items, prices and photos from your dashboard." },
    { icon: Wallet, title: "Receive prepaid orders", desc: "Customers order ahead and pay online securely." },
    { icon: PackageCheck, title: "Pickup instantly", desc: "Customer arrives and collects — no queue, no wait." },
  ];
  return (
    <Section id="how" className="bg-slate-50">
      <div className="text-center">
        <Eyebrow>How it works</Eyebrow>
        <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">Live in 4 simple steps</h2>
      </div>
      <div className="mt-12 grid gap-6 md:grid-cols-4">
        {steps.map((s, i) => (
          <div key={s.title} className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
            <div className="absolute -top-3 left-6 flex h-7 w-7 items-center justify-center rounded-full bg-brand-500 text-xs font-black text-white shadow">
              {i + 1}
            </div>
            <div className="mt-2 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <s.icon className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-base font-bold text-slate-900">{s.title}</h3>
            <p className="mt-1 text-sm text-slate-500">{s.desc}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/* 4. BENEFITS                                                         */
/* ------------------------------------------------------------------ */
function Benefits() {
  const items = [
    { icon: Rocket, emoji: "🚀", title: "More Sales", desc: "Capture orders you'd lose to long queues." },
    { icon: Clock, emoji: "⏱️", title: "Less Waiting Time", desc: "Orders are ready before customers arrive." },
    { icon: CreditCard, emoji: "💳", title: "Secure Online Payments", desc: "Cashfree-powered, fully secure checkout." },
    { icon: TrendingUp, emoji: "📈", title: "Better Experience", desc: "Smooth pickups keep customers coming back." },
    { icon: Smartphone, emoji: "📱", title: "Easy Menu Management", desc: "Update items and prices anytime, instantly." },
    { icon: Target, emoji: "🎯", title: "Zero Commission", desc: "Keep 100% of every order. No cut, ever." },
    { icon: BadgeIndianRupee, emoji: "💰", title: "Simple ₹600/month", desc: "One flat price. Unlimited orders." },
    { icon: Globe, emoji: "🏪", title: "Your Own Store Page", desc: "presnag.com/your-cafe, ready to share." },
  ];
  return (
    <Section id="benefits" className="bg-white">
      <div className="text-center">
        <Eyebrow>Benefits</Eyebrow>
        <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">Everything you need to grow</h2>
      </div>
      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((b) => (
          <div key={b.title} className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-brand-200 hover:shadow-md">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-2xl transition group-hover:scale-110">
              {b.emoji}
            </div>
            <h3 className="mt-4 text-base font-bold text-slate-900">{b.title}</h3>
            <p className="mt-1 text-sm text-slate-500">{b.desc}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/* 5. WHY CHOOSE                                                       */
/* ------------------------------------------------------------------ */
function WhyChoose() {
  const reasons = [
    { icon: Smartphone, title: "No customer app required", desc: "Customers order straight from the browser via a link or QR." },
    { icon: Globe, title: "Dedicated online storefront", desc: "A branded store page at presnag.com/your-cafe." },
    { icon: Wallet, title: "Daily settlements", desc: "Earnings settled to your bank automatically — every day." },
    { icon: LayoutDashboard, title: "Easy vendor dashboard", desc: "Manage menu, orders and payments in one place." },
    { icon: Bell, title: "Real-time order management", desc: "Instant alerts and live status updates for every order." },
    { icon: Store, title: "Built for food businesses", desc: "Designed for cafes, food courts and restaurants." },
  ];
  return (
    <Section className="bg-slate-900">
      <div className="text-center">
        <span className="text-xs font-bold uppercase tracking-wider text-brand-400">Why PreSnag</span>
        <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-white md:text-4xl">Why cafes choose PreSnag</h2>
      </div>
      <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {reasons.map((r) => (
          <div key={r.title} className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:bg-white/10">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-500/20 text-brand-400">
              <r.icon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">{r.title}</h3>
              <p className="mt-1 text-sm text-slate-400">{r.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/* 6. PRICING                                                          */
/* ------------------------------------------------------------------ */
function Pricing() {
  const features = [
    "Unlimited orders",
    "Unlimited menu items",
    "Dedicated store page",
    "Secure online payments",
    "Full vendor dashboard",
    "No commission on orders",
  ];
  return (
    <Section id="pricing" className="bg-white">
      <div className="text-center">
        <Eyebrow>Pricing</Eyebrow>
        <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">One simple plan</h2>
        <p className="mt-3 text-slate-500">No hidden fees. No per-order cut. Cancel anytime.</p>
      </div>

      <div className="mx-auto mt-12 max-w-md">
        <div className="relative overflow-hidden rounded-3xl border border-brand-200 bg-white shadow-xl">
          <div className="absolute right-0 top-0 rounded-bl-2xl bg-brand-500 px-4 py-1.5 text-xs font-bold text-white">
            Most Popular
          </div>
          <div className="bg-gradient-to-br from-brand-500 to-orange-600 px-7 py-8 text-white">
            <div className="text-sm font-bold uppercase tracking-wide text-brand-50">PreSnag Partner Plan</div>
            <div className="mt-3 flex items-end gap-1">
              <span className="text-5xl font-black">₹600</span>
              <span className="mb-1.5 text-brand-50">/month</span>
            </div>
            <div className="mt-1 text-sm text-brand-50/90">Flat pricing • Zero per-order commission</div>
          </div>
          <div className="px-7 py-7">
            <ul className="space-y-3">
              {features.map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm text-slate-700">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" /> {f}
                </li>
              ))}
            </ul>
            <Link
              to="/vendor/register"
              className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-brand-500/25 transition hover:-translate-y-0.5 hover:bg-brand-600"
            >
              Become a Partner <ArrowRight className="h-4 w-4" />
            </Link>
            <p className="mt-3 text-center text-xs text-slate-400">
              <ShieldCheck className="mr-1 inline h-3.5 w-3.5 text-emerald-500" />
              Payments secured by Cashfree
            </p>
          </div>
        </div>
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/* 7. FAQ                                                              */
/* ------------------------------------------------------------------ */
function Faq() {
  const faqs = [
    { q: "How do I receive payments?", a: "Customers pay online at checkout. You choose PreSnag-Managed settlement (we settle to your bank daily) or Direct Settlement (payments land in your account instantly per order via Cashfree)." },
    { q: "How much does PreSnag charge?", a: "A flat ₹600/month — that's it. We take zero commission on your orders, so you keep 100% of every sale." },
    { q: "How long does onboarding take?", a: "Just a few minutes. Register, add your bank details, upload your menu, and once approved your store goes live." },
    { q: "Can I update my menu anytime?", a: "Yes. Add, edit, hide or remove items and prices anytime from your vendor dashboard — changes apply instantly." },
    { q: "Do customers need an app?", a: "No. Customers order directly from their browser via your store link or a QR code. Nothing to download." },
    { q: "Can I cancel anytime?", a: "Absolutely. There's no lock-in — you can cancel your plan whenever you like." },
  ];
  const [open, setOpen] = useState<number | null>(0);
  return (
    <Section id="faq" className="bg-slate-50">
      <div className="text-center">
        <Eyebrow>FAQ</Eyebrow>
        <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">Frequently asked questions</h2>
      </div>
      <div className="mx-auto mt-10 max-w-2xl space-y-3">
        {faqs.map((f, i) => {
          const isOpen = open === i;
          return (
            <div key={f.q} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
              >
                <span className="text-sm font-semibold text-slate-800">{f.q}</span>
                <ChevronDown className={cn("h-5 w-5 shrink-0 text-slate-400 transition-transform", isOpen && "rotate-180")} />
              </button>
              <div className={cn("grid transition-all duration-300", isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
                <div className="overflow-hidden">
                  <p className="px-5 pb-4 text-sm leading-relaxed text-slate-600">{f.a}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/* 8. FINAL CTA                                                        */
/* ------------------------------------------------------------------ */
function FinalCta() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-brand-500 via-orange-500 to-orange-600 px-5 py-16 md:py-20">
      <div className="pointer-events-none absolute -left-20 top-0 h-72 w-72 rounded-full bg-white/15 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-amber-300/20 blur-3xl" />
      <div className="relative mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-black tracking-tight text-white md:text-4xl">
          Ready to grow your business with PreSnag?
        </h2>
        <p className="mt-3 text-white/90">Join in minutes. Start accepting prepaid orders today.</p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            to="/vendor/register"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-7 py-3.5 text-sm font-bold text-brand-600 shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:shadow-xl sm:w-auto"
          >
            Become a Partner <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/vendor/login"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/40 bg-white/10 px-7 py-3.5 text-sm font-bold text-white backdrop-blur transition hover:bg-white/20 sm:w-auto"
          >
            <LogIn className="h-4 w-4" /> Vendor Login
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* shared bits                                                         */
/* ------------------------------------------------------------------ */
function Section({ children, className, id }: { children: React.ReactNode; className?: string; id?: string }) {
  return (
    <section id={id} className={cn("scroll-mt-20 px-5 py-14 md:px-10 md:py-20", className)}>
      <div className="mx-auto w-full max-w-[1400px]">{children}</div>
    </section>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <span className="text-xs font-bold uppercase tracking-wider text-brand-600">{children}</span>;
}
