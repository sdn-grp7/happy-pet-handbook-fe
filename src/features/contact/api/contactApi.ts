import { mockContactMessages } from "@/features/contact/mocks/data";
import type { ContactMessage } from "@/features/contact/types";
import { delay } from "@/shared/lib/delay";

export async function submitContactMessage(
  name: string,
  email: string,
  message: string,
): Promise<ContactMessage> {
  await delay(300);
  const msg: ContactMessage = {
    id: `cm${Date.now()}`,
    name,
    email,
    message,
    createdAt: new Date().toISOString(),
    status: "new",
  };
  mockContactMessages.unshift(msg);
  return msg;
}

export async function getContactMessages(): Promise<ContactMessage[]> {
  await delay();
  return mockContactMessages;
}
