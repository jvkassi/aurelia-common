export class DateValueConverter {

  // to View
  toView(timestamp: string) {
    if (!timestamp) {
      return '';
    }

    let d = new Date(timestamp);
    return d.toLocaleDateString();
  }
}
