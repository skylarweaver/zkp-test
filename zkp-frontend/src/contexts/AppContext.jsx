import React, { createContext, useState, useContext } from 'react';

// Create the context
const AppContext = createContext();

// Hook to use the context
export const useAppContext = () => useContext(AppContext);

// Provider component
export const AppContextProvider = ({ children }) => {
  // POD Creator state
  const [podState, setPodState] = useState({
    keyValuePairs: [{ key: '', value: '' }],
    jsonInput: '[\n   { key: 1, value: 111 },\n   { key: 2, value: 222 },\n   { key: 3, value: 333 },\n   { key: 4, value: 444 },\n   { key: 5, value: 555 },\n   { key: 6, value: 666 },\n   { key: 7, value: 777 },\n   { key: 8, value: 888 },\n   { key: 9, value: 999 },\n   { key: 10, value: 1010 } \n]',
    privateKey: '1234567890',
    generatedPublicKey: null,
    pod: null
  });

  // Proof Generator state
  const [proofState, setProofState] = useState({
    podInput: '',
    pod: null,
    selectedKeyIndex: -1,
    lowerBound: '',
    upperBound: '',
    proof: null
  });

  // Proof Verifier state
  const [verifierState, setVerifierState] = useState({
    proofInput: '',
    verificationResult: null
  });

  // Update POD state
  const updatePodState = (newState) => {
    setPodState({
      ...podState,
      ...newState
    });
  };

  // Update Proof Generator state
  const updateProofState = (newState) => {
    setProofState({
      ...proofState,
      ...newState
    });
  };

  // Update Verifier state
  const updateVerifierState = (newState) => {
    setVerifierState({
      ...verifierState,
      ...newState
    });
  };

  // Convenience function to copy POD to proof generator
  const transferPodToProofGenerator = () => {
    if (podState.pod) {
      updateProofState({
        podInput: JSON.stringify(podState.pod, null, 2),
        pod: podState.pod
      });
    }
  };

  // Convenience function to copy proof to verifier
  const transferProofToVerifier = (proof) => {
    if (proof) {
      updateVerifierState({
        proofInput: JSON.stringify(proof, null, 2)
      });
    }
  };

  // Value object to be provided
  const contextValue = {
    podState,
    updatePodState,
    proofState,
    updateProofState,
    verifierState,
    updateVerifierState,
    transferPodToProofGenerator,
    transferProofToVerifier
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContext; 