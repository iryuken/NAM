import { useState } from 'react';
import { Wallet, GalleryVertical as Gallery, Search, Menu } from 'lucide-react';
import { NFTCard } from './components/NFTCard';
import { ConnectWallet } from './components/ConnectWallet';
import { useWeb3 } from './context/Web3Context';

// Import the local image
import LocalImage from './assets/Untitled.png';

function App() {
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const { account, isConnected, connectToWallet } = useWeb3();
  
  const mockNFTs = [
    {
      id: 1,
      name: "Uniform  #1",
      price: "0.5 ETH",
      image: LocalImage,
      creator: "0x1234...5678"
    },
    {
      id: 2,
      name: "Magical Idol #7",
      price: "0.8 ETH",
      image: "https://placekitten.com/401/601",
      creator: "0x8765...4321"
    },
    {
      id: 3,
      name: "Battle Academy Girl #4",
      price: "1.2 ETH",
      image: "https://placekitten.com/402/602",
      creator: "0x9876...1234"
    },
    {
      id: 4,
      name: "Fantasy Heroine #9",
      price: "0.6 ETH",
      image: "https://placekitten.com/403/603",
      creator: "0xabcd...1234"
    },
    {
      id: 5,
      name: "Sailor Uniform #12",
      price: "1.5 ETH",
      image: "https://placekitten.com/404/604",
      creator: "0x2468...1357"
    },
    {
      id: 6,
      name: "Academy Student #3",
      price: "0.9 ETH",
      image: "https://placekitten.com/405/605",
      creator: "0x1357...2468"
    }
  ];

  const handleConnectWallet = () => {
    if (isConnected) {
      // Already connected, maybe show account details
      console.log("Connected account:", account);
    } else {
      // Show connect modal or connect directly
      setIsWalletModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="border-b border-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <Gallery className="w-8 h-8 text-purple-500" />
              <span className="text-xl font-bold text-white">Agent Avatar Market</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search NFTs..."
                  className="bg-gray-800 text-white px-4 py-2 rounded-lg pl-10 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
              </div>
              
              <button
                onClick={handleConnectWallet}
                className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition duration-200"
              >
                <Wallet className="w-5 h-5" />
                <span>{isConnected ? `${account?.substring(0, 6)}...${account?.substring(account.length - 4)}` : 'Connect Wallet'}</span>
              </button>
            </div>
            
            <button className="md:hidden text-white">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">MarketPlace</h1>
          <p className="text-gray-400">Discover, collect, and sell extraordinary anime character NFTs</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockNFTs.map((nft) => (
            <NFTCard key={nft.id} nft={nft} />
          ))}
        </div>
      </main>

      {/* Wallet Modal */}
      {isWalletModalOpen && (
        <ConnectWallet 
          onClose={() => setIsWalletModalOpen(false)} 
          onConnect={connectToWallet}
        />
      )}
    </div>
  );
}

export default App;