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
  // const [jsonInput, setJsonInput] = useState('[\n  { key: 1, value: 111 },\n  { key: 2, value: 222 }\n]');
  const [jsonInput, setJsonInput] = useState('[\n   { key: 1, value: 111 },\n   { key: 2, value: 222 },\n   { key: 3, value: 333 },\n   { key: 4, value: 444 },\n   { key: 5, value: 555 },\n   { key: 6, value: 666 },\n   { key: 7, value: 777 },\n   { key: 8, value: 888 },\n   { key: 9, value: 999 },\n   { key: 10, value: 1010 } \n]');
  const [privateKey, setPrivateKey] = useState('1234567890');
  const [generatedPublicKey, setGeneratedPublicKey] = useState(null);
  const [pod, setPod] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  /**
   * Parse JSON input and update key-value pairs
   */
  const parseJsonInput = () => {
    try {
      setError('');
      // Replace single quotes with double quotes and evaluate the JSON
      const sanitizedJson = jsonInput.replace(/'/g, '"').replace(/(\w+):/g, '"$1":');
      
      let parsedData;
      try {
        // First try standard JSON.parse with the sanitized input
        parsedData = JSON.parse(sanitizedJson);
      } catch (jsonError) {
        console.log("JSON parse failed, trying Function constructor", jsonError);
        // If that fails, use Function constructor as fallback
        try {
          // Use Function constructor to safely evaluate the JSON string
          // This handles cases where the input uses JS object syntax (without quotes around keys)
          parsedData = (new Function(`return ${sanitizedJson}`))();
        } catch (funcError) {
          throw new Error(`Invalid JSON format: ${funcError.message}`);
        }
      }
      
      if (!Array.isArray(parsedData)) {
        throw new Error('Input must be an array of key-value pairs');
      }
      
      const validPairs = parsedData.map(item => {
        if (!item.hasOwnProperty('key') || !item.hasOwnProperty('value')) {
          throw new Error('Each item must have "key" and "value" properties');
        }
        return { key: String(item.key), value: String(item.value) };
      });
      
      setKeyValuePairs(validPairs);
      setSuccess('Key-value pairs parsed successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(`Failed to parse JSON: ${err.message}`);
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
        ({ key, value }) => key.toString().trim() && value.toString().trim()
      );
      
      if (validPairs.length === 0) {
        throw new Error('At least one valid key-value pair is required');
      }
      
      if (!privateKey.trim()) {
        throw new Error('Private key is required. Generate or import one first.');
      }
      
      // Reset the merkle service
      merkleService.reset();
      
      try {
        // Add key-value pairs to the merkle tree
        validPairs.forEach(({ key, value }) => {
          merkleService.addKeyValuePair(key, value);
        });
        
        // Build the merkle tree
        merkleService.buildTree();
        
        // Get the POD data
        const podData = merkleService.exportData();
        
        // Ensure data is properly formatted for signing
        if (!podData || typeof podData !== 'object') {
          throw new Error('Invalid POD data format');
        }
        
        // Ensure data property is an array
        if (!Array.isArray(podData.data)) {
          throw new Error('POD data must be an array');
        }
        
        console.log("podData", podData);
        
        // Sign the POD with the private key
        try {
          const signedPOD = signatureService.signPOD(podData);
          
          // Set the POD
          setPod(signedPOD);
          setSuccess('POD created successfully');
          setTimeout(() => setSuccess(''), 3000);
        } catch (signError) {
          console.error("POD signing error:", signError);
          
          // Handle specific array errors
          if (signError.message && signError.message.includes(".map")) {
            throw new Error('Array operation failed during signing. Input data may be malformed.');
          }
          
          throw signError;
        }
      } catch (processError) {
        console.error("POD creation process error:", processError);
        throw processError;
      }
    } catch (err) {
      console.error("POD creation failed:", err);
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
        
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">
            Input JSON Array of Key-Value Pairs
          </label>
          <textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            rows={10}
            className="w-full px-3 py-2 border border-gray-300 rounded font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <button
          onClick={parseJsonInput}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          Parse JSON Input
        </button>
        
        {keyValuePairs.length > 0 && (
          <div className="mt-4">
            <h3 className="font-medium text-gray-700">Parsed Key-Value Pairs ({keyValuePairs.length}):</h3>
            <div className="bg-gray-100 p-3 rounded mt-1 max-h-40 overflow-y-auto">
              <table className="min-w-full">
                <thead>
                  <tr>
                    <th className="text-left px-2 py-1">Key</th>
                    <th className="text-left px-2 py-1">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {keyValuePairs.map((pair, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                      <td className="px-2 py-1">{pair.key}</td>
                      <td className="px-2 py-1">{pair.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
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