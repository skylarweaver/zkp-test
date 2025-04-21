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
      
      // Generate the proof
      const { proof, publicSignals } = await snarkjs.groth16.fullProve(
        inputs,
        this.wasmPath,
        this.zkeyPath
      );
      
      // Format the proof and public signals for easier use
      return {
        proof,
        publicSignals,
        // Add metadata for the proof display
        meta: {
          description: `Proof for key: ${inputs.key}`,
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