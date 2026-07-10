import type { User } from "@/features/auth/types";

/** Routes anyone can open (read-only or public actions). */
export const PUBLIC_PATHS = [
  "/",
  "/basics",
  "/nutrition",
  "/training",
  "/health",
  "/adoption",
  "/map",
  "/forum",
  "/community",
  "/reputation",
  "/contact",
  "/login",
] as const;

/** Routes that require a signed-in user. */
export const AUTH_PATHS = ["/profile", "/post-adoption"] as const;

export type GuestCapability =
  | "read_guides"
  | "browse_adoption"
  | "view_pickup_map"
  | "read_forum"
  | "read_reputation"
  | "send_contact";

export type AuthCapability =
  | "manage_profile"
  | "submit_adoption"
  | "post_forum"
  | "reply_forum"
  | "upvote_forum"
  | "view_pet_history"
  | "post_adoption_checkin";

export const GUEST_CAPABILITIES: { key: GuestCapability; label: string; path: string }[] = [
  { key: "read_guides", label: "Read pet care guides", path: "/basics" },
  { key: "browse_adoption", label: "Browse adoption listings", path: "/adoption" },
  { key: "view_pickup_map", label: "View pickup locations on map", path: "/map" },
  { key: "read_forum", label: "Read forum threads", path: "/forum" },
  { key: "read_reputation", label: "View public trust profiles", path: "/reputation" },
  { key: "send_contact", label: "Send a support message", path: "/contact" },
];

export const AUTH_CAPABILITIES: { key: AuthCapability; label: string; path: string }[] = [
  { key: "manage_profile", label: "Profile & adoption requests", path: "/profile" },
  { key: "submit_adoption", label: "Submit adoption requests", path: "/adoption" },
  { key: "post_forum", label: "Start forum discussions", path: "/forum" },
  { key: "reply_forum", label: "Reply to threads", path: "/forum" },
  { key: "upvote_forum", label: "Upvote helpful posts", path: "/forum" },
  { key: "view_pet_history", label: "View pet medical & ownership history", path: "/adoption" },
  { key: "post_adoption_checkin", label: "Submit post-adoption check-ins", path: "/post-adoption" },
];

export function isAuthenticated(user: User | null): user is User {
  return user !== null;
}

export function canSubmitAdoption(user: User | null) {
  return isAuthenticated(user);
}

export function canInteractForum(user: User | null) {
  return isAuthenticated(user);
}

export function canViewPetHistory(user: User | null) {
  return isAuthenticated(user);
}

export function canAccessPostAdoption(user: User | null) {
  return isAuthenticated(user);
}
