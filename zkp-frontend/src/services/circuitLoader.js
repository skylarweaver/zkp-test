/**
 * CircuitLoader - Handle loading and initialization of WebAssembly circuit
 */
export class CircuitLoader {
  constructor() {
    this.wasmPath = '/circuit/circuit.wasm';
    this.zkeyPath = '/circuit/circuit_final.zkey';
    this.vkeyPath = '/circuit/verification_key.json';
    
    this.wasmModule = null;
    this.vKey = null;
    this.isLoaded = false;
  }
  
  /**
   * Check if all required circuit artifacts are available
   * @returns {Promise<boolean>} Whether all artifacts are accessible
   */
  async checkArtifacts() {
    try {
      // Check WASM file
      const wasmResponse = await fetch(this.wasmPath, { method: 'HEAD' });
      if (!wasmResponse.ok) {
        console.error('WASM file not found:', this.wasmPath);
        return false;
      }
      
      // Check zkey file
      const zkeyResponse = await fetch(this.zkeyPath, { method: 'HEAD' });
      if (!zkeyResponse.ok) {
        console.error('zkey file not found:', this.zkeyPath);
        return false;
      }
      
      // Check verification key
      const vkeyResponse = await fetch(this.vkeyPath, { method: 'HEAD' });
      if (!vkeyResponse.ok) {
        console.error('Verification key not found:', this.vkeyPath);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error checking circuit artifacts:', error);
      return false;
    }
  }
  
  /**
   * Initialize the circuit (preload verification key)
   * @returns {Promise<boolean>} Whether initialization was successful
   */
  async initialize() {
    if (this.isLoaded) {
      return true;
    }
    
    try {
      // Check that all artifacts are available
      const artifactsAvailable = await this.checkArtifacts();
      if (!artifactsAvailable) {
        throw new Error('Circuit artifacts are not available');
      }
      
      // Load the verification key
      const vkeyResponse = await fetch(this.vkeyPath);
      this.vKey = await vkeyResponse.json();
      
      this.isLoaded = true;
      return true;
    } catch (error) {
      console.error('Error initializing circuit:', error);
      return false;
    }
  }
  
  /**
   * Get the paths to circuit artifacts
   * @returns {Object} Object containing paths to circuit artifacts
   */
  getPaths() {
    return {
      wasmPath: this.wasmPath,
      zkeyPath: this.zkeyPath,
      vkeyPath: this.vkeyPath
    };
  }
  
  /**
   * Get the verification key
   * @returns {Promise<Object>} The verification key
   */
  async getVerificationKey() {
    if (!this.vKey) {
      await this.initialize();
    }
    return this.vKey;
  }
}

export default CircuitLoader; 