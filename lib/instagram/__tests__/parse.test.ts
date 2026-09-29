import { describe, expect, it } from "vitest";
import { candidateKind, extractFromJson, normalizeUsername, parseLooseFiles, parseZipEntries } from "../parse";

const sld = (value: string | undefined, href?: string) => ({
  title: "",
  media_list_data: [],
  string_list_data: [{ href: href ?? `https://www.instagram.com/${value}`, value, timestamp: 1700000000 }],
});

// Variant 1: followers as a root array.
const followersRoot = [sld("ana.gomez"), sld("Beto_99"), sld("carla")];
// Variant 2: followers inside relationships_followers.
const followersObj = { relationships_followers: [sld("dani"), sld("eva")] };
// Variant 3: classic following with value.
const followingValue = { relationships_following: [sld("ana.gomez"), sld("dani"), sld("famoso.oficial")] };
// Variant 4: newer following, username in title and no value.
const followingTitle = {
  relationships_following: [
    { title: "famoso.oficial", string_list_data: [{ href: "https://www.instagram.com/_u/famoso.oficial", timestamp: 1 }] },
    { title: "tienda.velas", string_list_data: [{ href: "https://www.instagram.com/_u/tienda.velas", timestamp: 1 }] },
  ],
};
// Variant 5: href only (with and without /_u/).
const followingHref = {
  relationships_following: [
    { title: "", string_list_data: [{ href: "https://www.instagram.com/_u/solo.href", timestamp: 1 }] },
    { title: "", string_list_data: [{ href: "https://instagram.com/otro_href/", timestamp: 1 }] },
  ],
};

const j = (v: unknown) => JSON.stringify(v);

describe("normalizeUsername", () => {
  it("trims, lowercases and strips the @", () => {
    expect(normalizeUsername("  @Ana.Gomez ")).toBe("ana.gomez");
  });
  it("drops anything that fails validation", () => {
    expect(normalizeUsername("<script>alert(1)</script>")).toBeNull();
    expect(normalizeUsername("a".repeat(31))).toBeNull();
    expect(normalizeUsername("")).toBeNull();
    expect(normalizeUsername(42)).toBeNull();
  });
});

describe("candidateKind", () => {
  it("accepts followers_N.json and following.json at any path", () => {
    expect(candidateKind("connections/followers_and_following/followers_1.json")).toBe("followers");
    expect(candidateKind("a/b/FOLLOWERS_2.json")).toBe("followers");
    expect(candidateKind("x/following.json")).toBe("following");
  });
  it("excludes pending, recent, hashtag, close_friends and restricted", () => {
    for (const n of [
      "pending_follow_requests.json",
      "recent_follow_requests.json",
      "following_hashtags.json",
      "close_friends.json",
      "restricted_profiles.json",
      "recently_unfollowed_accounts.json",
    ]) {
      expect(candidateKind(n)).toBeNull();
    }
  });
  it("ignores non-.json files", () => {
    expect(candidateKind("followers_1.html")).toBeNull();
  });
});

describe("extractFromJson", () => {
  it("reads followers as a root array", () => {
    expect(extractFromJson(followersRoot, "followers")).toEqual({
      kind: "followers",
      usernames: ["ana.gomez", "beto_99", "carla"],
    });
  });
  it("reads relationships_followers", () => {
    expect(extractFromJson(followersObj, null)?.kind).toBe("followers");
  });
  it("reads following with value, with title and with href only", () => {
    expect(extractFromJson(followingValue, null)?.usernames).toEqual(["ana.gomez", "dani", "famoso.oficial"]);
    expect(extractFromJson(followingTitle, null)?.usernames).toEqual(["famoso.oficial", "tienda.velas"]);
    expect(extractFromJson(followingHref, null)?.usernames).toEqual(["solo.href", "otro_href"]);
  });
  it("returns null for unknown formats", () => {
    expect(extractFromJson({ some_new_key: [{ user: "x" }] }, "following")).toBeNull();
    expect(extractFromJson([{ user: "x" }], "followers")).toBeNull();
  });
  it("an empty list is valid", () => {
    expect(extractFromJson({ relationships_following: [] }, null)).toEqual({ kind: "following", usernames: [] });
  });
});

describe("parseZipEntries", () => {
  it("merges multiple followers_N.json and reads following", () => {
    const r = parseZipEntries([
      { name: "connections/followers_and_following/followers_1.json", text: j(followersRoot) },
      { name: "connections/followers_and_following/followers_2.json", text: j([sld("zoe")]) },
      { name: "connections/followers_and_following/following.json", text: j(followingTitle) },
      { name: "connections/followers_and_following/pending_follow_requests.json", text: j(followingValue) },
      { name: "media/photo.jpg", text: "" },
    ]);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.lists.followers).toEqual(["ana.gomez", "beto_99", "carla", "zoe"]);
    expect(r.lists.following).toEqual(["famoso.oficial", "tienda.velas"]);
    expect(r.lists.files).toEqual(["followers_1.json", "followers_2.json", "following.json"]);
  });
  it("not-instagram when there are no candidates", () => {
    expect(parseZipEntries([{ name: "foo.txt", text: "" }])).toEqual({ ok: false, error: "not-instagram", html: false });
  });
  it("not-instagram with html: true for an HTML export", () => {
    expect(parseZipEntries([{ name: "x/followers_1.html", text: "<html>" }])).toEqual({
      ok: false,
      error: "not-instagram",
      html: true,
    });
  });
  it("schema-changed when candidates exist but none has a known format", () => {
    expect(
      parseZipEntries([
        { name: "followers_1.json", text: j({ data: { people: ["a"] } }) },
        { name: "following.json", text: j({ v2: [] }) },
      ]),
    ).toEqual({ ok: false, error: "schema-changed" });
  });
  it("not-instagram when candidates are not valid JSON", () => {
    expect(parseZipEntries([{ name: "followers_1.json", text: "{roto" }])).toEqual({
      ok: false,
      error: "not-instagram",
    });
  });
  it("returns null for the missing list", () => {
    const r = parseZipEntries([{ name: "followers_1.json", text: j(followersRoot) }]);
    expect(r.ok && r.lists.following).toBeNull();
  });
});

describe("parseLooseFiles", () => {
  it("detects the kind from content even if the file was renamed", () => {
    const r = parseLooseFiles([
      { name: "a.json", text: j(followingValue) },
      { name: "b.json", text: j(followersRoot) },
    ]);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.lists.following).toHaveLength(3);
    expect(r.lists.followers).toHaveLength(3);
  });
  it("a single json returns only one list", () => {
    const r = parseLooseFiles([{ name: "following.json", text: j(followingValue) }]);
    expect(r.ok && r.lists.followers).toBeNull();
  });
  it("a loose html file is not-instagram with html", () => {
    expect(parseLooseFiles([{ name: "followers_1.html", text: "<html>" }])).toMatchObject({ html: true });
  });
});
