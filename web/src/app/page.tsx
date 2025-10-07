import React from 'react';
const Hero = () => {
  return (
    <section className="flex min-h-screen w-full flex-col items-center justify-center bg-clarity-gradient text-white">
      <span className="text-xs font-semibold uppercase tracking-[0.45em] text-white/70">Clarity</span>
      <p className="text-4xl font-semibold uppercase tracking-[0.3em] sm:text-5xl md:text-6xl">
        comming soon
      </p>
    </section>
  );
};

const DraftLanding = () => {
  return (
    <main className="min-h-screen bg-clarity-crimson text-white">
      <Hero />
    </main>
  );
};

export default DraftLanding;

