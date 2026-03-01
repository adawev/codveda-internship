import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import Login from "./Login";

const mockLogin = jest.fn();
const mockToast = jest.fn();
const mockNavigate = jest.fn();

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

jest.mock("react-router-dom", () => ({
  Link: ({ children }) => <span>{children}</span>,
  useNavigate: () => mockNavigate,
}), { virtual: true });

describe("Login auth flow", () => {
  test("navigates admin user to admin dashboard on successful login", async () => {
    mockLogin.mockResolvedValueOnce({ role: "ADMIN", userId: 1, email: "admin@test.local" });

    render(<Login />);

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "admin@test.local" } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "Password@123" } });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith("/admin"));

    expect(mockLogin).toHaveBeenCalledWith("admin@test.local", "Password@123");
  });
});
