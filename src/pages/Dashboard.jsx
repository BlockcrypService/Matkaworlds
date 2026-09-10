import React from 'react';
import { useState, useEffect } from "react";
import Button from '../components/common/Button';
import CopyButton from '../components/common/CopyButton';
import matka from "../assets/images/matka_image.png"
import { Boxchart, ChartLine, Payout } from '../components/common/Svg';
import { useContractData } from '../hooks/useContractData';
import { formatUnits } from "viem";
import { useWallet } from "../context/WalletContext";
import { useAppKit } from "@reown/appkit/react";
import Loader from "../components/common/Loader";
import { Link, useNavigate } from 'react-router-dom';
import { shareContent } from '../utils/shareUtils';
import { Share2 } from 'lucide-react';

const getStatusClass = (status) => {
  switch (status) {
    case 'ACTIVE':
      return 'status-active';
    case 'UPCOMING':
      return 'status-upcoming';
    case 'COMPLETED':
      return 'status-completed';
    default:
      return 'status-completed';
  }
};

const Dashboard = () => {
  const { isConnected } = useWallet();
  const navigate = useNavigate();
  const { address, formattedGameDetails, activePlayersCount, totalPayoutPaid, currentGameUserBets, dynamicPools, isLoadingPools } =
    useContractData();
  const [timeLeft, setTimeLeft] = useState(0);
  const shortAddress = address
    ? `${address.slice(0, 8)}...${address.slice(-4)}`
    : "";

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

    const timer = setInterval(() => {
      const nowSeconds = Math.floor(Date.now() / 1000);
      let remaining = Number(formattedGameDetails.endTime) - nowSeconds;
      let comingSoon = false;

      if (
        formattedGameDetails.startTime &&
        nowSeconds < Number(formattedGameDetails.startTime)
      ) {
        remaining =
          Number(formattedGameDetails.endTime) -
          Number(formattedGameDetails.startTime);
        comingSoon = true;
      }

      setTimeLeft(remaining > 0 ? remaining : 0);
      // setIsComingSoon(comingSoon);
      // setIsGameOver(!comingSoon && remaining <= 0);
    }, 1000);
    return () => clearInterval(timer);
  }, [formattedGameDetails?.endTime, formattedGameDetails?.startTime]);

  const durationHours = formattedGameDetails?.startTime && formattedGameDetails?.endTime
    ? Math.max(1, Math.round((Number(formattedGameDetails.endTime) - Number(formattedGameDetails.startTime)) / 3600))
    : 6;

  return (
    <div className='md:space-y-6 space-y-2.5'>
      <h1 className="text-2xl ps-2 md:text-4xl font-bold text-white md:mb-5 mb-3">
        Welcome to <span className="text-gradient">The Matka</span>
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 md:gap-4 gap-2.5">
        <div className="bg-[var(--bg-panel)] rounded-[32px] p-5 md:p-8 relative overflow-hidden ios-border-fix flex flex-col justify-between md:min-h-[320px] min-h-[250px]">
          <div className="absolute top-0 left-0 md:w-40 w-28 md:h-40 h-28 bg-[var(--bg-gradient-2)] rounded-full blur-[56px] pointer-events-none"></div>
          <div className="relative z-10 max-w-md h-full flex flex-col justify-center">
            <h2 className="text-2xl md:text-[42px] font-bold text-white mb-4 leading-tight">
              Play Smart.<br />Play On-Chain.
            </h2>
            <p className="text-[var(--text-gray)] text-sm md:text-base mb-4 leading-relaxed">
              Join the next decentralized gaming round with transparent, blockchain-verified results.
            </p>
            <div className="mt-auto">
              <Button
                type="button"
                className="!px-8 !py-3 text-sm w-full md:w-auto"
                onClick={() => {
                  navigate("/playdesk");
                }}
              >
                START PLAYING
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-gradient rounded-[32px] p-5 md:p-8 relative overflow-hidden ios-border-fix flex flex-col justify-between md:min-h-[320px] min-h-[250px] shadow-[0_0_40px_rgba(37,99,235,0.2)] border border-[var(--border-secondary)]">
          <div className="absolute -top-24 -left-24 w-80 h-80 bg-[var(--bg-purple)] rounded-full blur-[52px] pointer-events-none"></div>
          <div className="absolute -bottom-10 -right-10 -rotate-15 md:w-80 md:h-80 w-52 h-52 pointer-events-none">
            <img src={matka} alt="" />
          </div>

          <div className="absolute inset-0 bg-black/50 md:hidden pointer-events-none"></div>

          <div className="relative z-10 w-full h-full flex flex-col justify-center">
            <h2 className="text-[24px] md:text-[42px] font-bold text-white mb-4 leading-tight">
              Share your<br />referral link
            </h2>
            <a
              target='_blank'
              href={`${window.location.origin}/playdesk?ref=${isConnected && address ? address : ""}`}
              className="text-white/80 truncate hover:text-white underline text-sm mb-8 block break-all"
            >
              {window.location.origin}/playdesk?ref=
              {isConnected && address ? shortAddress : ""}
            </a>

            <div className="mt-auto w-full relative z-20">
              <label className="text-white/90 text-sm mb-2 block font-medium">Referral ID</label>
              <div className="flex flex-row gap-2 sm:gap-4 w-full items-center">
                <div className="relative flex-1">
                  <input
                    type="text"
                    readOnly
                    value={`${isConnected && address ? address : ""}`}
                    className="hidden sm:block w-full bg-white/20 truncate border border-white/30 text-white text-base rounded-full py-3.5 px-5 pr-12 focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-md"
                  />
                  <input
                    type="text"
                    readOnly
                    value={`${isConnected && address ? shortAddress : ""}`}
                    className="sm:hidden w-full bg-white/20 truncate border border-white/30 text-white text-sm rounded-full py-3.5 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-md underline"
                  />

                  <div className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 flex items-center">
                    <CopyButton
                      textToCopy={`${window.location.origin}/playdesk?ref=${isConnected && address ? address : ""}`}
                      className="p-1.5"
                    />
                  </div>
                </div>

                <button
                  onClick={() => {
                    const referralLink = `${window.location.origin}/playdesk?ref=${isConnected && address ? address : ""}`;
                    shareContent(referralLink);
                  }}
                  className="bg-white text-[#1244FF] font-bold text-sm pt-4 md:px-6 px-4 py-3.5 rounded-full hover:bg-gray-100 transition-colors shadow-md whitespace-nowrap"
                >
                  SHARE
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 md:gap-4 gap-2.5 w-full">
          <div className="flex flex-col bg-gradient rounded-[32px] min-h-[400px] sm:min-h-[400px] lg:min-h-[513px] overflow-hidden relative border border-[var(--border-secondary)] shadow-lg">
            <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-[180%] h-[570px] bg-[var(--bg-panel)] rounded-xl blur-[100px] z-0 pointer-events-none"></div>
            <div className="absolute -top-10 -left-10 w-32 h-32 bg-[var(--bg-purple)] rounded-full blur-[52px] pointer-events-none"></div>
            <div className="relative p-5 md:p-8 pb-32 flex-grow z-10">
              <p className="text-[var(--text-gray)] text-sm font-semibold mb-2 uppercase tracking-wider">Current Pool Volume</p>
              <div className="flex gap-2 items-baseline relative z-10">
                <h2 className="text-4xl md:text-[42px] font-bold text-white mb-0 leading-none">
                  {formattedGameDetails?.displayName
                    ? Number(
                      formatUnits(
                        BigInt(formattedGameDetails.totalBidAmount),
                        18,
                      ),
                    ).toFixed(2)
                    : "0"}{" "}
                </h2>
                <span className="text-gradient font-bold text-lg">
                  USDT
                </span>
              </div>
              <div className="absolute bottom-8 left-0 right-0 h-[250px] pointer-events-none opacity-90">
                <Boxchart />
              </div>
            </div>
            <div className="bg-[var(--bg-panel)]/50 border mx-2 mb-2 border-[var(--border-primary)] rounded-full px-6 py-4.5 flex justify-between items-center relative z-10 backdrop-blur-xl">
              <span className="text-white/70 font-medium text-xs sm:text-base">Your Total Bets</span>
              <span className="text-[#26BF38] font-bold text-xs sm:text-base">
                {currentGameUserBets !== undefined
                  ? `${Number(currentGameUserBets)} Bet${Number(currentGameUserBets) !== 1 ? "s" : ""}`
                  : address ? "0 Bets" : "— Bets"}
              </span>
            </div>
          </div>

          <div className="flex flex-col bg-gradient rounded-[32px] min-h-[400px] sm:min-h-[400px] lg:min-h-[513px] overflow-hidden relative border border-[var(--border-secondary)] shadow-lg">
            <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-[180%] h-[570px] bg-[var(--bg-panel)] rounded-xl blur-[100px] z-0 pointer-events-none"></div>
            <div className="absolute -top-10 -left-10 w-32 h-32 bg-[var(--bg-purple)] rounded-full blur-[52px] pointer-events-none"></div>
            <div className="relative p-5 md:p-8 pb-32 flex-grow z-10">
              <p className="text-[var(--text-gray)] text-sm font-semibold mb-2 uppercase tracking-wider">Active Players</p>
              <div className="flex gap-2 items-baseline relative z-10">
                <h2 className="text-4xl md:text-[42px] font-bold text-white mb-0 leading-none">
                  {activePlayersCount !== undefined
                    ? Number(activePlayersCount).toLocaleString()
                    : "0"}
                </h2>
                <span className="text-gradient font-bold text-lg">
                  Players
                </span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-[180px] pointer-events-none opacity-90">
                <ChartLine />
              </div>
            </div>
            <div className="bg-[var(--bg-panel)]/50 border mx-2 mb-2 border-[var(--border-primary)] rounded-full px-6 py-4.5 flex justify-between items-center relative z-10 backdrop-blur-xl">
              <span className="text-white/70 font-medium text-xs sm:text-base">Current Block Concurrency</span>
              <span className="text-[#26BF38] font-bold text-xs sm:text-base">100% Synced</span>
            </div>
          </div>

          <div className="flex flex-col bg-gradient rounded-[32px] min-h-[400px] sm:min-h-[400px] lg:min-h-[513px] overflow-hidden relative border border-[var(--border-secondary)] shadow-lg">
            <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-[180%] h-[570px] bg-[var(--bg-panel)] rounded-xl blur-[100px] z-0 pointer-events-none"></div>
            <div className="absolute -top-10 -left-10 w-32 h-32 bg-[var(--bg-purple)] rounded-full blur-[52px] pointer-events-none"></div>
            <div className="relative p-5 md:p-8 pb-20 flex-grow z-10 ">
              <p className="text-[var(--text-gray)] text-sm font-semibold mb-4 uppercase tracking-wider relative z-10">Total Payout Paid (Won)</p>
              <div className="flex gap-2 items-baseline relative z-10">
                <h2 className="text-4xl md:text-[42px] font-bold text-white mb-0 leading-none">
                  {totalPayoutPaid !== undefined
                    ? Number(formatUnits(totalPayoutPaid, 18)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                    : "0"}
                </h2>
                <span className="text-gradient font-bold text-lg">
                  USDT
                </span>
              </div>
              {/* <div className="flex flex-col items-center relative z-10 mb-2">
                  <h2 className="text-3xl sm:text-[36px] md:text-[44px] font-bold text-white mb-1 leading-none tracking-tight">
                    1,248.50
                  </h2>
                  <span className="text-gradient font-medium text-sm sm:text-lg">
                    Total USDT
                  </span>
                </div> */}

              <div className="absolute bottom-5 left-0 right-0 h-[260px] pointer-events-none opacity-100 flex justify-center items-end">
                <Payout className="w-full mx-4 max-w-[440px]" />
              </div>
            </div>
            <div className="bg-[var(--bg-panel)]/50 border mx-2 mb-2 border-[var(--border-primary)] rounded-full px-6 py-4.5 flex justify-between items-center relative z-10 backdrop-blur-xl">
              <span className="text-white/70 font-medium text-xs sm:text-base">Current Win Rate:</span>
              <span className="text-[#26BF38] font-bold text-xs sm:text-base">00.00% (0 Wins)</span>
            </div>
          </div>
        </div>
      </section>

      <div className="w-full rounded-[32px] space-y-3 bg-gradient p-2 md:py-2 pt-5 pb-2 flex flex-col md:flex-row items-center justify-between shadow-[0_0_40px_rgba(37,99,235,0.15)] relative overflow-hidden ios-border-fix">
        <div className="absolute top-0 left-0 w-28 h-28 bg-[var(--bg-purple)] rounded-full blur-[35px] pointer-events-none"></div>

        <div className="flex flex-col md:pl-10 space-y-3 w-full md:w-auto relative z-10 text-center md:text-left items-center md:items-start">
          <h2 className="text-white text-2xl sm:text-[28px] md:text-4xl font-bold tracking-tight">Current Pool Closes In</h2>
          <div className="text-white/90 text-xs md:text-sm font-medium flex items-center justify-center md:justify-start gap-2 uppercase tracking-wide">
            <span>{formattedGameDetails?.displayName || "Game"} </span>
            <span className="w-1.5 h-1.5 rounded-full bg-white/80"></span>
            <span>
              {formattedGameDetails?.startTime
                ? formatHourMinute(formattedGameDetails.startTime)
                : "12:00"}{" "}
              –{" "}
              {formattedGameDetails?.endTime
                ? formatHourMinute(formattedGameDetails.endTime)
                : "15:00"}
            </span>
          </div>
        </div>

        <div className="bg-[#F8F9FC] rounded-[32px] px-4 sm:px-10 py-6 md:py-10 w-full md:w-auto flex justify-center items-center shadow-lg relative z-10">
          <div className="text-[#1244FF] text-xl pt-1 sm:text-2xl md:text-[48px] font-extrabold tracking-[0.05em] sm:tracking-[0.1em] leading-none flex items-center gap-1">
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
        </div>
      </div>

      <section className="w-full pt-8">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-end md:mb-8 mb-4 md:gap-4 gap-2.5">
          <div className="md:text-left text-center">
            <h2 className="text-2xl md:text-[40px] font-bold text-white leading-tight">
              Blockchain<br />Consensus Pools
            </h2>
          </div>
          <div className="flex flex-col items-center md:items-start max-w-md text-center md:text-start gap-4">
            <p className="text-white/80 text-sm leading-relaxed">
              {(() => {
                const cycles = Math.floor(24 / durationHours);
                const numbersToWords = { 1: "One", 2: "Two", 3: "Three", 4: "Four", 5: "Five", 6: "Six", 8: "Eight", 12: "Twelve", 24: "Twenty-four" };
                const cycleText = numbersToWords[cycles] || cycles;
                return `${cycleText} secure ${durationHours}-hour pool cycles operate all day, providing transparent gameplay and blockchain-verified results.`;
              })()}
            </p>
            <div className="w-full justify-center md:justify-start flex flex-row items-center gap-3">
              <Button
                isIcon={false}
                type="button"
                onClick={() => {
                  navigate("/playdesk");
                }}
                className="!px-8 !py-3 text-xs md:text-sm w-auto"
              >START PLAYING</Button>
              {!isLoadingPools && (
                <button
                  onClick={() => navigate("/pools")}
                  className="px-6 py-3.5 pt-4 w-auto text-xs md:text-sm whitespace-nowrap font-bold text-[#C0CCEC] uppercase tracking-wider rounded-full border border-[var(--border-secondary)] bg-[var(--bg-main)] hover:bg-white/5 transition-colors shadow-lg"
                >
                  VIEW ALL
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex overflow-x-auto md:grid md:grid-cols-2 lg:grid-cols-4 gap-4 pb-4 snap-x snap-mandatory hide-scrollbar">
          {isLoadingPools ? (
            <div className="col-span-full w-full py-20 flex justify-center items-center">
              <Loader text="Loading Pools..." />
            </div>
          ) : dynamicPools?.length === 0 ? (
            <div className="col-span-full w-full py-20 flex flex-col items-center justify-center bg-[var(--bg-panel)] rounded-[32px] border border-[var(--border-secondary)]">
              <h3 className="md:text-xl text-base font-semibold text-white mb-2">No Pools Available</h3>
              <p className="text-[var(--text-gray)] md:text-base text-sm text-center">There are currently no active pools to display.</p>
            </div>
          ) : (
            dynamicPools?.slice(0, 8).map((pool) => {
              const data = [
                {
                  lable: "Closing Volume",
                  value: pool.closingVolume
                },
                {
                  lable: "Total Players",
                  value: pool.totalPlayers
                },
                {
                  lable: " Winning Payout",
                  value: pool.winningPayout
                }
              ];
              return (
                <div
                  key={pool.id}
                  className={`min-w-[85vw] sm:min-w-[60vw] md:min-w-0 snap-center rounded-[32px] p-2 flex flex-col relative overflow-hidden ios-border-fix transition-transform hover:-translate-y-1 duration-300 bg-[var(--bg-panel)] border ${pool.isActive ? 'border-[var(--text-gradient-2)] shadow-[0_0_30px_rgba(18,68,255,0.2)]' : 'border-[var(--border-secondary)]'
                    }`
                  }
                >
                  <div className={`rounded-[24px] p-4 flex flex-col relative ${pool.status == "active"
                    ? 'bg-gradient-to-t from-[#1244FF] to-[#090A1B]'
                    : 'bg-gradient-to-b from-[#090A1B] to-[#1244FF]/20'
                    }`}>
                    <div className="flex justify-between items-center md:mb-6 mb-4">
                      <span className={`px-4 py-1.5 rounded-full text-[12px] font-semibold pt-2 text-white ${getStatusClass(pool?.status?.toUpperCase())} tracking-wider`}>
                        {pool.status.toUpperCase()}
                      </span>
                      <span className="text-white/80 md:text-sm text-xs font-medium">{pool.gameName}</span>
                    </div>

                    <h3 className="text-2xl font-bold text-white mb-1">{pool.displayName}</h3>
                    <p className="text-[#EFF2FA] text-sm mb-3">{pool.hours}</p>
                    <p className="text-[var(--text-gray)] text-sm min-h-[44px] md:mb-6 mb-4 leading-relaxed">
                      {pool.desc}
                    </p>

                    {/* {pool.gameFinalized ? (
                      <Button className="w-full !py-3.5 shadow-lg text-sm">OVER GAME</Button>
                    ) : (
                      <button className="w-full py-3.5 pt-4 rounded-full bg-[var(--bg-main)] text-[#C0CCEC] font-bold text-sm hover:bg-white/5 transition-colors border border-[var(--border-secondary)]">
                        START PLAYING
                      </button>
                    )} */}

                    {pool.status === "active" ? (
                      <Button
                        onClick={() => {
                          navigate("/playdesk", { state: { gameName: pool.gameName } });
                        }}
                        type="button"
                        style={{ width: "100%" }}
                        className="shadow-lg text-sm"
                      >
                        <span>START PLAYING</span>
                      </Button>
                    ) : pool.status === "upcoming" ? (
                      <button
                        className="w-full py-3.5 pt-4 rounded-full bg-[var(--bg-main)] text-[#C0CCEC] font-bold text-sm hover:bg-white/5 transition-colors border border-[var(--border-secondary)]"
                        style={{ pointerEvents: "none", opacity: 0.7 }}
                      >
                        <span>GAME STARTS SOON</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          navigate("/playdesk", { state: { gameName: pool.gameName } });
                        }}
                        className="w-full py-3.5 pt-4 rounded-full bg-[var(--bg-main)] text-[#C0CCEC] font-bold text-sm hover:bg-white/5 transition-colors border border-[var(--border-secondary)]"
                        style={{ pointerEvents: "none" }}
                      >
                        <span className="hover_div"></span>
                        <span>OVER GAME</span>
                      </button>
                    )}
                  </div>

                  <div className="px-4 pt-6 pb-2 mt-auto flex flex-col h-full">
                    <h4 className="text-white text-base font-semibold mb-3 border-b pb-3 border-[var(--border-secondary)]">{pool.sectionTitle || 'Pool Statistics'}</h4>
                    <div className="flex flex-col gap-3 mb-2">
                      {data.map((stat, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="text-[var(--text-gray)] text-sm">{stat.lable}</span>
                          <span className="text-[#EFF2FA] font-medium text-sm">{stat.value || '0'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {!pool.gameFinalized && (
                    <div className="bg-gradient border border-[var(--border-secondary)] rounded-full px-6 mx-2 mb-2 py-4 relative z-10 backdrop-blur-xl">
                      <div className="flex justify-center items-center">
                        <span className="text-sm">Next Declaration</span>
                      </div>
                    </div>
                  )}
                  {pool.gameFinalized && (
                    <div className="bg-[var(--bg-panel)]/50 border border-[var(--border-secondary)] rounded-full px-4 pr-2 mx-2 mb-2 py-2 relative z-10 backdrop-blur-xl">
                      <div className="flex justify-between items-center">
                        <span className="text-white/60 text-sm">Consensus Result</span>
                        <Link
                          to="/playdesk"
                          state={{
                            gameName: pool.gameName,
                            openResult: true,
                          }}
                          className="bg-gradient border border-[var(--border-secondary)] hover:bg-white/10 text-white text-xs px-5 py-2 rounded-full transition-colors"
                        >
                          View Result
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              )
            }))}
        </div>
      </section >
    </div >
  );
};

export default Dashboard;
