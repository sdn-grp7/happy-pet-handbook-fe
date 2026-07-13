import { apiRequest } from "@/lib/api";
import type { ContactMessage } from "@/features/contact/types";

type ContactListResponse = { messages: ContactMessage[] };
type ContactResolveResponse = { message: ContactMessage };

export async function submitContactMessage(
  name: string,
  email: string,
  message: string,
): Promise<{ id: string }> {
  return apiRequest<{ message: string; id: string }>("/api/contact", {
    method: "POST",
    body: { name, email, message },
  });
}

export async function getContactMessages(token: string): Promise<ContactMessage[]> {
  const data = await apiRequest<ContactListResponse>("/api/contact/admin/all", { token });
  return data.messages ?? [];
}

export async function resolveContactMessage(
  token: string,
  id: string,
  status: "new" | "resolved" = "resolved",
): Promise<ContactMessage> {
  const data = await apiRequest<ContactResolveResponse>(`/api/contact/${encodeURIComponent(id)}`, {
    method: "PATCH",
    token,
    body: { status },
  });
  return data.message;
}
