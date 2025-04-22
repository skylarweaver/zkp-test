import * as snarkjs from 'snarkjs';

/**
 * ProofService - Handle ZK proof generation and verification
 */
export class ProofService {
  constructor() {
    // Paths to the required artifacts
    this.wasmPath = '/circuit/circuit.wasm';
    this.zkeyPath = '/circuit/circuit_final.zkey';
    this.vkeyPath = '/circuit/verification_key.json';
    
    // Cache the verification key once loaded
    this.vKey = null;
  }
  
  /**
   * Load the verification key
   * @returns {Promise<Object>} The verification key
   */
  async loadVerificationKey() {
    if (this.vKey) {
      return this.vKey;
    }
    
    try {
      const response = await fetch(this.vkeyPath);
      this.vKey = await response.json();
      return this.vKey;
    } catch (error) {
      throw new Error(`Failed to load verification key: ${error.message}`);
    }
  }

  /**
   * Format the circuit inputs from a proof request
   * @param {Object} proofRequest - Object containing necessary data for the proof
   * @returns {Object} Formatted inputs for the circuit
   */
  formatCircuitInputs(proofRequest) {
    const {
      key,
      value,
      index,
      siblings,
      root,
      lowerbound,
      upperbound,
      signedRoot_R8,
      signedRoot_S,
      pubKey
    } = proofRequest;
    
    // Ensure all fields are present
    if (!key || !value || !index || !siblings || !root || 
        lowerbound === undefined || upperbound === undefined || 
        !signedRoot_R8 || !signedRoot_S || !pubKey) {
      throw new Error('Missing required fields in proof request');
    }
    
    // Format inputs for the circuit in the expected format
    return {
      key,
      value,
      index,
      siblings,
      root,
      lowerbound,
      upperbound,
      signedRoot_R8,
      signedRoot_S,
      pubKey
    };
  }

  /**
   * Generate a proof
   * @param {Object} proofRequest - Contains the values needed for the proof
   * @returns {Promise<Object>} The generated proof and public inputs
   */
  async generateProof(proofRequest) {
    try {
      // Format inputs for the circuit
      const inputs = this.formatCircuitInputs(proofRequest);
      
      // Ensure all inputs are properly formatted for snarkjs
      const formattedInputs = {
        key: inputs.key.toString(),
        value: inputs.value.toString(),
        index: inputs.index.toString(),
        siblings: Array.isArray(inputs.siblings) 
          ? inputs.siblings.map(s => s.toString()) 
          : [],
        root: inputs.root.toString(),
        lowerbound: inputs.lowerbound.toString(),
        upperbound: inputs.upperbound.toString(),
        signedRoot_R8: Array.isArray(inputs.signedRoot_R8) 
          ? inputs.signedRoot_R8.map(s => s.toString()) 
          : ["0", "0"],
        signedRoot_S: inputs.signedRoot_S.toString(),
        pubKey: Array.isArray(inputs.pubKey) 
          ? inputs.pubKey.map(p => p.toString()) 
          : ["0", "0"]
      };
      
      console.log("Generating proof with inputs:", JSON.stringify(formattedInputs, null, 2));
      
      // Generate the proof with specific error handling
      let proof, publicSignals;
      try {
        // Try to generate the proof
        const result = await snarkjs.groth16.fullProve(
          formattedInputs,
          this.wasmPath,
          this.zkeyPath
        );
        proof = result.proof;
        publicSignals = result.publicSignals;
      } catch (snarkError) {
        console.error("SnarkJS error:", snarkError);
        // Check specifically for the _inputs.map error
        if (snarkError.message && snarkError.message.includes("_inputs.map")) {
          throw new Error("Input format error: expecting array but received another type. Please check the input data format.");
        }
        throw new Error(`Proof generation failed: ${snarkError.message}`);
      }
      
      // Format the proof and public signals for easier use
      return {
        proof,
        publicSignals,
        // Add metadata for the proof display with bounds information
        meta: {
          description: `Proof that the value for key: ${inputs.key} is between ${inputs.lowerbound} and ${inputs.upperbound}`,
          timestamp: Date.now()
        }
      };
    } catch (error) {
      console.error('Error generating proof:', error);
      throw new Error(`Failed to generate proof: ${error.message}`);
    }
  }

  /**
   * Verify a proof
   * @param {Object} proof - The proof to verify
   * @param {Array<string>} publicSignals - The public signals for verification
   * @returns {Promise<boolean>} Whether the proof is valid
   */
  async verifyProof(proof, publicSignals) {
    try {
      // Load the verification key if not already loaded
      const vKey = await this.loadVerificationKey();
      
      // Verify the proof
      const isValid = await snarkjs.groth16.verify(vKey, publicSignals, proof);
      
      return isValid;
    } catch (error) {
      console.error('Error verifying proof:', error);
      return false;
    }
  }

  /**
   * Export a proof in a format suitable for sharing
   * @param {Object} proofData - The proof data to export
   * @returns {string} JSON representation of the proof
   */
  exportProof(proofData) {
    try {
      return JSON.stringify(proofData, null, 2);
    } catch (error) {
      throw new Error(`Failed to export proof: ${error.message}`);
    }
  }

  /**
   * Import a proof from a JSON string
   * @param {string} proofJson - JSON representation of the proof
   * @returns {Object} The parsed proof data
   */
  importProof(proofJson) {
    try {
      return JSON.parse(proofJson);
    } catch (error) {
      throw new Error(`Failed to import proof: ${error.message}`);
    }
  }
}

export default ProofService; 