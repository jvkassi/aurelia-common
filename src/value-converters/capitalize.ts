export class CapitalizeValueConverter {

  // to View
  toView(value: string) {

    if (value === null || !value) {
      return value;
    }
    return value[0].toLocaleUpperCase() + value.slice(1).toLocaleLowerCase();
  }

}
