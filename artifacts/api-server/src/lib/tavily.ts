import { tavily as tavilySDK } from "@tavily/core";

export function initTavily() {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) {
    return null;
  }
  return tavilySDK({ apiKey });
}

export async function searchWeb(query: string): Promise<string> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) {
    return "[Web search unavailable - TAVILY_API_KEY not configured]";
  }

  try {
    const tvly = tavilySDK({ apiKey });
    const results = await tvly.search(query, {
      searchDepth: "basic",
      maxResults: 3,
    });
    return results.results.map((r: any) => `${r.title}: ${r.content}`).join("\n");
  } catch (err) {
    return "[Web search failed - please try again]";
  }
}

export type TavilyInstance = ReturnType<typeof tavilySDK> | null;
