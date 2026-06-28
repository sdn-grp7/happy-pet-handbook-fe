import type { PetListing } from "@/types/modules";

/** Unique Unsplash photos — one per pet, verified URLs (404s fall back to same image). */
const PET_PHOTOS = {
  luna: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&h=600&fit=crop&q=80",
  mochi: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800&h=600&fit=crop&q=80",
  buddy: "https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=800&h=600&fit=crop&q=80",
  coco: "https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?w=800&h=600&fit=crop&q=80",
  whiskers:
    "https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=800&h=600&fit=crop&q=80",
  pepper: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800&h=600&fit=crop&q=80",
} as const;

/** Pickup spots across HCMC — lat/lng aligned with real districts for Goong Maps. */
export const mockPets: PetListing[] = [
  {
    id: "pet1",
    name: "Luna",
    species: "dog",
    breed: "Mixed (medium)",
    age: "2 years",
    description:
      "Sweet, leash-trained girl who loves fetch and naps in sunbeams. Good with calm dogs.",
    images: [PET_PHOTOS.luna],
    status: "available",
    postedById: "u3",
    postedByName: "PawPath Rescue",
    pickup: {
      address: "Công viên 23/9, Quận 1, TP.HCM",
      lat: 10.7929,
      lng: 106.6938,
      x: 0,
      y: 0,
    },
  },
  {
    id: "pet2",
    name: "Mochi",
    species: "cat",
    breed: "Domestic shorthair",
    age: "8 months",
    description: "Playful kitten, litter-box trained. Prefers a quiet home without dogs.",
    images: [PET_PHOTOS.mochi],
    status: "available",
    postedById: "u3",
    postedByName: "PawPath Rescue",
    pickup: {
      address: "Hồ Con Rùa, Quận 3, TP.HCM",
      lat: 10.7863,
      lng: 106.6917,
      x: 0,
      y: 0,
    },
  },
  {
    id: "pet3",
    name: "Buddy",
    species: "dog",
    breed: "Golden Retriever mix",
    age: "4 years",
    description: "Gentle giant, knows sit/stay/come. Needs a yard and daily walks.",
    images: [PET_PHOTOS.buddy],
    status: "pending",
    postedById: "u2",
    postedByName: "Maya & Biscuit",
    pickup: {
      address: "Crescent Mall, Quận 7, TP.HCM",
      lat: 10.7287,
      lng: 106.7183,
      x: 0,
      y: 0,
    },
  },
  {
    id: "pet4",
    name: "Coco",
    species: "dog",
    breed: "Rescue mix",
    age: "3 years",
    description: "Beach-loving zoomie machine. Adopted — check-in program active.",
    images: [PET_PHOTOS.coco],
    status: "adopted",
    postedById: "u5",
    postedByName: "Sofia Nguyen",
    pickup: {
      address: "Công viên Sala, Quận 2, TP.HCM",
      lat: 10.7714,
      lng: 106.7264,
      x: 0,
      y: 0,
    },
  },
  {
    id: "pet5",
    name: "Whiskers",
    species: "cat",
    breed: "Tabby",
    age: "1 year",
    description: "Cuddly and chatty. Loves window perches and feather toys.",
    images: [PET_PHOTOS.whiskers],
    status: "available",
    postedById: "u4",
    postedByName: "Leo Tran",
    pickup: {
      address: "Chợ Bình Tây, Quận 6, TP.HCM",
      lat: 10.7493,
      lng: 106.6514,
      x: 0,
      y: 0,
    },
  },
  {
    id: "pet6",
    name: "Pepper",
    species: "dog",
    breed: "Small mix",
    age: "6 months",
    description: "Puppy energy! Crate trained, working on house training.",
    images: [PET_PHOTOS.pepper],
    status: "available",
    postedById: "u3",
    postedByName: "PawPath Rescue",
    pickup: {
      address: "266 Lý Thường Kiệt, Quận 10, TP.HCM",
      lat: 10.7734,
      lng: 106.6688,
      x: 0,
      y: 0,
    },
  },
];

export function getPetById(id: string) {
  return mockPets.find((p) => p.id === id);
}

export function getAvailablePets() {
  return mockPets.filter((p) => p.status === "available");
}

export function getPickupLocations() {
  return mockPets.filter((p) => p.status === "available" || p.status === "pending");
}
