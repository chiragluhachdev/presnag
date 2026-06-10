import { ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  Zap,
  QrCode,
  Store,
  ShieldCheck,
  Mail,
  Clock,
  Smartphone,
} from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { PublicFooter } from "@/components/PublicNav";

const SUPPORT_EMAIL = "support@presnag.com";

/* ------------------------------------------------------------------ */
/* Shared shell                                                        */
/* ------------------------------------------------------------------ */
function PageShell({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <SiteHeader />

      <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 md:py-12">
        {/* Container card */}
        <div className="border border-slate-200/60 bg-white shadow-sm rounded-2xl overflow-hidden">
          {/* Hero band */}
          <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-6 sm:px-8 sm:py-7">
            <p className="text-[10px] font-bold uppercase tracking-widest text-brand-600 sm:text-[11px]">{eyebrow}</p>
            <h1 className="mt-1.5 text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl md:text-3xl">
              {title}
            </h1>
            <p className="mt-2 text-xs text-slate-500 sm:text-sm md:text-base leading-relaxed max-w-2xl">{subtitle}</p>
          </div>

          {/* Scrollable content */}
          <main className="px-6 py-6 sm:px-8 sm:py-8">{children}</main>
        </div>
      </div>

      <PublicFooter />
    </div>
  );
}

/* Reusable legal section */
function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mb-6 sm:mb-8 last:mb-0">
      <h2 className="mb-3 text-sm sm:text-base font-bold text-slate-900 tracking-tight">{title}</h2>
      <div className="space-y-3 text-xs leading-relaxed text-slate-600 sm:text-sm">{children}</div>
    </section>
  );
}

const UPDATED = "Last updated: June 2026";

/* ================================================================== */
/* ABOUT                                                               */
/* ================================================================== */
export function About() {
  const features = [
    {
      icon: Zap,
      title: "Order ahead, instantly",
      body: "Browse local stalls and cafés, place your order in seconds, and skip the line entirely.",
    },
    {
      icon: QrCode,
      title: "No app required",
      body: "Scan a QR code or open a link in your browser. There's nothing to download or install.",
    },
    {
      icon: Clock,
      title: "Live order tracking",
      body: "Watch your order move from received to ready in real time, so you arrive right on time.",
    },
    {
      icon: Store,
      title: "Built for local vendors",
      body: "Tea stalls, cafés, bakeries and food courts get a simple dashboard to manage every order.",
    },
  ];

  return (
    <PageShell
      eyebrow="About PreSnag"
      title="Order Ahead. Skip The Queue."
      subtitle="PreSnag helps you order from your favourite local food spots without standing in line — no app, no fuss, just scan and go."
    >
      <Section title="Our mission">
        <p>
          Queues waste everyone's time — yours and the vendor's. PreSnag was built to give small,
          local food businesses the same ordering convenience the big chains have, while letting
          customers grab a freshly-made bite without the wait.
        </p>
        <p>
          We keep things lightweight on purpose: customers order straight from the browser, and
          vendors manage everything from a single, easy dashboard.
        </p>
        <p>
          For vendors, our pricing is simple and fair — there are <span className="font-semibold text-slate-800">no
          monthly fees and no setup costs</span>. PreSnag charges a flat <span className="font-semibold text-slate-800">5%
          per order</span>, so you only ever pay when you actually make a sale.
        </p>
      </Section>

      <div className="mb-6 grid gap-4 sm:mb-8 sm:grid-cols-2">
        {features.map((f) => (
          <div
            key={f.title}
            className="rounded-xl border border-slate-200/60 bg-white p-4 shadow-sm transition hover:border-brand-300 hover:shadow-md/5"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
              <f.icon className="h-4.5 w-4.5" />
            </div>
            <h3 className="mt-3 text-sm font-bold text-slate-900">{f.title}</h3>
            <p className="mt-1 text-xs text-slate-500 leading-relaxed">{f.body}</p>
          </div>
        ))}
      </div>

      <Section title="How it works">
        <ol className="list-decimal space-y-2 pl-5">
          <li>Scan a vendor's QR code or browse shops on PreSnag.</li>
          <li>Add items to your cart and place the order — pay online or on pickup.</li>
          <li>Track your order live and collect it when it's ready. No queue.</li>
        </ol>
      </Section>

      <div className="rounded-2xl border border-slate-200/60 bg-slate-50/50 p-6 text-center shadow-sm mb-6 flex flex-col items-center">
        <Smartphone className="h-8 w-8 text-brand-500" strokeWidth={1.5} />
        <h3 className="mt-2.5 text-base font-bold text-slate-900">Hungry? Skip the line.</h3>
        <p className="mt-1 text-xs text-slate-500 max-w-sm">Discover local vendors near you and place your order ahead in seconds.</p>
        <Link
          to="/shops"
          className="mt-4 inline-flex items-center justify-center rounded-xl bg-brand-500 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand-500/10 transition hover:bg-brand-600 hover:shadow-brand-500/20 active:scale-[0.98]"
        >
          Browse Shops
        </Link>
      </div>

      <ContactCard />
    </PageShell>
  );
}

