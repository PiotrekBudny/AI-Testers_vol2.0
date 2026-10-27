import { createHmac } from "node:crypto";

import { requireBystreStatus } from "./bystre-user-lifecycle";
import type { BystreUsersApiClient } from "./bystre-users-api.client";
import type {
  BystreMfaRecoveryCodesResponse,
  BystreMfaSetupResponse,
} from "./bystre-users-api.models";

export function currentMfaCode(secret: string): string {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  const bits = [...secret.replaceAll("=", "").toUpperCase()]
    .map((character) => {
      const index = alphabet.indexOf(character);
      if (index < 0)
        throw new Error("MFA setup returned an invalid Base32 secret.");
      return index.toString(2).padStart(5, "0");
    })
    .join("");
  const bytes = Buffer.from(
    bits.match(/.{8}/g)?.map((chunk) => Number.parseInt(chunk, 2)) ?? [],
  );
  const counter = Buffer.alloc(8);
  counter.writeBigUInt64BE(BigInt(Math.floor(Date.now() / 30_000)));
  const digest = createHmac("sha1", bytes).update(counter).digest();
  const offset = digest[digest.length - 1] & 15;
  return ((digest.readUInt32BE(offset) & 0x7fffffff) % 1_000_000)
    .toString()
    .padStart(6, "0");
}

export async function nextMfaCode(
  secret: string,
  previousCode: string,
): Promise<string> {
  while (currentMfaCode(secret) === previousCode) {
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  return currentMfaCode(secret);
}

export async function enrollMfa(
  api: BystreUsersApiClient,
  token: string,
): Promise<{ secret: string; recoveryCodes: string[] }> {
  const authorization = `Bearer ${token}`;
  const setupResponse = await requireBystreStatus(
    api.setupMfa(authorization),
    "MFA setup",
    200,
  );
  const setup = (await setupResponse.json()) as BystreMfaSetupResponse;
  if (typeof setup.secret !== "string" || !setup.secret) {
    throw new Error("MFA setup did not return a usable secret.");
  }
  const confirmationResponse = await requireBystreStatus(
    api.confirmMfa({ code: currentMfaCode(setup.secret) }, authorization),
    "MFA confirmation",
    200,
  );
  const confirmation =
    (await confirmationResponse.json()) as BystreMfaRecoveryCodesResponse;
  if (
    !Array.isArray(confirmation.recoveryCodes) ||
    confirmation.recoveryCodes.length < 2
  ) {
    throw new Error("MFA confirmation did not return recovery codes.");
  }
  return { secret: setup.secret, recoveryCodes: confirmation.recoveryCodes };
}
