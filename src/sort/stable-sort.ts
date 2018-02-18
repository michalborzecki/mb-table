/**
 * Stable sort implementation.
 * @param {any[]} toSort Array to sort.
 * @param {(a: any, b: any) => number} comparator Compare function.
 */
export function stableSort(toSort: any[], comparator: (a: any, b: any) => number) {
  return toSort
    .map((item, index) => ({item, index}))
    .sort((wrapperA, wrapperB) =>
      comparator(wrapperA.item, wrapperB.item) || wrapperA.index - wrapperB.index
    )
    .map(wrapper => wrapper.item);
}
