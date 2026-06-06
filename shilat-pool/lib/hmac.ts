import { createHmac } from "crypto";

export function hmacIsraeliId(id: string): string {
  const secret = process.env.PAST_MEMBER_HMAC_SECRET ?? "dev-secret-change-me";
  return createHmac("sha256", secret).update(id.trim()).digest("hex");
}
