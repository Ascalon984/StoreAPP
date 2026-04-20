'use client';

import styles from './LoadingScreen.module.css';

export default function LoadingScreen() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className={styles.preloader} id="preloader">
        <div className={styles['cart-wrapper']}>
          <svg
            className={styles.cart}
            role="img"
            aria-label="Shopping cart loading animation"
            viewBox="0 0 128 128"
            width="128px"
            height="128px"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="8">
              {/* Track layer - subtle */}
              <g className={styles['cart__track']}>
                <polyline points="4,4 21,4 26,22 124,22 112,64 35,64 39,80 106,80" />
                <circle cx="43" cy="111" r="13" />
                <circle cx="102" cy="111" r="13" />
              </g>
              {/* Cart lines - EMERALD GREEN */}
              <g className={styles['cart__lines']}>
                <polyline
                  className={styles['cart__top']}
                  points="4,4 21,4 26,22 124,22 112,64 35,64 39,80 106,80"
                  strokeDasharray="338 338"
                  strokeDashoffset="-338"
                />
              </g>
              {/* Wheel kiri - ORANGE */}
              <g className={styles['cart__wheel1']}>
                <circle
                  className={styles['cart__wheel-stroke']}
                  cx="43"
                  cy="111"
                  r="13"
                  strokeDasharray="81.68 81.68"
                  strokeDashoffset="81.68"
                />
              </g>
              {/* Wheel kanan - ORANGE dengan delay */}
              <g className={styles['cart__wheel2']}>
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
        <div className={styles['preloader__text']}>
          <p className={styles['preloader__msg']}>
            Sedang Memuat
            <span className={styles['loading-dots']}></span>
          </p>
        </div>
      </div>
    </div>
  );
}
