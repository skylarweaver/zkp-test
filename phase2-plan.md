# Implementation Plan for Phase 2: snarkJS Integration

## 1. Project Setup and Structure

### Initial Setup
```bash
# Create React app for the frontend
npx create-react-app zkp-frontend
cd zkp-frontend

# Install necessary dependencies
npm install snarkjs ethers big-integer @zk-kit/eddsa-poseidon @zk-kit/lean-imt poseidon-lite circomlib
```

### Project Structure
```
zkp-frontend/
├── public/
│   ├── circuit/        # Will contain compiled circuit artifacts
│   │   ├── circuit.wasm
│   │   ├── circuit_final.zkey
│   │   └── verification_key.json
├── src/
│   ├── components/     # React components for the UI
│   │   ├── PODCreator.jsx       # UI for creating a POD
│   │   ├── ProofGenerator.jsx   # UI for creating a proof
│   │   ├── ProofVerifier.jsx    # UI for verifying a proof
│   │   └── Navigation.jsx       # Navigation between pages
│   ├── services/       # Logic for interacting with snarkJS
│   │   ├── merkleTree.js        # Merkle tree implementation
│   │   ├── signatureService.js  # EdDSA signature handling
│   │   ├── proofService.js      # Generate and verify proofs
│   │   └── circuitLoader.js     # Load and prepare circuit artifacts
│   ├── utils/          # Helper functions
│   ├── App.js          # Main application component
│   └── index.js        # Entry point
```

## 2. Circuit Compilation and Setup

### Powers of Tau Ceremony
Before compiling our circuit, we need to understand the trusted setup process that zk-SNARKs require:

1. **Phase 1 (Circuit-Independent)**: The Powers of Tau is a multi-party computation ceremony that generates parameters used by all circuits up to a certain size. This is done once and the results can be reused.

2. **Phase 2 (Circuit-Specific)**: This phase is specific to our circuit and builds upon the Phase 1 output.

#### For Development
For development, we can download an existing Phase 1 output:

```bash
# Download an existing Powers of Tau Phase 1 output (for circuits up to 2^12 constraints)
curl -o pot15_final.ptau https://hermez.s3-eu-west-1.amazonaws.com/pot15_final.ptau
```

#### For Production
For a production environment, you may want to conduct your own Phase 1 ceremony for maximum security. This involves multiple participants, each adding randomness that they subsequently destroy:

```bash
# Step 1: Start a new Powers of Tau ceremony (specify maximum circuit size, e.g., 2^12)
npx snarkjs powersoftau new bn128 15 pot15_0000.ptau -v

# Step 2: First participant contributes randomness
npx snarkjs powersoftau contribute pot15_0000.ptau pot15_0001.ptau --name="First contributor" -v

# Step 3: Second participant contributes (this would be done on a different secure machine)
npx snarkjs powersoftau contribute pot15_0001.ptau pot15_0002.ptau --name="Second contributor" -v

# Step 4: Third participant contributes (and so on for as many participants as desired)
npx snarkjs powersoftau contribute pot15_0002.ptau pot15_0003.ptau --name="Third contributor" -v

# Step 5: Optional - Add a random beacon (e.g., using random data from a public source like Bitcoin blockchain)
npx snarkjs powersoftau beacon pot15_000N.ptau pot15_beacon.ptau 0102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f 10 -n="Final Beacon"
# Replace "N" in pot15_000N with the number of your last contribution

# Step 6: Prepare for Phase 2 (circuit-specific setup)
npx snarkjs powersoftau prepare phase2 pot15_beacon.ptau pot15_final.ptau -v

# Step 7: Verify the Powers of Tau ceremony
npx snarkjs powersoftau verify pot15_final.ptau
```

Key security considerations for a proper Phase 1 ceremony:
- Each participant should use a secure, air-gapped computer
- After contribution, participants should destroy the randomness they used
- The ceremony is compromised only if ALL participants collude
- The more participants, the more secure the setup
- Using a random beacon as the final contribution ensures security even if all human participants collude

### Steps to Compile Circuit
```bash
# Create a build directory for circuit compilation
mkdir -p build/circuits

# Compile circuit to R1CS
circom proveValueInMerkle.circom --r1cs --wasm --sym -l /Users/sky/zkp-test-project/zkp-frontend/node_modules

# Generate a proving key from Phase 1 output (Circuit-specific Phase 2 ceremony starts here)
npx snarkjs groth16 setup proveValueInMerkle.r1cs ../pot15_final.ptau circuit_0000.zkey

# Contribute to the Phase 2 ceremony (in production, multiple participants would contribute)
npx snarkjs zkey contribute circuit_0000.zkey circuit_final.zkey --name="First contribution" -e="random entropy"

# Export the verification key
npx snarkjs zkey export verificationkey circuit_final.zkey verification_key.json

# Copy the compiled artifacts to the React public folder
mkdir -p public/circuit
cp proveValueInMerkle_js/proveValueInMerkle.wasm ../../public/circuit/circuit.wasm
cp circuit_final.zkey ../../public/circuit/circuit_final.zkey
cp verification_key.json ../../public/circuit/verification_key.json
```

