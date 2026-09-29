import type { ParsedLists } from "./parse";

const DAY = 24 * 60 * 60;

/** Longest date range Instagram offers besides "All time" is one year; allow some slack. */
export const MAX_LIMITED_RANGE_SECONDS = 400 * DAY;
/** Following must reach this much further back than followers before we suspect a cut-off. */
export const MIN_GAP_SECONDS = 90 * DAY;

/**
 * Detects an export requested with a date range instead of "All time". In that case Instagram
 * only includes followers gained within the range, so people who do follow you back show up as
 * not following back.
 *
 * A complete export can legitimately have a gap between the first account you followed and your
 * oldest remaining follower, so the gap alone is not enough: we also require every follower to
 * fall within the last year of the export (the longest limited range), while following reaches
 * well before that.
 *
 * Returns the date (Unix seconds) the followers list starts at, or null when the export looks
 * complete or there is not enough data to tell.
 */
export function partialFollowersSince(lists: Pick<ParsedLists, "oldest" | "newest">): number | null {
  const { oldest, newest } = lists;
  if (oldest.followers === null || oldest.following === null || newest === null) return null;
  const followersSpan = newest - oldest.followers;
  const gap = oldest.followers - oldest.following;
  return followersSpan <= MAX_LIMITED_RANGE_SECONDS && gap > MIN_GAP_SECONDS ? oldest.followers : null;
}
