import React from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import Login from "./Login";

const mockLogin = jest.fn();
const mockToast = jest.fn();

jest.mock("../AuthContext", () => ({
  useAuth: () => ({
    login: mockLogin,
  }),
}));

jest.mock("../components/ui/use-toast", () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}));

describe("Login auth flow", () => {
  test("navigates admin user to admin dashboard on successful login", async () => {
    mockLogin.mockResolvedValueOnce({ role: "ADMIN", userId: 1, email: "admin@test.local" });

    render(
      <MemoryRouter initialEntries={["/login"]}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<div>Admin dashboard</div>} />
          <Route path="/" element={<div>Home page</div>} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "admin@test.local" } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "Password@123" } });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/admin dashboard/i)).toBeInTheDocument();
    });

    expect(mockLogin).toHaveBeenCalledWith("admin@test.local", "Password@123");
  });
});
