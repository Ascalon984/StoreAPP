import {
  Smartphone, Wifi, Zap, Gamepad2,
  Wallet, Ticket, Share2, Wrench,
} from 'lucide-react';

const categoryIcons: Record<string, React.ElementType> = {
  pulsa: Smartphone, data: Wifi, pln: Zap, game: Gamepad2,
  ewallet: Wallet, voucher: Ticket, sosmed: Share2, tools: Wrench,
};

const gradientColors: Record<string, [string, string]> = {
  pulsa: ['#2dd4bf', '#06b6d4'],
  data: ['#60a5fa', '#6366f1'],
  pln: ['#fbbf24', '#f59e0b'],
  game: ['#c084fc', '#ec4899'],
  ewallet: ['#34d399', '#22c55e'],
  voucher: ['#fb923c', '#f87171'],
  sosmed: ['#fb7185', '#ec4899'],
  tools: ['#94a3b8', '#818cf8'],
};

const directions = ['to bottom right', 'to top right', 'to right'];

interface ProductImageProps {
  category: string;
  name: string;
  variant?: number;
  className?: string;
}

export default function ProductImage({ category, name, variant = 0, className = '' }: ProductImageProps) {
  const [from, to] = gradientColors[category] || ['#2dd4bf', '#06b6d4'];
  const dir = directions[variant % directions.length];
  const Icon = categoryIcons[category] || Smartphone;

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
