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
});
