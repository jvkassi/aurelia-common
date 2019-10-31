export class BytesValueConverter {
  toView(bytes: any, size = null, precision = 2, visible = true) {
    if (!bytes) {
      return '0 b';
    }
    if (isNaN(parseFloat(bytes)) || !isFinite(bytes)) {

      return bytes;
    }

    let units = [
      'b',
      'ko',
      'Mo',
      'Go',
      'To',
      'Po'
    ];
    let number = size || Math.floor(Math.log(bytes) / Math.log(1024));
    let suffix = visible ? units[number] : '';

    return (bytes / Math.pow(1024, Math.floor(number))).toFixed(precision) + ' ' + suffix;
  }
}
