export function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

export function formatCurrencyInput(value: string) {
  const digits = digitsOnly(value).replace(/^0+(?=\d)/, "");
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export function parseCurrencyInput(value: string) {
  const digits = digitsOnly(value);
  if (!digits) return null;

  return Number(digits);
}

export function formatCurrencyVnd(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === "") {
    return "Chưa cập nhật";
  }

  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) {
    return "Chưa cập nhật";
  }

  return `${formatCurrencyInput(String(Math.round(amount)))} VNĐ`;
}

export function normalizePositiveIntegerInput(value: string) {
  return digitsOnly(value).replace(/^0+(?=\d)/, "");
}

export function parsePositiveIntegerInput(value: string) {
  const normalized = normalizePositiveIntegerInput(value);
  if (!normalized) return null;

  return Number(normalized);
}

export function getLocalDateInputValue(offsetDays = 0) {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + offsetDays);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function getTomorrowDateInputValue() {
  return getLocalDateInputValue(1);
}

export function formatDisplayDate(value: string) {
  if (!value) return "";

  const [year, month, day] = value.split("-");
  if (!year || !month || !day) return value;

  return `${day}/${month}/${year}`;
}
