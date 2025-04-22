import React, { useState } from 'react';
import ProofService from '../services/proofService';

/**
 * ProofVerifier component
 * Verifies zero-knowledge proofs
 */
function ProofVerifier() {
  // Services
  const [proofService] = useState(new ProofService());
  
  // State
  const [proofInput, setProofInput] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  /**
   * Verify a proof from JSON input
   */
  const verifyProof = async () => {
    try {
      setError('');
      setVerificationResult(null);
      setIsVerifying(true);
      
      if (!proofInput.trim()) {
        throw new Error('Proof input is required');
      }
      
      // Parse the proof
      const proofData = proofService.importProof(proofInput);
      
      // Validate the proof data
      if (!proofData.proof || !proofData.publicSignals) {
        throw new Error('Invalid proof format');
      }
      
      // Verify the proof
      const isValid = await proofService.verifyProof(
        proofData.proof,
        proofData.publicSignals
      );
      
      // Set the verification result
      setVerificationResult({
        isValid,
        timestamp: new Date().toISOString(),
        meta: proofData.meta || {}
      });
      
      if (isValid) {
        setSuccess('Proof verified successfully');
      } else {
        setError('Proof verification failed');
      }
      
      setTimeout(() => {
        setSuccess('');
        setError('');
      }, 3000);
    } catch (err) {
      setError(`Failed to verify proof: ${err.message}`);
    } finally {
      setIsVerifying(false);
    }
  };
  
  /**
   * Handle changes to the proof input
   */
  const handleProofInputChange = (e) => {
    setProofInput(e.target.value);
    setVerificationResult(null);
  };
  
  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Verify a Zero-Knowledge Proof</h1>
      
      {/* Proof Input Section */}
      <div className="bg-white shadow-md rounded p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Proof Input</h2>
        
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">
            Proof JSON
          </label>
          <textarea
            value={proofInput}
            onChange={handleProofInputChange}
            placeholder="Paste your proof JSON here"
            rows={20}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 h-60 font-mono"
          />
        </div>
        
        <button
          onClick={verifyProof}
          disabled={isVerifying}
          className={`px-6 py-3 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            isVerifying
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          {isVerifying ? 'Verifying...' : 'Verify Proof'}
        </button>
      </div>
      
      {/* Status Messages */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}
      
      {/* Verification Result */}
      {verificationResult && (
        <div className="bg-white shadow-md rounded p-6">
          <h2 className="text-xl font-semibold mb-4">Verification Result</h2>
          
          <div className="mb-6">
            <div className={`p-4 rounded items-center ${
              verificationResult.isValid
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${
                verificationResult.isValid
                  ? 'bg-green-500 text-white'
                  : 'bg-red-500 text-white'
              }`}>
                {verificationResult.isValid ? '✓' : '✗'}
              </div>
              <div>
                <h3 className="font-bold text-lg">
                  {verificationResult.isValid ? 'Valid Proof' : 'Invalid Proof'}
                </h3>
                <p>
                  Verification completed at {new Date(verificationResult.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
          
          {verificationResult.meta && (
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Proof Metadata</h3>
              <div className="bg-gray-100 p-4 rounded">
                {verificationResult.meta.description && (
                  <p className="mb-2">
                    <span className="font-medium">Description:</span> {verificationResult.meta.description}
                  </p>
                )}
                {verificationResult.meta.timestamp && (
                  <p>
                    <span className="font-medium">Created:</span> {new Date(verificationResult.meta.timestamp).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ProofVerifier; 