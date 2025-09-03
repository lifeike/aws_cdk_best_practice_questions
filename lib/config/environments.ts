export interface EnvConfig {
  account: string;
  region: string;
  repoName: string;
  branch: string;
}

export const environments: Record<"staging" | "production", EnvConfig> = {
  staging: { account: "672368182217", region: "us-east-1", repoName: "dmrv", branch: "staging" },
  production: { account: "672368182217", region: "us-east-1", repoName: "dmrv", branch: "main" },
};
