define('aurelia-erp-common', ['exports'], function (exports) { 'use strict';

  function configure(fxconfig) {
      fxconfig.foo = 'bar';
  }

  exports.configure = configure;

  Object.defineProperty(exports, '__esModule', { value: true });

});
