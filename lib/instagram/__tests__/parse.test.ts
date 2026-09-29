import { describe, expect, it } from "vitest";
import { candidateKind, extractFromJson, normalizeUsername, parseLooseFiles, parseZipEntries } from "../parse";

const sld = (value: string | undefined, href?: string) => ({
  title: "",
  media_list_data: [],
  string_list_data: [{ href: href ?? `https://www.instagram.com/${value}`, value, timestamp: 1700000000 }],
});

// Variante 1: followers como array raíz.
const followersRoot = [sld("ana.gomez"), sld("Beto_99"), sld("carla")];
// Variante 2: followers dentro de relationships_followers.
const followersObj = { relationships_followers: [sld("dani"), sld("eva")] };
// Variante 3: following clásico con value.
const followingValue = { relationships_following: [sld("ana.gomez"), sld("dani"), sld("famoso.oficial")] };
// Variante 4: following nuevo, username en title y value ausente.
const followingTitle = {
  relationships_following: [
    { title: "famoso.oficial", string_list_data: [{ href: "https://www.instagram.com/_u/famoso.oficial", timestamp: 1 }] },
    { title: "tienda.velas", string_list_data: [{ href: "https://www.instagram.com/_u/tienda.velas", timestamp: 1 }] },
  ],
};
// Variante 5: solo href (con /_u/ y sin él).
const followingHref = {
  relationships_following: [
    { title: "", string_list_data: [{ href: "https://www.instagram.com/_u/solo.href", timestamp: 1 }] },
    { title: "", string_list_data: [{ href: "https://instagram.com/otro_href/", timestamp: 1 }] },
  ],
};

const j = (v: unknown) => JSON.stringify(v);

describe("normalizeUsername", () => {
  it("recorta, pasa a minúsculas y quita la @", () => {
    expect(normalizeUsername("  @Ana.Gomez ")).toBe("ana.gomez");
  });
  it("descarta lo que no pasa la validación", () => {
    expect(normalizeUsername("<script>alert(1)</script>")).toBeNull();
    expect(normalizeUsername("a".repeat(31))).toBeNull();
    expect(normalizeUsername("")).toBeNull();
    expect(normalizeUsername(42)).toBeNull();
  });
});

describe("candidateKind", () => {
  it("acepta followers_N.json y following.json en cualquier ruta", () => {
    expect(candidateKind("connections/followers_and_following/followers_1.json")).toBe("followers");
    expect(candidateKind("a/b/FOLLOWERS_2.json")).toBe("followers");
    expect(candidateKind("x/following.json")).toBe("following");
  });
  it("excluye pending, recent, hashtag, close_friends y restricted", () => {
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
  it("ignora lo que no es .json", () => {
    expect(candidateKind("followers_1.html")).toBeNull();
  });
});

describe("extractFromJson", () => {
  it("lee followers como array raíz", () => {
    expect(extractFromJson(followersRoot, "followers")).toEqual({
      kind: "followers",
      usernames: ["ana.gomez", "beto_99", "carla"],
    });
  });
  it("lee relationships_followers", () => {
    expect(extractFromJson(followersObj, null)?.kind).toBe("followers");
  });
  it("lee following con value, con title y con solo href", () => {
    expect(extractFromJson(followingValue, null)?.usernames).toEqual(["ana.gomez", "dani", "famoso.oficial"]);
    expect(extractFromJson(followingTitle, null)?.usernames).toEqual(["famoso.oficial", "tienda.velas"]);
    expect(extractFromJson(followingHref, null)?.usernames).toEqual(["solo.href", "otro_href"]);
  });
  it("devuelve null con formatos desconocidos", () => {
    expect(extractFromJson({ some_new_key: [{ user: "x" }] }, "following")).toBeNull();
    expect(extractFromJson([{ user: "x" }], "followers")).toBeNull();
  });
  it("una lista vacía es válida", () => {
    expect(extractFromJson({ relationships_following: [] }, null)).toEqual({ kind: "following", usernames: [] });
  });
});

describe("parseZipEntries", () => {
  it("une varios followers_N.json y lee following", () => {
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
  it("not-instagram si no hay candidatos", () => {
    expect(parseZipEntries([{ name: "foo.txt", text: "" }])).toEqual({ ok: false, error: "not-instagram", html: false });
  });
  it("not-instagram con html: true si el export es HTML", () => {
    expect(parseZipEntries([{ name: "x/followers_1.html", text: "<html>" }])).toEqual({
      ok: false,
      error: "not-instagram",
      html: true,
    });
  });
  it("schema-changed si hay candidatos pero ningún formato conocido", () => {
    expect(
      parseZipEntries([
        { name: "followers_1.json", text: j({ data: { people: ["a"] } }) },
        { name: "following.json", text: j({ v2: [] }) },
      ]),
    ).toEqual({ ok: false, error: "schema-changed" });
  });
  it("not-instagram si los candidatos no son JSON válido", () => {
    expect(parseZipEntries([{ name: "followers_1.json", text: "{roto" }])).toEqual({
      ok: false,
      error: "not-instagram",
    });
  });
  it("devuelve null en la lista que falta", () => {
    const r = parseZipEntries([{ name: "followers_1.json", text: j(followersRoot) }]);
    expect(r.ok && r.lists.following).toBeNull();
  });
});

describe("parseLooseFiles", () => {
  it("detecta el tipo por contenido aunque el archivo esté renombrado", () => {
    const r = parseLooseFiles([
      { name: "a.json", text: j(followingValue) },
      { name: "b.json", text: j(followersRoot) },
    ]);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.lists.following).toHaveLength(3);
    expect(r.lists.followers).toHaveLength(3);
  });
  it("un único json devuelve solo una lista", () => {
    const r = parseLooseFiles([{ name: "following.json", text: j(followingValue) }]);
    expect(r.ok && r.lists.followers).toBeNull();
  });
  it("un html suelto es not-instagram con html", () => {
    expect(parseLooseFiles([{ name: "followers_1.html", text: "<html>" }])).toMatchObject({ html: true });
  });
});
