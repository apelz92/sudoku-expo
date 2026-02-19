/**
 * Generic Fisher-Yates shuffle function.
 *
 * Shuffles array in-place using provided RNG for uniform permutation.
 * Time O(n), space O(1).
 *
 * @param arr - Array to shuffle in-place.
 * @param rng - Random number generator, defaults to Math.random.
 * @returns `void` - Modifies arr in-place.
 *
 * @example
 * const arr = [1,2,3,4,5];
 * shuffle(arr);
 * console.log(arr); // e.g. [3,1,5,2,4]
 */
export function shuffle<T>(arr: T[], rng: () => number = Math.random): void {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
}