import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api";
import ProductCard from "../components/product/ProductCard";
import { useAuth } from "../AuthContext";
import { useCart } from "../CartContext";
import { useToast } from "../components/ui/use-toast";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";

const pageSize = 8;

const Products = () => {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const { isAuthenticated } = useAuth();
  const { refreshCart } = useCart();
  const { toast } = useToast();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState(initialQuery);
  const [maxPrice, setMaxPrice] = useState("");
  const [stockOnly, setStockOnly] = useState(false);
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [quantities, setQuantities] = useState({});

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await api.get("/api/products?page=0&size=200&sort=createdAt,desc");
        setProducts(response.data.content ?? []);
      } catch (error) {
        // Handled by global API interceptor toast.
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (query.trim()) {
      const normalized = query.toLowerCase();
      result = result.filter(
        (product) =>
          product.name?.toLowerCase().includes(normalized) ||
          product.description?.toLowerCase().includes(normalized)
      );
    }

    if (maxPrice) {
      result = result.filter((product) => Number(product.price) <= Number(maxPrice));
    }

    if (stockOnly) {
      result = result.filter((product) => (product.stock ?? 0) > 0);
    }

    if (sort === "price-asc") {
      result.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sort === "price-desc") {
      result.sort((a, b) => Number(b.price) - Number(a.price));
    } else if (sort === "name") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      result.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }

    return result;
  }, [products, query, maxPrice, stockOnly, sort]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const paginatedProducts = filteredProducts.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    setPage(1);
  }, [query, maxPrice, stockOnly, sort]);

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
      toast({ title: "Added", description: "Item added to cart.", variant: "success" });
    } catch (error) {
      // Handled by global API interceptor toast.
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
      <aside className="space-y-4 rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="text-lg font-bold">Filters</h2>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="search">Search</label>
          <Input id="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="price">Max price</label>
          <Input id="price" type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder="999" />
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" checked={stockOnly} onChange={(e) => setStockOnly(e.target.checked)} />
          In stock only
        </label>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="sort">Sort by</label>
          <select
            id="sort"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"
          >
            <option value="newest">Newest</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
            <option value="name">Name</option>
          </select>
        </div>
      </aside>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-black">Shop</h1>
          <p className="text-sm text-slate-600">{filteredProducts.length} products</p>
        </div>

        {loading ? (
          <p className="text-sm text-slate-500">Loading products...</p>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {paginatedProducts.map((product) => (
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

            {paginatedProducts.length === 0 && (
              <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-600">
                No products match your filters.
              </div>
            )}

            <div className="flex items-center justify-center gap-2 pt-2">
              <Button variant="secondary" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                Prev
              </Button>
              <span className="text-sm text-slate-600">Page {page} of {totalPages}</span>
              <Button variant="secondary" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                Next
              </Button>
            </div>
          </>
        )}
      </section>
    </div>
  );
};

export default Products;
