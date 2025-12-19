import { describe, expect, it, mock } from "bun:test";
import { render, screen } from "@testing-library/react";

// Mock the actions module
mock.module("./actions", () => ({
  register: mock(() => Promise.resolve({})),
  RegisterState: {},
}));

// Mock useActionState with default state
const mockUseActionState = mock((action: unknown, initialState: { error?: string }) => {
  return [initialState, action, false];
});

mock.module("react", () => {
  const actual = require("react");
  return {
    ...actual,
    useActionState: mockUseActionState,
  };
});

// Import after mocking
const RegisterPage = (await import("./page")).default;

describe("RegisterPage", () => {
  it("renders registration form with all fields", () => {
    render(<RegisterPage />);

    expect(screen.getByLabelText(/^email$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /create account/i })).toBeInTheDocument();
  });

  it("renders registration title and description", () => {
    render(<RegisterPage />);

    expect(screen.getByText("Register")).toBeInTheDocument();
    expect(screen.getByText(/create an account/i)).toBeInTheDocument();
  });

  it("renders link to login page", () => {
    render(<RegisterPage />);

    const loginLink = screen.getByRole("link", { name: /login/i });
    expect(loginLink).toBeInTheDocument();
    expect(loginLink).toHaveAttribute("href", "/login");
  });

  it("shows error message when state has error", async () => {
    mockUseActionState.mockImplementationOnce(() => {
      return [{ error: "User already exists" }, mock(() => {}), false];
    });

    render(<RegisterPage />);

    expect(screen.getByText("User already exists")).toBeInTheDocument();
  });

  it("shows success message when email confirmation required", async () => {
    mockUseActionState.mockImplementationOnce(() => {
      return [
        { success: true, message: "Check your email for a confirmation link." },
        mock(() => {}),
        false,
      ];
    });

    render(<RegisterPage />);

    expect(screen.getByText("Check your email")).toBeInTheDocument();
    expect(screen.getByText("Check your email for a confirmation link.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /back to login/i })).toBeInTheDocument();
  });

  it("shows loading state when pending", async () => {
    mockUseActionState.mockImplementationOnce(() => {
      return [{}, mock(() => {}), true]; // isPending = true
    });

    render(<RegisterPage />);

    expect(screen.getByRole("button", { name: /creating account/i })).toBeInTheDocument();
    expect(screen.getByRole("button")).toBeDisabled();
  });
});
