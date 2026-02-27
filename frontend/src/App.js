import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import { useAuth } from "./AuthContext";

const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Cart = lazy(() => import("./pages/Cart"));
const Orders = lazy(() => import("./pages/Orders"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const Products = lazy(() => import("./pages/Products"));

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
          <Suspense fallback={<p className="note">Loading page...</p>}>
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
          </Suspense>
        </main>
      </div>
    </Router>
  );
}

export default App;
