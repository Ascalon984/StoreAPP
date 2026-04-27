import {
  Cookie, Coffee, ShoppingBasket, Pencil, Sparkles, LayoutGrid,
} from 'lucide-react';

const categoryIcons: Record<string, React.ElementType> = {
  all: LayoutGrid,
  snack: Cookie,
  minuman: Coffee,
  kebutuhan: ShoppingBasket,
  atk: Pencil,
  kebersihan: Sparkles,
};

const gradientColors: Record<string, [string, string]> = {
  all: ['#9ca3af', '#6b7280'],
  snack: ['#fbbf24', '#f59e0b'],      // Warna kuning/orange untuk snack
  minuman: ['#60a5fa', '#3b82f6'],     // Warna biru untuk minuman
  kebutuhan: ['#34d399', '#10b981'],   // Warna hijau untuk kebutuhan pokok
  atk: ['#f472b6', '#ec4899'],         // Warna pink untuk alat tulis
  kebersihan: ['#a78bfa', '#8b5cf6'],  // Warna ungu untuk kebersihan
};

const directions = ['to bottom right', 'to top right', 'to right'];

interface ProductImageProps {
  category: string;
  name: string;
  variant?: number;
  className?: string;
  src?: string;
}

export default function ProductImage({ category, name, src, variant = 0, className = '' }: ProductImageProps) {
  if (src && src.trim().length > 0) {
    // Menggunakan object-contain agar gambar tidak ter-crop
    return <img src={src} alt={name} className={`object-contain ${className}`} style={{ width: '100%', height: '100%' }} />;
  }

  const [from, to] = gradientColors[category] || gradientColors.all;
  const dir = directions[variant % directions.length];
  const Icon = categoryIcons[category] || LayoutGrid;

  return (
    <div
      className={`flex items-center justify-center relative overflow-hidden ${className}`}
      style={{ background: `linear-gradient(${dir}, ${from}, ${to})` }}
    >
      <div className="absolute inset-0 opacity-10">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, white 1px, transparent 1px), radial-gradient(circle at 75% 75%, white 1px, transparent 1px)`,
            backgroundSize: '30px 30px',
          }}
        />
      </div>
      <Icon size={48} strokeWidth={1} className="text-white/40" />
    </div>
  );
}