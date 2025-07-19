function isRateLimitError(error: any): boolean {
  if (!error.response) return false;
  const { status, headers } = error.response;
  return (
    status === 429 ||
    (headers &&
      "x-ratelimit-remaining" in headers &&
      headers["x-ratelimit-remaining"] === "0")
  );
}

function getRateLimitInfo(error: any) {
  if (!error.response) return null;

  const headers = error.response.headers;
  return {
    status: error.response.status,
    retryAfter: headers["retry-after"],
    limit: headers["x-ratelimit-limit"],
    remaining: headers["x-ratelimit-remaining"],
    reset: headers["x-ratelimit-reset"],
  };
}

export { isRateLimitError, getRateLimitInfo };