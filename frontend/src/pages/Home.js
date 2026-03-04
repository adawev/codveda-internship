import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import ProductCard from "../components/product/ProductCard";
import { useAuth } from "../AuthContext";
import { useCart } from "../CartContext";
import { useToast } from "../components/ui/use-toast";

const banners = [
  {
    title: "Build your dream battlestation",
    description: "Gaming rigs, creator gear, and accessories tuned for performance.",
    accent: "RTX Series from $499",
  },
  {
    title: "High refresh. Zero compromise.",
    description: "From 240Hz monitors to mechanical keyboards, upgrade every interaction.",
    accent: "Free shipping over $199",
  },
  {
    title: "Trusted hardware, curated bundles",
    description: "Shop complete setups with secure checkout and real-time order updates.",
    accent: "Bundle savings up to 20%",
  },
];

const Home = () => {
  const { isAuthenticated } = useAuth();
  const { refreshCart } = useCart();
  const { toast } = useToast();

  const [bannerIndex, setBannerIndex] = useState(0);
  const [products, setProducts] = useState([]);
  const [quantities, setQuantities] = useState({});

  useEffect(() => {
    const timer = setInterval(() => {
      setBannerIndex((index) => (index + 1) % banners.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get("/api/products?page=0&size=8&sort=createdAt,desc");
        setProducts(response.data.content ?? []);
      } catch (error) {
        // Handled by global API interceptor toast.
      }
    };

    fetchProducts();
  }, []);

  const featured = useMemo(() => products.slice(0, 4), [products]);
  const bestSellers = useMemo(() => products.slice(4, 8), [products]);
  const hero = banners[bannerIndex];

  const onQuantityChange = (productId, value) => {
    const quantity = Number(value);
    setQuantities((prev) => ({
      ...prev,
      [productId]: Number.isNaN(quantity) ? 1 : Math.max(1, quantity),
    }));
  };

  const onQuantityAdjust = (productId, delta, maxStock) => {
    const current = quantities[productId] ?? 1;
    const next = Math.max(1, current + delta);
    const bounded = Math.min(next, Math.max(1, Number(maxStock) || 1));
    setQuantities((prev) => ({
      ...prev,
      [productId]: bounded,
    }));
  };

  const onAddToCart = async (productId) => {
    const quantity = quantities[productId] ?? 1;
    try {
      await api.post("/api/cart/items", { productId, quantity });
      await refreshCart();
      toast({ title: "Added", description: "Item added to your cart.", variant: "success" });
    } catch (error) {
      // Handled by global API interceptor toast.
    }
  };

  return (
    <div className="space-y-12">
      <section className="relative overflow-hidden rounded-3xl border border-cyan-300/30 bg-slate-950 p-8 text-white shadow-2xl shadow-cyan-900/20 md:p-12">
        <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-cyan-400/20 blur-3xl animate-float-slow" />
        <div className="pointer-events-none absolute -bottom-24 left-8 h-72 w-72 rounded-full bg-sky-500/20 blur-3xl animate-float-slow-delayed" />
        <div className="relative grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div className="max-w-2xl space-y-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">PC E-commerce</p>
            <div key={hero.title} className="animate-fade-up space-y-3">
              <h1 className="text-3xl font-black leading-tight md:text-5xl">{hero.title}</h1>
              <p className="max-w-xl text-sm text-slate-100 md:text-base">{hero.description}</p>
            </div>
            <div className="inline-flex items-center rounded-full border border-cyan-300/40 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-100">
              {hero.accent}
            </div>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                to="/shop"
                className="inline-flex rounded-md bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:-translate-y-0.5 hover:bg-cyan-100"
              >
                Shop components
              </Link>
              <Link
                to="/about"
                className="inline-flex rounded-md border border-slate-400/40 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-cyan-300/60 hover:bg-slate-800"
              >
                Why Codveda
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-xs sm:text-sm">
            <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-3">
              <p className="text-xl font-black text-cyan-300">24h</p>
              <p className="text-slate-300">Dispatch</p>
            </div>
            <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-3">
              <p className="text-xl font-black text-cyan-300">4.9</p>
              <p className="text-slate-300">User rating</p>
            </div>
            <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-3">
              <p className="text-xl font-black text-cyan-300">99%</p>
              <p className="text-slate-300">Safe checkout</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-3 rounded-2xl bg-white/80 p-4 shadow-sm ring-1 ring-slate-200 backdrop-blur sm:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Gaming PCs", hint: "Custom & prebuilt rigs" },
          { title: "Monitors", hint: "2K, 4K & ultra-wide" },
          { title: "Input Gear", hint: "Mechanical precision" },
          { title: "Streaming", hint: "Capture & audio kits" },
        ].map((item) => (
          <Link
            key={item.title}
            to="/shop"
            className="group rounded-xl border border-slate-200 bg-white p-4 transition hover:-translate-y-1 hover:border-cyan-300 hover:shadow-md"
          >
            <p className="text-sm font-black text-slate-900">{item.title}</p>
            <p className="text-xs text-slate-600">{item.hint}</p>
            <p className="mt-2 text-xs font-semibold text-cyan-700 transition group-hover:translate-x-1">Explore</p>
          </Link>
        ))}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Featured products</h2>
          <Link to="/shop" className="text-sm font-semibold text-cyan-700">View all</Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              quantity={quantities[product.id] ?? 1}
              onQuantityChange={onQuantityChange}
              onQuantityAdjust={onQuantityAdjust}
              onAddToCart={onAddToCart}
              isAuthenticated={isAuthenticated}
            />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Best sellers</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {bestSellers.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              quantity={quantities[product.id] ?? 1}
              onQuantityChange={onQuantityChange}
              onQuantityAdjust={onQuantityAdjust}
              onAddToCart={onAddToCart}
              isAuthenticated={isAuthenticated}
            />
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6">
        <div className="animate-shimmer pointer-events-none absolute inset-0 opacity-40" />
        <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700">Upgrade plan</p>
            <h3 className="text-2xl font-black text-slate-900">Need help choosing parts?</h3>
            <p className="text-sm text-slate-600">Our curated bundles are built for gaming, editing, and streaming.</p>
          </div>
          <Link to="/shop" className="inline-flex rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
            View bundles
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