Note: In a production environment, the Phase 2 ceremony should involve multiple trusted participants. For our development purposes, a single contribution is sufficient, but it's important to understand that real-world applications would require a more extensive trusted setup process.

## 3. Frontend Implementation

### POD Creator Component
- UI for entering key-value pairs
- Functionality to build a Merkle tree from the data
- Interface for signing the Merkle root with EdDSA
- Display and export functionality for the generated POD

### Proof Generator Component
- UI for importing a POD
- Select specific key-value pair to prove
- Input bounds for the proof
- Generate the proof using snarkJS
- Display and export the proof and public inputs

### Proof Verifier Component
- UI for importing a proof
- Input area for public inputs
- Verify the proof using snarkJS
- Display verification result

## 4. Core Services Implementation
note: check to see if there any libraries we can use that do this already?

### 1. Merkle Tree Service
- Implement functions to:
  - Create a Merkle tree from key-value pairs
  - Generate Merkle proofs
  - Export/import tree data in JSON format

### 2. Signature Service
- Implement EdDSA signature functionality:
  - Generate key pairs
  - Sign Merkle roots
  - Verify signatures

### 3. Proof Service
- Connect to snarkJS:
  - Generate full proofs based on circuit inputs
  - Verify proofs against verification key
  - Format inputs/outputs for the circuit

### 4. Circuit Loader
- Load WASM and zkey files
- Prepare circuit for execution
- Handle WebAssembly initialization

## 5. Implementation Steps

### Step 1: Project Setup
- Set up the React project structure
- Create necessary directories for components and services
- Install required dependencies

### Step 2: Circuit Compilation and Preparation
- Download or generate Powers of Tau parameters
- Compile the circuit using circom
- Perform the Phase 2 ceremony
- Generate the verification key
- Copy all artifacts to the appropriate locations

### Step 3: Core Services Implementation
- Implement the Merkle tree service
  - Functions to create a tree from key-value pairs
  - Generate and verify Merkle proofs
- Implement the signature service
  - Generate key pairs
  - Sign and verify signatures for Merkle roots
- Create the proof service
  - Connect with snarkJS
  - Format inputs/outputs for the circuit
- Create the circuit loader service
  - Handle loading WASM and zkey files
  - Initialize WebAssembly

### Step 4: POD Creator Implementation
- Build the UI components for the POD Creator page
- Implement functionality to add/edit key-value pairs
- Connect to Merkle tree service for tree generation
- Connect to signature service for root signing
- Add export/save functionality for PODs

### Step 5: Proof Generator Implementation
- Build the UI components for the Proof Generator page
- Implement POD import functionality
- Create key-value pair selection interface
- Implement bound input controls
- Connect to proof service for proof generation
- Add export functionality for proofs and public inputs

### Step 6: Proof Verifier Implementation
- Build the UI components for the Proof Verifier page
- Implement proof and public input import
- Connect to proof service for verification
- Create verification result display

### Step 7: Testing and Refinement
- Test all components and flows
- Fix bugs and refine user experience
- Optimize performance
- Add documentation

## 6. Integration Details

### Circuit Integration with snarkJS
```javascript
// Example of generating a proof with snarkJS
import snarkjs from 'snarkjs';

async function generateProof(inputs) {
  // Load the circuit
  const { proof, publicSignals } = await snarkjs.groth16.fullProve(
    inputs,
    '/circuit/circuit.wasm',
    '/circuit/circuit_final.zkey'
  );
  
  return { proof, publicSignals };
}

// Example of verifying a proof with snarkJS
async function verifyProof(proof, publicSignals) {
  const vKey = await fetch('/circuit/verification_key.json').then(res => res.json());
  const isValid = await snarkjs.groth16.verify(vKey, publicSignals, proof);
  
  return isValid;
}
```

### Data Structures

#### POD Structure
```javascript
const podExample = {
  data: [
    { key: 1, value: 100 },  // Age
    { key: 2, value: 50000 }, // Salary
    { key: 3, value: 700 }   // Credit Score
  ],
  merkleRoot: "0x1234...", // Root of the Merkle tree
  signature: {             // EdDSA signature of the root
    R8: ["0xabcd...", "0xefgh..."],
    S: "0x5678..."
  },
  publicKey: ["0x91011...", "0x1213..."]
};
```

#### Proof Structure
```javascript
const proofExample = {
  // Original proof from snarkJS
  proof: {
    pi_a: [...],
    pi_b: [...],
    pi_c: [...]
  },
  // Public inputs 
  publicSignals: {
    key: 1,            // Which key we're proving for
    lowerBound: 18,    // Lower bound for the value
    upperBound: 120,   // Upper bound for the value
    pubKey: ["0x...", "0x..."]  // Public key that signed the Merkle root
  },
  // Additional metadata
  meta: {
    description: "Age proof", // Human readable description
    timestamp: 1623456789     // When the proof was generated
  }
};
```

## 7. Security Considerations

- **Browser Compatibility**: Ensure WebAssembly compatibility across browsers
- **Large Number Handling**: Use appropriate libraries (big-integer) for cryptographic operations
- **Private Key Management**: Never store private keys in localStorage or expose them
- **Input Validation**: Thoroughly validate all inputs before processing
- **Error Handling**: Implement robust error handling throughout the application 