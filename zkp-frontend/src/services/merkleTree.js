import { poseidon1, poseidon2 } from 'poseidon-lite';
import { LeanIMT } from '@zk-kit/lean-imt';

// Convert input to string with proper handling
const toStringValue = (n) => {
  if (typeof n === 'string') return n;
  if (typeof n === 'number' || typeof n === 'bigint') return n.toString();
  throw new Error(`Cannot convert ${typeof n} to string`);
};

/**
 * MerkleTreeService - Handle operations related to Merkle trees
 * Built for key-value pairs with a configurable depth
 */
export class MerkleTreeService {
  constructor(depth = 5) {
    this.depth = depth;
    this.reset();
  }

  /**
   * Reset the state of the Merkle tree service
   */
  reset() {
    this.data = [];
    this.tree = null;
    this.root = null;
  }

  /**
   * Add a key-value pair to the data
   * @param {number|string} key - The key (will be hashed)
   * @param {number|string} value - The value (will be hashed)
   */
  addKeyValuePair(key, value) {
    const keyStr = toStringValue(key);
    const valueStr = toStringValue(value);
    this.data.push({ key: keyStr, value: valueStr });
  }


  /**
   * Build the Merkle tree from the current data
   */
  buildTree() {
    // Convert data to leaves
    const leaves = [];
    
    // Create leaves for each key-value pair
    for (let i = 0; i < this.data.length; i++) {
      const { key, value } = this.data[i];
      
      // Hash the value
      const valueHash = poseidon1([value]);
      
      // Hash the key
      const keyHash = poseidon1([key]);
      
      // Add key-value pair as adjacent leaves
      leaves.push(keyHash);
      leaves.push(valueHash);
    }
    // Pad with zeros if needed to reach a power of 2
    // const totalLeaves = 2 ** this.depth;
    // while (leaves.length < totalLeaves) {
    //   leaves.push("0");
    // }
    
    // Build the tree with error handling
    try {
        
      if (leaves.length === 0) {
        throw new Error('No leaves available to build Merkle tree');
      }
      const hash = (a, b) => poseidon2([a, b]);
      this.tree = new LeanIMT(hash, leaves);
      this.root = this.tree.root;
    } catch (error) {
      console.error("Failed to build Merkle tree:", error);
      throw new Error(`Failed to build Merkle tree: ${error.message}`);
    }
    
    return this.root;
  }

  /**
   * Get the Merkle proof for a specific key-value pair
   * @param {number} index - The index of the key-value pair in the data array
   * @returns {Object} The proof data including value, key, siblings, and index
   */
  getProof(index) {
    if (!this.tree) {
      throw new Error('Tree has not been built yet');
    }
    
    if (index < 0 || index >= this.data.length) {
      throw new Error('Index out of bounds');
    }
    
    const { key, value } = this.data[index];
    
    // Calculate leaf indices (key is at 2*index, value is at 2*index+1)
    const valueIndex = index * 2 +1;
    
    // Get the sibling paths
    const valueProof = this.tree.generateProof(valueIndex);
    
    return {
      key: key.toString(),
      value: value.toString(),
      index: valueIndex.toString(),
      siblings: valueProof.siblings.map(s => s.toString()),
      root: this.root.toString()
    };
  }
  
  /**
   * Export the Merkle tree data in a format suitable for POD
   * @returns {Object} The POD data structure
   */
  exportData() {
    if (!this.tree || !this.root) {
      throw new Error('Tree has not been built yet');
    }
    // Ensure data is properly formatted as an array of objects
    const formattedData = this.data.map(({ key, value }) => ({
      key: key.toString(),
      value: value.toString()
    }));
    
    return {
      data: formattedData,
      merkleRoot: this.root.toString(),
      // The signature will be added by the signature service
    };
  }
  
  /**
   * Import data from a POD structure
   * @param {Object} podData - The POD data structure
   */
  importData(podData) {
    this.reset();
    
    if (!podData?.data || !Array.isArray(podData.data)) {
      throw new Error('Invalid POD data format');
    }
    
    // Import data
    podData.data.forEach(({ key, value }) => {
      this.addKeyValuePair(key, value);
    });
    
    // Rebuild the tree
    this.buildTree();
    
    // Verify the root matches if provided
    if (podData.merkleRoot && this.root.toString() !== podData.merkleRoot) {
      throw new Error('Imported POD has mismatched Merkle root');
    }
    
    return this.root;
  }
}

export default MerkleTreeService; 