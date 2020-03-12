export class JsonValueConverter {
  toView(value) {
    try { 
      return JSON.stringify(value);
    } catch (e) {
      return value;
    }
  }
}
