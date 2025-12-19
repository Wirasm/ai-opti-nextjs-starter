import { describe, expect, it, mock } from "bun:test";
import { render, screen } from "@testing-library/react";

// Mock the actions module
mock.module("./actions", () => ({
  login: mock(() => Promise.resolve({})),
  LoginState: {},
}));

// Mock useActionState
mock.module("react", () => {
  const actual = require("react");
  return {
    ...actual,
    useActionState: mock((action: unknown, initialState: { error?: string }) => {
      return [initialState, action, false];
    }),
  };
});

// Import after mocking
const LoginPage = (await import("./page")).default;

describe("LoginPage", () => {
  it("renders login form with email and password fields", () => {
    render(<LoginPage />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });

  it("renders login title and description", () => {
    render(<LoginPage />);

    expect(screen.getByText("Login")).toBeInTheDocument();
    expect(screen.getByText(/enter your email below/i)).toBeInTheDocument();
  });

  it("renders link to register page", () => {
    render(<LoginPage />);

    const registerLink = screen.getByRole("link", { name: /register/i });
    expect(registerLink).toBeInTheDocument();
    expect(registerLink).toHaveAttribute("href", "/register");
  });

  it("shows error message when state has error", async () => {
    // Re-mock with error state
    mock.module("react", () => {
      const actual = require("react");
      return {
        ...actual,
        useActionState: mock(() => {
          return [{ error: "Invalid credentials" }, mock(() => {}), false];
        }),
      };
    });

    // Re-import to get new mock
    const LoginPageWithError = (await import("./page")).default;
    render(<LoginPageWithError />);

    expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
  });
});
