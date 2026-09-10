import React from 'react';
import { Copy } from 'lucide-react';
import toast from 'react-hot-toast';

const CopyButton = ({ textToCopy, className = '', iconSize = 20 }) => {
  const handleCopy = async (e) => {
    e.preventDefault();
    if (!textToCopy) return;

    try {
      // Modern approach
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(textToCopy);
        toast.success("Copied to clipboard!");
      } else {
        // Fallback approach
        const textArea = document.createElement("textarea");
        textArea.value = textToCopy;
        textArea.style.position = "absolute";
        textArea.style.left = "-999999px";

        document.body.appendChild(textArea);
        textArea.select();

        try {
          document.execCommand('copy');
          toast.success("Copied to clipboard!");
        } catch (error) {
          console.error("Fallback copy failed", error);
          toast.error("Failed to copy!");
        } finally {
          textArea.remove();
        }
      }
    } catch (err) {
      toast.error("Failed to copy!");
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`text-white/80 hover:text-white transition-all duration-200 cursor-pointer active:scale-90 ${className}`}
      title="Copy to clipboard"
      aria-label="Copy to clipboard"
    >
      <Copy
        size={iconSize}
        className="w-4 h-4 md:w-5 md:h-5"
      />
    </button>
  );
};

export default CopyButton;
