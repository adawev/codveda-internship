import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../services/api";
import ProductCard from "../components/product/ProductCard";
import { useAuth } from "../AuthContext";
import { useCart } from "../CartContext";
import { useToast } from "../components/ui/use-toast";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";

const pageSize = 9;

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
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [quantities, setQuantities] = useState({});

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    const sortMap = {
      newest: "createdAt,desc",
      "price-asc": "price,asc",
      "price-desc": "price,desc",
      name: "name,asc",
    };

    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = {
          page: Math.max(0, page - 1),
          size: pageSize,
          sort: sortMap[sort] ?? "createdAt,desc",
        };
        if (query.trim()) {
          params.q = query.trim();
        }
        if (maxPrice !== "") {
          params.maxPrice = Number(maxPrice);
        }
        if (stockOnly) {
          params.inStock = true;
        }

        const response = await api.get("/api/products", { params });
        setProducts(response.data?.content ?? []);
        setTotalPages(Math.max(1, response.data?.totalPages ?? 1));
        setTotalElements(response.data?.totalElements ?? 0);
      } catch (error) {
        setProducts([]);
        setTotalPages(1);
        setTotalElements(0);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [page, query, maxPrice, stockOnly, sort]);

  useEffect(() => {
    setPage(1);
  }, [query, maxPrice, stockOnly, sort]);

  const onQuantityChange = (productId, value, maxStock) => {
    const quantity = Number(value);
    const boundedMax = Number.isFinite(maxStock) && maxStock > 0 ? Math.floor(maxStock) : Number.MAX_SAFE_INTEGER;
    const safeQuantity = Number.isNaN(quantity) ? 1 : Math.max(1, Math.floor(quantity));
    setQuantities((prev) => ({
      ...prev,
      [productId]: Math.min(safeQuantity, boundedMax),
    }));
  };

  const onQuantityAdjust = (productId, delta, maxStock) => {
    const current = quantities[productId] ?? 1;
    onQuantityChange(productId, current + delta, maxStock);
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
          <p className="text-sm text-slate-600">{totalElements} products</p>
        </div>

        {loading ? (
          <p className="text-sm text-slate-500">Loading products...</p>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {products.map((product) => (
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

            {products.length === 0 && (
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
