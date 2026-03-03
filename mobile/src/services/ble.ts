/**
 * BLE service for Chompy hardware device.
 *
 * The service exposes a stable interface for app code.
 * A mock adapter is used by default so frontend flow can be developed
 * before physical hardware and react-native-ble-plx integration are ready.
 */

import {
  BLE_DEVICE_NAME_PREFIX,
  BLE_SCAN_TIMEOUT_MS,
  BLE_SERVICE_UUID,
} from "../constants";
import { ConnectionState } from "../types";
import type { BleDevice } from "../types";

/** BLE service interface for device communication. */
export interface IBleService {
  readonly connectionState: ConnectionState;
  readonly connectedDeviceId: string | null;
  scanDevices(): Promise<BleDevice[]>;
  connectToDevice(deviceId: string): Promise<void>;
  disconnect(): Promise<void>;
}

/** Adapter contract to swap mock/real BLE implementations. */
export interface BleAdapter {
  scan(timeoutMs: number): Promise<BleDevice[]>;
  connect(deviceId: string): Promise<void>;
  disconnect(deviceId: string): Promise<void>;
}

/**
 * Mock adapter for development without hardware.
 *
 * Real integration should provide a second adapter that wraps
 * react-native-ble-plx and keeps this API unchanged.
 */
class MockBleAdapter implements BleAdapter {
  async scan(timeoutMs: number): Promise<BleDevice[]> {
    await wait(Math.min(timeoutMs, 600));

    return [
      {
        id: "mock-device-001",
        name: `${BLE_DEVICE_NAME_PREFIX}-Prototype-A`,
        rssi: -58,
      },
      {
        id: "mock-device-002",
        name: `${BLE_DEVICE_NAME_PREFIX}-Prototype-B`,
        rssi: -67,
      },
    ];
  }

  async connect(deviceId: string): Promise<void> {
    if (!deviceId.trim()) {
      throw new Error("Device ID is required");
    }
    await wait(300);
  }

  async disconnect(_deviceId: string): Promise<void> {
    await wait(150);
  }
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

class BleService implements IBleService {
  private _connectionState: ConnectionState = ConnectionState.Disconnected;
  private _connectedDeviceId: string | null = null;

  constructor(private readonly adapter: BleAdapter) {}

  get connectionState(): ConnectionState {
    return this._connectionState;
  }

  get connectedDeviceId(): string | null {
    return this._connectedDeviceId;
  }

  async scanDevices(): Promise<BleDevice[]> {
    this._connectionState = ConnectionState.Scanning;

    try {
      const devices = await this.adapter.scan(BLE_SCAN_TIMEOUT_MS);

      return devices.filter((device) => {
        if (!device.name) {
          return false;
        }
        return device.name.startsWith(BLE_DEVICE_NAME_PREFIX);
      });
    } catch (error: unknown) {
      this._connectionState = ConnectionState.Error;
      throw normalizeBleError(error, "BLE scan failed");
    } finally {
      this._connectionState = this._connectedDeviceId
        ? ConnectionState.Connected
        : ConnectionState.Disconnected;
    }
  }

  async connectToDevice(deviceId: string): Promise<void> {
    this._connectionState = ConnectionState.Connecting;

    try {
      await this.adapter.connect(deviceId);
      this._connectedDeviceId = deviceId;
      this._connectionState = ConnectionState.Connected;
    } catch (error: unknown) {
      this._connectionState = ConnectionState.Error;
      throw normalizeBleError(error, "BLE connect failed");
    }
  }

  async disconnect(): Promise<void> {
    if (!this._connectedDeviceId) {
      this._connectionState = ConnectionState.Disconnected;
      return;
    }

    try {
      await this.adapter.disconnect(this._connectedDeviceId);
    } catch (error: unknown) {
      this._connectionState = ConnectionState.Error;
      throw normalizeBleError(error, "BLE disconnect failed");
    } finally {
      this._connectedDeviceId = null;
      this._connectionState = ConnectionState.Disconnected;
    }
  }
}

function normalizeBleError(error: unknown, fallback: string): Error {
  if (error instanceof Error) {
    return error;
  }
  return new Error(fallback);
}

/**
 * Singleton BLE service instance.
 *
 * TODO(hardware integration): Replace MockBleAdapter with a real adapter
 * backed by react-native-ble-plx once hardware protocol is finalized.
 */
export const bleService = new BleService(new MockBleAdapter());

/** Export for testing/integration wiring. */
export { MockBleAdapter };
