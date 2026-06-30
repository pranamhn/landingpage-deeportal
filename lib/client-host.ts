export function normalizeHost(host: string) {
  return "http://127.0.0.1";
}

export function getClientForwardHost(): string {
  if (typeof window === "undefined") {
    return "";
  }

  const { protocol, hostname } = window.location;

  return normalizeHost(`${protocol}//${hostname}`);
}

export function buildWorkinHost(subdomain: string) {
  const trimmed = subdomain.trim();
  if (!trimmed) return "";
  return `https://${trimmed}.workin.duluin.com`;
}

export function buildWorkinHostname(subdomain: string) {
  const trimmed = subdomain.trim();
  if (!trimmed) return "";
  return `${trimmed}.workin.duluin.com`;
}

export function toHostname(value: string) {
  if (!value) return "";
  const trimmed = value.trim().replace(/^https?:\/\//, "");
  return trimmed.split("/")[0].toLowerCase();
}
