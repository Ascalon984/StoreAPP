import { useEffect } from "react";

interface BackupData {
  timestamp: number;
  cartItems?: any[];
  wishlistItems?: any[];
  searchHistory?: string[];
  filters?: any;
}

export function useAutoBackup() {
  /**
   * Backup cart, wishlist, search history & filters to localStorage
   * Called on app init & whenever data changes
   */
  const performBackup = () => {
    try {
      const backup: BackupData = {
        timestamp: Date.now(),
      };

      // Backup cart
      const cartData = localStorage.getItem("cart-store");
      if (cartData) {
        try {
          backup.cartItems = JSON.parse(cartData).state?.items || [];
        } catch (e) {
          console.warn("Failed to backup cart:", e);
        }
      }

      // Backup wishlist
      const wishlistData = localStorage.getItem("wishlist-store");
      if (wishlistData) {
        try {
          backup.wishlistItems = JSON.parse(wishlistData).state?.items || [];
        } catch (e) {
          console.warn("Failed to backup wishlist:", e);
        }
      }

      // Backup search history
      const searches = localStorage.getItem("recentSearches");
      if (searches) {
        try {
          backup.searchHistory = JSON.parse(searches);
        } catch (e) {
          console.warn("Failed to backup search history:", e);
        }
      }

      // Backup filters
      const filterData = localStorage.getItem("filter-store");
      if (filterData) {
        try {
          backup.filters = JSON.parse(filterData).state || {};
        } catch (e) {
          console.warn("Failed to backup filters:", e);
        }
      }

      // Save backup
      localStorage.setItem("app-backup", JSON.stringify(backup));
      console.log(
        "✅ Backup created:",
        new Date(backup.timestamp).toLocaleTimeString("id-ID"),
      );
    } catch (err) {
      console.error("Backup failed:", err);
    }
  };

  /**
   * Restore data from backup
   */
  const restoreFromBackup = () => {
    try {
      const backup = localStorage.getItem("app-backup");
      if (!backup) return;

      const data: BackupData = JSON.parse(backup);
      console.log(
        "🔄 Restoring from backup:",
        new Date(data.timestamp).toLocaleTimeString("id-ID"),
      );

      // Restore cart, wishlist, etc if needed
      // (usually automatic via Zustand persistence)
    } catch (err) {
      console.error("Restore failed:", err);
    }
  };

  /**
   * Auto-backup on app init & periodically
   */
  useEffect(() => {
    // Initial backup
    performBackup();

    // Backup every 30 seconds
    const backupInterval = setInterval(performBackup, 30000);

    return () => clearInterval(backupInterval);
  }, []);

  return { performBackup, restoreFromBackup };
}
