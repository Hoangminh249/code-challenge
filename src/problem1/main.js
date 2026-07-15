/**
 * Solution 1
The simplest method: iterate through every integer from 1 to n and accumulate
the result in a single variable.

Strengths:
- Easy to read, understand, test, and maintain.
- Uses O(1) in space complixity.

Weaknesses:
- Requires O(n) time because it performs one addition per integer.
 */

var sum_to_n_a = function (n) {
  let sum = 0;

  for (let i = 1; i <= n; i++) {
    sum += i;
  }

  return sum;
};

/**
 * Solution 2
Applied well known mathematical solution: `n * (n + 1) / 2`.

Strengths:
- The most efficient solution, with O(1) time and O(1) auxiliary space.

Weaknesses:
- Less intuitive than the iterative solution and requires knowledge of the formula.
 */

var sum_to_n_b = function (n) {
  if (n <= 0) {
    return 0;
  }

  return (n * (n + 1)) / 2;
};

/**
 * Solution 3
A complicate one with recursion, this solution is not good in both time and
space, since both are O(n)
 */

var sum_to_n_c = function (n) {
  if (n <= 0) {
    return 0;
  }

  return n + sum_to_n_c(n - 1);
};
