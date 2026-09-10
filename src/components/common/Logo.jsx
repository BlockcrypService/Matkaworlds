import React from "react";
import fullLogo from "../../assets/images/full-logo.png";
import halfLogo from "../../assets/images/half-logo.png";

export default function Logo({
  className = "",
  isSidebar = false,
  isCollapsed = false,
}) {
  return (
    <div className={`flex items-center ${className}`}>
      {isSidebar ? (
        <>
          <img
            src={fullLogo}
            alt="MatkaWorld Full Logo"
            className={`h-[52px] w-auto object-cover ${isCollapsed ? 'lg:hidden' : ''}`}
          />
          {isCollapsed && (
            <img
              src={halfLogo}
              alt="MatkaWorld Half Logo"
              className="hidden lg:block h-[40px] w-auto object-contain mx-auto"
            />
          )}
        </>
      ) : (
        <>
          <img
            src={fullLogo}
            alt="MatkaWorld Full Logo"
            className="hidden sm:block h-[52px] w-auto object-cover"
          />

          {/* Mobile Half Logo */}
          <img
            src={halfLogo}
            alt="MatkaWorld Half Logo"
            className="block sm:hidden h-[40px] w-auto object-contain"
          />
        </>
      )}
    </div>
  );
}