export class filterValueConverter {

  // to View
  toView(array: any[], search: string, key: string, strict = true) {

    // if undefined
    if (typeof array === 'undefined') {
      return [];
    }

    if (!search) {
      return array;
    }
    // add backslash
    search = search.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');

    // build regex
    const regexp = new RegExp(search,  strict ? 'i' : '');


    return typeof key === "undefined"
      ? array.filter(x => x.match(regexp))
      : array.filter(x => x[key].match(regexp));
  }
}
