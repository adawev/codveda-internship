import React from "react";

const About = () => {
  return (
    <div className="mx-auto max-w-3xl space-y-4 rounded-xl border border-slate-200 bg-white p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.15em] text-cyan-700">About us</p>
      <h1 className="text-3xl font-black text-slate-900">Built for fast modern commerce</h1>
      <p className="text-sm text-slate-600">
        Codveda Shop is a demo e-commerce platform focused on clean UX, secure authentication,
        and responsive shopping experiences across mobile, tablet, and desktop.
      </p>
      <p className="text-sm text-slate-600">
        This storefront demonstrates reusable UI components, robust API integrations, and
        accessible interactions from product discovery to checkout.
      </p>
    </div>
  );
};

export default About;
