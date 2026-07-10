import type { ContactMessage } from "@/features/contact/types";

export const mockContactMessages: ContactMessage[] = [
  {
    id: "cm1",
    name: "Anna",
    email: "anna@example.com",
    message: "How often should I bathe my short-haired dog?",
    createdAt: "2025-06-10T14:00:00Z",
    status: "resolved",
  },
  {
    id: "cm2",
    name: "James",
    email: "james@example.com",
    message: "Is PawPath adoption available outside Ho Chi Minh City?",
    createdAt: "2025-06-18T09:30:00Z",
    status: "new",
  },
];
