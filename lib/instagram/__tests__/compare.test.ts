import { describe, expect, it } from "vitest";
import { compare } from "../compare";

describe("compare", () => {
  const following = ["zeta", "ana", "beto", "carla", "ana"];
  const followers = ["ana", "dani"];

  it("Following − Followers, ordenado y sin duplicados", () => {
    const r = compare(following, followers, []);
    expect(r.notFollowingBack).toEqual(["beto", "carla", "zeta"]);
    expect(r.ignored).toEqual([]);
    expect(r.followingCount).toBe(4);
    expect(r.followersCount).toBe(2);
  });

  it("excluye la whitelist y la devuelve aparte", () => {
    const r = compare(following, followers, ["carla", "ana", "nadie"]);
    expect(r.notFollowingBack).toEqual(["beto", "zeta"]);
    // "ana" sí te sigue, así que no cuenta como ignorada.
    expect(r.ignored).toEqual(["carla"]);
  });

  it("todos te siguen", () => {
    expect(compare(["a"], ["a", "b"], []).notFollowingBack).toEqual([]);
  });
});
