# Hardware Integration and Selection Guide

Last updated: 2026-03-03 (CST)
Audience: hardware team + firmware + mobile/backend integration.

## 1. Objective

Build a first Chompy hardware prototype that can:
1. Capture oral images,
2. Transfer image data to mobile over BLE,
3. Let mobile upload with current API contract (`imageBase64 + contentType`).

## 2. Interface Requirements from Current Software

Hard requirements from existing software contract:
1. Payload must end as valid JPEG/PNG/WEBP bytes.
2. Client upload limit is 5 MiB decoded size.
3. BLE pipeline should preserve byte integrity to avoid 400 (invalid payload).

## 3. Recommended Architecture (Prototype P0)

```text
Image Sensor + Optics + LED Ring
        -> MCU/SoC (compression + packetization)
        -> BLE GATT transfer
        -> Mobile app reassembly
        -> Backend upload API
```

## 4. Component Selection Recommendations

These are practical starting options, not final procurement decisions.

### 4.1 MCU/SoC

Option A (BLE-priority): Nordic nRF52840 / nRF5340
- Pros: mature BLE stack, low power, strong ecosystem.
- Cons: limited heavy image processing capacity.

Option B (compute-priority): ESP32-S3 + external BLE strategy
- Pros: stronger local compute options.
- Cons: BLE robustness and power tuning can be more variable.

Recommendation for first reliable BLE prototype: start with Nordic class.

### 4.2 Image Sensor

- Choose a module with stable driver support and predictable low-light behavior.
- Prefer fixed output format that can be converted to JPEG/PNG reliably.
- Keep first prototype resolution conservative to stay below 5 MiB upload ceiling.

### 4.3 Illumination and Optics

- Use ring LED with diffused illumination to reduce glare on enamel.
- Lock focal distance in mechanical design to improve repeatability.
- Calibrate white balance and exposure for oral cavity low-light constraints.

### 4.4 Power and Safety

- Ensure thermal envelope for intraoral usage (no hot surfaces).
- Add battery protection and charging safety circuit.
- Define moisture resistance and cleaning/sterilization compatibility early.

## 5. BLE Protocol Design (for immediate integration)

## 5.1 GATT Proposal

Service: `CHOMPY_IMAGE_SERVICE`

Characteristics:
1. `CONTROL_CHAR` (write): start/stop capture, metadata, ack.
2. `DATA_CHAR` (notify): binary chunks.
3. `STATUS_CHAR` (notify/read): progress, error code, firmware version.

## 5.2 Packetization Rules

1. Include frame ID, chunk index, total chunks, payload CRC.
2. Support retransmission on missing chunk timeout.
3. Final reassembly must verify CRC before upload.
4. On repeated CRC failure, force recapture rather than upload corrupted frame.

## 5.3 Error Mapping to App UX

1. BLE transfer incomplete -> show retry capture/transfer.
2. Reassembled payload invalid -> map to backend-like 400 guidance in UI.
3. Oversized frame (>5 MiB decoded) -> local warning before upload, map to 413 guidance.

## 6. Hardware-Firmware-Software Milestones

M0 (now): define BLE packet protocol + metadata schema.
M1: achieve stable scan/connect/disconnect on iOS + Android.
M2: complete single-frame transfer and reassembly with CRC.
M3: pass end-to-end upload + diagnostics with real hardware image.
M4: add reliability tests (packet loss, reconnect, low battery conditions).

## 7. Documents to Maintain During Hardware Development

1. BLE protocol spec (message schema + state machine).
2. Device compatibility matrix (firmware/mobile app versions).
3. Failure playbook (timeout, CRC fail, reconnect rules).
4. Thermal and power safety test records.

## 8. Immediate Next Step

Implement real BLE adapter in mobile using this contract-compatible flow:
scan -> connect -> transfer chunk stream -> reassemble -> validate -> upload JSON contract.
