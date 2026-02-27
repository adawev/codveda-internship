import React, { useEffect, useState } from "react";
import api from "../api";
import { useAuth } from "../AuthContext";
import InputField from "../components/form/InputField";
import PasswordField from "../components/form/PasswordField";
import SubmitButton from "../components/form/SubmitButton";
import { useToast } from "../components/ui/use-toast";

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [profileRes, ordersRes] = await Promise.all([
          api.get("/api/users/me"),
          api.get("/api/orders?page=0&size=5&sort=createdAt,desc", { suppressErrorToast: true }),
        ]);
        setName(profileRes.data?.name || "");
        setEmail(profileRes.data?.email || "");
        setOrders(ordersRes.data?.content || []);
      } catch (error) {
        setEmail(user?.email || "");
      }
    };

    loadData();
  }, [user?.email]);

  const saveProfile = async (event) => {
    event.preventDefault();

    setIsSaving(true);
    try {
      await api.put("/api/users/me", {
        name,
        email,
        ...(password ? { password } : {}),
      });
      setPassword("");
      toast({ title: "Saved", description: "Profile updated.", variant: "success" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-cyan-700">Profile</p>
        <h1 className="mt-1 text-2xl font-black">Your account</h1>

        <form onSubmit={saveProfile} className="mt-5 grid gap-4">
          <InputField id="profile-name" label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
          <InputField id="profile-email" type="email" label="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <PasswordField id="profile-password" label="New password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Leave blank to keep current password" />
          <SubmitButton isLoading={isSaving} loadingLabel="Saving...">Save profile</SubmitButton>
        </form>
      </section>

      <aside className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-bold">Recent orders</h2>
        <div className="mt-4 space-y-2">
          {orders.length === 0 && <p className="text-sm text-slate-500">No recent orders.</p>}
          {orders.map((order) => (
            <div key={order.id} className="rounded-lg border border-slate-200 p-3 text-sm">
              <p className="font-semibold text-slate-900">Order #{order.id}</p>
              <p className="text-slate-600">{order.status}</p>
              <p className="text-slate-600">${order.totalPrice}</p>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
};

export default Profile;
