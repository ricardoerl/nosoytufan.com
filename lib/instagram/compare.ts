export interface Comparison {
  /** Following − Followers − Whitelist, en orden alfabético. */
  notFollowingBack: string[];
  /** Following − Followers que están en la whitelist, en orden alfabético. */
  ignored: string[];
  followingCount: number;
  followersCount: number;
}

const byName = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);

export function compare(following: string[], followers: string[], whitelist: Iterable<string>): Comparison {
  const followersSet = new Set(followers);
  const whitelistSet = new Set(whitelist);
  const uniqueFollowing = [...new Set(following)];
  const notFollowingBack: string[] = [];
  const ignored: string[] = [];
  for (const u of uniqueFollowing) {
    if (followersSet.has(u)) continue;
    (whitelistSet.has(u) ? ignored : notFollowingBack).push(u);
  }
  return {
    notFollowingBack: notFollowingBack.sort(byName),
    ignored: ignored.sort(byName),
    followingCount: uniqueFollowing.length,
    followersCount: followersSet.size,
  };
}
