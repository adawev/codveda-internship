import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-slate-50">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 md:grid-cols-2 lg:px-8">
        <div>
          <h4 className="text-lg font-semibold text-slate-900">Codveda Shop</h4>
          <p className="mt-2 text-sm text-slate-600">Smart products, fast shipping, reliable support.</p>
          <p className="mt-3 text-sm text-slate-600">Email: support@codveda.shop</p>
        </div>
        <div>
          <h5 className="text-sm font-semibold uppercase tracking-wide text-slate-700">Quick Links</h5>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            <li>
              <Link to="/" className="hover:text-slate-900">Home</Link>
            </li>
            <li>
              <Link to="/shop" className="hover:text-slate-900">Shop</Link>
            </li>
            <li>
              <Link to="/cart" className="hover:text-slate-900">Cart</Link>
            </li>
            <li>
              <Link to="/profile" className="hover:text-slate-900">Profile</Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
