const { LeanIMT } = require("@zk-kit/lean-imt");
const { poseidon1, poseidon2 } = require("poseidon-lite");

// Define our hash function for the Merkle tree nodes
const hash = (a, b) => poseidon2([a, b]);

// Helper function to display data in a readable way
const numberReplacer = (key, value) =>
    typeof value === 'bigint' || typeof value === 'number' ? value.toString() : value;

// Function to print tree information
function printTreeInfo(tree, name = "Tree") {
    console.log(`\n--- ${name} Info ---`);
    console.log(`Root: ${tree.root}`);
    console.log(`Depth: ${tree.depth}`);
    console.log(`Leaves Count: ${tree.leaves.length}`);
}

// 1. Create an empty tree
console.log("1. Creating an empty tree");
const emptyTree = new LeanIMT(hash);
printTreeInfo(emptyTree, "Empty Tree");

// 2. Create a tree with initial leaves
console.log("\n2. Creating a tree with initial leaves");
const initialLeaves = [1, 2, 3, 4, 5].map(value => poseidon1([value]));
const treeWithLeaves = new LeanIMT(hash, initialLeaves);
printTreeInfo(treeWithLeaves, "Tree With Initial Leaves");

// 3. Add a new leaf
console.log("\n3. Adding a new leaf");
const newLeaf = poseidon1([6]);
treeWithLeaves.insert(newLeaf);
printTreeInfo(treeWithLeaves, "Tree After Insert");

// 4. Generate and verify a proof
console.log("\n4. Generating and verifying a proof");
const leafIndex = 2; // Proving the 3rd leaf (index 2)
const proof = treeWithLeaves.generateProof(leafIndex);
console.log(`Proof for leaf at index ${leafIndex}:`);
console.log(JSON.stringify(proof, numberReplacer, 2));

// Verify the proof
const isValid = treeWithLeaves.verifyProof(proof);
console.log(`Proof verification result: ${isValid}`);

// 5. Update a leaf
console.log("\n5. Updating a leaf");
const oldLeaf = treeWithLeaves.leaves[3]; // 4th leaf (index 3)
const updatedLeaf = poseidon1([444]); // New value
treeWithLeaves.update(3, updatedLeaf);
printTreeInfo(treeWithLeaves, "Tree After Update");

console.log(`\nOld leaf value at index 3: ${oldLeaf}`);
console.log(`New leaf value at index 3: ${updatedLeaf}`);

// Generating proof for the updated leaf
const updatedProof = treeWithLeaves.generateProof(3);
console.log("\nProof for updated leaf:");
console.log(JSON.stringify(updatedProof, numberReplacer, 2));

// 6. Demonstrate binary tree structure
console.log("\n6. Binary tree structure demonstration");
const smallTree = new LeanIMT(hash, [
    poseidon1([1]), 
    poseidon1([2]), 
    poseidon1([3]), 
    poseidon1([4])
]);

console.log("Tree with 4 leaves structure:");
console.log(`Root: ${smallTree.root}`);
console.log(`Leaf 0: ${smallTree.leaves[0]}`);
console.log(`Leaf 1: ${smallTree.leaves[1]}`);
console.log(`Leaf 2: ${smallTree.leaves[2]}`);
console.log(`Leaf 3: ${smallTree.leaves[3]}`);

// Calculate intermediate nodes
const node01 = hash(smallTree.leaves[0], smallTree.leaves[1]);
const node23 = hash(smallTree.leaves[2], smallTree.leaves[3]);
const calculatedRoot = hash(node01, node23);

console.log(`\nManually calculated nodes:`);
console.log(`Node(0,1): ${node01}`);
console.log(`Node(2,3): ${node23}`);
console.log(`Calculated Root: ${calculatedRoot}`);
console.log(`Tree Root Matches Calculated Root: ${calculatedRoot === smallTree.root}`); 