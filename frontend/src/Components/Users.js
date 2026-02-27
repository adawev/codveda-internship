import React, { useEffect, useState } from "react";
import { getUsers, createUser, deleteUser } from "../UserService";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getUsers();
      setUsers(res.data.content ?? []);
    } catch (err) {
      setError("Unable to load users.");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (event) => {
    event.preventDefault();
    setError(null);
    try {
      await createUser({ name, email, password: "ChangeMe123!" });
      setName("");
      setEmail("");
      fetchUsers();
    } catch (err) {
      setError("Unable to add user.");
    }
  };

  const handleDelete = async (id) => {
    setError(null);
    try {
      await deleteUser(id);
      fetchUsers();
    } catch (err) {
      setError("Unable to delete user.");
    }
  };

  return (
    <div>
      <h3>Users</h3>
      <p className="note">Create users for administrative management with a temporary strong password.</p>
      <form onSubmit={handleAdd} className="form">
        <label className="field">
          <span>Name</span>
          <input
            placeholder="Full name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
        </label>
        <label className="field">
          <span>Email</span>
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>
        <button type="submit">Add user</button>
      </form>

      {loading && <p className="note">Loading users...</p>}
      {error && <p className="error">{error}</p>}

      {users.length > 0 ? (
        <ul className="list">
          {users.map((user) => (
            <li key={user.id} className="list-item">
              <span>
                {user.name} ({user.email})
              </span>
              <button type="button" onClick={() => handleDelete(user.id)}>
                Delete
              </button>
            </li>
          ))}
        </ul>
      ) : (
        !loading && <p className="note">No users found.</p>
      )}
    </div>
  );
};

export default Users;
