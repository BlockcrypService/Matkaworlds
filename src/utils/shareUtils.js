import { showToast } from "./toastUtils";

export const shareContent = async (URL) => {
  const defaultShareData = {
    title: 'The Matka Worlds',
    text: 'Play on The Matka Worlds! Join the transparent decentralized gaming platform with my referral link!',
    url: URL,
  };

  if (navigator.share) {
    try {
      await navigator.share(defaultShareData);
      return true;
    } catch (err) {
      if (err.name !== "AbortError") {
        console.error("Error sharing:", err);
      }
      return false;
    }
  } else {
    try {
      if (defaultShareData.url) {
        await navigator.clipboard.writeText(defaultShareData.url);
        showToast("Link copied to clipboard!", "success");
        return true;
      }
    } catch (err) {
      console.error("Error copying to clipboard:", err);
      showToast("Failed to copy link", "error");
      return false;
    }
  }
};
