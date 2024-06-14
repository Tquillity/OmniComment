// crypto-lib.mjs

import crypto from "crypto";
import pkg from "elliptic";

// Destructture and extract the ec object from the elliptic package
const { ec } = pkg;

// Function to create a SHA-256 hash of the given arguments
export const createHash = (...args) => {
  return crypto
    .createHash("sha256")
    .update(
      args
        .map((arg) => JSON.stringify(arg))
        .sort()
        .join("")
    )
    .digest("hex");
};

// Create a new elliptic curve instance for the secp256k1 curve
export const ellipticHash = new ec("secp256k1");

// Function to verify a digital signature
export const verifySignature = ({ publicKey, data, signature }) => {
  // Create a key object from the given public key in hex format
  const key = ellipticHash.keyFromPublic(publicKey, "hex");
  // Verify the signature using the public key and the hash of the data
  return key.verify(createHash(data), signature);
};
