import { ReactNode, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Zap,
  QrCode,
  Store,
  ShieldCheck,
  Mail,
  Clock,
  Smartphone,
  Search,
  Link2,
  ArrowUp,
  FileText,
  Lock,
  Scale,
  AlertTriangle,
  CreditCard,
  Ban,
  Building,
  RefreshCcw,
  UserCheck,
  Globe,
  Database,
  Eye,
  CheckCircle2,
  Share2,
  PackageCheck,
  Percent,
  Copyright
} from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { PublicFooter } from "@/components/PublicNav";

const SUPPORT_EMAIL = "support@presnag.com";
const UPDATED = "June 2026";

/* ------------------------------------------------------------------ */
/* Shared shell for About Page (Original Layout)                       */
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
        <div className="border border-slate-200/60 bg-white shadow-sm rounded-2xl overflow-hidden">
          <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-6 sm:px-8 sm:py-7">
            <p className="text-[10px] font-bold uppercase tracking-widest text-brand-600 sm:text-[11px]">{eyebrow}</p>
            <h1 className="mt-1.5 text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl md:text-3xl">
              {title}
            </h1>
            <p className="mt-2 text-xs text-slate-500 sm:text-sm md:text-base leading-relaxed max-w-2xl">{subtitle}</p>
          </div>
          <main className="px-6 py-6 sm:px-8 sm:py-8">{children}</main>
        </div>
      </div>

      <PublicFooter />
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mb-6 sm:mb-8 last:mb-0">
      <h2 className="mb-3 text-sm sm:text-base font-bold text-slate-900 tracking-tight">{title}</h2>
      <div className="space-y-3 text-xs leading-relaxed text-slate-600 sm:text-sm">{children}</div>
    </section>
  );
}

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

/* ------------------------------------------------------------------ */
/* Enterprise Legal Page Shell & Components                            */
/* ------------------------------------------------------------------ */
type SectionMeta = {
  id: string;
  title: string;
  icon: any;
};

function LegalLayout({
  eyebrow,
  title,
  subtitle,
  lastUpdated,
  sections,
  children,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  lastUpdated: string;
  sections: SectionMeta[];
  children: ReactNode;
}) {
  const [activeSection, setActiveSection] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Intersection observer to update active section
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-20% 0px -80% 0px" }
    );

    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [sections, searchQuery]);

  // Handle scroll to top visibility
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const filteredSections = sections.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <SiteHeader />

      {/* Hero Section */}
      <div className="bg-white border-b border-slate-200 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-brand-600 mb-4">{eyebrow}</p>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-6">{title}</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">{subtitle}</p>
          <p className="mt-8 text-sm font-medium text-slate-500">Last Updated: {lastUpdated}</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto w-full px-4 py-12 flex-1 flex flex-col lg:flex-row gap-12 relative">
        {/* Sidebar / TOC */}
        <aside className="w-full lg:w-72 shrink-0 print:hidden">
          <div className="sticky top-24 space-y-6">
            {/* Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Search sections..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all shadow-sm"
              />
            </div>

            {/* TOC Nav */}
            <nav className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm max-h-[calc(100vh-200px)] overflow-y-auto">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 px-2">Contents</h3>
              <ul className="space-y-1">
                {filteredSections.map((s) => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        activeSection === s.id
                          ? "bg-brand-50 text-brand-700"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                      onClick={(e) => {
                        e.preventDefault();
                        const el = document.getElementById(s.id);
                        if (el) {
                          const y = el.getBoundingClientRect().top + window.scrollY - 100;
                          window.scrollTo({ top: y, behavior: "smooth" });
                        }
                        setActiveSection(s.id);
                      }}
                    >
                      <s.icon className={`h-4 w-4 shrink-0 ${activeSection === s.id ? "text-brand-600" : "text-slate-400"}`} />
                      <span className="truncate">{s.title}</span>
                    </a>
                  </li>
                ))}
                {filteredSections.length === 0 && (
                  <p className="text-xs text-slate-500 italic px-2 py-2">No sections found.</p>
                )}
              </ul>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0 bg-white border border-slate-200 rounded-2xl p-8 md:p-12 shadow-sm">
          <div className="prose prose-slate prose-brand max-w-none prose-a:text-brand-600 hover:prose-a:text-brand-700">
            {children}
          </div>
        </main>
      </div>

      {/* Back to top button */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-8 right-8 p-3 bg-white border border-slate-200 rounded-full shadow-lg text-slate-600 hover:text-brand-600 hover:border-brand-300 transition-all z-50 print:hidden ${
          showScrollTop ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"
        }`}
        aria-label="Back to top"
      >
        <ArrowUp className="h-5 w-5" />
      </button>

      <PublicFooter />
    </div>
  );
}

function LegalSection({ id, title, icon: Icon, children }: { id: string; title: string; icon: any; children: ReactNode }) {
  const [copied, setCopied] = useState(false);

  const copyLink = () => {
    const url = `${window.location.origin}${window.location.pathname}#${id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id={id} className="scroll-mt-32 mb-16 last:mb-0 group">
      <div className="flex items-center gap-4 mb-6 border-b border-slate-100 pb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-500 border border-slate-200 shrink-0">
          <Icon className="h-5 w-5" />
        </div>
        <h2 className="text-lg md:text-2xl font-bold text-slate-900 m-0 tracking-tight flex-1">{title}</h2>
        <button
          onClick={copyLink}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg print:hidden focus:opacity-100"
          title="Copy section link"
        >
          {copied ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> : <Link2 className="h-5 w-5" />}
        </button>
      </div>
      <div className="text-slate-600 leading-relaxed space-y-4 text-[15px]">
        {children}
      </div>
    </section>
  );
}

