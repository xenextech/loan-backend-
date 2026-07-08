// Converts a nominal annual rate that compounds `compoundingPeriodsPerYear`
// times into the equivalent nominal annual rate that, compounded
// `paymentPeriodsPerYear` times instead, yields the same effective annual
// rate. Lets EmiCalculatorService (which always assumes compounding period
// == payment period) stay untouched — callers just feed it this converted
// rate instead of the raw contract rate when the two frequencies differ.
export function toEquivalentNominalRate(
  nominalAnnualRatePercent: number,
  compoundingPeriodsPerYear: number,
  paymentPeriodsPerYear: number,
): number {
  if (compoundingPeriodsPerYear === paymentPeriodsPerYear) {
    return nominalAnnualRatePercent;
  }

  const nominal = nominalAnnualRatePercent / 100;
  const effectiveAnnualRate =
    Math.pow(
      1 + nominal / compoundingPeriodsPerYear,
      compoundingPeriodsPerYear,
    ) - 1;
  const paymentPeriodRate =
    Math.pow(1 + effectiveAnnualRate, 1 / paymentPeriodsPerYear) - 1;

  return paymentPeriodRate * paymentPeriodsPerYear * 100;
}
