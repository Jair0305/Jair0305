// Content for the generated profile SVGs.
// Source of truth for the story is the portfolio (jair.nightly.mx → src/content/*).
// Edit here, then run `node scripts/build.mjs` (or let the workflow do it).

export const profile = {
  login: "Jair0305",
  name: "Jair Chávez Islas",
  eyebrow: "FULLSTACK DEVELOPER  ·  PARTNER @ NIGHTLYSOFTWARE",
  subtitle: ["Backend, product & infrastructure along a", "non-linear, very human route."],
  location: "Guanajuato, MX",
  portfolio: "jair.nightly.mx",
  // Rotating "now" log lines in the header.
  now: [
    "shipping Cleanly — first paid product with my brother",
    "keeping Congreso GTO's e-voting system in orbit",
    "growing NightlySoftware toward its next launch",
  ],
};

// Orbit colors mirror src/content/orbits.ts in the portfolio.
export const orbitColor = {
  origin: "#7dd3fc",
  foundations: "#5eead4",
  experimentation: "#38bdf8",
  data: "#67e8f9",
  security: "#fb7185",
  community: "#f8d477",
  nightly: "#c7d2fe",
  institutional: "#c4b5fd",
  product: "#86efac",
  future: "#ffffff",
};

// Each station is drawn as the body it is in the Explore scene.
export const journey = [
  { year: "2014", name: "First Signal", orbit: "origin", body: "nebula" },
  { year: "2017", name: "Technical Seed", orbit: "foundations", body: "planet" },
  { year: "2020", name: "Pandemic Drift", orbit: "foundations", body: "asteroid" },
  { year: "2021", name: "False Orbits", orbit: "experimentation", body: "probes" },
  { year: "2022", name: "Data Gravity", orbit: "data", body: "giant" },
  { year: "2022", name: "Shadow Zone", orbit: "security", body: "radar" },
  { year: "2023", name: "Community Orbit", orbit: "community", body: "station" },
  { year: "2023", name: "Hackathon Boost", orbit: "community", body: "comet" },
  { year: "2024", name: "Nightly Orbit", orbit: "nightly", body: "moon" },
  { year: "2025", name: "Infrastructure Year", orbit: "institutional", body: "megastructure" },
  { year: "2026", name: "Product Horizon", orbit: "product", body: "shipyard" },
  { year: "next", name: "Next Signal", orbit: "future", body: "portal" },
];

// `tint` is [dark theme, light theme]; icons are rendered mono in that color.
const t = (dark, light = dark) => [dark, light];
const WHITE = t("#e2e8f0", "#0f172a");

export const constellations = [
  {
    title: "Core backend",
    note: "APIs from scratch, auth, real rules",
    orbit: "foundations",
    stars: [
      { icon: "java", label: "Java", tint: t("#f89820", "#c2410c") },
      { icon: "spring", label: "Spring", tint: t("#77bc1f", "#4d7c0f") },
      { icon: "dotnet", label: ".NET", tint: t("#a78bfa", "#512bd4") },
      { icon: "csharp", label: "C#", tint: t("#c084fc", "#68217a") },
      { icon: "nodejs", label: "Node", tint: t("#5fa04e", "#3f7a32") },
      { icon: "bun", label: "Bun", tint: t("#fbf0df", "#78350f") },
      { icon: "go", label: "Go", tint: t("#00add8", "#0284c7") },
      { icon: "hono", label: "Hono", tint: t("#ff8a3d", "#e36002") },
    ],
  },
  {
    title: "Interface",
    note: "products people actually use",
    orbit: "experimentation",
    stars: [
      { icon: "typescript", label: "TS", tint: t("#4ea1ff", "#007acc") },
      { icon: "react", label: "React", tint: t("#61dafb", "#0e7490") },
      { icon: "nextjs", label: "Next.js", tint: WHITE },
      { icon: "vuejs", label: "Vue", tint: t("#42b883", "#2f855a") },
      { icon: "nuxtjs", label: "Nuxt", tint: t("#00dc82", "#059669") },
      { icon: "tailwindcss", label: "Tailwind", tint: t("#38bdf8", "#0284c7") },
      { icon: "electron", label: "Electron", tint: t("#9feaf9", "#47848f") },
    ],
  },
  {
    title: "Product orbit",
    note: "the 2026 shipping stack",
    orbit: "product",
    stars: [
      { icon: "convex", label: "Convex", tint: t("#f3694c", "#ee342f") },
      { icon: "clerk", label: "Clerk", tint: t("#9b87ff", "#6c47ff") },
      { icon: "turborepo", label: "Turbo", tint: t("#ff4d7a", "#ff1e56") },
      { icon: "trpc", label: "tRPC", tint: t("#4fb3df", "#2596be") },
      { icon: "stripe", label: "Stripe", tint: t("#8f89ff", "#635bff") },
      { icon: "zod", label: "Zod", tint: t("#6aa5ff", "#3068b7") },
    ],
  },
  {
    title: "Data gravity",
    note: "model reality, keep it trustworthy",
    orbit: "data",
    stars: [
      { icon: "postgresql", label: "Postgres", tint: t("#699eca", "#336791") },
      { icon: "microsoftsqlserver", label: "SQL Server", tint: t("#ff6b5e", "#cc2927") },
      { icon: "mysql", label: "MySQL", tint: t("#4fa3c7", "#00618a") },
      { icon: "redis", label: "Redis", tint: t("#ff5a4e", "#d82c20") },
      { icon: "sqlite", label: "SQLite", tint: t("#5fb3ec", "#0f80cc") },
      { icon: "prisma", label: "Prisma", tint: WHITE },
    ],
  },
  {
    title: "Cloud & ops",
    note: "on-prem to cloud, deploys that stay up",
    orbit: "institutional",
    stars: [
      { icon: "amazonwebservices", label: "AWS", tint: t("#ff9900", "#c26f00") },
      { icon: "azure", label: "Azure", tint: t("#3ba7f0", "#0078d4") },
      { icon: "googlecloud", label: "GCP", tint: t("#7aa5ef", "#4285f4") },
      { icon: "cloudflare", label: "Cloudflare", tint: t("#f6a04d", "#f38020") },
      { icon: "docker", label: "Docker", tint: t("#2ab7f0", "#1d63ed") },
      { icon: "nginx", label: "Nginx", tint: t("#2fbf5f", "#009639") },
      { icon: "linux", label: "Linux", tint: t("#fcc624", "#a16207") },
      { icon: "githubactions", label: "Actions", tint: t("#5aa8ff", "#2088ff") },
      { icon: "grafana", label: "Grafana", tint: t("#f7a525", "#d97706") },
      { icon: "prometheus", label: "Prometheus", tint: t("#f26b3a", "#e75225") },
    ],
  },
  {
    title: "AI & tooling",
    note: "agents in the loop, judgment stays mine",
    orbit: "nightly",
    stars: [
      { icon: "anthropic", label: "Claude Code", tint: t("#e8a888", "#c15f3c") },
      { icon: "openai", label: "Codex", tint: WHITE },
      { icon: "python", label: "Python", tint: t("#ffd845", "#3776ab") },
      { icon: "git", label: "Git", tint: t("#f34f29", "#de4c36") },
      { icon: "figma", label: "Figma", tint: t("#ff7262", "#f24e1e") },
    ],
  },
];
