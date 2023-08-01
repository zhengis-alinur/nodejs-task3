import { createHmac } from "crypto";

// Class for generating HMAC
export class HMACGenerator {
	generateHMAC(key: string, data: string): string {
		const hmac = createHmac("sha256", key);
		hmac.update(data);
		return hmac.digest("hex");
	}
}