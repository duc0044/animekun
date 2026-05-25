import { OPHIM_API_BASE, OPHIM_REVALIDATE_SECONDS } from "./config";
import { asRecord, type JsonRecord } from "./json";

export async function fetchOphimJson(path: string): Promise<JsonRecord> {
  try {
    const response = await fetch(`${OPHIM_API_BASE}${path}`, {
      headers: { Accept: "application/json" },
      next: { revalidate: OPHIM_REVALIDATE_SECONDS },
    });

    if (!response.ok) {
      return {};
    }

    return asRecord(await response.json());
  } catch {
    return {};
  }
}

