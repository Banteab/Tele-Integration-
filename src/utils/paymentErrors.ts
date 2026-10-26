/** Matches the Telebirr "insufficient balance" error regardless of exact wording. */
export function isInsufficientBalanceError(message: string): boolean {
  return (
    /insufficient[\s_-]*(service)?[\s_-]*(balance|fund)/i.test(message) ||
    /balance[\s_-]*(is)?[\s_-]*insufficient/i.test(message)
  );
}
