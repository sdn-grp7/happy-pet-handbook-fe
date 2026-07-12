import { mockForumThreads, FORUM_TOPICS } from "@/features/forum/mocks/data";
import type { ForumThread } from "@/features/forum/types";
import { delay } from "@/shared/lib/delay";

export async function getForumThreads(): Promise<ForumThread[]> {
  await delay();
  return [...mockForumThreads].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export { FORUM_TOPICS };
