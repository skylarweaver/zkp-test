import React, { useState, useRef } from 'react';
import MerkleTreeService from '../services/merkleTree';
import ProofService from '../services/proofService';
import { useAppContext } from '../contexts/AppContext';

/**
 * ProofGenerator component
 * Creates zero-knowledge proofs for specific key-value pairs in a POD
 */
function ProofGenerator() {
  // Services
  const [merkleService] = useState(new MerkleTreeService());
  const [proofService] = useState(new ProofService());
  
  // Get context state
  const { proofState, updateProofState, transferProofToVerifier } = useAppContext();
  
  // Local state
  const [isGeneratingProof, setIsGeneratingProof] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [directPodInput, setDirectPodInput] = useState(''); // Main POD input
  const [localPod, setLocalPod] = useState(null); // Local POD state
  const [localSelectedKeyIndex, setLocalSelectedKeyIndex] = useState(-1);
  const [localLowerBound, setLocalLowerBound] = useState('');
  const [localUpperBound, setLocalUpperBound] = useState('');
  const [localProof, setLocalProof] = useState(null);
  
  // Destructure values from context state for easier access
  const { pod, selectedKeyIndex, lowerBound, upperBound, proof } = proofState;
  
  /**
   * Parse a POD from JSON input
   */
  const parsePOD = () => {
    try {
      setError('');
      setLocalPod(null);
      setLocalSelectedKeyIndex(-1);
      setLocalProof(null);
      
      if (!directPodInput.trim()) {
        throw new Error('POD input is required');
      }
      
      // Parse the POD
      const parsedPOD = JSON.parse(directPodInput);
      
      // Validate the POD
      if (!parsedPOD.data || !Array.isArray(parsedPOD.data) || 
          !parsedPOD.merkleRoot || !parsedPOD.signature || !parsedPOD.publicKey) {
        throw new Error('Invalid POD format');
      }
      
      // Import the POD data into the merkle service
      merkleService.importData(parsedPOD);
      
      // Set the POD in local state only
      setLocalPod(parsedPOD);
      setSuccess('POD loaded successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(`Failed to parse POD: ${err.message}`);
    }
  };
  
  /**
   * Generate a proof for the selected key-value pair
   */
  const generateProof = async () => {
    try {
      setError('');
      setLocalProof(null);
      setIsGeneratingProof(true);
      
      if (!localPod) {
        throw new Error('No POD loaded');
      }
      
      if (localSelectedKeyIndex < 0 || localSelectedKeyIndex >= localPod.data.length) {
        throw new Error('No key-value pair selected');
      }
      
      if (localLowerBound.trim() === '' || localUpperBound.trim() === '') {
        throw new Error('Both lower and upper bounds are required');
      }
      
      // Get the selected key-value pair
      const { key, value } = localPod.data[localSelectedKeyIndex];
      
      // Get the proof data from the merkle service
      const proofData = merkleService.getProof(localSelectedKeyIndex);
      
      // Create the proof request
      const proofRequest = {
        key,
        value,
        index: proofData.index,
        siblings: proofData.siblings,
        root: localPod.merkleRoot,
        lowerbound: localLowerBound,
        upperbound: localUpperBound,
        signedRoot_R8: localPod.signature.R8,
        signedRoot_S: localPod.signature.S,
        pubKey: localPod.publicKey
      };
      
      // Generate the proof
      const generatedProof = await proofService.generateProof(proofRequest);
      
      // Set the proof
      setLocalProof(generatedProof);
      setSuccess('Proof generated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(`Failed to generate proof: ${err.message}`);
    } finally {
      setIsGeneratingProof(false);
    }
  };
  
  /**
   * Copy proof to clipboard
   */
  const copyProof = () => {
    try {
      const proofJson = proofService.exportProof(localProof);
      navigator.clipboard.writeText(proofJson);
      
      setSuccess('Proof copied to clipboard and ready for verification');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(`Failed to copy proof: ${err.message}`);
    }
  };
  
  /**
   * Handle changes to the POD input
   */
  const handleDirectPodInputChange = (e) => {
    setDirectPodInput(e.target.value);
  };
  
  /**
   * Format the proof for display
   */
  const formatProofForDisplay = (proofData) => {
    if (!proofData) return '';
    
    const { proof, publicSignals, meta } = proofData;
    
    return {
      proof,
      publicInputs: publicSignals,
      meta
    };
  };
  
  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Create a Zero-Knowledge Proof</h1>
      
      {/* POD Input Section */}
      <div className="bg-white shadow-md rounded p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Import POD</h2>
        
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">
            POD JSON
          </label>
          <textarea
            value={directPodInput}
            onChange={handleDirectPodInputChange}
            placeholder="Paste your POD JSON here"
            rows={20}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 h-40 font-mono"
          />
        </div>
        
        <button
          onClick={parsePOD}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Load POD
        </button>
      </div>
      
      {/* Key Selection Section */}
      {localPod && (
        <div className="bg-white shadow-md rounded p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Select Key-Value Pair</h2>
          
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Key-Value Pair
            </label>
            <select
              value={localSelectedKeyIndex}
              onChange={(e) => setLocalSelectedKeyIndex(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={-1}>Select a key-value pair</option>
              {localPod.data.map((item, index) => (
                <option key={index} value={index}>
                  Key: {item.key} - Value: {item.value}
                </option>
              ))}
            </select>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Lower Bound
              </label>
              <input
                type="number"
                value={localLowerBound}
                onChange={(e) => setLocalLowerBound(e.target.value)}
                placeholder="e.g., 0"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Upper Bound
              </label>
              <input
                type="number"
                value={localUpperBound}
                onChange={(e) => setLocalUpperBound(e.target.value)}
                placeholder="e.g., 100"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <button
            onClick={generateProof}
            disabled={localSelectedKeyIndex === -1 || isGeneratingProof}
            className={`px-6 py-3 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              localSelectedKeyIndex === -1 || isGeneratingProof
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            {isGeneratingProof ? 'Generating...' : 'Generate Proof'}
          </button>
        </div>
      )}
      
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
      
      {/* Proof Output */}
      {localProof && (
        <div className="bg-white shadow-md rounded p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Generated Proof</h2>
            <button
              onClick={copyProof}
              className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              Copy Proof
            </button>
          </div>
          <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm font-mono max-h-96">
            {JSON.stringify(formatProofForDisplay(localProof), null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

export default ProofGenerator;