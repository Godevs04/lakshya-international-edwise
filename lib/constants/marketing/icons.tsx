import type { LucideIcon } from "lucide-react";
import {
  Award,
  Building2,
  Calendar,
  FileText,
  Globe,
  GraduationCap,
  Home,
  Landmark,
  MessageCircle,
  Plane,
  Route,
  ShieldCheck,
  Sparkles,
  Stamp,
  TrendingUp,
  Users,
  Wallet,
  BookOpen,
  HeartHandshake,
  MapPin,
  Briefcase,
} from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  Award,
  Building2,
  Calendar,
  FileText,
  Globe,
  GraduationCap,
  Home,
  Landmark,
  MessageCircle,
  Plane,
  Route,
  ShieldCheck,
  Sparkles,
  Stamp,
  TrendingUp,
  Users,
  Wallet,
  BookOpen,
  HeartHandshake,
  MapPin,
  Briefcase,
};

export function getMarketingIcon(name: string): LucideIcon {
  return ICON_MAP[name] ?? GraduationCap;
}

interface MarketingIconProps {
  name: string;
  className?: string;
}

export function MarketingIcon({ name, className }: MarketingIconProps) {
  const Icon = ICON_MAP[name] ?? GraduationCap;
  return <Icon className={className} />;
}
