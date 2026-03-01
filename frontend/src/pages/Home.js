import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import ProductCard from "../components/product/ProductCard";
import { useAuth } from "../AuthContext";
import { useCart } from "../CartContext";
import { useToast } from "../components/ui/use-toast";

const banners = [
  {
    title: "Fresh arrivals for your setup",
    description: "Discover curated products with fast delivery and premium support.",
  },
  {
    title: "Weekend sale up to 30%",
    description: "Limited-time deals on trending products across categories.",
  },
  {
    title: "Build your perfect cart",
    description: "Seamless checkout and real-time order updates.",
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

  const onQuantityChange = (productId, value) => {
    const quantity = Number(value);
    setQuantities((prev) => ({
      ...prev,
      [productId]: Number.isNaN(quantity) ? 1 : Math.max(1, quantity),
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
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-cyan-700 p-8 text-white md:p-12">
        <div className="max-w-2xl space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">E-commerce</p>
          <h1 className="text-3xl font-black md:text-5xl">{banners[bannerIndex].title}</h1>
          <p className="text-sm text-slate-100 md:text-base">{banners[bannerIndex].description}</p>
          <Link to="/shop" className="inline-flex rounded-md bg-white px-4 py-2 text-sm font-semibold text-slate-900">
            Shop now
          </Link>
        </div>
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
              onAddToCart={onAddToCart}
              isAuthenticated={isAuthenticated}
            />
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
