/**
 * Small RNG helpers used by the match engine. Defaults to Math.random but
 * accepts an injectable source so simulations can be made deterministic in
 * tests if needed.
 */
export type RandomSource = () => number;

export const defaultRandom: RandomSource = Math.random;

/** Samples a non-negative integer goal count from a Poisson distribution. */
export function samplePoisson(lambda: number, rng: RandomSource = defaultRandom): number {
  const safeLambda = Math.max(0.05, lambda);
  const limit = Math.exp(-safeLambda);
  let k = 0;
  let product = 1;
  do {
    k += 1;
    product *= rng();
  } while (product > limit);
  return k - 1;
}
