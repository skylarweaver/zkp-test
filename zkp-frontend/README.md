# Zero-Knowledge Proof Application

This application provides a user interface for creating PODs (Provable Object Data), generating zero-knowledge proofs, and verifying those proofs using the snarkJS library and a circom circuit.

## Prerequisites

- Node.js (v16+)
- npm or yarn
- circom compiler (for circuit compilation)
- snarkJS

## Project Structure

```
zkp-frontend/
├── public/
│   ├── circuit/        # Circuit artifacts go here
│   │   ├── circuit.wasm
│   │   ├── circuit_final.zkey
│   │   └── verification_key.json
├── src/
│   ├── components/     # React components for the UI
│   ├── services/       # Services for ZKP functionality
│   └── ...
```

## Setup Instructions

1. **Install dependencies**

```bash
npm install
```

2. **Compile the circuit**

Before running the application, you need to compile the circuit and generate the necessary artifacts. From the project root directory:

```bash
# Create a build directory for circuit compilation
mkdir -p build/circuits

# Download an existing Powers of Tau Phase 1 output (for circuits up to 2^12 constraints)
curl -o pot12_final.ptau https://hermez.s3-eu-west-1.amazonaws.com/pot12_final.ptau

# Compile circuit to R1CS
circom valueinmerkle.circom --r1cs --wasm --sym -o build/circuits

# Generate a proving key from Phase 1 output
snarkjs groth16 setup build/circuits/valueinmerkle.r1cs pot12_final.ptau build/circuits/circuit_0000.zkey

# Contribute to the Phase 2 ceremony
snarkjs zkey contribute build/circuits/circuit_0000.zkey build/circuits/circuit_final.zkey --name="First contribution" -e="random entropy"

# Export the verification key
snarkjs zkey export verificationkey build/circuits/circuit_final.zkey build/circuits/verification_key.json

# Copy the compiled artifacts to the React public folder
mkdir -p public/circuit
cp build/circuits/valueinmerkle_js/valueinmerkle.wasm public/circuit/circuit.wasm
cp build/circuits/circuit_final.zkey public/circuit/circuit_final.zkey
cp build/circuits/verification_key.json public/circuit/verification_key.json
```

3. **Start the development server**

```bash
npm run dev
```

## Usage Guide

### Creating a POD

1. Navigate to the "Create POD" page
2. Generate a new key pair or import an existing private key
3. Add key-value pairs to be included in the POD
4. Click "Create POD" to generate the POD
5. Verify the POD's signature if desired
6. Copy the POD for later use

### Creating a Proof

1. Navigate to the "Create Proof" page
2. Paste the previously created POD
3. Click "Load POD" to parse the POD
4. Select a key-value pair from the POD
5. Enter the lower and upper bounds for the value
6. Click "Generate Proof" to create a zero-knowledge proof
7. Copy the proof for later use

### Verifying a Proof

1. Navigate to the "Verify Proof" page
2. Paste the previously created proof
3. Click "Verify Proof" to check its validity
4. View the verification result

## Development

### Adding New Features

- To modify the circuit, edit the `valueinmerkle.circom` file and recompile
- To change the UI, modify the React components in `src/components/`
- To update the service logic, modify the service files in `src/services/`

