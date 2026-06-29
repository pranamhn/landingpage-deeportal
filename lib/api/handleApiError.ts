import { alertManager } from "./alertManager";

export function handleApiError(error: any, successStatus: number = 200, customMessage?: string): { success: false; message: string; error: any } {
  if (error.response?.status === 401) {
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    return { success: false, message: "Sesi Anda telah berakhir. Silakan login kembali.", error };
  }

  let errorMessage =
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    customMessage ||
    "Terjadi kesalahan pada server";

  if (typeof errorMessage === "object" && errorMessage !== null) {
    if ("message" in errorMessage) {
      errorMessage = String(errorMessage.message);
    } else {
      errorMessage = JSON.stringify(errorMessage);
    }
  } else {
    errorMessage = String(errorMessage);
  }

  if (error?.response?.status !== successStatus && error?.status !== successStatus) {
    let alertType: "danger" | "warning" | "info" = "danger";
    if (error?.response?.status >= 400 && error?.response?.status < 500) {
      alertType = "danger";
    } else if (error?.response?.status >= 500) {
      alertType = "danger";
    } else {
      alertType = "warning";
    }
    alertManager.addAlert(alertType, "Error", errorMessage);
  }

  return { success: false, message: errorMessage, error };
}
