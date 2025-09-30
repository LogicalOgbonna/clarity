import Image from 'next/image';
import Link from 'next/link';

const heroMilestones = [
  {
    icon: '🛡️',
    title: 'Phasellus Vitae',
    description: 'Ornare vulputate massa viverra elit sit amet.',
  },
  {
    icon: '⚡',
    title: 'Iaculis Magna',
    description: 'Risus etiam venenatis lorem ipsum sit feugiat.',
  },
  {
    icon: '📑',
    title: 'Eifend Pulvinar',
    description: 'Vitae consequat nisl sit amet commodo nulla.',
  },
];

const faqItems = [
  'Pellentesque tempus sed phasellus vel.',
  'Mauris fermentum praesent tellus euismod pellentesque urna ac massa in.',
  'Vulputate et vulputate suspendisse natoque id tellus consectetur pulvinar et.',
  'Sollicitudin ornare tempus felis nulla varius pulvinar nibh viverra ornare.',
  'Consectetur nibh velit magna consectetur leo.',
  'Quisque porttitor vitae vel amet neque scelerisque mattis.',
];

const insightChips = [
  'AI reviews of your legal documents',
  'Multichannel extension + web experience',
  'Sleek interactive summaries',
  'Saved transcripts & audit trails',
  'Proactive risk alerts',
  'Integrates with industry workflows',
];

const heroChips = [
  'Cross-browser support',
  'Instant concept explanations',
  'Tailor-made workflows',
  'AI-guided triage',
  'Automated redlines',
  'Team-ready reporting',
];

const callToAction = {
  label: 'Lorem Ipsum',
  href: '#',
};

const DecorativeStroke = () => {
  return (
    <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-r from-transparent via-clarity-cream/60 to-transparent" />
  );
};

const SectionHeading = ({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) => {
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium uppercase tracking-[0.35em] text-clarity-crimson">
        {eyebrow}
      </p>
      <h2 className="text-4xl font-semibold leading-tight text-clarity-ink md:text-[2.75rem]">
        {title}
      </h2>
      {description ? (
        <p className="max-w-2xl text-lg text-clarity-stone/80">{description}</p>
      ) : null}
    </div>
  );
};

const PrimaryButton = ({label, href}: {label: string; href: string}) => {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-3 rounded-full bg-clarity-crimson px-8 py-3 text-sm font-semibold text-white shadow-clarity-card transition hover:bg-clarity-crimson-dark"
    >
      <span>{label}</span>
      <span aria-hidden className="text-lg">
        →
      </span>
    </Link>
  );
};

const OutlineButton = ({label, href}: {label: string; href: string}) => {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-3 rounded-full border border-clarity-crimson px-8 py-3 text-sm font-semibold text-clarity-crimson transition hover:bg-clarity-crimson hover:text-white"
    >
      <span>{label}</span>
      <span aria-hidden className="text-lg">
        →
      </span>
    </Link>
  );
};

