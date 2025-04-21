import { poseidon } from 'poseidon-lite';
import { derivePublicKey, signMessage, verifySignature } from '@zk-kit/eddsa-poseidon';

/**
 * SignatureService - Handle EdDSA signatures using Poseidon hash
 */
export class SignatureService {
  constructor() {
    this.keyPair = null;
  }

  /**
   * Generate a new EdDSA key pair
   * @returns {Object} The generated key pair with publicKey and privateKey
   */
  generateKeyPair() {
    const privateKey = "secret" + Math.random(); // Generate a random private key
    this.keyPair = {
      privateKey,
      publicKey: derivePublicKey(privateKey)
    };
    
    return {
      publicKey: [
        this.keyPair.publicKey[0].toString(),
        this.keyPair.publicKey[1].toString()
      ],
      privateKey: this.keyPair.privateKey.toString()
    };
  }

  /**
   * Import an existing key pair
   * @param {string} privateKey - The private key as a string
   * @returns {Object} The imported key pair
   */
  importKeyPair(privateKey) {
    try {
      this.keyPair = {
        privateKey,
        publicKey: derivePublicKey(privateKey)
      };
      
      return {
        publicKey: [
          this.keyPair.publicKey[0].toString(),
          this.keyPair.publicKey[1].toString()
        ],
        privateKey: this.keyPair.privateKey.toString()
      };
    } catch (error) {
      throw new Error(`Failed to import key pair: ${error.message}`);
    }
  }

  /**
   * Sign a message (typically a Merkle root)
   * @param {string} message - The message to sign
   * @returns {Object} The signature with R8 and S components
   */
  sign(message) {
    if (!this.keyPair) {
      throw new Error('No key pair available. Generate or import one first.');
    }

    // Convert message to BigInt if it's not already
    const messageBigInt = typeof message === 'bigint' 
      ? message 
      : BigInt(message);

    // Sign the message
    const signature = signMessage(this.keyPair.privateKey, messageBigInt);

    // Return the signature in a format suitable for our circuit
    return {
      R8: [signature.R8[0].toString(), signature.R8[1].toString()],
      S: signature.S.toString()
    };
  }

  /**
   * Verify a signature
   * @param {string|BigInt} message - The original message (Merkle root)
   * @param {Object} signature - The signature to verify
   * @param {Array<string>} publicKey - The public key that signed the message
   * @returns {boolean} Whether the signature is valid
   */
  verify(message, signature, publicKey) {
    try {
      // Convert all inputs to the right format
      const messageBigInt = typeof message === 'bigint' 
        ? message 
        : BigInt(message);
      
      const formattedPubKey = [
        typeof publicKey[0] === 'bigint' ? publicKey[0] : BigInt(publicKey[0]),
        typeof publicKey[1] === 'bigint' ? publicKey[1] : BigInt(publicKey[1])
      ];
      
      const formattedSignature = {
        R8: [
          typeof signature.R8[0] === 'bigint' ? signature.R8[0] : BigInt(signature.R8[0]),
          typeof signature.R8[1] === 'bigint' ? signature.R8[1] : BigInt(signature.R8[1])
        ],
        S: typeof signature.S === 'bigint' ? signature.S : BigInt(signature.S)
      };
      
      // Verify the signature
      return verifySignature(
        messageBigInt,
        formattedSignature,
        formattedPubKey
      );
    } catch (error) {
      console.error('Signature verification failed:', error);
      return false;
    }
  }

  /**
   * Sign a POD (entire data structure with Merkle root)
   * @param {Object} pod - The POD data structure
   * @returns {Object} The POD with signature added
   */
  signPOD(pod) {
    if (!pod.merkleRoot) {
      throw new Error('POD must have a Merkle root to sign');
    }

    const signature = this.sign(pod.merkleRoot);
    const publicKey = [
      this.keyPair.publicKey[0].toString(),
      this.keyPair.publicKey[1].toString()
    ];

    return {
      ...pod,
      signature,
      publicKey
    };
  }

  /**
   * Verify a signed POD
   * @param {Object} pod - The signed POD to verify
   * @returns {boolean} Whether the POD signature is valid
   */
  verifyPOD(pod) {
    if (!pod.merkleRoot || !pod.signature || !pod.publicKey) {
      throw new Error('POD must have merkleRoot, signature, and publicKey');
    }

    return this.verify(pod.merkleRoot, pod.signature, pod.publicKey);
  }
}

export default SignatureService; 