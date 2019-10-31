export class UppercaseValueConverter {

  // to View
  toView(value: string) {

    if (value === null || !value) {
      return null;
    }
    return value.toUpperCase();
  }

}
