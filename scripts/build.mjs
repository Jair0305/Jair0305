// Renders every profile SVG into ./assets.
//   node scripts/build.mjs            → static art + telemetry (needs GITHUB_TOKEN)
//   node scripts/build.mjs --static   → static art only
import { mkdirSync, writeFileSync } from "node:fs";
import { profile } from "./data.mjs";
import { renderHeader, renderRoute, renderStack, renderTelemetry, themes } from "./render.mjs";

const OUT = new URL("../assets/", import.meta.url);
mkdirSync(OUT, { recursive: true });

function write(name, render) {
  for (const th of Object.values(themes)) {
    const file = `${name}-${th.name}.svg`;
    writeFileSync(new URL(file, OUT), render(th));
    console.log(`✓ assets/${file}`);
  }
}

write("header", renderHeader);
write("route", renderRoute);
write("stack", renderStack);

if (process.argv.includes("--static")) process.exit(0);

const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
if (!token) {
  console.warn("⚠ GITHUB_TOKEN not set — telemetry skipped, existing SVGs kept.");
  process.exit(0);
}

async function gql(query, variables) {
  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: { Authorization: `bearer ${token}`, "Content-Type": "application/json", "User-Agent": `${profile.login}-profile` },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (!res.ok || json.errors) throw new Error(`GraphQL: ${JSON.stringify(json.errors ?? json)}`);
  return json.data;
}

const { user } = await gql(
  `query($login: String!) {
    user(login: $login) {
      createdAt
      publicRepos: repositories(ownerAffiliations: OWNER, privacy: PUBLIC) { totalCount }
      contributionsCollection {
        totalPullRequestContributions
        contributionCalendar { totalContributions weeks { contributionDays { date contributionCount } } }
      }
    }
  }`,
  { login: profile.login },
);

// Owned, non-fork repos (private ones too when the token can see them) for the language spectrum.
const repos = [];
for (let cursor = null; ; ) {
  const { user: page } = await gql(
    `query($login: String!, $cursor: String) {
      user(login: $login) {
        repositories(first: 100, after: $cursor, ownerAffiliations: OWNER, isFork: false) {
          pageInfo { hasNextPage endCursor }
          nodes { languages(first: 12, orderBy: { field: SIZE, direction: DESC }) { edges { size node { name color } } } }
        }
      }
    }`,
    { login: profile.login, cursor },
  );
  repos.push(...page.repositories.nodes);
  if (!page.repositories.pageInfo.hasNextPage) break;
  cursor = page.repositories.pageInfo.endCursor;
}

const cal = user.contributionsCollection.contributionCalendar;
const days = cal.weeks.flatMap((w) => w.contributionDays);

let longestStreak = 0;
let run = 0;
for (const d of days) {
  run = d.contributionCount > 0 ? run + 1 : 0;
  longestStreak = Math.max(longestStreak, run);
}

// Markup languages inflate byte counts without saying much about the work.
const IGNORED = new Set(["HTML", "CSS", "SCSS", "Jupyter Notebook", "Dockerfile", "Makefile", "Batchfile", "PowerShell"]);
const bytes = new Map();
for (const repo of repos) {
  for (const { size, node } of repo.languages.edges) {
    if (IGNORED.has(node.name)) continue;
    const prev = bytes.get(node.name) ?? { size: 0, color: node.color ?? "#8b949e" };
    bytes.set(node.name, { ...prev, size: prev.size + size });
  }
}
const totalBytes = [...bytes.values()].reduce((a, b) => a + b.size, 0) || 1;
const languages = [...bytes.entries()]
  .sort((a, b) => b[1].size - a[1].size)
  .slice(0, 6)
  .map(([name, { size, color }]) => ({ name, color, share: (size / totalBytes) * 100 }));

const telemetry = {
  total: cal.totalContributions,
  weeks: cal.weeks.map((w) => ({ start: w.contributionDays[0].date, count: w.contributionDays.reduce((a, d) => a + d.contributionCount, 0) })),
  activeDays: days.filter((d) => d.contributionCount > 0).length,
  longestStreak,
  pullRequests: user.contributionsCollection.totalPullRequestContributions,
  publicRepos: user.publicRepos.totalCount,
  since: new Date(user.createdAt).getUTCFullYear(),
  languages,
  syncedAt: new Date().toISOString().slice(0, 10),
};

write("telemetry", (th) => renderTelemetry(th, telemetry));
