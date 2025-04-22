## Phase 2 Goal: snarkJS Integration

Experiment with snarkJS to use the circuit created to allow people to:

### 1) Generate a POD (Provable Object Data)
**GUI Elements:**
- **Title**: Create a new POD
- **Functionality**:
  - Input the data that will go into the POD
  - Merklize it
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
