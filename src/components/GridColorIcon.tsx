import React from 'react';

export function GridColorIcon({ size = 24 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* kiri atas: hijau muda */}
      // KODE OPSI 1 (Gradasi Berputar Sesuai Keinginan Anda)
<rect x="2" y="2" width="9" height="9" rx="2.5" fill="#86efac" stroke="white" strokeWidth="0.8"/> {/* Kiri Atas */}
<rect x="13" y="2" width="9" height="9" rx="2.5" fill="#f59e0b" stroke="white" strokeWidth="0.8"/> {/* Kanan Atas */}
<rect x="2" y="13" width="9" height="9" rx="2.5" fill="#168a69" stroke="white" strokeWidth="0.8"/> {/* Kiri Bawah */}
<rect x="13" y="13" width="9" height="9" rx="2.5" fill="#34d399" stroke="white" strokeWidth="0.6"/> {/* Kanan Bawah */}

    </svg>
  );
}
