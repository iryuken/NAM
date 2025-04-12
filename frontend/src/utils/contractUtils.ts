import { ethers } from 'ethers';
import { getContractAddresses } from '../config/contractConfig';

// Import ABIs (these will need to be added)
// You can generate these by compiling your contracts and copying from artifacts
const NFT_ABI = [
  // NFT contract ABI
  "function mintToken(string memory _tokenURI) external returns (uint256)",
  "function tokenURI(uint256 _tokenId) external view returns (string memory)",
  "function balanceOf(address _owner) external view returns (uint256)",
  "function ownerOf(uint256 _tokenId) external view returns (address)",
  "function approve(address _approved, uint256 _tokenId) external",
  "function setApprovalForAll(address _operator, bool _approved) external",
  "function transferFrom(address _from, address _to, uint256 _tokenId) external",
  "function safeTransferFrom(address _from, address _to, uint256 _tokenId, bytes memory _data) external",
];

const MARKETPLACE_ABI = [
  // Marketplace contract ABI
  "function getListingPrice() external view returns (uint256)",
  "function getUnSoldItems() external view returns (tuple(uint256 itemId, address nftContract, uint256 tokenId, address seller, address owner, uint256 price, bool sold)[] memory)",
  "function getMyListedItems() external view returns (tuple(uint256 itemId, address nftContract, uint256 tokenId, address seller, address owner, uint256 price, bool sold)[] memory)",
  "function getMyPurchasedItems() external view returns (tuple(uint256 itemId, address nftContract, uint256 tokenId, address seller, address owner, uint256 price, bool sold)[] memory)",
  "function listItem(address _nftAddress, uint256 _tokenId, uint256 _price) external",
  "function updateItemPrice(uint256 _itemId, uint256 _price) external",
  "function buyItem(address _nftAddress, uint256 _itemId) external payable",
  "function resellItem(address _nftAddress, uint256 _tokenId, uint256 _price) external payable",
];

// Provider and signer
let provider: ethers.BrowserProvider | null = null;
let signer: ethers.Signer | null = null;

// Contract instances
let nftContract: ethers.Contract | null = null;
let marketplaceContract: ethers.Contract | null = null;

// Connect to MetaMask wallet
export const connectWallet = async (): Promise<string> => {
  if (window.ethereum) {
    try {
      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      // Get the provider and signer
      provider = new ethers.BrowserProvider(window.ethereum);
      signer = await provider.getSigner();
      
      // Get the chain ID
      const network = await provider.getNetwork();
      const chainId = Number(network.chainId);
      
      // Initialize contracts with the correct addresses for the current network
      await initializeContracts(chainId);
      
      return accounts[0];
    } catch (error) {
      console.error("Error connecting to MetaMask:", error);
      throw error;
    }
  } else {
    throw new Error("MetaMask not installed");
  }
};

// Initialize contracts with the appropriate addresses for the current network
export const initializeContracts = async (chainId: number): Promise<void> => {
  if (!signer) {
    throw new Error("No signer available");
  }
  
  try {
    const { nftAddress, marketplaceAddress } = getContractAddresses(chainId);
    
    nftContract = new ethers.Contract(nftAddress, NFT_ABI, signer);
    marketplaceContract = new ethers.Contract(marketplaceAddress, MARKETPLACE_ABI, signer);
  } catch (error) {
    console.error("Error initializing contracts:", error);
    throw error;
  }
};

// Helper function to check if wallet is connected
export const isWalletConnected = (): boolean => {
  return provider !== null && signer !== null;
};

// Get NFT contract instance
export const getNftContract = (): ethers.Contract => {
  if (!nftContract) {
    throw new Error("NFT contract not initialized");
  }
  return nftContract;
};

// Get marketplace contract instance
export const getMarketplaceContract = (): ethers.Contract => {
  if (!marketplaceContract) {
    throw new Error("Marketplace contract not initialized");
  }
  return marketplaceContract;
};

// Get wallet address
export const getWalletAddress = async (): Promise<string> => {
  if (!signer) {
    throw new Error("No signer available");
  }
  return await signer.getAddress();
};

// Add type declarations for window.ethereum
declare global {
  interface Window {
    ethereum: any;
  }
} 