import type { ReactNode } from "react";
import { BatteryLow, Wifi } from "lucide-react";

type Props = {
  clock: string;
  battery: number;
  children: ReactNode;
};

export default function PhoneFrame({ clock, battery, children }: Props) {
  return (
    <div className="phone">
      <span className="phone__side phone__side--volume" aria-hidden />
      <span className="phone__side phone__side--power" aria-hidden />
      <div className="phone__notch" aria-hidden>
        <span className="phone__speaker" />
        <span className="phone__camera" />
      </div>
      <div className="phone__status">
        <span>{clock}</span>
        <span className="phone__status-icons">
          <Wifi size={14} aria-hidden />
          <BatteryLow size={16} aria-hidden />
          <span aria-label={`Bateria em ${battery} por cento`}>{battery}%</span>
        </span>
      </div>
      <div className="phone__screen">{children}</div>
      <div className="phone__bar" aria-hidden />
      <div className="phone__shine" aria-hidden />
    </div>
  );
}
