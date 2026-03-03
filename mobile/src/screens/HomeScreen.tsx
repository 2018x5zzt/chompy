/**
 * Home screen — main entry point with BLE + scan workflow.
 */

import React, { useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { Button } from "../components/common/Button";
import { API_ENDPOINTS } from "../constants";
import { apiClient } from "../services/api";
import { bleService } from "../services/ble";
import { ConnectionState } from "../types";
import type {
  ApiError,
  BleDevice,
  DiagnosticResult,
  UploadedImage,
  UploadImageRequest,
} from "../types";

const MOCK_SCAN_IMAGE_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGP4//8/AAX+Av4N70a4AAAAAElFTkSuQmCC";

const MOCK_UPLOAD_PAYLOAD: UploadImageRequest = {
  imageBase64: MOCK_SCAN_IMAGE_BASE64,
  contentType: "image/png",
};

function getApiErrorMessage(err: unknown): string {
  if (typeof err === "object" && err !== null) {
    const maybeApiError = err as Partial<ApiError>;
    if (
      typeof maybeApiError.status === "number" &&
      typeof maybeApiError.detail === "string"
    ) {
      if (maybeApiError.status === 413) {
        return "Upload failed: image exceeds 5 MiB. Please compress or retake the photo, then try again.";
      }
      if (maybeApiError.status === 400) {
        return "Upload failed: invalid image payload. Please retake and re-upload the photo.";
      }
      return `Request failed (${maybeApiError.status}): ${maybeApiError.detail}`;
    }
  }
  if (err instanceof Error) {
    return err.message;
  }
  return "Failed to complete scan workflow";
}

function getBleStateLabel(state: ConnectionState): string {
  switch (state) {
    case ConnectionState.Disconnected:
      return "Disconnected";
    case ConnectionState.Scanning:
      return "Scanning";
    case ConnectionState.Connecting:
      return "Connecting";
    case ConnectionState.Connected:
      return "Connected";
    case ConnectionState.Error:
      return "Error";
    default:
      return "Unknown";
  }
}

export function HomeScreen(): React.JSX.Element {
  const [scanLoading, setScanLoading] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [result, setResult] = useState<DiagnosticResult | null>(null);

  const [bleBusy, setBleBusy] = useState(false);
  const [bleError, setBleError] = useState<string | null>(null);
  const [bleDevices, setBleDevices] = useState<BleDevice[]>([]);
  const [bleState, setBleState] = useState<ConnectionState>(
    bleService.connectionState,
  );
  const [connectedDeviceId, setConnectedDeviceId] = useState<string | null>(
    bleService.connectedDeviceId,
  );

  const firstDevice = useMemo(() => bleDevices[0] ?? null, [bleDevices]);

  const syncBleState = () => {
    setBleState(bleService.connectionState);
    setConnectedDeviceId(bleService.connectedDeviceId);
  };

  const handleBleScan = async () => {
    setBleBusy(true);
    setBleError(null);
    setBleDevices([]);
    syncBleState();

    try {
      const devices = await bleService.scanDevices();
      setBleDevices(devices);
    } catch (err: unknown) {
      setBleError(err instanceof Error ? err.message : "BLE scan failed");
    } finally {
      syncBleState();
      setBleBusy(false);
    }
  };

  const handleBleConnect = async (deviceId: string) => {
    setBleBusy(true);
    setBleError(null);
    syncBleState();

    try {
      await bleService.connectToDevice(deviceId);
    } catch (err: unknown) {
      setBleError(err instanceof Error ? err.message : "BLE connect failed");
    } finally {
      syncBleState();
      setBleBusy(false);
    }
  };

  const handleBleDisconnect = async () => {
    setBleBusy(true);
    setBleError(null);

    try {
      await bleService.disconnect();
    } catch (err: unknown) {
      setBleError(
        err instanceof Error ? err.message : "BLE disconnect failed",
      );
    } finally {
      syncBleState();
      setBleBusy(false);
    }
  };

  const handleScanAndDiagnose = async () => {
    setScanLoading(true);
    setScanError(null);
    setResult(null);
    try {
      const uploaded = await apiClient.post<UploadedImage>(
        API_ENDPOINTS.UPLOAD_IMAGE,
        MOCK_UPLOAD_PAYLOAD,
      );
      const data = await apiClient.post<DiagnosticResult>(
        API_ENDPOINTS.DIAGNOSTIC_RESULT,
        { imageUrl: uploaded.imageUrl },
      );
      setResult(data);
    } catch (err: unknown) {
      setScanError(getApiErrorMessage(err));
    } finally {
      setScanLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chompy</Text>
      <Text style={styles.subtitle}>Smart Dental Health Monitor</Text>

      <View style={styles.bleCard}>
        <Text style={styles.sectionTitle}>BLE Device</Text>
        <Text style={styles.meta}>State: {getBleStateLabel(bleState)}</Text>
        <Text style={styles.meta}>
          Connected: {connectedDeviceId ?? "none"}
        </Text>

        <View style={styles.actionRow}>
          <Button
            title="Scan Devices"
            onPress={handleBleScan}
            loading={bleBusy && bleState === ConnectionState.Scanning}
            variant="secondary"
          />

          {connectedDeviceId ? (
            <Button
              title="Disconnect"
              onPress={handleBleDisconnect}
              loading={bleBusy && bleState === ConnectionState.Connecting}
              variant="secondary"
            />
          ) : (
            <Button
              title={firstDevice ? "Connect First" : "Connect First"}
              onPress={() => firstDevice && handleBleConnect(firstDevice.id)}
              disabled={!firstDevice}
              loading={bleBusy && bleState === ConnectionState.Connecting}
              variant="secondary"
            />
          )}
        </View>

        {bleDevices.length > 0 ? (
          <View style={styles.deviceList}>
            {bleDevices.map((device) => (
              <Text key={device.id} style={styles.deviceLine}>
                {device.name ?? "Unknown"} ({device.id}) RSSI:{" "}
                {device.rssi ?? "n/a"}
              </Text>
            ))}
          </View>
        ) : (
          <Text style={styles.hint}>
            Scan to discover devices with prefix "Chompy"
          </Text>
        )}

        {bleError ? (
          <Text style={styles.error} accessibilityRole="alert">
            {bleError}
          </Text>
        ) : null}
      </View>

      <View style={styles.scanCard}>
        <Text style={styles.sectionTitle}>Diagnosis Workflow</Text>
        <Button
          title="Upload + Diagnose"
          onPress={handleScanAndDiagnose}
          loading={scanLoading}
        />
        <Text style={styles.hint}>
          Demo mode: uploads a mock image then requests diagnosis
        </Text>
      </View>

      {scanError ? (
        <Text
          style={styles.error}
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
        >
          {scanError}
        </Text>
      ) : null}

      {result ? (
        <View style={styles.resultCard}>
          <Text style={styles.resultTitle}>Latest Diagnosis</Text>
          <Text style={styles.resultLine}>Type: {result.diagnosis}</Text>
          <Text style={styles.resultLine}>Severity: {result.severity}</Text>
          <Text style={styles.resultLine}>Details: {result.description}</Text>
          <Text style={styles.resultLine}>
            Recommendation: {result.recommendation}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 28,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
    textAlign: "center",
  },
  bleCard: {
    borderWidth: 1,
    borderColor: "#d4e8fb",
    backgroundColor: "#f7fbff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    gap: 8,
  },
  scanCard: {
    borderWidth: 1,
    borderColor: "#eaeaea",
    backgroundColor: "#fafafa",
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  meta: {
    fontSize: 13,
    color: "#333",
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
  },
  deviceList: {
    gap: 4,
  },
  deviceLine: {
    fontSize: 12,
    color: "#333",
  },
  hint: {
    fontSize: 12,
    color: "#777",
  },
  error: {
    marginTop: 8,
    color: "#d32f2f",
    fontSize: 13,
  },
  resultCard: {
    borderWidth: 1,
    borderColor: "#d4e8fb",
    backgroundColor: "#f7fbff",
    borderRadius: 12,
    padding: 14,
    gap: 6,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  resultLine: {
    fontSize: 14,
    color: "#333",
  },
});
