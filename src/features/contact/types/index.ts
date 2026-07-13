export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
  status: "new" | "resolved";
  resolvedAt?: string;
  updatedAt?: string;
}
