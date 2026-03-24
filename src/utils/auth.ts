import type { WebhookAuthMode } from "../types/ppe";

interface BearerAuthConfig {
  webhookAuthMode: WebhookAuthMode;
  expectedBearerToken: string;
}

export function getBearerTokenFromHeader(
  authorization?: string | null
): string | null {
  if (!authorization || !authorization.startsWith("Bearer ")) {
    return null;
  }

  return authorization.slice("Bearer ".length).trim();
}

export function shouldRequireBearerAuth({
  webhookAuthMode,
  expectedBearerToken
}: BearerAuthConfig): boolean {
  if (webhookAuthMode === "none") {
    return false;
  }

  if (webhookAuthMode === "bearer") {
    return true;
  }

  return Boolean(expectedBearerToken);
}

export function isAuthorizedBearer(
  authorization: string | undefined,
  expectedToken: string
): boolean {
  const incomingToken = getBearerTokenFromHeader(authorization);
  return Boolean(incomingToken) && incomingToken === expectedToken;
}
