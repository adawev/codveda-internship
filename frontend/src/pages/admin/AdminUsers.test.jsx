import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import AdminUsers from "./AdminUsers";

const mockGetUsers = jest.fn();
const mockRemoveUser = jest.fn();

jest.mock("../../services/admin", () => ({
  getUsers: (...args) => mockGetUsers(...args),
  removeUser: (...args) => mockRemoveUser(...args),
}));

jest.mock("../../components/ui/use-toast", () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

describe("AdminUsers pagination", () => {
  test("uses server-side pagination and requests next page", async () => {
    mockGetUsers
      .mockResolvedValueOnce({
        data: {
          content: [{ id: 1, name: "User One", email: "u1@test.local", role: "USER" }],
          totalPages: 2,
          totalElements: 2,
        },
      })
      .mockResolvedValueOnce({
        data: {
          content: [{ id: 2, name: "User Two", email: "u2@test.local", role: "USER" }],
          totalPages: 2,
          totalElements: 2,
        },
      });

    render(<AdminUsers />);

    await waitFor(() => expect(mockGetUsers).toHaveBeenCalledWith(0, 10));
    await waitFor(() => expect(screen.getByText("User One")).toBeInTheDocument());

    fireEvent.click(screen.getByRole("button", { name: /next/i }));

    await waitFor(() => expect(mockGetUsers).toHaveBeenCalledWith(1, 10));
    await waitFor(() => expect(screen.getByText("User Two")).toBeInTheDocument());
  });
});
