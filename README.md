# ZKP Test Project: Zero-Knowledge Proofs for Data Verification

This project demonstrates the practical implementation of zero-knowledge proofs using snarkJS and circom to create a system for verifiable, privacy-preserving data structures.

## Overview

The ZKP Test Project enables three core functionalities:

1. **Create PODs (Provable Object Data)**: Generate a signed Merkle tree containing key-value pairs that can later be selectively disclosed.
2. **Generate Zero-Knowledge Proofs**: Prove properties about specific values in a POD without revealing the actual values.
3. **Verify Proofs**: Validate proofs to confirm claims about data without revealing sensitive information.

## Features

- **Key-Value Verification**: Prove a specific key corresponds to a value within a Merkle tree without revealing the value itself
- **Range Proofs**: Demonstrate that a hidden value falls within specified bounds (e.g., "I'm over 18" without revealing exact age)
- **Signature Verification**: Verify the authenticity of the data through EdDSA signatures
- **Persistent State Management**: Maintain state across application views using React context
- **Workflow Navigation**: Intuitive workflow that guides users through the POD creation → Proof generation → Verification process

## Technical Implementation

The project uses several cryptographic primitives:

- **Merkle Trees**: For efficient proof of inclusion without revealing the entire dataset
- **EdDSA Signatures**: For authenticating the Merkle root
- **Zero-Knowledge Proofs**: Using the Groth16 proving system via snarkJS
- **Poseidon Hash**: For efficient hashing within the zero-knowledge circuit

## Project Structure

```
zkp-test-project/
├── circuits/                  # Circom circuits for zero-knowledge proofs
│   └── proveValueInMerkle.circom # Main circuit for proving values in a Merkle tree
├── zkp-frontend/              # Frontend React application
│   ├── src/
│   │   ├── components/        # UI components for each functionality
│   │   │   ├── PODCreator.jsx     # Create and sign Merkle trees
│   │   │   ├── ProofGenerator.jsx # Generate ZK proofs
│   │   │   ├── ProofVerifier.jsx  # Verify proofs
│   │   │   └── Navigation.jsx     # App navigation
│   │   ├── services/          # Core business logic
│   │   │   ├── merkleTree.js      # Merkle tree implementation
│   │   │   ├── signatureService.js # EdDSA signature handling
│   │   │   ├── proofService.js    # ZK proof generation and verification
│   │   │   └── circuitLoader.js   # Load WebAssembly circuit
│   │   ├── contexts/
│   │   │   └── AppContext.jsx     # State management across views
│   │   └── App.jsx            # Main application component
│   ├── public/
│   │   └── circuit/           # Circuit artifacts (after compilation)
│   │       ├── circuit.wasm       # WebAssembly compiled circuit
│   │       ├── circuit_final.zkey # Proving key
│   │       └── verification_key.json # Verification key
├── generate-circuit-test-data/ # Utilities for generating test data
│   ├── src/                    # Source code for test data generation
│   │   ├── my-merkle-tree.js    # Basic Merkle tree generation
│   │   └── my-signed-merkle-tree.js # Signed Merkle tree with EdDSA
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- circom compiler (for circuit compilation)
- snarkJS (for proof generation and verification)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/zkp-test-project.git
cd zkp-test-project
```

2. Install dependencies:
```bash
cd zkp-frontend
npm install
```

3. Compile the circuit (one-time setup):
```bash
# Download Powers of Tau parameters
curl -o pot15_final.ptau https://hermez.s3-eu-west-1.amazonaws.com/pot15_final.ptau

# Compile circuit
circom ../circuits/proveValueInMerkle.circom --r1cs --wasm --sym -o build

# Generate proving key
cd build
npx snarkjs groth16 setup proveValueInMerkle.r1cs ../pot15_final.ptau circuit_0000.zkey

# Contribute to the ceremony
npx snarkjs zkey contribute circuit_0000.zkey circuit_final.zkey --name="First contribution" -e="random entropy"

# Export verification key
npx snarkjs zkey export verificationkey circuit_final.zkey verification_key.json

# Create the public/circuit directory
mkdir -p ../public/circuit

# Copy artifacts
cp proveValueInMerkle_js/proveValueInMerkle.wasm ../public/circuit/circuit.wasm
cp circuit_final.zkey ../public/circuit/circuit_final.zkey
cp verification_key.json ../public/circuit/verification_key.json
```

4. Start the development server:
```bash
cd ..
npm run dev
```

## Usage Flow

### 1. Create a POD
- Enter key-value pairs that you want to include in your POD
- Generate or import a private key
- Create and sign the POD
- Copy the POD for use in the next step

### 2. Generate a Proof
- Import the POD created in the previous step
- Select a specific key-value pair from the POD
- Set the bounds you want to prove (e.g., value is between 100 and 500)
- Generate the zero-knowledge proof
- Copy the proof for verification

### 3. Verify a Proof
- Import the proof generated in the previous step
- Verify the proof to confirm the claim
- View detailed verification results

## Security Considerations

For a production environment, consider:
- Conducting a proper multi-party computation for the trusted setup
- Implementing proper key management strategies
- Adding additional security measures for private keys
- Using secure, audited libraries for cryptographic operations

## Circuit Development and Testing

### Testing with zkREPL

The project includes a `generate-circuit-test-data` directory that contains utilities for generating test data to use while developing the circom circuit. These tools help you:

1. Generate sample Merkle trees with key-value pairs
2. Create signatures using EdDSA
3. Format data into the correct structure for circuit inputs
4. Generate proofs for testing in zkREPL or other environments

To use the test data generators:

```bash
cd generate-circuit-test-data
npm install
node src/my-signed-merkle-tree.js
```

This creates sample data that you can use as input for testing the circuit in environments like [zkREPL](https://zkrepl.dev/), helping with circuit development and debugging before integrating with the frontend application.

The generated data follows the input format expected by the `proveValueInMerkle.circom` circuit, making it easy to test circuit functionality independently from the UI.

## Learning Resources

- [ZK Guide by Ethereum Foundation](https://ethereum.org/en/zero-knowledge-proofs/)
- [Introduction to circom and snarkJS](https://docs.circom.io/)
- [zkREPL - Interactive circom code editor](https://zkrepl.dev/)
- [iden3 GitHub](https://github.com/iden3) - Creators of circom and snarkJS

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details. 