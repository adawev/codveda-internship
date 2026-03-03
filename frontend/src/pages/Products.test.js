import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import Products from "./Products";
import api from "../services/api";

jest.mock("../services/api", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

jest.mock("../AuthContext", () => ({
  useAuth: () => ({
    isAuthenticated: true,
  }),
}));

jest.mock("../CartContext", () => ({
  useCart: () => ({
    refreshCart: jest.fn(),
  }),
}));

jest.mock("../components/ui/use-toast", () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

jest.mock("react-router-dom", () => ({
  useSearchParams: () => [new URLSearchParams()],
  Link: ({ children }) => <span>{children}</span>,
}), { virtual: true });

describe("Products page integration", () => {
  test("loads products from backend and applies server-side filters", async () => {
    api.get
      .mockResolvedValueOnce({
        data: {
          content: [{ id: 1, name: "Gaming Mouse", price: 59.99, stock: 4, description: "Optical" }],
          totalPages: 1,
          totalElements: 1,
        },
      })
      .mockResolvedValueOnce({
        data: {
          content: [],
          totalPages: 1,
          totalElements: 0,
        },
      });

    render(<Products />);

    expect(screen.getByText(/loading products/i)).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText(/gaming mouse/i)).toBeInTheDocument());

    fireEvent.change(screen.getByLabelText(/search/i), { target: { value: "non-existing" } });

    await waitFor(() => {
      expect(api.get).toHaveBeenLastCalledWith("/api/products", expect.objectContaining({
        params: expect.objectContaining({
          q: "non-existing",
          page: 0,
          size: 9,
        }),
      }));
    });
  });
});
