/**
 * Free-form scope blob. ``kind`` picks a server-side resolution handler;
 * the remaining fields are handler-specific. v1 supports ``kind = "storage"``
 * with required fields ``{bucket, path, filename, mime, size}``.
 */
export interface ShareScope {
    kind: string;
    [key: string]: unknown;
}
export interface ShareCreateRequest {
    /** What this share grants access to. See ``ShareScope``. */
    scope: ShareScope;
    /** v1 only supports ``"download"``. */
    mode: 'download';
    /** Seconds until expiry. Omit for no expiry. */
    expires_in?: number;
    /** Cap on total resolutions. Omit for unlimited. */
    max_uses?: number;
}
export interface ShareCreateResult {
    /** Opaque, URL-safe, per-workspace-unique code. */
    share_code: string;
    /**
     * Full URL to give to a human. Opening it 302-redirects the browser to a
     * signed storage URL (download mode) or a focused resource page (v2). The
     * full mini-app UI is NOT loaded on that request.
     */
    share_url: string;
    /** ISO-8601 UTC string, or null if no expiry was requested. */
    expires_at: string | null;
}
export interface DeepDiverShare {
    /**
     * Mint a new share link. Requires the mini-app to have a viewer JWT (the
     * caller must be the workspace creator in v1). Throws on network / auth
     * failure with a message that includes the server's error field.
     */
    create(req: ShareCreateRequest): Promise<ShareCreateResult>;
}
export interface CreateShareOptions {
    /**
     * Returns the CURRENT base URL of the share API — typically an absolute
     * ``https://…/api/preview/<app>/share`` from the server config payload.
     * Read per request (not captured at construction) because a client built
     * from a partial boot config starts with a root-relative fallback and
     * adopts the server's absolute URL on its first config refresh — in
     * static sandbox previews the relative form resolves against the sandbox
     * origin, which has no share route at all.
     */
    getShareApiUrl(): string;
    /**
     * Returns the current Supabase viewer JWT (the same one the main SDK
     * uses). Called per request so we pick up refreshed tokens automatically.
     */
    getToken(): string | undefined;
}
/**
 * Build a ``DeepDiverShare`` that POSTs to ``{shareApiUrl}/mint`` with
 * ``Authorization: Bearer <viewerToken>``. The token is required — the
 * server will 401 if it's missing. We surface that as a local throw when
 * we can see ahead of time that there's no token, to save a round-trip.
 */
export declare function createShare(opts: CreateShareOptions): DeepDiverShare;
//# sourceMappingURL=share.d.ts.map