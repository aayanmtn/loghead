export const serverState = {
  mode: "local" as "local" | "cloud",
  running: false,
  managed: false,
  port: undefined as number | undefined,
  mcpToken: undefined as string | undefined,
  cloudToken: undefined as string | undefined,
  cloudApiUrl: undefined as string | undefined,
};
