import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api";
import { useAuth } from "../AuthContext";
import { useCart } from "../CartContext";
import { useToast } from "../components/ui/use-toast";
import { Button } from "../components/ui/button";
import { normalizeImageUrl } from "../lib/imageUrl";

const ProductDetail = () => {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const { refreshCart } = useCart();
  const { toast } = useToast();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [imageIndex, setImageIndex] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/api/products/${id}`);
        setProduct(response.data);
      } catch (error) {
        // Handled by global API interceptor toast.
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return <p className="text-sm text-slate-500">Loading product...</p>;
  }

  if (!product) {
    return <p className="text-sm text-slate-500">Product not found.</p>;
  }

  const inStock = (product.stock ?? 0) > 0;
  const normalizedImage = normalizeImageUrl(product.imageUrl);
  const images = [normalizedImage, normalizedImage, normalizedImage].filter(Boolean);

  const addToCart = async () => {
    try {
      await api.post("/api/cart/items", { productId: product.id, quantity });
      await refreshCart();
      toast({ title: "Added", description: "Product added to cart.", variant: "success" });
    } catch (error) {
      // Handled by global API interceptor toast.
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="space-y-3">
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          {images[imageIndex] ? (
            <img src={images[imageIndex]} alt={product.name} className="aspect-square w-full object-cover" />
          ) : (
            <div className="aspect-square" />
          )}
        </div>
        {images.length > 1 && (
          <div className="flex gap-2">
            {images.map((image, index) => (
              <button key={`${image}-${index}`} type="button" onClick={() => setImageIndex(index)} className={`h-16 w-16 overflow-hidden rounded-md border ${imageIndex === index ? "border-slate-900" : "border-slate-200"}`}>
                <img src={image} alt={`${product.name} ${index + 1}`} className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-cyan-700">Product Detail</p>
        <h1 className="text-3xl font-black text-slate-900">{product.name}</h1>
        <p className="text-sm text-slate-600">{product.description || "No description available."}</p>
        <p className="text-3xl font-bold text-slate-900">${product.price}</p>
        <p className={`text-sm font-medium ${inStock ? "text-emerald-600" : "text-red-600"}`}>
          {inStock ? `${product.stock} in stock` : "Out of stock"}
        </p>

        <div className="grid grid-cols-[80px_1fr] gap-2">
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(event) => setQuantity(Math.max(1, Number(event.target.value) || 1))}
            className="h-10 rounded-md border border-slate-300 px-2"
            disabled={!inStock || !isAuthenticated}
          />
          {isAuthenticated ? (
            <Button onClick={addToCart} disabled={!inStock}>Add to cart</Button>
          ) : (
            <Link
              to="/login"
              className="inline-flex h-10 items-center justify-center rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700"
            >
              Login to add
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
