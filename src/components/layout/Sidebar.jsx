import React, { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutGrid,
  Gamepad2,
  Clock,
  Gift,
  Settings,
  Headset,
  LogOut,
  ChevronRight,
  ChevronLeft,
  X,
  Database,
} from "lucide-react";

import { useAppKitAccount, useDisconnect } from "@reown/appkit/react";
import Logo from "../common/Logo";

const topMenuItems = [
  { icon: LayoutGrid, label: "Dashboard", path: "/dashboard" },
  { icon: Database, label: "Pools", path: "/pools" },
  { icon: Gamepad2, label: "Play Desk", path: "/playdesk" },
  { icon: Clock, label: "My Bets", path: "/mybets" },
  { icon: Gift, label: "Claim", path: "/claim" },
];

export default function Sidebar({ isOpen, toggleSidebar, isCollapsed = false, toggleCollapse }) {
  const location = useLocation();
  const currentPath = location.pathname;

  const { isConnected } = useAppKitAccount();
  const { disconnect } = useDisconnect();

  const handleCloseSidebar = () => {
    toggleSidebar(false);
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
      toggleSidebar(false);
    } catch (error) {
      console.error("Disconnect Error:", error);
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={handleCloseSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full flex flex-col
          bg-[var(--bg-panel)] border-r border-white/5
          transition-all duration-300 ease-in-out lg:translate-x-0
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          w-full sm:w-[320px] ${isCollapsed ? "lg:w-[100px]" : ""}
        `}
      >
        {/* Toggle Button */}
        <button
          onClick={toggleCollapse}
          className="hidden lg:flex absolute -right-3 top-[20px] cursor-pointer items-center justify-center w-7 h-7 bg-[#090A1B] border border-white/10 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors z-50 shadow-[0_0_10px_rgba(0,0,0,0.5)]"
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        {/* Header */}
        <div className={`flex items-center h-[72px] border-b border-white/5 ${isCollapsed ? 'justify-center px-4 lg:px-0' : 'justify-between px-6'}`}>
          <Logo isSidebar={true} isCollapsed={isCollapsed} />

          <button
            onClick={handleCloseSidebar}
            className="lg:hidden text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 px-4 py-6 overflow-y-auto flex flex-col">
          <nav className="space-y-1.5 flex-1">
            {topMenuItems.map((item, index) => {
              const isActive =
                currentPath === item.path ||
                (currentPath === "/" && item.path === "/dashboard");

              return (
                <Link
                  key={index}
                  to={item.path}
                  onClick={handleCloseSidebar}
                  title={isCollapsed ? item.label : undefined}
                  className={`
                    flex items-center py-4 rounded-full
                    transition-all duration-200 group
                    ${isCollapsed ? "lg:justify-center lg:px-0 lg:mx-2 justify-between px-5" : "justify-between px-5"}
                    ${isActive
                      ? "bg-[var(--bg-main)] text-white"
                      : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
                    }
                  `}
                >
                  <div className={`flex items-center ${isCollapsed ? "lg:space-x-0 space-x-3" : "space-x-3"}`}>
                    <item.icon
                      size={20}
                      className="text-[var(--text-gradient-2)] opacity-70 group-hover:opacity-100 shrink-0"
                    />

                    <span className={`font-medium text-[15px] ${isCollapsed ? "lg:hidden" : ""}`}>
                      {item.label}
                    </span>
                  </div>

                  {isActive && (
                    <ChevronRight size={18} className={`text-gray-400 ${isCollapsed ? "lg:hidden" : ""}`} />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* <div className="space-y-1.5 mt-8">
            <button
              onClick={handleCloseSidebar}
              title={isCollapsed ? "Setting" : undefined}
              className={`w-full flex items-center py-3 rounded-2xl text-gray-400 hover:text-gray-200 hover:bg-white/5 transition-all group ${isCollapsed ? "lg:justify-center lg:px-0 lg:mx-2 space-x-3 lg:space-x-0 px-4" : "space-x-3 px-4"}`}
            >
              <Settings
                size={20}
                className="text-blue-400 group-hover:text-blue-300 shrink-0"
              />
              <span className={`font-medium text-[15px] ${isCollapsed ? "lg:hidden" : ""}`}>Setting</span>
            </button>

            <button
              onClick={handleCloseSidebar}
              title={isCollapsed ? "Support" : undefined}
              className={`w-full flex items-center py-3 rounded-2xl text-gray-400 hover:text-gray-200 hover:bg-white/5 transition-all group ${isCollapsed ? "lg:justify-center lg:px-0 lg:mx-2 space-x-3 lg:space-x-0 px-4" : "space-x-3 px-4"}`}
            >
              <Headset
                size={20}
                className="text-blue-400 group-hover:text-blue-300 shrink-0"
              />
              <span className={`font-medium text-[15px] ${isCollapsed ? "lg:hidden" : ""}`}>Support</span>
            </button>
          </div> */}
        </div>

        {isConnected && (
          <div className="p-6 pt-0">
            <button
              onClick={handleDisconnect}
              title={isCollapsed ? "Disconnect" : undefined}
              className={`
                w-full flex items-center
                py-3.5
                bg-[#FF4A4A]
                hover:bg-[#ff3333]
                text-white
                rounded-full
                transition-all duration-300
                shadow-[0_0_15px_rgba(255,77,79,0.3)]
                hover:shadow-[0_0_25px_rgba(255,77,79,0.45)]
                group
                ${isCollapsed ? "lg:justify-center lg:px-0 lg:mx-2 justify-between px-6" : "justify-between px-6"}
              `}
            >
              <div className={`flex items-center ${isCollapsed ? "lg:space-x-0 space-x-3" : "space-x-3"}`}>
                <LogOut size={20} className="shrink-0" />
                <span className={`font-medium ${isCollapsed ? "lg:hidden" : ""}`}>Disconnect</span>
              </div>

              <ChevronRight
                size={18}
                className={`
                  text-white/80
                  group-hover:text-white
                  group-hover:translate-x-1
                  transition-transform
                  ${isCollapsed ? "lg:hidden" : ""}
                `}
              />
            </button>
          </div>
        )}
      </aside>
    </>
  );
}