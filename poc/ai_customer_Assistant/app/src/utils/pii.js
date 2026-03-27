function maskPhoneNumber(phoneNumber) {
  if (!phoneNumber) return phoneNumber;
  const trimmed = phoneNumber.toString();
  if (trimmed.length <= 4) return "****";
  const lastFour = trimmed.slice(-4);
  return `****${lastFour}`;
}

function maybeMask(value, enabled) {
  if (!enabled) return value;
  return maskPhoneNumber(value);
}

module.exports = { maskPhoneNumber, maybeMask };
