/**
 * Decode the ``sub`` claim from a JWT payload. Returns ``null`` for any
 * malformed input (wrong segment count, bad base64, non-JSON, no ``sub``,
 * or non-string ``sub``).
 */
export declare function parseSubClaim(jwt: string): string | null;
/**
 * Milliseconds until ``exp`` (UNIX seconds) elapses. Returns 0 for any
 * malformed input — callers treat 0 as "needs refresh now".
 */
export declare function tokenRemainingMs(jwt: string): number;
//# sourceMappingURL=jwt-utils.d.ts.map