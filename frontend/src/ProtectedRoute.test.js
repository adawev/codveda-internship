import React from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import ProtectedRoute from "./ProtectedRoute";

const mockUseAuth = jest.fn();

jest.mock("./AuthContext", () => ({
  useAuth: () => mockUseAuth(),
}));

describe("ProtectedRoute", () => {
  test("shows loading state while auth is hydrating", () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false, isLoading: true, user: null });

    render(
      <MemoryRouter initialEntries={["/private"]}>
        <Routes>
          <Route
            path="/private"
            element={(
              <ProtectedRoute role="USER">
                <div>Private page</div>
              </ProtectedRoute>
            )}
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/checking session/i)).toBeInTheDocument();
  });

  test("redirects unauthenticated users to login", () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false, isLoading: false, user: null });

    render(
      <MemoryRouter initialEntries={["/private"]}>
        <Routes>
          <Route path="/login" element={<div>Login page</div>} />
          <Route
            path="/private"
            element={(
              <ProtectedRoute role="USER">
                <div>Private page</div>
              </ProtectedRoute>
            )}
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/login page/i)).toBeInTheDocument();
  });
});
