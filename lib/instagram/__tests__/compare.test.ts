import { describe, expect, it } from "vitest";
import { compare } from "../compare";

describe("compare", () => {
  const following = ["zeta", "ana", "beto", "carla", "ana"];
  const followers = ["ana", "dani"];

  it("Following − Followers, sorted and deduplicated", () => {
    const r = compare(following, followers, []);
    expect(r.notFollowingBack).toEqual(["beto", "carla", "zeta"]);
    expect(r.ignored).toEqual([]);
    expect(r.followingCount).toBe(4);
    expect(r.followersCount).toBe(2);
  });

  it("excludes the whitelist and returns it separately", () => {
    const r = compare(following, followers, ["carla", "ana", "nadie"]);
    expect(r.notFollowingBack).toEqual(["beto", "zeta"]);
    // "ana" does follow back, so it does not count as ignored.
    expect(r.ignored).toEqual(["carla"]);
  });

  it("everyone follows back", () => {
    expect(compare(["a"], ["a", "b"], []).notFollowingBack).toEqual([]);
  });
});
