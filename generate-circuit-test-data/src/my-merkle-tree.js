import { LeanIMT } from "@zk-kit/lean-imt"
import { poseidon1, poseidon2 } from "poseidon-lite"



// Hash function used to compute the tree nodes.
const hash = (a, b) => poseidon2([a, b])

// To create an instance of a LeanIMT, you must provide the hash function.
// You can also initialize a tree with a given list of leaves.
const leaves = [1, 111, 2, 222, 3, 333, 4, 444, 5, 555, 6, 666, 7, 777, 8, 888, 9, 999, 10, 1010].map(value => poseidon1([value])) 
const tree = new LeanIMT(hash, leaves)

console.log("Merkle Root:", tree.root)

const proof = tree.generateProof(7) // 6th leaf tree -- make sure this is of pwoer 2, leanimt makes trees that are not of uniform depth and this causes issues in my circuit
const numberReplacer = (key, value) =>
    typeof value === 'bigint' || typeof value === 'number' ? value.toString() : value;
console.log("Proof:", JSON.stringify(proof, numberReplacer, 2))



