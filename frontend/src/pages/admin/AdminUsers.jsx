import React, { useEffect, useState } from "react";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { useToast } from "../../components/ui/use-toast";
import { getUsers, removeUser } from "../../services/admin";
import ConfirmDialog from "../../components/admin/ConfirmDialog";

const formatDate = (value) => {
  if (!value) {
    return "-";
  }
  return new Date(value).toLocaleDateString();
};

const AdminUsers = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [pendingDeleteUser, setPendingDeleteUser] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await getUsers();
      setUsers(response.data.content ?? []);
    } catch (error) {
      // Handled by global API interceptor toast.
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const onDelete = async (user) => {
    if (user.role === "ADMIN") {
      toast({
        title: "Action blocked",
        description: "The admin account cannot be deleted.",
        variant: "warning",
      });
      return;
    }

    setPendingDeleteUser(user);
  };

  const confirmDelete = async () => {
    if (!pendingDeleteUser) {
      return;
    }

    setActionId(pendingDeleteUser.id);
    try {
      await removeUser(pendingDeleteUser.id);
      toast({ title: "User deleted", variant: "success" });
      await fetchUsers();
      setPendingDeleteUser(null);
    } catch (error) {
      // Handled by global API interceptor toast.
    } finally {
      setActionId(null);
    }
  };

  return (
    <section className="space-y-4">
      <header>
        <h2 className="text-xl font-semibold text-slate-900">Users</h2>
      </header>

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-3 py-2">ID</th>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">Role</th>
              <th className="px-3 py-2">Created At</th>
              <th className="px-3 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading && (
              <tr>
                <td className="px-3 py-4 text-slate-500" colSpan={6}>
                  Loading users...
                </td>
              </tr>
            )}

            {!loading && users.length === 0 && (
              <tr>
                <td className="px-3 py-4 text-slate-500" colSpan={6}>
                  No users found.
                </td>
              </tr>
            )}

            {!loading &&
              users.map((user) => (
                <tr key={user.id}>
                  <td className="px-3 py-3">{user.id}</td>
                  <td className="px-3 py-3">{user.name}</td>
                  <td className="px-3 py-3">{user.email}</td>
                  <td className="px-3 py-3">
                    <Badge className={user.role === "ADMIN" ? "bg-slate-900" : "bg-slate-200 text-slate-700"}>
                      {user.role}
                    </Badge>
                  </td>
                  <td className="px-3 py-3 text-slate-600">{formatDate(user.createdAt)}</td>
                  <td className="px-3 py-3 text-right">
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={actionId === user.id || user.role === "ADMIN"}
                      onClick={() => onDelete(user)}
                    >
                      {actionId === user.id ? "Deleting..." : "Delete"}
                    </Button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={!!pendingDeleteUser}
        title="Delete User"
        description={`Are you sure you want to delete ${pendingDeleteUser?.email ?? "this user"}?`}
        confirmLabel="Delete"
        busy={actionId === pendingDeleteUser?.id}
        onCancel={() => setPendingDeleteUser(null)}
        onConfirm={confirmDelete}
      />
    </section>
  );
};

export default AdminUsers;
