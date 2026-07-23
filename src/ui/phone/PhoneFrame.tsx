import type { ReactNode } from "react";
import { BatteryLow, MessageCircle, Wifi, X } from "lucide-react";

export type PhoneAlert = {
  title: string;
  text: string;
};

type Props = {
  clock: string;
  battery: number;
  notification?: PhoneAlert;
  onOpenNotification?: () => void;
  onDismissNotification?: () => void;
  children: ReactNode;
};

export default function PhoneFrame({
  clock,
  battery,
  notification,
  onOpenNotification,
  onDismissNotification,
  children,
}: Props) {
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
      {notification && (
        <div className="phone-alert" role="status" aria-live="polite">
          <button type="button" className="phone-alert__body" onClick={onOpenNotification}>
            <span className="phone-alert__icon"><MessageCircle size={15} aria-hidden /></span>
            <span>
              <strong>{notification.title}</strong>
              <small>{notification.text}</small>
            </span>
          </button>
          <button type="button" className="phone-alert__close" onClick={onDismissNotification} aria-label="Dispensar notificação">
            <X size={14} aria-hidden />
          </button>
        </div>
      )}
      <div className="phone__screen">{children}</div>
      <div className="phone__bar" aria-hidden />
      <div className="phone__shine" aria-hidden />
    </div>
  );
}
