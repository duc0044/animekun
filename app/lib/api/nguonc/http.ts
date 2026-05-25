import { OPHIM_REVALIDATE_SECONDS } from "../ophim/config";
import { asRecord, type JsonRecord } from "../ophim/json";
import { NGUONC_API_BASE } from "./config";

export async function fetchNguoncJson(path: string): Promise<JsonRecord> {
  try {
    const response = await fetch(`${NGUONC_API_BASE}${path}`, {
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
