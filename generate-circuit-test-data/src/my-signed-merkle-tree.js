import { LeanIMT } from "@zk-kit/lean-imt";
import { poseidon1, poseidon2 } from "poseidon-lite";
import {
  derivePublicKey,
  signMessage,
  verifySignature
} from "@zk-kit/eddsa-poseidon";

// Hash function used to compute the tree nodes
const hash = (a, b) => poseidon2([a, b]);

// Create leaves with key-value pairs
const keyValuePairs = [
  { key: 1, value: 111 },
  { key: 2, value: 222 },
  { key: 3, value: 333 },
  { key: 4, value: 444 },
  { key: 5, value: 555 },
  { key: 6, value: 666 },
  { key: 7, value: 777 },
  { key: 8, value: 888 },
  { key: 9, value: 999 },
  { key: 10, value: 1010 }
];

// Hash each value and key separately
const leaves = [];
for (const pair of keyValuePairs) {
  const valueHash = poseidon1([pair.value]);
  const keyHash = poseidon1([pair.key]);
  leaves.push(valueHash);
  leaves.push(keyHash);
}

// Create the merkle tree
const tree = new LeanIMT(hash, leaves);
const merkleRoot = tree.root;
console.log("Merkle Root:", merkleRoot);

// Create a proof for a specific leaf (index 7, which is the value 444)
const proof = tree.generateProof(7);
const numberReplacer = (key, value) =>
  typeof value === 'bigint' || typeof value === 'number' ? value.toString() : value;
console.log("Proof:", JSON.stringify(proof, numberReplacer, 2));

// Generate a key pair for signing
const privateKey = "1".padStart(64, "0");
const publicKey = derivePublicKey(privateKey);

// Sign the merkle root using the private key
const signature = signMessage(privateKey, merkleRoot);

// Format the signature for output
const formattedSignature = {
  R8: [signature.R8[0], signature.R8[1]],
  S: signature.S
};

console.log("Signed Root:", JSON.stringify(formattedSignature, numberReplacer, 2));
console.log("Signed by Public Key:", JSON.stringify([publicKey[0], publicKey[1]], numberReplacer, 2)); 