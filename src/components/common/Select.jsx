import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

const Select = ({
  options = [],
  value,
  onChange,
  placeholder = "Select option",
  icon: Icon,
  className = "",
  disabled = false,
  dropdownPosition = "bottom",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);

  const selectedOption = options.find(
    (option) => option.value === value
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelect = (option) => {
    onChange?.({
      target: {
        value: option.value,
        name: option.name || "",
      },
    });

    setIsOpen(false);
  };

  return (
    <div
      ref={selectRef}
      className={`relative w-full ${className}`}
    >
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full flex items-center
          bg-transparent
          border border-[var(--border-secondary)]
          ${isOpen ? "border-white/30" : "hover:border-white/20"}
          text-sm
          rounded-full
          py-3
          ${Icon ? "pl-11" : "pl-5"}
          pr-12
          transition-all
          duration-200
          cursor-pointer
          focus:outline-none
          ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        `}
      >
        {Icon && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <Icon size={18} className="opacity-70" />
          </span>
        )}

        <span
          className={`truncate ${selectedOption
            ? "text-white"
            : "text-gray-400"
            }`}
        >
          {selectedOption
            ? selectedOption.label
            : placeholder}
        </span>

        <span className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
          <ChevronDown
            size={18}
            className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""
              }`}
          />
        </span>
      </button>

      {/* Dropdown */}
      <div
        className={`
          absolute z-50
          left-0 right-0
          ${dropdownPosition === "top" ? "bottom-full mb-2 origin-bottom" : "top-full mt-2 origin-top"}
          overflow-hidden
          rounded-2xl
          border border-[var(--border-secondary)]
          bg-[var(--bg-panel)]
          shadow-2xl
          transition-all duration-200
          ${isOpen
            ? "opacity-100 scale-100 translate-y-0 visible"
            : `opacity-0 scale-95 invisible ${dropdownPosition === "top" ? "translate-y-2" : "-translate-y-2"} !h-0`
          }
        `}
      >
        <div className="max-h-[200px] overflow-y-auto py-2 custom-scrollbar">
          {options.length > 0 ? (
            options.map((option, index) => {
              const isSelected = option.value === value;

              return (
                <button
                  type="button"
                  key={option.value || index}
                  onClick={() => handleSelect(option)}
                  className={`
                    w-full
                    flex items-center justify-between
                    px-5 py-3
                    text-left text-sm
                    transition-all duration-200
                    ${isSelected
                      ? "bg-white/10 text-white"
                      : "text-gray-400 hover:bg-white/5 hover:text-white"
                    }
                  `}
                >
                  <span>{option.label}</span>

                  {isSelected && (
                    <Check
                      size={16}
                      className="text-[var(--color-primary)]"
                    />
                  )}
                </button>
              );
            })
          ) : (
            <div className="px-5 py-3 text-sm text-gray-500">
              No options available
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Select;