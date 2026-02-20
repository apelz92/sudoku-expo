/**
 * @fileoverview Random utility functions for Sudoku generation.
 * Provides shuffling algorithms used in board permutation and puzzle creation.
 */

/**
 * Generic Fisher-Yates shuffle implementing the modern variant for unbiased permutation.
 *
 * Modifies the array in-place. Uses provided RNG or Math.random for reproducibility in testing.
 *
 * Time: O(n), Space: O(1)
 *
 * @template T
 * @param {T[]} arr - Array to shuffle in-place.
 * @param {() => number} [rng=Math.random] - RNG function returning [0,1) uniform random.
 * @returns {void}
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