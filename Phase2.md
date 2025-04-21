# Zero-Knowledge Proof Project

## Summary of Phase 1: Zero-Knowledge Merkle Proof Circuit

This circuit enables a prover to demonstrate knowledge of a value (i.e., "22") paired to a key (i.e., "Age", though represented as a number) that exists in a (not public) Merkle tree root which is signed by a public key, without revealing the actual value, and while proving the value falls within specific bounds.

### Key Features:
- **Key-Value Verification**: Proves a specific key corresponds to a specific value by verifying the key's hash matches the appropriate sibling in the Merkle path.
- **Bound Verification**: Ensures the private value is greater than a public lower bound and less than a public upper bound.
- **Merkle Path Reconstruction**: Rebuilds the Merkle path using the private value, its position (index), and sibling hashes to verify inclusion in the tree with the claimed root.
- **Signature Validation**: Verifies the Merkle root was signed by a specific public key using EdDSA.

### Security Foundation:
The circuit's security relies on:
- Hash-based commitments (Poseidon hash function)
- Merkle tree inclusion proofs
- Digital signature verification
- Range proof constraints

This enables use cases like private data queries, range proofs on confidential data, and authenticated data structures with selective disclosure.

## Current Implementation Context

I have just written a working circuit that:
- Implements a zero-knowledge proof system for verifying that a value associated with a key:
  - Exists in a Merkle tree with a specific root
  - Falls within specified bounds (lower and upper)
  - The Merkle root is signed by a specific public key

## Phase 2 Goal: snarkJS Integration

Experiment with snarkJS to use the circuit created to allow people to:

### 1) Generate a POD (Provable Object Data)
**GUI Elements:**
- **Title**: Create a new POD
- **Functionality**:
  - Input the data that will go into the POD
  - Merkalize it
  - Input the PK and secret key that will sign the root of the POD
- **Buttons**:
  - Create POD
  - Verify (signature of the) POD
- Display area where the POD data was generated

### 2) Create a Proof
**GUI Elements:**
- **Title**: Create a proof
- **Functionality**:
  - Input the POD in a large text input
  - Input specific key and value to prove
  - Input bounds for the proof
  - PROVE it using a button
  - Display public inputs
  - Generate proof and outputs
- Display area for the generated proof

### 3) Verify a Proof
**GUI Elements:**
- **Title**: Verify a proof
- **Functionality**:
  - Input the proof data
  - Input the public inputs
  - Verify the proof with a button
- Display area showing verification result and details