const Hero = () => {
  return (
    <section className="relative overflow-hidden rounded-b-[5rem] bg-clarity-sunrise pb-24 pt-28">
      <DecorativeStroke />
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 lg:flex-row lg:items-center lg:px-10 xl:px-16">
        <div className="flex-1 space-y-8">
          <span className="inline-flex max-w-max items-center gap-2 rounded-full bg-white/80 px-5 py-2 text-xs font-semibold uppercase tracking-[0.4em] text-clarity-crimson shadow-clarity-soft">
            Clarity
          </span>
          <SectionHeading
            eyebrow="RISUS PRAESENT VOLUTPATE"
            title="Cursus Integer Consequat Tristique."
            description="Understand legal terms in seconds with AI-powered clarity. Save time, reduce risk, and make confident decisions."
          />
          <div className="flex flex-wrap gap-2">
            {heroChips.map((chip) => (
              <span
                key={chip}
                className="inline-flex items-center rounded-full bg-white px-4 py-2 text-xs font-medium text-clarity-stone shadow-sm shadow-clarity-soft/40"
              >
                {chip}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-5">
            <PrimaryButton {...callToAction} />
            <OutlineButton label="Explore Platform" href="#" />
          </div>
        </div>
        <div className="relative flex flex-1 justify-center">
          <div className="relative max-w-xl rounded-[3.5rem] bg-white p-10 shadow-clarity-soft">
            <Image
              src="/illustrations/hero-illustration.svg"
              alt="Illustration of a calm analyst using Clarity"
              width={520}
              height={480}
              className="h-auto w-full"
              priority
            />
            <div className="absolute -bottom-12 left-1/2 flex w-[90%] -translate-x-1/2 flex-wrap gap-4 rounded-3xl bg-white px-6 py-4 shadow-xl shadow-clarity-soft/70">
              {heroMilestones.map((milestone) => (
                <div key={milestone.title} className="flex flex-1 min-w-[140px] items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-clarity-cream text-xl">
                    {milestone.icon}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-clarity-ink">
                      {milestone.title}
                    </p>
                    <p className="text-xs text-clarity-stone/70">
                      {milestone.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const InsightCard = ({
  index,
  title,
  description,
}: {
  index: number;
  title: string;
  description: string;
}) => {
  return (
    <div className="flex flex-col gap-3 rounded-3xl bg-white p-6 shadow-clarity-soft">
      <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-clarity-cream text-lg font-semibold text-clarity-crimson">
        {index}
      </div>
      <h3 className="text-xl font-semibold text-clarity-ink">{title}</h3>
      <p className="text-sm leading-relaxed text-clarity-stone/80">{description}</p>
    </div>
  );
};

const Testimonial = () => {
  return (
    <section className="relative overflow-hidden rounded-[5rem] bg-clarity-ink py-24 text-white">
      <div className="pointer-events-none absolute inset-0 opacity-30">
        <Image src="/textures/noise.svg" alt="Noise texture" fill className="object-cover" />
      </div>
      <div className="relative mx-auto flex w-full max-w-5xl flex-col gap-12 px-6 text-left md:px-10">
        <SectionHeading
          eyebrow="HEAR FROM OUR USERS"
          title="What our customers thought?"
          description="Euismod magna id purus eget nunc ligula suspendisse dui netus. Condimentum blandit rutrum at mauris enim pulvinar duis etiam duis."
        />
        <div className="grid gap-10 md:grid-cols-[1.25fr_1fr] md:items-center">
          <div className="space-y-8">
            <blockquote className="text-2xl font-semibold leading-[1.6]">
              “Clarity instantly turns incomprehensible policy jargon into actionable notes. The team now ships reviews 3x faster without missing a single risk.”
            </blockquote>
            <div>
              <p className="text-lg font-semibold">Holly Davison</p>
              <p className="text-sm uppercase tracking-[0.3em] text-clarity-cream">
                Legal Ops, Horizon Ventures
              </p>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center gap-6">
            <div className="relative h-[220px] w-[220px] overflow-hidden rounded-full border-4 border-white/20">
              <Image src="/illustrations/dashboard-illustration.svg" alt="Illustrative portrait of a happy Clarity customer" fill className="object-cover" />
            </div>
            <div className="flex gap-3 text-2xl">
              <span>★</span>
              <span>★</span>
              <span>★</span>
              <span>★</span>
              <span>☆</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const FAQ = () => {
  return (
    <section className="relative overflow-hidden bg-white py-24">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-12 px-6 md:px-10">
        <SectionHeading
          eyebrow="SUPPORT"
          title="Phasellus a vitae iaculis magna."
          description="Phasellus a vitae iaculis magna eleifend pulvinar velit odio."
        />
        <div className="grid gap-4">
          {faqItems.map((item, index) => (
            <details
              key={item}
              className="group rounded-[2.5rem] border border-clarity-cloud bg-clarity-cream/70 px-8 py-5 text-clarity-ink transition"
            >
              <summary className="flex cursor-pointer items-center justify-between text-lg font-semibold">
                {item}
                <span className="text-xl transition group-open:rotate-45">+</span>
              </summary>
              <div className="mt-3 text-sm text-clarity-stone/80">
                Nunc vitae a urna gravida blandit. Curabitur at quam commodo velit tincidunt aliquet vitae sed ligula. Fusce bibendum quis lectus vel ultricies.
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
};

const CTASection = () => {
  return (
    <section className="relative overflow-hidden rounded-t-[5rem] bg-clarity-sunrise py-24">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-10 text-center">
        <SectionHeading
          eyebrow="READY TO BEGIN"
          title="Vulputate et pulvinar ethre Suspendisse tellus consectetur"
        />
        <PrimaryButton {...callToAction} />
        <p className="text-xs uppercase tracking-[0.3em] text-clarity-stone/50">
          Copyright © {new Date().getFullYear()} Clarity.
        </p>
      </div>
    </section>
  );
};

const FeatureMashup = () => {
  return (
    <section className="relative bg-white py-24">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 lg:flex-row lg:items-center lg:px-10">
        <div className="flex-1 space-y-8">
          <SectionHeading
            eyebrow="CLARITY PLATFORM"
            title="Phasellus a vitae iaculis magna eleifend pulvinar velit odio."
            description="Curabitur volutpat tellus sed urna varius, in efficitur ipsum viverra. Nullam commodo feugiat purus vel egestas."
          />
          <OutlineButton label="Lorem Ipsum" href="#" />
        </div>
        <div className="flex flex-1 flex-col gap-8">
          <div className="grid gap-3 rounded-[3rem] bg-clarity-ink/90 p-10 text-white">
            <p className="text-lg font-semibold">Cursus Integer conseq Aliquam Tristique.</p>
            <p className="text-sm text-white/75">
              Risus praesent vitae ornare proin sed condimentum varius. Cursus integer consequat amet consequat sed gravida consectetur latin.
            </p>
            <OutlineButton label="Lorem Ipsum" href="#" />
          </div>
          <div className="grid gap-4 rounded-[3rem] bg-white p-10 shadow-clarity-soft">
            <div className="grid gap-4 sm:grid-cols-2">
              <InsightCard
                index={1}
                title="Phasellus Vitae"
                description="Ornare vulputate massa viverra elit sit amet."
              />
              <InsightCard
                index={2}
                title="Iaculis Magna"
                description="Risus etiam venenatis lorem ipsum sit feugiat."
              />
              <InsightCard
                index={3}
                title="Eifend Pulvinar"
                description="Vitae consequat nisl sit amet commodo nulla."
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const InsightStrip = () => {
  return (
    <section className="bg-clarity-ink py-20 text-white">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-6 md:px-10">
        <SectionHeading
          eyebrow="CLARITY INSIGHTS"
          title="Cursus Integer consequat Tristique."
          description="Phasellus a vitae iaculis magna eleifend pulvinar velit odio."
        />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {insightChips.map((chip) => (
            <div
              key={chip}
              className="flex items-center justify-between rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-medium"
            >
              <span>{chip}</span>
              <span>↗</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const HeroNavigation = () => {
  return (
    <header className="absolute inset-x-0 top-0 z-20 flex justify-center pt-8">
      <nav className="flex w-full max-w-5xl items-center justify-between rounded-full bg-white/90 px-8 py-4 shadow-clarity-soft backdrop-blur">
        <Link href="#" className="flex items-center gap-3 text-lg font-semibold text-clarity-ink">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-clarity-crimson text-white">C</span>
          <span>Clarity</span>
        </Link>
        <div className="flex items-center gap-4 text-sm font-medium text-clarity-stone/80">
          <button className="rounded-full px-4 py-2 hover:bg-clarity-cream">Home</button>
          <button className="rounded-full px-4 py-2 hover:bg-clarity-cream">Platform</button>
          <button className="rounded-full px-4 py-2 hover:bg-clarity-cream">Pricing</button>
          <button className="rounded-full px-4 py-2 hover:bg-clarity-cream">Support</button>
        </div>
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Link href="#" className="rounded-full border border-clarity-cloud px-4 py-2 text-clarity-stone/80">
            Sign in
          </Link>
          <PrimaryButton label="Get Clarity" href="#" />
        </div>
      </nav>
    </header>
  );
};

const DecorativeWave = () => {
  return (
    <div className="absolute inset-x-0 -bottom-32 h-32 bg-clarity-ink" />
  );
};

const DraftLanding = () => {
  return (
    <main className="relative min-h-screen bg-clarity-cream pb-24">
      <HeroNavigation />
      <Hero />
      <FeatureMashup />
      <InsightStrip />
      <Testimonial />
      <FAQ />
      <CTASection />
      <DecorativeWave />
    </main>
  );
};

export default DraftLanding;

