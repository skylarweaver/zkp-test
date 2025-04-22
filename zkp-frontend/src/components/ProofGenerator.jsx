import React, { useState } from 'react';
import MerkleTreeService from '../services/merkleTree';
import ProofService from '../services/proofService';

/**
 * ProofGenerator component
 * Creates zero-knowledge proofs for specific key-value pairs in a POD
 */
function ProofGenerator() {
  // Services
  const [merkleService] = useState(new MerkleTreeService());
  const [proofService] = useState(new ProofService());
  
  // State
  const [podInput, setPodInput] = useState('');
  const [pod, setPod] = useState(null);
  const [selectedKeyIndex, setSelectedKeyIndex] = useState(-1);
  const [lowerBound, setLowerBound] = useState('');
  const [upperBound, setUpperBound] = useState('');
  const [proof, setProof] = useState(null);
  const [isGeneratingProof, setIsGeneratingProof] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  /**
   * Parse a POD from JSON input
   */
  const parsePOD = () => {
    try {
      setError('');
      setPod(null);
      setSelectedKeyIndex(-1);
      setProof(null);
      
      if (!podInput.trim()) {
        throw new Error('POD input is required');
      }
      
      // Parse the POD
      const parsedPOD = JSON.parse(podInput);
      
      // Validate the POD
      if (!parsedPOD.data || !Array.isArray(parsedPOD.data) || 
          !parsedPOD.merkleRoot || !parsedPOD.signature || !parsedPOD.publicKey) {
        throw new Error('Invalid POD format');
      }
      
      // Import the POD data into the merkle service
      merkleService.importData(parsedPOD);
      
      // Set the POD
      setPod(parsedPOD);
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
      setProof(null);
      setIsGeneratingProof(true);
      
      if (!pod) {
        throw new Error('No POD loaded');
      }
      
      if (selectedKeyIndex < 0 || selectedKeyIndex >= pod.data.length) {
        throw new Error('No key-value pair selected');
      }
      
      if (lowerBound.trim() === '' || upperBound.trim() === '') {
        throw new Error('Both lower and upper bounds are required');
      }
      
      // Get the selected key-value pair
      const { key, value } = pod.data[selectedKeyIndex];
      
      // Get the proof data from the merkle service
      const proofData = merkleService.getProof(selectedKeyIndex);
      
      // Create the proof request
      const proofRequest = {
        key,
        value,
        index: proofData.index,
        siblings: proofData.siblings,
        root: pod.merkleRoot,
        lowerbound: lowerBound,
        upperbound: upperBound,
        signedRoot_R8: pod.signature.R8,
        signedRoot_S: pod.signature.S,
        pubKey: pod.publicKey
      };
      
      // Generate the proof
      const generatedProof = await proofService.generateProof(proofRequest);
      
      // Set the proof
      setProof(generatedProof);
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
      navigator.clipboard.writeText(proofService.exportProof(proof));
      setSuccess('Proof copied to clipboard');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(`Failed to copy proof: ${err.message}`);
    }
  };
  
  /**
   * Handle changes to the POD input
   */
  const handlePodInputChange = (e) => {
    setPodInput(e.target.value);
    setPod(null);
    setSelectedKeyIndex(-1);
    setProof(null);
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
            value={podInput}
            onChange={handlePodInputChange}
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
      {pod && (
        <div className="bg-white shadow-md rounded p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Select Key-Value Pair</h2>
          
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Key-Value Pair
            </label>
            <select
              value={selectedKeyIndex}
              onChange={(e) => setSelectedKeyIndex(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={-1}>Select a key-value pair</option>
              {pod.data.map((item, index) => (
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
                value={lowerBound}
                onChange={(e) => setLowerBound(e.target.value)}
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
                value={upperBound}
                onChange={(e) => setUpperBound(e.target.value)}
                placeholder="e.g., 100"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <button
            onClick={generateProof}
            disabled={selectedKeyIndex === -1 || isGeneratingProof}
            className={`px-6 py-3 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              selectedKeyIndex === -1 || isGeneratingProof
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
      {proof && (
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
            {JSON.stringify(formatProofForDisplay(proof), null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

export default ProofGenerator; 