function getBearerTokenFromHeader(authorization) {
  if (!authorization || !authorization.startsWith("Bearer ")) {
    return null;
  }
  return authorization.slice("Bearer ".length).trim();
}

function shouldRequireBearerAuth({ webhookAuthMode, expectedBearerToken }) {
  if (webhookAuthMode === "none") {
    return false;
  }
  if (webhookAuthMode === "bearer") {
    return true;
  }
  return Boolean(expectedBearerToken);
}

function isAuthorizedBearer(authorization, expectedToken) {
  const incomingToken = getBearerTokenFromHeader(authorization);
  return Boolean(incomingToken) && incomingToken === expectedToken;
}

module.exports = {
  getBearerTokenFromHeader,
  isAuthorizedBearer,
  shouldRequireBearerAuth
};
