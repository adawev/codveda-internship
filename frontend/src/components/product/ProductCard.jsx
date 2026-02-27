import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { normalizeImageUrl } from "../../lib/imageUrl";

const ProductCard = ({ product, quantity, onQuantityChange, onAddToCart, isAuthenticated }) => {
  const rating = ((Number(product.id) % 5) + 1).toFixed(1);
  const inStock = (product.stock ?? 0) > 0;
  const imageUrl = normalizeImageUrl(product.imageUrl);

  return (
    <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <Link to={`/shop/${product.id}`} className="block aspect-square bg-slate-100">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl font-black text-slate-400">
            {product.name?.charAt(0) || "P"}
          </div>
        )}
      </Link>

      <div className="space-y-3 p-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="truncate text-base font-semibold text-slate-900">{product.name}</h3>
          <Badge className={inStock ? "bg-emerald-600" : "bg-red-600"}>{inStock ? "In stock" : "Sold out"}</Badge>
        </div>
        <p
          className="text-sm text-slate-600"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {product.description || "No description available."}
        </p>
        <div className="flex items-center justify-between">
          <p className="text-lg font-bold text-slate-900">${product.price}</p>
          <p className="text-sm text-amber-600">{rating} ★</p>
        </div>

        <div className="grid grid-cols-[70px_1fr] gap-2">
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(event) => onQuantityChange(product.id, event.target.value)}
            className="h-10 rounded-md border border-slate-300 px-2 text-sm"
            disabled={!isAuthenticated || !inStock}
          />
          {isAuthenticated ? (
            <Button onClick={() => onAddToCart(product.id)} disabled={!inStock}>
              Add to cart
            </Button>
          ) : (
            <Link
              to="/login"
              className="inline-flex h-10 items-center justify-center rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700"
            >
              Login to buy
            </Link>
          )}
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
