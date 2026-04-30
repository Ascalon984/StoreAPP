'use client';

import styles from './LoadingScreen.module.css';

export default function LoadingScreen() {
  return (
    // Gunakan warna background yang konsisten dengan aplikasi agar transisinya halus
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center p-4">
      <div className={styles.preloader} id="preloader">
        <div className={styles['cart-wrapper']}>
          <svg
            className={styles.cart}
            role="img"
            aria-label="Shopping cart loading animation"
            viewBox="0 0 128 128"
            width="80px"  // Diperkecil agar lebih luks
            height="80px"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="8">
              {/* Jalur Keranjang (Track) - Abu-abu sangat tipis */}
              <g className={styles['cart__track']} stroke="rgba(0,0,0,0.05)">
                <polyline points="4,4 21,4 26,22 124,22 112,64 35,64 39,80 106,80" />
                <circle cx="43" cy="111" r="13" />
                <circle cx="102" cy="111" r="13" />
              </g>

              {/* Badan Keranjang - EMERALD GREEN (Identitas Brand) */}
              <g className={styles['cart__lines']} stroke="#10b981">
                <polyline
                  className={styles['cart__top']}
                  points="4,4 21,4 26,22 124,22 112,64 35,64 39,80 106,80"
                  strokeDasharray="338 338"
                  strokeDashoffset="-338"
                />
              </g>

              {/* Roda - ORANGE/AMBER (Aksen Hidup) */}
              <g className={styles['cart__wheel1']} stroke="#f59e0b">
                <circle
                  className={styles['cart__wheel-stroke']}
                  cx="43"
                  cy="111"
                  r="13"
                  strokeDasharray="81.68 81.68"
                  strokeDashoffset="81.68"
                />
              </g>
              <g className={styles['cart__wheel2']} stroke="#f59e0b">
                <circle
                  className={styles['cart__wheel-stroke']}
                  cx="102"
                  cy="111"
                  r="13"
                  strokeDasharray="81.68 81.68"
                  strokeDashoffset="81.68"
                />
              </g>
            </g>
          </svg>
        </div>

        {/* Teks Loading yang Umum tapi Premium */}
        <div className="mt-8 flex flex-col items-center gap-2">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em]">
            Sedang Memuat
          </p>
          <div className="mt-2 flex items-center gap-1">
            <span className="w-1 h-1 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
            <span className="w-1 h-1 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
            <span className="w-1 h-1 bg-emerald-500 rounded-full animate-bounce"></span>
          </div>
        </div>
      </div>
    </div>
  );
}