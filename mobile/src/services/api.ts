/**
 * Type-safe API client for Chompy backend.
 */

import { API_BASE_URL } from "../constants";
import type { ApiError } from "../types";

function parseApiErrorDetail(rawText: string): string {
  if (!rawText.trim()) {
    return "Unknown error";
  }
  try {
    const parsed = JSON.parse(rawText) as unknown;
    if (typeof parsed === "object" && parsed !== null && "detail" in parsed) {
      const detail = (parsed as { detail: unknown }).detail;
      return typeof detail === "string" ? detail : JSON.stringify(detail);
    }
  } catch {
    // Fall back to raw text when body is not JSON.
  }
  return rawText;
}

class ApiClient {
  private readonly baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async get<T>(path: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    return this.handleResponse<T>(response);
  }

  async post<T>(path: string, body: unknown): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return this.handleResponse<T>(response);
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const rawText = await response.text();
      const error: ApiError = {
        detail: parseApiErrorDetail(rawText),
        status: response.status,
      };
      throw error;
    }
    return response.json() as Promise<T>;
  }
}

/** Singleton API client instance. */
export const apiClient = new ApiClient();
