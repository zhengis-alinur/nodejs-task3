import { randomBytes } from "crypto";

// Class for generating a random key
export class RandomGenerator {
	generateRandomKey(length: number): string {
		const randomBytesBuffer = randomBytes(length);
		return randomBytesBuffer.toString("hex");
	}
}