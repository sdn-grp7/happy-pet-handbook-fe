import type { User } from "@/types/modules";

export const mockUsers: User[] = [
  {
    id: "u1",
    email: "alex.nguyen@email.com",
    name: "Alex Nguyen",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alex",
    role: "user",
    createdAt: "2025-01-15T08:00:00Z",
  },
  {
    id: "u2",
    email: "maya@example.com",
    name: "Maya & Biscuit",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=maya",
    role: "user",
    googleId: "google-maya",
    createdAt: "2024-11-02T10:30:00Z",
  },
  {
    id: "u3",
    email: "admin@pawpath.guide",
    name: "PawPath Admin",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin",
    role: "admin",
    createdAt: "2024-06-01T00:00:00Z",
  },
  {
    id: "u4",
    email: "leo@example.com",
    name: "Leo Tran",
    role: "user",
    createdAt: "2025-02-20T14:00:00Z",
  },
  {
    id: "u5",
    email: "sofia@example.com",
    name: "Sofia Nguyen",
    role: "user",
    googleId: "google-sofia",
    createdAt: "2025-03-10T09:15:00Z",
  },
];

export const DEMO_CREDENTIALS = {
  email: "alex.nguyen@email.com",
  password: "demo1234",
};
