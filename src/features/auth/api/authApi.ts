import { apiRequest } from "@/lib/api";
import type { User } from "@/features/auth/types";

export type AuthResponse = {
  token: string;
  user: User;
};

export type MeResponse = {
  user: User;
};

export async function loginWithEmail(email: string, password: string): Promise<AuthResponse> {
  return apiRequest<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: { email, password },
  });
}

export async function loginWithGoogle(idToken: string): Promise<AuthResponse> {
  return apiRequest<AuthResponse>("/api/auth/google", {
    method: "POST",
    body: { idToken },
  });
}

export async function register(
  name: string,
  email: string,
  password: string,
): Promise<AuthResponse> {
  return apiRequest<AuthResponse>("/api/auth/register", {
    method: "POST",
    body: { name, email, password },
  });
}

export async function fetchMe(token: string): Promise<User> {
  const data = await apiRequest<MeResponse>("/api/auth/me", { token });
  return data.user;
}

export async function updateProfile(
  token: string,
  patch: { name?: string; avatar?: string },
): Promise<User> {
  const data = await apiRequest<MeResponse>("/api/auth/me", {
    method: "PATCH",
    token,
    body: patch,
  });
  return data.user;
}

export async function changePassword(
  token: string,
  newPassword: string,
  currentPassword?: string,
): Promise<User> {
  const data = await apiRequest<{ message: string; user: User }>("/api/auth/change-password", {
    method: "POST",
    token,
    body: {
      newPassword,
      ...(currentPassword ? { currentPassword } : {}),
    },
  });
  return data.user;
}

export type PublicUserProfile = {
  id: string;
  name: string;
  role: "user" | "admin";
  avatar?: string;
  createdAt?: string;
  trustScore?: number;
  reviewCount?: number;
};

export async function fetchPublicProfile(userId: string): Promise<PublicUserProfile> {
  const data = await apiRequest<{ user: PublicUserProfile }>(
    `/api/auth/users/${encodeURIComponent(userId)}`,
  );
  return data.user;
}
