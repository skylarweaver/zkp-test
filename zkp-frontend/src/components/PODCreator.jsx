import React, { useState } from 'react';
import MerkleTreeService from '../services/merkleTree';
import SignatureService from '../services/signatureService';

/**
 * POD Creator component
 * Allows creating a Provable Object Data structure with a signed Merkle tree
 */
function PODCreator() {
  // Services
  const [merkleService] = useState(new MerkleTreeService());
  const [signatureService] = useState(new SignatureService());
  
  // State
  const [keyValuePairs, setKeyValuePairs] = useState([{ key: '', value: '' }]);
  const [privateKey, setPrivateKey] = useState('');
  const [generatedPublicKey, setGeneratedPublicKey] = useState(null);
  const [pod, setPod] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  /**
   * Handle changes to key-value pairs
   */
  const handleKeyValueChange = (index, field, value) => {
    const newPairs = [...keyValuePairs];
    newPairs[index][field] = value;
    setKeyValuePairs(newPairs);
  };
  
  /**
   * Add a new key-value pair
   */
  const addKeyValuePair = () => {
    setKeyValuePairs([...keyValuePairs, { key: '', value: '' }]);
  };
  
  /**
   * Remove a key-value pair
   */
  const removeKeyValuePair = (index) => {
    if (keyValuePairs.length > 1) {
      const newPairs = [...keyValuePairs];
      newPairs.splice(index, 1);
      setKeyValuePairs(newPairs);
    }
  };
  
  /**
   * Generate a new key pair
   */
  const generateKeyPair = () => {
    try {
      setError('');
      const keyPair = signatureService.generateKeyPair();
      setPrivateKey(keyPair.privateKey);
      setGeneratedPublicKey(keyPair.publicKey);
      setSuccess('Key pair generated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(`Failed to generate key pair: ${err.message}`);
    }
  };
  
  /**
   * Import an existing private key
   */
  const importPrivateKey = () => {
    try {
      setError('');
      if (!privateKey.trim()) {
        throw new Error('Private key is required');
      }
      
      const keyPair = signatureService.importKeyPair(privateKey);
      setGeneratedPublicKey(keyPair.publicKey);
      setSuccess('Private key imported successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(`Failed to import private key: ${err.message}`);
    }
  };
  
  /**
   * Create a POD from the current key-value pairs
   */
  const createPOD = () => {
    try {
      setError('');
      setPod(null);
      
      // Validate inputs
      const validPairs = keyValuePairs.filter(
        ({ key, value }) => key.trim() && value.trim()
      );
      
      if (validPairs.length === 0) {
        throw new Error('At least one valid key-value pair is required');
      }
      
      if (!privateKey.trim()) {
        throw new Error('Private key is required. Generate or import one first.');
      }
      
      // Reset the merkle service
      merkleService.reset();
      
      // Add key-value pairs to the merkle tree
      validPairs.forEach(({ key, value }) => {
        merkleService.addKeyValuePair(key, value);
      });
      
      // Build the merkle tree
      merkleService.buildTree();
      
      // Get the POD data
      const podData = merkleService.exportData();
      
      // Sign the POD with the private key
      const signedPOD = signatureService.signPOD(podData);
      
      // Set the POD
      setPod(signedPOD);
      setSuccess('POD created successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(`Failed to create POD: ${err.message}`);
    }
  };
  
  /**
   * Verify the created POD's signature
   */
  const verifyPOD = () => {
    try {
      setError('');
      
      if (!pod) {
        throw new Error('No POD to verify');
      }
      
      const isValid = signatureService.verifyPOD(pod);
      
      if (isValid) {
        setSuccess('POD signature is valid');
      } else {
        throw new Error('POD signature is invalid');
      }
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(`Verification failed: ${err.message}`);
    }
  };
  
  /**
   * Copy POD to clipboard
   */
  const copyPOD = () => {
    try {
      navigator.clipboard.writeText(JSON.stringify(pod, null, 2));
      setSuccess('POD copied to clipboard');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(`Failed to copy POD: ${err.message}`);
    }
  };
  
  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Create a POD (Provable Object Data)</h1>
      
      {/* Key Generation Section */}
      <div className="bg-white shadow-md rounded p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Key Management</h2>
        
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">
            Private Key
          </label>
          <div className="flex">
            <input
              type="text"
              value={privateKey}
              onChange={(e) => setPrivateKey(e.target.value)}
              placeholder="Enter private key or generate a new one"
              className="flex-grow px-3 py-2 border border-gray-300 rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={importPrivateKey}
              className="bg-gray-200 px-4 py-2 border border-gray-300 border-l-0 rounded-r hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Import
            </button>
          </div>
        </div>
        
        <button
          onClick={generateKeyPair}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Generate New Key Pair
        </button>
        
        {generatedPublicKey && (
          <div className="mt-4">
            <h3 className="font-medium text-gray-700">Public Key:</h3>
            <div className="bg-gray-100 p-3 rounded mt-1 text-sm font-mono break-all">
              [{generatedPublicKey[0]}, {generatedPublicKey[1]}]
            </div>
          </div>
        )}
      </div>
      
      {/* Key-Value Pairs Section */}
      <div className="bg-white shadow-md rounded p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Key-Value Pairs</h2>
        
        {keyValuePairs.map((pair, index) => (
          <div key={index} className="flex mb-4">
            <div className="w-1/3 mr-2">
              <input
                type="text"
                value={pair.key}
                onChange={(e) => handleKeyValueChange(index, 'key', e.target.value)}
                placeholder="Key"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="w-1/3 mr-2">
              <input
                type="text"
                value={pair.value}
                onChange={(e) => handleKeyValueChange(index, 'value', e.target.value)}
                placeholder="Value"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={() => removeKeyValuePair(index)}
              className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Remove
            </button>
          </div>
        ))}
        
        <button
          onClick={addKeyValuePair}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          Add Key-Value Pair
        </button>
      </div>
      
      {/* Actions Section */}
      <div className="flex space-x-4 mb-6">
        <button
          onClick={createPOD}
          className="bg-blue-500 text-white px-6 py-3 rounded-lg text-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Create POD
        </button>
        
        <button
          onClick={verifyPOD}
          disabled={!pod}
          className={`px-6 py-3 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
            !pod
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-indigo-500 text-white hover:bg-indigo-600'
          }`}
        >
          Verify POD
        </button>
        
        <button
          onClick={copyPOD}
          disabled={!pod}
          className={`px-6 py-3 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
            !pod
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-purple-500 text-white hover:bg-purple-600'
          }`}
        >
          Copy POD
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
      
      {/* POD Output */}
      {pod && (
        <div className="bg-white shadow-md rounded p-6">
          <h2 className="text-xl font-semibold mb-4">Generated POD</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm font-mono max-h-96">
            {JSON.stringify(pod, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

export default PODCreator; 