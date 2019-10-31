"use strict";

exports.__esModule = true;

var ColumnsFilterValueConverter = (exports.ColumnsFilterValueConverter = (function() {
  function ColumnsFilterValueConverter() {}

  ColumnsFilterValueConverter.prototype.toView = function toView(array: any) {
    return array.filter(function(item: any) {
      return item.column.indexOf(".") === -1;
    });
  };

  return ColumnsFilterValueConverter;
})());
