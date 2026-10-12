export interface InputOptions {
  /** Most digits allowed after the decimal separator, e.g. 2 for cents. Defaults to MAX_SCALE. */
  maxFractionDigits?: number;
  /** Defaults to true. */
  allowNegative?: boolean;
}
