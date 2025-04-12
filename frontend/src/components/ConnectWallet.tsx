import React from 'react';
import { X, Wallet } from 'lucide-react';

interface ConnectWalletProps {
  onClose: () => void;
  onConnect: () => Promise<void>;
}

export const ConnectWallet: React.FC<ConnectWalletProps> = ({ onClose, onConnect }) => {
  const handleMetaMaskConnect = async () => {
    try {
      await onConnect();
      onClose();
    } catch (error) {
      console.error("Error connecting to MetaMask:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <Wallet className="w-12 h-12 text-purple-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Connect Wallet</h2>
          <p className="text-gray-400">Choose how you want to connect. There are several wallet providers.</p>
        </div>

        <div className="space-y-3">
          <button 
            onClick={handleMetaMaskConnect}
            className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 px-4 rounded-lg flex items-center justify-between transition duration-200"
          >
            <span className="font-medium">MetaMask</span>
            <img
              src="https://raw.githubusercontent.com/MetaMask/brand-resources/master/SVG/metamask-fox.svg"
              alt="MetaMask"
              className="w-6 h-6"
            />
          </button>

          <button className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 px-4 rounded-lg flex items-center justify-between transition duration-200 opacity-50 cursor-not-allowed">
            <span className="font-medium">WalletConnect</span>
            <img
              src="https://raw.githubusercontent.com/WalletConnect/walletconnect-assets/master/Logo/Blue%20(Default)/Logo.svg"
              alt="WalletConnect"
              className="w-6 h-6"
            />
          </button>

          <button className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 px-4 rounded-lg flex items-center justify-between transition duration-200 opacity-50 cursor-not-allowed">
            <span className="font-medium">Coinbase Wallet</span>
            <img
              src="https://www.coinbase.com/assets/press/coinbase-mark-white-9c56744abc3f76d1e24929778f0b9e14e2ac1ea1ff3ac79632dae5b1edacf4c2.png"
              alt="Coinbase Wallet"
              className="w-6 h-6"
            />
          </button>
        </div>

        <p className="text-sm text-gray-400 text-center mt-6">
          By connecting your wallet, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
};