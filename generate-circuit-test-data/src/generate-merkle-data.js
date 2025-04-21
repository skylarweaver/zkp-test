import { poseidon2 } from 'poseidon-lite';

// Function to convert a number to a BigInt
const toBigInt = (n) => BigInt(n);

class MerkleTree {
  constructor(values) {
    // Ensure we have a power of 2 number of leaves by padding with zeros
    const depth = Math.ceil(Math.log2(values.length));
    const totalLeaves = Math.pow(2, depth);
    const paddedValues = [...values];
    while (paddedValues.length < totalLeaves) {
      paddedValues.push(0);
    }
    
    // Convert values to BigInt and create leaf nodes
    this.leaves = paddedValues.map(toBigInt);
    this.layers = [this.leaves];
    
    // Build the tree
    this.buildTree();
  }
  
  buildTree() {
    let layer = this.leaves;
    
    // Continue until we reach the root
    while (layer.length > 1) {
      const nextLayer = [];
      
      // Process pairs of nodes
      for (let i = 0; i < layer.length; i += 2) {
        const left = layer[i];
        const right = layer[i + 1];
        const hash = poseidon2([left.toString(), right.toString()]);
        nextLayer.push(hash);
      }
      
      // Add the new layer to our layers array
      this.layers.push(nextLayer);
      layer = nextLayer;
    }
  }
  
  getRoot() {
    return this.layers[this.layers.length - 1][0];
  }
  
  getProof(index) {
    if (index < 0 || index >= this.leaves.length) {
      throw new Error('Index out of bounds');
    }
    
    const proof = [];
    let currentIndex = index;
    
    // Go through each layer (except the root)
    for (let i = 0; i < this.layers.length - 1; i++) {
      const layer = this.layers[i];
      const isLeft = currentIndex % 2 === 0;
      const siblingIndex = isLeft ? currentIndex + 1 : currentIndex - 1;
      
      // Add the sibling to the proof
      if (siblingIndex < layer.length) {
        proof.push(layer[siblingIndex]);
      }
      
      // Update the index for the next layer
      currentIndex = Math.floor(currentIndex / 2);
    }
    
    return proof;
  }
}

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const values = [];
  let valueToProve = null;
  
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--values' || args[i] === '-v') {
      // Parse comma-separated values
      const valuesStr = args[i + 1];
      if (valuesStr) {
        values.push(...valuesStr.split(',').map(v => parseInt(v.trim(), 10)));
        i++; // Skip the next argument
      }
    } else if (args[i] === '--prove' || args[i] === '-p') {
      // Parse value to prove
      const valueStr = args[i + 1];
      if (valueStr) {
        valueToProve = parseInt(valueStr, 10);
        i++; // Skip the next argument
      }
    } else if (args[i] === '--help' || args[i] === '-h') {
      printHelp();
      process.exit(0);
    }
  }
  
  // Use default values if none provided
  if (values.length === 0) {
    values.push(5, 6, 7, 8, 9);
  }
  
  if (valueToProve === null) {
    valueToProve = values[0];
  }
  
  return { values, valueToProve };
}

// Print help information
function printHelp() {
  console.log(`
Usage: node generate-merkle-data.js [options]

Options:
  --values, -v <values>    Comma-separated list of values to include in the Merkle tree
                          Example: --values 5,6,7,8,9
  --prove, -p <value>      Value to generate a proof for
                          Example: --prove 5
  --help, -h               Show this help message

If no options are provided, default values [5,6,7,8,9] will be used with a proof for value 5.
  `);
}

// Main function
function main() {
  const { values, valueToProve } = parseArgs();
  
  console.log('Creating Merkle tree with values:', values);
  const tree = new MerkleTree(values);
  
  console.log('\nMerkle Root:', tree.getRoot().toString());
  
  console.log(`\nGenerating proof for value: ${valueToProve}`);
  
  try {
    const index = values.indexOf(valueToProve);
    if (index === -1) {
      throw new Error(`Value ${valueToProve} not found in the tree`);
    }
    
    const proof = tree.getProof(index);
    
    console.log('Index:', index);
    console.log('Merkle Proof (siblings):', proof.map(s => s.toString()));
    
    // Format the output to match your circuit's input format
    console.log('\nFormatted input for your circuit:');
    console.log(JSON.stringify({
      value: valueToProve.toString(),
      merkleProof: proof.map(s => s.toString()),
      merkleRoot: tree.getRoot().toString()
    }, null, 2));
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Run the main function
main(); 