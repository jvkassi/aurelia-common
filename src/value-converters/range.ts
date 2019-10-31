export class RangeValueConverter {

  // to View
  toView(num: number) {
    return Array.apply(0, Array(num)).map((x, y) => y);
  }

}
