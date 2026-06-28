/**
 * Mock API layer — mirrors BE Feature Modules.
 * Replace with real HTTP calls when backend is ready.
 */

import { DEMO_CREDENTIALS, mockUsers } from "@/mocks/auth";
import { mockGuides, getGuideBySlug } from "@/mocks/guides";
import { mockForumThreads, FORUM_TOPICS } from "@/mocks/forum";
import { mockPets, getPetById, getAvailablePets, getPickupLocations } from "@/mocks/pets";
import { mockAdoptionRequests } from "@/mocks/adoption";
import { mockPetHistory, getHistoryByPetId } from "@/mocks/petHistory";
import { mockReputationProfiles, getReputationByUserId } from "@/mocks/reputation";
import { mockPostAdoptionCheckIns, getCheckInsByPetId } from "@/mocks/postAdoption";
import { mockContactMessages } from "@/mocks/contact";
import type {
  User,
  GuideArticle,
  ForumThread,
  PetListing,
  AdoptionRequest,
  PetHistoryEvent,
  ReputationProfile,
  PostAdoptionCheckIn,
  ContactMessage,
} from "@/types/modules";

const delay = (ms = 200) => new Promise((r) => setTimeout(r, ms));

// --- Auth Module ---
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

// --- Guides Module ---
export async function getGuides(): Promise<GuideArticle[]> {
  await delay();
  return mockGuides.filter((g) => g.published);
}

export async function getGuide(slug: string): Promise<GuideArticle | undefined> {
  await delay();
  return getGuideBySlug(slug);
}

// --- Forum Module ---
export async function getForumThreads(): Promise<ForumThread[]> {
  await delay();
  return [...mockForumThreads].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export { FORUM_TOPICS };

// --- Pets Module ---
export async function getPets(): Promise<PetListing[]> {
  await delay();
  return mockPets;
}

export async function getAvailablePetListings(): Promise<PetListing[]> {
  await delay();
  return getAvailablePets();
}

export async function getPet(id: string): Promise<PetListing | undefined> {
  await delay();
  return getPetById(id);
}

export async function getPetPickupLocations(): Promise<PetListing[]> {
  await delay();
  return getPickupLocations();
}

// --- Adoption Module ---
export async function getAdoptionRequests(userId?: string): Promise<AdoptionRequest[]> {
  await delay();
  if (userId) return mockAdoptionRequests.filter((a) => a.adopterId === userId);
  return mockAdoptionRequests;
}

export async function submitAdoptionRequest(
  petId: string,
  adopter: User,
  message: string,
): Promise<AdoptionRequest> {
  await delay(300);
  const pet = getPetById(petId);
  const req: AdoptionRequest = {
    id: `ad${Date.now()}`,
    petId,
    petName: pet?.name ?? "Unknown",
    adopterId: adopter.id,
    adopterName: adopter.name,
    message,
    status: "pending",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  mockAdoptionRequests.unshift(req);
  return req;
}

// --- Pet History Module ---
export async function getPetHistory(petId: string): Promise<PetHistoryEvent[]> {
  await delay();
  return getHistoryByPetId(petId);
}

export async function getAllPetHistory(): Promise<PetHistoryEvent[]> {
  await delay();
  return mockPetHistory;
}

// --- Reputation Module ---
export async function getReputationProfiles(): Promise<ReputationProfile[]> {
  await delay();
  return mockReputationProfiles;
}

export async function getReputation(userId: string): Promise<ReputationProfile | undefined> {
  await delay();
  return getReputationByUserId(userId);
}

// --- Post-Adoption Module ---
export async function getPostAdoptionCheckIns(petId?: string): Promise<PostAdoptionCheckIn[]> {
  await delay();
  if (petId) return getCheckInsByPetId(petId);
  return mockPostAdoptionCheckIns;
}

export async function getPostAdoptionCheckInsForUser(
  userId: string,
): Promise<PostAdoptionCheckIn[]> {
  await delay();
  const adoptionIds = mockAdoptionRequests.filter((a) => a.adopterId === userId).map((a) => a.id);
  return mockPostAdoptionCheckIns.filter((c) => adoptionIds.includes(c.adoptionId));
}

export async function submitCheckIn(
  checkInId: string,
  healthReport: string,
  photoUrl?: string,
): Promise<PostAdoptionCheckIn | undefined> {
  await delay(300);
  const checkIn = mockPostAdoptionCheckIns.find((c) => c.id === checkInId);
  if (!checkIn) return undefined;
  checkIn.status = "submitted";
  checkIn.healthReport = healthReport;
  checkIn.photoUrl = photoUrl;
  checkIn.submittedAt = new Date().toISOString();
  return checkIn;
}

// --- Contact Module ---
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
