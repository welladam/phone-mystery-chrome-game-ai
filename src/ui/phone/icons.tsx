import {
  Activity,
  Bell,
  CalendarDays,
  Car,
  CloudUpload,
  Globe,
  Hash,
  Image,
  KeyRound,
  Landmark,
  ListChecks,
  Mail,
  MapPin,
  MessageCircle,
  Mic,
  NotebookPen,
  Phone,
  Settings,
  StickyNote,
  Trash2,
  Users,
  type LucideIcon,
} from "lucide-react";

const MAP: Record<string, LucideIcon> = {
  Activity,
  Bell,
  CalendarDays,
  Car,
  CloudUpload,
  Globe,
  Hash,
  Image,
  KeyRound,
  Landmark,
  ListChecks,
  Mail,
  MapPin,
  MessageCircle,
  Mic,
  NotebookPen,
  Phone,
  Settings,
  StickyNote,
  Trash2,
  Users,
};

export function AppIcon({ name, size = 22 }: { name: string; size?: number }) {
  const Component = MAP[name] ?? Bell;
  return <Component size={size} aria-hidden />;
}
