export class ColumnsFilterValueConverter {
  toView(array: any[]) {
    return array.filter(
      item => item.column.indexOf(".") === -1 && item.searchable
    );
  }
}
