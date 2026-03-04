import React from "react";
import { Link } from "react-router-dom";

const highlights = [
  {
    title: "Performance-first catalog",
    text: "Every listing is curated for PC users who care about thermals, speed, and reliability.",
  },
  {
    title: "Clear product context",
    text: "We design product pages so buyers can compare specs quickly and make confident decisions.",
  },
  {
    title: "Secure checkout flow",
    text: "Authentication, cart, and order updates are built to keep the purchase journey frictionless.",
  },
];

const stats = [
  { value: "12k+", label: "PC shoppers served" },
  { value: "97%", label: "On-time delivery" },
  { value: "4.9/5", label: "Average rating" },
  { value: "24/7", label: "Support response" },
];

const About = () => {
  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl border border-cyan-200 bg-white p-6 shadow-sm md:p-10">
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-cyan-200/60 blur-3xl" />
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-cyan-700">About us</p>
        <h1 className="mt-2 max-w-3xl text-3xl font-black text-slate-900 md:text-5xl">
          Built for modern PC commerce with UI/UX that converts
        </h1>
        <p className="mt-4 max-w-2xl text-sm text-slate-600 md:text-base">
          Codveda Shop is a demo e-commerce platform focused on clear information architecture,
          responsive layouts, and fast purchase flows from discovery to checkout.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => (
          <article key={item.label} className="rounded-xl border border-slate-200 bg-white p-5 text-center shadow-sm">
            <p className="text-3xl font-black text-slate-900">{item.value}</p>
            <p className="text-sm text-slate-600">{item.label}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {highlights.map((item) => (
          <article key={item.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
            <h2 className="text-xl font-black text-slate-900">{item.title}</h2>
            <p className="mt-2 text-sm text-slate-600">{item.text}</p>
          </article>
        ))}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-cyan-700">How we design</p>
        <div className="mt-4 grid gap-5 md:grid-cols-3">
          <article>
            <h3 className="text-lg font-black text-slate-900">1. Discover</h3>
            <p className="text-sm text-slate-600">Map user shopping intent and create clean category pathways.</p>
          </article>
          <article>
            <h3 className="text-lg font-black text-slate-900">2. Optimize</h3>
            <p className="text-sm text-slate-600">Reduce friction in product cards, cart interactions, and checkout states.</p>
          </article>
          <article>
            <h3 className="text-lg font-black text-slate-900">3. Retain</h3>
            <p className="text-sm text-slate-600">Use trustworthy UI patterns to improve repeat purchases and loyalty.</p>
          </article>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-slate-900 p-6 text-white md:p-8">
        <h2 className="text-2xl font-black">Ready to upgrade your setup?</h2>
        <p className="mt-2 text-sm text-slate-300">Explore hardware collections and curated bundles built for your workflow.</p>
        <div className="mt-4 flex gap-3">
          <Link to="/shop" className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-cyan-100">
            Explore shop
          </Link>
          <Link to="/" className="rounded-md border border-slate-400 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
            Back to home
          </Link>
        </div>
      </section>
    </div>
  );
};

export default About;
