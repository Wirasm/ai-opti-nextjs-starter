import { beforeEach, describe, expect, it, mock } from "bun:test";

// Mock the redirect function
const mockRedirect = mock(() => {
  throw new Error("NEXT_REDIRECT");
});

// Mock Supabase client - use `as never` to avoid strict type checking for mocks
const mockSignOut = mock(() => Promise.resolve({ error: null }));
const mockSignInWithPassword = mock(
  () =>
    Promise.resolve({
      data: { user: { id: "123" }, session: {} },
      error: null,
    }) as never,
);
const mockSignUp = mock(
  () =>
    Promise.resolve({
      data: { user: { id: "123" }, session: {} },
      error: null,
    }) as never,
);

const mockSupabaseClient = {
  auth: {
    signOut: mockSignOut,
    signInWithPassword: mockSignInWithPassword,
    signUp: mockSignUp,
  },
};

// Mock modules
mock.module("next/navigation", () => ({
  redirect: mockRedirect,
}));

mock.module("@/core/supabase/server", () => ({
  createClient: () => Promise.resolve(mockSupabaseClient),
}));

// Import after mocking
const { signOut } = await import("./actions");
const { login } = await import("@/app/(auth)/login/actions");
const { register } = await import("@/app/(auth)/register/actions");

describe("signOut", () => {
  beforeEach(() => {
    mockSignOut.mockClear();
    mockRedirect.mockClear();
  });

  it("calls supabase.auth.signOut and redirects to login", async () => {
    try {
      await signOut();
    } catch {
      // redirect throws
    }

    expect(mockSignOut).toHaveBeenCalled();
    expect(mockRedirect).toHaveBeenCalledWith("/login");
  });
});

describe("login", () => {
  beforeEach(() => {
    mockSignInWithPassword.mockClear();
    mockRedirect.mockClear();
  });

  it("returns error for invalid form data (missing email)", async () => {
    const formData = new FormData();
    // Don't set email - formData.get("email") returns null
    formData.set("password", "password123");

    const result = await login({}, formData);

    expect(result.error).toBe("Invalid form data");
  });

  it("returns error for invalid form data (missing password)", async () => {
    const formData = new FormData();
    formData.set("email", "test@example.com");
    // Don't set password - formData.get("password") returns null

    const result = await login({}, formData);

    expect(result.error).toBe("Invalid form data");
  });

  it("returns error for empty email", async () => {
    const formData = new FormData();
    formData.set("email", "");
    formData.set("password", "password123");

    const result = await login({}, formData);

    expect(result.error).toBe("Email and password are required");
  });

  it("returns error for empty password", async () => {
    const formData = new FormData();
    formData.set("email", "test@example.com");
    formData.set("password", "");

    const result = await login({}, formData);

    expect(result.error).toBe("Email and password are required");
  });

  it("calls signInWithPassword with credentials", async () => {
    const formData = new FormData();
    formData.set("email", "test@example.com");
    formData.set("password", "password123");

    try {
      await login({}, formData);
    } catch {
      // redirect throws
    }

    expect(mockSignInWithPassword).toHaveBeenCalledWith({
      email: "test@example.com",
      password: "password123",
    });
  });

  it("returns error when signInWithPassword fails", async () => {
    mockSignInWithPassword.mockImplementationOnce(
      () => Promise.resolve({ data: {}, error: { message: "Invalid credentials" } }) as never,
    );

    const formData = new FormData();
    formData.set("email", "test@example.com");
    formData.set("password", "wrongpassword");

    const result = await login({}, formData);

    expect(result.error).toBe("Invalid credentials");
  });
});

describe("register", () => {
  beforeEach(() => {
    mockSignUp.mockClear();
    mockRedirect.mockClear();
  });

  it("returns error for invalid form data (missing email)", async () => {
    const formData = new FormData();
    // Don't set email
    formData.set("password", "password123");
    formData.set("confirmPassword", "password123");

    const result = await register({}, formData);

    expect(result.error).toBe("Invalid form data");
  });

  it("returns error for invalid form data (missing password)", async () => {
    const formData = new FormData();
    formData.set("email", "test@example.com");
    // Don't set password
    formData.set("confirmPassword", "password123");

    const result = await register({}, formData);

    expect(result.error).toBe("Invalid form data");
  });

  it("returns error for invalid form data (missing confirmPassword)", async () => {
    const formData = new FormData();
    formData.set("email", "test@example.com");
    formData.set("password", "password123");
    // Don't set confirmPassword

    const result = await register({}, formData);

    expect(result.error).toBe("Invalid form data");
  });

  it("returns error for empty fields", async () => {
    const formData = new FormData();
    formData.set("email", "");
    formData.set("password", "password123");
    formData.set("confirmPassword", "password123");

    const result = await register({}, formData);

    expect(result.error).toBe("All fields are required");
  });

  it("returns error when passwords do not match", async () => {
    const formData = new FormData();
    formData.set("email", "test@example.com");
    formData.set("password", "password123");
    formData.set("confirmPassword", "different");

    const result = await register({}, formData);

    expect(result.error).toBe("Passwords do not match");
  });

  it("returns error when password is too short", async () => {
    const formData = new FormData();
    formData.set("email", "test@example.com");
    formData.set("password", "12345");
    formData.set("confirmPassword", "12345");

    const result = await register({}, formData);

    expect(result.error).toBe("Password must be at least 6 characters");
  });

  it("calls signUp with credentials", async () => {
    const formData = new FormData();
    formData.set("email", "test@example.com");
    formData.set("password", "password123");
    formData.set("confirmPassword", "password123");

    try {
      await register({}, formData);
    } catch {
      // redirect throws
    }

    expect(mockSignUp).toHaveBeenCalledWith({
      email: "test@example.com",
      password: "password123",
    });
  });

  it("returns success message when email confirmation required", async () => {
    mockSignUp.mockImplementationOnce(
      () => Promise.resolve({ data: { user: { id: "123" }, session: null }, error: null }) as never,
    );

    const formData = new FormData();
    formData.set("email", "test@example.com");
    formData.set("password", "password123");
    formData.set("confirmPassword", "password123");

    const result = await register({}, formData);

    expect(result.success).toBe(true);
    expect(result.message).toBe("Check your email for a confirmation link.");
  });

  it("returns error when signUp fails", async () => {
    mockSignUp.mockImplementationOnce(
      () => Promise.resolve({ data: {}, error: { message: "User already exists" } }) as never,
    );

    const formData = new FormData();
    formData.set("email", "existing@example.com");
    formData.set("password", "password123");
    formData.set("confirmPassword", "password123");

    const result = await register({}, formData);

    expect(result.error).toBe("User already exists");
  });
});
