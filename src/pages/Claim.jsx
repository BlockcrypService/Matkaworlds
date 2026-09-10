import React, { useState } from 'react';
import { Calendar, Bookmark, X, SlidersHorizontal } from 'lucide-react';
import Select from '../components/common/Select';
import SearchInput from '../components/common/SearchInput';
import Table, { Thead, Tbody, Tr, Th, Td } from '../components/common/Table';
import Pagination from '../components/common/Pagination';
import Loader from '../components/common/Loader';
import ClaimModal from '../components/common/ClaimModal';
import MobileFilterDrawer from '../components/common/MobileFilterDrawer';
import { useContractData } from '../hooks/useContractData';

const Claim = () => {
  const [selectedBetToClaim, setSelectedBetToClaim] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPool, setSelectedPool] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  // Mobile Filter Drawer States
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [tempFromDate, setTempFromDate] = useState("");
  const [tempToDate, setTempToDate] = useState("");
  const [tempSelectedPool, setTempSelectedPool] = useState("All");
  const [tempSelectedStatus, setTempSelectedStatus] = useState("All");

  const { betsHistory, isHistoryLoading, fee, markBetAsClaimed } = useContractData();
  const winningBets = betsHistory?.filter(bet => bet.result === "WON") || [];
  const uniquePools = Array.from(new Set(winningBets.map(bet => bet.pool))).filter(Boolean);

  const filteredBets = winningBets.filter((bet) => {
    const matchesSearch = (bet.gameName || bet.id || "")
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesPool = selectedPool === "All" || bet.pool === selectedPool;

    const matchesStatus =
      selectedStatus === "All" ||
      (selectedStatus === "PENDING" && !bet.isClaimed) ||
      (selectedStatus === "SETTLED" && bet.isClaimed);

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

    return matchesSearch && matchesPool && matchesStatus && matchesDate;
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
    setTempSelectedStatus(selectedStatus);
    setIsFilterOpen(true);
  };

  return (
    <div className='space-y-4'>
      <div className="ps-2">
        <h1 className="text-2xl md:text-4xl lg:text-[40px] font-bold text-white mb-2">
          Total Winning <span className="text-gradient">Bets</span>
        </h1>
        <p className="text-[var(--text-gray)] text-sm md:text-base max-w-xl leading-relaxed">
          Total successful bets across all completed rounds.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row justify-between gap-4">
        {/* Desktop Filters */}
        <div className="hidden sm:flex flex-col sm:flex-row gap-4 w-full lg:w-auto flex-wrap">
          <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
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
            placeholder="Select Status"
            className="w-full sm:w-40 h-[44px]"
            options={[
              { label: 'All Statuses', value: 'All' },
              { label: 'Claim', value: 'PENDING' },
              { label: 'Claimed', value: 'SETTLED' }
            ]}
            value={selectedStatus}
            onChange={(e) => { setSelectedStatus(e.target.value); setCurrentPage(1); }}
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

        {/* Mobile Filter Button & Search */}
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

        {/* Desktop Search */}
        <div className="hidden sm:block w-full lg:w-72">
          <SearchInput
            placeholder="Search Game Name"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
          />
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      <MobileFilterDrawer
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        onReset={() => {
          setTempFromDate("");
          setTempToDate("");
          setTempSelectedStatus("All");
          setTempSelectedPool("All");
        }}
        onApply={() => {
          setFromDate(tempFromDate);
          setToDate(tempToDate);
          setSelectedStatus(tempSelectedStatus);
          setSelectedPool(tempSelectedPool);
          setCurrentPage(1);
        }}
      >
        <div className="space-y-5">
          <div>
            <label className="text-white/90 text-sm mb-2 block font-medium">Date Range</label>
            <div className="space-y-4">
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
            <label className="text-white/90 text-sm mb-2 block font-medium">Status</label>
            <Select
              icon={Bookmark}
              placeholder="Select Status"
              className="w-full h-[44px]"
              options={[
                { label: 'All Statuses', value: 'All' },
                { label: 'Claim', value: 'PENDING' },
                { label: 'Claimed', value: 'SETTLED' }
              ]}
              value={tempSelectedStatus}
              onChange={(e) => setTempSelectedStatus(e.target.value)}
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
                <Th className="text-center">Winning Digit</Th>
                <Th>Bet Amount</Th>
                <Th>Payout</Th>
                <Th className="text-center">Status</Th>
              </Tr>
            </Thead>
            {paginatedBets.length > 0 && !isHistoryLoading && (
              <Tbody>
                {paginatedBets.map((row, idx) => (
                  <Tr key={idx}>
                    <Td className="text-[var(--text-gray)]">{row.gameName}</Td>
                    <Td className="text-white font-medium">{row.dateTime}</Td>
                    <Td className="text-[var(--text-gray)]">{row.pool}</Td>
                    <Td className="text-center text-[var(--text-gray)]">{row.prediction}</Td>
                    <Td className="text-center text-[var(--text-gray)]">{row.winningDigit}</Td>
                    <Td className="text-[var(--text-gray)]">{row.amount} USDT</Td>
                    <Td className="font-medium text-[#26BF38]">
                      +{row.payout} USDT
                    </Td>
                    <Td className="text-center">
                      {!row.isClaimed ? (
                        <button
                          onClick={() => setSelectedBetToClaim(row)}
                          className="bg-gradient pt-3 hover:bg-[#0E35D4] text-white font-bold text-[11px] tracking-wider px-6 py-2 rounded-full transition-all shadow-[0_0_15px_rgba(59,130,246,0.4)] hover:shadow-[0_0_20px_rgba(18,68,255,0.6)]"
                        >
                          CLAIM
                        </button>
                      ) : (
                        <span className="inline-block pt-3 border border-[var(--border-secondary)] text-[var(--text-gray)] px-5 py-2 text-[11px] tracking-wider rounded-full bg-white/5">
                          Claimed
                        </span>
                      )}
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
                <div key={idx} className="bg-[#0E1025] rounded-2xl p-4 border border-white/5 shadow-sm">
                  <div className="flex justify-between items-center border-b border-white/5 pb-3 mb-3">
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
                      <div className="text-[var(--text-gray)] text-xs mb-1">Winning Digit</div>
                      <div className="text-white font-semibold text-sm">{row.winningDigit}</div>
                    </div>
                    <div>
                      <div className="text-[var(--text-gray)] text-xs mb-1">Bet Amount</div>
                      <div className="text-white font-semibold text-sm">{row.amount} USDT</div>
                    </div>
                    <div>
                      <div className="text-[var(--text-gray)] text-xs mb-1">Payout</div>
                      <div className="text-[#26BF38] font-bold text-sm">+{row.payout} USDT</div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-white/5">
                    <span className="text-[var(--text-gray)] text-xs">Status</span>
                    {!row.isClaimed ? (
                      <button
                        onClick={() => setSelectedBetToClaim(row)}
                        className="bg-gradient pt-2 hover:bg-[#0E35D4] text-white font-bold text-[11px] tracking-wider px-6 py-1.5 rounded-full transition-all shadow-[0_0_15px_rgba(59,130,246,0.4)] hover:shadow-[0_0_20px_rgba(18,68,255,0.6)]"
                      >
                        CLAIM
                      </button>
                    ) : (
                      <span className="inline-block pt-2 border border-[var(--border-secondary)] text-[var(--text-gray)] px-5 py-1.5 text-[11px] tracking-wider rounded-full bg-white/5">
                        Claimed
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Empty / Loading States */}
        {isHistoryLoading && (
          <div className="text-center text-white min-h-[200px] flex items-center justify-center w-full">
            <Loader text="Loading Claims..." />
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
      {selectedBetToClaim && (
        <ClaimModal
          bet={selectedBetToClaim}
          fee={fee}
          onClose={() => setSelectedBetToClaim(null)}
          onSuccess={() => {
            markBetAsClaimed(selectedBetToClaim.id);
            setSelectedBetToClaim(null);
          }}
        />
      )}
    </div>
  );
};

export default Claim;
