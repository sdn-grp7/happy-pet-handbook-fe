import { apiRequest } from "@/lib/api";

/** Upload an image via the backend (signed Cloudinary — no unsigned preset). */
export async function uploadCareImage(
  token: string,
  file: File,
  folder = "pawpath/care",
): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);

  const data = await apiRequest<{ url: string }>("/api/uploads/image", {
    method: "POST",
    token,
    body: formData,
  });

  if (!data.url) {
    throw new Error("Upload did not return an image URL.");
  }
  return data.url;
}
