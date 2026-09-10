import React, { useEffect, useRef, useState } from 'react';
import Input from '../components/common/Input';
import Table, { Thead, Tbody, Tr, Th, Td } from '../components/common/Table';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useContractData } from '../hooks/useContractData';
import { useContractActions } from '../hooks/useContractActions';
import { useWallet } from '../context/WalletContext';
import { useAppKit } from '@reown/appkit/react';
import { REWARD_MULTIPLIER } from '../config/contract';
import { formatUnits, isAddress, parseUnits } from 'viem';
import { showToast } from '../utils/toastUtils';
import Loader from '../components/common/Loader';

const PlayDesk = () => {
  const location = useLocation();
  const { dynamicPools } = useContractData();
  const { isConnected } = useWallet();
  const { open } = useAppKit();
  const [errors, setErrors] = useState({});
  const selectedGameName = location.state?.gameName || dynamicPools[0]?.gameName;

  const {
    formattedGameDetails,
    minbid,
    maxbid,
    betsHistory,
    isHistoryLoading,
    hasFetchedHistory,
    fetchBids,
    endTimeBefore,
  } = useContractData(selectedGameName);

  const { placeBid, isProcessing } = useContractActions();
  const [timeLeft, setTimeLeft] = useState(0);
  const totalTime = formattedGameDetails?.endTime && formattedGameDetails?.startTime
    ? Number(formattedGameDetails.endTime) - Number(formattedGameDetails.startTime)
    : 1;
  const durationHours = formattedGameDetails?.startTime && formattedGameDetails?.endTime
    ? Math.max(1, Math.round((Number(formattedGameDetails.endTime) - Number(formattedGameDetails.startTime)) / 3600))
    : 6;
  const [selectedDigits, setSelectedDigits] = useState([1]);
  const [referralAddress, setReferralAddress] = useState(() => {
    const searchParams = new URLSearchParams(location.search);
    return searchParams.get("ref") || "";
  });

  const [betAmounts, setBetAmounts] = useState({ 1: "100" });
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const currentGameBets = (betsHistory || []).filter(
    (bet) => bet.gameName === formattedGameDetails?.gameKey
  );

  const paginatedBets = currentGameBets.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const [showModal, setShowModal] = useState(false);
  const [modalStatus, setModalStatus] = useState("neutral");
  const [winningDigit, setWinningDigit] = useState(0);
  const [displayDigit, setDisplayDigit] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [isMinAnimationDone, setIsMinAnimationDone] = useState(false);
  const [isNotStartedYet, setIsNotStartedYet] = useState(false);

  const triggerModalFlow = () => {
    const winNum = Math.floor(Math.random() * 10);
    setWinningDigit(winNum);
    setModalStatus("neutral");
    setShowModal(true);

    setTimeout(() => {
      if (selectedDigits.includes(winNum)) {
        setModalStatus("won");
      } else {
        setModalStatus("lost");
      }
    }, 2500);
  };

  const handlePlayNextRound = () => {
    setShowModal(false);
  };

  const formatHourMinute = (timestamp) => {
    if (!timestamp) return "00:00";
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  useEffect(() => {
    if (!formattedGameDetails?.endTime) return;

    const interval = setInterval(() => {
      const nowSeconds = Math.floor(Date.now() / 1000);
      let remaining = formattedGameDetails.endTime - nowSeconds;

      if (
        formattedGameDetails.startTime &&
        nowSeconds < formattedGameDetails.startTime
      ) {
        remaining =
          formattedGameDetails.endTime - formattedGameDetails.startTime;
      }

      const notStarted = !!(formattedGameDetails.startTime && nowSeconds < formattedGameDetails.startTime);
      setIsNotStartedYet(notStarted);
      setTimeLeft(remaining > 0 ? remaining : 0);
    }, 1000);
    return () => clearInterval(interval);
  }, [formattedGameDetails?.endTime, formattedGameDetails?.startTime]);

  const animationIntervalRef = useRef(null);
  const animationStartTimeRef = useRef(null);
  const minAnimationTimerRef = useRef(null);

  useEffect(() => {
    if (location.state?.openResult && !hasAnimated) {
      setHasAnimated(true);
      setModalStatus("neutral");
      setShowModal(true);
      window.history.replaceState({}, document.title);

      setIsMinAnimationDone(false);
      if (minAnimationTimerRef.current) {
        clearTimeout(minAnimationTimerRef.current);
      }
      minAnimationTimerRef.current = setTimeout(() => {
        setIsMinAnimationDone(true);
      }, 3000);

      animationStartTimeRef.current = Date.now();
      let currentDigit = 0;

      if (animationIntervalRef.current) {
        clearInterval(animationIntervalRef.current);
      }

      animationIntervalRef.current = setInterval(() => {
        currentDigit = (currentDigit + 1) % 10;
        setDisplayDigit(currentDigit);
      }, 100);
    }
  }, [location.state?.openResult, hasAnimated]);

  useEffect(() => {
    return () => {
      if (minAnimationTimerRef.current) clearTimeout(minAnimationTimerRef.current);
      if (animationIntervalRef.current) clearInterval(animationIntervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (showModal && modalStatus === "neutral" && formattedGameDetails && hasFetchedHistory) {
      if (isMinAnimationDone) {
        if (animationIntervalRef.current) {
          clearInterval(animationIntervalRef.current);
        }

        if (Number(formattedGameDetails.gameStatus) === 1) {
          const actualWinNum = formattedGameDetails.winningNumber;

          let finalStatus = "info";
          const userGameBets = betsHistory?.filter(b => b.gameName === selectedGameName);
          if (userGameBets && userGameBets.length > 0) {
            const won = userGameBets.some(b => b.result === "WON");
            finalStatus = won ? "won" : "lost";
          }

          setDisplayDigit(actualWinNum);
          setWinningDigit(actualWinNum);
          setModalStatus(finalStatus);
        } else {
          const winNum = formattedGameDetails.winningNumber ?? 0;
          setDisplayDigit(winNum);
          setWinningDigit(winNum);
          setModalStatus("info");
        }
      }
    }
  }, [showModal, modalStatus, formattedGameDetails, hasFetchedHistory, betsHistory, selectedGameName, isMinAnimationDone]);

  const formatDate = (timestamp) => {
    if (!timestamp) return "-";
    const date = new Date(timestamp * 1000);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const handleDigitClick = (num) => {
    if (selectedDigits.includes(num)) {
      if (selectedDigits.length === 1) {
        return;
      }
      setSelectedDigits(selectedDigits.filter((d) => d !== num));
      const newAmounts = { ...betAmounts };
      delete newAmounts[num];
      setBetAmounts(newAmounts);
    } else {
      setSelectedDigits([...selectedDigits, num]);
      setBetAmounts({ ...betAmounts, [num]: "100" });
    }
  };

  const handleConfirmBet = async () => {
    if (selectedDigits.length === 0) {
      ("Please select at least one number.", "error");
      return;
    }
    if (!formattedGameDetails?.gameKey) {
      showToast("Game details not loaded yet.", "error");
      return;
    }

    let min = 0;
    let max = Infinity;
    if (minbid !== undefined) min = Number(formatUnits(minbid, 18));
    if (maxbid !== undefined) max = Number(formatUnits(maxbid, 18));

    const amounts = [];
    const numbers = [];

    for (const digit of selectedDigits) {
      const amountStr = betAmounts[digit];
      if (!amountStr || isNaN(amountStr) || Number(amountStr) <= 0) {
        showToast(`Invalid amount for number ${digit}.`, "error");
        return;
      }
      const amountNumber = Number(amountStr);
      if (amountNumber < min) {
        showToast(
          `Minimum bid amount is ${min} USDT (Number ${digit})`,
          "error",
        );
        return;
      }
      if (amountNumber > max) {
        showToast(
          `Maximum bid amount is ${max} USDT (Number ${digit})`,
          "error",
        );
        return;
      }
      amounts.push(parseUnits(amountStr.toString(), 18));
      numbers.push(BigInt(digit));
    }

    const gameName = formattedGameDetails.gameKey;
    const finalReferral = referralAddress.trim();

    if (finalReferral && !isAddress(finalReferral)) {
      showToast("Invalid Referral Address format.", "error");
      return;
    }

    const referralToUse = finalReferral !== "" ? finalReferral : "0x0000000000000000000000000000000000000000";
    const result = await placeBid(gameName, amounts, numbers, referralToUse);

    if (result.success) {
      showToast("Bet placed successfully!", "success");
      const defaultDigit = selectedDigits.length > 0 ? selectedDigits[0] : 1;
      setSelectedDigits([defaultDigit]);
      setBetAmounts({ [defaultDigit]: "100" });
      setTimeout(async () => {
        console.log(">>> fetchBids",)
        await fetchBids();
      }, 1000);
    } else {
      let friendlyError =
        result.error?.shortMessage || result.error?.message || "Unknown error";
      if (friendlyError.includes("reverted with the following reason:")) {
        friendlyError = friendlyError
          .split("reverted with the following reason:")[1]
          .trim();
      }
      showToast(friendlyError, "error");
    }
  };

  const totalStake = selectedDigits.reduce(
    (acc, curr) => acc + (Number(betAmounts[curr]) || 0),
    0,
  );
  const totalReward = Math.round(totalStake * REWARD_MULTIPLIER);

  return (
    <div className='space-y-4'>
      <div className="ps-2">
        <h1 className="text-2xl md:text-4xl lg:text-[40px] font-bold text-white mb-2">
          Play Desk
        </h1>
        <p className="text-[var(--text-gray)] text-sm md:text-base max-w-xl leading-relaxed">
          Make your prediction and participate in the current pool.
        </p>
      </div>

      <div className="bg-gradient-to-r ios-border-fix from-[var(--bg-gradient-1)] to-[var(--bg-gradient-2)] h-full rounded-[32px] p-[14px] md:p-6 relative overflow-hidden flex flex-col lg:flex-row justify-between items-center lg:items-stretch md:gap-6 gap-2.5 shadow-[0_0_40px_rgba(18,68,255,0.2)]">
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-[var(--bg-purple)] rounded-full blur-[80px] pointer-events-none"></div>
        <div className="relative z-10 w-full lg:w-3/5 p-[14px] flex flex-col justify-center">
          <span className="text-xs md:text-sm tracking-widest text-white/80 uppercase mb-4 block">
            [ Current Active Pool ]
          </span>
          <h2 className="text-[22px] md:text-[42px] font-bold text-white mb-2 leading-tight">
            {formattedGameDetails?.displayName || "Game"} (
            {formattedGameDetails?.startTime
              ? formatHourMinute(formattedGameDetails.startTime)
              : "12:00"}{" "}
            –{" "}
            {formattedGameDetails?.endTime
              ? formatHourMinute(formattedGameDetails.endTime)
              : "15:00"}
            )
          </h2>
          <p className="text-[var(--text-gray)] text-sm md:text-base max-w-xl mb-6 leading-relaxed">
            {(() => {
              const cycles = Math.floor(24 / durationHours);
              const numbersToWords = { 1: "One", 2: "Two", 3: "Three", 4: "Four", 5: "Five", 6: "Six", 8: "Eight", 12: "Twelve", 24: "Twenty-four" };
              const cycleText = numbersToWords[cycles] || cycles;
              return `${cycleText} secure ${durationHours}-hour pool cycles operate continuously throughout the day, delivering transparent gameplay, blockchain-verified results, and seamless smart contract settlements.`;
            })()}
          </p>

          <div className="flex items-center">
            <div>
              <div className="text-white/70 text-xs md:text-sm mb-1">Current Pool Volume</div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl md:text-3xl font-bold text-white">
                  {formattedGameDetails?.displayName
                    ? Number(
                      formatUnits(
                        BigInt(formattedGameDetails.totalBidAmount),
                        18,
                      ),
                    ).toFixed(2)
                    : "0"}{" "}
                </span>
                <span className="text-sm font-semibold text-white/80">USDT</span>
              </div>
            </div>

            <div className="w-px h-10 bg-white/20 mx-6 md:mx-10"></div>

            <div>
              <div className="text-white/70 text-xs md:text-sm mb-1">Reward Multiplier</div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl md:text-3xl font-bold text-white">{REWARD_MULTIPLIER.toFixed(1)}X</span>
                <span className="text-sm font-semibold text-white/80">Reward</span>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 w-full md:space-y-8 space-y-4 py-6 lg:w-2/5 max-w-[620px] self-stretch bg-[#F4F7FF] rounded-[32px] p-4 md:p-8 flex flex-col items-center justify-center text-center shadow-xl">
          <h3 className="text-[#0B0C1E] md:text-2xl text-lg font-bold">
            Current Pool Closes In
          </h3>

          <div className="text-[#1244FF] text-lg sm:text-[28px] md:text-4xl font-extrabold tracking-[0.1em] leading-none flex items-center gap-1">
            <h3>
              {Math.floor(timeLeft / 3600)
                .toString()
                .padStart(2, "0")}{" "}
              H
            </h3>

            <span>:</span>

            <h3>
              {Math.floor((timeLeft % 3600) / 60)
                .toString()
                .padStart(2, "0")}{" "}
              Min
            </h3>

            <span>:</span>

            <h3>{(timeLeft % 60).toString().padStart(2, "0")} Sec</h3>
          </div>

          <div className="w-full h-4 bg-[var(--bg-gradient-1)]/10 rounded-full overflow-hidden relative">
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-l from-[var(--bg-gradient-1)] to-[var(--bg-gradient-2)] rounded-full shadow-[0_0_10px_rgba(18,68,255,0.5)] transition-all duration-1000 ease-linear"
              style={{
                width: `${Math.max(0, Math.min(100, (timeLeft / totalTime) * 100))}%`,
              }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pt-2">
        <div className="lg:col-span-4 bg-[var(--bg-panel)] rounded-[32px] p-5 md:p-8 border border-[var(--border-secondary)] relative overflow-hidden flex flex-col h-full">
          <div className="absolute -top-32 -left-32 w-80 h-80 bg-[var(--text-gradient-2)]/10 rounded-full blur-[70px] pointer-events-none"></div>

          <div className="relative z-10 flex-1 flex flex-col">
            <h3 className="text-xl md:text-2xl font-bold text-white mb-2">Select Your Prediction</h3>
            <p className="text-[var(--text-gray)] text-sm mb-8">
              Choose a single digit between 0-9 to participate in the current blockchain consensus pool.
            </p>

            <div className="grid grid-cols-2 gap-4 flex-1 content-start mb-8">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button
                  key={num}
                  onClick={() => handleDigitClick(num)}
                  className={`py-4 rounded-full text-base font-bold transition-all duration-300 ${selectedDigits.includes(num)
                    ? "bg-[var(--bg-gradient-1)] text-white shadow-[0_0_20px_rgba(18,68,255,0.4)] border-transparent"
                    : "bg-transparent text-white border border-[var(--border-secondary)] hover:bg-white/5"
                    }`}
                >
                  {num}
                </button>
              ))}
            </div>

            <div className="mt-auto">
              <div className="bg-[var(--bg-gradient-1)] rounded-[20px] sm:rounded-full py-4 px-6 pt-5 flex justify-between items-center text-white shadow-[0_0_20px_rgba(18,68,255,0.3)] gap-4">
                <span className="text-sm font-semibold shrink-0">Prediction</span>
                <span className="text-lg font-bold text-right break-words">{selectedDigits.length > 0 ? selectedDigits.join(', ') : '-'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 bg-[var(--bg-panel)] rounded-[32px] p-5 md:p-8 border border-[var(--border-secondary)] relative overflow-hidden flex flex-col h-full">
          <div className="absolute -top-32 -left-32 w-80 h-80 bg-[var(--text-gradient-2)]/10 rounded-full blur-[70px] pointer-events-none"></div>

          <h3 className="text-xl md:text-2xl font-bold text-white mb-4">Place Bet</h3>

          <div className="space-y-4 flex-1">
            <div>
              <label className="text-sm font-semibold text-white">Referral Address (Optional)</label>
              <Input
                placeholder="0x..."
                value={referralAddress}
                onChange={(e) => setReferralAddress(e.target.value)}
                className={`text-[var(--text-gray)] my-2 ${errors.referralAddress ? '!border-[var(--color-danger)]' : ''}`}
              />
              {errors.referralAddress && <p className="text-[var(--color-danger)] text-xs mt-1">{errors.referralAddress}</p>}
            </div>

            <div>
              <label className="text-sm font-semibold text-white">Please add your Bet Amount</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-4 mt-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map(digit => {
                  const isSelected = selectedDigits.includes(digit);
                  return (
                    <div key={digit} className={digit === 0 ? 'md:col-span-3' : ''}>
                      <div className={`flex rounded-full overflow-hidden border transition-all duration-300 ${isSelected ? 'border-[#1244FF]' : 'border-[var(--border-secondary)]'}`}>
                        <div
                          className={`flex items-center justify-center w-12 sm:w-16 shrink-0 font-bold text-base pt-1 transition-all duration-300 ${isSelected ? 'bg-[#1244FF] text-white' : 'bg-white/5 text-[var(--text-gray)]'}`}
                        >
                          {digit}
                        </div>
                        <div className="flex-1 bg-transparent relative">
                          <input
                            type="text"
                            className={`w-full h-full bg-transparent text-sm py-4 pt-4.5 pl-3 pr-12 outline-none ${isSelected ? 'text-white' : 'text-[var(--text-gray)]'}`}
                            placeholder={isSelected ? "100" : "-"}
                            value={isSelected ? (betAmounts[digit] || '') : ''}
                            onChange={(e) => {
                              if (!isSelected) return;
                              const val = e.target.value.replace(/[^0-9.]/g, '');
                              if (val.split('.').length > 2) return;
                              setBetAmounts(prev => ({ ...prev, [digit]: val }));
                            }}
                            readOnly={!isSelected}
                          />
                          <span className="absolute right-4 top-1/2 pt-1 -translate-y-1/2 text-[12px] font-semibold text-[#1244FF] uppercase">USDT</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div
              className="mb-4 w-full"
              title={
                isNotStartedYet
                  ? "Game has not started yet. Please wait."
                  : timeLeft <= endTimeBefore
                    ? "Betting is closed for the last 10 minutes of the round."
                    : ""
              }
              style={(timeLeft <= endTimeBefore || isNotStartedYet) ? { cursor: "not-allowed" } : {}}
            >
              {!isConnected ? (
                <button
                  onClick={() => open()}
                  className="w-full cursor-pointer mt-4 bg-[var(--text-gradient-1)] text-white text-sm pt-4 font-bold uppercase tracking-wider py-4 rounded-full shadow-[0_0_20px_rgba(18,68,255,0.3)] hover:shadow-[0_0_25px_rgba(18,68,255,0.5)] transition-shadow"

                >
                  Connect Wallet
                </button>
              ) : (
                <button
                  onClick={handleConfirmBet}
                  disabled={isProcessing || timeLeft <= endTimeBefore || isNotStartedYet}
                  className="w-full cursor-pointer mt-2 bg-[var(--text-gradient-1)] text-white text-sm pt-4 font-bold uppercase tracking-wider py-4 rounded-full shadow-[0_0_20px_rgba(18,68,255,0.3)] hover:shadow-[0_0_25px_rgba(18,68,255,0.5)] transition-shadow"
                  style={
                    isProcessing || timeLeft <= endTimeBefore || isNotStartedYet
                      ? {
                        backgroundColor: "#000000",
                        opacity: 0.7,
                        border: "none",
                        pointerEvents: "none",
                      }
                      : {}
                  }
                >
                  {isNotStartedYet
                    ? "Starts Soon"
                    : timeLeft <= endTimeBefore
                      ? "Betting Closed"
                      : isProcessing
                        ? "Processing..."
                        : "Confirm Bet"}
                </button>
              )}
            </div>

            <div className="bg-[var(--bg-panel)] mt-6 border border-transparent">
              <div className="space-y-3 text-base">
                {/* <div className="flex justify-between items-start sm:items-center text-[var(--text-gray)] gap-4">
                  <span className="shrink-0">Selected Number(s)</span>
                  <span className="text-white font-bold text-right break-words">{selectedDigits.length > 0 ? selectedDigits.join(', ') : '-'}</span>
                </div> */}
                <div className="flex justify-between items-center text-[var(--text-gray)]">
                  <span>Total Stake Amount</span>
                  <span className="text-white font-bold">{totalStake} USDT</span>
                </div>

                <div className="flex justify-between items-center text-[var(--text-gray)]">
                  <span>Reward Multiplier</span>
                  <span className="text-white font-bold">{REWARD_MULTIPLIER.toFixed(1)}X</span>
                </div>
                <div className="h-px w-full bg-[var(--border-secondary)]/30"></div>

                <div className="flex justify-between items-center pt-2">
                  <span className="text-white font-bold text-lg">Total Est. Reward</span>
                  <span className="text-[#26BF38] font-bold text-lg">{totalReward} USDT</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-8 space-y-6">
        <div className='ps-2'>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Current Round Bet History</h2>
          <p className="text-[var(--text-gray)] text-sm">
            Monitor all bets placed in the active consensus pool. Updates are reflected in real time until the round is settled.
          </p>
        </div>

        <div className="bg-[var(--bg-panel)] rounded-[32px] border border-[var(--border-secondary)] overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden md:block">
            <Table>
              <Thead>
                <Tr>
                  <Th>Game Name</Th>
                  <Th>Your Digit</Th>
                  <Th>Bet Amount</Th>
                  <Th>Reward Multiplier</Th>
                  <Th>Potential Win</Th>
                  <Th>Remaining Time</Th>
                </Tr>
              </Thead>
              {paginatedBets.length > 0 && !isHistoryLoading && (
                <Tbody>
                  {paginatedBets.map((row, idx) => (
                    <Tr key={idx}>
                      <Td className="text-white font-medium">{row.gameName}</Td>
                      <Td className="text-white font-medium">{row.prediction}</Td>
                      <Td className="text-[var(--text-gray)]">{row.amount}</Td>
                      <Td className="text-[var(--text-gray)]">{row.multiplier}</Td>
                      <Td className="text-[#26BF38] font-medium">{row.payout}</Td>
                      <Td className="text-[var(--text-gray)] font-medium"> {formatDate(row.bidTime)}</Td>
                    </Tr>
                  ))}
                </Tbody>
              )}
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            <div className="p-4">
              {paginatedBets.length > 0 && !isHistoryLoading && (
                paginatedBets.map((row, idx) => (
                  <div key={idx} className="bg-[#0E1025] rounded-2xl p-4 border border-white/5 shadow-sm">
                    <div className="flex justify-between items-center border-b border-white/5 pb-3 mb-3">
                      <div className="font-bold text-white text-base">{row.gameName}</div>
                      <div className="text-[var(--text-gray)] text-[11px]">{formatDate(row.bidTime)}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                      <div>
                        <div className="text-[var(--text-gray)] text-xs mb-1">Your Digit</div>
                        <div className="text-white font-semibold text-sm">{row.prediction}</div>
                      </div>
                      <div>
                        <div className="text-[var(--text-gray)] text-xs mb-1">Bet Amount</div>
                        <div className="text-white font-semibold text-sm">{row.amount}</div>
                      </div>
                      <div>
                        <div className="text-[var(--text-gray)] text-xs mb-1">Reward Multiplier</div>
                        <div className="text-white font-semibold text-sm">{row.multiplier}</div>
                      </div>
                      <div>
                        <div className="text-[var(--text-gray)] text-xs mb-1">Potential Win</div>
                        <div className="text-[#26BF38] font-bold text-sm">{row.payout}</div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Empty / Loading States */}
          {isHistoryLoading && (
            <div className="text-center text-white min-h-[200px] flex items-center justify-center w-full">
              <Loader text="Loading History..." />
            </div>
          )}

          {!isHistoryLoading && paginatedBets.length === 0 && (
            <div className="text-center text-[var(--text-gray)] font-medium min-h-[200px] flex items-center justify-center w-full">
              No Data Available
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/80 z-[1050] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[var(--bg-panel)] rounded-[32px] border border-white/5 md:p-10 p-4 py-5 max-w-[420px] w-full relative shadow-2xl flex flex-col items-center overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-[#3b28cc]/40 via-[#2563eb]/10 to-transparent pointer-events-none rounded-t-[32px]"></div>

            <style>{`
            @keyframes spinDigit {
              0% { transform: translateY(-40px); opacity: 0; }
              100% { transform: translateY(0); opacity: 1; }
            }
            .spin-animation {
              animation: spinDigit 0.25s ease-out;
              display: inline-block;
            }
          `}</style>

            <p className="text-[11px] font-bold tracking-[0.25em] text-white/60 mb-5 z-10 uppercase">
              [ {modalStatus === "neutral" ? "CHECKING PREDICTION" : "ROUND RESULT DECLARED"} ]
            </p>

            <h4 className="text-3xl font-bold text-white mb-3 z-10">Winning Digit</h4>

            <p className="text-[var(--text-gray)] text-sm text-center mb-12 px-2 leading-relaxed z-10">
              {modalStatus === "neutral" && "The result has been verified and published successfully. Your prediction is now being checked."}
              {modalStatus === "won" && "The result has been verified and published successfully. Your prediction was correct!"}
              {modalStatus === "lost" && "The result has been verified and published successfully. Your prediction is incorrect."}
              {modalStatus === "info" && "The result has been verified and published successfully."}
            </p>

            <div className="relative flex justify-center items-center md:mb-12 mb-5 z-10 min-h-[140px]">
              <h4 className={`text-[130px] leading-none font-black drop-shadow-2xl ${modalStatus === 'won' ? 'text-[var(--bg-active-button)]' :
                modalStatus === 'lost' ? 'text-[var(--color-danger)]' : 'text-white'
                }`}>
                <span key={displayDigit} className={modalStatus === "neutral" ? "spin-animation inline-block" : "inline-block"}>
                  {displayDigit}
                </span>
              </h4>
            </div>

            <div className="text-center min-h-[60px] mb-10 z-10">
              {modalStatus === "won" && (
                <>
                  <h5 className="text-[var(--bg-active-button)] mb-2 font-bold text-xl drop-shadow-[0_0_10px_rgba(38,191,56,0.3)]">
                    Congratulations!
                  </h5>
                  <p className="text-[var(--text-gray)] text-sm">You Won This Round.</p>
                </>
              )}

              {modalStatus === "lost" && (
                <>
                  <h5 className="text-[var(--color-danger)] mb-2 font-bold text-xl drop-shadow-[0_0_10px_rgba(255,77,79,0.3)]">
                    Better Luck Next Time
                  </h5>
                  <p className="text-[var(--text-gray)] text-sm">Your Prediction Didn't Match</p>
                </>
              )}

              {modalStatus === "info" && (
                <>
                  <h5 className="text-white mb-2 font-bold text-xl">
                    Round Finished
                  </h5>
                  <p className="text-[var(--text-gray)] text-sm">You didn't place any bets in this round.</p>
                </>
              )}
            </div>

            <div className="flex flex-row items-center justify-center gap-2 w-full z-10">
              <button
                onClick={handlePlayNextRound}
                className="flex-1 bg-white hover:bg-gray-100 text-[var(--color-primary)] text-xs font-bold py-4 px-2 rounded-full transition-colors uppercase tracking-wider text-center"
              >
                Play Next Round
              </button>
              <Link
                to="/mybets"
                onClick={() => setShowModal(false)}
                className="flex-1 bg-transparent border border-white/20 hover:bg-white/5 text-white text-xs font-bold py-4 px-2 rounded-full transition-colors uppercase tracking-wider text-center"
              >
                View Bet History
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayDesk;
