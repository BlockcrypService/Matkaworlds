import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useContractData } from '../hooks/useContractData';
import Loader from '../components/common/Loader';
import Pagination from '../components/common/Pagination';
import Button from '../components/common/Button';
import { Search } from 'lucide-react';

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

const Pools = () => {
  const navigate = useNavigate();
  const { dynamicPools, isLoadingPools } = useContractData();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; // Number of pools per page

  // Filter pools based on search query
  const filteredPools = useMemo(() => {
    if (!dynamicPools) return [];
    if (!searchQuery.trim()) return dynamicPools;

    const query = searchQuery.toLowerCase();
    return dynamicPools.filter(
      (pool) =>
        (pool.gameName && pool.gameName.toLowerCase().includes(query)) ||
        (pool.displayName && pool.displayName.toLowerCase().includes(query))
    );
  }, [dynamicPools, searchQuery]);

  // Pagination logic
  const totalPages = Math.ceil(filteredPools.length / itemsPerPage);
  const paginatedPools = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredPools.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredPools, currentPage, itemsPerPage]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page on new search
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  return (
    <div className='md:space-y-6 space-y-2.5'>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center md:gap-4 gap-2.5 md:mb-6 mb-4">
        <div className="ps-2">
          <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">
            Blockchain Consensus <span className="text-gradient">Pools</span>
          </h1>
          <p className="text-[var(--text-gray)] text-sm md:text-base">
            Explore all available pools, track closing volumes, and join active games.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search by game name..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-full bg-[var(--bg-panel)] border border-[var(--border-secondary)] text-white text-sm rounded-full py-3.5 pl-12 pr-4 focus:outline-none focus:ring-1 focus:ring-[var(--border-primary)] transition-shadow"
          />
        </div>
      </div>

      <section className="w-full">
        {isLoadingPools ? (
          <div className="w-full py-20 flex justify-center items-center">
            <Loader text="Loading Pools..." />
          </div>
        ) : (!dynamicPools || dynamicPools.length === 0) ? (
          <div className="w-full py-20 flex flex-col items-center justify-center bg-[var(--bg-panel)] rounded-[32px] border border-[var(--border-secondary)]">
            <h3 className="md:text-xl text-base font-semibold text-white mb-2">No Pools Available</h3>
            <p className="text-[var(--text-gray)] md:text-base text-sm text-center">There are currently no active pools to display.</p>
          </div>
        ) : filteredPools.length === 0 ? (
          <div className="w-full py-20 flex flex-col items-center justify-center bg-[var(--bg-panel)] rounded-[32px] border border-[var(--border-secondary)]">
            <Search className="h-12 w-12 text-[var(--text-gray)] mb-4 opacity-50" />
            <h3 className="md:text-xl text-base  font-semibold text-white mb-2">No Pools Found</h3>
            <p className="text-[var(--text-gray)] md:text-base text-sm text-center">We couldn't find any pools matching "{searchQuery}"</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {paginatedPools.map((pool) => {
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
                  lable: "Winning Payout",
                  value: pool.winningPayout
                }
              ];

              return (
                <div
                  key={pool.id}
                  className={`rounded-[32px] p-2 flex flex-col relative overflow-hidden transition-transform hover:-translate-y-1 duration-300 bg-[var(--bg-panel)] border ${pool.status === 'active' ? 'border-[var(--text-gradient-2)] shadow-[0_0_30px_rgba(18,68,255,0.2)]' : 'border-[var(--border-secondary)]'
                    }`
                  }
                >
                  <div className={`rounded-[24px] p-4 flex flex-col relative ${pool.status === "active"
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
                        className="w-full py-3.5 pt-4 rounded-full bg-[var(--bg-main)] text-[#C0CCEC] font-bold text-sm border border-[var(--border-secondary)]"
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
              );
            })}
          </div>
        )}

        {/* Pagination Controls */}
        {!isLoadingPools && totalPages > 1 && (
          <div className="flex justify-center items-center mt-10">
            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => setCurrentPage(page)}
              scrollToTop={true} 
            />
          </div>
        )}
      </section>
    </div>
  );
};

export default Pools;
