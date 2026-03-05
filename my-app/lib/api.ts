let accessToken: string | null = null

export const setAccessToken = (token: string) => {
    accessToken = token
}

async function refreshAccessToken() {
    const res = await fetch("https://zynon.onrender.com/api/auth/refresh", {
        method: "POST",
        credentials: "include",
        headers: {
            "x-client-type": "web"
        }
    })

    if (!res.ok) {
        throw new Error("Session expired")
    }

    const data = await res.json()

    accessToken = data.data.accessToken

    return accessToken
}

export async function apiFetch(url: string, options: RequestInit = {}) {

    let res = await fetch(url, {
        ...options,
        headers: {
            ...options.headers,
            Authorization: accessToken ? `Bearer ${accessToken}` : ""
        },
        credentials: "include"
    })

    // If access token expired
    if (res.status === 401) {

        try {
            const newToken = await refreshAccessToken()

            res = await fetch(url, {
                ...options,
                headers: {
                    ...options.headers,
                    Authorization: accessToken ? `Bearer ${accessToken}` : ""
                },
                credentials: "include"
            })

        } catch {
            window.location.href = "/login"
        }
    }

    return res
}

// ---- simple localStorage cache helpers ----

interface CacheEntry {
    data: any
    timestamp: number
}

function makeCacheKey(url: string, options: RequestInit = {}) {
    // only include method/body/headers that affect response
    return `${url}::${options.method || "GET"}::${JSON.stringify(
        options.body ?? null
    )}`
}

/**
 * Attempt to read a cached response for the given request.
 * Returns null if not found or parsing fails.
 */
export function getCached<T>(url: string, options: RequestInit = {}): T | null {
    if (typeof window === "undefined") return null
    const key = makeCacheKey(url, options)
    const str = localStorage.getItem(key)
    if (!str) return null
    try {
        const entry: CacheEntry = JSON.parse(str)
        return entry.data as T
    } catch {
        return null
    }
}

/**
 * Store a response value in the cache (no expiration).
 */
export function setCached(url: string, options: RequestInit = {}, data: any) {
    if (typeof window === "undefined") return
    const key = makeCacheKey(url, options)
    const entry: CacheEntry = { data, timestamp: Date.now() }
    localStorage.setItem(key, JSON.stringify(entry))
}

/**
 * Remove the cached response for a specific request key.
 */
export function clearCache(url: string, options: RequestInit = {}) {
    if (typeof window === "undefined") return
    const key = makeCacheKey(url, options)
    localStorage.removeItem(key)
}

/**
 * Completely wipe the cache. Useful on logout or global invalidation.
 */
export function clearAllCache() {
    if (typeof window === "undefined") return
    // naive: clear every key that was created by makeCacheKey; since keys
    // include url::method we can't easily filter, so just clear everything.
    localStorage.clear()
}

/**
 * Fetch data using `apiFetch`, but maintain a localStorage cache.
 *
 * - if there is cached data and `forceReload` is false, returns it immediately
 *   with `changed=false`.
 * - otherwise it fetches from the network, compares the JSON to whatever was
 *   cached, writes the new value, and returns `{data,changed}`.
 */
export async function cachedApiFetch<T>(
    url: string,
    options: RequestInit = {},
    forceReload = false
): Promise<{ data: T; changed: boolean }> {
    const key = makeCacheKey(url, options)
    const cachedStr = typeof window !== "undefined" ? localStorage.getItem(key) : null
    let cachedData: T | null = null
    if (cachedStr) {
        try {
            cachedData = JSON.parse(cachedStr).data
        } catch {}
    }

    if (!forceReload && cachedData !== null) {
        return { data: cachedData, changed: false }
    }

    const res = await apiFetch(url, options)
    const fresh = await res.json()
    const changed = JSON.stringify(fresh) !== JSON.stringify(cachedData)
    if (typeof window !== "undefined") {
        localStorage.setItem(
            key,
            JSON.stringify({ data: fresh, timestamp: Date.now() })
        )
    }
    return { data: fresh, changed }
}
