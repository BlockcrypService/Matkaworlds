import React from 'react';
import { ChevronDown, Menu, Wallet } from 'lucide-react';
import Logo from '../common/Logo';
import { useAppKit, useAppKitAccount } from '@reown/appkit/react';

export default function Header({ toggleSidebar }) {
  const { open } = useAppKit();
  const { address, isConnected } = useAppKitAccount();

  const formatAddress = (address) => {
    if (!address) return "";
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };
  return (
    <header className="sticky top-0 z-40 flex md:h-[80px] h-[68px] items-center justify-between px-4 sm:px-6 lg:px-8 bg-[var(--bg-panel)]/90 backdrop-blur-md border-b border-white/5 shadow-sm">
      <div className="flex items-center">
        <button
          onClick={toggleSidebar}
          className="mr-4 lg:hidden p-2 ps-0 rounded-md text-gray-400 hover:text-white cursor-pointer transition-colors"
        >
          <Menu size={24} />
        </button>

        <div className="flex lg:hidden items-center">
          <Logo />
        </div>
      </div>

      <div className="flex items-center">
        {isConnected ? (
          <button
            onClick={() => open()}
            className="group flex items-center md:gap-3 gap-2 px-3 py-2 rounded-full
          bg-white/[0.06] border border-white/10
          hover:bg-white/[0.1] hover:border-[#2563eb]/50
          transition-all duration-300"
          >
            <div className="relative flex items-center justify-center md:w-9 md:h-9 w-7 h-7 rounded-full bg-[#2563eb]/15 border border-[#2563eb]/30">
              <Wallet
                size={16}
                className="text-[#60a5fa]"
              />
            </div>

            <div className="flex flex-col items-start pt-1 leading-tight">
              <span className="md:text-sm text-xs font-semibold text-white">
                {formatAddress(address)}
              </span>
              <span className='text-[10px] text-gray-400'>Connected</span>
            </div>

            <ChevronDown
              size={16}
              className="sm:block text-gray-400 group-hover:text-white transition-colors"
            />
          </button>
        ) : (
          <button
            onClick={() => open()}
            className="px-6 py-2.5 pt-3 bg-[#2563eb] text-center flex items-center justify-center
          hover:bg-blue-600 text-white text-sm font-semibold rounded-full
          shadow-[0_0_15px_rgba(37,99,235,0.4)]
          hover:shadow-[0_0_25px_rgba(37,99,235,0.6)]
          transition-all duration-300 uppercase tracking-wide"
          >
            Connect Wallet
          </button>
        )}
      </div>
    </header>
  );
}