/* Shared contact prompt used on legal pages */
function ContactCard() {
  return (
    <div className="mt-8 flex flex-col items-start gap-4 rounded-xl border border-slate-200/60 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600 shrink-0">
          <Mail className="h-4.5 w-4.5" />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-900">Questions? We're here to help.</p>
          <p className="text-xs text-slate-500">Reach our support team anytime.</p>
        </div>
      </div>
      <a
        href={`mailto:${SUPPORT_EMAIL}`}
        className="inline-flex w-full shrink-0 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-brand-300 hover:text-brand-600 sm:w-auto"
      >
        <Mail className="h-4 w-4 shrink-0" />
        <span className="truncate">{SUPPORT_EMAIL}</span>
      </a>
    </div>
  );
}

/* ================================================================== */
/* TERMS                                                               */
/* ================================================================== */
export function Terms() {
  return (
    <PageShell
      eyebrow="Legal"
      title="Terms of Service"
      subtitle="The ground rules for using PreSnag. By placing an order you agree to these terms."
    >
      <p className="mb-5 text-xs font-semibold text-slate-400">{UPDATED}</p>

      <Section title="1. Overview">
        <p>
          PreSnag is an order-ahead platform that connects customers with local food vendors. We
          provide the technology that lets you browse menus, place orders and track them — the food
          itself is prepared and sold by independent vendors.
        </p>
      </Section>

      <Section title="2. Placing orders">
        <p>
          When you place an order, you enter into a transaction directly with the vendor. Prices,
          availability and preparation times are set by the vendor and may change. Please review your
          order before confirming — order details such as items and quantities are your responsibility.
        </p>
      </Section>

      <Section title="3. Payments & fees">
        <p>
          Customers pay exactly the price of the items ordered — PreSnag does not add any booking
          fees or surcharges to your bill. Payments are processed securely online (with cash on
          pickup where a vendor offers it), and any applicable taxes are shown at checkout before you
          confirm.
        </p>
        <p>
          PreSnag's platform fee is charged to vendors, not customers. We have moved away from a
          monthly subscription: vendors now pay a flat <span className="font-semibold text-slate-800">5%
          fee per order</span>, with no monthly charge and no setup cost. The fee is deducted from the
          vendor's settlement for each completed order.
        </p>
      </Section>

      <Section title="4. Cancellations & refunds">
        <p>
          Because food is prepared fresh, cancellation and refund policies are determined by each
          vendor. If something goes wrong with an order, contact the vendor or our support team and
          we'll help resolve it.
        </p>
      </Section>

      <Section title="5. Acceptable use">
        <p>
          You agree not to misuse the platform, place fraudulent orders, or interfere with its
          operation. We may suspend access where we reasonably suspect abuse.
        </p>
      </Section>

      <Section title="6. Limitation of liability">
        <p>
          PreSnag provides the platform \"as is\". We are not responsible for the quality, safety or
          legality of items sold by vendors. To the extent permitted by law, our liability is limited
          to the value of the affected order.
        </p>
      </Section>

      <Section title="7. Changes to these terms">
        <p>
          We may update these terms from time to time. Continued use of PreSnag after changes take
          effect means you accept the revised terms.
        </p>
      </Section>

      <ContactCard />
    </PageShell>
  );
}

/* ================================================================== */
/* PRIVACY                                                             */
/* ================================================================== */
export function Privacy() {
  return (
    <PageShell
      eyebrow="Legal"
      title="Privacy Policy"
      subtitle="How PreSnag collects, uses and protects your information."
    >
      <p className="mb-5 text-xs font-semibold text-slate-400">{UPDATED}</p>

      <Section title="1. Information we collect">
        <p>
          To process an order we collect the details you provide — typically your name and phone
          number — along with the items you order and any notes for the vendor. We also collect basic
          technical data such as device and browser information to keep the service running.
        </p>
      </Section>

      <Section title="2. How we use your information">
        <p>We use your information to:</p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>Process, fulfil and track your orders.</li>
          <li>Share order details with the vendor preparing your food.</li>
          <li>Send order-status updates and notifications.</li>
          <li>Improve and secure the platform.</li>
        </ul>
      </Section>

      <Section title="3. Sharing your information">
        <p>
          We share your order details with the relevant vendor so they can prepare and hand over your
          order. We do not sell your personal information. We may share data with service providers who
          help us operate the platform, under appropriate confidentiality obligations.
        </p>
      </Section>

      <Section title="4. Data retention">
        <p>
          We keep order information for as long as needed to provide the service and meet legal,
          accounting or reporting requirements, after which it is deleted or anonymised.
        </p>
      </Section>

      <Section title="5. Your choices">
        <p>
          You can request access to or deletion of your personal information by contacting our support
          team. We'll respond in line with applicable law.
        </p>
      </Section>

      <Section title="6. Security">
        <div className="flex items-start gap-3 rounded-xl border border-slate-200/60 bg-emerald-50/30 p-4">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
            We use reasonable technical and organisational measures to protect your information. No
            system is perfectly secure, but we work to keep your data safe.
          </p>
        </div>
      </Section>

      <Section title="7. Contact">
        <p>
          For any privacy questions or requests, email us at{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`} className="font-semibold text-brand-600 hover:underline">
            {SUPPORT_EMAIL}
          </a>
          .
        </p>
      </Section>

      <ContactCard />
    </PageShell>
  );
}
