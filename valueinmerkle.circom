pragma circom 2.1.6;

include "circomlib/poseidon.circom";
include "circomlib/comparators.circom";
include "circomlib/bitify.circom";
include "circomlib/eddsaposeidon.circom";

template proveValueForKeyIsInSignedMerkleTreeAndWithinBounds(depth) {
    signal input key; // public
    signal input value; // private
    signal input index; // private; position of the value leaf
    signal input siblings[depth];  // private; sibling hashes
    signal input root; // private
    signal input lowerbound; // public
    signal input upperbound; // public
    signal merkleHash[depth + 1];  // to store each intermediate hash
    signal keyHash; // Hash key to make sure it matches sibling which proves the key is included in the merkle tree
    signal input pubKey[2]; // pubkey that signed the merkle root, public
    signal input signedRoot_R8[2]; // signed root part 1, private
    signal input signedRoot_S; // signed root part 2, private
    
    log("Input root:", root);  
    log();
    
    // Convert index to binary for determining left/right at each level of merkle tree
    component indexBits = Num2Bits(depth);
    indexBits.in <== index;
    component valueBits = Num2Bits(64); // to resolve: "`value` needs to be constrained to ensure that it is <= p/2."
    valueBits.in <== value;
    component upperboundBits = Num2Bits(64); // to resolve: "`value` needs to be constrained to ensure that it is <= p/2."
    upperboundBits.in <== upperbound;

    // // Check that value is within bounds
    component lessThan = LessThan(64);
    lessThan.in[0] <== value;
    lessThan.in[1] <== upperbound;
    lessThan.out === 1;

    component greaterThan = GreaterThan(64);
    greaterThan.in[0] <== value;
    greaterThan.in[1] <== lowerbound;
    greaterThan.out === 1;

    // Hash the initial value
    component poseidonOfValue = Poseidon(1);
    poseidonOfValue.inputs[0] <== value;
    merkleHash[0] <== poseidonOfValue.out;
    log("Hashed Value: ", merkleHash[0]);

    // Hash the value and make sure it matches the immediate sibling
    component poseidonOfKey = Poseidon(1);
    poseidonOfKey.inputs[0] <== key;
    keyHash <== poseidonOfKey.out;
    log();
    log("Hash of key:", keyHash);
    log("Should equal Sibling[0]:", siblings[0]);  
    log();

    siblings[0] === keyHash; // make sure immediate sibling is the hash of the value

    component merkleHasher[depth];  // declare component statically
    signal hashIfLeftChildElseZero[depth];  // declare signal statically
    signal hashIfRightChildElseZero[depth];  // declare signal statically
    signal siblingIfLeftElseZero[depth];  // declare signal statically
    signal siblingIfRightElseZero[depth];  // declare signal statically

    // Loop through each level of merkle tree, starting from bottom, recreate merkle tree and assert each step of the way.
    for (var i = 0; i < depth; i++) {
        merkleHasher[i] = Poseidon(2);
        
        hashIfLeftChildElseZero[i] <== (1 - indexBits.out[i]) * merkleHash[i]; // if left child, use new hash; else zero
        hashIfRightChildElseZero[i] <== indexBits.out[i] * merkleHash[i]; // if right child, use new hash; else zero

        siblingIfLeftElseZero[i] <== indexBits.out[i] * siblings[i]; // if right child, use the sibling; else zero
        siblingIfRightElseZero[i] <== (1 - indexBits.out[i]) * siblings[i]; // if left child, use the sibling; else zero
        
        merkleHasher[i].inputs[0] <==  hashIfLeftChildElseZero[i] + siblingIfLeftElseZero[i]; // if indexBits.out[i] === 0, put new hash on left; else put sibling on left
        merkleHasher[i].inputs[1] <==  hashIfRightChildElseZero[i] + siblingIfRightElseZero[i]; // if indexBits.out[i] === 1, put new hash on right; else put sibling on right
        // log("i:", i);
        // log("merkleHasher[i].inputs[0]", merkleHasher[i].inputs[0]);
        // log("merkleHasher[i].inputs[1]", merkleHasher[i].inputs[1]);

        merkleHash[i + 1] <== merkleHasher[i].out;
    }
    log();
    log("Computed Merkle Root (should equal input root):", merkleHash[depth]);

    root === merkleHash[depth];  // final computed merkle root must match input root 

    // Check that root is properly signed by provided (public) pub key
    component sigVerifier = EdDSAPoseidonVerifier();
    sigVerifier.enabled <== 1;
    sigVerifier.Ax <== pubKey[0];
    sigVerifier.Ay <== pubKey[1];
    sigVerifier.S <== signedRoot_S;
    sigVerifier.R8x <== signedRoot_R8[0];
    sigVerifier.R8y <== signedRoot_R8[1];
    sigVerifier.M <== root;
    // There is no "out" for EdDSAVerifier, so nothing explicit to check. If does not fail, assume correctly signed

}

component main { public [key, lowerbound, upperbound, pubKey] } = proveValueForKeyIsInSignedMerkleTreeAndWithinBounds(5);

// Note: index should always be the index of the "value"
/* INPUT = {
    "key": "4",
    "value": "444",
    "root": "2410060041662479625104463288801171177730038979372211654245303149537675822189",
    "signedRoot_R8": [
        "12008399599765881843647625022259516683596781671064158301055175038428110261883",
        "3813225052866031216134840235037920001354978356951613895340109854851006967456"
    ],
    "signedRoot_S": "906152090810102458345295621868221305219170208225118200859232005163109594912",
    "index": "7",
    "siblings": [
        "9900412353875306532763997210486973311966982345069434572804920993370933366268",
        "20966615695828811456828362408529419539770761000822471897474995734347766760539",
        "3999747372056169255287904454018060336549340367781560710060580689405680340622",
        "17005211768461095478644188038333348431977856333155049743072794073818140025876",
        "12766331384651241322866832395440875696187197433078785520469117845961669511047"
    ],
    "lowerbound": "0",
    "upperbound": "500",
    "pubKey": [
        "12981577778853600627300647406335280042780558321152360659770344479901705116398",
        "20212930197870073521983811105864865363227616457743210051335548370350422091595"
    ]

} */


// TODO
// 1) DONE. test case generation using typescript libraries: poseidon-lite and lean-imt
// 2) DONE. adjust merkle tree verification to account for 'index' and dont assume key is always on left :)
// 3) DONE. add bound check to ensure between two values (using comparison circuit in circomlib: https://github.com/iden3/circomlib/blob/master/circuits/comparators.circom)
// 4) DONE. Change from just value to checking if there is a private value associated with a certain key (that is within public bounds and included in private merkle root)
// 5) DONE. add signature (pull in module)