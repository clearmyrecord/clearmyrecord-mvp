export function isValidDateString(value) {
  if (!value || typeof value !== "string") return false;
  const date = new Date(value);
  return !Number.isNaN(date.getTime());
}

export function addYears(dateString, years) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";
  date.setFullYear(date.getFullYear() + years);
  return date.toISOString().slice(0, 10);
}

export function isPastOrToday(dateString) {
  if (!isValidDateString(dateString)) return false;
  const input = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  input.setHours(0, 0, 0, 0);
  return input <= today;
}

export function getLatestCompletionDate(charges = []) {
  const dates = [];

  for (const charge of charges) {
    const candidates = [
      charge.probationCompletedDate,
      charge.jailCompletedDate,
      charge.sentencingDate,
      charge.convictionDate
    ].filter(isValidDateString);

    if (candidates.length) {
      candidates.sort();
      dates.push(candidates[candidates.length - 1]);
    }
  }

  if (!dates.length) return "";
  dates.sort();
  return dates[dates.length - 1];
}
