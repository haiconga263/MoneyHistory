import {
  BriefcaseBusiness,
  Car,
  CircleEllipsis,
  Gamepad2,
  Gift,
  type LucideIcon,
  ReceiptText,
  ShoppingBag,
  Utensils,
} from 'lucide-react';

const icons: Record<string, LucideIcon> = {
  briefcase: BriefcaseBusiness,
  gift: Gift,
  restaurant: Utensils,
  car: Car,
  'bag-handle': ShoppingBag,
  receipt: ReceiptText,
  'game-controller': Gamepad2,
  'ellipsis-horizontal': CircleEllipsis,
};

type Props = {
  name: string;
  size?: number;
};

export function CategoryIcon({ name, size = 18 }: Props) {
  const Icon = icons[name] ?? CircleEllipsis;
  return <Icon aria-hidden="true" size={size} strokeWidth={1.8} />;
}
