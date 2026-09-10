import { useState } from 'react';
import { useWriteContract, usePublicClient, useAccount } from 'wagmi';
import { mtkgame_abi, MTK_GAME_PROXY_ADDRESS, MTK_TOKEN_ADDRESS, mtk_approve_abi } from '../config/contract';

export const useContractActions = () => {
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();
  const { address } = useAccount();
  const [isProcessing, setIsProcessing] = useState(false);

  /**
   * Place a bid on a game
   * @param {string} gameName - Name of the game
   * @param {bigint[]} amounts - Array of bid amounts (parsed to 18 decimals)
   * @param {bigint[]} numbers - Array of chosen numbers
   * @param {string} referralAddress - The referral address
   * @returns {Promise<{success: boolean, hash?: string, error?: any}>}
   */

  const placeBid = async (gameName, amounts, numbers, referralAddress) => {
    try {
      setIsProcessing(true);

      const totalApproveAmount = amounts.reduce((acc, curr) => acc + curr, 0n);

      const approveHash = await writeContractAsync({
        address: MTK_TOKEN_ADDRESS,
        abi: mtk_approve_abi,
        functionName: 'approve',
        args: [MTK_GAME_PROXY_ADDRESS, totalApproveAmount]
      });

      await publicClient.waitForTransactionReceipt({ hash: approveHash });
      const bidHash = await writeContractAsync({
        address: MTK_GAME_PROXY_ADDRESS,
        abi: mtkgame_abi,
        functionName: 'user_bidref',
        args: [gameName, amounts, numbers, referralAddress]
      });

      await publicClient.waitForTransactionReceipt({ hash: bidHash });

      return { success: true, hash: bidHash };
    } catch (err) {
      console.error("Transaction Error:", err);
      return { success: false, error: err };
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Execute a user win
   * @param {string} gameName - Name of the game
   * @param {bigint} winIndex - Winning index
   * @returns {Promise<{success: boolean, hash?: string, error?: any}>}
   */
  const executeWin = async (gameName, winIndex) => {
    try {
      setIsProcessing(true);

      if (address) {
        const allowance = await publicClient.readContract({
          address: MTK_TOKEN_ADDRESS,
          abi: mtk_approve_abi,
          functionName: 'allowance',
          args: [address, MTK_GAME_PROXY_ADDRESS]
        });

        console.log("allowance", allowance)

        if (allowance === 0n) {
          const approveHash = await writeContractAsync({
            address: MTK_TOKEN_ADDRESS,
            abi: mtk_approve_abi,
            functionName: 'approve',
            args: [MTK_GAME_PROXY_ADDRESS, BigInt("115792089237316195423570985008687907853269984665640564039457584007913129639935")]
          });
          await publicClient.waitForTransactionReceipt({ hash: approveHash });
        }
      }

      const hash = await writeContractAsync({
        address: MTK_GAME_PROXY_ADDRESS,
        abi: mtkgame_abi,
        functionName: 'user_win',
        args: [gameName, winIndex]
      });
      await publicClient.waitForTransactionReceipt({ hash });
      return { success: true, hash };
    } catch (err) {
      console.error("Transaction Error:", err);
      return { success: false, error: err };
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    placeBid,
    executeWin,
    isProcessing
  };
};
