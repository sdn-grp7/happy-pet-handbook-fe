import { apiRequest } from "@/lib/api";

/** Upload avatar via backend Cloudinary (signed — no unsigned preset). */
export async function uploadAvatarToCloudinary(token: string, file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", "pawpath/avatars");

  const data = await apiRequest<{ url: string }>("/api/uploads/image", {
    method: "POST",
    token,
    body: formData,
  });

  if (!data.url) {
    throw new Error("Unable to upload avatar.");
  }
  return data.url;
}
