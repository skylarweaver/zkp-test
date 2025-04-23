import { useState, useEffect, useContext, createContext } from 'react'
import './App.css'
import Navigation from './components/Navigation'
import PODCreator from './components/PODCreator'
import ProofGenerator from './components/ProofGenerator'
import ProofVerifier from './components/ProofVerifier'
import CircuitLoader from './services/circuitLoader'
import { AppContextProvider } from './contexts/AppContext'

// Create the navigation context
const AppNavigationContext = createContext();

// Helper hook to access navigation context
function useAppNavigationContext() {
  return useContext(AppNavigationContext);
}

// Main app component
function App() {
  const [activePage, setActivePage] = useState('pod-creator')
  const [circuitStatus, setCircuitStatus] = useState({
    loading: true,
    available: false,
    error: null
  })

  // Check if circuit artifacts are available on load
  useEffect(() => {
    const checkCircuitArtifacts = async () => {
      try {
        const circuitLoader = new CircuitLoader()
        const available = await circuitLoader.checkArtifacts()
        
        setCircuitStatus({
          loading: false,
          available,
          error: available ? null : 'Circuit artifacts not found'
        })
      } catch (error) {
        setCircuitStatus({
          loading: false,
          available: false,
          error: error.message
        })
      }
    }
    
    checkCircuitArtifacts()
  }, [])

  // Render the active page
  const renderActivePage = () => {
    if (circuitStatus.loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-lg text-gray-600">Loading circuit artifacts...</p>
          </div>
        </div>
      )
    }

    if (!circuitStatus.available) {
      return (
        <div className="container mx-auto p-8 max-w-4xl">
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
            <h2 className="font-bold text-xl mb-2">Circuit Artifacts Not Found</h2>
            <p className="mb-4">
              The required circuit artifacts are not available. Please make sure you have compiled the circuit and placed the artifacts in the correct location.
            </p>
            <div className="bg-white p-4 rounded shadow-sm">
              <h3 className="font-semibold mb-2">Required files:</h3>
              <ul className="list-disc pl-5">
                <li>/public/circuit/circuit.wasm</li>
                <li>/public/circuit/circuit_final.zkey</li>
                <li>/public/circuit/verification_key.json</li>
              </ul>
            </div>
          </div>
        </div>
      )
    }

    switch (activePage) {
      case 'pod-creator':
        return <PODCreator />
      case 'proof-generator':
        return <ProofGenerator />
      case 'proof-verifier':
        return <ProofVerifier />
      default:
        return <PODCreator />
    }
  }

  return (
    <AppContextProvider>
      <AppNavigationContext.Provider value={{ activePage, setActivePage }}>
        <div className="min-h-screen bg-gray-100">
          <Navigation activePage={activePage} setActivePage={setActivePage} />
          {renderActivePage()}
        </div>
      </AppNavigationContext.Provider>
    </AppContextProvider>
  )
}

export default App
