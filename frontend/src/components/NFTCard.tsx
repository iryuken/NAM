import * as React from 'react';
import { Heart, Share2 } from 'lucide-react';

interface NFT {
  id: number;
  name: string;
  price: string;
  image: string;
  creator: string;
}

interface NFTCardProps {
  nft: NFT;
}

export const NFTCard: React.FC<NFTCardProps> = ({ nft }: NFTCardProps) => {
  return (
    <div className="bg-gray-800 rounded-xl overflow-hidden transition-transform duration-200 hover:transform hover:scale-[1.02]">
      <div className="relative">
        <div className="w-full h-80 flex items-center justify-center bg-gradient-to-b from-purple-900/30 to-blue-900/30">
          <img
            src={nft.image}
            alt={nft.name}
            className="max-h-full max-w-full object-contain"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null;
              target.src = 'https://via.placeholder.com/300x400?text=Image+Not+Found';
            }}
          />
        </div>
        <div className="absolute top-4 right-4 flex space-x-2">
          <button className="p-2 bg-gray-900/70 rounded-full hover:bg-gray-900">
            <Heart className="w-5 h-5 text-white" />
          </button>
          <button className="p-2 bg-gray-900/70 rounded-full hover:bg-gray-900">
            <Share2 className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="text-xl font-semibold text-white mb-2">{nft.name}</h3>
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-gray-400">
            Creator
            <div className="text-white font-medium">{nft.creator}</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-400">Price</div>
            <div className="text-white font-medium">{nft.price}</div>
          </div>
        </div>
        
        <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg transition duration-200">
          Buy Now
        </button>
      </div>
    </div>
  );
};