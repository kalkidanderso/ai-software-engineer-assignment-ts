import { OAuth2Token } from "./tokens";
export type TokenState = OAuth2Token | Record<string, unknown> | null;

export class HttpClient {
  oauth2Token: TokenState = null;

  refreshOAuth2(): void {
    this.oauth2Token = new OAuth2Token("fresh-token", 10 ** 10);
  }

  request(
    method: string,
    path: string,
    opts?: { api?: boolean; headers?: Record<string, string> }
  ): { method: string; path: string; headers: Record<string, string> } {
    const api = opts?.api ?? false;
    const headers = opts?.headers ?? {};

    if (api) {
      // Handle token expiration for both OAuth2Token instances and plain objects
      const tokenExpired =
        this.oauth2Token instanceof OAuth2Token
          ? this.oauth2Token.expired
          : typeof this.oauth2Token === "object" &&
          this.oauth2Token !== null &&
          "expiresAt" in this.oauth2Token &&
          typeof this.oauth2Token.expiresAt === "number" &&
          Math.floor(Date.now() / 1000) >= this.oauth2Token.expiresAt;

      if (!this.oauth2Token || tokenExpired) {
        this.refreshOAuth2();
      }

      if (this.oauth2Token instanceof OAuth2Token) {
        headers["Authorization"] = this.oauth2Token.asHeader();
      }
    }

    return { method, path, headers };
  }
}