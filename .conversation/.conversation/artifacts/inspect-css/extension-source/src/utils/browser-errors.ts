interface BrowserErrorLike {
  name?: unknown;
  message?: unknown;
}

export function isExpectedStyleAccessError(error: unknown) {
  if (!error || typeof error !== 'object') return false;

  const errorLike = error as BrowserErrorLike;
  const name = typeof errorLike.name === 'string' ? errorLike.name : '';
  const message =
    typeof errorLike.message === 'string' ? errorLike.message : '';

  if (name === 'SecurityError' || name === 'InvalidAccessError') return true;

  return /cssrules|cross[- ]origin|stylesheet.*(access|origin)/i.test(
    `${name} ${message}`,
  );
}

export function reportUnexpectedStyleError(context: string, error: unknown) {
  if (isExpectedStyleAccessError(error)) return;

  console.warn(`[Security Inspection] ${context}`, error);
}