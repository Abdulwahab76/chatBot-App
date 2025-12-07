export type ApiResponse<T = any> = {
    succeed: boolean;
    status: number;
    message: string;
    data: T | null;
};

const BASE =
    import.meta.env.DEV
        ? ''
        : import.meta.env.VITE_API_BASE_URL;

const TIMEOUT_MS = 15000;

async function fetchWithTimeout(input: RequestInfo, init?: RequestInit, timeout = TIMEOUT_MS) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
        const merged = { ...(init || {}), signal: controller.signal };
        const res = await fetch(input, merged);
        return res;
    } finally {
        clearTimeout(id);
    }
}

/**
 * Ask the Windmason QA endpoint.
 * Tries POST JSON first; if that fails (server expecting query param),
 * falls back to POST with query param style.
 */
export async function askQuestion(question: string): Promise<string> {
    const url = `${BASE.replace(/\/$/, "")}/AskQuestion`;
    try {
        const res = await fetchWithTimeout(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ question }),

        });

        if (!res.ok) {
            return await fallbackQueryFetch(question, url);
        }

        const json = (await res.json()) as ApiResponse<string>;
        if (!json?.succeed) throw new Error(json?.message || "No success");
        return json.data ?? "";
    } catch (err) {
        // fallback once
        try {
            return await fallbackQueryFetch(question, url);
        } catch (err2) {
            throw err2;
        }
    }
}

async function fallbackQueryFetch(question: string, url: string): Promise<string> {
    const fallbackUrl = `${url}?question=${encodeURIComponent(question)}`;
    const res2 = await fetchWithTimeout(fallbackUrl, { method: "POST" }); // doc example uses POST with query param
    if (!res2.ok) throw new Error(`AskQuestion failed: ${res2.status}`);
    const json2 = (await res2.json()) as ApiResponse<string>;
    if (!json2?.succeed) throw new Error(json2?.message || "AskQuestion returned failure");
    return json2.data ?? "";
}

 