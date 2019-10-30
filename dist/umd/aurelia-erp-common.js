(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global['aurelia-erp-common'] = {})));
}(this, (function (exports) { 'use strict';

  function configure(fxconfig) {
      fxconfig.foo = 'bar';
  }

  exports.configure = configure;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
