type AlertType = "danger" | "warning" | "info" | "success";

interface Alert {
  type: AlertType;
  title: string;
  message: string;
}

class AlertManager {
  private alerts: Alert[] = [];
  private listeners: Set<() => void> = new Set();

  addAlert(type: AlertType, title: string, message: string) {
    this.alerts = [...this.alerts, { type, title, message }];
    this.listeners.forEach((fn) => fn());
  }

  getAlerts(): Alert[] {
    return this.alerts;
  }

  removeAlert(index: number) {
    this.alerts = this.alerts.filter((_, i) => i !== index);
    this.listeners.forEach((fn) => fn());
  }

  subscribe(fn: () => void) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }
}

export const alertManager = new AlertManager();