/* ================================================================== */
/* TERMS & CONDITIONS                                                  */
/* ================================================================== */

const termsSections: SectionMeta[] = [
  { id: "introduction", title: "1. Introduction", icon: Globe },
  { id: "definitions", title: "2. Definitions", icon: FileText },
  { id: "eligibility", title: "3. Eligibility", icon: UserCheck },
  { id: "accounts", title: "4. User Accounts", icon: Smartphone },
  { id: "customer-responsibilities", title: "5. Customer Responsibilities", icon: CheckCircle2 },
  { id: "vendor-responsibilities", title: "6. Vendor Responsibilities", icon: Store },
  { id: "orders-payments", title: "7. Orders & Payments", icon: CreditCard },
  { id: "cancellations", title: "8. Cancellations & Refunds", icon: RefreshCcw },
  { id: "pickup", title: "9. Pickup & Fulfilment", icon: PackageCheck },
  { id: "platform-fees", title: "10. Platform Fees & Charges", icon: Percent },
  { id: "intellectual-property", title: "11. Intellectual Property", icon: Copyright },
  { id: "acceptable-use", title: "12. Acceptable Use", icon: Ban },
  { id: "suspension", title: "13. Suspension & Termination", icon: AlertTriangle },
  { id: "third-party", title: "14. Third-Party Services", icon: Link2 },
  { id: "disclaimer", title: "15. Disclaimer of Warranties", icon: ShieldCheck },
  { id: "limitation", title: "16. Limitation of Liability", icon: Scale },
  { id: "indemnification", title: "17. Indemnification", icon: ShieldCheck },
  { id: "governing-law", title: "18. Governing Law & Jurisdiction", icon: Building },
  { id: "changes", title: "19. Changes to Terms", icon: RefreshCcw },
  { id: "contact", title: "20. Contact Information", icon: Mail },
];

