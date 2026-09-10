import React, { useState, useEffect } from 'react';
import Button from '../components/common/Button';
import CopyButton from '../components/common/CopyButton';
import matka from "../assets/images/matka_image.png"
import { ArrowUpRight, Calendar, Bookmark, X, SlidersHorizontal } from 'lucide-react';
import Select from '../components/common/Select';
import SearchInput from '../components/common/SearchInput';
import Table, { Thead, Tbody, Tr, Th, Td } from '../components/common/Table';
import Pagination from '../components/common/Pagination';
import Loader from '../components/common/Loader';
import { useContractData } from '../hooks/useContractData';
import { useAccount } from 'wagmi';
import { useWallet } from '../context/WalletContext';
import { shareContent } from '../utils/shareUtils';
import MobileFilterDrawer from '../components/common/MobileFilterDrawer';

const MyBets = () => {
  const { isConnected } = useWallet();
  const { betsHistory, isHistoryLoading } = useContractData();
  const { address: userAddress } = useAccount();
  const shortAddress = userAddress
    ? `${userAddress.slice(0, 8)}...${userAddress.slice(-4)}`
    : "";
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPool, setSelectedPool] = useState("All");
  const [selectedResult, setSelectedResult] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Mobile Filter Drawer States
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [tempFromDate, setTempFromDate] = useState("");
  const [tempToDate, setTempToDate] = useState("");
  const [tempSelectedPool, setTempSelectedPool] = useState("All");
  const [tempSelectedResult, setTempSelectedResult] = useState("All");

  const startOfToday = Math.floor(new Date().setHours(0, 0, 0, 0) / 1000);
  let totalBetsCount = 0;
  let totalBetAmount = 0;
  let todaysBetsCount = 0;
  let todaysBetAmount = 0;
  let totalWinningAmount = 0;
  let todaysWinningAmount = 0;

  (betsHistory || []).forEach(bet => {
    totalBetsCount++;
    totalBetAmount += bet.rawAmount || 0;
    if (bet.bidTime >= startOfToday) {
      todaysBetsCount++;
      todaysBetAmount += bet.rawAmount || 0;
    }

    if (bet.result === "WON") {
      totalWinningAmount += bet.payout || 0;
      if (bet.bidTime >= startOfToday) {
        todaysWinningAmount += bet.payout || 0;
      }
    }
  });

  const uniquePools = Array.from(new Set((betsHistory || []).map(bet => bet.pool))).filter(Boolean);

  // Filter list
  const filteredBets = (betsHistory || []).filter((bet) => {
    const matchesSearch = (bet.gameName || bet.id || "")
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesPool = selectedPool === "All" || bet.pool === selectedPool;
    const matchesResult =
      selectedResult === "All" || bet.result === selectedResult;
    const matchesStatus =
      selectedStatus === "All" || bet.status === selectedStatus;

    let matchesDate = true;
    if (fromDate) {
      const betDate = new Date(bet.bidTime * 1000);
      const from = new Date(fromDate);
      from.setHours(0, 0, 0, 0);

      if (toDate) {
        const to = new Date(toDate);
        to.setHours(23, 59, 59, 999);
        matchesDate = betDate >= from && betDate <= to;
      } else {
        matchesDate = betDate >= from;
      }
    }

    return matchesSearch && matchesPool && matchesResult && matchesStatus && matchesDate;
  });

  const totalPages = Math.max(1, Math.ceil(filteredBets.length / itemsPerPage));
  const paginatedBets = filteredBets.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleOpenFilter = () => {
    setTempFromDate(fromDate);
    setTempToDate(toDate);
    setTempSelectedPool(selectedPool);
    setTempSelectedResult(selectedResult);
    setIsFilterOpen(true);
  };

  return (
    <div className='md:space-y-6 space-y-2.5'>
      <div className="mb-4 ps-2">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
          My Bets
        </h1>
        <p className="text-[var(--text-gray)] text-sm md:text-base max-w-xl leading-relaxed">
          Review your betting activity across all pools. Track bets, results, winnings, and transactions in one secure dashboard.
        </p>
      </div>

      <div className="bg-gradient rounded-[32px] md:block hidden p-5 ios-border-fix md:p-8 relative overflow-hidden flex flex-col md:flex-row justify-between items-center shadow-[0_0_40px_rgba(37,99,235,0.2)]">
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-[var(--bg-purple)] rounded-full blur-[52px] pointer-events-none"></div>

        <div className="relative z-10 w-full md:w-1/2 lg:w-2/3 h-full flex flex-col justify-center">
          <h2 className="text-3xl md:text-[38px] font-bold text-white mb-2 leading-tight">
            Share your referral link
          </h2>
          <a
            target='_blank'
            href={`${window.location.origin}/playdesk?ref=${isConnected && userAddress ? userAddress : ""}`}
            className="text-white/80 hover:text-white underline text-sm mb-8 block break-all"
          >
            {window.location.origin}/playdesk?ref=
            {isConnected && userAddress ? shortAddress : ""}
          </a>
          <div className="w-full max-w-xl">
            <label className="text-white/90 text-sm mb-2 block font-medium">Referral ID</label>
            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <div className="relative flex-1">
                <input
                  type="text"
                  readOnly
                  value={`${userAddress ? userAddress : ""}`}
                  className="w-full bg-white/20 border border-white/30 text-white rounded-full py-3.5 px-5 pr-12 focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-md"
                />
                <CopyButton
                  textToCopy={`${window.location.origin}/playdesk?ref=${isConnected && userAddress ? userAddress : ""}`}
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                />
              </div>
              <Button
                className='!px-10'
                onClick={() => {
                  const referralLink = `${window.location.origin}/playdesk?ref=${isConnected && userAddress ? userAddress : ""}`;
                  shareContent(referralLink);
                }}>SHARE</Button>
            </div>
          </div>
        </div>

        <div className="relative md:absolute -bottom-12 -right-12 md:-rotate-15 w-52 h-52 md:w-80 md:h-80 pointer-events-none mt-8 md:mt-0">
          <img src={matka} alt="Matka Pot" className="w-full h-full object-contain" />
        </div>
      </div>

      <div className="bg-gradient rounded-[32px] md:hidden block p-5 md:p-8 relative overflow-hidden flex flex-col justify-between md:min-h-[320px] min-h-[250px] shadow-[0_0_40px_rgba(37,99,235,0.2)] border border-[var(--border-secondary)]">
        <div className="absolute -top-24 -left-24 w-52 h-52 md:w-80 md:h-80 bg-[var(--bg-purple)] rounded-full blur-[52px] pointer-events-none"></div>
        <div className="absolute -bottom-10 -right-10 -rotate-15 w-52 h-52 md:w-80 md:h-80 pointer-events-none">
          <img src={matka} alt="" />
        </div>

        <div className="absolute inset-0 bg-black/50 md:hidden pointer-events-none"></div>

        <div className="relative z-10 w-full h-full flex flex-col justify-center">
          <h2 className="text-[24px] md:text-[42px] font-bold text-white mb-4 leading-tight">
            Share your<br />referral link
          </h2>
          <a
            target='_blank'
            href={`${window.location.origin}/playdesk?ref=${isConnected && userAddress ? userAddress : ""}`}
            className="text-white/80 hover:text-white underline text-sm mb-8 block break-all"
          >
            {window.location.origin}/playdesk?ref=
            {isConnected && userAddress ? userAddress : ""}
          </a>

          <div className="mt-auto w-full relative z-20">
            <label className="text-white/90 text-sm mb-2 block font-medium">Referral ID</label>
            <div className="flex flex-row gap-2 sm:gap-4 w-full items-center">
              <div className="relative flex-1">
                <input
                  type="text"
                  readOnly
                  value={`${isConnected && userAddress ? userAddress : ""}`}
                  className="hidden sm:block w-full bg-white/20 truncate border border-white/30 text-white text-base rounded-full py-3.5 px-5 pr-12 focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-md"
                />
                <input
                  type="text"
                  readOnly
                  value={`${isConnected && userAddress ? shortAddress : ""}`}
                  className="sm:hidden w-full bg-white/20 truncate border border-white/30 text-white text-sm rounded-full py-3.5 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-md underline"
                />

                <div className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 flex items-center">
                  <CopyButton
                    textToCopy={`${window.location.origin}/playdesk?ref=${isConnected && userAddress ? userAddress : ""}`}
                    className="p-1.5"
                  />
                </div>
              </div>

              <button
                onClick={() => {
                  const referralLink = `${window.location.origin}/playdesk?ref=${isConnected && userAddress ? userAddress : ""}`;
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[var(--bg-panel)] rounded-[32px]  border border-[var(--border-secondary)] flex flex-col relative overflow-hidden transition-transform hover:-translate-y-1 duration-300">
          <div className="absolute top-0 -left-10 w-64 h-40 bg-[var(--bg-purple)]/20 rounded-full blur-[40px] pointer-events-none"></div>

          <div className="relative z-10 flex flex-col h-full p-6">
            <div className="flex justify-between items-start mb-8">
              <span className="px-4 py-2 rounded-full text-xs font-bold text-white bg-white/5 border border-white/10">
                Total Bets
              </span>
              <ArrowUpRight className="text-[var(--text-gradient-2)]" size={20} />
            </div>

            <div className="flex items-baseline gap-2 mb-2">
              <h3 className="text-4xl md:text-[40px] font-bold text-white leading-none">{totalBetsCount.toLocaleString()}</h3>
              <span className="text-[var(--text-gradient-2)] font-semibold text-base">Bets</span>
            </div>

            <p className="text-[var(--text-gray)] text-sm mb-4">
              Total bets placed across all consensus pools.
            </p>
          </div>
          <div className="bg-[var(--bg-panel)]/50 border border-[var(--border-primary)] rounded-full px-6 py-4.5 mx-3 mb-3 relative z-10 backdrop-blur-xl">
            <div className="flex justify-between items-center">
              <span className="text-[var(--text-gray)] text-sm">Today's Bets</span>
              <span className="font-bold text-sm text-[#26BF38]">{todaysBetsCount} Bets</span>
            </div>
          </div>
        </div>

        <div className="bg-[var(--bg-panel)] rounded-[32px] border border-[var(--border-secondary)] flex flex-col relative overflow-hidden transition-transform hover:-translate-y-1 duration-300">
          <div className="absolute top-0 -left-10 w-64 h-40 bg-[var(--bg-purple)]/20 rounded-full blur-[40px] pointer-events-none"></div>

          <div className="relative z-10 flex flex-col h-full p-6">
            <div className="flex justify-between items-start mb-8">
              <span className="px-4 py-2 rounded-full text-xs font-bold text-white bg-white/5 border border-white/10">
                Total Bet Amount
              </span>
              <ArrowUpRight className="text-[var(--text-gradient-2)]" size={20} />
            </div>

            <div className="flex items-baseline gap-2 mb-2">
              <h3 className="text-4xl md:text-[40px] font-bold text-white leading-none">{totalBetAmount.toLocaleString()}</h3>
              <span className="text-[var(--text-gradient-2)] font-semibold text-base">USDT</span>
            </div>

            <p className="text-[var(--text-gray)] text-sm mb-4">
              Total wagered on all bets.
            </p>

          </div>
          <div className="bg-[var(--bg-panel)]/50 border border-[var(--border-primary)] rounded-full px-6 py-4.5 mx-3 mb-3 relative z-10 backdrop-blur-xl">
            <div className="flex justify-between items-center">
              <span className="text-[var(--text-gray)] text-sm">Today's Bet Amount</span>
              <span className="font-bold text-sm text-[#26BF38]">{todaysBetAmount.toLocaleString()} USDT</span>
            </div>
          </div>
        </div>

        <div className="bg-[var(--bg-panel)] rounded-[32px] border border-[var(--border-secondary)] flex flex-col relative overflow-hidden transition-transform hover:-translate-y-1 duration-300">
          <div className="absolute top-0 -left-10 w-64 h-40 bg-[var(--bg-purple)]/20 rounded-full blur-[40px] pointer-events-none"></div>

          <div className="relative z-10 flex flex-col h-full p-6">
            <div className="flex justify-between items-start mb-8">
              <span className="px-4 py-2 rounded-full text-xs font-bold text-white bg-white/5 border border-white/10">
                Total Winnings
              </span>
              <ArrowUpRight className="text-[var(--text-gradient-2)]" size={20} />
            </div>

            <div className="flex items-baseline gap-2 mb-2">
              <h3 className="text-4xl md:text-[40px] font-bold text-white leading-none">{totalWinningAmount.toLocaleString()}</h3>
              <span className="text-[var(--text-gradient-2)] font-semibold text-base">USDT</span>
            </div>

            <p className="text-[var(--text-gray)] text-sm mb-4">
              Total bets placed across all consensus pools.
            </p>
          </div>

          <div className="bg-[var(--bg-panel)]/50 border border-[var(--border-primary)] rounded-full px-6 py-4.5 mx-3 mb-3 relative z-10 backdrop-blur-xl">
            <div className="flex justify-between items-center">
              <span className="text-[var(--text-gray)] text-sm">Today's Winnings</span>
              <span className="font-bold text-sm text-[#26BF38]">{todaysWinningAmount.toLocaleString()} USDT</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bet History Section */}
      <div className="pt-5 md:space-y-6 space-y-2.5">
        <div className='ps-2'>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Bet History</h2>
          <p className="text-[var(--text-gray)] text-sm">
            See all your bets, including details, status, and rewards.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row justify-between gap-4">
          {/* Desktop Filters */}
          <div className="hidden sm:flex flex-row gap-4 w-full lg:w-auto flex-wrap">
            <div className="flex flex-row items-center gap-2 w-full sm:w-auto">
              <div className="relative flex items-center w-full sm:w-auto">
                <input
                  type="date"
                  value={fromDate}
                  max={toDate}
                  onChange={(e) => { setFromDate(e.target.value); setCurrentPage(1); }}
                  onKeyDown={(e) => e.preventDefault()}
                  onClick={(e) => e.target.showPicker && e.target.showPicker()}
                  className={`w-full sm:w-[180px] bg-[var(--bg-main)] border border-[var(--border-secondary)] rounded-full pl-4 pr-10 py-2.5 text-sm focus:outline-none focus:border-[#1244FF] h-[44px] cursor-pointer relative z-10 ${fromDate ? 'text-white/80' : 'text-transparent'}`}
                  title="From Date"
                />
                {!fromDate && (
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-gray)] pointer-events-none text-sm z-20">
                    From Date
                  </span>
                )}
                {!fromDate ? (
                  <Calendar size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-gray)] pointer-events-none z-20" />
                ) : (
                  <button
                    onClick={() => { setFromDate(""); setCurrentPage(1); }}
                    className="absolute right-4 text-[var(--text-gray)] hover:text-white transition-colors z-20"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
              <span className="text-[var(--text-gray)] hidden sm:inline-block">to</span>
              <div className="relative flex items-center w-full sm:w-auto">
                <input
                  type="date"
                  value={toDate}
                  min={fromDate}
                  onChange={(e) => { setToDate(e.target.value); setCurrentPage(1); }}
                  onKeyDown={(e) => e.preventDefault()}
                  onClick={(e) => e.target.showPicker && e.target.showPicker()}
                  className={`w-full sm:w-[180px] bg-[var(--bg-main)] border border-[var(--border-secondary)] rounded-full pl-4 pr-10 py-2.5 text-sm focus:outline-none focus:border-[#1244FF] h-[44px] cursor-pointer relative z-10 ${toDate ? 'text-white/80' : 'text-transparent'}`}
                  title="To Date"
                />
                {!toDate && (
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-gray)] pointer-events-none text-sm z-20">
                    To Date
                  </span>
                )}
                {!toDate ? (
                  <Calendar size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-gray)] pointer-events-none z-20" />
                ) : (
                  <button
                    onClick={() => { setToDate(""); setCurrentPage(1); }}
                    className="absolute right-4 text-[var(--text-gray)] hover:text-white transition-colors z-20"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>

            <Select
              icon={Bookmark}
              placeholder="Select Result"
              className="w-full sm:w-40 h-[44px]"
              options={[
                { label: 'All Results', value: 'All' },
                { label: 'Won', value: 'WON' },
                { label: 'Lost', value: 'LOST' },
                { label: 'Pending', value: 'PENDING' }
              ]}
              value={selectedResult}
              onChange={(e) => { setSelectedResult(e.target.value); setCurrentPage(1); }}
            />

            <Select
              placeholder="Select Pool"
              className="w-full sm:w-40 h-[44px]"
              options={[
                { label: 'All Pools', value: 'All' },
                ...uniquePools.map(p => ({ label: p, value: p }))
              ]}
              value={selectedPool}
              onChange={(e) => { setSelectedPool(e.target.value); setCurrentPage(1); }}
            />
          </div>

          <div className="flex sm:hidden gap-3 w-full">
            <div className="flex-1">
              <SearchInput
                placeholder="Search Game Name"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              />
            </div>
            <button
              onClick={handleOpenFilter}
              className="bg-[var(--bg-panel)] border border-[var(--border-secondary)] text-white h-[52px] px-4 rounded-full flex items-center justify-center gap-2 whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-[#1244FF]/50 transition-all hover:bg-white/5 shrink-0"
            >
              <SlidersHorizontal size={18} />
            </button>
          </div>

          <div className="hidden sm:block w-full lg:w-72">
            <SearchInput
              placeholder="Search Game Name"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            />
          </div>
        </div>

        <MobileFilterDrawer
          isOpen={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
          onReset={() => {
            setTempFromDate("");
            setTempToDate("");
            setTempSelectedResult("All");
            setTempSelectedPool("All");
          }}
          onApply={() => {
            setFromDate(tempFromDate);
            setToDate(tempToDate);
            setSelectedResult(tempSelectedResult);
            setSelectedPool(tempSelectedPool);
            setCurrentPage(1);
          }}
        >
          <div className="space-y-5">
            <div>
              <label className="text-white/90 text-sm mb-2 block font-medium">Date Range</label>
              <div className="relative space-y-4">
                <div className="relative flex-1">
                  <input
                    type="date"
                    value={tempFromDate}
                    max={tempToDate}
                    onChange={(e) => setTempFromDate(e.target.value)}
                    onClick={(e) => e.target.showPicker && e.target.showPicker()}
                    className={`w-full bg-transparent border border-white/10 rounded-full pl-4 pr-10 py-2.5 text-sm focus:outline-none focus:border-[#1244FF] h-[44px] cursor-pointer relative z-10 ${tempFromDate ? 'text-white/80' : 'text-transparent'}`}
                  />
                  {!tempFromDate && (
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-gray)] pointer-events-none text-sm z-20">
                      From Date
                    </span>
                  )}
                  {!tempFromDate ? (
                    <Calendar size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-gray)] pointer-events-none z-20" />
                  ) : (
                    <button onClick={() => setTempFromDate("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-gray)] z-20">
                      <X size={14} />
                    </button>
                  )}
                </div>
                <div className="relative flex-1">
                  <input
                    type="date"
                    value={tempToDate}
                    min={tempFromDate}
                    onChange={(e) => setTempToDate(e.target.value)}
                    onClick={(e) => e.target.showPicker && e.target.showPicker()}
                    className={`w-full bg-transparent border border-white/10 rounded-full pl-4 pr-10 py-2.5 text-sm focus:outline-none focus:border-[#1244FF] h-[44px] cursor-pointer relative z-10 ${tempToDate ? 'text-white/80' : 'text-transparent'}`}
                  />
                  {!tempToDate && (
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-gray)] pointer-events-none text-sm z-20">
                      To Date
                    </span>
                  )}
                  {!tempToDate ? (
                    <Calendar size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-gray)] pointer-events-none z-20" />
                  ) : (
                    <button onClick={() => setTempToDate("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-gray)] z-20">
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="text-white/90 text-sm mb-2 block font-medium">Result</label>
              <Select
                icon={Bookmark}
                placeholder="Select Result"
                className="w-full h-[44px]"
                options={[
                  { label: 'All Results', value: 'All' },
                  { label: 'Won', value: 'WON' },
                  { label: 'Lost', value: 'LOST' },
                  { label: 'Pending', value: 'PENDING' }
                ]}
                value={tempSelectedResult}
                onChange={(e) => setTempSelectedResult(e.target.value)}
              />
            </div>

            <div>
              <label className="text-white/90 text-sm mb-2 block font-medium">Pool</label>
              <Select
                placeholder="Select Pool"
                className="w-full h-[44px]"
                options={[
                  { label: 'All Pools', value: 'All' },
                  ...uniquePools.map(p => ({ label: p, value: p }))
                ]}
                value={tempSelectedPool}
                onChange={(e) => setTempSelectedPool(e.target.value)}
              />
            </div>
          </div>
        </MobileFilterDrawer>

        {/* Table Card */}
        <div className="bg-[var(--bg-panel)] rounded-[32px] border border-[var(--border-secondary)] overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden md:block">
            <Table>
              <Thead>
                <Tr>
                  <Th>Game Name</Th>
                  <Th>Date & Time</Th>
                  <Th>Pool</Th>
                  <Th className="text-center">Prediction</Th>
                  <Th>Bet Amount</Th>
                  <Th>Multiplier</Th>
                  <Th>Payout</Th>
                  <Th className="text-center">Winning Digit</Th>
                  <Th className="text-center">Result</Th>
                </Tr>
              </Thead>
              {paginatedBets.length > 0 && !isHistoryLoading && (
                <Tbody>
                  {paginatedBets.map((row, idx) => (
                    <Tr key={idx}>
                      <Td className="text-white font-medium">{row.gameName}</Td>
                      <Td className="text-white/80">{row.dateTime}</Td>
                      <Td className="text-white/80">{row.pool}</Td>
                      <Td className="text-center text-white/80">{row.prediction}</Td>
                      <Td className="text-white/80">{row.amount} USDT</Td>
                      <Td className="text-white/80">{row.multiplier}</Td>
                      <Td className={`font-medium text-[var(--text-gray)]`}>
                        {`${row.payout} USDT`}
                      </Td>
                      <Td className="text-center text-white/80">{row.winningDigit}</Td>
                      <Td className="text-center">
                        <span className={`inline-flex px-3 py-1 text-[12px] pt-1.5 font-bold uppercase tracking-wider rounded border ${row.result === 'WON'
                          ? 'border-[var(--bg-active-button)] text-[var(--bg-active-button)]'
                          : row.result === 'LOST'
                            ? 'border-[var(--color-danger)] text-[var(--color-danger)]'
                            : row.result === 'PENDING'
                              ? 'border-[var(--bg-upcoming-button)] text-[var(--bg-upcoming-button)]'
                              : 'border-[var(--text-gray)] text-[var(--text-gray)]'
                          }`}
                          style={{
                            backgroundColor: row.result === 'WON'
                              ? 'color-mix(in srgb, var(--bg-active-button) 10%, transparent)'
                              : row.result === 'LOST'
                                ? 'color-mix(in srgb, var(--color-danger) 10%, transparent)'
                                : row.result === 'PENDING'
                                  ? 'color-mix(in srgb, var(--bg-upcoming-button) 10%, transparent)'
                                  : 'color-mix(in srgb, var(--text-gray) 10%, transparent)'
                          }}>
                          {row.result}
                        </span>
                      </Td>
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
                  <div key={idx} className="bg-[#0E1025] rounded-[24px] p-4 border border-[var(--border-secondary)] shadow-sm">
                    <div className="flex justify-between items-center border-b border-[var(--border-secondary)] pb-2 mb-4">
                      <div className="font-bold text-white text-base">{row.gameName}</div>
                      <div className="text-[var(--text-gray)] text-[11px]">{row.dateTime}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-y-4 gap-x-2 mb-4">
                      <div>
                        <div className="text-[var(--text-gray)] text-xs mb-1">Pool</div>
                        <div className="text-white font-semibold text-sm">{row.pool}</div>
                      </div>
                      <div>
                        <div className="text-[var(--text-gray)] text-xs mb-1">Prediction</div>
                        <div className="text-white font-semibold text-sm">{row.prediction}</div>
                      </div>
                      <div>
                        <div className="text-[var(--text-gray)] text-xs mb-1">Bet Amount</div>
                        <div className="text-white font-semibold text-sm">{row.amount} USDT</div>
                      </div>
                      <div>
                        <div className="text-[var(--text-gray)] text-xs mb-1">Potential Win</div>
                        <div className={`font-bold text-sm ${row.payout > 0 && row.result === "WON" ? 'text-[#26BF38]' : 'text-[var(--text-gray)]'}`}>
                          {row.result === "WON" ? `+${row.payout} USDT` : '-'}
                        </div>
                      </div>
                      <div>
                        <div className="text-[var(--text-gray)] text-xs mb-1">Multiplier</div>
                        <div className="text-white font-semibold text-sm">{row.multiplier || '-'}</div>
                      </div>
                      <div>
                        <div className="text-[var(--text-gray)] text-xs mb-1">Winning Digit</div>
                        <div className="text-white font-semibold text-sm">{row.winningDigit || '-'}</div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t border-white/5">
                      <span className="text-[var(--text-gray)] text-xs">Status</span>
                      <span className={`inline-flex px-3 py-1 text-[12px] pt-1.5 font-bold uppercase tracking-wider rounded border ${row.result === 'WON'
                        ? 'border-[var(--bg-active-button)] text-[var(--bg-active-button)]'
                        : row.result === 'LOST'
                          ? 'border-[var(--color-danger)] text-[var(--color-danger)]'
                          : row.result === 'PENDING'
                            ? 'border-[var(--bg-upcoming-button)] text-[var(--bg-upcoming-button)]'
                            : 'border-[var(--text-gray)] text-[var(--text-gray)]'
                        }`}
                        style={{
                          backgroundColor: row.result === 'WON'
                            ? 'color-mix(in srgb, var(--bg-active-button) 10%, transparent)'
                            : row.result === 'LOST'
                              ? 'color-mix(in srgb, var(--color-danger) 10%, transparent)'
                              : row.result === 'PENDING'
                                ? 'color-mix(in srgb, var(--bg-upcoming-button) 10%, transparent)'
                                : 'color-mix(in srgb, var(--text-gray) 10%, transparent)'
                        }}>
                        {row.result}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Empty / Loading States */}
          {isHistoryLoading && (
            <div className="text-center text-white min-h-[200px] flex items-center justify-center w-full">
              <Loader text="Loading My Bets..." />
            </div>
          )}

          {!isHistoryLoading && paginatedBets.length === 0 && (
            <div className="text-center text-[var(--text-gray)] font-medium min-h-[200px] flex items-center justify-center w-full">
              No Data Available
            </div>
          )}
        </div>

        {filteredBets.length > 0 && (
          <div className="py-4 sm:p-6 sm:py-2 sm:bg-[var(--bg-panel)]/50 sm:border sm:border-[var(--border-secondary)] sm:rounded-full flex flex-col sm:flex-row justify-between items-center gap-4 w-full">
            <div className="flex items-center justify-between w-full sm:w-auto text-[var(--text-gray)] text-sm gap-2">
              <span className="leading-tight text-left flex-1 sm:flex-none whitespace-nowrap">
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredBets.length)} of {filteredBets.length}
              </span>
              <div className="w-24 shrink-0 mx-2">
                <Select
                  value={itemsPerPage.toString()}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  options={[{ label: '10', value: '10' }, { label: '20', value: '20' }, { label: '30', value: '30' }, { label: '40', value: '40' }, { label: '50', value: '50' }]}
                  className="text-xs"
                  dropdownPosition="top"
                />
              </div>
              <span className="leading-tight text-right flex-1 sm:flex-none">per page</span>
            </div>

            <div className="w-full sm:w-auto overflow-x-auto custom-scrollbar pb-2 sm:pb-0 flex justify-center">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => setCurrentPage(page)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBets;
