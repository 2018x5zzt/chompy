/**
 * Shared type definitions for Chompy mobile app.
 */

/** Dental diagnostic result from backend. */
export interface DiagnosticResult {
  readonly id: string;
  readonly imageUrl: string;
  readonly diagnosis: DiagnosisType;
  readonly severity: SeverityLevel;
  readonly description: string;
  readonly recommendation: string;
  readonly createdAt: string;
}

/** Uploaded image metadata from backend. */
export interface UploadedImage {
  readonly id: string;
  readonly imageUrl: string;
  readonly filename: string;
  readonly contentType: string;
  readonly sizeBytes: number;
  readonly createdAt: string;
}

/** Supported image MIME types for upload contract. */
export type UploadContentType = "image/jpeg" | "image/png" | "image/webp";

/** Upload request payload (JSON contract only). */
export interface UploadImageRequest {
  readonly imageBase64: string;
  readonly contentType: UploadContentType;
}

/** Supported diagnosis types. */
export type DiagnosisType = "cavity" | "wisdom_tooth" | "plaque" | "gum_disease" | "healthy";

/** Severity levels for diagnostic results. */
export type SeverityLevel = "none" | "mild" | "moderate" | "severe";

/** Health check response from backend. */
export interface HealthCheckResponse {
  readonly status: string;
  readonly service: string;
}

/** API error response. */
export interface ApiError {
  readonly detail: string;
  readonly status: number;
}

/** BLE connection states. */
export enum ConnectionState {
  Disconnected = "disconnected",
  Scanning = "scanning",
  Connecting = "connecting",
  Connected = "connected",
  Error = "error",
}

/** BLE device info. */
export interface BleDevice {
  readonly id: string;
  readonly name: string | null;
  readonly rssi: number | null;
}
