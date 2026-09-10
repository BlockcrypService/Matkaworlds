import { useState, useEffect, useCallback } from 'react';
import { useAccount, useReadContract, usePublicClient } from 'wagmi';
import { mtkgame_abi, MTK_GAME_PROXY_ADDRESS, REWARD_MULTIPLIER } from '../config/contract';
import { formatUnits } from "viem";

export const useContractData = (selectedGameName) => {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const [betsHistory, setBetsHistory] = useState([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [hasFetchedHistory, setHasFetchedHistory] = useState(false);
  const [dynamicPools, setDynamicPools] = useState([]);
  const [isLoadingPools, setIsLoadingPools] = useState(true);

  // Read All Games
  const { data: allGames, isLoading: isLoadingAllGames, refetch: refetchAllGames } = useReadContract({
    address: MTK_GAME_PROXY_ADDRESS,
    abi: mtkgame_abi,
    functionName: 'getallgame',
  });

  // Helper for pool card hours display
  const formatHourMinute = (timestamp) => {
    if (!timestamp) return "00:00";
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
  };

  useEffect(() => {
    if (isLoadingAllGames) return;
    if (!allGames || allGames.length === 0) {
      setDynamicPools([]);
      setIsLoadingPools(false);
      return;
    }

    const fetchAllGamesData = async () => {
      setIsLoadingPools(true);
      const gamesToFetch = allGames; // Fetch all games
      const chunkSize = 15;
      const newPoolsData = [];

      for (let i = 0; i < gamesToFetch.length; i += chunkSize) {
        const chunk = gamesToFetch.slice(i, i + chunkSize);
        const chunkPromises = chunk.map(async (gName, idx) => {
          try {
            const gDetails = await publicClient.readContract({
              address: MTK_GAME_PROXY_ADDRESS,
              abi: mtkgame_abi,
              functionName: "details_gamedetails",
              args: [gName],
            });

            const isGameFinalized = await publicClient.readContract({
              address: MTK_GAME_PROXY_ADDRESS,
              abi: mtkgame_abi,
              functionName: "gameFinalized",
              args: [gName],
            });

            const statusInt = Number(gDetails[7]);
            const startTime = Number(gDetails[0]);
            const nowSeconds = Math.floor(Date.now() / 1000);
            const endTime = Number(gDetails[1]);
            const isTimerRunning = nowSeconds < endTime;
            let gameStatus = isTimerRunning ? "active" : "completed";
            if (nowSeconds < startTime) gameStatus = "upcoming";

            return {
              id: i + idx + 1,
              gameName: gName,
              displayName: gDetails[3] || gName,
              status: gameStatus,
              hours: `Hours: ${formatHourMinute(Number(gDetails[0]))} - ${formatHourMinute(Number(gDetails[1]))}`,
              desc: "The blockchain consensus pool begins. Join early to participate.",
              closingVolume: `${formatUnits(gDetails[4], 18)} USDT`,
              totalPlayers: gDetails[7],
              winningPayout: `${formatUnits(gDetails[5], 18)} USDT`,
              consensusResult: statusInt === 1 ? `#${Number(gDetails[6])}` : "-",
              nextDeclaration: "-",
              startOffset: 0,
              gameFinalized: isGameFinalized,
            };
          } catch (e) {
            console.error(e);
            return null;
          }
        });

        const results = await Promise.all(chunkPromises);
        newPoolsData.push(...results.filter(Boolean));
      }

      setDynamicPools([...newPoolsData].reverse());
      setIsLoadingPools(false);
    };

    fetchAllGamesData();
  }, [allGames, isLoadingAllGames, publicClient]);

  // Read User Games
  const { data: userGames, isLoading: isLoadingUserGames, refetch: refetchUserGames } = useReadContract({
    address: MTK_GAME_PROXY_ADDRESS,
    abi: mtkgame_abi,
    functionName: 'get_user_game',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    }
  });

  const { data: gameDetails, isLoading: isLoadingGameDetails, refetch: refetchGameDetails } = useReadContract({
    address: MTK_GAME_PROXY_ADDRESS,
    abi: mtkgame_abi,
    functionName: 'details_gamedetails',
    args: selectedGameName ? [selectedGameName] : (allGames?.length > 0 ? [allGames[allGames.length - 1]] : undefined),
    query: {
      enabled: !!allGames && allGames.length > 0,
    }
  });

  const formattedGameDetails = gameDetails ? {
    exists: true,
    gameKey: selectedGameName || allGames?.[allGames.length - 1],
    startTime: Number(gameDetails[0]),
    endTime: Number(gameDetails[1]),
    gameTypeDigits: Number(gameDetails[2]),
    displayName: gameDetails[3],
    totalBidAmount: Number(gameDetails[4]),
    totalWinnerPaid: Number(gameDetails[5]),
    winningNumber: Number(gameDetails[6]),
    gameStatus: gameDetails[7],
  } : undefined;

  const { data: minbid } = useReadContract({
    address: MTK_GAME_PROXY_ADDRESS,
    abi: mtkgame_abi,
    functionName: 'minbid',
  });

  const { data: maxbid } = useReadContract({
    address: MTK_GAME_PROXY_ADDRESS,
    abi: mtkgame_abi,
    functionName: 'maxbid',
  });

  const { data: fee } = useReadContract({
    address: MTK_GAME_PROXY_ADDRESS,
    abi: mtkgame_abi,
    functionName: 'FEE',
  });

  const { data: endTimeBeforeCount } = useReadContract({
    address: MTK_GAME_PROXY_ADDRESS,
    abi: mtkgame_abi,
    functionName: "endtime_before",
  });

  const endTimeBefore = endTimeBeforeCount?.toString() || "0";

  const { data: activePlayersCount } = useReadContract({
    address: MTK_GAME_PROXY_ADDRESS,
    abi: mtkgame_abi,
    functionName: 'activeuser',
  });

  const { data: totalPayoutPaid } = useReadContract({
    address: MTK_GAME_PROXY_ADDRESS,
    abi: mtkgame_abi,
    functionName: 'totalpay',
  });

  const currentGameKey = selectedGameName || allGames?.[allGames.length - 1];
  const { data: currentGameUserBets } = useReadContract({
    address: MTK_GAME_PROXY_ADDRESS,
    abi: mtkgame_abi,
    functionName: 'user_get_all_bid',
    args: address && currentGameKey ? [address, currentGameKey] : undefined,
    query: {
      enabled: !!address && !!currentGameKey,
    },
  });

  const fetchBids = useCallback(async () => {
    if (!address || !formattedGameDetails?.gameKey) {
      if (!address) setHasFetchedHistory(true);
      return;
    }

    if (isLoadingUserGames) return;

    if (!userGames || userGames.length === 0) {
      setHasFetchedHistory(true);
      return;

    }

    setIsHistoryLoading(true);

    try {
      const allBids = [];

      for (let gIndex = userGames.length - 1; gIndex >= 0; gIndex--) {
        const gName = userGames[gIndex];

        const gDetails = await publicClient.readContract({
          address: MTK_GAME_PROXY_ADDRESS,
          abi: mtkgame_abi,
          functionName: "details_gamedetails",
          args: [gName]
        });

        const poolName = gDetails[3];
        const winningNumber = Number(gDetails[6]);
        const gameStatus = gDetails[7] === 0 ? "PENDING" : "SETTLED";

        const isGameFinalized = await publicClient.readContract({
          address: MTK_GAME_PROXY_ADDRESS,
          abi: mtkgame_abi,
          functionName: "gameFinalized",
          args: [gName]
        });

        const totalBids = await publicClient.readContract({
          address: MTK_GAME_PROXY_ADDRESS,
          abi: mtkgame_abi,
          functionName: "user_get_all_bid",
          args: [address, gName]
        });

        for (let i = Number(totalBids) - 1; i >= 0; i--) {
          const bidDetail = await publicClient.readContract({
            address: MTK_GAME_PROXY_ADDRESS,
            abi: mtkgame_abi,
            functionName: "useAll_gamedetails",
            args: [address, gName, i]
          });

          const prediction = Number(bidDetail[0]);

          const amount = Number(formatUnits(bidDetail[1], 18));
          const payout = amount * REWARD_MULTIPLIER;
          let result = "PENDING";
          let finalWinningNumber = "-";

          if (isGameFinalized) {
            if (gameStatus === "SETTLED") {
              result = prediction === winningNumber ? "WON" : "LOST";
              finalWinningNumber = winningNumber;
            } else {
              result = "PENDING";
            }
          }

          let isClaimed = false;
          if (result === "WON") {
            try {
              isClaimed = await publicClient.readContract({
                address: MTK_GAME_PROXY_ADDRESS,
                abi: mtkgame_abi,
                functionName: "bidClaimed",
                args: [address, gName, i]
              });
            } catch (err) {
              console.error("Error checking claim status:", err);
            }
          }

          const date = new Date(Number(bidDetail[2]) * 1000);
          const formattedDate = date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
          const formattedTime = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
          const dateTimeStr = `${formattedDate} • ${formattedTime}`;

          allBids.push({
            id: `BT-${gName}-${i + 1}`,
            gameName: gName,
            dateTime: dateTimeStr,
            pool: poolName,
            prediction: prediction,
            amount: `${amount}`,
            multiplier: `${REWARD_MULTIPLIER.toFixed(1)}x`,
            payout: payout,
            winningDigit: finalWinningNumber,
            result: result,
            status: gameStatus,
            bidTime: Number(bidDetail[2]),
            rawAmount: amount,
            isClaimed: isClaimed,
            index: i
          });
        }
      }

      setBetsHistory(allBids);
    } catch (err) {
      console.error("Error fetching bids:", err);
    } finally {
      setIsHistoryLoading(false);
      setHasFetchedHistory(true);
    }
  }, [address, formattedGameDetails?.gameKey, userGames, isLoadingUserGames, publicClient]);

  useEffect(() => {
    fetchBids();
  }, [fetchBids]);

  const markBetAsClaimed = useCallback((betId) => {
    setBetsHistory((prev) =>
      prev.map(bet => bet.id === betId ? { ...bet, isClaimed: true } : bet)
    );
  }, []);

  return {
    address,
    allGames,
    isLoadingAllGames,
    refetchAllGames,
    userGames,
    isLoadingUserGames,
    refetchUserGames,
    gameDetails,
    formattedGameDetails,
    isLoadingGameDetails,
    refetchGameDetails,
    minbid,
    maxbid,
    fee,
    activePlayersCount,
    totalPayoutPaid,
    currentGameUserBets,
    dynamicPools,
    isLoadingPools,
    betsHistory,
    isHistoryLoading,
    hasFetchedHistory,
    fetchBids,
    markBetAsClaimed,
    endTimeBefore
  };
};
