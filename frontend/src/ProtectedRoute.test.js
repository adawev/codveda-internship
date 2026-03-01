import React from "react";
import { render, screen } from "@testing-library/react";
import ProtectedRoute from "./ProtectedRoute";

const mockUseAuth = jest.fn();

jest.mock("./AuthContext", () => ({
  useAuth: () => mockUseAuth(),
}));

jest.mock("react-router-dom", () => ({
  Navigate: ({ to }) => <div>redirect:{to}</div>,
}), { virtual: true });

describe("ProtectedRoute", () => {
  test("shows loading state while auth is hydrating", () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false, isLoading: true, user: null });

    render(<ProtectedRoute role="USER"><div>Private page</div></ProtectedRoute>);

    expect(screen.getByText(/checking session/i)).toBeInTheDocument();
  });

  test("redirects unauthenticated users to login", () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false, isLoading: false, user: null });

    render(<ProtectedRoute role="USER"><div>Private page</div></ProtectedRoute>);

    expect(screen.getByText("redirect:/login")).toBeInTheDocument();
  });

  test("redirects authenticated users without required role", () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { role: "USER" },
    });

    render(<ProtectedRoute role="ADMIN"><div>Admin page</div></ProtectedRoute>);

    expect(screen.getByText("redirect:/")).toBeInTheDocument();
  });

  test("renders child route when role matches", () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { role: "ADMIN" },
    });

    render(<ProtectedRoute role="ADMIN"><div>Admin page</div></ProtectedRoute>);

    expect(screen.getByText("Admin page")).toBeInTheDocument();
  });
});
