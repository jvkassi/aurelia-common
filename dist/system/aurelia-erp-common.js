System.register([], function (exports, module) {
  'use strict';
  return {
    execute: function () {

      exports('configure', configure);
      function configure(fxconfig) {
          fxconfig.foo = 'bar';
      }

    }
  };
});
