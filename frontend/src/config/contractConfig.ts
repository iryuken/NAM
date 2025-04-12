export interface ContractConfig {
  nftAddress: string;
  marketplaceAddress: string;
  chainId: number;
}

// Contract addresses for different networks
// Update these addresses after deploying your contracts
const contracts: Record<number, ContractConfig> = {
  // Localhost/Hardhat network
  31337: {
    nftAddress: "0x5FbDB2315678afecb367f032d93F642f64180aa3", // Update with your deployed address
    marketplaceAddress: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512", // Update with your deployed address
    chainId: 31337
  },
  // Rinkeby testnet (if you deploy there)
  4: {
    nftAddress: "", // Update with your deployed address
    marketplaceAddress: "", // Update with your deployed address
    chainId: 4
  },
  // Add other networks as needed
};

export const getContractAddresses = (chainId: number): ContractConfig => {
  const config = contracts[chainId];
  
  if (!config) {
    throw new Error(`No contract configuration found for chainId: ${chainId}`);
  }
  
  return config;
};

// Default to local network for development
export const defaultChainId = 31337; 