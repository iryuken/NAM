import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { connectWallet, isWalletConnected, getNftContract, getMarketplaceContract, getWalletAddress } from '../utils/contractUtils';
import { ethers } from 'ethers';

// Define the context shape
interface Web3ContextType {
  account: string | null;
  isConnected: boolean;
  loading: boolean;
  error: string | null;
  nftContract: ethers.Contract | null;
  marketplaceContract: ethers.Contract | null;
  connectToWallet: () => Promise<void>;
}

// Create context with default values
const Web3Context = createContext<Web3ContextType>({
  account: null,
  isConnected: false,
  loading: false,
  error: null,
  nftContract: null,
  marketplaceContract: null,
  connectToWallet: async () => {},
});

// Custom hook to use the Web3 context
export const useWeb3 = () => useContext(Web3Context);

// Provider component
export const Web3Provider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [nftContract, setNftContract] = useState<ethers.Contract | null>(null);
  const [marketplaceContract, setMarketplaceContract] = useState<ethers.Contract | null>(null);

  // Function to connect wallet
  const connectToWallet = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const userAccount = await connectWallet();
      setAccount(userAccount);
      setIsConnected(true);
      
      // Get contract instances
      try {
        const nft = getNftContract();
        const marketplace = getMarketplaceContract();
        
        setNftContract(nft);
        setMarketplaceContract(marketplace);
      } catch (contractError) {
        console.error("Error getting contract instances:", contractError);
        setError("Failed to connect to contracts. Make sure you're on the correct network.");
      }
    } catch (walletError) {
      console.error("Error connecting wallet:", walletError);
      setError("Failed to connect wallet. Please make sure MetaMask is installed and accessible.");
      setIsConnected(false);
    } finally {
      setLoading(false);
    }
  };

  // Effect to check if wallet is already connected
  useEffect(() => {
    const checkConnection = async () => {
      if (isWalletConnected()) {
        try {
          const address = await getWalletAddress();
          setAccount(address);
          setIsConnected(true);
          
          // Get contract instances
          try {
            const nft = getNftContract();
            const marketplace = getMarketplaceContract();
            
            setNftContract(nft);
            setMarketplaceContract(marketplace);
          } catch (contractError) {
            console.error("Error getting contract instances:", contractError);
          }
        } catch (error) {
          console.error("Error checking wallet connection:", error);
        }
      }
    };
    
    checkConnection();
  }, []);

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          // User disconnected their wallet
          setAccount(null);
          setIsConnected(false);
        } else {
          // User changed account
          setAccount(accounts[0]);
          setIsConnected(true);
        }
      });
      
      window.ethereum.on('chainChanged', () => {
        // When chain changes, refresh the page to reset the connection
        window.location.reload();
      });
    }
    
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', () => {});
        window.ethereum.removeListener('chainChanged', () => {});
      }
    };
  }, []);

  return (
    <Web3Context.Provider
      value={{
        account,
        isConnected,
        loading,
        error,
        nftContract,
        marketplaceContract,
        connectToWallet,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
}; 