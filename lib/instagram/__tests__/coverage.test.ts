import { describe, expect, it } from "vitest";
import { MAX_LIMITED_RANGE_SECONDS, MIN_GAP_SECONDS, partialFollowersSince } from "../coverage";
import { parseZipEntries } from "../parse";

const DAY = 24 * 60 * 60;
const NOW = 1_790_000_000;
const lists = (followers: number | null, following: number | null, newest: number | null = NOW) => ({
  oldest: { followers, following },
  newest,
});
const at = (value: string, timestamp: number) => ({ string_list_data: [{ value, timestamp }] });

describe("partialFollowersSince", () => {
  it("flags followers limited to the last months while following goes back years", () => {
    const since = NOW - 90 * DAY;
    expect(partialFollowersSince(lists(since, NOW - 14 * 365 * DAY))).toBe(since);
  });

  it("does not flag a complete export where the oldest follower is years old", () => {
    // Followed people since 2012, oldest remaining follower from 2014: normal, not a cut-off.
    expect(partialFollowersSince(lists(NOW - 12 * 365 * DAY, NOW - 14 * 365 * DAY))).toBeNull();
  });

  it("does not flag a young account where both lists are recent", () => {
    expect(partialFollowersSince(lists(NOW - 60 * DAY, NOW - 80 * DAY))).toBeNull();
  });

  it("respects both thresholds", () => {
    const since = NOW - MAX_LIMITED_RANGE_SECONDS;
    expect(partialFollowersSince(lists(since, since - MIN_GAP_SECONDS))).toBeNull();
    expect(partialFollowersSince(lists(since, since - MIN_GAP_SECONDS - DAY))).toBe(since);
    expect(partialFollowersSince(lists(since - DAY, since - 5 * 365 * DAY))).toBeNull();
  });

  it("does not flag when timestamps are missing", () => {
    expect(partialFollowersSince(lists(null, NOW))).toBeNull();
    expect(partialFollowersSince(lists(NOW, null))).toBeNull();
    expect(partialFollowersSince(lists(NOW, NOW - 900 * DAY, null))).toBeNull();
  });

  it("detects the case end to end from a zip", () => {
    const r = parseZipEntries([
      {
        name: "connections/followers_and_following/followers_1.json",
        text: JSON.stringify([at("nuevo.fan", NOW - 30 * DAY), at("otro.fan", NOW - 2 * DAY)]),
      },
      {
        name: "connections/followers_and_following/following.json",
        text: JSON.stringify({
          relationships_following: [at("viejo.amigo", NOW - 5 * 365 * DAY), at("nuevo.fan", NOW - DAY)],
        }),
      },
    ]);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.lists.newest).toBe(NOW - DAY);
    expect(partialFollowersSince(r.lists)).toBe(NOW - 30 * DAY);
  });
});
