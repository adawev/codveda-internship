import React, { useEffect, useState } from "react";
import { getUsers, createUser, deleteUser } from "../UserService";
import "./style.css";

const Users = () => {
    const [users, setUsers] = useState([]);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        const res = await getUsers();
        setUsers(res.data);
    };

    const handleAdd = async () => {
        await createUser({ name, email, password: "1234" });
        setName(""); setEmail("");
        fetchUsers();
    };

    const handleDelete = async (id) => {
        await deleteUser(id);
        fetchUsers();
    };

    return (
        <div className="users-container">
            <h1>Users</h1>
            <div>
                <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
                <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
                <button onClick={handleAdd}>Add User</button>
            </div>

            <ul>
                {users.map(user => (
                    <li key={user.id}>
                        <span>{user.name} ({user.email})</span>
                        <button onClick={() => handleDelete(user.id)}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Users;
