"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/core/supabase/server";

export interface RegisterState {
  error?: string;
  success?: boolean;
  message?: string;
}

export async function register(
  _prevState: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const supabase = await createClient();

  const email = formData.get("email");
  const password = formData.get("password");
  const confirmPassword = formData.get("confirmPassword");

  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    typeof confirmPassword !== "string"
  ) {
    return { error: "Invalid form data" };
  }

  if (!email || !password || !confirmPassword) {
    return { error: "All fields are required" };
  }

  if (password !== confirmPassword) {
    return { error: "Passwords do not match" };
  }

  if (password.length < 6) {
    return { error: "Password must be at least 6 characters" };
  }

  const { error, data } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  // Check if email confirmation is required
  if (data.user && !data.session) {
    return {
      success: true,
      message: "Check your email for a confirmation link.",
    };
  }

  // If session exists, user is confirmed (email confirmation disabled)
  redirect("/dashboard");
}
