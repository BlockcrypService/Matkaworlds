import React, { useState } from 'react';
import { useContractActions } from '../../hooks/useContractActions';
import { showToast } from '../../utils/toastUtils';

export default function ClaimModal({ bet, fee = 5, onClose, onSuccess }) {
  const { executeWin, isProcessing } = useContractActions();

  const handleClaim = async () => {
    const result = await executeWin(bet.gameName, bet.index);
    if (result.success) {
      showToast("Claim successful!", "success");
      onSuccess();
    } else {
      let friendlyError = result.error?.shortMessage || result.error?.message || "Unknown error";
      if (friendlyError.includes("reverted with the following reason:")) {
        friendlyError = friendlyError.split("reverted with the following reason:")[1].trim();
      }
      showToast(friendlyError, "error");
    }
  };

  const feePercentage = fee ? Number(fee) / 100 : 0;
  const feeAmount = (bet.payout * feePercentage) / 100;
  const totalClaim = bet.payout - feeAmount;

  return (
    <div className="fixed inset-0 bg-black/80 z-[1050] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-[var(--bg-panel)] rounded-[32px] border border-[var(--border-secondary)] p-8 max-w-md w-full relative shadow-[0_0_50px_rgba(18,68,255,0.15)]">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-[var(--text-gray)] hover:text-white transition-colors p-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <h3 className="text-2xl font-bold text-white mb-8 text-center">Claim Winning Bet</h3>

        <div className="space-y-4 mb-8">
          <div className="flex justify-between items-center text-sm">
            <span className="text-[var(--text-gray)]">Game Name</span>
            <span className="text-white font-bold">{bet.gameName}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-[var(--text-gray)]">Payout Amount</span>
            <span className="text-white font-bold">{numericPayout} USDT</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-[var(--text-gray)]">Fee ({fee}%)</span>
            <span className="text-[#FF4A4A] font-bold">- {feeAmount} USDT</span>
          </div>

          <div className="h-px w-full bg-[var(--border-secondary)] my-4"></div>

          <div className="flex justify-between items-center">
            <span className="text-white font-bold text-lg">Total Claim</span>
            <span className="text-[#26BF38] font-bold text-lg">{totalClaim} USDT</span>
          </div>
        </div>

        <button
          onClick={handleClaim}
          disabled={isProcessing}
          className={`w-full py-4 rounded-full font-bold uppercase tracking-wider text-sm transition-all
            ${isProcessing
              ? 'bg-white/10 text-[var(--text-gray)] cursor-not-allowed border border-[var(--border-secondary)]'
              : 'bg-gradient-to-r from-[var(--bg-gradient-1)] to-[var(--bg-gradient-2)] text-white shadow-[0_0_20px_rgba(18,68,255,0.3)] hover:shadow-[0_0_25px_rgba(18,68,255,0.5)]'
            }`}
        >
          {isProcessing ? 'Processing...' : 'Claim Now'}
        </button>
      </div>
    </div>
  );
}
