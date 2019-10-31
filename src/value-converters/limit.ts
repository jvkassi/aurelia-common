export class limitValueConverter {

  // to View
  toView(array: any, start: number, end: number) {

    if (typeof end === 'undefined') {
      end = start;
      start = 0;
    }

    if (array === null || !array) {
      return array;
    }

    return array.slice(start, end);
  }

}
