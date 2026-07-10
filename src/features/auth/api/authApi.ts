import { DEMO_CREDENTIALS, mockUsers } from "@/features/auth/mocks/data";
import type { User } from "@/features/auth/types";
import { delay } from "@/shared/lib/delay";

export async function loginWithEmail(email: string, password: string): Promise<User | null> {
  await delay();
  if (email === DEMO_CREDENTIALS.email && password === DEMO_CREDENTIALS.password) {
    return mockUsers.find((u) => u.email === email) ?? null;
  }
  const user = mockUsers.find((u) => u.email === email);
  return user && password.length >= 6 ? user : null;
}

export async function loginWithGoogle(): Promise<User> {
  await delay(400);
  return mockUsers.find((u) => u.googleId) ?? mockUsers[0];
}

export async function register(name: string, email: string, _password: string): Promise<User> {
  await delay();
  return {
    id: `u${Date.now()}`,
    email,
    name,
    role: "user",
    createdAt: new Date().toISOString(),
  };
}

export async function getUserById(id: string): Promise<User | undefined> {
  await delay();
  return mockUsers.find((u) => u.id === id);
}
