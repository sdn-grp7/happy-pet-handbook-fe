import { apiRequest } from "@/lib/api";
import type { AdoptionRequest } from "@/features/adoption/types";

type RequestsResponse = { requests: AdoptionRequest[] };
type RequestResponse = { request: AdoptionRequest };
type OkResponse = { ok: boolean };

export async function getMyAdoptionRequests(token: string): Promise<AdoptionRequest[]> {
  const data = await apiRequest<RequestsResponse>("/api/adoption", { token });
  return data.requests ?? [];
}

export async function getIncomingAdoptionRequests(token: string): Promise<AdoptionRequest[]> {
  const data = await apiRequest<RequestsResponse>("/api/adoption/incoming", { token });
  return data.requests ?? [];
}

export async function getAllAdoptionRequests(token: string): Promise<AdoptionRequest[]> {
  const data = await apiRequest<RequestsResponse>("/api/adoption", { token });
  return data.requests ?? [];
}

export async function submitAdoptionRequest(
  token: string,
  petId: string,
  message: string,
): Promise<AdoptionRequest> {
  const data = await apiRequest<RequestResponse>("/api/adoption", {
    method: "POST",
    token,
    body: { petId, message },
  });
  return data.request;
}

export async function confirmAdoptionRequest(
  token: string,
  requestId: string,
): Promise<AdoptionRequest> {
  const data = await apiRequest<RequestResponse>(
    `/api/adoption/${encodeURIComponent(requestId)}/confirm`,
    { method: "POST", token },
  );
  return data.request;
}

export async function deleteAdoptionRequest(token: string, requestId: string): Promise<void> {
  await apiRequest<OkResponse>(`/api/adoption/${encodeURIComponent(requestId)}`, {
    method: "DELETE",
    token,
  });
}