export function Terms() {
  return (
    <LegalLayout
      eyebrow="Legal Information"
      title="Terms & Conditions"
      subtitle="The ground rules for using PreSnag. By placing an order or registering as a vendor, you agree to these terms."
      lastUpdated={UPDATED}
      sections={termsSections}
    >
      <LegalSection id="introduction" title="1. Introduction" icon={Globe}>
        <p>
          Welcome to PreSnag. These Terms & Conditions govern your access to and use of the PreSnag platform, including our website, application programming interfaces (APIs), and any associated services. 
        </p>
        <p>
          PreSnag operates as a technology platform connecting customers with independent local food vendors ("Vendors"). We provide the infrastructure for ordering and payment, but we do not prepare, handle, or sell the food and beverages. By using our platform, you agree to these terms in full.
        </p>
      </LegalSection>

      <LegalSection id="definitions" title="2. Definitions" icon={FileText}>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>"Platform"</strong> refers to the PreSnag website (presnag.com) and underlying technology.</li>
          <li><strong>"Customer"</strong> refers to any individual placing an order through the Platform.</li>
          <li><strong>"Vendor"</strong> refers to independent businesses, such as cafés, tea stalls, and restaurants, that list their menu on the Platform.</li>
          <li><strong>"Order"</strong> refers to the request for food or beverages placed by a Customer to a Vendor via the Platform.</li>
        </ul>
      </LegalSection>

      <LegalSection id="eligibility" title="3. Eligibility" icon={UserCheck}>
        <p>
          To use the Platform, you must be at least 18 years old or possess legal parental or guardian consent. By placing an order or registering as a Vendor, you represent and warrant that you meet these eligibility requirements.
        </p>
      </LegalSection>

      <LegalSection id="accounts" title="4. User Accounts" icon={Smartphone}>
        <p>
          <strong>Customers:</strong> PreSnag is designed for a frictionless experience. Customers do not need to create a persistent account to place an order. Orders are tracked via browser sessions and unique order numbers.
        </p>
        <p>
          <strong>Vendors:</strong> Vendors must register for an account using a valid 10-digit mobile number and provide accurate business details, including banking information and FSSAI licensing. Vendors are responsible for maintaining the confidentiality of their login credentials.
        </p>
      </LegalSection>

      <LegalSection id="customer-responsibilities" title="5. Customer Responsibilities" icon={CheckCircle2}>
        <p>
          When placing an order, you agree to provide accurate contact information (name and phone number). You are responsible for reviewing your order details, including item quantities, prices, and the selected pickup time or order type (e.g., Take Away vs. Dine-In).
        </p>
      </LegalSection>

      <LegalSection id="vendor-responsibilities" title="6. Vendor Responsibilities" icon={Store}>
        <p>
          Vendors are solely responsible for:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Maintaining an accurate and up-to-date menu, including pricing and availability.</li>
          <li>Preparing and fulfilling orders safely, on time, and in compliance with all local health and safety regulations (including maintaining a valid FSSAI license).</li>
          <li>Managing order statuses accurately on the Vendor Dashboard so Customers receive real-time updates.</li>
        </ul>
        <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
          <strong>Important Notice:</strong> PreSnag reserves the right to suspend any Vendor account that repeatedly fails to fulfill orders or violates health and safety standards.
        </div>
      </LegalSection>

      <LegalSection id="orders-payments" title="7. Orders & Payments" icon={CreditCard}>
        <p>
          When a Customer places an order, they enter into a direct transaction with the Vendor. All payments are processed securely through our authorized payment gateways (e.g., Cashfree or Razorpay). 
        </p>
        <p>
          Customers pay exactly the listed price of the items—PreSnag does not add any hidden customer booking fees.
        </p>
      </LegalSection>

      <LegalSection id="cancellations" title="8. Cancellations & Refunds" icon={RefreshCcw}>
        <p>
          Because food and beverages are prepared fresh, orders typically cannot be cancelled once accepted by the Vendor. Refund policies are strictly determined by the individual Vendor. 
        </p>
        <p>
          If an order is not fulfilled by the Vendor or is found to be significantly defective, Customers must contact the Vendor directly or reach out to PreSnag support for dispute mediation.
        </p>
      </LegalSection>

      <LegalSection id="pickup" title="9. Pickup & Fulfilment" icon={PackageCheck}>
        <p>
          PreSnag is an "order-ahead" platform designed for pickup and dine-in. We do not provide delivery services. It is the Customer's responsibility to arrive at the Vendor's location promptly when the order status changes to "Ready".
        </p>
      </LegalSection>

      <LegalSection id="platform-fees" title="10. Platform Fees & Charges" icon={Percent}>
        <p>
          <strong>For Vendors:</strong> PreSnag charges a flat platform commission of <strong>5% per order</strong> — this is the only deduction from a Vendor's earnings. There are no monthly subscription fees, setup fees, payment-gateway charges, or hidden costs; payment-processing costs are absorbed by PreSnag.
        </p>
      </LegalSection>

      <LegalSection id="intellectual-property" title="11. Intellectual Property" icon={Copyright}>
        <p>
          All intellectual property rights in the Platform, including but not limited to software, design, logos, and trademarks, are owned by PreSnag. You may not copy, modify, distribute, or reverse-engineer any part of the Platform without our explicit written consent.
        </p>
      </LegalSection>

      <LegalSection id="acceptable-use" title="12. Acceptable Use" icon={Ban}>
        <p>
          You agree not to use the Platform to:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Place fraudulent or "prank" orders.</li>
          <li>Submit false or misleading information.</li>
          <li>Interfere with the security or performance of the Platform.</li>
          <li>Harass or abuse Vendors, Customers, or PreSnag staff.</li>
        </ul>
      </LegalSection>

      <LegalSection id="suspension" title="13. Suspension & Termination" icon={AlertTriangle}>
        <p>
          PreSnag reserves the right to suspend or terminate your access to the Platform at any time, with or without notice, if we reasonably believe you have breached these Terms or engaged in fraudulent activity.
        </p>
      </LegalSection>

      <LegalSection id="third-party" title="14. Third-Party Services" icon={Link2}>
        <p>
          The Platform integrates with third-party services, including payment processors (Cashfree, Razorpay) and cloud infrastructure providers. Your use of the Platform is also subject to the terms and privacy policies of these third parties.
        </p>
      </LegalSection>

      <LegalSection id="disclaimer" title="15. Disclaimer of Warranties" icon={ShieldCheck}>
        <p>
          The Platform is provided on an "AS IS" and "AS AVAILABLE" basis. PreSnag makes no warranties, express or implied, regarding the reliability, availability, or fitness for a particular purpose of the Platform. We do not guarantee the quality, safety, or legality of the food provided by Vendors.
        </p>
      </LegalSection>

      <LegalSection id="limitation" title="16. Limitation of Liability" icon={Scale}>
        <p>
          To the maximum extent permitted by law, PreSnag shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, arising out of your use of the Platform or your relationship with any Vendor or Customer. Our total liability shall not exceed the value of the specific order in question.
        </p>
      </LegalSection>

      <LegalSection id="indemnification" title="17. Indemnification" icon={ShieldCheck}>
        <p>
          You agree to indemnify and hold harmless PreSnag, its directors, employees, and affiliates, from any claims, damages, liabilities, and expenses arising out of your use of the Platform or your breach of these Terms.
        </p>
      </LegalSection>

      <LegalSection id="governing-law" title="18. Governing Law & Jurisdiction" icon={Building}>
        <p>
          These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising out of or in connection with these Terms shall be subject to the exclusive jurisdiction of the courts in India.
        </p>
      </LegalSection>

      <LegalSection id="changes" title="19. Changes to Terms" icon={RefreshCcw}>
        <p>
          We may update these Terms periodically to reflect changes in our business or legal requirements. We will notify you of any material changes by updating the "Last Updated" date at the top of this page. Continued use of the Platform constitutes your acceptance of the revised Terms.
        </p>
      </LegalSection>

      <LegalSection id="contact" title="20. Contact Information" icon={Mail}>
        <p>
          If you have any questions or concerns regarding these Terms, please contact us:
        </p>
        <div className="mt-4 flex items-center gap-3 p-4 bg-slate-50 border border-slate-200 rounded-lg">
          <Mail className="h-5 w-5 text-brand-600" />
          <a href={`mailto:${SUPPORT_EMAIL}`} className="text-brand-600 font-medium hover:underline">
            {SUPPORT_EMAIL}
          </a>
        </div>
      </LegalSection>
    </LegalLayout>
  );
}

