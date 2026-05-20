import { useEffect, useState } from "react";

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [wasOnline, setWasOnline] = useState(true);

  useEffect(() => {
    // Set initial state
    setIsOnline(navigator.onLine);
    setWasOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      setWasOnline(true);
      // Optionally show toast "Internet restored"
      console.log("✅ Internet connection restored");
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOnline(false);
      console.log("❌ Internet connection lost");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return { isOnline, wasOnline };
}
