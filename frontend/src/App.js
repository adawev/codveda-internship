import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Cart from "./pages/Cart";
import Orders from "./pages/Orders";
import AdminDashboard from "./pages/AdminDashboard";
import Products from "./pages/Products";
import ProtectedRoute from "./ProtectedRoute";
import { useAuth } from "./AuthContext";

function App() {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <Router>
      <div className="app">
        <header className="nav">
          <h1 className="brand">Codveda Shop</h1>
          <nav>
            <Link to="/">Products</Link>
            {isAuthenticated && <Link to="/cart">Cart</Link>}
            {isAuthenticated && <Link to="/orders">Orders</Link>}
            {!isAuthenticated && <Link to="/login">Login</Link>}
            {!isAuthenticated && <Link to="/register">Register</Link>}
            {user?.role === "ADMIN" && <Link to="/admin">Admin</Link>}
            {isAuthenticated && (
              <button type="button" onClick={logout}>
                Logout
              </button>
            )}
          </nav>
        </header>

        <main>
          <Routes>
            <Route path="/" element={<Products />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/cart"
              element={
                <ProtectedRoute role="USER">
                  <Cart />
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders"
              element={
                <ProtectedRoute role="USER">
                  <Orders />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute role="ADMIN">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Products />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