/* ================================================================== */
/* PRIVACY POLICY                                                      */
/* ================================================================== */

const privacySections: SectionMeta[] = [
  { id: "introduction", title: "1. Introduction", icon: Globe },
  { id: "information-collect", title: "2. Information We Collect", icon: Database },
  { id: "how-we-use", title: "3. How We Use Information", icon: Zap },
  { id: "payment-info", title: "4. Payment Information", icon: CreditCard },
  { id: "vendor-info", title: "5. Vendor Information", icon: Store },
  { id: "cookies", title: "6. Cookies & Analytics", icon: Eye },
  { id: "data-sharing", title: "7. Data Sharing", icon: Share2 },
  { id: "data-security", title: "8. Data Security", icon: Lock },
  { id: "data-retention", title: "9. Data Retention", icon: Clock },
  { id: "user-rights", title: "10. User Rights", icon: UserCheck },
  { id: "childrens-privacy", title: "11. Children's Privacy", icon: AlertTriangle },
  { id: "third-party", title: "12. Third-Party Services", icon: Link2 },
  { id: "international", title: "13. International Transfers", icon: Globe },
  { id: "changes", title: "14. Changes to this Policy", icon: RefreshCcw },
  { id: "contact", title: "15. Contact Us", icon: Mail },
];

export function Privacy() {
  return (
    <LegalLayout
      eyebrow="Legal Information"
      title="Privacy Policy"
      subtitle="How PreSnag collects, uses, and protects your information to provide a seamless ordering experience."
      lastUpdated={UPDATED}
      sections={privacySections}
    >
      <LegalSection id="introduction" title="1. Introduction" icon={Globe}>
        <p>
          At PreSnag, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our order-ahead platform.
        </p>
      </LegalSection>

      <LegalSection id="information-collect" title="2. Information We Collect" icon={Database}>
        <p>
          <strong>From Customers:</strong> We collect the information you provide at checkout, which typically includes your Name and Phone Number. We also capture the details of the items you order, any specific instructions, and the selected Vendor.
        </p>
        <p>
          <strong>From Vendors:</strong> We collect business and personal details required for onboarding, including Business Name, Owner Name, Contact Information, FSSAI License, Address, and Banking/Settlement Details (like Account Number and PAN).
        </p>
        <p>
          <strong>Automated Information:</strong> We automatically collect technical data when you use the Platform, such as your IP address, browser type, device identifiers, and usage data to ensure the smooth operation of our services.
        </p>
      </LegalSection>

      <LegalSection id="how-we-use" title="3. How We Use Information" icon={Zap}>
        <p>We use the collected information for the following purposes:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>To process, fulfill, and track your orders in real-time.</li>
          <li>To share necessary order details with the Vendor preparing your food.</li>
          <li>To facilitate communication regarding your order status.</li>
          <li>To process Vendor settlements and payouts.</li>
          <li>To maintain, secure, and improve the Platform's functionality.</li>
        </ul>
      </LegalSection>

      <LegalSection id="payment-info" title="4. Payment Information" icon={CreditCard}>
        <p>
          All payment processing is handled by our trusted, industry-leading payment partners (such as Cashfree or Razorpay). PreSnag does not store or process your full credit card numbers, UPI PINs, or sensitive banking credentials on our servers. We only store transaction IDs and payment statuses for auditing and support purposes.
        </p>
      </LegalSection>

      <LegalSection id="vendor-info" title="5. Vendor Information" icon={Store}>
        <p>
          If you are a Vendor, the banking details and KYC documents (such as PAN and FSSAI) you provide are used strictly for legal compliance and to facilitate your daily payouts. This information is securely transmitted to our payment gateway partners for settlement processing.
        </p>
      </LegalSection>

      <LegalSection id="cookies" title="6. Cookies & Analytics" icon={Eye}>
        <p>
          We use cookies and similar tracking technologies to enhance your experience, remember your cart across browser sessions, and analyze site traffic. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent, but some features of the Platform may not function properly without them.
        </p>
      </LegalSection>

      <LegalSection id="data-sharing" title="7. Data Sharing" icon={Share2}>
        <p>
          We do not sell your personal information. We only share data in the following scenarios:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>With Vendors:</strong> We share your Name, Phone Number, and Order Details with the Vendor you are ordering from.</li>
          <li><strong>With Service Providers:</strong> We share data with third-party providers who assist us with hosting, payments, and analytics.</li>
          <li><strong>For Legal Reasons:</strong> We may disclose information if required to do so by law or in response to valid requests by public authorities.</li>
        </ul>
      </LegalSection>

      <LegalSection id="data-security" title="8. Data Security" icon={Lock}>
        <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 mb-4">
          <ShieldCheck className="h-6 w-6 shrink-0 text-emerald-600" />
          <p className="text-sm text-emerald-900 leading-relaxed m-0">
            We implement reasonable technical and organizational security measures—including encryption and secure socket layers (SSL)—to protect your personal information. However, no electronic transmission over the Internet is entirely secure, and we cannot guarantee absolute security.
          </p>
        </div>
      </LegalSection>

      <LegalSection id="data-retention" title="9. Data Retention" icon={Clock}>
        <p>
          We retain your personal information only for as long as is necessary for the purposes set out in this Privacy Policy. We will retain and use your information to the extent necessary to comply with our legal obligations (for example, tax and accounting regulations), resolve disputes, and enforce our legal agreements.
        </p>
      </LegalSection>

      <LegalSection id="user-rights" title="10. User Rights" icon={UserCheck}>
        <p>
          Depending on your location, you may have the right to request access to, correction of, or deletion of your personal data. If you wish to exercise any of these rights, please contact our support team.
        </p>
      </LegalSection>

      <LegalSection id="childrens-privacy" title="11. Children's Privacy" icon={AlertTriangle}>
        <p>
          Our Platform is not intended for use by children under the age of 13. We do not knowingly collect personally identifiable information from children. If we become aware that we have collected such data without verified parental consent, we will take steps to remove that information from our servers.
        </p>
      </LegalSection>

      <LegalSection id="third-party" title="12. Third-Party Services" icon={Link2}>
        <p>
          Our Platform may contain links to third-party websites or services that are not operated by us. If you click on a third-party link, you will be directed to that third party's site. We strongly advise you to review the Privacy Policy of every site you visit.
        </p>
      </LegalSection>

      <LegalSection id="international" title="13. International Transfers" icon={Globe}>
        <p>
          PreSnag primarily operates in India. Your information, including Personal Data, is processed and stored on servers located within our operational regions or globally via our cloud infrastructure providers (like AWS or Render). By using the Platform, you consent to this transfer.
        </p>
      </LegalSection>

      <LegalSection id="changes" title="14. Changes to this Policy" icon={RefreshCcw}>
        <p>
          We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. You are advised to review this Privacy Policy periodically for any changes.
        </p>
      </LegalSection>

      <LegalSection id="contact" title="15. Contact Us" icon={Mail}>
        <p>
          If you have any questions about this Privacy Policy, please contact us:
        </p>
        <div className="mt-4 flex items-center gap-3 p-4 bg-slate-50 border border-slate-200 rounded-lg">
          <Mail className="h-5 w-5 text-brand-600" />
          <a href={`mailto:${SUPPORT_EMAIL}`} className="text-brand-600 font-medium hover:underline">
            {SUPPORT_EMAIL}
          </a>
        </div>
      </LegalSection>
    </LegalLayout>
  );
}
