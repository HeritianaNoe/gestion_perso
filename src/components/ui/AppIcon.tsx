import {
  Activity, AlertTriangle, AlignLeft, Banknote, Briefcase, Building2, Cake, CalendarCheck, CalendarDays,
  CalendarPlus, CalendarRange, FileText, Gift, Hash, IdCard, Image as ImageIcon, LayoutDashboard, Layers, Mail,
  MapPin, Megaphone, MessageSquare, MinusCircle, Palmtree, Phone, User, Users, VenusAndMars, Wallet,
  type LucideIcon,
} from "lucide-react";
import type { IconName } from "@/components/crud/types";

export const ICONS: Record<IconName, LucideIcon> = {
  calendar: CalendarDays,
  building: Building2,
  briefcase: Briefcase,
  users: Users,
  file: FileText,
  palm: Palmtree,
  wallet: Wallet,
  user: User,
  idcard: IdCard,
  mail: Mail,
  phone: Phone,
  cake: Cake,
  gender: VenusAndMars,
  pin: MapPin,
  calendarPlus: CalendarPlus,
  calendarCheck: CalendarCheck,
  calendarRange: CalendarRange,
  activity: Activity,
  text: AlignLeft,
  banknote: Banknote,
  gift: Gift,
  minus: MinusCircle,
  message: MessageSquare,
  image: ImageIcon,
  hash: Hash,
  layers: Layers,
  megaphone: Megaphone,
  alert: AlertTriangle,
  layoutDashboard: LayoutDashboard,
};

export function AppIcon({ name, size = 16, className }: { name?: IconName; size?: number; className?: string }) {
  if (!name) return null;
  const Icon = ICONS[name];
  return <Icon size={size} className={className} aria-hidden="true" />;
}
