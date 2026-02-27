import React from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

const AppLayout = () => {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <Header />
      <main className="mx-auto w-full max-w-7xl px-4 py-8 lg:px-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default AppLayout;
