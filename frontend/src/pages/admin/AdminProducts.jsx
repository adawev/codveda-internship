import React, { useEffect, useState } from "react";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { useToast } from "../../components/ui/use-toast";
import { createProduct, getProducts, removeProduct, updateProduct } from "../../services/admin";
import Modal from "../../components/admin/Modal";
import ConfirmDialog from "../../components/admin/ConfirmDialog";
import { normalizeImageUrl } from "../../lib/imageUrl";

const emptyForm = {
  name: "",
  description: "",
  price: "",
  stock: "",
  imageUrl: "",
};

const AdminProducts = () => {
  const { toast } = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [pendingDeleteProduct, setPendingDeleteProduct] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await getProducts();
      setProducts(response.data.content ?? []);
    } catch (error) {
      // Handled by global API interceptor toast.
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const openEdit = (product) => {
    setEditing(product);
    setForm({
      name: product.name ?? "",
      description: product.description ?? "",
      price: product.price ?? "",
      stock: product.stock ?? "",
      imageUrl: product.imageUrl ?? "",
    });
  };

  const onDelete = async (product) => {
    setPendingDeleteProduct(product);
  };

  const confirmDelete = async () => {
    if (!pendingDeleteProduct) {
      return;
    }

    setActionId(pendingDeleteProduct.id);
    try {
      await removeProduct(pendingDeleteProduct.id);
      toast({ title: "Product deleted", variant: "success" });
      await fetchProducts();
      setPendingDeleteProduct(null);
    } catch (error) {
      // Handled by global API interceptor toast.
    } finally {
      setActionId(null);
    }
  };

  const onToggle = async (product) => {
    setActionId(product.id);
    try {
      await updateProduct(product.id, {
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        imageUrl: normalizeImageUrl(product.imageUrl),
        active: !product.active,
      });
      toast({ title: "Status updated", variant: "success" });
      await fetchProducts();
    } catch (error) {
      // Handled by global API interceptor toast.
    } finally {
      setActionId(null);
    }
  };

  const onSubmitEdit = async (event) => {
    event.preventDefault();
    if (!editing) {
      return;
    }

    setSaving(true);
    try {
      await updateProduct(editing.id, {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        stock: Number(form.stock),
        imageUrl: normalizeImageUrl(form.imageUrl) || null,
      });
      toast({ title: "Product updated", variant: "success" });
      setEditing(null);
      setForm(emptyForm);
      await fetchProducts();
    } catch (error) {
      // Handled by global API interceptor toast.
    } finally {
      setSaving(false);
    }
  };

  const onSubmitCreate = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await createProduct({
        name: form.name,
        description: form.description,
        price: Number(form.price),
        stock: Number(form.stock),
        imageUrl: normalizeImageUrl(form.imageUrl) || null,
        active: true,
      });
      toast({ title: "Product created", variant: "success" });
      setCreating(false);
      setForm(emptyForm);
      await fetchProducts();
    } catch (error) {
      // Handled by global API interceptor toast.
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="space-y-4">
      <header className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-slate-900">Products</h2>
        <Button
          size="sm"
          onClick={() => {
            setForm(emptyForm);
            setCreating(true);
          }}
        >
          Add Product
        </Button>
      </header>

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-3 py-2">Image</th>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Price</th>
              <th className="px-3 py-2">Stock</th>
              <th className="px-3 py-2">Active Status</th>
              <th className="px-3 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading && (
              <tr>
                <td className="px-3 py-4 text-slate-500" colSpan={6}>
                  Loading products...
                </td>
              </tr>
            )}

            {!loading && products.length === 0 && (
              <tr>
                <td className="px-3 py-4 text-slate-500" colSpan={6}>
                  No products found.
                </td>
              </tr>
            )}

            {!loading &&
              products.map((product) => (
                <tr key={product.id}>
                  <td className="px-3 py-3">
                    {normalizeImageUrl(product.imageUrl) ? (
                      <img src={normalizeImageUrl(product.imageUrl)} alt={product.name} className="h-10 w-10 rounded-md object-cover" />
                    ) : (
                      <div className="h-10 w-10 rounded-md bg-slate-100" />
                    )}
                  </td>
                  <td className="px-3 py-3">{product.name}</td>
                  <td className="px-3 py-3">${product.price}</td>
                  <td className="px-3 py-3">{product.stock}</td>
                  <td className="px-3 py-3">
                    <Badge className={product.active ? "bg-emerald-600" : "bg-slate-300 text-slate-700"}>
                      {product.active ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="secondary" onClick={() => openEdit(product)}>
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={actionId === product.id}
                        onClick={() => onToggle(product)}
                      >
                        {actionId === product.id ? "Saving..." : product.active ? "Disable" : "Enable"}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={actionId === product.id}
                        onClick={() => onDelete(product)}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <Modal open={!!editing} title="Edit Product" onClose={() => setEditing(null)}>
        <form className="grid gap-3" onSubmit={onSubmitEdit}>
          <label className="grid gap-1 text-sm">
            <span className="text-slate-600">Name</span>
            <input
              className="h-10 rounded-md border border-slate-300 px-3"
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              required
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="text-slate-600">Description</span>
            <textarea
              className="min-h-24 rounded-md border border-slate-300 px-3 py-2"
              value={form.description}
              onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
            />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1 text-sm">
              <span className="text-slate-600">Price</span>
              <input
                type="number"
                step="0.01"
                min="0"
                className="h-10 rounded-md border border-slate-300 px-3"
                value={form.price}
                onChange={(event) => setForm((prev) => ({ ...prev, price: event.target.value }))}
                required
              />
            </label>
            <label className="grid gap-1 text-sm">
              <span className="text-slate-600">Stock</span>
              <input
                type="number"
                min="0"
                className="h-10 rounded-md border border-slate-300 px-3"
                value={form.stock}
                onChange={(event) => setForm((prev) => ({ ...prev, stock: event.target.value }))}
                required
              />
            </label>
          </div>
          <label className="grid gap-1 text-sm">
            <span className="text-slate-600">Image URL</span>
            <input
              className="h-10 rounded-md border border-slate-300 px-3"
              value={form.imageUrl}
              onChange={(event) => setForm((prev) => ({ ...prev, imageUrl: event.target.value }))}
            />
          </label>

          <div className="mt-2 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal open={creating} title="Create Product" onClose={() => setCreating(false)}>
        <form className="grid gap-3" onSubmit={onSubmitCreate}>
          <label className="grid gap-1 text-sm">
            <span className="text-slate-600">Name</span>
            <input
              className="h-10 rounded-md border border-slate-300 px-3"
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              required
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="text-slate-600">Description</span>
            <textarea
              className="min-h-24 rounded-md border border-slate-300 px-3 py-2"
              value={form.description}
              onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
            />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1 text-sm">
              <span className="text-slate-600">Price</span>
              <input
                type="number"
                step="0.01"
                min="0"
                className="h-10 rounded-md border border-slate-300 px-3"
                value={form.price}
                onChange={(event) => setForm((prev) => ({ ...prev, price: event.target.value }))}
                required
              />
            </label>
            <label className="grid gap-1 text-sm">
              <span className="text-slate-600">Stock</span>
              <input
                type="number"
                min="0"
                className="h-10 rounded-md border border-slate-300 px-3"
                value={form.stock}
                onChange={(event) => setForm((prev) => ({ ...prev, stock: event.target.value }))}
                required
              />
            </label>
          </div>
          <label className="grid gap-1 text-sm">
            <span className="text-slate-600">Image URL</span>
            <input
              className="h-10 rounded-md border border-slate-300 px-3"
              value={form.imageUrl}
              onChange={(event) => setForm((prev) => ({ ...prev, imageUrl: event.target.value }))}
            />
          </label>

          <div className="mt-2 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setCreating(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Creating..." : "Create"}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!pendingDeleteProduct}
        title="Delete Product"
        description={`Are you sure you want to delete ${pendingDeleteProduct?.name ?? "this product"}?`}
        confirmLabel="Delete"
        busy={actionId === pendingDeleteProduct?.id}
        onCancel={() => setPendingDeleteProduct(null)}
        onConfirm={confirmDelete}
      />
    </section>
  );
};

export default AdminProducts;
