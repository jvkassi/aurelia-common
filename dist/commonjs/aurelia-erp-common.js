'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var elements = require('../../src/elements');

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */

function __decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}

function __metadata(metadataKey, metadataValue) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(metadataKey, metadataValue);
}

var logLevel = {
  none: 0,
  error: 10,
  warn: 20,
  info: 30,
  debug: 40
};

var loggers = {};
var appenders = [];
var globalDefaultLevel = logLevel.none;

var standardLevels = ['none', 'error', 'warn', 'info', 'debug'];
function isStandardLevel(level) {
  return standardLevels.filter(function (l) {
    return l === level;
  }).length > 0;
}

function appendArgs() {
  return [this].concat(Array.prototype.slice.call(arguments));
}

function logFactory(level) {
  var threshold = logLevel[level];
  return function () {
    if (this.level < threshold) {
      return;
    }

    var args = appendArgs.apply(this, arguments);
    var i = appenders.length;
    while (i--) {
      var _appenders$i;

      (_appenders$i = appenders[i])[level].apply(_appenders$i, args);
    }
  };
}

function logFactoryCustom(level) {
  var threshold = logLevel[level];
  return function () {
    if (this.level < threshold) {
      return;
    }

    var args = appendArgs.apply(this, arguments);
    var i = appenders.length;
    while (i--) {
      var appender = appenders[i];
      if (appender[level] !== undefined) {
        appender[level].apply(appender, args);
      }
    }
  };
}

function connectLoggers() {
  var proto = Logger.prototype;
  for (var _level in logLevel) {
    if (isStandardLevel(_level)) {
      if (_level !== 'none') {
        proto[_level] = logFactory(_level);
      }
    } else {
      proto[_level] = logFactoryCustom(_level);
    }
  }
}

function disconnectLoggers() {
  var proto = Logger.prototype;
  for (var _level2 in logLevel) {
    if (_level2 !== 'none') {
      proto[_level2] = function () {};
    }
  }
}

function getLogger(id) {
  return loggers[id] || new Logger(id);
}

function addAppender(appender) {
  if (appenders.push(appender) === 1) {
    connectLoggers();
  }
}

function removeAppender(appender) {
  appenders = appenders.filter(function (a) {
    return a !== appender;
  });
}

function getAppenders() {
  return [].concat(appenders);
}

function clearAppenders() {
  appenders = [];
  disconnectLoggers();
}

function addCustomLevel(name, value) {
  if (logLevel[name] !== undefined) {
    throw Error('Log level "' + name + '" already exists.');
  }

  if (isNaN(value)) {
    throw Error('Value must be a number.');
  }

  logLevel[name] = value;

  if (appenders.length > 0) {
    connectLoggers();
  } else {
    Logger.prototype[name] = function () {};
  }
}

function removeCustomLevel(name) {
  if (logLevel[name] === undefined) {
    return;
  }

  if (isStandardLevel(name)) {
    throw Error('Built-in log level "' + name + '" cannot be removed.');
  }

  delete logLevel[name];
  delete Logger.prototype[name];
}

function setLevel(level) {
  globalDefaultLevel = level;
  for (var key in loggers) {
    loggers[key].setLevel(level);
  }
}

function getLevel() {
  return globalDefaultLevel;
}

var Logger = function () {
  function Logger(id) {
    

    var cached = loggers[id];
    if (cached) {
      return cached;
    }

    loggers[id] = this;
    this.id = id;
    this.level = globalDefaultLevel;
  }

  Logger.prototype.debug = function debug(message) {};

  Logger.prototype.info = function info(message) {};

  Logger.prototype.warn = function warn(message) {};

  Logger.prototype.error = function error(message) {};

  Logger.prototype.setLevel = function setLevel(level) {
    this.level = level;
  };

  Logger.prototype.isDebugEnabled = function isDebugEnabled() {
    return this.level === logLevel.debug;
  };

  return Logger;
}();

var aureliaLogging = /*#__PURE__*/Object.freeze({
    logLevel: logLevel,
    getLogger: getLogger,
    addAppender: addAppender,
    removeAppender: removeAppender,
    getAppenders: getAppenders,
    clearAppenders: clearAppenders,
    addCustomLevel: addCustomLevel,
    removeCustomLevel: removeCustomLevel,
    setLevel: setLevel,
    getLevel: getLevel,
    Logger: Logger
});

function AggregateError(message, innerError, skipIfAlreadyAggregate) {
  if (innerError) {
    if (innerError.innerError && skipIfAlreadyAggregate) {
      return innerError;
    }

    var separator = '\n------------------------------------------------\n';

    message += separator + 'Inner Error:\n';

    if (typeof innerError === 'string') {
      message += 'Message: ' + innerError;
    } else {
      if (innerError.message) {
        message += 'Message: ' + innerError.message;
      } else {
        message += 'Unknown Inner Error Type. Displaying Inner Error as JSON:\n ' + JSON.stringify(innerError, null, '  ');
      }

      if (innerError.stack) {
        message += '\nInner Error Stack:\n' + innerError.stack;
        message += '\nEnd Inner Error Stack';
      }
    }

    message += separator;
  }

  var e = new Error(message);
  if (innerError) {
    e.innerError = innerError;
  }

  return e;
}

var FEATURE = {};

var PLATFORM = {
  noop: function noop() {},
  eachModule: function eachModule() {},
  moduleName: function (_moduleName) {
    function moduleName(_x) {
      return _moduleName.apply(this, arguments);
    }

    moduleName.toString = function () {
      return _moduleName.toString();
    };

    return moduleName;
  }(function (moduleName) {
    return moduleName;
  })
};

PLATFORM.global = function () {
  if (typeof self !== 'undefined') {
    return self;
  }

  if (typeof global !== 'undefined') {
    return global;
  }

  return new Function('return this')();
}();

var DOM = {};
var isInitialized = false;

function initializePAL(callback) {
  if (isInitialized) {
    return;
  }
  isInitialized = true;
  if (typeof Object.getPropertyDescriptor !== 'function') {
    Object.getPropertyDescriptor = function (subject, name) {
      var pd = Object.getOwnPropertyDescriptor(subject, name);
      var proto = Object.getPrototypeOf(subject);
      while (typeof pd === 'undefined' && proto !== null) {
        pd = Object.getOwnPropertyDescriptor(proto, name);
        proto = Object.getPrototypeOf(proto);
      }
      return pd;
    };
  }

  callback(PLATFORM, FEATURE, DOM);
}
function reset() {
  isInitialized = false;
}

var aureliaPal = /*#__PURE__*/Object.freeze({
    AggregateError: AggregateError,
    FEATURE: FEATURE,
    PLATFORM: PLATFORM,
    DOM: DOM,
    get isInitialized () { return isInitialized; },
    initializePAL: initializePAL,
    reset: reset
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function isObject(val) {
  return val && (typeof val === 'function' || (typeof val === 'undefined' ? 'undefined' : _typeof(val)) === 'object');
}

var metadata = {
  resource: 'aurelia:resource',
  paramTypes: 'design:paramtypes',
  propertyType: 'design:type',
  properties: 'design:properties',
  get: function get(metadataKey, target, targetKey) {
    if (!isObject(target)) {
      return undefined;
    }
    var result = metadata.getOwn(metadataKey, target, targetKey);
    return result === undefined ? metadata.get(metadataKey, Object.getPrototypeOf(target), targetKey) : result;
  },
  getOwn: function getOwn(metadataKey, target, targetKey) {
    if (!isObject(target)) {
      return undefined;
    }
    return Reflect.getOwnMetadata(metadataKey, target, targetKey);
  },
  define: function define(metadataKey, metadataValue, target, targetKey) {
    Reflect.defineMetadata(metadataKey, metadataValue, target, targetKey);
  },
  getOrCreateOwn: function getOrCreateOwn(metadataKey, Type, target, targetKey) {
    var result = metadata.getOwn(metadataKey, target, targetKey);

    if (result === undefined) {
      result = new Type();
      Reflect.defineMetadata(metadataKey, result, target, targetKey);
    }

    return result;
  }
};

var originStorage = new Map();
var unknownOrigin = Object.freeze({ moduleId: undefined, moduleMember: undefined });

var Origin = function () {
  function Origin(moduleId, moduleMember) {
    

    this.moduleId = moduleId;
    this.moduleMember = moduleMember;
  }

  Origin.get = function get(fn) {
    var origin = originStorage.get(fn);

    if (origin === undefined) {
      PLATFORM.eachModule(function (key, value) {
        if ((typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object') {
          for (var name in value) {
            try {
              var exp = value[name];
              if (exp === fn) {
                originStorage.set(fn, origin = new Origin(key, name));
                return true;
              }
            } catch (e) {}
          }
        }

        if (value === fn) {
          originStorage.set(fn, origin = new Origin(key, 'default'));
          return true;
        }

        return false;
      });
    }

    return origin || unknownOrigin;
  };

  Origin.set = function set(fn, origin) {
    originStorage.set(fn, origin);
  };

  return Origin;
}();

function decorators() {
  for (var _len = arguments.length, rest = Array(_len), _key = 0; _key < _len; _key++) {
    rest[_key] = arguments[_key];
  }

  var applicator = function applicator(target, key, descriptor) {
    var i = rest.length;

    if (key) {
      descriptor = descriptor || {
        value: target[key],
        writable: true,
        configurable: true,
        enumerable: true
      };

      while (i--) {
        descriptor = rest[i](target, key, descriptor) || descriptor;
      }

      Object.defineProperty(target, key, descriptor);
    } else {
      while (i--) {
        target = rest[i](target) || target;
      }
    }

    return target;
  };

  applicator.on = applicator;
  return applicator;
}

function deprecated(optionsOrTarget, maybeKey, maybeDescriptor) {
  function decorator(target, key, descriptor) {
    var methodSignature = target.constructor.name + '#' + key;
    var options = maybeKey ? {} : optionsOrTarget || {};
    var message = 'DEPRECATION - ' + methodSignature;

    if (typeof descriptor.value !== 'function') {
      throw new SyntaxError('Only methods can be marked as deprecated.');
    }

    if (options.message) {
      message += ' - ' + options.message;
    }

    return _extends({}, descriptor, {
      value: function deprecationWrapper() {
        if (options.error) {
          throw new Error(message);
        } else {
          console.warn(message);
        }

        return descriptor.value.apply(this, arguments);
      }
    });
  }

  return maybeKey ? decorator(optionsOrTarget, maybeKey, maybeDescriptor) : decorator;
}

function mixin(behavior) {
  var instanceKeys = Object.keys(behavior);

  function _mixin(possible) {
    var decorator = function decorator(target) {
      var resolvedTarget = typeof target === 'function' ? target.prototype : target;

      var i = instanceKeys.length;
      while (i--) {
        var property = instanceKeys[i];
        Object.defineProperty(resolvedTarget, property, {
          value: behavior[property],
          writable: true
        });
      }
    };

    return possible ? decorator(possible) : decorator;
  }

  return _mixin;
}

function alwaysValid() {
  return true;
}
function noCompose() {}

function ensureProtocolOptions(options) {
  if (options === undefined) {
    options = {};
  } else if (typeof options === 'function') {
    options = {
      validate: options
    };
  }

  if (!options.validate) {
    options.validate = alwaysValid;
  }

  if (!options.compose) {
    options.compose = noCompose;
  }

  return options;
}

function createProtocolValidator(validate) {
  return function (target) {
    var result = validate(target);
    return result === true;
  };
}

function createProtocolAsserter(name, validate) {
  return function (target) {
    var result = validate(target);
    if (result !== true) {
      throw new Error(result || name + ' was not correctly implemented.');
    }
  };
}

function protocol(name, options) {
  options = ensureProtocolOptions(options);

  var result = function result(target) {
    var resolvedTarget = typeof target === 'function' ? target.prototype : target;

    options.compose(resolvedTarget);
    result.assert(resolvedTarget);

    Object.defineProperty(resolvedTarget, 'protocol:' + name, {
      enumerable: false,
      configurable: false,
      writable: false,
      value: true
    });
  };

  result.validate = createProtocolValidator(options.validate);
  result.assert = createProtocolAsserter(name, options.validate);

  return result;
}

protocol.create = function (name, options) {
  options = ensureProtocolOptions(options);
  var hidden = 'protocol:' + name;
  var result = function result(target) {
    var decorator = protocol(name, options);
    return target ? decorator(target) : decorator;
  };

  result.decorates = function (obj) {
    return obj[hidden] === true;
  };
  result.validate = createProtocolValidator(options.validate);
  result.assert = createProtocolAsserter(name, options.validate);

  return result;
};

var aureliaMetadata = /*#__PURE__*/Object.freeze({
    metadata: metadata,
    Origin: Origin,
    decorators: decorators,
    deprecated: deprecated,
    mixin: mixin,
    protocol: protocol
});

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */

function __decorate$1(decorators$$1, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators$$1, target, key, desc);
    else for (var i = decorators$$1.length - 1; i >= 0; i--) if (d = decorators$$1[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}

function __metadata$1(metadataKey, metadataValue) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(metadataKey, metadataValue);
}

function isInjectable(potentialTarget) {
    return !!potentialTarget;
}
function autoinject(potentialTarget) {
    var deco = function (target) {
        if (!target.hasOwnProperty('inject')) {
            target.inject = (metadata.getOwn(metadata.paramTypes, target) ||
                _emptyParameters).slice();
            if (target.inject && target.inject.length > 0) {
                if (target.inject[target.inject.length - 1] === Object) {
                    target.inject.splice(-1, 1);
                }
            }
        }
    };
    if (isInjectable(potentialTarget)) {
        return deco(potentialTarget);
    }
    return deco;
}
function inject() {
    var rest = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        rest[_i] = arguments[_i];
    }
    return function (target, _key, descriptor) {
        if (typeof descriptor === 'number') {
            autoinject(target);
            if (rest.length === 1) {
                target.inject[descriptor] = rest[0];
            }
            return;
        }
        if (descriptor) {
            var fn = descriptor.value;
            fn.inject = rest;
        }
        else {
            target.inject = rest;
        }
    };
}

var resolver = protocol.create('aurelia:resolver', function (target) {
    if (!(typeof target.get === 'function')) {
        return 'Resolvers must implement: get(container: Container, key: any): any';
    }
    return true;
});
function isStrategy(actual, expected, state) {
    return actual === expected;
}
var StrategyResolver = (function () {
    function StrategyResolver(strategy, state) {
        this.strategy = strategy;
        this.state = state;
    }
    StrategyResolver.prototype.get = function (container, key) {
        if (isStrategy(this.strategy, 0, this.state)) {
            return this.state;
        }
        if (isStrategy(this.strategy, 1, this.state)) {
            var singleton = container.invoke(this.state);
            this.state = singleton;
            this.strategy = 0;
            return singleton;
        }
        if (isStrategy(this.strategy, 2, this.state)) {
            return container.invoke(this.state);
        }
        if (isStrategy(this.strategy, 3, this.state)) {
            return this.state(container, key, this);
        }
        if (isStrategy(this.strategy, 4, this.state)) {
            return this.state[0].get(container, key);
        }
        if (isStrategy(this.strategy, 5, this.state)) {
            return container.get(this.state);
        }
        throw new Error('Invalid strategy: ' + this.strategy);
    };
    StrategyResolver = __decorate$1([
        resolver(),
        __metadata$1("design:paramtypes", [Number, Object])
    ], StrategyResolver);
    return StrategyResolver;
}());
var Lazy = (function () {
    function Lazy(key) {
        this._key = key;
    }
    Lazy_1 = Lazy;
    Lazy.prototype.get = function (container) {
        var _this = this;
        return function () { return container.get(_this._key); };
    };
    Lazy.of = function (key) {
        return new Lazy_1(key);
    };
    var Lazy_1;
    Lazy = Lazy_1 = __decorate$1([
        resolver(),
        __metadata$1("design:paramtypes", [Object])
    ], Lazy);
    return Lazy;
}());
var All = (function () {
    function All(key) {
        this._key = key;
    }
    All_1 = All;
    All.prototype.get = function (container) {
        return container.getAll(this._key);
    };
    All.of = function (key) {
        return new All_1(key);
    };
    var All_1;
    All = All_1 = __decorate$1([
        resolver(),
        __metadata$1("design:paramtypes", [Object])
    ], All);
    return All;
}());
var Optional = (function () {
    function Optional(key, checkParent) {
        if (checkParent === void 0) { checkParent = true; }
        this._key = key;
        this._checkParent = checkParent;
    }
    Optional_1 = Optional;
    Optional.prototype.get = function (container) {
        if (container.hasResolver(this._key, this._checkParent)) {
            return container.get(this._key);
        }
        return null;
    };
    Optional.of = function (key, checkParent) {
        if (checkParent === void 0) { checkParent = true; }
        return new Optional_1(key, checkParent);
    };
    var Optional_1;
    Optional = Optional_1 = __decorate$1([
        resolver(),
        __metadata$1("design:paramtypes", [Object, Boolean])
    ], Optional);
    return Optional;
}());
var Parent = (function () {
    function Parent(key) {
        this._key = key;
    }
    Parent_1 = Parent;
    Parent.prototype.get = function (container) {
        return container.parent ? container.parent.get(this._key) : null;
    };
    Parent.of = function (key) {
        return new Parent_1(key);
    };
    var Parent_1;
    Parent = Parent_1 = __decorate$1([
        resolver(),
        __metadata$1("design:paramtypes", [Object])
    ], Parent);
    return Parent;
}());
var Factory = (function () {
    function Factory(key) {
        this._key = key;
    }
    Factory_1 = Factory;
    Factory.prototype.get = function (container) {
        var fn = this._key;
        var resolver = container.getResolver(fn);
        if (resolver && resolver.strategy === 3) {
            fn = resolver.state;
        }
        return function () {
            var rest = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                rest[_i] = arguments[_i];
            }
            return container.invoke(fn, rest);
        };
    };
    Factory.of = function (key) {
        return new Factory_1(key);
    };
    var Factory_1;
    Factory = Factory_1 = __decorate$1([
        resolver(),
        __metadata$1("design:paramtypes", [Object])
    ], Factory);
    return Factory;
}());
var NewInstance = (function () {
    function NewInstance(key) {
        var dynamicDependencies = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            dynamicDependencies[_i - 1] = arguments[_i];
        }
        this.key = key;
        this.asKey = key;
        this.dynamicDependencies = dynamicDependencies;
    }
    NewInstance_1 = NewInstance;
    NewInstance.prototype.get = function (container) {
        var dynamicDependencies = this.dynamicDependencies.length > 0
            ? this.dynamicDependencies.map(function (dependency) {
                return dependency['protocol:aurelia:resolver']
                    ? dependency.get(container)
                    : container.get(dependency);
            })
            : undefined;
        var fn = this.key;
        var resolver = container.getResolver(fn);
        if (resolver && resolver.strategy === 3) {
            fn = resolver.state;
        }
        var instance = container.invoke(fn, dynamicDependencies);
        container.registerInstance(this.asKey, instance);
        return instance;
    };
    NewInstance.prototype.as = function (key) {
        this.asKey = key;
        return this;
    };
    NewInstance.of = function (key) {
        var dynamicDependencies = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            dynamicDependencies[_i - 1] = arguments[_i];
        }
        return new (NewInstance_1.bind.apply(NewInstance_1, [void 0, key].concat(dynamicDependencies)))();
    };
    var NewInstance_1;
    NewInstance = NewInstance_1 = __decorate$1([
        resolver(),
        __metadata$1("design:paramtypes", [Object, Object])
    ], NewInstance);
    return NewInstance;
}());
function getDecoratorDependencies(target) {
    autoinject(target);
    return target.inject;
}
function lazy(keyValue) {
    return function (target, _key, index) {
        var inject$$1 = getDecoratorDependencies(target);
        inject$$1[index] = Lazy.of(keyValue);
    };
}
function all(keyValue) {
    return function (target, _key, index) {
        var inject$$1 = getDecoratorDependencies(target);
        inject$$1[index] = All.of(keyValue);
    };
}
function optional(checkParentOrTarget) {
    if (checkParentOrTarget === void 0) { checkParentOrTarget = true; }
    var deco = function (checkParent) {
        return function (target, _key, index) {
            var inject$$1 = getDecoratorDependencies(target);
            inject$$1[index] = Optional.of(inject$$1[index], checkParent);
        };
    };
    if (typeof checkParentOrTarget === 'boolean') {
        return deco(checkParentOrTarget);
    }
    return deco(true);
}
function parent(target, _key, index) {
    var inject$$1 = getDecoratorDependencies(target);
    inject$$1[index] = Parent.of(inject$$1[index]);
}
function factory(keyValue) {
    return function (target, _key, index) {
        var inject$$1 = getDecoratorDependencies(target);
        inject$$1[index] = Factory.of(keyValue);
    };
}
function newInstance(asKeyOrTarget) {
    var dynamicDependencies = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        dynamicDependencies[_i - 1] = arguments[_i];
    }
    var deco = function (asKey) {
        return function (target, _key, index) {
            var inject$$1 = getDecoratorDependencies(target);
            inject$$1[index] = NewInstance.of.apply(NewInstance, [inject$$1[index]].concat(dynamicDependencies));
            if (!!asKey) {
                inject$$1[index].as(asKey);
            }
        };
    };
    if (arguments.length >= 1) {
        return deco(asKeyOrTarget);
    }
    return deco();
}

function validateKey(key) {
    if (key === null || key === undefined) {
        throw new Error('key/value cannot be null or undefined. Are you trying to inject/register something that doesn\'t exist with DI?');
    }
}
var _emptyParameters = Object.freeze([]);
metadata.registration = 'aurelia:registration';
metadata.invoker = 'aurelia:invoker';
var resolverDecorates = resolver.decorates;
var InvocationHandler = (function () {
    function InvocationHandler(fn, invoker, dependencies) {
        this.fn = fn;
        this.invoker = invoker;
        this.dependencies = dependencies;
    }
    InvocationHandler.prototype.invoke = function (container, dynamicDependencies) {
        return dynamicDependencies !== undefined
            ? this.invoker.invokeWithDynamicDependencies(container, this.fn, this.dependencies, dynamicDependencies)
            : this.invoker.invoke(container, this.fn, this.dependencies);
    };
    return InvocationHandler;
}());
function invokeWithDynamicDependencies(container, fn, staticDependencies, dynamicDependencies) {
    var i = staticDependencies.length;
    var args = new Array(i);
    var lookup;
    while (i--) {
        lookup = staticDependencies[i];
        if (lookup === null || lookup === undefined) {
            throw new Error('Constructor Parameter with index ' +
                i +
                ' cannot be null or undefined. Are you trying to inject/register something that doesn\'t exist with DI?');
        }
        else {
            args[i] = container.get(lookup);
        }
    }
    if (dynamicDependencies !== undefined) {
        args = args.concat(dynamicDependencies);
    }
    return Reflect.construct(fn, args);
}
var classInvoker = {
    invoke: function (container, Type, deps) {
        var instances = deps.map(function (dep) { return container.get(dep); });
        return Reflect.construct(Type, instances);
    },
    invokeWithDynamicDependencies: invokeWithDynamicDependencies
};
function getDependencies(f) {
    if (!f.hasOwnProperty('inject')) {
        return [];
    }
    if (typeof f.inject === 'function') {
        return f.inject();
    }
    return f.inject;
}
var Container = (function () {
    function Container(configuration) {
        if (configuration === undefined) {
            configuration = {};
        }
        this._configuration = configuration;
        this._onHandlerCreated = configuration.onHandlerCreated;
        this._handlers =
            configuration.handlers || (configuration.handlers = new Map());
        this._resolvers = new Map();
        this.root = this;
        this.parent = null;
    }
    Container.prototype.makeGlobal = function () {
        Container.instance = this;
        return this;
    };
    Container.prototype.setHandlerCreatedCallback = function (onHandlerCreated) {
        this._onHandlerCreated = onHandlerCreated;
        this._configuration.onHandlerCreated = onHandlerCreated;
    };
    Container.prototype.registerInstance = function (key, instance) {
        return this.registerResolver(key, new StrategyResolver(0, instance === undefined ? key : instance));
    };
    Container.prototype.registerSingleton = function (key, fn) {
        return this.registerResolver(key, new StrategyResolver(1, fn === undefined ? key : fn));
    };
    Container.prototype.registerTransient = function (key, fn) {
        return this.registerResolver(key, new StrategyResolver(2, fn === undefined ? key : fn));
    };
    Container.prototype.registerHandler = function (key, handler) {
        return this.registerResolver(key, new StrategyResolver(3, handler));
    };
    Container.prototype.registerAlias = function (originalKey, aliasKey) {
        return this.registerResolver(aliasKey, new StrategyResolver(5, originalKey));
    };
    Container.prototype.registerResolver = function (key, resolver$$1) {
        validateKey(key);
        var allResolvers = this._resolvers;
        var result = allResolvers.get(key);
        if (result === undefined) {
            allResolvers.set(key, resolver$$1);
        }
        else if (result.strategy === 4) {
            result.state.push(resolver$$1);
        }
        else {
            allResolvers.set(key, new StrategyResolver(4, [result, resolver$$1]));
        }
        return resolver$$1;
    };
    Container.prototype.autoRegister = function (key, fn) {
        fn = fn === undefined ? key : fn;
        if (typeof fn === 'function') {
            var registration = metadata.get(metadata.registration, fn);
            if (registration === undefined) {
                return this.registerResolver(key, new StrategyResolver(1, fn));
            }
            return registration.registerResolver(this, key, fn);
        }
        return this.registerResolver(key, new StrategyResolver(0, fn));
    };
    Container.prototype.autoRegisterAll = function (fns) {
        var i = fns.length;
        while (i--) {
            this.autoRegister(fns[i]);
        }
    };
    Container.prototype.unregister = function (key) {
        this._resolvers.delete(key);
    };
    Container.prototype.hasResolver = function (key, checkParent) {
        if (checkParent === void 0) { checkParent = false; }
        validateKey(key);
        return (this._resolvers.has(key) ||
            (checkParent &&
                this.parent !== null &&
                this.parent.hasResolver(key, checkParent)));
    };
    Container.prototype.getResolver = function (key) {
        return this._resolvers.get(key);
    };
    Container.prototype.get = function (key) {
        validateKey(key);
        if (key === Container) {
            return this;
        }
        if (resolverDecorates(key)) {
            return key.get(this, key);
        }
        var resolver$$1 = this._resolvers.get(key);
        if (resolver$$1 === undefined) {
            if (this.parent === null) {
                return this.autoRegister(key).get(this, key);
            }
            var registration = metadata.get(metadata.registration, key);
            if (registration === undefined) {
                return this.parent._get(key);
            }
            return registration.registerResolver(this, key, key).get(this, key);
        }
        return resolver$$1.get(this, key);
    };
    Container.prototype._get = function (key) {
        var resolver$$1 = this._resolvers.get(key);
        if (resolver$$1 === undefined) {
            if (this.parent === null) {
                return this.autoRegister(key).get(this, key);
            }
            return this.parent._get(key);
        }
        return resolver$$1.get(this, key);
    };
    Container.prototype.getAll = function (key) {
        validateKey(key);
        var resolver$$1 = this._resolvers.get(key);
        if (resolver$$1 === undefined) {
            if (this.parent === null) {
                return _emptyParameters;
            }
            return this.parent.getAll(key);
        }
        if (resolver$$1.strategy === 4) {
            var state = resolver$$1.state;
            var i = state.length;
            var results = new Array(i);
            while (i--) {
                results[i] = state[i].get(this, key);
            }
            return results;
        }
        return [resolver$$1.get(this, key)];
    };
    Container.prototype.createChild = function () {
        var child = new Container(this._configuration);
        child.root = this.root;
        child.parent = this;
        return child;
    };
    Container.prototype.invoke = function (fn, dynamicDependencies) {
        try {
            var handler = this._handlers.get(fn);
            if (handler === undefined) {
                handler = this._createInvocationHandler(fn);
                this._handlers.set(fn, handler);
            }
            return handler.invoke(this, dynamicDependencies);
        }
        catch (e) {
            throw new AggregateError("Error invoking " + fn.name + ". Check the inner error for details.", e, true);
        }
    };
    Container.prototype._createInvocationHandler = function (fn) {
        var dependencies;
        if (fn.inject === undefined) {
            dependencies =
                metadata.getOwn(metadata.paramTypes, fn) || _emptyParameters;
        }
        else {
            dependencies = [];
            var ctor = fn;
            while (typeof ctor === 'function') {
                dependencies.push.apply(dependencies, getDependencies(ctor));
                ctor = Object.getPrototypeOf(ctor);
            }
        }
        var invoker = metadata.getOwn(metadata.invoker, fn) || classInvoker;
        var handler = new InvocationHandler(fn, invoker, dependencies);
        return this._onHandlerCreated !== undefined
            ? this._onHandlerCreated(handler)
            : handler;
    };
    return Container;
}());

function invoker(value) {
    return function (target) {
        metadata.define(metadata.invoker, value, target);
    };
}
function invokeAsFactory(potentialTarget) {
    var deco = function (target) {
        metadata.define(metadata.invoker, FactoryInvoker.instance, target);
    };
    return potentialTarget ? deco(potentialTarget) : deco;
}
var FactoryInvoker = (function () {
    function FactoryInvoker() {
    }
    FactoryInvoker.prototype.invoke = function (container, fn, dependencies) {
        var i = dependencies.length;
        var args = new Array(i);
        while (i--) {
            args[i] = container.get(dependencies[i]);
        }
        return fn.apply(undefined, args);
    };
    FactoryInvoker.prototype.invokeWithDynamicDependencies = function (container, fn, staticDependencies, dynamicDependencies) {
        var i = staticDependencies.length;
        var args = new Array(i);
        while (i--) {
            args[i] = container.get(staticDependencies[i]);
        }
        if (dynamicDependencies !== undefined) {
            args = args.concat(dynamicDependencies);
        }
        return fn.apply(undefined, args);
    };
    return FactoryInvoker;
}());
FactoryInvoker.instance = new FactoryInvoker();

function registration(value) {
    return function (target) {
        metadata.define(metadata.registration, value, target);
    };
}
function transient(key) {
    return registration(new TransientRegistration(key));
}
function singleton(keyOrRegisterInChild, registerInChild) {
    if (registerInChild === void 0) { registerInChild = false; }
    return registration(new SingletonRegistration(keyOrRegisterInChild, registerInChild));
}
var TransientRegistration = (function () {
    function TransientRegistration(key) {
        this._key = key;
    }
    TransientRegistration.prototype.registerResolver = function (container, key, fn) {
        var existingResolver = container.getResolver(this._key || key);
        return existingResolver === undefined
            ? container.registerTransient((this._key || key), fn)
            : existingResolver;
    };
    return TransientRegistration;
}());
var SingletonRegistration = (function () {
    function SingletonRegistration(keyOrRegisterInChild, registerInChild) {
        if (registerInChild === void 0) { registerInChild = false; }
        if (typeof keyOrRegisterInChild === 'boolean') {
            this._registerInChild = keyOrRegisterInChild;
        }
        else {
            this._key = keyOrRegisterInChild;
            this._registerInChild = registerInChild;
        }
    }
    SingletonRegistration.prototype.registerResolver = function (container, key, fn) {
        var targetContainer = this._registerInChild ? container : container.root;
        var existingResolver = targetContainer.getResolver(this._key || key);
        return existingResolver === undefined
            ? targetContainer.registerSingleton(this._key || key, fn)
            : existingResolver;
    };
    return SingletonRegistration;
}());

var aureliaDependencyInjection = /*#__PURE__*/Object.freeze({
    _emptyParameters: _emptyParameters,
    InvocationHandler: InvocationHandler,
    Container: Container,
    autoinject: autoinject,
    inject: inject,
    invoker: invoker,
    invokeAsFactory: invokeAsFactory,
    FactoryInvoker: FactoryInvoker,
    registration: registration,
    transient: transient,
    singleton: singleton,
    TransientRegistration: TransientRegistration,
    SingletonRegistration: SingletonRegistration,
    resolver: resolver,
    StrategyResolver: StrategyResolver,
    Lazy: Lazy,
    All: All,
    Optional: Optional,
    Parent: Parent,
    Factory: Factory,
    NewInstance: NewInstance,
    getDecoratorDependencies: getDecoratorDependencies,
    lazy: lazy,
    all: all,
    optional: optional,
    parent: parent,
    factory: factory,
    newInstance: newInstance
});

var _typeof$1 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function trimDots(ary) {
  for (var i = 0; i < ary.length; ++i) {
    var part = ary[i];
    if (part === '.') {
      ary.splice(i, 1);
      i -= 1;
    } else if (part === '..') {
      if (i === 0 || i === 1 && ary[2] === '..' || ary[i - 1] === '..') {
        continue;
      } else if (i > 0) {
        ary.splice(i - 1, 2);
        i -= 2;
      }
    }
  }
}

function relativeToFile(name, file) {
  var fileParts = file && file.split('/');
  var nameParts = name.trim().split('/');

  if (nameParts[0].charAt(0) === '.' && fileParts) {
    var normalizedBaseParts = fileParts.slice(0, fileParts.length - 1);
    nameParts.unshift.apply(nameParts, normalizedBaseParts);
  }

  trimDots(nameParts);

  return nameParts.join('/');
}

function join(path1, path2) {
  if (!path1) {
    return path2;
  }

  if (!path2) {
    return path1;
  }

  var schemeMatch = path1.match(/^([^/]*?:)\//);
  var scheme = schemeMatch && schemeMatch.length > 0 ? schemeMatch[1] : '';
  path1 = path1.substr(scheme.length);

  var urlPrefix = void 0;
  if (path1.indexOf('///') === 0 && scheme === 'file:') {
    urlPrefix = '///';
  } else if (path1.indexOf('//') === 0) {
    urlPrefix = '//';
  } else if (path1.indexOf('/') === 0) {
    urlPrefix = '/';
  } else {
    urlPrefix = '';
  }

  var trailingSlash = path2.slice(-1) === '/' ? '/' : '';

  var url1 = path1.split('/');
  var url2 = path2.split('/');
  var url3 = [];

  for (var i = 0, ii = url1.length; i < ii; ++i) {
    if (url1[i] === '..') {
      if (url3.length && url3[url3.length - 1] !== '..') {
        url3.pop();
      } else {
        url3.push(url1[i]);
      }
    } else if (url1[i] === '.' || url1[i] === '') {
      continue;
    } else {
      url3.push(url1[i]);
    }
  }

  for (var _i = 0, _ii = url2.length; _i < _ii; ++_i) {
    if (url2[_i] === '..') {
      if (url3.length && url3[url3.length - 1] !== '..') {
        url3.pop();
      } else {
        url3.push(url2[_i]);
      }
    } else if (url2[_i] === '.' || url2[_i] === '') {
      continue;
    } else {
      url3.push(url2[_i]);
    }
  }

  return scheme + urlPrefix + url3.join('/') + trailingSlash;
}

var encode = encodeURIComponent;
var encodeKey = function encodeKey(k) {
  return encode(k).replace('%24', '$');
};

function buildParam(key, value, traditional) {
  var result = [];
  if (value === null || value === undefined) {
    return result;
  }
  if (Array.isArray(value)) {
    for (var i = 0, l = value.length; i < l; i++) {
      if (traditional) {
        result.push(encodeKey(key) + '=' + encode(value[i]));
      } else {
        var arrayKey = key + '[' + (_typeof$1(value[i]) === 'object' && value[i] !== null ? i : '') + ']';
        result = result.concat(buildParam(arrayKey, value[i]));
      }
    }
  } else if ((typeof value === 'undefined' ? 'undefined' : _typeof$1(value)) === 'object' && !traditional) {
    for (var propertyName in value) {
      result = result.concat(buildParam(key + '[' + propertyName + ']', value[propertyName]));
    }
  } else {
    result.push(encodeKey(key) + '=' + encode(value));
  }
  return result;
}

function buildQueryString(params, traditional) {
  var pairs = [];
  var keys = Object.keys(params || {}).sort();
  for (var i = 0, len = keys.length; i < len; i++) {
    var key = keys[i];
    pairs = pairs.concat(buildParam(key, params[key], traditional));
  }

  if (pairs.length === 0) {
    return '';
  }

  return pairs.join('&');
}

function processScalarParam(existedParam, value) {
  if (Array.isArray(existedParam)) {
    existedParam.push(value);
    return existedParam;
  }
  if (existedParam !== undefined) {
    return [existedParam, value];
  }

  return value;
}

function parseComplexParam(queryParams, keys, value) {
  var currentParams = queryParams;
  var keysLastIndex = keys.length - 1;
  for (var j = 0; j <= keysLastIndex; j++) {
    var key = keys[j] === '' ? currentParams.length : keys[j];
    if (j < keysLastIndex) {
      var prevValue = !currentParams[key] || _typeof$1(currentParams[key]) === 'object' ? currentParams[key] : [currentParams[key]];
      currentParams = currentParams[key] = prevValue || (isNaN(keys[j + 1]) ? {} : []);
    } else {
      currentParams = currentParams[key] = value;
    }
  }
}

function parseQueryString(queryString) {
  var queryParams = {};
  if (!queryString || typeof queryString !== 'string') {
    return queryParams;
  }

  var query = queryString;
  if (query.charAt(0) === '?') {
    query = query.substr(1);
  }

  var pairs = query.replace(/\+/g, ' ').split('&');
  for (var i = 0; i < pairs.length; i++) {
    var pair = pairs[i].split('=');
    var key = decodeURIComponent(pair[0]);
    if (!key) {
      continue;
    }

    var keys = key.split('][');
    var keysLastIndex = keys.length - 1;

    if (/\[/.test(keys[0]) && /\]$/.test(keys[keysLastIndex])) {
      keys[keysLastIndex] = keys[keysLastIndex].replace(/\]$/, '');
      keys = keys.shift().split('[').concat(keys);
      keysLastIndex = keys.length - 1;
    } else {
      keysLastIndex = 0;
    }

    if (pair.length >= 2) {
      var value = pair[1] ? decodeURIComponent(pair[1]) : '';
      if (keysLastIndex) {
        parseComplexParam(queryParams, keys, value);
      } else {
        queryParams[key] = processScalarParam(queryParams[key], value);
      }
    } else {
      queryParams[key] = true;
    }
  }
  return queryParams;
}

var aureliaPath = /*#__PURE__*/Object.freeze({
    relativeToFile: relativeToFile,
    join: join,
    buildQueryString: buildQueryString,
    parseQueryString: parseQueryString
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var TemplateDependency = function TemplateDependency(src, name) {
  

  this.src = src;
  this.name = name;
};

var TemplateRegistryEntry = function () {
  function TemplateRegistryEntry(address) {
    

    this.templateIsLoaded = false;
    this.factoryIsReady = false;
    this.resources = null;
    this.dependencies = null;

    this.address = address;
    this.onReady = null;
    this._template = null;
    this._factory = null;
  }

  TemplateRegistryEntry.prototype.addDependency = function addDependency(src, name) {
    var finalSrc = typeof src === 'string' ? relativeToFile(src, this.address) : Origin.get(src).moduleId;

    this.dependencies.push(new TemplateDependency(finalSrc, name));
  };

  _createClass(TemplateRegistryEntry, [{
    key: 'template',
    get: function get() {
      return this._template;
    },
    set: function set(value) {
      var address = this.address;
      var requires = void 0;
      var current = void 0;
      var src = void 0;
      var dependencies = void 0;

      this._template = value;
      this.templateIsLoaded = true;

      requires = value.content.querySelectorAll('require');
      dependencies = this.dependencies = new Array(requires.length);

      for (var i = 0, ii = requires.length; i < ii; ++i) {
        current = requires[i];
        src = current.getAttribute('from');

        if (!src) {
          throw new Error('<require> element in ' + address + ' has no "from" attribute.');
        }

        dependencies[i] = new TemplateDependency(relativeToFile(src, address), current.getAttribute('as'));

        if (current.parentNode) {
          current.parentNode.removeChild(current);
        }
      }
    }
  }, {
    key: 'factory',
    get: function get() {
      return this._factory;
    },
    set: function set(value) {
      this._factory = value;
      this.factoryIsReady = true;
    }
  }]);

  return TemplateRegistryEntry;
}();

var Loader = function () {
  function Loader() {
    

    this.templateRegistry = {};
  }

  Loader.prototype.map = function map(id, source) {
    throw new Error('Loaders must implement map(id, source).');
  };

  Loader.prototype.normalizeSync = function normalizeSync(moduleId, relativeTo) {
    throw new Error('Loaders must implement normalizeSync(moduleId, relativeTo).');
  };

  Loader.prototype.normalize = function normalize(moduleId, relativeTo) {
    throw new Error('Loaders must implement normalize(moduleId: string, relativeTo: string): Promise<string>.');
  };

  Loader.prototype.loadModule = function loadModule(id) {
    throw new Error('Loaders must implement loadModule(id).');
  };

  Loader.prototype.loadAllModules = function loadAllModules(ids) {
    throw new Error('Loader must implement loadAllModules(ids).');
  };

  Loader.prototype.loadTemplate = function loadTemplate(url) {
    throw new Error('Loader must implement loadTemplate(url).');
  };

  Loader.prototype.loadText = function loadText(url) {
    throw new Error('Loader must implement loadText(url).');
  };

  Loader.prototype.applyPluginToUrl = function applyPluginToUrl(url, pluginName) {
    throw new Error('Loader must implement applyPluginToUrl(url, pluginName).');
  };

  Loader.prototype.addPlugin = function addPlugin(pluginName, implementation) {
    throw new Error('Loader must implement addPlugin(pluginName, implementation).');
  };

  Loader.prototype.getOrCreateTemplateRegistryEntry = function getOrCreateTemplateRegistryEntry(address) {
    return this.templateRegistry[address] || (this.templateRegistry[address] = new TemplateRegistryEntry(address));
  };

  return Loader;
}();

var _typeof$2 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var stackSeparator = '\nEnqueued in TaskQueue by:\n';
var microStackSeparator = '\nEnqueued in MicroTaskQueue by:\n';

function makeRequestFlushFromMutationObserver(flush) {
  var observer = DOM.createMutationObserver(flush);
  var val = 'a';
  var node = DOM.createTextNode('a');
  var values = Object.create(null);
  values.a = 'b';
  values.b = 'a';
  observer.observe(node, { characterData: true });
  return function requestFlush() {
    node.data = val = values[val];
  };
}

function makeRequestFlushFromTimer(flush) {
  return function requestFlush() {
    var timeoutHandle = setTimeout(handleFlushTimer, 0);

    var intervalHandle = setInterval(handleFlushTimer, 50);
    function handleFlushTimer() {
      clearTimeout(timeoutHandle);
      clearInterval(intervalHandle);
      flush();
    }
  };
}

function onError(error, task, longStacks) {
  if (longStacks && task.stack && (typeof error === 'undefined' ? 'undefined' : _typeof$2(error)) === 'object' && error !== null) {
    error.stack = filterFlushStack(error.stack) + task.stack;
  }

  if ('onError' in task) {
    task.onError(error);
  } else {
    setTimeout(function () {
      throw error;
    }, 0);
  }
}

var TaskQueue = function () {
  function TaskQueue() {
    var _this = this;

    

    this.flushing = false;
    this.longStacks = false;

    this.microTaskQueue = [];
    this.microTaskQueueCapacity = 1024;
    this.taskQueue = [];

    if (FEATURE.mutationObserver) {
      this.requestFlushMicroTaskQueue = makeRequestFlushFromMutationObserver(function () {
        return _this.flushMicroTaskQueue();
      });
    } else {
      this.requestFlushMicroTaskQueue = makeRequestFlushFromTimer(function () {
        return _this.flushMicroTaskQueue();
      });
    }

    this.requestFlushTaskQueue = makeRequestFlushFromTimer(function () {
      return _this.flushTaskQueue();
    });
  }

  TaskQueue.prototype._flushQueue = function _flushQueue(queue, capacity) {
    var index = 0;
    var task = void 0;

    try {
      this.flushing = true;
      while (index < queue.length) {
        task = queue[index];
        if (this.longStacks) {
          this.stack = typeof task.stack === 'string' ? task.stack : undefined;
        }
        task.call();
        index++;

        if (index > capacity) {
          for (var scan = 0, newLength = queue.length - index; scan < newLength; scan++) {
            queue[scan] = queue[scan + index];
          }

          queue.length -= index;
          index = 0;
        }
      }
    } catch (error) {
      onError(error, task, this.longStacks);
    } finally {
      this.flushing = false;
    }
  };

  TaskQueue.prototype.queueMicroTask = function queueMicroTask(task) {
    if (this.microTaskQueue.length < 1) {
      this.requestFlushMicroTaskQueue();
    }

    if (this.longStacks) {
      task.stack = this.prepareQueueStack(microStackSeparator);
    }

    this.microTaskQueue.push(task);
  };

  TaskQueue.prototype.queueTask = function queueTask(task) {
    if (this.taskQueue.length < 1) {
      this.requestFlushTaskQueue();
    }

    if (this.longStacks) {
      task.stack = this.prepareQueueStack(stackSeparator);
    }

    this.taskQueue.push(task);
  };

  TaskQueue.prototype.flushTaskQueue = function flushTaskQueue() {
    var queue = this.taskQueue;
    this.taskQueue = [];
    this._flushQueue(queue, Number.MAX_VALUE);
  };

  TaskQueue.prototype.flushMicroTaskQueue = function flushMicroTaskQueue() {
    var queue = this.microTaskQueue;
    this._flushQueue(queue, this.microTaskQueueCapacity);
    queue.length = 0;
  };

  TaskQueue.prototype.prepareQueueStack = function prepareQueueStack(separator) {
    var stack = separator + filterQueueStack(captureStack());

    if (typeof this.stack === 'string') {
      stack = filterFlushStack(stack) + this.stack;
    }

    return stack;
  };

  return TaskQueue;
}();

function captureStack() {
  var error = new Error();

  if (error.stack) {
    return error.stack;
  }

  try {
    throw error;
  } catch (e) {
    return e.stack;
  }
}

function filterQueueStack(stack) {
  return stack.replace(/^[\s\S]*?\bqueue(Micro)?Task\b[^\n]*\n/, '');
}

function filterFlushStack(stack) {
  var index = stack.lastIndexOf('flushMicroTaskQueue');

  if (index < 0) {
    index = stack.lastIndexOf('flushTaskQueue');
    if (index < 0) {
      return stack;
    }
  }

  index = stack.lastIndexOf('\n', index);

  return index < 0 ? stack : stack.substr(0, index);
}

var _createClass$1 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof$3 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _dec, _dec2, _class, _dec3, _class2, _dec4, _class3, _dec5, _class5, _dec6, _class7, _dec7, _class8, _dec8, _class9, _dec9, _class10, _class12, _temp, _dec10, _class13, _class14, _temp2;

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var targetContext = 'Binding:target';
var sourceContext = 'Binding:source';

var map = Object.create(null);

function camelCase(name) {
  if (name in map) {
    return map[name];
  }
  var result = name.charAt(0).toLowerCase() + name.slice(1).replace(/[_.-](\w|$)/g, function (_, x) {
    return x.toUpperCase();
  });
  map[name] = result;
  return result;
}

function createOverrideContext(bindingContext, parentOverrideContext) {
  return {
    bindingContext: bindingContext,
    parentOverrideContext: parentOverrideContext || null
  };
}

function getContextFor(name, scope, ancestor) {
  var oc = scope.overrideContext;

  if (ancestor) {
    while (ancestor && oc) {
      ancestor--;
      oc = oc.parentOverrideContext;
    }
    if (ancestor || !oc) {
      return undefined;
    }
    return name in oc ? oc : oc.bindingContext;
  }

  while (oc && !(name in oc) && !(oc.bindingContext && name in oc.bindingContext)) {
    oc = oc.parentOverrideContext;
  }
  if (oc) {
    return name in oc ? oc : oc.bindingContext;
  }

  return scope.bindingContext || scope.overrideContext;
}

var slotNames = [];
var versionSlotNames = [];
var lastSlot = -1;
function ensureEnoughSlotNames(currentSlot) {
  if (currentSlot === lastSlot) {
    lastSlot += 5;
    var ii = slotNames.length = versionSlotNames.length = lastSlot + 1;
    for (var i = currentSlot + 1; i < ii; ++i) {
      slotNames[i] = '_observer' + i;
      versionSlotNames[i] = '_observerVersion' + i;
    }
  }
}
ensureEnoughSlotNames(-1);

function addObserver(observer) {
  var observerSlots = this._observerSlots === undefined ? 0 : this._observerSlots;
  var i = observerSlots;
  while (i-- && this[slotNames[i]] !== observer) {}

  if (i === -1) {
    i = 0;
    while (this[slotNames[i]]) {
      i++;
    }
    this[slotNames[i]] = observer;
    observer.subscribe(sourceContext, this);

    if (i === observerSlots) {
      this._observerSlots = i + 1;
    }
  }

  if (this._version === undefined) {
    this._version = 0;
  }
  this[versionSlotNames[i]] = this._version;
  ensureEnoughSlotNames(i);
}

function observeProperty(obj, propertyName) {
  var observer = this.observerLocator.getObserver(obj, propertyName);
  addObserver.call(this, observer);
}

function observeArray(array) {
  var observer = this.observerLocator.getArrayObserver(array);
  addObserver.call(this, observer);
}

function unobserve(all) {
  var i = this._observerSlots;
  while (i--) {
    if (all || this[versionSlotNames[i]] !== this._version) {
      var observer = this[slotNames[i]];
      this[slotNames[i]] = null;
      if (observer) {
        observer.unsubscribe(sourceContext, this);
      }
    }
  }
}

function connectable() {
  return function (target) {
    target.prototype.observeProperty = observeProperty;
    target.prototype.observeArray = observeArray;
    target.prototype.unobserve = unobserve;
    target.prototype.addObserver = addObserver;
  };
}

var queue = [];
var queued = {};
var nextId = 0;
var minimumImmediate = 100;
var frameBudget = 15;

var isFlushRequested = false;
var immediate = 0;

function flush(animationFrameStart) {
  var length = queue.length;
  var i = 0;
  while (i < length) {
    var binding = queue[i];
    queued[binding.__connectQueueId] = false;
    binding.connect(true);
    i++;

    if (i % 100 === 0 && PLATFORM.performance.now() - animationFrameStart > frameBudget) {
      break;
    }
  }
  queue.splice(0, i);

  if (queue.length) {
    PLATFORM.requestAnimationFrame(flush);
  } else {
    isFlushRequested = false;
    immediate = 0;
  }
}

function enqueueBindingConnect(binding) {
  if (immediate < minimumImmediate) {
    immediate++;
    binding.connect(false);
  } else {
    var id = binding.__connectQueueId;
    if (id === undefined) {
      id = nextId;
      nextId++;
      binding.__connectQueueId = id;
    }

    if (!queued[id]) {
      queue.push(binding);
      queued[id] = true;
    }
  }
  if (!isFlushRequested) {
    isFlushRequested = true;
    PLATFORM.requestAnimationFrame(flush);
  }
}

function addSubscriber(context, callable) {
  if (this.hasSubscriber(context, callable)) {
    return false;
  }
  if (!this._context0) {
    this._context0 = context;
    this._callable0 = callable;
    return true;
  }
  if (!this._context1) {
    this._context1 = context;
    this._callable1 = callable;
    return true;
  }
  if (!this._context2) {
    this._context2 = context;
    this._callable2 = callable;
    return true;
  }
  if (!this._contextsRest) {
    this._contextsRest = [context];
    this._callablesRest = [callable];
    return true;
  }
  this._contextsRest.push(context);
  this._callablesRest.push(callable);
  return true;
}

function removeSubscriber(context, callable) {
  if (this._context0 === context && this._callable0 === callable) {
    this._context0 = null;
    this._callable0 = null;
    return true;
  }
  if (this._context1 === context && this._callable1 === callable) {
    this._context1 = null;
    this._callable1 = null;
    return true;
  }
  if (this._context2 === context && this._callable2 === callable) {
    this._context2 = null;
    this._callable2 = null;
    return true;
  }
  var callables = this._callablesRest;
  if (callables === undefined || callables.length === 0) {
    return false;
  }
  var contexts = this._contextsRest;
  var i = 0;
  while (!(callables[i] === callable && contexts[i] === context) && callables.length > i) {
    i++;
  }
  if (i >= callables.length) {
    return false;
  }
  contexts.splice(i, 1);
  callables.splice(i, 1);
  return true;
}

var arrayPool1 = [];
var arrayPool2 = [];
var poolUtilization = [];

function callSubscribers(newValue, oldValue) {
  var context0 = this._context0;
  var callable0 = this._callable0;
  var context1 = this._context1;
  var callable1 = this._callable1;
  var context2 = this._context2;
  var callable2 = this._callable2;
  var length = this._contextsRest ? this._contextsRest.length : 0;
  var contextsRest = void 0;
  var callablesRest = void 0;
  var poolIndex = void 0;
  var i = void 0;
  if (length) {
    poolIndex = poolUtilization.length;
    while (poolIndex-- && poolUtilization[poolIndex]) {}
    if (poolIndex < 0) {
      poolIndex = poolUtilization.length;
      contextsRest = [];
      callablesRest = [];
      poolUtilization.push(true);
      arrayPool1.push(contextsRest);
      arrayPool2.push(callablesRest);
    } else {
      poolUtilization[poolIndex] = true;
      contextsRest = arrayPool1[poolIndex];
      callablesRest = arrayPool2[poolIndex];
    }

    i = length;
    while (i--) {
      contextsRest[i] = this._contextsRest[i];
      callablesRest[i] = this._callablesRest[i];
    }
  }

  if (context0) {
    if (callable0) {
      callable0.call(context0, newValue, oldValue);
    } else {
      context0(newValue, oldValue);
    }
  }
  if (context1) {
    if (callable1) {
      callable1.call(context1, newValue, oldValue);
    } else {
      context1(newValue, oldValue);
    }
  }
  if (context2) {
    if (callable2) {
      callable2.call(context2, newValue, oldValue);
    } else {
      context2(newValue, oldValue);
    }
  }
  if (length) {
    for (i = 0; i < length; i++) {
      var callable = callablesRest[i];
      var context = contextsRest[i];
      if (callable) {
        callable.call(context, newValue, oldValue);
      } else {
        context(newValue, oldValue);
      }
      contextsRest[i] = null;
      callablesRest[i] = null;
    }
    poolUtilization[poolIndex] = false;
  }
}

function hasSubscribers() {
  return !!(this._context0 || this._context1 || this._context2 || this._contextsRest && this._contextsRest.length);
}

function hasSubscriber(context, callable) {
  var has = this._context0 === context && this._callable0 === callable || this._context1 === context && this._callable1 === callable || this._context2 === context && this._callable2 === callable;
  if (has) {
    return true;
  }
  var index = void 0;
  var contexts = this._contextsRest;
  if (!contexts || (index = contexts.length) === 0) {
    return false;
  }
  var callables = this._callablesRest;
  while (index--) {
    if (contexts[index] === context && callables[index] === callable) {
      return true;
    }
  }
  return false;
}

function subscriberCollection() {
  return function (target) {
    target.prototype.addSubscriber = addSubscriber;
    target.prototype.removeSubscriber = removeSubscriber;
    target.prototype.callSubscribers = callSubscribers;
    target.prototype.hasSubscribers = hasSubscribers;
    target.prototype.hasSubscriber = hasSubscriber;
  };
}

var ExpressionObserver = (_dec = connectable(), _dec2 = subscriberCollection(), _dec(_class = _dec2(_class = function () {
  function ExpressionObserver(scope, expression, observerLocator, lookupFunctions) {
    

    this.scope = scope;
    this.expression = expression;
    this.observerLocator = observerLocator;
    this.lookupFunctions = lookupFunctions;
  }

  ExpressionObserver.prototype.getValue = function getValue() {
    return this.expression.evaluate(this.scope, this.lookupFunctions);
  };

  ExpressionObserver.prototype.setValue = function setValue(newValue) {
    this.expression.assign(this.scope, newValue);
  };

  ExpressionObserver.prototype.subscribe = function subscribe(context, callable) {
    var _this = this;

    if (!this.hasSubscribers()) {
      this.oldValue = this.expression.evaluate(this.scope, this.lookupFunctions);
      this.expression.connect(this, this.scope);
    }
    this.addSubscriber(context, callable);
    if (arguments.length === 1 && context instanceof Function) {
      return {
        dispose: function dispose() {
          _this.unsubscribe(context, callable);
        }
      };
    }
  };

  ExpressionObserver.prototype.unsubscribe = function unsubscribe(context, callable) {
    if (this.removeSubscriber(context, callable) && !this.hasSubscribers()) {
      this.unobserve(true);
      this.oldValue = undefined;
    }
  };

  ExpressionObserver.prototype.call = function call() {
    var newValue = this.expression.evaluate(this.scope, this.lookupFunctions);
    var oldValue = this.oldValue;
    if (newValue !== oldValue) {
      this.oldValue = newValue;
      this.callSubscribers(newValue, oldValue);
    }
    this._version++;
    this.expression.connect(this, this.scope);
    this.unobserve(false);
  };

  return ExpressionObserver;
}()) || _class) || _class);

function isIndex(s) {
  return +s === s >>> 0;
}

function toNumber(s) {
  return +s;
}

function newSplice(index, removed, addedCount) {
  return {
    index: index,
    removed: removed,
    addedCount: addedCount
  };
}

var EDIT_LEAVE = 0;
var EDIT_UPDATE = 1;
var EDIT_ADD = 2;
var EDIT_DELETE = 3;

function ArraySplice() {}

ArraySplice.prototype = {
  calcEditDistances: function calcEditDistances(current, currentStart, currentEnd, old, oldStart, oldEnd) {
    var rowCount = oldEnd - oldStart + 1;
    var columnCount = currentEnd - currentStart + 1;
    var distances = new Array(rowCount);
    var north = void 0;
    var west = void 0;

    for (var i = 0; i < rowCount; ++i) {
      distances[i] = new Array(columnCount);
      distances[i][0] = i;
    }

    for (var j = 0; j < columnCount; ++j) {
      distances[0][j] = j;
    }

    for (var _i = 1; _i < rowCount; ++_i) {
      for (var _j = 1; _j < columnCount; ++_j) {
        if (this.equals(current[currentStart + _j - 1], old[oldStart + _i - 1])) {
          distances[_i][_j] = distances[_i - 1][_j - 1];
        } else {
          north = distances[_i - 1][_j] + 1;
          west = distances[_i][_j - 1] + 1;
          distances[_i][_j] = north < west ? north : west;
        }
      }
    }

    return distances;
  },

  spliceOperationsFromEditDistances: function spliceOperationsFromEditDistances(distances) {
    var i = distances.length - 1;
    var j = distances[0].length - 1;
    var current = distances[i][j];
    var edits = [];
    while (i > 0 || j > 0) {
      if (i === 0) {
        edits.push(EDIT_ADD);
        j--;
        continue;
      }
      if (j === 0) {
        edits.push(EDIT_DELETE);
        i--;
        continue;
      }
      var northWest = distances[i - 1][j - 1];
      var west = distances[i - 1][j];
      var north = distances[i][j - 1];

      var min = void 0;
      if (west < north) {
        min = west < northWest ? west : northWest;
      } else {
        min = north < northWest ? north : northWest;
      }

      if (min === northWest) {
        if (northWest === current) {
          edits.push(EDIT_LEAVE);
        } else {
          edits.push(EDIT_UPDATE);
          current = northWest;
        }
        i--;
        j--;
      } else if (min === west) {
        edits.push(EDIT_DELETE);
        i--;
        current = west;
      } else {
        edits.push(EDIT_ADD);
        j--;
        current = north;
      }
    }

    edits.reverse();
    return edits;
  },

  calcSplices: function calcSplices(current, currentStart, currentEnd, old, oldStart, oldEnd) {
    var prefixCount = 0;
    var suffixCount = 0;

    var minLength = Math.min(currentEnd - currentStart, oldEnd - oldStart);
    if (currentStart === 0 && oldStart === 0) {
      prefixCount = this.sharedPrefix(current, old, minLength);
    }

    if (currentEnd === current.length && oldEnd === old.length) {
      suffixCount = this.sharedSuffix(current, old, minLength - prefixCount);
    }

    currentStart += prefixCount;
    oldStart += prefixCount;
    currentEnd -= suffixCount;
    oldEnd -= suffixCount;

    if (currentEnd - currentStart === 0 && oldEnd - oldStart === 0) {
      return [];
    }

    if (currentStart === currentEnd) {
      var _splice = newSplice(currentStart, [], 0);
      while (oldStart < oldEnd) {
        _splice.removed.push(old[oldStart++]);
      }

      return [_splice];
    } else if (oldStart === oldEnd) {
      return [newSplice(currentStart, [], currentEnd - currentStart)];
    }

    var ops = this.spliceOperationsFromEditDistances(this.calcEditDistances(current, currentStart, currentEnd, old, oldStart, oldEnd));

    var splice = undefined;
    var splices = [];
    var index = currentStart;
    var oldIndex = oldStart;
    for (var i = 0; i < ops.length; ++i) {
      switch (ops[i]) {
        case EDIT_LEAVE:
          if (splice) {
            splices.push(splice);
            splice = undefined;
          }

          index++;
          oldIndex++;
          break;
        case EDIT_UPDATE:
          if (!splice) {
            splice = newSplice(index, [], 0);
          }

          splice.addedCount++;
          index++;

          splice.removed.push(old[oldIndex]);
          oldIndex++;
          break;
        case EDIT_ADD:
          if (!splice) {
            splice = newSplice(index, [], 0);
          }

          splice.addedCount++;
          index++;
          break;
        case EDIT_DELETE:
          if (!splice) {
            splice = newSplice(index, [], 0);
          }

          splice.removed.push(old[oldIndex]);
          oldIndex++;
          break;
      }
    }

    if (splice) {
      splices.push(splice);
    }
    return splices;
  },

  sharedPrefix: function sharedPrefix(current, old, searchLength) {
    for (var i = 0; i < searchLength; ++i) {
      if (!this.equals(current[i], old[i])) {
        return i;
      }
    }

    return searchLength;
  },

  sharedSuffix: function sharedSuffix(current, old, searchLength) {
    var index1 = current.length;
    var index2 = old.length;
    var count = 0;
    while (count < searchLength && this.equals(current[--index1], old[--index2])) {
      count++;
    }

    return count;
  },

  calculateSplices: function calculateSplices(current, previous) {
    return this.calcSplices(current, 0, current.length, previous, 0, previous.length);
  },

  equals: function equals(currentValue, previousValue) {
    return currentValue === previousValue;
  }
};

var arraySplice = new ArraySplice();

function calcSplices(current, currentStart, currentEnd, old, oldStart, oldEnd) {
  return arraySplice.calcSplices(current, currentStart, currentEnd, old, oldStart, oldEnd);
}

function intersect(start1, end1, start2, end2) {
  if (end1 < start2 || end2 < start1) {
    return -1;
  }

  if (end1 === start2 || end2 === start1) {
    return 0;
  }

  if (start1 < start2) {
    if (end1 < end2) {
      return end1 - start2;
    }

    return end2 - start2;
  }

  if (end2 < end1) {
    return end2 - start1;
  }

  return end1 - start1;
}

function mergeSplice(splices, index, removed, addedCount) {
  var splice = newSplice(index, removed, addedCount);

  var inserted = false;
  var insertionOffset = 0;

  for (var i = 0; i < splices.length; i++) {
    var current = splices[i];
    current.index += insertionOffset;

    if (inserted) {
      continue;
    }

    var intersectCount = intersect(splice.index, splice.index + splice.removed.length, current.index, current.index + current.addedCount);

    if (intersectCount >= 0) {

      splices.splice(i, 1);
      i--;

      insertionOffset -= current.addedCount - current.removed.length;

      splice.addedCount += current.addedCount - intersectCount;
      var deleteCount = splice.removed.length + current.removed.length - intersectCount;

      if (!splice.addedCount && !deleteCount) {
        inserted = true;
      } else {
        var currentRemoved = current.removed;

        if (splice.index < current.index) {
          var prepend = splice.removed.slice(0, current.index - splice.index);
          Array.prototype.push.apply(prepend, currentRemoved);
          currentRemoved = prepend;
        }

        if (splice.index + splice.removed.length > current.index + current.addedCount) {
          var append = splice.removed.slice(current.index + current.addedCount - splice.index);
          Array.prototype.push.apply(currentRemoved, append);
        }

        splice.removed = currentRemoved;
        if (current.index < splice.index) {
          splice.index = current.index;
        }
      }
    } else if (splice.index < current.index) {

      inserted = true;

      splices.splice(i, 0, splice);
      i++;

      var offset = splice.addedCount - splice.removed.length;
      current.index += offset;
      insertionOffset += offset;
    }
  }

  if (!inserted) {
    splices.push(splice);
  }
}

function createInitialSplices(array, changeRecords) {
  var splices = [];

  for (var i = 0; i < changeRecords.length; i++) {
    var record = changeRecords[i];
    switch (record.type) {
      case 'splice':
        mergeSplice(splices, record.index, record.removed.slice(), record.addedCount);
        break;
      case 'add':
      case 'update':
      case 'delete':
        if (!isIndex(record.name)) {
          continue;
        }

        var index = toNumber(record.name);
        if (index < 0) {
          continue;
        }

        mergeSplice(splices, index, [record.oldValue], record.type === 'delete' ? 0 : 1);
        break;
      default:
        console.error('Unexpected record type: ' + JSON.stringify(record));
        break;
    }
  }

  return splices;
}

function projectArraySplices(array, changeRecords) {
  var splices = [];

  createInitialSplices(array, changeRecords).forEach(function (splice) {
    if (splice.addedCount === 1 && splice.removed.length === 1) {
      if (splice.removed[0] !== array[splice.index]) {
        splices.push(splice);
      }

      return;
    }

    splices = splices.concat(calcSplices(array, splice.index, splice.index + splice.addedCount, splice.removed, 0, splice.removed.length));
  });

  return splices;
}

function newRecord(type, object, key, oldValue) {
  return {
    type: type,
    object: object,
    key: key,
    oldValue: oldValue
  };
}

function getChangeRecords(map) {
  var entries = new Array(map.size);
  var keys = map.keys();
  var i = 0;
  var item = void 0;

  while (item = keys.next()) {
    if (item.done) {
      break;
    }

    entries[i] = newRecord('added', map, item.value);
    i++;
  }

  return entries;
}

var ModifyCollectionObserver = (_dec3 = subscriberCollection(), _dec3(_class2 = function () {
  function ModifyCollectionObserver(taskQueue, collection) {
    

    this.taskQueue = taskQueue;
    this.queued = false;
    this.changeRecords = null;
    this.oldCollection = null;
    this.collection = collection;
    this.lengthPropertyName = collection instanceof Map || collection instanceof Set ? 'size' : 'length';
  }

  ModifyCollectionObserver.prototype.subscribe = function subscribe(context, callable) {
    this.addSubscriber(context, callable);
  };

  ModifyCollectionObserver.prototype.unsubscribe = function unsubscribe(context, callable) {
    this.removeSubscriber(context, callable);
  };

  ModifyCollectionObserver.prototype.addChangeRecord = function addChangeRecord(changeRecord) {
    if (!this.hasSubscribers() && !this.lengthObserver) {
      return;
    }

    if (changeRecord.type === 'splice') {
      var index = changeRecord.index;
      var arrayLength = changeRecord.object.length;
      if (index > arrayLength) {
        index = arrayLength - changeRecord.addedCount;
      } else if (index < 0) {
        index = arrayLength + changeRecord.removed.length + index - changeRecord.addedCount;
      }
      if (index < 0) {
        index = 0;
      }
      changeRecord.index = index;
    }

    if (this.changeRecords === null) {
      this.changeRecords = [changeRecord];
    } else {
      this.changeRecords.push(changeRecord);
    }

    if (!this.queued) {
      this.queued = true;
      this.taskQueue.queueMicroTask(this);
    }
  };

  ModifyCollectionObserver.prototype.flushChangeRecords = function flushChangeRecords() {
    if (this.changeRecords && this.changeRecords.length || this.oldCollection) {
      this.call();
    }
  };

  ModifyCollectionObserver.prototype.reset = function reset$$1(oldCollection) {
    this.oldCollection = oldCollection;

    if (this.hasSubscribers() && !this.queued) {
      this.queued = true;
      this.taskQueue.queueMicroTask(this);
    }
  };

  ModifyCollectionObserver.prototype.getLengthObserver = function getLengthObserver() {
    return this.lengthObserver || (this.lengthObserver = new CollectionLengthObserver(this.collection));
  };

  ModifyCollectionObserver.prototype.call = function call() {
    var changeRecords = this.changeRecords;
    var oldCollection = this.oldCollection;
    var records = void 0;

    this.queued = false;
    this.changeRecords = [];
    this.oldCollection = null;

    if (this.hasSubscribers()) {
      if (oldCollection) {
        if (this.collection instanceof Map || this.collection instanceof Set) {
          records = getChangeRecords(oldCollection);
        } else {
          records = calcSplices(this.collection, 0, this.collection.length, oldCollection, 0, oldCollection.length);
        }
      } else {
        if (this.collection instanceof Map || this.collection instanceof Set) {
          records = changeRecords;
        } else {
          records = projectArraySplices(this.collection, changeRecords);
        }
      }

      this.callSubscribers(records);
    }

    if (this.lengthObserver) {
      this.lengthObserver.call(this.collection[this.lengthPropertyName]);
    }
  };

  return ModifyCollectionObserver;
}()) || _class2);

var CollectionLengthObserver = (_dec4 = subscriberCollection(), _dec4(_class3 = function () {
  function CollectionLengthObserver(collection) {
    

    this.collection = collection;
    this.lengthPropertyName = collection instanceof Map || collection instanceof Set ? 'size' : 'length';
    this.currentValue = collection[this.lengthPropertyName];
  }

  CollectionLengthObserver.prototype.getValue = function getValue() {
    return this.collection[this.lengthPropertyName];
  };

  CollectionLengthObserver.prototype.setValue = function setValue(newValue) {
    this.collection[this.lengthPropertyName] = newValue;
  };

  CollectionLengthObserver.prototype.subscribe = function subscribe(context, callable) {
    this.addSubscriber(context, callable);
  };

  CollectionLengthObserver.prototype.unsubscribe = function unsubscribe(context, callable) {
    this.removeSubscriber(context, callable);
  };

  CollectionLengthObserver.prototype.call = function call(newValue) {
    var oldValue = this.currentValue;
    this.callSubscribers(newValue, oldValue);
    this.currentValue = newValue;
  };

  return CollectionLengthObserver;
}()) || _class3);

var arrayProto = Array.prototype;
var pop = arrayProto.pop;
var push = arrayProto.push;
var reverse = arrayProto.reverse;
var shift = arrayProto.shift;
var sort = arrayProto.sort;
var splice = arrayProto.splice;
var unshift = arrayProto.unshift;

if (arrayProto.__au_patched__) {
  getLogger('array-observation').warn('Detected 2nd attempt of patching array from Aurelia binding.' + ' This is probably caused by dependency mismatch between core modules and a 3rd party plugin.' + ' Please see https://github.com/aurelia/cli/pull/906 if you are using webpack.');
} else {
  Reflect.defineProperty(arrayProto, '__au_patched__', { value: 1 });
  arrayProto.pop = function () {
    var notEmpty = this.length > 0;
    var methodCallResult = pop.apply(this, arguments);
    if (notEmpty && this.__array_observer__ !== undefined) {
      this.__array_observer__.addChangeRecord({
        type: 'delete',
        object: this,
        name: this.length,
        oldValue: methodCallResult
      });
    }
    return methodCallResult;
  };

  arrayProto.push = function () {
    var methodCallResult = push.apply(this, arguments);
    if (this.__array_observer__ !== undefined) {
      this.__array_observer__.addChangeRecord({
        type: 'splice',
        object: this,
        index: this.length - arguments.length,
        removed: [],
        addedCount: arguments.length
      });
    }
    return methodCallResult;
  };

  arrayProto.reverse = function () {
    var oldArray = void 0;
    if (this.__array_observer__ !== undefined) {
      this.__array_observer__.flushChangeRecords();
      oldArray = this.slice();
    }
    var methodCallResult = reverse.apply(this, arguments);
    if (this.__array_observer__ !== undefined) {
      this.__array_observer__.reset(oldArray);
    }
    return methodCallResult;
  };

  arrayProto.shift = function () {
    var notEmpty = this.length > 0;
    var methodCallResult = shift.apply(this, arguments);
    if (notEmpty && this.__array_observer__ !== undefined) {
      this.__array_observer__.addChangeRecord({
        type: 'delete',
        object: this,
        name: 0,
        oldValue: methodCallResult
      });
    }
    return methodCallResult;
  };

  arrayProto.sort = function () {
    var oldArray = void 0;
    if (this.__array_observer__ !== undefined) {
      this.__array_observer__.flushChangeRecords();
      oldArray = this.slice();
    }
    var methodCallResult = sort.apply(this, arguments);
    if (this.__array_observer__ !== undefined) {
      this.__array_observer__.reset(oldArray);
    }
    return methodCallResult;
  };

  arrayProto.splice = function () {
    var methodCallResult = splice.apply(this, arguments);
    if (this.__array_observer__ !== undefined) {
      this.__array_observer__.addChangeRecord({
        type: 'splice',
        object: this,
        index: +arguments[0],
        removed: methodCallResult,
        addedCount: arguments.length > 2 ? arguments.length - 2 : 0
      });
    }
    return methodCallResult;
  };

  arrayProto.unshift = function () {
    var methodCallResult = unshift.apply(this, arguments);
    if (this.__array_observer__ !== undefined) {
      this.__array_observer__.addChangeRecord({
        type: 'splice',
        object: this,
        index: 0,
        removed: [],
        addedCount: arguments.length
      });
    }
    return methodCallResult;
  };
}

function _getArrayObserver(taskQueue, array) {
  return ModifyArrayObserver.for(taskQueue, array);
}

var ModifyArrayObserver = function (_ModifyCollectionObse) {
  _inherits(ModifyArrayObserver, _ModifyCollectionObse);

  function ModifyArrayObserver(taskQueue, array) {
    

    return _possibleConstructorReturn(this, _ModifyCollectionObse.call(this, taskQueue, array));
  }

  ModifyArrayObserver.for = function _for(taskQueue, array) {
    if (!('__array_observer__' in array)) {
      Reflect.defineProperty(array, '__array_observer__', {
        value: ModifyArrayObserver.create(taskQueue, array),
        enumerable: false, configurable: false
      });
    }
    return array.__array_observer__;
  };

  ModifyArrayObserver.create = function create(taskQueue, array) {
    return new ModifyArrayObserver(taskQueue, array);
  };

  return ModifyArrayObserver;
}(ModifyCollectionObserver);

var Expression = function () {
  function Expression() {
    

    this.isAssignable = false;
  }

  Expression.prototype.evaluate = function evaluate(scope, lookupFunctions, args) {
    throw new Error('Binding expression "' + this + '" cannot be evaluated.');
  };

  Expression.prototype.assign = function assign(scope, value, lookupFunctions) {
    throw new Error('Binding expression "' + this + '" cannot be assigned to.');
  };

  Expression.prototype.toString = function toString() {
    return typeof FEATURE_NO_UNPARSER === 'undefined' ? _Unparser.unparse(this) : Function.prototype.toString.call(this);
  };

  return Expression;
}();

var BindingBehavior = function (_Expression) {
  _inherits(BindingBehavior, _Expression);

  function BindingBehavior(expression, name, args) {
    

    var _this3 = _possibleConstructorReturn(this, _Expression.call(this));

    _this3.expression = expression;
    _this3.name = name;
    _this3.args = args;
    return _this3;
  }

  BindingBehavior.prototype.evaluate = function evaluate(scope, lookupFunctions) {
    return this.expression.evaluate(scope, lookupFunctions);
  };

  BindingBehavior.prototype.assign = function assign(scope, value, lookupFunctions) {
    return this.expression.assign(scope, value, lookupFunctions);
  };

  BindingBehavior.prototype.accept = function accept(visitor) {
    return visitor.visitBindingBehavior(this);
  };

  BindingBehavior.prototype.connect = function connect(binding, scope) {
    this.expression.connect(binding, scope);
  };

  BindingBehavior.prototype.bind = function bind(binding, scope, lookupFunctions) {
    if (this.expression.expression && this.expression.bind) {
      this.expression.bind(binding, scope, lookupFunctions);
    }
    var behavior = lookupFunctions.bindingBehaviors(this.name);
    if (!behavior) {
      throw new Error('No BindingBehavior named "' + this.name + '" was found!');
    }
    var behaviorKey = 'behavior-' + this.name;
    if (binding[behaviorKey]) {
      throw new Error('A binding behavior named "' + this.name + '" has already been applied to "' + this.expression + '"');
    }
    binding[behaviorKey] = behavior;
    behavior.bind.apply(behavior, [binding, scope].concat(evalList(scope, this.args, binding.lookupFunctions)));
  };

  BindingBehavior.prototype.unbind = function unbind(binding, scope) {
    var behaviorKey = 'behavior-' + this.name;
    binding[behaviorKey].unbind(binding, scope);
    binding[behaviorKey] = null;
    if (this.expression.expression && this.expression.unbind) {
      this.expression.unbind(binding, scope);
    }
  };

  return BindingBehavior;
}(Expression);

var ValueConverter = function (_Expression2) {
  _inherits(ValueConverter, _Expression2);

  function ValueConverter(expression, name, args) {
    

    var _this4 = _possibleConstructorReturn(this, _Expression2.call(this));

    _this4.expression = expression;
    _this4.name = name;
    _this4.args = args;
    _this4.allArgs = [expression].concat(args);
    return _this4;
  }

  ValueConverter.prototype.evaluate = function evaluate(scope, lookupFunctions) {
    var converter = lookupFunctions.valueConverters(this.name);
    if (!converter) {
      throw new Error('No ValueConverter named "' + this.name + '" was found!');
    }

    if ('toView' in converter) {
      return converter.toView.apply(converter, evalList(scope, this.allArgs, lookupFunctions));
    }

    return this.allArgs[0].evaluate(scope, lookupFunctions);
  };

  ValueConverter.prototype.assign = function assign(scope, value, lookupFunctions) {
    var converter = lookupFunctions.valueConverters(this.name);
    if (!converter) {
      throw new Error('No ValueConverter named "' + this.name + '" was found!');
    }

    if ('fromView' in converter) {
      value = converter.fromView.apply(converter, [value].concat(evalList(scope, this.args, lookupFunctions)));
    }

    return this.allArgs[0].assign(scope, value, lookupFunctions);
  };

  ValueConverter.prototype.accept = function accept(visitor) {
    return visitor.visitValueConverter(this);
  };

  ValueConverter.prototype.connect = function connect(binding, scope) {
    var expressions = this.allArgs;
    var i = expressions.length;
    while (i--) {
      expressions[i].connect(binding, scope);
    }
    var converter = binding.lookupFunctions.valueConverters(this.name);
    if (!converter) {
      throw new Error('No ValueConverter named "' + this.name + '" was found!');
    }
    var signals = converter.signals;
    if (signals === undefined) {
      return;
    }
    i = signals.length;
    while (i--) {
      connectBindingToSignal(binding, signals[i]);
    }
  };

  return ValueConverter;
}(Expression);

var Assign = function (_Expression3) {
  _inherits(Assign, _Expression3);

  function Assign(target, value) {
    

    var _this5 = _possibleConstructorReturn(this, _Expression3.call(this));

    _this5.target = target;
    _this5.value = value;
    _this5.isAssignable = true;
    return _this5;
  }

  Assign.prototype.evaluate = function evaluate(scope, lookupFunctions) {
    return this.target.assign(scope, this.value.evaluate(scope, lookupFunctions));
  };

  Assign.prototype.accept = function accept(vistor) {
    vistor.visitAssign(this);
  };

  Assign.prototype.connect = function connect(binding, scope) {};

  Assign.prototype.assign = function assign(scope, value) {
    this.value.assign(scope, value);
    this.target.assign(scope, value);
  };

  return Assign;
}(Expression);

var Conditional = function (_Expression4) {
  _inherits(Conditional, _Expression4);

  function Conditional(condition, yes, no) {
    

    var _this6 = _possibleConstructorReturn(this, _Expression4.call(this));

    _this6.condition = condition;
    _this6.yes = yes;
    _this6.no = no;
    return _this6;
  }

  Conditional.prototype.evaluate = function evaluate(scope, lookupFunctions) {
    return !!this.condition.evaluate(scope, lookupFunctions) ? this.yes.evaluate(scope, lookupFunctions) : this.no.evaluate(scope, lookupFunctions);
  };

  Conditional.prototype.accept = function accept(visitor) {
    return visitor.visitConditional(this);
  };

  Conditional.prototype.connect = function connect(binding, scope) {
    this.condition.connect(binding, scope);
    if (this.condition.evaluate(scope)) {
      this.yes.connect(binding, scope);
    } else {
      this.no.connect(binding, scope);
    }
  };

  return Conditional;
}(Expression);

var AccessThis = function (_Expression5) {
  _inherits(AccessThis, _Expression5);

  function AccessThis(ancestor) {
    

    var _this7 = _possibleConstructorReturn(this, _Expression5.call(this));

    _this7.ancestor = ancestor;
    return _this7;
  }

  AccessThis.prototype.evaluate = function evaluate(scope, lookupFunctions) {
    var oc = scope.overrideContext;
    var i = this.ancestor;
    while (i-- && oc) {
      oc = oc.parentOverrideContext;
    }
    return i < 1 && oc ? oc.bindingContext : undefined;
  };

  AccessThis.prototype.accept = function accept(visitor) {
    return visitor.visitAccessThis(this);
  };

  AccessThis.prototype.connect = function connect(binding, scope) {};

  return AccessThis;
}(Expression);

var AccessScope = function (_Expression6) {
  _inherits(AccessScope, _Expression6);

  function AccessScope(name, ancestor) {
    

    var _this8 = _possibleConstructorReturn(this, _Expression6.call(this));

    _this8.name = name;
    _this8.ancestor = ancestor;
    _this8.isAssignable = true;
    return _this8;
  }

  AccessScope.prototype.evaluate = function evaluate(scope, lookupFunctions) {
    var context = getContextFor(this.name, scope, this.ancestor);
    return context[this.name];
  };

  AccessScope.prototype.assign = function assign(scope, value) {
    var context = getContextFor(this.name, scope, this.ancestor);
    return context ? context[this.name] = value : undefined;
  };

  AccessScope.prototype.accept = function accept(visitor) {
    return visitor.visitAccessScope(this);
  };

  AccessScope.prototype.connect = function connect(binding, scope) {
    var context = getContextFor(this.name, scope, this.ancestor);
    binding.observeProperty(context, this.name);
  };

  return AccessScope;
}(Expression);

var AccessMember = function (_Expression7) {
  _inherits(AccessMember, _Expression7);

  function AccessMember(object, name) {
    

    var _this9 = _possibleConstructorReturn(this, _Expression7.call(this));

    _this9.object = object;
    _this9.name = name;
    _this9.isAssignable = true;
    return _this9;
  }

  AccessMember.prototype.evaluate = function evaluate(scope, lookupFunctions) {
    var instance = this.object.evaluate(scope, lookupFunctions);
    return instance === null || instance === undefined ? instance : instance[this.name];
  };

  AccessMember.prototype.assign = function assign(scope, value) {
    var instance = this.object.evaluate(scope);

    if (instance === null || instance === undefined) {
      instance = {};
      this.object.assign(scope, instance);
    }

    instance[this.name] = value;
    return value;
  };

  AccessMember.prototype.accept = function accept(visitor) {
    return visitor.visitAccessMember(this);
  };

  AccessMember.prototype.connect = function connect(binding, scope) {
    this.object.connect(binding, scope);
    var obj = this.object.evaluate(scope);
    if (obj) {
      binding.observeProperty(obj, this.name);
    }
  };

  return AccessMember;
}(Expression);

var AccessKeyed = function (_Expression8) {
  _inherits(AccessKeyed, _Expression8);

  function AccessKeyed(object, key) {
    

    var _this10 = _possibleConstructorReturn(this, _Expression8.call(this));

    _this10.object = object;
    _this10.key = key;
    _this10.isAssignable = true;
    return _this10;
  }

  AccessKeyed.prototype.evaluate = function evaluate(scope, lookupFunctions) {
    var instance = this.object.evaluate(scope, lookupFunctions);
    var lookup = this.key.evaluate(scope, lookupFunctions);
    return getKeyed(instance, lookup);
  };

  AccessKeyed.prototype.assign = function assign(scope, value) {
    var instance = this.object.evaluate(scope);
    var lookup = this.key.evaluate(scope);
    return setKeyed(instance, lookup, value);
  };

  AccessKeyed.prototype.accept = function accept(visitor) {
    return visitor.visitAccessKeyed(this);
  };

  AccessKeyed.prototype.connect = function connect(binding, scope) {
    this.object.connect(binding, scope);
    var obj = this.object.evaluate(scope);
    if (obj instanceof Object) {
      this.key.connect(binding, scope);
      var key = this.key.evaluate(scope);

      if (key !== null && key !== undefined && !(Array.isArray(obj) && typeof key === 'number')) {
        binding.observeProperty(obj, key);
      }
    }
  };

  return AccessKeyed;
}(Expression);

var CallScope = function (_Expression9) {
  _inherits(CallScope, _Expression9);

  function CallScope(name, args, ancestor) {
    

    var _this11 = _possibleConstructorReturn(this, _Expression9.call(this));

    _this11.name = name;
    _this11.args = args;
    _this11.ancestor = ancestor;
    return _this11;
  }

  CallScope.prototype.evaluate = function evaluate(scope, lookupFunctions, mustEvaluate) {
    var args = evalList(scope, this.args, lookupFunctions);
    var context = getContextFor(this.name, scope, this.ancestor);
    var func = getFunction(context, this.name, mustEvaluate);
    if (func) {
      return func.apply(context, args);
    }
    return undefined;
  };

  CallScope.prototype.accept = function accept(visitor) {
    return visitor.visitCallScope(this);
  };

  CallScope.prototype.connect = function connect(binding, scope) {
    var args = this.args;
    var i = args.length;
    while (i--) {
      args[i].connect(binding, scope);
    }
  };

  return CallScope;
}(Expression);

var CallMember = function (_Expression10) {
  _inherits(CallMember, _Expression10);

  function CallMember(object, name, args) {
    

    var _this12 = _possibleConstructorReturn(this, _Expression10.call(this));

    _this12.object = object;
    _this12.name = name;
    _this12.args = args;
    return _this12;
  }

  CallMember.prototype.evaluate = function evaluate(scope, lookupFunctions, mustEvaluate) {
    var instance = this.object.evaluate(scope, lookupFunctions);
    var args = evalList(scope, this.args, lookupFunctions);
    var func = getFunction(instance, this.name, mustEvaluate);
    if (func) {
      return func.apply(instance, args);
    }
    return undefined;
  };

  CallMember.prototype.accept = function accept(visitor) {
    return visitor.visitCallMember(this);
  };

  CallMember.prototype.connect = function connect(binding, scope) {
    this.object.connect(binding, scope);
    var obj = this.object.evaluate(scope);
    if (getFunction(obj, this.name, false)) {
      var args = this.args;
      var i = args.length;
      while (i--) {
        args[i].connect(binding, scope);
      }
    }
  };

  return CallMember;
}(Expression);

var CallFunction = function (_Expression11) {
  _inherits(CallFunction, _Expression11);

  function CallFunction(func, args) {
    

    var _this13 = _possibleConstructorReturn(this, _Expression11.call(this));

    _this13.func = func;
    _this13.args = args;
    return _this13;
  }

  CallFunction.prototype.evaluate = function evaluate(scope, lookupFunctions, mustEvaluate) {
    var func = this.func.evaluate(scope, lookupFunctions);
    if (typeof func === 'function') {
      return func.apply(null, evalList(scope, this.args, lookupFunctions));
    }
    if (!mustEvaluate && (func === null || func === undefined)) {
      return undefined;
    }
    throw new Error(this.func + ' is not a function');
  };

  CallFunction.prototype.accept = function accept(visitor) {
    return visitor.visitCallFunction(this);
  };

  CallFunction.prototype.connect = function connect(binding, scope) {
    this.func.connect(binding, scope);
    var func = this.func.evaluate(scope);
    if (typeof func === 'function') {
      var args = this.args;
      var i = args.length;
      while (i--) {
        args[i].connect(binding, scope);
      }
    }
  };

  return CallFunction;
}(Expression);

var Binary = function (_Expression12) {
  _inherits(Binary, _Expression12);

  function Binary(operation, left, right) {
    

    var _this14 = _possibleConstructorReturn(this, _Expression12.call(this));

    _this14.operation = operation;
    _this14.left = left;
    _this14.right = right;
    return _this14;
  }

  Binary.prototype.evaluate = function evaluate(scope, lookupFunctions) {
    var left = this.left.evaluate(scope, lookupFunctions);

    switch (this.operation) {
      case '&&':
        return left && this.right.evaluate(scope, lookupFunctions);
      case '||':
        return left || this.right.evaluate(scope, lookupFunctions);
    }

    var right = this.right.evaluate(scope, lookupFunctions);

    switch (this.operation) {
      case '==':
        return left == right;
      case '===':
        return left === right;
      case '!=':
        return left != right;
      case '!==':
        return left !== right;
      case 'instanceof':
        return typeof right === 'function' && left instanceof right;
      case 'in':
        return (typeof right === 'undefined' ? 'undefined' : _typeof$3(right)) === 'object' && right !== null && left in right;
    }

    if (left === null || right === null || left === undefined || right === undefined) {
      switch (this.operation) {
        case '+':
          if (left !== null && left !== undefined) return left;
          if (right !== null && right !== undefined) return right;
          return 0;
        case '-':
          if (left !== null && left !== undefined) return left;
          if (right !== null && right !== undefined) return 0 - right;
          return 0;
      }

      return null;
    }

    switch (this.operation) {
      case '+':
        return autoConvertAdd(left, right);
      case '-':
        return left - right;
      case '*':
        return left * right;
      case '/':
        return left / right;
      case '%':
        return left % right;
      case '<':
        return left < right;
      case '>':
        return left > right;
      case '<=':
        return left <= right;
      case '>=':
        return left >= right;
      case '^':
        return left ^ right;
    }

    throw new Error('Internal error [' + this.operation + '] not handled');
  };

  Binary.prototype.accept = function accept(visitor) {
    return visitor.visitBinary(this);
  };

  Binary.prototype.connect = function connect(binding, scope) {
    this.left.connect(binding, scope);
    var left = this.left.evaluate(scope);
    if (this.operation === '&&' && !left || this.operation === '||' && left) {
      return;
    }
    this.right.connect(binding, scope);
  };

  return Binary;
}(Expression);

var Unary = function (_Expression13) {
  _inherits(Unary, _Expression13);

  function Unary(operation, expression) {
    

    var _this15 = _possibleConstructorReturn(this, _Expression13.call(this));

    _this15.operation = operation;
    _this15.expression = expression;
    return _this15;
  }

  Unary.prototype.evaluate = function evaluate(scope, lookupFunctions) {
    switch (this.operation) {
      case '!':
        return !this.expression.evaluate(scope, lookupFunctions);
      case 'typeof':
        return _typeof$3(this.expression.evaluate(scope, lookupFunctions));
      case 'void':
        return void this.expression.evaluate(scope, lookupFunctions);
    }

    throw new Error('Internal error [' + this.operation + '] not handled');
  };

  Unary.prototype.accept = function accept(visitor) {
    return visitor.visitPrefix(this);
  };

  Unary.prototype.connect = function connect(binding, scope) {
    this.expression.connect(binding, scope);
  };

  return Unary;
}(Expression);

var LiteralPrimitive = function (_Expression14) {
  _inherits(LiteralPrimitive, _Expression14);

  function LiteralPrimitive(value) {
    

    var _this16 = _possibleConstructorReturn(this, _Expression14.call(this));

    _this16.value = value;
    return _this16;
  }

  LiteralPrimitive.prototype.evaluate = function evaluate(scope, lookupFunctions) {
    return this.value;
  };

  LiteralPrimitive.prototype.accept = function accept(visitor) {
    return visitor.visitLiteralPrimitive(this);
  };

  LiteralPrimitive.prototype.connect = function connect(binding, scope) {};

  return LiteralPrimitive;
}(Expression);

var LiteralString = function (_Expression15) {
  _inherits(LiteralString, _Expression15);

  function LiteralString(value) {
    

    var _this17 = _possibleConstructorReturn(this, _Expression15.call(this));

    _this17.value = value;
    return _this17;
  }

  LiteralString.prototype.evaluate = function evaluate(scope, lookupFunctions) {
    return this.value;
  };

  LiteralString.prototype.accept = function accept(visitor) {
    return visitor.visitLiteralString(this);
  };

  LiteralString.prototype.connect = function connect(binding, scope) {};

  return LiteralString;
}(Expression);

var LiteralTemplate = function (_Expression16) {
  _inherits(LiteralTemplate, _Expression16);

  function LiteralTemplate(cooked, expressions, raw, tag) {
    

    var _this18 = _possibleConstructorReturn(this, _Expression16.call(this));

    _this18.cooked = cooked;
    _this18.expressions = expressions || [];
    _this18.length = _this18.expressions.length;
    _this18.tagged = tag !== undefined;
    if (_this18.tagged) {
      _this18.cooked.raw = raw;
      _this18.tag = tag;
      if (tag instanceof AccessScope) {
        _this18.contextType = 'Scope';
      } else if (tag instanceof AccessMember || tag instanceof AccessKeyed) {
        _this18.contextType = 'Object';
      } else {
        throw new Error(_this18.tag + ' is not a valid template tag');
      }
    }
    return _this18;
  }

  LiteralTemplate.prototype.getScopeContext = function getScopeContext(scope, lookupFunctions) {
    return getContextFor(this.tag.name, scope, this.tag.ancestor);
  };

  LiteralTemplate.prototype.getObjectContext = function getObjectContext(scope, lookupFunctions) {
    return this.tag.object.evaluate(scope, lookupFunctions);
  };

  LiteralTemplate.prototype.evaluate = function evaluate(scope, lookupFunctions, mustEvaluate) {
    var results = new Array(this.length);
    for (var i = 0; i < this.length; i++) {
      results[i] = this.expressions[i].evaluate(scope, lookupFunctions);
    }
    if (this.tagged) {
      var func = this.tag.evaluate(scope, lookupFunctions);
      if (typeof func === 'function') {
        var context = this['get' + this.contextType + 'Context'](scope, lookupFunctions);
        return func.call.apply(func, [context, this.cooked].concat(results));
      }
      if (!mustEvaluate) {
        return null;
      }
      throw new Error(this.tag + ' is not a function');
    }
    var result = this.cooked[0];
    for (var _i2 = 0; _i2 < this.length; _i2++) {
      result = String.prototype.concat(result, results[_i2], this.cooked[_i2 + 1]);
    }
    return result;
  };

  LiteralTemplate.prototype.accept = function accept(visitor) {
    return visitor.visitLiteralTemplate(this);
  };

  LiteralTemplate.prototype.connect = function connect(binding, scope) {
    for (var i = 0; i < this.length; i++) {
      this.expressions[i].connect(binding, scope);
    }
    if (this.tagged) {
      this.tag.connect(binding, scope);
    }
  };

  return LiteralTemplate;
}(Expression);

var LiteralArray = function (_Expression17) {
  _inherits(LiteralArray, _Expression17);

  function LiteralArray(elements$$1) {
    

    var _this19 = _possibleConstructorReturn(this, _Expression17.call(this));

    _this19.elements = elements$$1;
    return _this19;
  }

  LiteralArray.prototype.evaluate = function evaluate(scope, lookupFunctions) {
    var elements$$1 = this.elements;
    var result = [];

    for (var i = 0, length = elements$$1.length; i < length; ++i) {
      result[i] = elements$$1[i].evaluate(scope, lookupFunctions);
    }

    return result;
  };

  LiteralArray.prototype.accept = function accept(visitor) {
    return visitor.visitLiteralArray(this);
  };

  LiteralArray.prototype.connect = function connect(binding, scope) {
    var length = this.elements.length;
    for (var i = 0; i < length; i++) {
      this.elements[i].connect(binding, scope);
    }
  };

  return LiteralArray;
}(Expression);

var LiteralObject = function (_Expression18) {
  _inherits(LiteralObject, _Expression18);

  function LiteralObject(keys, values) {
    

    var _this20 = _possibleConstructorReturn(this, _Expression18.call(this));

    _this20.keys = keys;
    _this20.values = values;
    return _this20;
  }

  LiteralObject.prototype.evaluate = function evaluate(scope, lookupFunctions) {
    var instance = {};
    var keys = this.keys;
    var values = this.values;

    for (var i = 0, length = keys.length; i < length; ++i) {
      instance[keys[i]] = values[i].evaluate(scope, lookupFunctions);
    }

    return instance;
  };

  LiteralObject.prototype.accept = function accept(visitor) {
    return visitor.visitLiteralObject(this);
  };

  LiteralObject.prototype.connect = function connect(binding, scope) {
    var length = this.keys.length;
    for (var i = 0; i < length; i++) {
      this.values[i].connect(binding, scope);
    }
  };

  return LiteralObject;
}(Expression);

function evalList(scope, list, lookupFunctions) {
  var length = list.length;
  var result = [];
  for (var i = 0; i < length; i++) {
    result[i] = list[i].evaluate(scope, lookupFunctions);
  }
  return result;
}

function autoConvertAdd(a, b) {
  if (a !== null && b !== null) {
    if (typeof a === 'string' && typeof b !== 'string') {
      return a + b.toString();
    }

    if (typeof a !== 'string' && typeof b === 'string') {
      return a.toString() + b;
    }

    return a + b;
  }

  if (a !== null) {
    return a;
  }

  if (b !== null) {
    return b;
  }

  return 0;
}

function getFunction(obj, name, mustExist) {
  var func = obj === null || obj === undefined ? null : obj[name];
  if (typeof func === 'function') {
    return func;
  }
  if (!mustExist && (func === null || func === undefined)) {
    return null;
  }
  throw new Error(name + ' is not a function');
}

function getKeyed(obj, key) {
  if (Array.isArray(obj)) {
    return obj[parseInt(key, 10)];
  } else if (obj) {
    return obj[key];
  } else if (obj === null || obj === undefined) {
    return undefined;
  }

  return obj[key];
}

function setKeyed(obj, key, value) {
  if (Array.isArray(obj)) {
    var index = parseInt(key, 10);

    if (obj.length <= index) {
      obj.length = index + 1;
    }

    obj[index] = value;
  } else {
    obj[key] = value;
  }

  return value;
}

var _Unparser = null;
if (typeof FEATURE_NO_UNPARSER === 'undefined') {
  _Unparser = function () {
    function Unparser(buffer) {
      

      this.buffer = buffer;
    }

    Unparser.unparse = function unparse(expression) {
      var buffer = [];
      var visitor = new _Unparser(buffer);

      expression.accept(visitor);

      return buffer.join('');
    };

    Unparser.prototype.write = function write(text) {
      this.buffer.push(text);
    };

    Unparser.prototype.writeArgs = function writeArgs(args) {
      this.write('(');

      for (var i = 0, length = args.length; i < length; ++i) {
        if (i !== 0) {
          this.write(',');
        }

        args[i].accept(this);
      }

      this.write(')');
    };

    Unparser.prototype.visitBindingBehavior = function visitBindingBehavior(behavior) {
      var args = behavior.args;

      behavior.expression.accept(this);
      this.write('&' + behavior.name);

      for (var i = 0, length = args.length; i < length; ++i) {
        this.write(':');
        args[i].accept(this);
      }
    };

    Unparser.prototype.visitValueConverter = function visitValueConverter(converter) {
      var args = converter.args;

      converter.expression.accept(this);
      this.write('|' + converter.name);

      for (var i = 0, length = args.length; i < length; ++i) {
        this.write(':');
        args[i].accept(this);
      }
    };

    Unparser.prototype.visitAssign = function visitAssign(assign) {
      assign.target.accept(this);
      this.write('=');
      assign.value.accept(this);
    };

    Unparser.prototype.visitConditional = function visitConditional(conditional) {
      conditional.condition.accept(this);
      this.write('?');
      conditional.yes.accept(this);
      this.write(':');
      conditional.no.accept(this);
    };

    Unparser.prototype.visitAccessThis = function visitAccessThis(access) {
      if (access.ancestor === 0) {
        this.write('$this');
        return;
      }
      this.write('$parent');
      var i = access.ancestor - 1;
      while (i--) {
        this.write('.$parent');
      }
    };

    Unparser.prototype.visitAccessScope = function visitAccessScope(access) {
      var i = access.ancestor;
      while (i--) {
        this.write('$parent.');
      }
      this.write(access.name);
    };

    Unparser.prototype.visitAccessMember = function visitAccessMember(access) {
      access.object.accept(this);
      this.write('.' + access.name);
    };

    Unparser.prototype.visitAccessKeyed = function visitAccessKeyed(access) {
      access.object.accept(this);
      this.write('[');
      access.key.accept(this);
      this.write(']');
    };

    Unparser.prototype.visitCallScope = function visitCallScope(call) {
      var i = call.ancestor;
      while (i--) {
        this.write('$parent.');
      }
      this.write(call.name);
      this.writeArgs(call.args);
    };

    Unparser.prototype.visitCallFunction = function visitCallFunction(call) {
      call.func.accept(this);
      this.writeArgs(call.args);
    };

    Unparser.prototype.visitCallMember = function visitCallMember(call) {
      call.object.accept(this);
      this.write('.' + call.name);
      this.writeArgs(call.args);
    };

    Unparser.prototype.visitPrefix = function visitPrefix(prefix) {
      this.write('(' + prefix.operation);
      if (prefix.operation.charCodeAt(0) >= 97) {
        this.write(' ');
      }
      prefix.expression.accept(this);
      this.write(')');
    };

    Unparser.prototype.visitBinary = function visitBinary(binary) {
      binary.left.accept(this);
      if (binary.operation.charCodeAt(0) === 105) {
        this.write(' ' + binary.operation + ' ');
      } else {
        this.write(binary.operation);
      }
      binary.right.accept(this);
    };

    Unparser.prototype.visitLiteralPrimitive = function visitLiteralPrimitive(literal) {
      this.write('' + literal.value);
    };

    Unparser.prototype.visitLiteralArray = function visitLiteralArray(literal) {
      var elements$$1 = literal.elements;

      this.write('[');

      for (var i = 0, length = elements$$1.length; i < length; ++i) {
        if (i !== 0) {
          this.write(',');
        }

        elements$$1[i].accept(this);
      }

      this.write(']');
    };

    Unparser.prototype.visitLiteralObject = function visitLiteralObject(literal) {
      var keys = literal.keys;
      var values = literal.values;

      this.write('{');

      for (var i = 0, length = keys.length; i < length; ++i) {
        if (i !== 0) {
          this.write(',');
        }

        this.write('\'' + keys[i] + '\':');
        values[i].accept(this);
      }

      this.write('}');
    };

    Unparser.prototype.visitLiteralString = function visitLiteralString(literal) {
      var escaped = literal.value.replace(/'/g, "\'");
      this.write('\'' + escaped + '\'');
    };

    Unparser.prototype.visitLiteralTemplate = function visitLiteralTemplate(literal) {
      var cooked = literal.cooked,
          expressions = literal.expressions;

      var length = expressions.length;
      this.write('`');
      this.write(cooked[0]);
      for (var i = 0; i < length; i++) {
        expressions[i].accept(this);
        this.write(cooked[i + 1]);
      }
      this.write('`');
    };

    return Unparser;
  }();
}

var bindingMode = {
  oneTime: 0,
  toView: 1,
  oneWay: 1,
  twoWay: 2,
  fromView: 3
};

var Parser = function () {
  function Parser() {
    

    this.cache = Object.create(null);
  }

  Parser.prototype.parse = function parse(src) {
    src = src || '';

    return this.cache[src] || (this.cache[src] = new ParserImplementation(src).parseBindingBehavior());
  };

  return Parser;
}();

var fromCharCode = String.fromCharCode;

var ParserImplementation = function () {
  _createClass$1(ParserImplementation, [{
    key: 'raw',
    get: function get() {
      return this.src.slice(this.start, this.idx);
    }
  }]);

  function ParserImplementation(src) {
    

    this.idx = 0;

    this.start = 0;

    this.src = src;
    this.len = src.length;

    this.tkn = T$EOF;

    this.val = undefined;

    this.ch = src.charCodeAt(0);
  }

  ParserImplementation.prototype.parseBindingBehavior = function parseBindingBehavior() {
    this.nextToken();
    if (this.tkn & T$ExpressionTerminal) {
      this.err('Invalid start of expression');
    }
    var result = this.parseValueConverter();
    while (this.opt(T$Ampersand)) {
      result = new BindingBehavior(result, this.val, this.parseVariadicArgs());
    }
    if (this.tkn !== T$EOF) {
      this.err('Unconsumed token ' + this.raw);
    }
    return result;
  };

  ParserImplementation.prototype.parseValueConverter = function parseValueConverter() {
    var result = this.parseExpression();
    while (this.opt(T$Bar)) {
      result = new ValueConverter(result, this.val, this.parseVariadicArgs());
    }
    return result;
  };

  ParserImplementation.prototype.parseVariadicArgs = function parseVariadicArgs() {
    this.nextToken();
    var result = [];
    while (this.opt(T$Colon)) {
      result.push(this.parseExpression());
    }
    return result;
  };

  ParserImplementation.prototype.parseExpression = function parseExpression() {
    var exprStart = this.idx;
    var result = this.parseConditional();

    while (this.tkn === T$Eq) {
      if (!result.isAssignable) {
        this.err('Expression ' + this.src.slice(exprStart, this.start) + ' is not assignable');
      }
      this.nextToken();
      exprStart = this.idx;
      result = new Assign(result, this.parseConditional());
    }
    return result;
  };

  ParserImplementation.prototype.parseConditional = function parseConditional() {
    var result = this.parseBinary(0);

    if (this.opt(T$Question)) {
      var yes = this.parseExpression();
      this.expect(T$Colon);
      result = new Conditional(result, yes, this.parseExpression());
    }
    return result;
  };

  ParserImplementation.prototype.parseBinary = function parseBinary(minPrecedence) {
    var left = this.parseLeftHandSide(0);

    while (this.tkn & T$BinaryOp) {
      var opToken = this.tkn;
      if ((opToken & T$Precedence) <= minPrecedence) {
        break;
      }
      this.nextToken();
      left = new Binary(TokenValues[opToken & T$TokenMask], left, this.parseBinary(opToken & T$Precedence));
    }
    return left;
  };

  ParserImplementation.prototype.parseLeftHandSide = function parseLeftHandSide(context) {
    var result = void 0;

    primary: switch (this.tkn) {
      case T$Plus:
        this.nextToken();
        return this.parseLeftHandSide(0);
      case T$Minus:
        this.nextToken();
        return new Binary('-', new LiteralPrimitive(0), this.parseLeftHandSide(0));
      case T$Bang:
      case T$TypeofKeyword:
      case T$VoidKeyword:
        var op = TokenValues[this.tkn & T$TokenMask];
        this.nextToken();
        return new Unary(op, this.parseLeftHandSide(0));
      case T$ParentScope:
        {
          do {
            this.nextToken();
            context++;
            if (this.opt(T$Period)) {
              if (this.tkn === T$Period) {
                this.err();
              }
              continue;
            } else if (this.tkn & T$AccessScopeTerminal) {
              result = new AccessThis(context & C$Ancestor);

              context = context & C$ShorthandProp | C$This;
              break primary;
            } else {
              this.err();
            }
          } while (this.tkn === T$ParentScope);
        }

      case T$Identifier:
        {
          result = new AccessScope(this.val, context & C$Ancestor);
          this.nextToken();
          context = context & C$ShorthandProp | C$Scope;
          break;
        }
      case T$ThisScope:
        this.nextToken();
        result = new AccessThis(0);
        context = context & C$ShorthandProp | C$This;
        break;
      case T$LParen:
        this.nextToken();
        result = this.parseExpression();
        this.expect(T$RParen);
        context = C$Primary;
        break;
      case T$LBracket:
        {
          this.nextToken();
          var _elements = [];
          if (this.tkn !== T$RBracket) {
            do {
              _elements.push(this.parseExpression());
            } while (this.opt(T$Comma));
          }
          this.expect(T$RBracket);
          result = new LiteralArray(_elements);
          context = C$Primary;
          break;
        }
      case T$LBrace:
        {
          var keys = [];
          var values = [];
          this.nextToken();
          while (this.tkn !== T$RBrace) {
            if (this.tkn & T$IdentifierOrKeyword) {
              var ch = this.ch,
                  tkn = this.tkn,
                  idx = this.idx;

              keys.push(this.val);
              this.nextToken();
              if (this.opt(T$Colon)) {
                values.push(this.parseExpression());
              } else {
                this.ch = ch;
                this.tkn = tkn;
                this.idx = idx;
                values.push(this.parseLeftHandSide(C$ShorthandProp));
              }
            } else if (this.tkn & T$Literal) {
              keys.push(this.val);
              this.nextToken();
              this.expect(T$Colon);
              values.push(this.parseExpression());
            } else {
              this.err();
            }
            if (this.tkn !== T$RBrace) {
              this.expect(T$Comma);
            }
          }
          this.expect(T$RBrace);
          result = new LiteralObject(keys, values);
          context = C$Primary;
          break;
        }
      case T$StringLiteral:
        result = new LiteralString(this.val);
        this.nextToken();
        context = C$Primary;
        break;
      case T$TemplateTail:
        result = new LiteralTemplate([this.val]);
        this.nextToken();
        context = C$Primary;
        break;
      case T$TemplateContinuation:
        result = this.parseTemplate(0);
        context = C$Primary;
        break;
      case T$NumericLiteral:
        {
          result = new LiteralPrimitive(this.val);
          this.nextToken();

          break;
        }
      case T$NullKeyword:
      case T$UndefinedKeyword:
      case T$TrueKeyword:
      case T$FalseKeyword:
        result = new LiteralPrimitive(TokenValues[this.tkn & T$TokenMask]);
        this.nextToken();
        context = C$Primary;
        break;
      default:
        if (this.idx >= this.len) {
          this.err('Unexpected end of expression');
        } else {
          this.err();
        }
    }

    if (context & C$ShorthandProp) {
      return result;
    }

    var name = this.val;
    while (this.tkn & T$MemberOrCallExpression) {
      switch (this.tkn) {
        case T$Period:
          this.nextToken();
          if (!(this.tkn & T$IdentifierOrKeyword)) {
            this.err();
          }
          name = this.val;
          this.nextToken();

          context = context & C$Primary | (context & (C$This | C$Scope)) << 1 | context & C$Member | (context & C$Keyed) >> 1 | (context & C$Call) >> 2;
          if (this.tkn === T$LParen) {
            continue;
          }
          if (context & C$Scope) {
            result = new AccessScope(name, result.ancestor);
          } else {
            result = new AccessMember(result, name);
          }
          continue;
        case T$LBracket:
          this.nextToken();
          context = C$Keyed;
          result = new AccessKeyed(result, this.parseExpression());
          this.expect(T$RBracket);
          break;
        case T$LParen:
          this.nextToken();
          var args = [];
          while (this.tkn !== T$RParen) {
            args.push(this.parseExpression());
            if (!this.opt(T$Comma)) {
              break;
            }
          }
          this.expect(T$RParen);
          if (context & C$Scope) {
            result = new CallScope(name, args, result.ancestor);
          } else if (context & (C$Member | C$Primary)) {
            result = new CallMember(result, name, args);
          } else {
            result = new CallFunction(result, args);
          }
          context = C$Call;
          break;
        case T$TemplateTail:
          result = new LiteralTemplate([this.val], [], [this.raw], result);
          this.nextToken();
          break;
        case T$TemplateContinuation:
          result = this.parseTemplate(context | C$Tagged, result);
      }
    }

    return result;
  };

  ParserImplementation.prototype.parseTemplate = function parseTemplate(context, func) {
    var cooked = [this.val];
    var raw = context & C$Tagged ? [this.raw] : undefined;
    this.expect(T$TemplateContinuation);
    var expressions = [this.parseExpression()];

    while ((this.tkn = this.scanTemplateTail()) !== T$TemplateTail) {
      cooked.push(this.val);
      if (context & C$Tagged) {
        raw.push(this.raw);
      }
      this.expect(T$TemplateContinuation);
      expressions.push(this.parseExpression());
    }

    cooked.push(this.val);
    if (context & C$Tagged) {
      raw.push(this.raw);
    }
    this.nextToken();
    return new LiteralTemplate(cooked, expressions, raw, func);
  };

  ParserImplementation.prototype.nextToken = function nextToken() {
    while (this.idx < this.len) {
      if (this.ch <= 0x20) {
        this.next();
        continue;
      }
      this.start = this.idx;
      if (this.ch === 0x24 || this.ch >= 0x61 && this.ch <= 0x7A) {
        this.tkn = this.scanIdentifier();
        return;
      }

      if ((this.tkn = CharScanners[this.ch](this)) !== null) {
        return;
      }
    }
    this.tkn = T$EOF;
  };

  ParserImplementation.prototype.next = function next() {
    return this.ch = this.src.charCodeAt(++this.idx);
  };

  ParserImplementation.prototype.scanIdentifier = function scanIdentifier() {
    while (AsciiIdParts.has(this.next()) || this.ch > 0x7F && IdParts[this.ch]) {}

    return KeywordLookup[this.val = this.raw] || T$Identifier;
  };

  ParserImplementation.prototype.scanNumber = function scanNumber(isFloat) {
    if (isFloat) {
      this.val = 0;
    } else {
      this.val = this.ch - 0x30;
      while (this.next() <= 0x39 && this.ch >= 0x30) {
        this.val = this.val * 10 + this.ch - 0x30;
      }
    }

    if (isFloat || this.ch === 0x2E) {
      if (!isFloat) {
        this.next();
      }
      var start = this.idx;
      var value = this.ch - 0x30;
      while (this.next() <= 0x39 && this.ch >= 0x30) {
        value = value * 10 + this.ch - 0x30;
      }
      this.val = this.val + value / Math.pow(10, this.idx - start);
    }

    if (this.ch === 0x65 || this.ch === 0x45) {
      var _start = this.idx;

      this.next();
      if (this.ch === 0x2D || this.ch === 0x2B) {
        this.next();
      }

      if (!(this.ch >= 0x30 && this.ch <= 0x39)) {
        this.idx = _start;
        this.err('Invalid exponent');
      }
      while (this.next() <= 0x39 && this.ch >= 0x30) {}
      this.val = parseFloat(this.src.slice(this.start, this.idx));
    }

    return T$NumericLiteral;
  };

  ParserImplementation.prototype.scanString = function scanString() {
    var quote = this.ch;
    this.next();

    var buffer = void 0;
    var marker = this.idx;

    while (this.ch !== quote) {
      if (this.ch === 0x5C) {
        if (!buffer) {
          buffer = [];
        }

        buffer.push(this.src.slice(marker, this.idx));

        this.next();

        var _unescaped = void 0;

        if (this.ch === 0x75) {
          this.next();

          if (this.idx + 4 < this.len) {
            var hex = this.src.slice(this.idx, this.idx + 4);

            if (!/[A-Z0-9]{4}/i.test(hex)) {
              this.err('Invalid unicode escape [\\u' + hex + ']');
            }

            _unescaped = parseInt(hex, 16);
            this.idx += 4;
            this.ch = this.src.charCodeAt(this.idx);
          } else {
            this.err();
          }
        } else {
          _unescaped = unescape(this.ch);
          this.next();
        }

        buffer.push(fromCharCode(_unescaped));
        marker = this.idx;
      } else if (this.ch === 0 || this.idx >= this.len) {
        this.err('Unterminated quote');
      } else {
        this.next();
      }
    }

    var last = this.src.slice(marker, this.idx);
    this.next();
    var unescaped = last;

    if (buffer !== null && buffer !== undefined) {
      buffer.push(last);
      unescaped = buffer.join('');
    }

    this.val = unescaped;
    return T$StringLiteral;
  };

  ParserImplementation.prototype.scanTemplate = function scanTemplate() {
    var tail = true;
    var result = '';

    while (this.next() !== 0x60) {
      if (this.ch === 0x24) {
        if (this.idx + 1 < this.len && this.src.charCodeAt(this.idx + 1) === 0x7B) {
          this.idx++;
          tail = false;
          break;
        } else {
          result += '$';
        }
      } else if (this.ch === 0x5C) {
        result += fromCharCode(unescape(this.next()));
      } else if (this.ch === 0 || this.idx >= this.len) {
        this.err('Unterminated template literal');
      } else {
        result += fromCharCode(this.ch);
      }
    }

    this.next();
    this.val = result;
    if (tail) {
      return T$TemplateTail;
    }
    return T$TemplateContinuation;
  };

  ParserImplementation.prototype.scanTemplateTail = function scanTemplateTail() {
    if (this.idx >= this.len) {
      this.err('Unterminated template');
    }
    this.idx--;
    return this.scanTemplate();
  };

  ParserImplementation.prototype.err = function err() {
    var message = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'Unexpected token ' + this.raw;
    var column = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.start;

    throw new Error('Parser Error: ' + message + ' at column ' + column + ' in expression [' + this.src + ']');
  };

  ParserImplementation.prototype.opt = function opt(token) {
    if (this.tkn === token) {
      this.nextToken();
      return true;
    }

    return false;
  };

  ParserImplementation.prototype.expect = function expect(token) {
    if (this.tkn === token) {
      this.nextToken();
    } else {
      this.err('Missing expected token ' + TokenValues[token & T$TokenMask], this.idx);
    }
  };

  return ParserImplementation;
}();

function unescape(code) {
  switch (code) {
    case 0x66:
      return 0xC;
    case 0x6E:
      return 0xA;
    case 0x72:
      return 0xD;
    case 0x74:
      return 0x9;
    case 0x76:
      return 0xB;
    default:
      return code;
  }
}

var C$This = 1 << 10;
var C$Scope = 1 << 11;
var C$Member = 1 << 12;
var C$Keyed = 1 << 13;
var C$Call = 1 << 14;
var C$Primary = 1 << 15;
var C$ShorthandProp = 1 << 16;
var C$Tagged = 1 << 17;

var C$Ancestor = (1 << 9) - 1;

var T$TokenMask = (1 << 6) - 1;

var T$PrecShift = 6;

var T$Precedence = 7 << T$PrecShift;

var T$ExpressionTerminal = 1 << 11;

var T$ClosingToken = 1 << 12;

var T$OpeningToken = 1 << 13;

var T$AccessScopeTerminal = 1 << 14;
var T$Keyword = 1 << 15;
var T$EOF = 1 << 16 | T$AccessScopeTerminal | T$ExpressionTerminal;
var T$Identifier = 1 << 17;
var T$IdentifierOrKeyword = T$Identifier | T$Keyword;
var T$Literal = 1 << 18;
var T$NumericLiteral = 1 << 19 | T$Literal;
var T$StringLiteral = 1 << 20 | T$Literal;
var T$BinaryOp = 1 << 21;

var T$UnaryOp = 1 << 22;

var T$MemberExpression = 1 << 23;

var T$MemberOrCallExpression = 1 << 24;
var T$TemplateTail = 1 << 25 | T$MemberOrCallExpression;
var T$TemplateContinuation = 1 << 26 | T$MemberOrCallExpression;

var T$FalseKeyword = 0 | T$Keyword | T$Literal;
var T$TrueKeyword = 1 | T$Keyword | T$Literal;
var T$NullKeyword = 2 | T$Keyword | T$Literal;
var T$UndefinedKeyword = 3 | T$Keyword | T$Literal;
var T$ThisScope = 4 | T$IdentifierOrKeyword;
var T$ParentScope = 5 | T$IdentifierOrKeyword;

var T$LParen = 6 | T$OpeningToken | T$AccessScopeTerminal | T$MemberOrCallExpression;
var T$LBrace = 7 | T$OpeningToken;
var T$Period = 8 | T$MemberExpression | T$MemberOrCallExpression;
var T$RBrace = 9 | T$AccessScopeTerminal | T$ClosingToken | T$ExpressionTerminal;
var T$RParen = 10 | T$AccessScopeTerminal | T$ClosingToken | T$ExpressionTerminal;
var T$Comma = 11 | T$AccessScopeTerminal;
var T$LBracket = 12 | T$OpeningToken | T$AccessScopeTerminal | T$MemberExpression | T$MemberOrCallExpression;
var T$RBracket = 13 | T$ClosingToken | T$ExpressionTerminal;
var T$Colon = 14 | T$AccessScopeTerminal;
var T$Question = 15;

var T$Ampersand = 18 | T$AccessScopeTerminal;
var T$Bar = 19 | T$AccessScopeTerminal;
var T$BarBar = 20 | 1 << T$PrecShift | T$BinaryOp;
var T$AmpersandAmpersand = 21 | 2 << T$PrecShift | T$BinaryOp;
var T$Caret = 22 | 3 << T$PrecShift | T$BinaryOp;
var T$EqEq = 23 | 4 << T$PrecShift | T$BinaryOp;
var T$BangEq = 24 | 4 << T$PrecShift | T$BinaryOp;
var T$EqEqEq = 25 | 4 << T$PrecShift | T$BinaryOp;
var T$BangEqEq = 26 | 4 << T$PrecShift | T$BinaryOp;
var T$Lt = 27 | 5 << T$PrecShift | T$BinaryOp;
var T$Gt = 28 | 5 << T$PrecShift | T$BinaryOp;
var T$LtEq = 29 | 5 << T$PrecShift | T$BinaryOp;
var T$GtEq = 30 | 5 << T$PrecShift | T$BinaryOp;
var T$InKeyword = 31 | 5 << T$PrecShift | T$BinaryOp | T$Keyword;
var T$InstanceOfKeyword = 32 | 5 << T$PrecShift | T$BinaryOp | T$Keyword;
var T$Plus = 33 | 6 << T$PrecShift | T$BinaryOp | T$UnaryOp;
var T$Minus = 34 | 6 << T$PrecShift | T$BinaryOp | T$UnaryOp;
var T$TypeofKeyword = 35 | T$UnaryOp | T$Keyword;
var T$VoidKeyword = 36 | T$UnaryOp | T$Keyword;
var T$Star = 37 | 7 << T$PrecShift | T$BinaryOp;
var T$Percent = 38 | 7 << T$PrecShift | T$BinaryOp;
var T$Slash = 39 | 7 << T$PrecShift | T$BinaryOp;
var T$Eq = 40;
var T$Bang = 41 | T$UnaryOp;

var KeywordLookup = Object.create(null);
KeywordLookup.true = T$TrueKeyword;
KeywordLookup.null = T$NullKeyword;
KeywordLookup.false = T$FalseKeyword;
KeywordLookup.undefined = T$UndefinedKeyword;
KeywordLookup.$this = T$ThisScope;
KeywordLookup.$parent = T$ParentScope;
KeywordLookup.in = T$InKeyword;
KeywordLookup.instanceof = T$InstanceOfKeyword;
KeywordLookup.typeof = T$TypeofKeyword;
KeywordLookup.void = T$VoidKeyword;

var TokenValues = [false, true, null, undefined, '$this', '$parent', '(', '{', '.', '}', ')', ',', '[', ']', ':', '?', '\'', '"', '&', '|', '||', '&&', '^', '==', '!=', '===', '!==', '<', '>', '<=', '>=', 'in', 'instanceof', '+', '-', 'typeof', 'void', '*', '%', '/', '=', '!'];

var codes = {
  AsciiIdPart: [0x24, 0, 0x30, 0x3A, 0x41, 0x5B, 0x5F, 0, 0x61, 0x7B],
  IdStart: [0x24, 0, 0x41, 0x5B, 0x5F, 0, 0x61, 0x7B, 0xAA, 0, 0xBA, 0, 0xC0, 0xD7, 0xD8, 0xF7, 0xF8, 0x2B9, 0x2E0, 0x2E5, 0x1D00, 0x1D26, 0x1D2C, 0x1D5D, 0x1D62, 0x1D66, 0x1D6B, 0x1D78, 0x1D79, 0x1DBF, 0x1E00, 0x1F00, 0x2071, 0, 0x207F, 0, 0x2090, 0x209D, 0x212A, 0x212C, 0x2132, 0, 0x214E, 0, 0x2160, 0x2189, 0x2C60, 0x2C80, 0xA722, 0xA788, 0xA78B, 0xA7AF, 0xA7B0, 0xA7B8, 0xA7F7, 0xA800, 0xAB30, 0xAB5B, 0xAB5C, 0xAB65, 0xFB00, 0xFB07, 0xFF21, 0xFF3B, 0xFF41, 0xFF5B],
  Digit: [0x30, 0x3A],
  Skip: [0, 0x21, 0x7F, 0xA1]
};

function decompress(lookup, set, compressed, value) {
  var rangeCount = compressed.length;
  for (var i = 0; i < rangeCount; i += 2) {
    var start = compressed[i];
    var end = compressed[i + 1];
    end = end > 0 ? end : start + 1;
    if (lookup) {
      var j = start;
      while (j < end) {
        lookup[j] = value;
        j++;
      }
    }
    if (set) {
      for (var ch = start; ch < end; ch++) {
        set.add(ch);
      }
    }
  }
}

function returnToken(token) {
  return function (p) {
    p.next();
    return token;
  };
}
function unexpectedCharacter(p) {
  p.err('Unexpected character [' + fromCharCode(p.ch) + ']');
  return null;
}

var AsciiIdParts = new Set();
decompress(null, AsciiIdParts, codes.AsciiIdPart, true);

var IdParts = new Uint8Array(0xFFFF);
decompress(IdParts, null, codes.IdStart, 1);
decompress(IdParts, null, codes.Digit, 1);

var CharScanners = new Array(0xFFFF);
var ci = 0;
while (ci < 0xFFFF) {
  CharScanners[ci] = unexpectedCharacter;
  ci++;
}

decompress(CharScanners, null, codes.Skip, function (p) {
  p.next();
  return null;
});
decompress(CharScanners, null, codes.IdStart, function (p) {
  return p.scanIdentifier();
});
decompress(CharScanners, null, codes.Digit, function (p) {
  return p.scanNumber(false);
});

CharScanners[0x22] = CharScanners[0x27] = function (p) {
  return p.scanString();
};
CharScanners[0x60] = function (p) {
  return p.scanTemplate();
};

CharScanners[0x21] = function (p) {
  if (p.next() !== 0x3D) {
    return T$Bang;
  }
  if (p.next() !== 0x3D) {
    return T$BangEq;
  }
  p.next();
  return T$BangEqEq;
};

CharScanners[0x3D] = function (p) {
  if (p.next() !== 0x3D) {
    return T$Eq;
  }
  if (p.next() !== 0x3D) {
    return T$EqEq;
  }
  p.next();
  return T$EqEqEq;
};

CharScanners[0x26] = function (p) {
  if (p.next() !== 0x26) {
    return T$Ampersand;
  }
  p.next();
  return T$AmpersandAmpersand;
};

CharScanners[0x7C] = function (p) {
  if (p.next() !== 0x7C) {
    return T$Bar;
  }
  p.next();
  return T$BarBar;
};

CharScanners[0x2E] = function (p) {
  if (p.next() <= 0x39 && p.ch >= 0x30) {
    return p.scanNumber(true);
  }
  return T$Period;
};

CharScanners[0x3C] = function (p) {
  if (p.next() !== 0x3D) {
    return T$Lt;
  }
  p.next();
  return T$LtEq;
};

CharScanners[0x3E] = function (p) {
  if (p.next() !== 0x3D) {
    return T$Gt;
  }
  p.next();
  return T$GtEq;
};

CharScanners[0x25] = returnToken(T$Percent);
CharScanners[0x28] = returnToken(T$LParen);
CharScanners[0x29] = returnToken(T$RParen);
CharScanners[0x2A] = returnToken(T$Star);
CharScanners[0x2B] = returnToken(T$Plus);
CharScanners[0x2C] = returnToken(T$Comma);
CharScanners[0x2D] = returnToken(T$Minus);
CharScanners[0x2F] = returnToken(T$Slash);
CharScanners[0x3A] = returnToken(T$Colon);
CharScanners[0x3F] = returnToken(T$Question);
CharScanners[0x5B] = returnToken(T$LBracket);
CharScanners[0x5D] = returnToken(T$RBracket);
CharScanners[0x5E] = returnToken(T$Caret);
CharScanners[0x7B] = returnToken(T$LBrace);
CharScanners[0x7D] = returnToken(T$RBrace);

var mapProto = Map.prototype;

function _getMapObserver(taskQueue, map) {
  return ModifyMapObserver.for(taskQueue, map);
}

var ModifyMapObserver = function (_ModifyCollectionObse2) {
  _inherits(ModifyMapObserver, _ModifyCollectionObse2);

  function ModifyMapObserver(taskQueue, map) {
    

    return _possibleConstructorReturn(this, _ModifyCollectionObse2.call(this, taskQueue, map));
  }

  ModifyMapObserver.for = function _for(taskQueue, map) {
    if (!('__map_observer__' in map)) {
      Reflect.defineProperty(map, '__map_observer__', {
        value: ModifyMapObserver.create(taskQueue, map),
        enumerable: false, configurable: false
      });
    }
    return map.__map_observer__;
  };

  ModifyMapObserver.create = function create(taskQueue, map) {
    var observer = new ModifyMapObserver(taskQueue, map);

    var proto = mapProto;
    if (proto.set !== map.set || proto.delete !== map.delete || proto.clear !== map.clear) {
      proto = {
        set: map.set,
        delete: map.delete,
        clear: map.clear
      };
    }

    map.set = function () {
      var hasValue = map.has(arguments[0]);
      var type = hasValue ? 'update' : 'add';
      var oldValue = map.get(arguments[0]);
      var methodCallResult = proto.set.apply(map, arguments);
      if (!hasValue || oldValue !== map.get(arguments[0])) {
        observer.addChangeRecord({
          type: type,
          object: map,
          key: arguments[0],
          oldValue: oldValue
        });
      }
      return methodCallResult;
    };

    map.delete = function () {
      var hasValue = map.has(arguments[0]);
      var oldValue = map.get(arguments[0]);
      var methodCallResult = proto.delete.apply(map, arguments);
      if (hasValue) {
        observer.addChangeRecord({
          type: 'delete',
          object: map,
          key: arguments[0],
          oldValue: oldValue
        });
      }
      return methodCallResult;
    };

    map.clear = function () {
      var methodCallResult = proto.clear.apply(map, arguments);
      observer.addChangeRecord({
        type: 'clear',
        object: map
      });
      return methodCallResult;
    };

    return observer;
  };

  return ModifyMapObserver;
}(ModifyCollectionObserver);

var emLogger = getLogger('event-manager');

function findOriginalEventTarget(event) {
  return event.path && event.path[0] || event.deepPath && event.deepPath[0] || event.target;
}

function stopPropagation() {
  this.standardStopPropagation();
  this.propagationStopped = true;
}

function handleCapturedEvent(event) {
  event.propagationStopped = false;
  var target = findOriginalEventTarget(event);

  var orderedCallbacks = [];

  while (target) {
    if (target.capturedCallbacks) {
      var callback = target.capturedCallbacks[event.type];
      if (callback) {
        if (event.stopPropagation !== stopPropagation) {
          event.standardStopPropagation = event.stopPropagation;
          event.stopPropagation = stopPropagation;
        }
        orderedCallbacks.push(callback);
      }
    }
    target = target.parentNode;
  }
  for (var i = orderedCallbacks.length - 1; i >= 0 && !event.propagationStopped; i--) {
    var orderedCallback = orderedCallbacks[i];
    if ('handleEvent' in orderedCallback) {
      orderedCallback.handleEvent(event);
    } else {
      orderedCallback(event);
    }
  }
}

var CapturedHandlerEntry = function () {
  function CapturedHandlerEntry(eventName) {
    

    this.eventName = eventName;
    this.count = 0;
  }

  CapturedHandlerEntry.prototype.increment = function increment() {
    this.count++;

    if (this.count === 1) {
      DOM.addEventListener(this.eventName, handleCapturedEvent, true);
    }
  };

  CapturedHandlerEntry.prototype.decrement = function decrement() {
    if (this.count === 0) {
      emLogger.warn('The same EventListener was disposed multiple times.');
    } else if (--this.count === 0) {
      DOM.removeEventListener(this.eventName, handleCapturedEvent, true);
    }
  };

  return CapturedHandlerEntry;
}();

var DelegateHandlerEntry = function () {
  function DelegateHandlerEntry(eventName, eventManager) {
    

    this.eventName = eventName;
    this.count = 0;
    this.eventManager = eventManager;
  }

  DelegateHandlerEntry.prototype.handleEvent = function handleEvent(event) {
    event.propagationStopped = false;
    var target = findOriginalEventTarget(event);

    while (target && !event.propagationStopped) {
      if (target.delegatedCallbacks) {
        var callback = target.delegatedCallbacks[event.type];
        if (callback) {
          if (event.stopPropagation !== stopPropagation) {
            event.standardStopPropagation = event.stopPropagation;
            event.stopPropagation = stopPropagation;
          }
          if ('handleEvent' in callback) {
            callback.handleEvent(event);
          } else {
            callback(event);
          }
        }
      }

      var parent = target.parentNode;
      var shouldEscapeShadowRoot = this.eventManager.escapeShadowRoot && parent instanceof ShadowRoot;

      target = shouldEscapeShadowRoot ? parent.host : parent;
    }
  };

  DelegateHandlerEntry.prototype.increment = function increment() {
    this.count++;

    if (this.count === 1) {
      DOM.addEventListener(this.eventName, this, false);
    }
  };

  DelegateHandlerEntry.prototype.decrement = function decrement() {
    if (this.count === 0) {
      emLogger.warn('The same EventListener was disposed multiple times.');
    } else if (--this.count === 0) {
      DOM.removeEventListener(this.eventName, this, false);
    }
  };

  return DelegateHandlerEntry;
}();

var DelegationEntryHandler = function () {
  function DelegationEntryHandler(entry, lookup, targetEvent) {
    

    this.entry = entry;
    this.lookup = lookup;
    this.targetEvent = targetEvent;
  }

  DelegationEntryHandler.prototype.dispose = function dispose() {
    if (this.lookup[this.targetEvent]) {
      this.entry.decrement();
      this.lookup[this.targetEvent] = null;
    } else {
      emLogger.warn('Calling .dispose() on already disposed eventListener');
    }
  };

  return DelegationEntryHandler;
}();

var EventHandler = function () {
  function EventHandler(target, targetEvent, callback) {
    

    this.target = target;
    this.targetEvent = targetEvent;
    this.callback = callback;
  }

  EventHandler.prototype.dispose = function dispose() {
    this.target.removeEventListener(this.targetEvent, this.callback);
  };

  return EventHandler;
}();

var DefaultEventStrategy = function () {
  function DefaultEventStrategy(eventManager) {
    

    this.delegatedHandlers = {};
    this.capturedHandlers = {};

    this.eventManager = eventManager;
  }

  DefaultEventStrategy.prototype.subscribe = function subscribe(target, targetEvent, callback, strategy, disposable) {
    var delegatedHandlers = void 0;
    var capturedHandlers = void 0;
    var handlerEntry = void 0;

    if (strategy === delegationStrategy.bubbling) {
      delegatedHandlers = this.delegatedHandlers;
      handlerEntry = delegatedHandlers[targetEvent] || (delegatedHandlers[targetEvent] = new DelegateHandlerEntry(targetEvent, this.eventManager));
      var delegatedCallbacks = target.delegatedCallbacks || (target.delegatedCallbacks = {});
      if (!delegatedCallbacks[targetEvent]) {
        handlerEntry.increment();
      } else {
        emLogger.warn('Overriding previous callback for event listener', { event: targetEvent, callback: callback, previousCallback: delegatedCallbacks[targetEvent] });
      }
      delegatedCallbacks[targetEvent] = callback;

      if (disposable === true) {
        return new DelegationEntryHandler(handlerEntry, delegatedCallbacks, targetEvent);
      }

      return function () {
        handlerEntry.decrement();
        delegatedCallbacks[targetEvent] = null;
      };
    }
    if (strategy === delegationStrategy.capturing) {
      capturedHandlers = this.capturedHandlers;
      handlerEntry = capturedHandlers[targetEvent] || (capturedHandlers[targetEvent] = new CapturedHandlerEntry(targetEvent));
      var capturedCallbacks = target.capturedCallbacks || (target.capturedCallbacks = {});
      if (!capturedCallbacks[targetEvent]) {
        handlerEntry.increment();
      } else {
        emLogger.error('already have a callback for event', { event: targetEvent, callback: callback });
      }
      capturedCallbacks[targetEvent] = callback;

      if (disposable === true) {
        return new DelegationEntryHandler(handlerEntry, capturedCallbacks, targetEvent);
      }

      return function () {
        handlerEntry.decrement();
        capturedCallbacks[targetEvent] = null;
      };
    }

    target.addEventListener(targetEvent, callback);

    if (disposable === true) {
      return new EventHandler(target, targetEvent, callback);
    }

    return function () {
      target.removeEventListener(targetEvent, callback);
    };
  };

  return DefaultEventStrategy;
}();

var delegationStrategy = {
  none: 0,
  capturing: 1,
  bubbling: 2
};

var EventManager = function () {
  function EventManager() {
    var escapeShadowRoot = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

    

    this.elementHandlerLookup = {};
    this.eventStrategyLookup = {};
    this.escapeShadowRoot = escapeShadowRoot;

    this.registerElementConfig({
      tagName: 'input',
      properties: {
        value: ['change', 'input'],
        checked: ['change', 'input'],
        files: ['change', 'input']
      }
    });

    this.registerElementConfig({
      tagName: 'textarea',
      properties: {
        value: ['change', 'input']
      }
    });

    this.registerElementConfig({
      tagName: 'select',
      properties: {
        value: ['change']
      }
    });

    this.registerElementConfig({
      tagName: 'content editable',
      properties: {
        value: ['change', 'input', 'blur', 'keyup', 'paste']
      }
    });

    this.registerElementConfig({
      tagName: 'scrollable element',
      properties: {
        scrollTop: ['scroll'],
        scrollLeft: ['scroll']
      }
    });

    this.defaultEventStrategy = new DefaultEventStrategy(this);
  }

  EventManager.prototype.registerElementConfig = function registerElementConfig(config) {
    var tagName = config.tagName.toLowerCase();
    var properties = config.properties;
    var propertyName = void 0;

    var lookup = this.elementHandlerLookup[tagName] = {};

    for (propertyName in properties) {
      if (properties.hasOwnProperty(propertyName)) {
        lookup[propertyName] = properties[propertyName];
      }
    }
  };

  EventManager.prototype.registerEventStrategy = function registerEventStrategy(eventName, strategy) {
    this.eventStrategyLookup[eventName] = strategy;
  };

  EventManager.prototype.getElementHandler = function getElementHandler(target, propertyName) {
    var tagName = void 0;
    var lookup = this.elementHandlerLookup;

    if (target.tagName) {
      tagName = target.tagName.toLowerCase();

      if (lookup[tagName] && lookup[tagName][propertyName]) {
        return new EventSubscriber(lookup[tagName][propertyName]);
      }

      if (propertyName === 'textContent' || propertyName === 'innerHTML') {
        return new EventSubscriber(lookup['content editable'].value);
      }

      if (propertyName === 'scrollTop' || propertyName === 'scrollLeft') {
        return new EventSubscriber(lookup['scrollable element'][propertyName]);
      }
    }

    return null;
  };

  EventManager.prototype.addEventListener = function addEventListener(target, targetEvent, callbackOrListener, delegate, disposable) {
    return (this.eventStrategyLookup[targetEvent] || this.defaultEventStrategy).subscribe(target, targetEvent, callbackOrListener, delegate, disposable);
  };

  return EventManager;
}();

var EventSubscriber = function () {
  function EventSubscriber(events) {
    

    this.events = events;
    this.element = null;
    this.handler = null;
  }

  EventSubscriber.prototype.subscribe = function subscribe(element, callbackOrListener) {
    this.element = element;
    this.handler = callbackOrListener;

    var events = this.events;
    for (var i = 0, ii = events.length; ii > i; ++i) {
      element.addEventListener(events[i], callbackOrListener);
    }
  };

  EventSubscriber.prototype.dispose = function dispose() {
    if (this.element === null) {
      return;
    }
    var element = this.element;
    var callbackOrListener = this.handler;
    var events = this.events;
    for (var i = 0, ii = events.length; ii > i; ++i) {
      element.removeEventListener(events[i], callbackOrListener);
    }
    this.element = this.handler = null;
  };

  return EventSubscriber;
}();

var DirtyChecker = function () {
  function DirtyChecker() {
    

    this.tracked = [];
    this.checkDelay = 120;
  }

  DirtyChecker.prototype.addProperty = function addProperty(property) {
    var tracked = this.tracked;

    tracked.push(property);

    if (tracked.length === 1) {
      this.scheduleDirtyCheck();
    }
  };

  DirtyChecker.prototype.removeProperty = function removeProperty(property) {
    var tracked = this.tracked;
    tracked.splice(tracked.indexOf(property), 1);
  };

  DirtyChecker.prototype.scheduleDirtyCheck = function scheduleDirtyCheck() {
    var _this22 = this;

    setTimeout(function () {
      return _this22.check();
    }, this.checkDelay);
  };

  DirtyChecker.prototype.check = function check() {
    var tracked = this.tracked;
    var i = tracked.length;

    while (i--) {
      var current = tracked[i];

      if (current.isDirty()) {
        current.call();
      }
    }

    if (tracked.length) {
      this.scheduleDirtyCheck();
    }
  };

  return DirtyChecker;
}();

var DirtyCheckProperty = (_dec5 = subscriberCollection(), _dec5(_class5 = function () {
  function DirtyCheckProperty(dirtyChecker, obj, propertyName) {
    

    this.dirtyChecker = dirtyChecker;
    this.obj = obj;
    this.propertyName = propertyName;
  }

  DirtyCheckProperty.prototype.getValue = function getValue() {
    return this.obj[this.propertyName];
  };

  DirtyCheckProperty.prototype.setValue = function setValue(newValue) {
    this.obj[this.propertyName] = newValue;
  };

  DirtyCheckProperty.prototype.call = function call() {
    var oldValue = this.oldValue;
    var newValue = this.getValue();

    this.callSubscribers(newValue, oldValue);

    this.oldValue = newValue;
  };

  DirtyCheckProperty.prototype.isDirty = function isDirty() {
    return this.oldValue !== this.obj[this.propertyName];
  };

  DirtyCheckProperty.prototype.subscribe = function subscribe(context, callable) {
    if (!this.hasSubscribers()) {
      this.oldValue = this.getValue();
      this.dirtyChecker.addProperty(this);
    }
    this.addSubscriber(context, callable);
  };

  DirtyCheckProperty.prototype.unsubscribe = function unsubscribe(context, callable) {
    if (this.removeSubscriber(context, callable) && !this.hasSubscribers()) {
      this.dirtyChecker.removeProperty(this);
    }
  };

  return DirtyCheckProperty;
}()) || _class5);

var logger = getLogger('property-observation');

var propertyAccessor = {
  getValue: function getValue(obj, propertyName) {
    return obj[propertyName];
  },
  setValue: function setValue(value, obj, propertyName) {
    obj[propertyName] = value;
  }
};

var PrimitiveObserver = function () {
  function PrimitiveObserver(primitive, propertyName) {
    

    this.doNotCache = true;

    this.primitive = primitive;
    this.propertyName = propertyName;
  }

  PrimitiveObserver.prototype.getValue = function getValue() {
    return this.primitive[this.propertyName];
  };

  PrimitiveObserver.prototype.setValue = function setValue() {
    var type = _typeof$3(this.primitive);
    throw new Error('The ' + this.propertyName + ' property of a ' + type + ' (' + this.primitive + ') cannot be assigned.');
  };

  PrimitiveObserver.prototype.subscribe = function subscribe() {};

  PrimitiveObserver.prototype.unsubscribe = function unsubscribe() {};

  return PrimitiveObserver;
}();

var SetterObserver = (_dec6 = subscriberCollection(), _dec6(_class7 = function () {
  function SetterObserver(taskQueue, obj, propertyName) {
    

    this.taskQueue = taskQueue;
    this.obj = obj;
    this.propertyName = propertyName;
    this.queued = false;
    this.observing = false;
  }

  SetterObserver.prototype.getValue = function getValue() {
    return this.obj[this.propertyName];
  };

  SetterObserver.prototype.setValue = function setValue(newValue) {
    this.obj[this.propertyName] = newValue;
  };

  SetterObserver.prototype.getterValue = function getterValue() {
    return this.currentValue;
  };

  SetterObserver.prototype.setterValue = function setterValue(newValue) {
    var oldValue = this.currentValue;

    if (oldValue !== newValue) {
      if (!this.queued) {
        this.oldValue = oldValue;
        this.queued = true;
        this.taskQueue.queueMicroTask(this);
      }

      this.currentValue = newValue;
    }
  };

  SetterObserver.prototype.call = function call() {
    var oldValue = this.oldValue;
    var newValue = this.currentValue;

    this.queued = false;

    this.callSubscribers(newValue, oldValue);
  };

  SetterObserver.prototype.subscribe = function subscribe(context, callable) {
    if (!this.observing) {
      this.convertProperty();
    }
    this.addSubscriber(context, callable);
  };

  SetterObserver.prototype.unsubscribe = function unsubscribe(context, callable) {
    this.removeSubscriber(context, callable);
  };

  SetterObserver.prototype.convertProperty = function convertProperty() {
    this.observing = true;
    this.currentValue = this.obj[this.propertyName];
    this.setValue = this.setterValue;
    this.getValue = this.getterValue;

    if (!Reflect.defineProperty(this.obj, this.propertyName, {
      configurable: true,
      enumerable: this.propertyName in this.obj ? this.obj.propertyIsEnumerable(this.propertyName) : true,
      get: this.getValue.bind(this),
      set: this.setValue.bind(this)
    })) {
      logger.warn('Cannot observe property \'' + this.propertyName + '\' of object', this.obj);
    }
  };

  return SetterObserver;
}()) || _class7);

var XLinkAttributeObserver = function () {
  function XLinkAttributeObserver(element, propertyName, attributeName) {
    

    this.element = element;
    this.propertyName = propertyName;
    this.attributeName = attributeName;
  }

  XLinkAttributeObserver.prototype.getValue = function getValue() {
    return this.element.getAttributeNS('http://www.w3.org/1999/xlink', this.attributeName);
  };

  XLinkAttributeObserver.prototype.setValue = function setValue(newValue) {
    return this.element.setAttributeNS('http://www.w3.org/1999/xlink', this.attributeName, newValue);
  };

  XLinkAttributeObserver.prototype.subscribe = function subscribe() {
    throw new Error('Observation of a "' + this.element.nodeName + '" element\'s "' + this.propertyName + '" property is not supported.');
  };

  return XLinkAttributeObserver;
}();

var dataAttributeAccessor = {
  getValue: function getValue(obj, propertyName) {
    return obj.getAttribute(propertyName);
  },
  setValue: function setValue(value, obj, propertyName) {
    if (value === null || value === undefined) {
      obj.removeAttribute(propertyName);
    } else {
      obj.setAttribute(propertyName, value);
    }
  }
};

var DataAttributeObserver = function () {
  function DataAttributeObserver(element, propertyName) {
    

    this.element = element;
    this.propertyName = propertyName;
  }

  DataAttributeObserver.prototype.getValue = function getValue() {
    return this.element.getAttribute(this.propertyName);
  };

  DataAttributeObserver.prototype.setValue = function setValue(newValue) {
    if (newValue === null || newValue === undefined) {
      return this.element.removeAttribute(this.propertyName);
    }
    return this.element.setAttribute(this.propertyName, newValue);
  };

  DataAttributeObserver.prototype.subscribe = function subscribe() {
    throw new Error('Observation of a "' + this.element.nodeName + '" element\'s "' + this.propertyName + '" property is not supported.');
  };

  return DataAttributeObserver;
}();

var StyleObserver = function () {
  function StyleObserver(element, propertyName) {
    

    this.element = element;
    this.propertyName = propertyName;

    this.styles = null;
    this.version = 0;
  }

  StyleObserver.prototype.getValue = function getValue() {
    return this.element.style.cssText;
  };

  StyleObserver.prototype._setProperty = function _setProperty(style, value) {
    var priority = '';

    if (value !== null && value !== undefined && typeof value.indexOf === 'function' && value.indexOf('!important') !== -1) {
      priority = 'important';
      value = value.replace('!important', '');
    }
    this.element.style.setProperty(style, value, priority);
  };

  StyleObserver.prototype.setValue = function setValue(newValue) {
    var styles = this.styles || {};
    var style = void 0;
    var version = this.version;

    if (newValue !== null && newValue !== undefined) {
      if (newValue instanceof Object) {
        var value = void 0;
        for (style in newValue) {
          if (newValue.hasOwnProperty(style)) {
            value = newValue[style];
            style = style.replace(/([A-Z])/g, function (m) {
              return '-' + m.toLowerCase();
            });
            styles[style] = version;
            this._setProperty(style, value);
          }
        }
      } else if (newValue.length) {
        var rx = /\s*([\w\-]+)\s*:\s*((?:(?:[\w\-]+\(\s*(?:"(?:\\"|[^"])*"|'(?:\\'|[^'])*'|[\w\-]+\(\s*(?:^"(?:\\"|[^"])*"|'(?:\\'|[^'])*'|[^\)]*)\),?|[^\)]*)\),?|"(?:\\"|[^"])*"|'(?:\\'|[^'])*'|[^;]*),?\s*)+);?/g;
        var pair = void 0;
        while ((pair = rx.exec(newValue)) !== null) {
          style = pair[1];
          if (!style) {
            continue;
          }

          styles[style] = version;
          this._setProperty(style, pair[2]);
        }
      }
    }

    this.styles = styles;
    this.version += 1;

    if (version === 0) {
      return;
    }

    version -= 1;
    for (style in styles) {
      if (!styles.hasOwnProperty(style) || styles[style] !== version) {
        continue;
      }

      this.element.style.removeProperty(style);
    }
  };

  StyleObserver.prototype.subscribe = function subscribe() {
    throw new Error('Observation of a "' + this.element.nodeName + '" element\'s "' + this.propertyName + '" property is not supported.');
  };

  return StyleObserver;
}();

var ValueAttributeObserver = (_dec7 = subscriberCollection(), _dec7(_class8 = function () {
  function ValueAttributeObserver(element, propertyName, handler) {
    

    this.element = element;
    this.propertyName = propertyName;
    this.handler = handler;
    if (propertyName === 'files') {
      this.setValue = function () {};
    }
  }

  ValueAttributeObserver.prototype.getValue = function getValue() {
    return this.element[this.propertyName];
  };

  ValueAttributeObserver.prototype.setValue = function setValue(newValue) {
    newValue = newValue === undefined || newValue === null ? '' : newValue;
    if (this.element[this.propertyName] !== newValue) {
      this.element[this.propertyName] = newValue;
      this.notify();
    }
  };

  ValueAttributeObserver.prototype.notify = function notify() {
    var oldValue = this.oldValue;
    var newValue = this.getValue();

    this.callSubscribers(newValue, oldValue);

    this.oldValue = newValue;
  };

  ValueAttributeObserver.prototype.handleEvent = function handleEvent() {
    this.notify();
  };

  ValueAttributeObserver.prototype.subscribe = function subscribe(context, callable) {
    if (!this.hasSubscribers()) {
      this.oldValue = this.getValue();
      this.handler.subscribe(this.element, this);
    }

    this.addSubscriber(context, callable);
  };

  ValueAttributeObserver.prototype.unsubscribe = function unsubscribe(context, callable) {
    if (this.removeSubscriber(context, callable) && !this.hasSubscribers()) {
      this.handler.dispose();
    }
  };

  return ValueAttributeObserver;
}()) || _class8);

var checkedArrayContext = 'CheckedObserver:array';
var checkedValueContext = 'CheckedObserver:value';

var CheckedObserver = (_dec8 = subscriberCollection(), _dec8(_class9 = function () {
  function CheckedObserver(element, handler, observerLocator) {
    

    this.element = element;
    this.handler = handler;
    this.observerLocator = observerLocator;
  }

  CheckedObserver.prototype.getValue = function getValue() {
    return this.value;
  };

  CheckedObserver.prototype.setValue = function setValue(newValue) {
    if (this.initialSync && this.value === newValue) {
      return;
    }

    if (this.arrayObserver) {
      this.arrayObserver.unsubscribe(checkedArrayContext, this);
      this.arrayObserver = null;
    }

    if (this.element.type === 'checkbox' && Array.isArray(newValue)) {
      this.arrayObserver = this.observerLocator.getArrayObserver(newValue);
      this.arrayObserver.subscribe(checkedArrayContext, this);
    }

    this.oldValue = this.value;
    this.value = newValue;
    this.synchronizeElement();
    this.notify();

    if (!this.initialSync) {
      this.initialSync = true;
      this.observerLocator.taskQueue.queueMicroTask(this);
    }
  };

  CheckedObserver.prototype.call = function call(context, splices) {
    this.synchronizeElement();

    if (!this.valueObserver) {
      this.valueObserver = this.element.__observers__.model || this.element.__observers__.value;
      if (this.valueObserver) {
        this.valueObserver.subscribe(checkedValueContext, this);
      }
    }
  };

  CheckedObserver.prototype.synchronizeElement = function synchronizeElement() {
    var value = this.value;
    var element = this.element;
    var elementValue = element.hasOwnProperty('model') ? element.model : element.value;
    var isRadio = element.type === 'radio';
    var matcher = element.matcher || function (a, b) {
      return a === b;
    };

    element.checked = isRadio && !!matcher(value, elementValue) || !isRadio && value === true || !isRadio && Array.isArray(value) && value.findIndex(function (item) {
      return !!matcher(item, elementValue);
    }) !== -1;
  };

  CheckedObserver.prototype.synchronizeValue = function synchronizeValue() {
    var value = this.value;
    var element = this.element;
    var elementValue = element.hasOwnProperty('model') ? element.model : element.value;
    var index = void 0;
    var matcher = element.matcher || function (a, b) {
      return a === b;
    };

    if (element.type === 'checkbox') {
      if (Array.isArray(value)) {
        index = value.findIndex(function (item) {
          return !!matcher(item, elementValue);
        });
        if (element.checked && index === -1) {
          value.push(elementValue);
        } else if (!element.checked && index !== -1) {
          value.splice(index, 1);
        }

        return;
      }

      value = element.checked;
    } else if (element.checked) {
      value = elementValue;
    } else {
      return;
    }

    this.oldValue = this.value;
    this.value = value;
    this.notify();
  };

  CheckedObserver.prototype.notify = function notify() {
    var oldValue = this.oldValue;
    var newValue = this.value;

    if (newValue === oldValue) {
      return;
    }

    this.callSubscribers(newValue, oldValue);
  };

  CheckedObserver.prototype.handleEvent = function handleEvent() {
    this.synchronizeValue();
  };

  CheckedObserver.prototype.subscribe = function subscribe(context, callable) {
    if (!this.hasSubscribers()) {
      this.handler.subscribe(this.element, this);
    }
    this.addSubscriber(context, callable);
  };

  CheckedObserver.prototype.unsubscribe = function unsubscribe(context, callable) {
    if (this.removeSubscriber(context, callable) && !this.hasSubscribers()) {
      this.handler.dispose();
    }
  };

  CheckedObserver.prototype.unbind = function unbind() {
    if (this.arrayObserver) {
      this.arrayObserver.unsubscribe(checkedArrayContext, this);
      this.arrayObserver = null;
    }
    if (this.valueObserver) {
      this.valueObserver.unsubscribe(checkedValueContext, this);
    }
  };

  return CheckedObserver;
}()) || _class9);

var selectArrayContext = 'SelectValueObserver:array';

var SelectValueObserver = (_dec9 = subscriberCollection(), _dec9(_class10 = function () {
  function SelectValueObserver(element, handler, observerLocator) {
    

    this.element = element;
    this.handler = handler;
    this.observerLocator = observerLocator;
  }

  SelectValueObserver.prototype.getValue = function getValue() {
    return this.value;
  };

  SelectValueObserver.prototype.setValue = function setValue(newValue) {
    if (newValue !== null && newValue !== undefined && this.element.multiple && !Array.isArray(newValue)) {
      throw new Error('Only null or Array instances can be bound to a multi-select.');
    }
    if (this.value === newValue) {
      return;
    }

    if (this.arrayObserver) {
      this.arrayObserver.unsubscribe(selectArrayContext, this);
      this.arrayObserver = null;
    }

    if (Array.isArray(newValue)) {
      this.arrayObserver = this.observerLocator.getArrayObserver(newValue);
      this.arrayObserver.subscribe(selectArrayContext, this);
    }

    this.oldValue = this.value;
    this.value = newValue;
    this.synchronizeOptions();
    this.notify();

    if (!this.initialSync) {
      this.initialSync = true;
      this.observerLocator.taskQueue.queueMicroTask(this);
    }
  };

  SelectValueObserver.prototype.call = function call(context, splices) {
    this.synchronizeOptions();
  };

  SelectValueObserver.prototype.synchronizeOptions = function synchronizeOptions() {
    var value = this.value;
    var isArray = void 0;

    if (Array.isArray(value)) {
      isArray = true;
    }

    var options = this.element.options;
    var i = options.length;
    var matcher = this.element.matcher || function (a, b) {
      return a === b;
    };

    var _loop = function _loop() {
      var option = options.item(i);
      var optionValue = option.hasOwnProperty('model') ? option.model : option.value;
      if (isArray) {
        option.selected = value.findIndex(function (item) {
          return !!matcher(optionValue, item);
        }) !== -1;
        return 'continue';
      }
      option.selected = !!matcher(optionValue, value);
    };

    while (i--) {
      var _ret = _loop();

      if (_ret === 'continue') continue;
    }
  };

  SelectValueObserver.prototype.synchronizeValue = function synchronizeValue() {
    var _this23 = this;

    var options = this.element.options;
    var count = 0;
    var value = [];

    for (var i = 0, ii = options.length; i < ii; i++) {
      var _option = options.item(i);
      if (!_option.selected) {
        continue;
      }
      value.push(_option.hasOwnProperty('model') ? _option.model : _option.value);
      count++;
    }

    if (this.element.multiple) {
      if (Array.isArray(this.value)) {
        var _ret2 = function () {
          var matcher = _this23.element.matcher || function (a, b) {
            return a === b;
          };

          var i = 0;

          var _loop2 = function _loop2() {
            var a = _this23.value[i];
            if (value.findIndex(function (b) {
              return matcher(a, b);
            }) === -1) {
              _this23.value.splice(i, 1);
            } else {
              i++;
            }
          };

          while (i < _this23.value.length) {
            _loop2();
          }

          i = 0;

          var _loop3 = function _loop3() {
            var a = value[i];
            if (_this23.value.findIndex(function (b) {
              return matcher(a, b);
            }) === -1) {
              _this23.value.push(a);
            }
            i++;
          };

          while (i < value.length) {
            _loop3();
          }
          return {
            v: void 0
          };
        }();

        if ((typeof _ret2 === 'undefined' ? 'undefined' : _typeof$3(_ret2)) === "object") return _ret2.v;
      }
    } else {
      if (count === 0) {
        value = null;
      } else {
        value = value[0];
      }
    }

    if (value !== this.value) {
      this.oldValue = this.value;
      this.value = value;
      this.notify();
    }
  };

  SelectValueObserver.prototype.notify = function notify() {
    var oldValue = this.oldValue;
    var newValue = this.value;

    this.callSubscribers(newValue, oldValue);
  };

  SelectValueObserver.prototype.handleEvent = function handleEvent() {
    this.synchronizeValue();
  };

  SelectValueObserver.prototype.subscribe = function subscribe(context, callable) {
    if (!this.hasSubscribers()) {
      this.handler.subscribe(this.element, this);
    }
    this.addSubscriber(context, callable);
  };

  SelectValueObserver.prototype.unsubscribe = function unsubscribe(context, callable) {
    if (this.removeSubscriber(context, callable) && !this.hasSubscribers()) {
      this.handler.dispose();
    }
  };

  SelectValueObserver.prototype.bind = function bind() {
    var _this24 = this;

    this.domObserver = DOM.createMutationObserver(function () {
      _this24.synchronizeOptions();
      _this24.synchronizeValue();
    });
    this.domObserver.observe(this.element, { childList: true, subtree: true, characterData: true });
  };

  SelectValueObserver.prototype.unbind = function unbind() {
    this.domObserver.disconnect();
    this.domObserver = null;

    if (this.arrayObserver) {
      this.arrayObserver.unsubscribe(selectArrayContext, this);
      this.arrayObserver = null;
    }
  };

  return SelectValueObserver;
}()) || _class10);

var ClassObserver = function () {
  function ClassObserver(element) {
    

    this.element = element;
    this.doNotCache = true;
    this.value = '';
    this.version = 0;
  }

  ClassObserver.prototype.getValue = function getValue() {
    return this.value;
  };

  ClassObserver.prototype.setValue = function setValue(newValue) {
    var nameIndex = this.nameIndex || {};
    var version = this.version;
    var names = void 0;
    var name = void 0;

    if (newValue !== null && newValue !== undefined && newValue.length) {
      names = newValue.split(/\s+/);
      for (var i = 0, length = names.length; i < length; i++) {
        name = names[i];
        if (name === '') {
          continue;
        }
        nameIndex[name] = version;
        this.element.classList.add(name);
      }
    }

    this.value = newValue;
    this.nameIndex = nameIndex;
    this.version += 1;

    if (version === 0) {
      return;
    }

    version -= 1;
    for (name in nameIndex) {
      if (!nameIndex.hasOwnProperty(name) || nameIndex[name] !== version) {
        continue;
      }
      this.element.classList.remove(name);
    }
  };

  ClassObserver.prototype.subscribe = function subscribe() {
    throw new Error('Observation of a "' + this.element.nodeName + '" element\'s "class" property is not supported.');
  };

  return ClassObserver;
}();

function hasDeclaredDependencies(descriptor) {
  return !!(descriptor && descriptor.get && descriptor.get.dependencies);
}

function computedFrom() {
  for (var _len = arguments.length, rest = Array(_len), _key = 0; _key < _len; _key++) {
    rest[_key] = arguments[_key];
  }

  return function (target, key, descriptor) {
    descriptor.get.dependencies = rest;
    return descriptor;
  };
}

var ComputedExpression = function (_Expression19) {
  _inherits(ComputedExpression, _Expression19);

  function ComputedExpression(name, dependencies) {
    

    var _this25 = _possibleConstructorReturn(this, _Expression19.call(this));

    _this25.name = name;
    _this25.dependencies = dependencies;
    _this25.isAssignable = true;
    return _this25;
  }

  ComputedExpression.prototype.evaluate = function evaluate(scope, lookupFunctions) {
    return scope.bindingContext[this.name];
  };

  ComputedExpression.prototype.assign = function assign(scope, value) {
    scope.bindingContext[this.name] = value;
  };

  ComputedExpression.prototype.accept = function accept(visitor) {
    throw new Error('not implemented');
  };

  ComputedExpression.prototype.connect = function connect(binding, scope) {
    var dependencies = this.dependencies;
    var i = dependencies.length;
    while (i--) {
      dependencies[i].connect(binding, scope);
    }
  };

  return ComputedExpression;
}(Expression);

function createComputedObserver(obj, propertyName, descriptor, observerLocator) {
  var dependencies = descriptor.get.dependencies;
  if (!(dependencies instanceof ComputedExpression)) {
    var i = dependencies.length;
    while (i--) {
      dependencies[i] = observerLocator.parser.parse(dependencies[i]);
    }
    dependencies = descriptor.get.dependencies = new ComputedExpression(propertyName, dependencies);
  }

  var scope = { bindingContext: obj, overrideContext: createOverrideContext(obj) };
  return new ExpressionObserver(scope, dependencies, observerLocator);
}

var svgElements = void 0;
var svgPresentationElements = void 0;
var svgPresentationAttributes = void 0;
var svgAnalyzer = void 0;

if (typeof FEATURE_NO_SVG === 'undefined') {
  svgElements = {
    a: ['class', 'externalResourcesRequired', 'id', 'onactivate', 'onclick', 'onfocusin', 'onfocusout', 'onload', 'onmousedown', 'onmousemove', 'onmouseout', 'onmouseover', 'onmouseup', 'requiredExtensions', 'requiredFeatures', 'style', 'systemLanguage', 'target', 'transform', 'xlink:actuate', 'xlink:arcrole', 'xlink:href', 'xlink:role', 'xlink:show', 'xlink:title', 'xlink:type', 'xml:base', 'xml:lang', 'xml:space'],
    altGlyph: ['class', 'dx', 'dy', 'externalResourcesRequired', 'format', 'glyphRef', 'id', 'onactivate', 'onclick', 'onfocusin', 'onfocusout', 'onload', 'onmousedown', 'onmousemove', 'onmouseout', 'onmouseover', 'onmouseup', 'requiredExtensions', 'requiredFeatures', 'rotate', 'style', 'systemLanguage', 'x', 'xlink:actuate', 'xlink:arcrole', 'xlink:href', 'xlink:role', 'xlink:show', 'xlink:title', 'xlink:type', 'xml:base', 'xml:lang', 'xml:space', 'y'],
    altGlyphDef: ['id', 'xml:base', 'xml:lang', 'xml:space'],
    altGlyphItem: ['id', 'xml:base', 'xml:lang', 'xml:space'],
    animate: ['accumulate', 'additive', 'attributeName', 'attributeType', 'begin', 'by', 'calcMode', 'dur', 'end', 'externalResourcesRequired', 'fill', 'from', 'id', 'keySplines', 'keyTimes', 'max', 'min', 'onbegin', 'onend', 'onload', 'onrepeat', 'repeatCount', 'repeatDur', 'requiredExtensions', 'requiredFeatures', 'restart', 'systemLanguage', 'to', 'values', 'xlink:actuate', 'xlink:arcrole', 'xlink:href', 'xlink:role', 'xlink:show', 'xlink:title', 'xlink:type', 'xml:base', 'xml:lang', 'xml:space'],
    animateColor: ['accumulate', 'additive', 'attributeName', 'attributeType', 'begin', 'by', 'calcMode', 'dur', 'end', 'externalResourcesRequired', 'fill', 'from', 'id', 'keySplines', 'keyTimes', 'max', 'min', 'onbegin', 'onend', 'onload', 'onrepeat', 'repeatCount', 'repeatDur', 'requiredExtensions', 'requiredFeatures', 'restart', 'systemLanguage', 'to', 'values', 'xlink:actuate', 'xlink:arcrole', 'xlink:href', 'xlink:role', 'xlink:show', 'xlink:title', 'xlink:type', 'xml:base', 'xml:lang', 'xml:space'],
    animateMotion: ['accumulate', 'additive', 'begin', 'by', 'calcMode', 'dur', 'end', 'externalResourcesRequired', 'fill', 'from', 'id', 'keyPoints', 'keySplines', 'keyTimes', 'max', 'min', 'onbegin', 'onend', 'onload', 'onrepeat', 'origin', 'path', 'repeatCount', 'repeatDur', 'requiredExtensions', 'requiredFeatures', 'restart', 'rotate', 'systemLanguage', 'to', 'values', 'xlink:actuate', 'xlink:arcrole', 'xlink:href', 'xlink:role', 'xlink:show', 'xlink:title', 'xlink:type', 'xml:base', 'xml:lang', 'xml:space'],
    animateTransform: ['accumulate', 'additive', 'attributeName', 'attributeType', 'begin', 'by', 'calcMode', 'dur', 'end', 'externalResourcesRequired', 'fill', 'from', 'id', 'keySplines', 'keyTimes', 'max', 'min', 'onbegin', 'onend', 'onload', 'onrepeat', 'repeatCount', 'repeatDur', 'requiredExtensions', 'requiredFeatures', 'restart', 'systemLanguage', 'to', 'type', 'values', 'xlink:actuate', 'xlink:arcrole', 'xlink:href', 'xlink:role', 'xlink:show', 'xlink:title', 'xlink:type', 'xml:base', 'xml:lang', 'xml:space'],
    circle: ['class', 'cx', 'cy', 'externalResourcesRequired', 'id', 'onactivate', 'onclick', 'onfocusin', 'onfocusout', 'onload', 'onmousedown', 'onmousemove', 'onmouseout', 'onmouseover', 'onmouseup', 'r', 'requiredExtensions', 'requiredFeatures', 'style', 'systemLanguage', 'transform', 'xml:base', 'xml:lang', 'xml:space'],
    clipPath: ['class', 'clipPathUnits', 'externalResourcesRequired', 'id', 'requiredExtensions', 'requiredFeatures', 'style', 'systemLanguage', 'transform', 'xml:base', 'xml:lang', 'xml:space'],
    'color-profile': ['id', 'local', 'name', 'rendering-intent', 'xlink:actuate', 'xlink:arcrole', 'xlink:href', 'xlink:role', 'xlink:show', 'xlink:title', 'xlink:type', 'xml:base', 'xml:lang', 'xml:space'],
    cursor: ['externalResourcesRequired', 'id', 'requiredExtensions', 'requiredFeatures', 'systemLanguage', 'x', 'xlink:actuate', 'xlink:arcrole', 'xlink:href', 'xlink:role', 'xlink:show', 'xlink:title', 'xlink:type', 'xml:base', 'xml:lang', 'xml:space', 'y'],
    defs: ['class', 'externalResourcesRequired', 'id', 'onactivate', 'onclick', 'onfocusin', 'onfocusout', 'onload', 'onmousedown', 'onmousemove', 'onmouseout', 'onmouseover', 'onmouseup', 'requiredExtensions', 'requiredFeatures', 'style', 'systemLanguage', 'transform', 'xml:base', 'xml:lang', 'xml:space'],
    desc: ['class', 'id', 'style', 'xml:base', 'xml:lang', 'xml:space'],
    ellipse: ['class', 'cx', 'cy', 'externalResourcesRequired', 'id', 'onactivate', 'onclick', 'onfocusin', 'onfocusout', 'onload', 'onmousedown', 'onmousemove', 'onmouseout', 'onmouseover', 'onmouseup', 'requiredExtensions', 'requiredFeatures', 'rx', 'ry', 'style', 'systemLanguage', 'transform', 'xml:base', 'xml:lang', 'xml:space'],
    feBlend: ['class', 'height', 'id', 'in', 'in2', 'mode', 'result', 'style', 'width', 'x', 'xml:base', 'xml:lang', 'xml:space', 'y'],
    feColorMatrix: ['class', 'height', 'id', 'in', 'result', 'style', 'type', 'values', 'width', 'x', 'xml:base', 'xml:lang', 'xml:space', 'y'],
    feComponentTransfer: ['class', 'height', 'id', 'in', 'result', 'style', 'width', 'x', 'xml:base', 'xml:lang', 'xml:space', 'y'],
    feComposite: ['class', 'height', 'id', 'in', 'in2', 'k1', 'k2', 'k3', 'k4', 'operator', 'result', 'style', 'width', 'x', 'xml:base', 'xml:lang', 'xml:space', 'y'],
    feConvolveMatrix: ['bias', 'class', 'divisor', 'edgeMode', 'height', 'id', 'in', 'kernelMatrix', 'kernelUnitLength', 'order', 'preserveAlpha', 'result', 'style', 'targetX', 'targetY', 'width', 'x', 'xml:base', 'xml:lang', 'xml:space', 'y'],
    feDiffuseLighting: ['class', 'diffuseConstant', 'height', 'id', 'in', 'kernelUnitLength', 'result', 'style', 'surfaceScale', 'width', 'x', 'xml:base', 'xml:lang', 'xml:space', 'y'],
    feDisplacementMap: ['class', 'height', 'id', 'in', 'in2', 'result', 'scale', 'style', 'width', 'x', 'xChannelSelector', 'xml:base', 'xml:lang', 'xml:space', 'y', 'yChannelSelector'],
    feDistantLight: ['azimuth', 'elevation', 'id', 'xml:base', 'xml:lang', 'xml:space'],
    feFlood: ['class', 'height', 'id', 'result', 'style', 'width', 'x', 'xml:base', 'xml:lang', 'xml:space', 'y'],
    feFuncA: ['amplitude', 'exponent', 'id', 'intercept', 'offset', 'slope', 'tableValues', 'type', 'xml:base', 'xml:lang', 'xml:space'],
    feFuncB: ['amplitude', 'exponent', 'id', 'intercept', 'offset', 'slope', 'tableValues', 'type', 'xml:base', 'xml:lang', 'xml:space'],
    feFuncG: ['amplitude', 'exponent', 'id', 'intercept', 'offset', 'slope', 'tableValues', 'type', 'xml:base', 'xml:lang', 'xml:space'],
    feFuncR: ['amplitude', 'exponent', 'id', 'intercept', 'offset', 'slope', 'tableValues', 'type', 'xml:base', 'xml:lang', 'xml:space'],
    feGaussianBlur: ['class', 'height', 'id', 'in', 'result', 'stdDeviation', 'style', 'width', 'x', 'xml:base', 'xml:lang', 'xml:space', 'y'],
    feImage: ['class', 'externalResourcesRequired', 'height', 'id', 'preserveAspectRatio', 'result', 'style', 'width', 'x', 'xlink:actuate', 'xlink:arcrole', 'xlink:href', 'xlink:role', 'xlink:show', 'xlink:title', 'xlink:type', 'xml:base', 'xml:lang', 'xml:space', 'y'],
    feMerge: ['class', 'height', 'id', 'result', 'style', 'width', 'x', 'xml:base', 'xml:lang', 'xml:space', 'y'],
    feMergeNode: ['id', 'xml:base', 'xml:lang', 'xml:space'],
    feMorphology: ['class', 'height', 'id', 'in', 'operator', 'radius', 'result', 'style', 'width', 'x', 'xml:base', 'xml:lang', 'xml:space', 'y'],
    feOffset: ['class', 'dx', 'dy', 'height', 'id', 'in', 'result', 'style', 'width', 'x', 'xml:base', 'xml:lang', 'xml:space', 'y'],
    fePointLight: ['id', 'x', 'xml:base', 'xml:lang', 'xml:space', 'y', 'z'],
    feSpecularLighting: ['class', 'height', 'id', 'in', 'kernelUnitLength', 'result', 'specularConstant', 'specularExponent', 'style', 'surfaceScale', 'width', 'x', 'xml:base', 'xml:lang', 'xml:space', 'y'],
    feSpotLight: ['id', 'limitingConeAngle', 'pointsAtX', 'pointsAtY', 'pointsAtZ', 'specularExponent', 'x', 'xml:base', 'xml:lang', 'xml:space', 'y', 'z'],
    feTile: ['class', 'height', 'id', 'in', 'result', 'style', 'width', 'x', 'xml:base', 'xml:lang', 'xml:space', 'y'],
    feTurbulence: ['baseFrequency', 'class', 'height', 'id', 'numOctaves', 'result', 'seed', 'stitchTiles', 'style', 'type', 'width', 'x', 'xml:base', 'xml:lang', 'xml:space', 'y'],
    filter: ['class', 'externalResourcesRequired', 'filterRes', 'filterUnits', 'height', 'id', 'primitiveUnits', 'style', 'width', 'x', 'xlink:actuate', 'xlink:arcrole', 'xlink:href', 'xlink:role', 'xlink:show', 'xlink:title', 'xlink:type', 'xml:base', 'xml:lang', 'xml:space', 'y'],
    font: ['class', 'externalResourcesRequired', 'horiz-adv-x', 'horiz-origin-x', 'horiz-origin-y', 'id', 'style', 'vert-adv-y', 'vert-origin-x', 'vert-origin-y', 'xml:base', 'xml:lang', 'xml:space'],
    'font-face': ['accent-height', 'alphabetic', 'ascent', 'bbox', 'cap-height', 'descent', 'font-family', 'font-size', 'font-stretch', 'font-style', 'font-variant', 'font-weight', 'hanging', 'id', 'ideographic', 'mathematical', 'overline-position', 'overline-thickness', 'panose-1', 'slope', 'stemh', 'stemv', 'strikethrough-position', 'strikethrough-thickness', 'underline-position', 'underline-thickness', 'unicode-range', 'units-per-em', 'v-alphabetic', 'v-hanging', 'v-ideographic', 'v-mathematical', 'widths', 'x-height', 'xml:base', 'xml:lang', 'xml:space'],
    'font-face-format': ['id', 'string', 'xml:base', 'xml:lang', 'xml:space'],
    'font-face-name': ['id', 'name', 'xml:base', 'xml:lang', 'xml:space'],
    'font-face-src': ['id', 'xml:base', 'xml:lang', 'xml:space'],
    'font-face-uri': ['id', 'xlink:actuate', 'xlink:arcrole', 'xlink:href', 'xlink:role', 'xlink:show', 'xlink:title', 'xlink:type', 'xml:base', 'xml:lang', 'xml:space'],
    foreignObject: ['class', 'externalResourcesRequired', 'height', 'id', 'onactivate', 'onclick', 'onfocusin', 'onfocusout', 'onload', 'onmousedown', 'onmousemove', 'onmouseout', 'onmouseover', 'onmouseup', 'requiredExtensions', 'requiredFeatures', 'style', 'systemLanguage', 'transform', 'width', 'x', 'xml:base', 'xml:lang', 'xml:space', 'y'],
    g: ['class', 'externalResourcesRequired', 'id', 'onactivate', 'onclick', 'onfocusin', 'onfocusout', 'onload', 'onmousedown', 'onmousemove', 'onmouseout', 'onmouseover', 'onmouseup', 'requiredExtensions', 'requiredFeatures', 'style', 'systemLanguage', 'transform', 'xml:base', 'xml:lang', 'xml:space'],
    glyph: ['arabic-form', 'class', 'd', 'glyph-name', 'horiz-adv-x', 'id', 'lang', 'orientation', 'style', 'unicode', 'vert-adv-y', 'vert-origin-x', 'vert-origin-y', 'xml:base', 'xml:lang', 'xml:space'],
    glyphRef: ['class', 'dx', 'dy', 'format', 'glyphRef', 'id', 'style', 'x', 'xlink:actuate', 'xlink:arcrole', 'xlink:href', 'xlink:role', 'xlink:show', 'xlink:title', 'xlink:type', 'xml:base', 'xml:lang', 'xml:space', 'y'],
    hkern: ['g1', 'g2', 'id', 'k', 'u1', 'u2', 'xml:base', 'xml:lang', 'xml:space'],
    image: ['class', 'externalResourcesRequired', 'height', 'id', 'onactivate', 'onclick', 'onfocusin', 'onfocusout', 'onload', 'onmousedown', 'onmousemove', 'onmouseout', 'onmouseover', 'onmouseup', 'preserveAspectRatio', 'requiredExtensions', 'requiredFeatures', 'style', 'systemLanguage', 'transform', 'width', 'x', 'xlink:actuate', 'xlink:arcrole', 'xlink:href', 'xlink:role', 'xlink:show', 'xlink:title', 'xlink:type', 'xml:base', 'xml:lang', 'xml:space', 'y'],
    line: ['class', 'externalResourcesRequired', 'id', 'onactivate', 'onclick', 'onfocusin', 'onfocusout', 'onload', 'onmousedown', 'onmousemove', 'onmouseout', 'onmouseover', 'onmouseup', 'requiredExtensions', 'requiredFeatures', 'style', 'systemLanguage', 'transform', 'x1', 'x2', 'xml:base', 'xml:lang', 'xml:space', 'y1', 'y2'],
    linearGradient: ['class', 'externalResourcesRequired', 'gradientTransform', 'gradientUnits', 'id', 'spreadMethod', 'style', 'x1', 'x2', 'xlink:arcrole', 'xlink:href', 'xlink:role', 'xlink:title', 'xlink:type', 'xml:base', 'xml:lang', 'xml:space', 'y1', 'y2'],
    marker: ['class', 'externalResourcesRequired', 'id', 'markerHeight', 'markerUnits', 'markerWidth', 'orient', 'preserveAspectRatio', 'refX', 'refY', 'style', 'viewBox', 'xml:base', 'xml:lang', 'xml:space'],
    mask: ['class', 'externalResourcesRequired', 'height', 'id', 'maskContentUnits', 'maskUnits', 'requiredExtensions', 'requiredFeatures', 'style', 'systemLanguage', 'width', 'x', 'xml:base', 'xml:lang', 'xml:space', 'y'],
    metadata: ['id', 'xml:base', 'xml:lang', 'xml:space'],
    'missing-glyph': ['class', 'd', 'horiz-adv-x', 'id', 'style', 'vert-adv-y', 'vert-origin-x', 'vert-origin-y', 'xml:base', 'xml:lang', 'xml:space'],
    mpath: ['externalResourcesRequired', 'id', 'xlink:actuate', 'xlink:arcrole', 'xlink:href', 'xlink:role', 'xlink:show', 'xlink:title', 'xlink:type', 'xml:base', 'xml:lang', 'xml:space'],
    path: ['class', 'd', 'externalResourcesRequired', 'id', 'onactivate', 'onclick', 'onfocusin', 'onfocusout', 'onload', 'onmousedown', 'onmousemove', 'onmouseout', 'onmouseover', 'onmouseup', 'pathLength', 'requiredExtensions', 'requiredFeatures', 'style', 'systemLanguage', 'transform', 'xml:base', 'xml:lang', 'xml:space'],
    pattern: ['class', 'externalResourcesRequired', 'height', 'id', 'patternContentUnits', 'patternTransform', 'patternUnits', 'preserveAspectRatio', 'requiredExtensions', 'requiredFeatures', 'style', 'systemLanguage', 'viewBox', 'width', 'x', 'xlink:actuate', 'xlink:arcrole', 'xlink:href', 'xlink:role', 'xlink:show', 'xlink:title', 'xlink:type', 'xml:base', 'xml:lang', 'xml:space', 'y'],
    polygon: ['class', 'externalResourcesRequired', 'id', 'onactivate', 'onclick', 'onfocusin', 'onfocusout', 'onload', 'onmousedown', 'onmousemove', 'onmouseout', 'onmouseover', 'onmouseup', 'points', 'requiredExtensions', 'requiredFeatures', 'style', 'systemLanguage', 'transform', 'xml:base', 'xml:lang', 'xml:space'],
    polyline: ['class', 'externalResourcesRequired', 'id', 'onactivate', 'onclick', 'onfocusin', 'onfocusout', 'onload', 'onmousedown', 'onmousemove', 'onmouseout', 'onmouseover', 'onmouseup', 'points', 'requiredExtensions', 'requiredFeatures', 'style', 'systemLanguage', 'transform', 'xml:base', 'xml:lang', 'xml:space'],
    radialGradient: ['class', 'cx', 'cy', 'externalResourcesRequired', 'fx', 'fy', 'gradientTransform', 'gradientUnits', 'id', 'r', 'spreadMethod', 'style', 'xlink:arcrole', 'xlink:href', 'xlink:role', 'xlink:title', 'xlink:type', 'xml:base', 'xml:lang', 'xml:space'],
    rect: ['class', 'externalResourcesRequired', 'height', 'id', 'onactivate', 'onclick', 'onfocusin', 'onfocusout', 'onload', 'onmousedown', 'onmousemove', 'onmouseout', 'onmouseover', 'onmouseup', 'requiredExtensions', 'requiredFeatures', 'rx', 'ry', 'style', 'systemLanguage', 'transform', 'width', 'x', 'xml:base', 'xml:lang', 'xml:space', 'y'],
    script: ['externalResourcesRequired', 'id', 'type', 'xlink:actuate', 'xlink:arcrole', 'xlink:href', 'xlink:role', 'xlink:show', 'xlink:title', 'xlink:type', 'xml:base', 'xml:lang', 'xml:space'],
    set: ['attributeName', 'attributeType', 'begin', 'dur', 'end', 'externalResourcesRequired', 'fill', 'id', 'max', 'min', 'onbegin', 'onend', 'onload', 'onrepeat', 'repeatCount', 'repeatDur', 'requiredExtensions', 'requiredFeatures', 'restart', 'systemLanguage', 'to', 'xlink:actuate', 'xlink:arcrole', 'xlink:href', 'xlink:role', 'xlink:show', 'xlink:title', 'xlink:type', 'xml:base', 'xml:lang', 'xml:space'],
    stop: ['class', 'id', 'offset', 'style', 'xml:base', 'xml:lang', 'xml:space'],
    style: ['id', 'media', 'title', 'type', 'xml:base', 'xml:lang', 'xml:space'],
    svg: ['baseProfile', 'class', 'contentScriptType', 'contentStyleType', 'externalResourcesRequired', 'height', 'id', 'onabort', 'onactivate', 'onclick', 'onerror', 'onfocusin', 'onfocusout', 'onload', 'onmousedown', 'onmousemove', 'onmouseout', 'onmouseover', 'onmouseup', 'onresize', 'onscroll', 'onunload', 'onzoom', 'preserveAspectRatio', 'requiredExtensions', 'requiredFeatures', 'style', 'systemLanguage', 'version', 'viewBox', 'width', 'x', 'xml:base', 'xml:lang', 'xml:space', 'y', 'zoomAndPan'],
    switch: ['class', 'externalResourcesRequired', 'id', 'onactivate', 'onclick', 'onfocusin', 'onfocusout', 'onload', 'onmousedown', 'onmousemove', 'onmouseout', 'onmouseover', 'onmouseup', 'requiredExtensions', 'requiredFeatures', 'style', 'systemLanguage', 'transform', 'xml:base', 'xml:lang', 'xml:space'],
    symbol: ['class', 'externalResourcesRequired', 'id', 'onactivate', 'onclick', 'onfocusin', 'onfocusout', 'onload', 'onmousedown', 'onmousemove', 'onmouseout', 'onmouseover', 'onmouseup', 'preserveAspectRatio', 'style', 'viewBox', 'xml:base', 'xml:lang', 'xml:space'],
    text: ['class', 'dx', 'dy', 'externalResourcesRequired', 'id', 'lengthAdjust', 'onactivate', 'onclick', 'onfocusin', 'onfocusout', 'onload', 'onmousedown', 'onmousemove', 'onmouseout', 'onmouseover', 'onmouseup', 'requiredExtensions', 'requiredFeatures', 'rotate', 'style', 'systemLanguage', 'textLength', 'transform', 'x', 'xml:base', 'xml:lang', 'xml:space', 'y'],
    textPath: ['class', 'externalResourcesRequired', 'id', 'lengthAdjust', 'method', 'onactivate', 'onclick', 'onfocusin', 'onfocusout', 'onload', 'onmousedown', 'onmousemove', 'onmouseout', 'onmouseover', 'onmouseup', 'requiredExtensions', 'requiredFeatures', 'spacing', 'startOffset', 'style', 'systemLanguage', 'textLength', 'xlink:arcrole', 'xlink:href', 'xlink:role', 'xlink:title', 'xlink:type', 'xml:base', 'xml:lang', 'xml:space'],
    title: ['class', 'id', 'style', 'xml:base', 'xml:lang', 'xml:space'],
    tref: ['class', 'dx', 'dy', 'externalResourcesRequired', 'id', 'lengthAdjust', 'onactivate', 'onclick', 'onfocusin', 'onfocusout', 'onload', 'onmousedown', 'onmousemove', 'onmouseout', 'onmouseover', 'onmouseup', 'requiredExtensions', 'requiredFeatures', 'rotate', 'style', 'systemLanguage', 'textLength', 'x', 'xlink:arcrole', 'xlink:href', 'xlink:role', 'xlink:title', 'xlink:type', 'xml:base', 'xml:lang', 'xml:space', 'y'],
    tspan: ['class', 'dx', 'dy', 'externalResourcesRequired', 'id', 'lengthAdjust', 'onactivate', 'onclick', 'onfocusin', 'onfocusout', 'onload', 'onmousedown', 'onmousemove', 'onmouseout', 'onmouseover', 'onmouseup', 'requiredExtensions', 'requiredFeatures', 'rotate', 'style', 'systemLanguage', 'textLength', 'x', 'xml:base', 'xml:lang', 'xml:space', 'y'],
    use: ['class', 'externalResourcesRequired', 'height', 'id', 'onactivate', 'onclick', 'onfocusin', 'onfocusout', 'onload', 'onmousedown', 'onmousemove', 'onmouseout', 'onmouseover', 'onmouseup', 'requiredExtensions', 'requiredFeatures', 'style', 'systemLanguage', 'transform', 'width', 'x', 'xlink:actuate', 'xlink:arcrole', 'xlink:href', 'xlink:role', 'xlink:show', 'xlink:title', 'xlink:type', 'xml:base', 'xml:lang', 'xml:space', 'y'],
    view: ['externalResourcesRequired', 'id', 'preserveAspectRatio', 'viewBox', 'viewTarget', 'xml:base', 'xml:lang', 'xml:space', 'zoomAndPan'],
    vkern: ['g1', 'g2', 'id', 'k', 'u1', 'u2', 'xml:base', 'xml:lang', 'xml:space']
  };


  svgPresentationElements = {
    'a': true,
    'altGlyph': true,
    'animate': true,
    'animateColor': true,
    'circle': true,
    'clipPath': true,
    'defs': true,
    'ellipse': true,
    'feBlend': true,
    'feColorMatrix': true,
    'feComponentTransfer': true,
    'feComposite': true,
    'feConvolveMatrix': true,
    'feDiffuseLighting': true,
    'feDisplacementMap': true,
    'feFlood': true,
    'feGaussianBlur': true,
    'feImage': true,
    'feMerge': true,
    'feMorphology': true,
    'feOffset': true,
    'feSpecularLighting': true,
    'feTile': true,
    'feTurbulence': true,
    'filter': true,
    'font': true,
    'foreignObject': true,
    'g': true,
    'glyph': true,
    'glyphRef': true,
    'image': true,
    'line': true,
    'linearGradient': true,
    'marker': true,
    'mask': true,
    'missing-glyph': true,
    'path': true,
    'pattern': true,
    'polygon': true,
    'polyline': true,
    'radialGradient': true,
    'rect': true,
    'stop': true,
    'svg': true,
    'switch': true,
    'symbol': true,
    'text': true,
    'textPath': true,
    'tref': true,
    'tspan': true,
    'use': true
  };

  svgPresentationAttributes = {
    'alignment-baseline': true,
    'baseline-shift': true,
    'clip-path': true,
    'clip-rule': true,
    'clip': true,
    'color-interpolation-filters': true,
    'color-interpolation': true,
    'color-profile': true,
    'color-rendering': true,
    'color': true,
    'cursor': true,
    'direction': true,
    'display': true,
    'dominant-baseline': true,
    'enable-background': true,
    'fill-opacity': true,
    'fill-rule': true,
    'fill': true,
    'filter': true,
    'flood-color': true,
    'flood-opacity': true,
    'font-family': true,
    'font-size-adjust': true,
    'font-size': true,
    'font-stretch': true,
    'font-style': true,
    'font-variant': true,
    'font-weight': true,
    'glyph-orientation-horizontal': true,
    'glyph-orientation-vertical': true,
    'image-rendering': true,
    'kerning': true,
    'letter-spacing': true,
    'lighting-color': true,
    'marker-end': true,
    'marker-mid': true,
    'marker-start': true,
    'mask': true,
    'opacity': true,
    'overflow': true,
    'pointer-events': true,
    'shape-rendering': true,
    'stop-color': true,
    'stop-opacity': true,
    'stroke-dasharray': true,
    'stroke-dashoffset': true,
    'stroke-linecap': true,
    'stroke-linejoin': true,
    'stroke-miterlimit': true,
    'stroke-opacity': true,
    'stroke-width': true,
    'stroke': true,
    'text-anchor': true,
    'text-decoration': true,
    'text-rendering': true,
    'unicode-bidi': true,
    'visibility': true,
    'word-spacing': true,
    'writing-mode': true
  };

  var createElement = function createElement(html) {
    var div = DOM.createElement('div');
    div.innerHTML = html;
    return div.firstChild;
  };

  svgAnalyzer = function () {
    function SVGAnalyzer() {
      

      if (createElement('<svg><altGlyph /></svg>').firstElementChild.nodeName === 'altglyph' && elements$1.altGlyph) {
        elements$1.altglyph = elements$1.altGlyph;
        delete elements$1.altGlyph;
        elements$1.altglyphdef = elements$1.altGlyphDef;
        delete elements$1.altGlyphDef;
        elements$1.altglyphitem = elements$1.altGlyphItem;
        delete elements$1.altGlyphItem;
        elements$1.glyphref = elements$1.glyphRef;
        delete elements$1.glyphRef;
      }
    }

    SVGAnalyzer.prototype.isStandardSvgAttribute = function isStandardSvgAttribute(nodeName, attributeName) {
      return presentationElements[nodeName] && presentationAttributes[attributeName] || elements$1[nodeName] && elements$1[nodeName].indexOf(attributeName) !== -1;
    };

    return SVGAnalyzer;
  }();
}

var elements$1 = svgElements;
var presentationElements = svgPresentationElements;
var presentationAttributes = svgPresentationAttributes;
var SVGAnalyzer = svgAnalyzer || function () {
  function _class11() {
    
  }

  _class11.prototype.isStandardSvgAttribute = function isStandardSvgAttribute() {
    return false;
  };

  return _class11;
}();

var ObserverLocator = (_temp = _class12 = function () {
  function ObserverLocator(taskQueue, eventManager, dirtyChecker, svgAnalyzer, parser) {
    

    this.taskQueue = taskQueue;
    this.eventManager = eventManager;
    this.dirtyChecker = dirtyChecker;
    this.svgAnalyzer = svgAnalyzer;
    this.parser = parser;

    this.adapters = [];
    this.logger = getLogger('observer-locator');
  }

  ObserverLocator.prototype.getObserver = function getObserver(obj, propertyName) {
    var observersLookup = obj.__observers__;
    var observer = void 0;

    if (observersLookup && propertyName in observersLookup) {
      return observersLookup[propertyName];
    }

    observer = this.createPropertyObserver(obj, propertyName);

    if (!observer.doNotCache) {
      if (observersLookup === undefined) {
        observersLookup = this.getOrCreateObserversLookup(obj);
      }

      observersLookup[propertyName] = observer;
    }

    return observer;
  };

  ObserverLocator.prototype.getOrCreateObserversLookup = function getOrCreateObserversLookup(obj) {
    return obj.__observers__ || this.createObserversLookup(obj);
  };

  ObserverLocator.prototype.createObserversLookup = function createObserversLookup(obj) {
    var value = {};

    if (!Reflect.defineProperty(obj, '__observers__', {
      enumerable: false,
      configurable: false,
      writable: false,
      value: value
    })) {
      this.logger.warn('Cannot add observers to object', obj);
    }

    return value;
  };

  ObserverLocator.prototype.addAdapter = function addAdapter(adapter) {
    this.adapters.push(adapter);
  };

  ObserverLocator.prototype.getAdapterObserver = function getAdapterObserver(obj, propertyName, descriptor) {
    for (var i = 0, ii = this.adapters.length; i < ii; i++) {
      var adapter = this.adapters[i];
      var observer = adapter.getObserver(obj, propertyName, descriptor);
      if (observer) {
        return observer;
      }
    }
    return null;
  };

  ObserverLocator.prototype.createPropertyObserver = function createPropertyObserver(obj, propertyName) {
    var descriptor = void 0;
    var handler = void 0;
    var xlinkResult = void 0;

    if (!(obj instanceof Object)) {
      return new PrimitiveObserver(obj, propertyName);
    }

    if (obj instanceof DOM.Element) {
      if (propertyName === 'class') {
        return new ClassObserver(obj);
      }
      if (propertyName === 'style' || propertyName === 'css') {
        return new StyleObserver(obj, propertyName);
      }
      handler = this.eventManager.getElementHandler(obj, propertyName);
      if (propertyName === 'value' && obj.tagName.toLowerCase() === 'select') {
        return new SelectValueObserver(obj, handler, this);
      }
      if (propertyName === 'checked' && obj.tagName.toLowerCase() === 'input') {
        return new CheckedObserver(obj, handler, this);
      }
      if (handler) {
        return new ValueAttributeObserver(obj, propertyName, handler);
      }
      xlinkResult = /^xlink:(.+)$/.exec(propertyName);
      if (xlinkResult) {
        return new XLinkAttributeObserver(obj, propertyName, xlinkResult[1]);
      }
      if (propertyName === 'role' && (obj instanceof DOM.Element || obj instanceof DOM.SVGElement) || /^\w+:|^data-|^aria-/.test(propertyName) || obj instanceof DOM.SVGElement && this.svgAnalyzer.isStandardSvgAttribute(obj.nodeName, propertyName)) {
        return new DataAttributeObserver(obj, propertyName);
      }
    }

    descriptor = Object.getPropertyDescriptor(obj, propertyName);

    if (hasDeclaredDependencies(descriptor)) {
      return createComputedObserver(obj, propertyName, descriptor, this);
    }

    if (descriptor) {
      var existingGetterOrSetter = descriptor.get || descriptor.set;
      if (existingGetterOrSetter) {
        if (existingGetterOrSetter.getObserver) {
          return existingGetterOrSetter.getObserver(obj);
        }

        var adapterObserver = this.getAdapterObserver(obj, propertyName, descriptor);
        if (adapterObserver) {
          return adapterObserver;
        }
        return new DirtyCheckProperty(this.dirtyChecker, obj, propertyName);
      }
    }

    if (obj instanceof Array) {
      if (propertyName === 'length') {
        return this.getArrayObserver(obj).getLengthObserver();
      }

      return new DirtyCheckProperty(this.dirtyChecker, obj, propertyName);
    } else if (obj instanceof Map) {
      if (propertyName === 'size') {
        return this.getMapObserver(obj).getLengthObserver();
      }

      return new DirtyCheckProperty(this.dirtyChecker, obj, propertyName);
    } else if (obj instanceof Set) {
      if (propertyName === 'size') {
        return this.getSetObserver(obj).getLengthObserver();
      }

      return new DirtyCheckProperty(this.dirtyChecker, obj, propertyName);
    }

    return new SetterObserver(this.taskQueue, obj, propertyName);
  };

  ObserverLocator.prototype.getAccessor = function getAccessor(obj, propertyName) {
    if (obj instanceof DOM.Element) {
      if (propertyName === 'class' || propertyName === 'style' || propertyName === 'css' || propertyName === 'value' && (obj.tagName.toLowerCase() === 'input' || obj.tagName.toLowerCase() === 'select') || propertyName === 'checked' && obj.tagName.toLowerCase() === 'input' || propertyName === 'model' && obj.tagName.toLowerCase() === 'input' || /^xlink:.+$/.exec(propertyName)) {
        return this.getObserver(obj, propertyName);
      }
      if (/^\w+:|^data-|^aria-/.test(propertyName) || obj instanceof DOM.SVGElement && this.svgAnalyzer.isStandardSvgAttribute(obj.nodeName, propertyName) || obj.tagName.toLowerCase() === 'img' && propertyName === 'src' || obj.tagName.toLowerCase() === 'a' && propertyName === 'href') {
        return dataAttributeAccessor;
      }
    }
    return propertyAccessor;
  };

  ObserverLocator.prototype.getArrayObserver = function getArrayObserver(array) {
    return _getArrayObserver(this.taskQueue, array);
  };

  ObserverLocator.prototype.getMapObserver = function getMapObserver(map) {
    return _getMapObserver(this.taskQueue, map);
  };

  ObserverLocator.prototype.getSetObserver = function getSetObserver(set) {
    return _getSetObserver(this.taskQueue, set);
  };

  return ObserverLocator;
}(), _class12.inject = [TaskQueue, EventManager, DirtyChecker, SVGAnalyzer, Parser], _temp);

var BindingExpression = function () {
  function BindingExpression(observerLocator, targetProperty, sourceExpression, mode, lookupFunctions, attribute) {
    

    this.observerLocator = observerLocator;
    this.targetProperty = targetProperty;
    this.sourceExpression = sourceExpression;
    this.mode = mode;
    this.lookupFunctions = lookupFunctions;
    this.attribute = attribute;
    this.discrete = false;
  }

  BindingExpression.prototype.createBinding = function createBinding(target) {
    return new Binding(this.observerLocator, this.sourceExpression, target, this.targetProperty, this.mode, this.lookupFunctions);
  };

  return BindingExpression;
}();

var Binding = (_dec10 = connectable(), _dec10(_class13 = function () {
  function Binding(observerLocator, sourceExpression, target, targetProperty, mode, lookupFunctions) {
    

    this.observerLocator = observerLocator;
    this.sourceExpression = sourceExpression;
    this.target = target;
    this.targetProperty = targetProperty;
    this.mode = mode;
    this.lookupFunctions = lookupFunctions;
  }

  Binding.prototype.updateTarget = function updateTarget(value) {
    this.targetObserver.setValue(value, this.target, this.targetProperty);
  };

  Binding.prototype.updateSource = function updateSource(value) {
    this.sourceExpression.assign(this.source, value, this.lookupFunctions);
  };

  Binding.prototype.call = function call(context, newValue, oldValue) {
    if (!this.isBound) {
      return;
    }
    if (context === sourceContext) {
      oldValue = this.targetObserver.getValue(this.target, this.targetProperty);
      newValue = this.sourceExpression.evaluate(this.source, this.lookupFunctions);
      if (newValue !== oldValue) {
        this.updateTarget(newValue);
      }
      if (this.mode !== bindingMode.oneTime) {
        this._version++;
        this.sourceExpression.connect(this, this.source);
        this.unobserve(false);
      }
      return;
    }
    if (context === targetContext) {
      if (newValue !== this.sourceExpression.evaluate(this.source, this.lookupFunctions)) {
        this.updateSource(newValue);
      }
      return;
    }
    throw new Error('Unexpected call context ' + context);
  };

  Binding.prototype.bind = function bind(source) {
    if (this.isBound) {
      if (this.source === source) {
        return;
      }
      this.unbind();
    }
    this.isBound = true;
    this.source = source;

    if (this.sourceExpression.bind) {
      this.sourceExpression.bind(this, source, this.lookupFunctions);
    }

    var mode = this.mode;
    if (!this.targetObserver) {
      var method = mode === bindingMode.twoWay || mode === bindingMode.fromView ? 'getObserver' : 'getAccessor';
      this.targetObserver = this.observerLocator[method](this.target, this.targetProperty);
    }

    if ('bind' in this.targetObserver) {
      this.targetObserver.bind();
    }
    if (this.mode !== bindingMode.fromView) {
      var value = this.sourceExpression.evaluate(source, this.lookupFunctions);
      this.updateTarget(value);
    }

    if (mode === bindingMode.oneTime) {
      return;
    } else if (mode === bindingMode.toView) {
      enqueueBindingConnect(this);
    } else if (mode === bindingMode.twoWay) {
      this.sourceExpression.connect(this, source);
      this.targetObserver.subscribe(targetContext, this);
    } else if (mode === bindingMode.fromView) {
      this.targetObserver.subscribe(targetContext, this);
    }
  };

  Binding.prototype.unbind = function unbind() {
    if (!this.isBound) {
      return;
    }
    this.isBound = false;
    if (this.sourceExpression.unbind) {
      this.sourceExpression.unbind(this, this.source);
    }
    this.source = null;
    if ('unbind' in this.targetObserver) {
      this.targetObserver.unbind();
    }
    if (this.targetObserver.unsubscribe) {
      this.targetObserver.unsubscribe(targetContext, this);
    }
    this.unobserve(true);
  };

  Binding.prototype.connect = function connect(evaluate) {
    if (!this.isBound) {
      return;
    }
    if (evaluate) {
      var value = this.sourceExpression.evaluate(this.source, this.lookupFunctions);
      this.updateTarget(value);
    }
    this.sourceExpression.connect(this, this.source);
  };

  return Binding;
}()) || _class13);

var ValueConverterResource = function () {
  function ValueConverterResource(name) {
    

    this.name = name;
  }

  ValueConverterResource.convention = function convention(name) {
    if (name.endsWith('ValueConverter')) {
      return new ValueConverterResource(camelCase(name.substring(0, name.length - 14)));
    }
  };

  ValueConverterResource.prototype.initialize = function initialize(container, target) {
    this.instance = container.get(target);
  };

  ValueConverterResource.prototype.register = function register(registry, name) {
    registry.registerValueConverter(name || this.name, this.instance);
  };

  ValueConverterResource.prototype.load = function load(container, target) {};

  return ValueConverterResource;
}();

function valueConverter(nameOrTarget) {
  if (nameOrTarget === undefined || typeof nameOrTarget === 'string') {
    return function (target) {
      metadata.define(metadata.resource, new ValueConverterResource(nameOrTarget), target);
    };
  }

  metadata.define(metadata.resource, new ValueConverterResource(), nameOrTarget);
}

var BindingBehaviorResource = function () {
  function BindingBehaviorResource(name) {
    

    this.name = name;
  }

  BindingBehaviorResource.convention = function convention(name) {
    if (name.endsWith('BindingBehavior')) {
      return new BindingBehaviorResource(camelCase(name.substring(0, name.length - 15)));
    }
  };

  BindingBehaviorResource.prototype.initialize = function initialize(container, target) {
    this.instance = container.get(target);
  };

  BindingBehaviorResource.prototype.register = function register(registry, name) {
    registry.registerBindingBehavior(name || this.name, this.instance);
  };

  BindingBehaviorResource.prototype.load = function load(container, target) {};

  return BindingBehaviorResource;
}();

function bindingBehavior(nameOrTarget) {
  if (nameOrTarget === undefined || typeof nameOrTarget === 'string') {
    return function (target) {
      metadata.define(metadata.resource, new BindingBehaviorResource(nameOrTarget), target);
    };
  }

  metadata.define(metadata.resource, new BindingBehaviorResource(), nameOrTarget);
}

var LookupFunctions = {
  bindingBehaviors: function bindingBehaviors(name) {
    return null;
  },
  valueConverters: function valueConverters(name) {
    return null;
  }
};

var BindingEngine = (_temp2 = _class14 = function () {
  function BindingEngine(observerLocator, parser) {
    

    this.observerLocator = observerLocator;
    this.parser = parser;
  }

  BindingEngine.prototype.createBindingExpression = function createBindingExpression(targetProperty, sourceExpression) {
    var mode = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : bindingMode.toView;
    var lookupFunctions = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : LookupFunctions;

    return new BindingExpression(this.observerLocator, targetProperty, this.parser.parse(sourceExpression), mode, lookupFunctions);
  };

  BindingEngine.prototype.propertyObserver = function propertyObserver(obj, propertyName) {
    var _this27 = this;

    return {
      subscribe: function subscribe(callback) {
        var observer = _this27.observerLocator.getObserver(obj, propertyName);
        observer.subscribe(callback);
        return {
          dispose: function dispose() {
            return observer.unsubscribe(callback);
          }
        };
      }
    };
  };

  BindingEngine.prototype.collectionObserver = function collectionObserver(collection) {
    var _this28 = this;

    return {
      subscribe: function subscribe(callback) {
        var observer = void 0;
        if (collection instanceof Array) {
          observer = _this28.observerLocator.getArrayObserver(collection);
        } else if (collection instanceof Map) {
          observer = _this28.observerLocator.getMapObserver(collection);
        } else if (collection instanceof Set) {
          observer = _this28.observerLocator.getSetObserver(collection);
        } else {
          throw new Error('collection must be an instance of Array, Map or Set.');
        }
        observer.subscribe(callback);
        return {
          dispose: function dispose() {
            return observer.unsubscribe(callback);
          }
        };
      }
    };
  };

  BindingEngine.prototype.expressionObserver = function expressionObserver(bindingContext, expression) {
    var scope = { bindingContext: bindingContext, overrideContext: createOverrideContext(bindingContext) };
    return new ExpressionObserver(scope, this.parser.parse(expression), this.observerLocator, LookupFunctions);
  };

  BindingEngine.prototype.parseExpression = function parseExpression(expression) {
    return this.parser.parse(expression);
  };

  BindingEngine.prototype.registerAdapter = function registerAdapter(adapter) {
    this.observerLocator.addAdapter(adapter);
  };

  return BindingEngine;
}(), _class14.inject = [ObserverLocator, Parser], _temp2);

var setProto = Set.prototype;

function _getSetObserver(taskQueue, set) {
  return ModifySetObserver.for(taskQueue, set);
}

var ModifySetObserver = function (_ModifyCollectionObse3) {
  _inherits(ModifySetObserver, _ModifyCollectionObse3);

  function ModifySetObserver(taskQueue, set) {
    

    return _possibleConstructorReturn(this, _ModifyCollectionObse3.call(this, taskQueue, set));
  }

  ModifySetObserver.for = function _for(taskQueue, set) {
    if (!('__set_observer__' in set)) {
      Reflect.defineProperty(set, '__set_observer__', {
        value: ModifySetObserver.create(taskQueue, set),
        enumerable: false, configurable: false
      });
    }
    return set.__set_observer__;
  };

  ModifySetObserver.create = function create(taskQueue, set) {
    var observer = new ModifySetObserver(taskQueue, set);

    var proto = setProto;
    if (proto.add !== set.add || proto.delete !== set.delete || proto.clear !== set.clear) {
      proto = {
        add: set.add,
        delete: set.delete,
        clear: set.clear
      };
    }

    set.add = function () {
      var type = 'add';
      var oldSize = set.size;
      var methodCallResult = proto.add.apply(set, arguments);
      var hasValue = set.size === oldSize;
      if (!hasValue) {
        observer.addChangeRecord({
          type: type,
          object: set,
          value: Array.from(set).pop()
        });
      }
      return methodCallResult;
    };

    set.delete = function () {
      var hasValue = set.has(arguments[0]);
      var methodCallResult = proto.delete.apply(set, arguments);
      if (hasValue) {
        observer.addChangeRecord({
          type: 'delete',
          object: set,
          value: arguments[0]
        });
      }
      return methodCallResult;
    };

    set.clear = function () {
      var methodCallResult = proto.clear.apply(set, arguments);
      observer.addChangeRecord({
        type: 'clear',
        object: set
      });
      return methodCallResult;
    };

    return observer;
  };

  return ModifySetObserver;
}(ModifyCollectionObserver);

var signals = {};

function connectBindingToSignal(binding, name) {
  if (!signals.hasOwnProperty(name)) {
    signals[name] = 0;
  }
  binding.observeProperty(signals, name);
}

var _createClass$2 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof$4 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _class$1, _temp$1, _class2$1, _temp2$1, _dec$1, _class3$1, _dec2$1, _class4, _dec3$1, _class5$1, _dec4$1, _class6, _dec5$1, _class7$1, _dec6$1, _class8$1, _class9$1, _temp3, _class10$1, _temp4, _class12$1, _dec7$1, _class14$1, _dec8$1, _class15, _class16, _temp5, _dec9$1, _class17, _dec10$1, _class18, _dec11, _class19;

var animationEvent = {
  enterBegin: 'animation:enter:begin',
  enterActive: 'animation:enter:active',
  enterDone: 'animation:enter:done',
  enterTimeout: 'animation:enter:timeout',

  leaveBegin: 'animation:leave:begin',
  leaveActive: 'animation:leave:active',
  leaveDone: 'animation:leave:done',
  leaveTimeout: 'animation:leave:timeout',

  staggerNext: 'animation:stagger:next',

  removeClassBegin: 'animation:remove-class:begin',
  removeClassActive: 'animation:remove-class:active',
  removeClassDone: 'animation:remove-class:done',
  removeClassTimeout: 'animation:remove-class:timeout',

  addClassBegin: 'animation:add-class:begin',
  addClassActive: 'animation:add-class:active',
  addClassDone: 'animation:add-class:done',
  addClassTimeout: 'animation:add-class:timeout',

  animateBegin: 'animation:animate:begin',
  animateActive: 'animation:animate:active',
  animateDone: 'animation:animate:done',
  animateTimeout: 'animation:animate:timeout',

  sequenceBegin: 'animation:sequence:begin',
  sequenceDone: 'animation:sequence:done'
};

var Animator = function () {
  function Animator() {
    
  }

  Animator.prototype.enter = function enter(element) {
    return Promise.resolve(false);
  };

  Animator.prototype.leave = function leave(element) {
    return Promise.resolve(false);
  };

  Animator.prototype.removeClass = function removeClass(element, className) {
    element.classList.remove(className);
    return Promise.resolve(false);
  };

  Animator.prototype.addClass = function addClass(element, className) {
    element.classList.add(className);
    return Promise.resolve(false);
  };

  Animator.prototype.animate = function animate(element, className) {
    return Promise.resolve(false);
  };

  Animator.prototype.runSequence = function runSequence(animations) {};

  Animator.prototype.registerEffect = function registerEffect(effectName, properties) {};

  Animator.prototype.unregisterEffect = function unregisterEffect(effectName) {};

  return Animator;
}();

var CompositionTransactionNotifier = function () {
  function CompositionTransactionNotifier(owner) {
    

    this.owner = owner;
    this.owner._compositionCount++;
  }

  CompositionTransactionNotifier.prototype.done = function done() {
    this.owner._compositionCount--;
    this.owner._tryCompleteTransaction();
  };

  return CompositionTransactionNotifier;
}();

var CompositionTransactionOwnershipToken = function () {
  function CompositionTransactionOwnershipToken(owner) {
    

    this.owner = owner;
    this.owner._ownershipToken = this;
    this.thenable = this._createThenable();
  }

  CompositionTransactionOwnershipToken.prototype.waitForCompositionComplete = function waitForCompositionComplete() {
    this.owner._tryCompleteTransaction();
    return this.thenable;
  };

  CompositionTransactionOwnershipToken.prototype.resolve = function resolve() {
    this._resolveCallback();
  };

  CompositionTransactionOwnershipToken.prototype._createThenable = function _createThenable() {
    var _this = this;

    return new Promise(function (resolve, reject) {
      _this._resolveCallback = resolve;
    });
  };

  return CompositionTransactionOwnershipToken;
}();

var CompositionTransaction = function () {
  function CompositionTransaction() {
    

    this._ownershipToken = null;
    this._compositionCount = 0;
  }

  CompositionTransaction.prototype.tryCapture = function tryCapture() {
    return this._ownershipToken === null ? new CompositionTransactionOwnershipToken(this) : null;
  };

  CompositionTransaction.prototype.enlist = function enlist() {
    return new CompositionTransactionNotifier(this);
  };

  CompositionTransaction.prototype._tryCompleteTransaction = function _tryCompleteTransaction() {
    if (this._compositionCount <= 0) {
      this._compositionCount = 0;

      if (this._ownershipToken !== null) {
        var token = this._ownershipToken;
        this._ownershipToken = null;
        token.resolve();
      }
    }
  };

  return CompositionTransaction;
}();

var capitalMatcher = /([A-Z])/g;

function addHyphenAndLower(char) {
  return '-' + char.toLowerCase();
}

function _hyphenate(name) {
  return (name.charAt(0).toLowerCase() + name.slice(1)).replace(capitalMatcher, addHyphenAndLower);
}

function _isAllWhitespace(node) {
  return !(node.auInterpolationTarget || /[^\t\n\r ]/.test(node.textContent));
}

var ViewEngineHooksResource = function () {
  function ViewEngineHooksResource() {
    
  }

  ViewEngineHooksResource.prototype.initialize = function initialize(container, target) {
    this.instance = container.get(target);
  };

  ViewEngineHooksResource.prototype.register = function register(registry, name) {
    registry.registerViewEngineHooks(this.instance);
  };

  ViewEngineHooksResource.prototype.load = function load(container, target) {};

  ViewEngineHooksResource.convention = function convention(name) {
    if (name.endsWith('ViewEngineHooks')) {
      return new ViewEngineHooksResource();
    }
  };

  return ViewEngineHooksResource;
}();

function viewEngineHooks(target) {
  var deco = function deco(t) {
    metadata.define(metadata.resource, new ViewEngineHooksResource(), t);
  };

  return target ? deco(target) : deco;
}

var ElementEvents = (_temp$1 = _class$1 = function () {
  function ElementEvents(element) {
    

    this.element = element;
    this.subscriptions = {};
  }

  ElementEvents.prototype._enqueueHandler = function _enqueueHandler(handler) {
    this.subscriptions[handler.eventName] = this.subscriptions[handler.eventName] || [];
    this.subscriptions[handler.eventName].push(handler);
  };

  ElementEvents.prototype._dequeueHandler = function _dequeueHandler(handler) {
    var index = void 0;
    var subscriptions = this.subscriptions[handler.eventName];
    if (subscriptions) {
      index = subscriptions.indexOf(handler);
      if (index > -1) {
        subscriptions.splice(index, 1);
      }
    }
    return handler;
  };

  ElementEvents.prototype.publish = function publish(eventName) {
    var detail = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var bubbles = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
    var cancelable = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;

    var event = DOM.createCustomEvent(eventName, { cancelable: cancelable, bubbles: bubbles, detail: detail });
    this.element.dispatchEvent(event);
  };

  ElementEvents.prototype.subscribe = function subscribe(eventName, handler, captureOrOptions) {
    if (typeof handler === 'function') {
      if (captureOrOptions === undefined) {
        captureOrOptions = ElementEvents.defaultListenerOptions;
      }
      var eventHandler = new EventHandlerImpl(this, eventName, handler, captureOrOptions, false);
      return eventHandler;
    }

    return undefined;
  };

  ElementEvents.prototype.subscribeOnce = function subscribeOnce(eventName, handler, captureOrOptions) {
    if (typeof handler === 'function') {
      if (captureOrOptions === undefined) {
        captureOrOptions = ElementEvents.defaultListenerOptions;
      }
      var eventHandler = new EventHandlerImpl(this, eventName, handler, captureOrOptions, true);
      return eventHandler;
    }

    return undefined;
  };

  ElementEvents.prototype.dispose = function dispose(eventName) {
    if (eventName && typeof eventName === 'string') {
      var subscriptions = this.subscriptions[eventName];
      if (subscriptions) {
        while (subscriptions.length) {
          var subscription = subscriptions.pop();
          if (subscription) {
            subscription.dispose();
          }
        }
      }
    } else {
      this.disposeAll();
    }
  };

  ElementEvents.prototype.disposeAll = function disposeAll() {
    for (var _key in this.subscriptions) {
      this.dispose(_key);
    }
  };

  return ElementEvents;
}(), _class$1.defaultListenerOptions = true, _temp$1);

var EventHandlerImpl = function () {
  function EventHandlerImpl(owner, eventName, handler, captureOrOptions, once) {
    

    this.owner = owner;
    this.eventName = eventName;
    this.handler = handler;

    this.capture = typeof captureOrOptions === 'boolean' ? captureOrOptions : captureOrOptions.capture;
    this.bubbles = !this.capture;
    this.captureOrOptions = captureOrOptions;
    this.once = once;
    owner.element.addEventListener(eventName, this, captureOrOptions);
    owner._enqueueHandler(this);
  }

  EventHandlerImpl.prototype.handleEvent = function handleEvent(e) {
    var fn = this.handler;
    fn(e);
    if (this.once) {
      this.dispose();
    }
  };

  EventHandlerImpl.prototype.dispose = function dispose() {
    this.owner.element.removeEventListener(this.eventName, this, this.captureOrOptions);
    this.owner._dequeueHandler(this);
    this.owner = this.handler = null;
  };

  return EventHandlerImpl;
}();

var ResourceLoadContext = function () {
  function ResourceLoadContext() {
    

    this.dependencies = {};
  }

  ResourceLoadContext.prototype.addDependency = function addDependency(url) {
    this.dependencies[url] = true;
  };

  ResourceLoadContext.prototype.hasDependency = function hasDependency(url) {
    return url in this.dependencies;
  };

  return ResourceLoadContext;
}();

var ViewCompileInstruction = function ViewCompileInstruction() {
  var targetShadowDOM = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
  var compileSurrogate = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

  

  this.targetShadowDOM = targetShadowDOM;
  this.compileSurrogate = compileSurrogate;
  this.associatedModuleId = null;
};

ViewCompileInstruction.normal = new ViewCompileInstruction();

var BehaviorInstruction = function () {
  function BehaviorInstruction() {
    
  }

  BehaviorInstruction.enhance = function enhance() {
    var instruction = new BehaviorInstruction();
    instruction.enhance = true;
    return instruction;
  };

  BehaviorInstruction.unitTest = function unitTest(type, attributes) {
    var instruction = new BehaviorInstruction();
    instruction.type = type;
    instruction.attributes = attributes || {};
    return instruction;
  };

  BehaviorInstruction.element = function element(node, type) {
    var instruction = new BehaviorInstruction();
    instruction.type = type;
    instruction.attributes = {};
    instruction.anchorIsContainer = !(node.hasAttribute('containerless') || type.containerless);
    instruction.initiatedByBehavior = true;
    return instruction;
  };

  BehaviorInstruction.attribute = function attribute(attrName, type) {
    var instruction = new BehaviorInstruction();
    instruction.attrName = attrName;
    instruction.type = type || null;
    instruction.attributes = {};
    return instruction;
  };

  BehaviorInstruction.dynamic = function dynamic(host, viewModel, viewFactory) {
    var instruction = new BehaviorInstruction();
    instruction.host = host;
    instruction.viewModel = viewModel;
    instruction.viewFactory = viewFactory;
    instruction.inheritBindingContext = true;
    return instruction;
  };

  return BehaviorInstruction;
}();

var biProto = BehaviorInstruction.prototype;
biProto.initiatedByBehavior = false;
biProto.enhance = false;
biProto.partReplacements = null;
biProto.viewFactory = null;
biProto.originalAttrName = null;
biProto.skipContentProcessing = false;
biProto.contentFactory = null;
biProto.viewModel = null;
biProto.anchorIsContainer = false;
biProto.host = null;
biProto.attributes = null;
biProto.type = null;
biProto.attrName = null;
biProto.inheritBindingContext = false;

BehaviorInstruction.normal = new BehaviorInstruction();

var TargetInstruction = (_temp2$1 = _class2$1 = function () {
  function TargetInstruction() {
    
  }

  TargetInstruction.shadowSlot = function shadowSlot(parentInjectorId) {
    var instruction = new TargetInstruction();
    instruction.parentInjectorId = parentInjectorId;
    instruction.shadowSlot = true;
    return instruction;
  };

  TargetInstruction.contentExpression = function contentExpression(expression) {
    var instruction = new TargetInstruction();
    instruction.contentExpression = expression;
    return instruction;
  };

  TargetInstruction.letElement = function letElement(expressions) {
    var instruction = new TargetInstruction();
    instruction.expressions = expressions;
    instruction.letElement = true;
    return instruction;
  };

  TargetInstruction.lifting = function lifting(parentInjectorId, liftingInstruction) {
    var instruction = new TargetInstruction();
    instruction.parentInjectorId = parentInjectorId;
    instruction.expressions = TargetInstruction.noExpressions;
    instruction.behaviorInstructions = [liftingInstruction];
    instruction.viewFactory = liftingInstruction.viewFactory;
    instruction.providers = [liftingInstruction.type.target];
    instruction.lifting = true;
    return instruction;
  };

  TargetInstruction.normal = function normal(injectorId, parentInjectorId, providers, behaviorInstructions, expressions, elementInstruction) {
    var instruction = new TargetInstruction();
    instruction.injectorId = injectorId;
    instruction.parentInjectorId = parentInjectorId;
    instruction.providers = providers;
    instruction.behaviorInstructions = behaviorInstructions;
    instruction.expressions = expressions;
    instruction.anchorIsContainer = elementInstruction ? elementInstruction.anchorIsContainer : true;
    instruction.elementInstruction = elementInstruction;
    return instruction;
  };

  TargetInstruction.surrogate = function surrogate(providers, behaviorInstructions, expressions, values) {
    var instruction = new TargetInstruction();
    instruction.expressions = expressions;
    instruction.behaviorInstructions = behaviorInstructions;
    instruction.providers = providers;
    instruction.values = values;
    return instruction;
  };

  return TargetInstruction;
}(), _class2$1.noExpressions = Object.freeze([]), _temp2$1);

var tiProto = TargetInstruction.prototype;

tiProto.injectorId = null;
tiProto.parentInjectorId = null;

tiProto.shadowSlot = false;
tiProto.slotName = null;
tiProto.slotFallbackFactory = null;

tiProto.contentExpression = null;
tiProto.letElement = false;

tiProto.expressions = null;
tiProto.expressions = null;
tiProto.providers = null;

tiProto.viewFactory = null;

tiProto.anchorIsContainer = false;
tiProto.elementInstruction = null;
tiProto.lifting = false;

tiProto.values = null;

var viewStrategy = protocol.create('aurelia:view-strategy', {
  validate: function validate(target) {
    if (!(typeof target.loadViewFactory === 'function')) {
      return 'View strategies must implement: loadViewFactory(viewEngine: ViewEngine, compileInstruction: ViewCompileInstruction, loadContext?: ResourceLoadContext): Promise<ViewFactory>';
    }

    return true;
  },
  compose: function compose(target) {
    if (!(typeof target.makeRelativeTo === 'function')) {
      target.makeRelativeTo = PLATFORM.noop;
    }
  }
});

var RelativeViewStrategy = (_dec$1 = viewStrategy(), _dec$1(_class3$1 = function () {
  function RelativeViewStrategy(path) {
    

    this.path = path;
    this.absolutePath = null;
  }

  RelativeViewStrategy.prototype.loadViewFactory = function loadViewFactory(viewEngine, compileInstruction, loadContext, target) {
    if (this.absolutePath === null && this.moduleId) {
      this.absolutePath = relativeToFile(this.path, this.moduleId);
    }

    compileInstruction.associatedModuleId = this.moduleId;
    return viewEngine.loadViewFactory(this.absolutePath || this.path, compileInstruction, loadContext, target);
  };

  RelativeViewStrategy.prototype.makeRelativeTo = function makeRelativeTo(file) {
    if (this.absolutePath === null) {
      this.absolutePath = relativeToFile(this.path, file);
    }
  };

  return RelativeViewStrategy;
}()) || _class3$1);

var ConventionalViewStrategy = (_dec2$1 = viewStrategy(), _dec2$1(_class4 = function () {
  function ConventionalViewStrategy(viewLocator, origin) {
    

    this.moduleId = origin.moduleId;
    this.viewUrl = viewLocator.convertOriginToViewUrl(origin);
  }

  ConventionalViewStrategy.prototype.loadViewFactory = function loadViewFactory(viewEngine, compileInstruction, loadContext, target) {
    compileInstruction.associatedModuleId = this.moduleId;
    return viewEngine.loadViewFactory(this.viewUrl, compileInstruction, loadContext, target);
  };

  return ConventionalViewStrategy;
}()) || _class4);

var NoViewStrategy = (_dec3$1 = viewStrategy(), _dec3$1(_class5$1 = function () {
  function NoViewStrategy(dependencies, dependencyBaseUrl) {
    

    this.dependencies = dependencies || null;
    this.dependencyBaseUrl = dependencyBaseUrl || '';
  }

  NoViewStrategy.prototype.loadViewFactory = function loadViewFactory(viewEngine, compileInstruction, loadContext, target) {
    var entry = this.entry;
    var dependencies = this.dependencies;

    if (entry && entry.factoryIsReady) {
      return Promise.resolve(null);
    }

    this.entry = entry = new TemplateRegistryEntry(this.moduleId || this.dependencyBaseUrl);

    entry.dependencies = [];
    entry.templateIsLoaded = true;

    if (dependencies !== null) {
      for (var i = 0, ii = dependencies.length; i < ii; ++i) {
        var current = dependencies[i];

        if (typeof current === 'string' || typeof current === 'function') {
          entry.addDependency(current);
        } else {
          entry.addDependency(current.from, current.as);
        }
      }
    }

    compileInstruction.associatedModuleId = this.moduleId;

    return viewEngine.loadViewFactory(entry, compileInstruction, loadContext, target);
  };

  return NoViewStrategy;
}()) || _class5$1);

var TemplateRegistryViewStrategy = (_dec4$1 = viewStrategy(), _dec4$1(_class6 = function () {
  function TemplateRegistryViewStrategy(moduleId, entry) {
    

    this.moduleId = moduleId;
    this.entry = entry;
  }

  TemplateRegistryViewStrategy.prototype.loadViewFactory = function loadViewFactory(viewEngine, compileInstruction, loadContext, target) {
    var entry = this.entry;

    if (entry.factoryIsReady) {
      return Promise.resolve(entry.factory);
    }

    compileInstruction.associatedModuleId = this.moduleId;
    return viewEngine.loadViewFactory(entry, compileInstruction, loadContext, target);
  };

  return TemplateRegistryViewStrategy;
}()) || _class6);

var InlineViewStrategy = (_dec5$1 = viewStrategy(), _dec5$1(_class7$1 = function () {
  function InlineViewStrategy(markup, dependencies, dependencyBaseUrl) {
    

    this.markup = markup;
    this.dependencies = dependencies || null;
    this.dependencyBaseUrl = dependencyBaseUrl || '';
  }

  InlineViewStrategy.prototype.loadViewFactory = function loadViewFactory(viewEngine, compileInstruction, loadContext, target) {
    var entry = this.entry;
    var dependencies = this.dependencies;

    if (entry && entry.factoryIsReady) {
      return Promise.resolve(entry.factory);
    }

    this.entry = entry = new TemplateRegistryEntry(this.moduleId || this.dependencyBaseUrl);
    entry.template = DOM.createTemplateFromMarkup(this.markup);

    if (dependencies !== null) {
      for (var i = 0, ii = dependencies.length; i < ii; ++i) {
        var current = dependencies[i];

        if (typeof current === 'string' || typeof current === 'function') {
          entry.addDependency(current);
        } else {
          entry.addDependency(current.from, current.as);
        }
      }
    }

    compileInstruction.associatedModuleId = this.moduleId;
    return viewEngine.loadViewFactory(entry, compileInstruction, loadContext, target);
  };

  return InlineViewStrategy;
}()) || _class7$1);

var StaticViewStrategy = (_dec6$1 = viewStrategy(), _dec6$1(_class8$1 = function () {
  function StaticViewStrategy(config) {
    

    if (typeof config === 'string' || config instanceof DOM.Element && config.tagName === 'TEMPLATE') {
      config = {
        template: config
      };
    }
    this.template = config.template;
    this.dependencies = config.dependencies || [];
    this.factoryIsReady = false;
    this.onReady = null;
    this.moduleId = 'undefined';
  }

  StaticViewStrategy.prototype.loadViewFactory = function loadViewFactory(viewEngine, compileInstruction, loadContext, target) {
    var _this2 = this;

    if (this.factoryIsReady) {
      return Promise.resolve(this.factory);
    }
    var deps = this.dependencies;
    deps = typeof deps === 'function' ? deps() : deps;
    deps = deps ? deps : [];
    deps = Array.isArray(deps) ? deps : [deps];

    return Promise.all(deps).then(function (dependencies) {
      var container = viewEngine.container;
      var appResources = viewEngine.appResources;
      var viewCompiler = viewEngine.viewCompiler;
      var viewResources = new ViewResources(appResources);

      var resource = void 0;
      var elDeps = [];

      if (target) {
        viewResources.autoRegister(container, target);
      }

      for (var _iterator = dependencies, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
        var _ref;

        if (_isArray) {
          if (_i >= _iterator.length) break;
          _ref = _iterator[_i++];
        } else {
          _i = _iterator.next();
          if (_i.done) break;
          _ref = _i.value;
        }

        var dep = _ref;

        if (typeof dep === 'function') {
          resource = viewResources.autoRegister(container, dep);
          if (resource.elementName !== null) {
            elDeps.push(resource);
          }
        } else if (dep && (typeof dep === 'undefined' ? 'undefined' : _typeof$4(dep)) === 'object') {
          for (var _key2 in dep) {
            var exported = dep[_key2];
            if (typeof exported === 'function') {
              resource = viewResources.autoRegister(container, exported);
              if (resource.elementName !== null) {
                elDeps.push(resource);
              }
            }
          }
        } else {
          throw new Error('dependency neither function nor object. Received: "' + (typeof dep === 'undefined' ? 'undefined' : _typeof$4(dep)) + '"');
        }
      }

      return Promise.all(elDeps.map(function (el) {
        return el.load(container, el.target);
      })).then(function () {
        var factory$$1 = _this2.template !== null ? viewCompiler.compile(_this2.template, viewResources, compileInstruction) : null;
        _this2.factoryIsReady = true;
        _this2.factory = factory$$1;
        return factory$$1;
      });
    });
  };

  return StaticViewStrategy;
}()) || _class8$1);

var ViewLocator = (_temp3 = _class9$1 = function () {
  function ViewLocator() {
    
  }

  ViewLocator.prototype.getViewStrategy = function getViewStrategy(value) {
    if (!value) {
      return null;
    }

    if ((typeof value === 'undefined' ? 'undefined' : _typeof$4(value)) === 'object' && 'getViewStrategy' in value) {
      var _origin = Origin.get(value.constructor);

      value = value.getViewStrategy();

      if (typeof value === 'string') {
        value = new RelativeViewStrategy(value);
      }

      viewStrategy.assert(value);

      if (_origin.moduleId) {
        value.makeRelativeTo(_origin.moduleId);
      }

      return value;
    }

    if (typeof value === 'string') {
      value = new RelativeViewStrategy(value);
    }

    if (viewStrategy.validate(value)) {
      return value;
    }

    if (typeof value !== 'function') {
      value = value.constructor;
    }

    if ('$view' in value) {
      var c = value.$view;
      var _view = void 0;
      c = typeof c === 'function' ? c.call(value) : c;
      if (c === null) {
        _view = new NoViewStrategy();
      } else {
        _view = c instanceof StaticViewStrategy ? c : new StaticViewStrategy(c);
      }
      metadata.define(ViewLocator.viewStrategyMetadataKey, _view, value);
      return _view;
    }

    var origin = Origin.get(value);
    var strategy = metadata.get(ViewLocator.viewStrategyMetadataKey, value);

    if (!strategy) {
      if (!origin.moduleId) {
        throw new Error('Cannot determine default view strategy for object.', value);
      }

      strategy = this.createFallbackViewStrategy(origin);
    } else if (origin.moduleId) {
      strategy.moduleId = origin.moduleId;
    }

    return strategy;
  };

  ViewLocator.prototype.createFallbackViewStrategy = function createFallbackViewStrategy(origin) {
    return new ConventionalViewStrategy(this, origin);
  };

  ViewLocator.prototype.convertOriginToViewUrl = function convertOriginToViewUrl(origin) {
    var moduleId = origin.moduleId;
    var id = moduleId.endsWith('.js') || moduleId.endsWith('.ts') ? moduleId.substring(0, moduleId.length - 3) : moduleId;
    return id + '.html';
  };

  return ViewLocator;
}(), _class9$1.viewStrategyMetadataKey = 'aurelia:view-strategy', _temp3);

function mi(name) {
  throw new Error('BindingLanguage must implement ' + name + '().');
}

var BindingLanguage = function () {
  function BindingLanguage() {
    
  }

  BindingLanguage.prototype.inspectAttribute = function inspectAttribute(resources, elementName, attrName, attrValue) {
    mi('inspectAttribute');
  };

  BindingLanguage.prototype.createAttributeInstruction = function createAttributeInstruction(resources, element, info, existingInstruction) {
    mi('createAttributeInstruction');
  };

  BindingLanguage.prototype.createLetExpressions = function createLetExpressions(resources, element) {
    mi('createLetExpressions');
  };

  BindingLanguage.prototype.inspectTextContent = function inspectTextContent(resources, value) {
    mi('inspectTextContent');
  };

  return BindingLanguage;
}();

var noNodes = Object.freeze([]);

var SlotCustomAttribute = function () {
  SlotCustomAttribute.inject = function inject$$1() {
    return [DOM.Element];
  };

  function SlotCustomAttribute(element) {
    

    this.element = element;
    this.element.auSlotAttribute = this;
  }

  SlotCustomAttribute.prototype.valueChanged = function valueChanged(newValue, oldValue) {};

  return SlotCustomAttribute;
}();

var PassThroughSlot = function () {
  function PassThroughSlot(anchor, name, destinationName, fallbackFactory) {
    

    this.anchor = anchor;
    this.anchor.viewSlot = this;
    this.name = name;
    this.destinationName = destinationName;
    this.fallbackFactory = fallbackFactory;
    this.destinationSlot = null;
    this.projections = 0;
    this.contentView = null;

    var attr = new SlotCustomAttribute(this.anchor);
    attr.value = this.destinationName;
  }

  PassThroughSlot.prototype.renderFallbackContent = function renderFallbackContent(view, nodes, projectionSource, index) {
    if (this.contentView === null) {
      this.contentView = this.fallbackFactory.create(this.ownerView.container);
      this.contentView.bind(this.ownerView.bindingContext, this.ownerView.overrideContext);

      var slots = Object.create(null);
      slots[this.destinationSlot.name] = this.destinationSlot;

      ShadowDOM.distributeView(this.contentView, slots, projectionSource, index, this.destinationSlot.name);
    }
  };

  PassThroughSlot.prototype.passThroughTo = function passThroughTo(destinationSlot) {
    this.destinationSlot = destinationSlot;
  };

  PassThroughSlot.prototype.addNode = function addNode(view, node, projectionSource, index) {
    if (this.contentView !== null) {
      this.contentView.removeNodes();
      this.contentView.detached();
      this.contentView.unbind();
      this.contentView = null;
    }

    if (node.viewSlot instanceof PassThroughSlot) {
      node.viewSlot.passThroughTo(this);
      return;
    }

    this.projections++;
    this.destinationSlot.addNode(view, node, projectionSource, index);
  };

  PassThroughSlot.prototype.removeView = function removeView(view, projectionSource) {
    this.projections--;
    this.destinationSlot.removeView(view, projectionSource);

    if (this.needsFallbackRendering) {
      this.renderFallbackContent(null, noNodes, projectionSource);
    }
  };

  PassThroughSlot.prototype.removeAll = function removeAll(projectionSource) {
    this.projections = 0;
    this.destinationSlot.removeAll(projectionSource);

    if (this.needsFallbackRendering) {
      this.renderFallbackContent(null, noNodes, projectionSource);
    }
  };

  PassThroughSlot.prototype.projectFrom = function projectFrom(view, projectionSource) {
    this.destinationSlot.projectFrom(view, projectionSource);
  };

  PassThroughSlot.prototype.created = function created(ownerView) {
    this.ownerView = ownerView;
  };

  PassThroughSlot.prototype.bind = function bind(view) {
    if (this.contentView) {
      this.contentView.bind(view.bindingContext, view.overrideContext);
    }
  };

  PassThroughSlot.prototype.attached = function attached() {
    if (this.contentView) {
      this.contentView.attached();
    }
  };

  PassThroughSlot.prototype.detached = function detached() {
    if (this.contentView) {
      this.contentView.detached();
    }
  };

  PassThroughSlot.prototype.unbind = function unbind() {
    if (this.contentView) {
      this.contentView.unbind();
    }
  };

  _createClass$2(PassThroughSlot, [{
    key: 'needsFallbackRendering',
    get: function get() {
      return this.fallbackFactory && this.projections === 0;
    }
  }]);

  return PassThroughSlot;
}();

var ShadowSlot = function () {
  function ShadowSlot(anchor, name, fallbackFactory) {
    

    this.anchor = anchor;
    this.anchor.isContentProjectionSource = true;
    this.anchor.viewSlot = this;
    this.name = name;
    this.fallbackFactory = fallbackFactory;
    this.contentView = null;
    this.projections = 0;
    this.children = [];
    this.projectFromAnchors = null;
    this.destinationSlots = null;
  }

  ShadowSlot.prototype.addNode = function addNode(view, node, projectionSource, index, destination) {
    if (this.contentView !== null) {
      this.contentView.removeNodes();
      this.contentView.detached();
      this.contentView.unbind();
      this.contentView = null;
    }

    if (node.viewSlot instanceof PassThroughSlot) {
      node.viewSlot.passThroughTo(this);
      return;
    }

    if (this.destinationSlots !== null) {
      ShadowDOM.distributeNodes(view, [node], this.destinationSlots, this, index);
    } else {
      node.auOwnerView = view;
      node.auProjectionSource = projectionSource;
      node.auAssignedSlot = this;

      var anchor = this._findAnchor(view, node, projectionSource, index);
      var parent$$1 = anchor.parentNode;

      parent$$1.insertBefore(node, anchor);
      this.children.push(node);
      this.projections++;
    }
  };

  ShadowSlot.prototype.removeView = function removeView(view, projectionSource) {
    if (this.destinationSlots !== null) {
      ShadowDOM.undistributeView(view, this.destinationSlots, this);
    } else if (this.contentView && this.contentView.hasSlots) {
      ShadowDOM.undistributeView(view, this.contentView.slots, projectionSource);
    } else {
      var found = this.children.find(function (x) {
        return x.auSlotProjectFrom === projectionSource;
      });
      if (found) {
        var _children = found.auProjectionChildren;

        for (var i = 0, ii = _children.length; i < ii; ++i) {
          var _child = _children[i];

          if (_child.auOwnerView === view) {
            _children.splice(i, 1);
            view.fragment.appendChild(_child);
            i--;ii--;
            this.projections--;
          }
        }

        if (this.needsFallbackRendering) {
          this.renderFallbackContent(view, noNodes, projectionSource);
        }
      }
    }
  };

  ShadowSlot.prototype.removeAll = function removeAll(projectionSource) {
    if (this.destinationSlots !== null) {
      ShadowDOM.undistributeAll(this.destinationSlots, this);
    } else if (this.contentView && this.contentView.hasSlots) {
      ShadowDOM.undistributeAll(this.contentView.slots, projectionSource);
    } else {
      var found = this.children.find(function (x) {
        return x.auSlotProjectFrom === projectionSource;
      });

      if (found) {
        var _children2 = found.auProjectionChildren;
        for (var i = 0, ii = _children2.length; i < ii; ++i) {
          var _child2 = _children2[i];
          _child2.auOwnerView.fragment.appendChild(_child2);
          this.projections--;
        }

        found.auProjectionChildren = [];

        if (this.needsFallbackRendering) {
          this.renderFallbackContent(null, noNodes, projectionSource);
        }
      }
    }
  };

  ShadowSlot.prototype._findAnchor = function _findAnchor(view, node, projectionSource, index) {
    if (projectionSource) {
      var found = this.children.find(function (x) {
        return x.auSlotProjectFrom === projectionSource;
      });
      if (found) {
        if (index !== undefined) {
          var _children3 = found.auProjectionChildren;
          var viewIndex = -1;
          var lastView = void 0;

          for (var i = 0, ii = _children3.length; i < ii; ++i) {
            var current = _children3[i];

            if (current.auOwnerView !== lastView) {
              viewIndex++;
              lastView = current.auOwnerView;

              if (viewIndex >= index && lastView !== view) {
                _children3.splice(i, 0, node);
                return current;
              }
            }
          }
        }

        found.auProjectionChildren.push(node);
        return found;
      }
    }

    return this.anchor;
  };

  ShadowSlot.prototype.projectTo = function projectTo(slots) {
    this.destinationSlots = slots;
  };

  ShadowSlot.prototype.projectFrom = function projectFrom(view, projectionSource) {
    var anchor = DOM.createComment('anchor');
    var parent$$1 = this.anchor.parentNode;
    anchor.auSlotProjectFrom = projectionSource;
    anchor.auOwnerView = view;
    anchor.auProjectionChildren = [];
    parent$$1.insertBefore(anchor, this.anchor);
    this.children.push(anchor);

    if (this.projectFromAnchors === null) {
      this.projectFromAnchors = [];
    }

    this.projectFromAnchors.push(anchor);
  };

  ShadowSlot.prototype.renderFallbackContent = function renderFallbackContent(view, nodes, projectionSource, index) {
    if (this.contentView === null) {
      this.contentView = this.fallbackFactory.create(this.ownerView.container);
      this.contentView.bind(this.ownerView.bindingContext, this.ownerView.overrideContext);
      this.contentView.insertNodesBefore(this.anchor);
    }

    if (this.contentView.hasSlots) {
      var slots = this.contentView.slots;
      var projectFromAnchors = this.projectFromAnchors;

      if (projectFromAnchors !== null) {
        for (var slotName in slots) {
          var slot = slots[slotName];

          for (var i = 0, ii = projectFromAnchors.length; i < ii; ++i) {
            var anchor = projectFromAnchors[i];
            slot.projectFrom(anchor.auOwnerView, anchor.auSlotProjectFrom);
          }
        }
      }

      this.fallbackSlots = slots;
      ShadowDOM.distributeNodes(view, nodes, slots, projectionSource, index);
    }
  };

  ShadowSlot.prototype.created = function created(ownerView) {
    this.ownerView = ownerView;
  };

  ShadowSlot.prototype.bind = function bind(view) {
    if (this.contentView) {
      this.contentView.bind(view.bindingContext, view.overrideContext);
    }
  };

  ShadowSlot.prototype.attached = function attached() {
    if (this.contentView) {
      this.contentView.attached();
    }
  };

  ShadowSlot.prototype.detached = function detached() {
    if (this.contentView) {
      this.contentView.detached();
    }
  };

  ShadowSlot.prototype.unbind = function unbind() {
    if (this.contentView) {
      this.contentView.unbind();
    }
  };

  _createClass$2(ShadowSlot, [{
    key: 'needsFallbackRendering',
    get: function get() {
      return this.fallbackFactory && this.projections === 0;
    }
  }]);

  return ShadowSlot;
}();

var ShadowDOM = (_temp4 = _class10$1 = function () {
  function ShadowDOM() {
    
  }

  ShadowDOM.getSlotName = function getSlotName(node) {
    if (node.auSlotAttribute === undefined) {
      return ShadowDOM.defaultSlotKey;
    }

    return node.auSlotAttribute.value;
  };

  ShadowDOM.distributeView = function distributeView(view, slots, projectionSource, index, destinationOverride) {
    var nodes = void 0;

    if (view === null) {
      nodes = noNodes;
    } else {
      var childNodes = view.fragment.childNodes;
      var ii = childNodes.length;
      nodes = new Array(ii);

      for (var i = 0; i < ii; ++i) {
        nodes[i] = childNodes[i];
      }
    }

    ShadowDOM.distributeNodes(view, nodes, slots, projectionSource, index, destinationOverride);
  };

  ShadowDOM.undistributeView = function undistributeView(view, slots, projectionSource) {
    for (var slotName in slots) {
      slots[slotName].removeView(view, projectionSource);
    }
  };

  ShadowDOM.undistributeAll = function undistributeAll(slots, projectionSource) {
    for (var slotName in slots) {
      slots[slotName].removeAll(projectionSource);
    }
  };

  ShadowDOM.distributeNodes = function distributeNodes(view, nodes, slots, projectionSource, index, destinationOverride) {
    for (var i = 0, ii = nodes.length; i < ii; ++i) {
      var currentNode = nodes[i];
      var nodeType = currentNode.nodeType;

      if (currentNode.isContentProjectionSource) {
        currentNode.viewSlot.projectTo(slots);

        for (var slotName in slots) {
          slots[slotName].projectFrom(view, currentNode.viewSlot);
        }

        nodes.splice(i, 1);
        ii--;i--;
      } else if (nodeType === 1 || nodeType === 3 || currentNode.viewSlot instanceof PassThroughSlot) {
        if (nodeType === 3 && _isAllWhitespace(currentNode)) {
          nodes.splice(i, 1);
          ii--;i--;
        } else {
          var found = slots[destinationOverride || ShadowDOM.getSlotName(currentNode)];

          if (found) {
            found.addNode(view, currentNode, projectionSource, index);
            nodes.splice(i, 1);
            ii--;i--;
          }
        }
      } else {
        nodes.splice(i, 1);
        ii--;i--;
      }
    }

    for (var _slotName in slots) {
      var slot = slots[_slotName];

      if (slot.needsFallbackRendering) {
        slot.renderFallbackContent(view, nodes, projectionSource, index);
      }
    }
  };

  return ShadowDOM;
}(), _class10$1.defaultSlotKey = '__au-default-slot-key__', _temp4);

function register(lookup, name, resource, type) {
  if (!name) {
    return;
  }

  var existing = lookup[name];
  if (existing) {
    if (existing !== resource) {
      throw new Error('Attempted to register ' + type + ' when one with the same name already exists. Name: ' + name + '.');
    }

    return;
  }

  lookup[name] = resource;
}

function validateBehaviorName(name, type) {
  if (/[A-Z]/.test(name)) {
    var newName = _hyphenate(name);
    getLogger('templating').warn('\'' + name + '\' is not a valid ' + type + ' name and has been converted to \'' + newName + '\'. Upper-case letters are not allowed because the DOM is not case-sensitive.');
    return newName;
  }
  return name;
}

var conventionMark = '__au_resource__';

var ViewResources = function () {
  ViewResources.convention = function convention(target, existing) {
    var resource = void 0;

    if (existing && conventionMark in existing) {
      return existing;
    }
    if ('$resource' in target) {
      var config = target.$resource;

      if (typeof config === 'string') {
        resource = existing || new HtmlBehaviorResource();
        resource[conventionMark] = true;
        if (!resource.elementName) {
          resource.elementName = validateBehaviorName(config, 'custom element');
        }
      } else {
        if (typeof config === 'function') {
          config = config.call(target);
        }
        if (typeof config === 'string') {
          config = { name: config };
        }

        config = Object.assign({}, config);

        var resourceType = config.type || 'element';

        var _name = config.name;
        switch (resourceType) {
          case 'element':case 'attribute':
            resource = existing || new HtmlBehaviorResource();
            resource[conventionMark] = true;
            if (resourceType === 'element') {
              if (!resource.elementName) {
                resource.elementName = _name ? validateBehaviorName(_name, 'custom element') : _hyphenate(target.name);
              }
            } else {
              if (!resource.attributeName) {
                resource.attributeName = _name ? validateBehaviorName(_name, 'custom attribute') : _hyphenate(target.name);
              }
            }
            if ('templateController' in config) {
              config.liftsContent = config.templateController;
              delete config.templateController;
            }
            if ('defaultBindingMode' in config && resource.attributeDefaultBindingMode !== undefined) {
              config.attributeDefaultBindingMode = config.defaultBindingMode;
              delete config.defaultBindingMode;
            }

            delete config.name;

            Object.assign(resource, config);
            break;
          case 'valueConverter':
            resource = new ValueConverterResource(camelCase(_name || target.name));
            break;
          case 'bindingBehavior':
            resource = new BindingBehaviorResource(camelCase(_name || target.name));
            break;
          case 'viewEngineHooks':
            resource = new ViewEngineHooksResource();
            break;
        }
      }

      if (resource instanceof HtmlBehaviorResource) {
        var _bindables = typeof config === 'string' ? undefined : config.bindables;
        var currentProps = resource.properties;
        if (Array.isArray(_bindables)) {
          for (var i = 0, ii = _bindables.length; ii > i; ++i) {
            var prop = _bindables[i];
            if (!prop || typeof prop !== 'string' && !prop.name) {
              throw new Error('Invalid bindable property at "' + i + '" for class "' + target.name + '". Expected either a string or an object with "name" property.');
            }
            var newProp = new BindableProperty(prop);

            var existed = false;
            for (var j = 0, jj = currentProps.length; jj > j; ++j) {
              if (currentProps[j].name === newProp.name) {
                existed = true;
                break;
              }
            }
            if (existed) {
              continue;
            }
            newProp.registerWith(target, resource);
          }
        }
      }
    }
    return resource;
  };

  function ViewResources(parent$$1, viewUrl) {
    

    this.bindingLanguage = null;

    this.parent = parent$$1 || null;
    this.hasParent = this.parent !== null;
    this.viewUrl = viewUrl || '';
    this.lookupFunctions = {
      valueConverters: this.getValueConverter.bind(this),
      bindingBehaviors: this.getBindingBehavior.bind(this)
    };
    this.attributes = Object.create(null);
    this.elements = Object.create(null);
    this.valueConverters = Object.create(null);
    this.bindingBehaviors = Object.create(null);
    this.attributeMap = Object.create(null);
    this.values = Object.create(null);
    this.beforeCompile = this.afterCompile = this.beforeCreate = this.afterCreate = this.beforeBind = this.beforeUnbind = false;
  }

  ViewResources.prototype._tryAddHook = function _tryAddHook(obj, name) {
    if (typeof obj[name] === 'function') {
      var func = obj[name].bind(obj);
      var counter = 1;
      var callbackName = void 0;

      while (this[callbackName = name + counter.toString()] !== undefined) {
        counter++;
      }

      this[name] = true;
      this[callbackName] = func;
    }
  };

  ViewResources.prototype._invokeHook = function _invokeHook(name, one, two, three, four) {
    if (this.hasParent) {
      this.parent._invokeHook(name, one, two, three, four);
    }

    if (this[name]) {
      this[name + '1'](one, two, three, four);

      var callbackName = name + '2';
      if (this[callbackName]) {
        this[callbackName](one, two, three, four);

        callbackName = name + '3';
        if (this[callbackName]) {
          this[callbackName](one, two, three, four);

          var counter = 4;

          while (this[callbackName = name + counter.toString()] !== undefined) {
            this[callbackName](one, two, three, four);
            counter++;
          }
        }
      }
    }
  };

  ViewResources.prototype.registerViewEngineHooks = function registerViewEngineHooks(hooks) {
    this._tryAddHook(hooks, 'beforeCompile');
    this._tryAddHook(hooks, 'afterCompile');
    this._tryAddHook(hooks, 'beforeCreate');
    this._tryAddHook(hooks, 'afterCreate');
    this._tryAddHook(hooks, 'beforeBind');
    this._tryAddHook(hooks, 'beforeUnbind');
  };

  ViewResources.prototype.getBindingLanguage = function getBindingLanguage(bindingLanguageFallback) {
    return this.bindingLanguage || (this.bindingLanguage = bindingLanguageFallback);
  };

  ViewResources.prototype.patchInParent = function patchInParent(newParent) {
    var originalParent = this.parent;

    this.parent = newParent || null;
    this.hasParent = this.parent !== null;

    if (newParent.parent === null) {
      newParent.parent = originalParent;
      newParent.hasParent = originalParent !== null;
    }
  };

  ViewResources.prototype.relativeToView = function relativeToView(path) {
    return relativeToFile(path, this.viewUrl);
  };

  ViewResources.prototype.registerElement = function registerElement(tagName, behavior) {
    register(this.elements, tagName, behavior, 'an Element');
  };

  ViewResources.prototype.getElement = function getElement(tagName) {
    return this.elements[tagName] || (this.hasParent ? this.parent.getElement(tagName) : null);
  };

  ViewResources.prototype.mapAttribute = function mapAttribute(attribute) {
    return this.attributeMap[attribute] || (this.hasParent ? this.parent.mapAttribute(attribute) : null);
  };

  ViewResources.prototype.registerAttribute = function registerAttribute(attribute, behavior, knownAttribute) {
    this.attributeMap[attribute] = knownAttribute;
    register(this.attributes, attribute, behavior, 'an Attribute');
  };

  ViewResources.prototype.getAttribute = function getAttribute(attribute) {
    return this.attributes[attribute] || (this.hasParent ? this.parent.getAttribute(attribute) : null);
  };

  ViewResources.prototype.registerValueConverter = function registerValueConverter(name, valueConverter$$1) {
    register(this.valueConverters, name, valueConverter$$1, 'a ValueConverter');
  };

  ViewResources.prototype.getValueConverter = function getValueConverter(name) {
    return this.valueConverters[name] || (this.hasParent ? this.parent.getValueConverter(name) : null);
  };

  ViewResources.prototype.registerBindingBehavior = function registerBindingBehavior(name, bindingBehavior$$1) {
    register(this.bindingBehaviors, name, bindingBehavior$$1, 'a BindingBehavior');
  };

  ViewResources.prototype.getBindingBehavior = function getBindingBehavior(name) {
    return this.bindingBehaviors[name] || (this.hasParent ? this.parent.getBindingBehavior(name) : null);
  };

  ViewResources.prototype.registerValue = function registerValue(name, value) {
    register(this.values, name, value, 'a value');
  };

  ViewResources.prototype.getValue = function getValue(name) {
    return this.values[name] || (this.hasParent ? this.parent.getValue(name) : null);
  };

  ViewResources.prototype.autoRegister = function autoRegister(container, impl) {
    var resourceTypeMeta = metadata.getOwn(metadata.resource, impl);
    if (resourceTypeMeta) {
      if (resourceTypeMeta instanceof HtmlBehaviorResource) {
        ViewResources.convention(impl, resourceTypeMeta);

        if (resourceTypeMeta.attributeName === null && resourceTypeMeta.elementName === null) {
          HtmlBehaviorResource.convention(impl.name, resourceTypeMeta);
        }
        if (resourceTypeMeta.attributeName === null && resourceTypeMeta.elementName === null) {
          resourceTypeMeta.elementName = _hyphenate(impl.name);
        }
      }
    } else {
      resourceTypeMeta = ViewResources.convention(impl) || HtmlBehaviorResource.convention(impl.name) || ValueConverterResource.convention(impl.name) || BindingBehaviorResource.convention(impl.name) || ViewEngineHooksResource.convention(impl.name);
      if (!resourceTypeMeta) {
        resourceTypeMeta = new HtmlBehaviorResource();
        resourceTypeMeta.elementName = _hyphenate(impl.name);
      }
      metadata.define(metadata.resource, resourceTypeMeta, impl);
    }
    resourceTypeMeta.initialize(container, impl);
    resourceTypeMeta.register(this);
    return resourceTypeMeta;
  };

  return ViewResources;
}();

var View = function () {
  function View(container, viewFactory, fragment, controllers, bindings, children, slots) {
    

    this.container = container;
    this.viewFactory = viewFactory;
    this.resources = viewFactory.resources;
    this.fragment = fragment;
    this.firstChild = fragment.firstChild;
    this.lastChild = fragment.lastChild;
    this.controllers = controllers;
    this.bindings = bindings;
    this.children = children;
    this.slots = slots;
    this.hasSlots = false;
    this.fromCache = false;
    this.isBound = false;
    this.isAttached = false;
    this.bindingContext = null;
    this.overrideContext = null;
    this.controller = null;
    this.viewModelScope = null;
    this.animatableElement = undefined;
    this._isUserControlled = false;
    this.contentView = null;

    for (var _key3 in slots) {
      this.hasSlots = true;
      break;
    }
  }

  View.prototype.returnToCache = function returnToCache() {
    this.viewFactory.returnViewToCache(this);
  };

  View.prototype.created = function created() {
    var i = void 0;
    var ii = void 0;
    var controllers = this.controllers;

    for (i = 0, ii = controllers.length; i < ii; ++i) {
      controllers[i].created(this);
    }
  };

  View.prototype.bind = function bind(bindingContext, overrideContext, _systemUpdate) {
    var controllers = void 0;
    var bindings = void 0;
    var children = void 0;
    var i = void 0;
    var ii = void 0;

    if (_systemUpdate && this._isUserControlled) {
      return;
    }

    if (this.isBound) {
      if (this.bindingContext === bindingContext) {
        return;
      }

      this.unbind();
    }

    this.isBound = true;
    this.bindingContext = bindingContext;
    this.overrideContext = overrideContext || createOverrideContext(bindingContext);

    this.resources._invokeHook('beforeBind', this);

    bindings = this.bindings;
    for (i = 0, ii = bindings.length; i < ii; ++i) {
      bindings[i].bind(this);
    }

    if (this.viewModelScope !== null) {
      bindingContext.bind(this.viewModelScope.bindingContext, this.viewModelScope.overrideContext);
      this.viewModelScope = null;
    }

    controllers = this.controllers;
    for (i = 0, ii = controllers.length; i < ii; ++i) {
      controllers[i].bind(this);
    }

    children = this.children;
    for (i = 0, ii = children.length; i < ii; ++i) {
      children[i].bind(bindingContext, overrideContext, true);
    }

    if (this.hasSlots) {
      ShadowDOM.distributeView(this.contentView, this.slots);
    }
  };

  View.prototype.addBinding = function addBinding(binding) {
    this.bindings.push(binding);

    if (this.isBound) {
      binding.bind(this);
    }
  };

  View.prototype.unbind = function unbind() {
    var controllers = void 0;
    var bindings = void 0;
    var children = void 0;
    var i = void 0;
    var ii = void 0;

    if (this.isBound) {
      this.isBound = false;
      this.resources._invokeHook('beforeUnbind', this);

      if (this.controller !== null) {
        this.controller.unbind();
      }

      bindings = this.bindings;
      for (i = 0, ii = bindings.length; i < ii; ++i) {
        bindings[i].unbind();
      }

      controllers = this.controllers;
      for (i = 0, ii = controllers.length; i < ii; ++i) {
        controllers[i].unbind();
      }

      children = this.children;
      for (i = 0, ii = children.length; i < ii; ++i) {
        children[i].unbind();
      }

      this.bindingContext = null;
      this.overrideContext = null;
    }
  };

  View.prototype.insertNodesBefore = function insertNodesBefore(refNode) {
    refNode.parentNode.insertBefore(this.fragment, refNode);
  };

  View.prototype.appendNodesTo = function appendNodesTo(parent$$1) {
    parent$$1.appendChild(this.fragment);
  };

  View.prototype.removeNodes = function removeNodes() {
    var fragment = this.fragment;
    var current = this.firstChild;
    var end = this.lastChild;
    var next = void 0;

    while (current) {
      next = current.nextSibling;
      fragment.appendChild(current);

      if (current === end) {
        break;
      }

      current = next;
    }
  };

  View.prototype.attached = function attached() {
    var controllers = void 0;
    var children = void 0;
    var i = void 0;
    var ii = void 0;

    if (this.isAttached) {
      return;
    }

    this.isAttached = true;

    if (this.controller !== null) {
      this.controller.attached();
    }

    controllers = this.controllers;
    for (i = 0, ii = controllers.length; i < ii; ++i) {
      controllers[i].attached();
    }

    children = this.children;
    for (i = 0, ii = children.length; i < ii; ++i) {
      children[i].attached();
    }
  };

  View.prototype.detached = function detached() {
    var controllers = void 0;
    var children = void 0;
    var i = void 0;
    var ii = void 0;

    if (this.isAttached) {
      this.isAttached = false;

      if (this.controller !== null) {
        this.controller.detached();
      }

      controllers = this.controllers;
      for (i = 0, ii = controllers.length; i < ii; ++i) {
        controllers[i].detached();
      }

      children = this.children;
      for (i = 0, ii = children.length; i < ii; ++i) {
        children[i].detached();
      }
    }
  };

  return View;
}();

function getAnimatableElement(view) {
  if (view.animatableElement !== undefined) {
    return view.animatableElement;
  }

  var current = view.firstChild;

  while (current && current.nodeType !== 1) {
    current = current.nextSibling;
  }

  if (current && current.nodeType === 1) {
    return view.animatableElement = current.classList.contains('au-animate') ? current : null;
  }

  return view.animatableElement = null;
}

var ViewSlot = function () {
  function ViewSlot(anchor, anchorIsContainer) {
    var animator = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : Animator.instance;

    

    this.anchor = anchor;
    this.anchorIsContainer = anchorIsContainer;
    this.bindingContext = null;
    this.overrideContext = null;
    this.animator = animator;
    this.children = [];
    this.isBound = false;
    this.isAttached = false;
    this.contentSelectors = null;
    anchor.viewSlot = this;
    anchor.isContentProjectionSource = false;
  }

  ViewSlot.prototype.animateView = function animateView(view) {
    var direction = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'enter';

    var animatableElement = getAnimatableElement(view);

    if (animatableElement !== null) {
      switch (direction) {
        case 'enter':
          return this.animator.enter(animatableElement);
        case 'leave':
          return this.animator.leave(animatableElement);
        default:
          throw new Error('Invalid animation direction: ' + direction);
      }
    }
  };

  ViewSlot.prototype.transformChildNodesIntoView = function transformChildNodesIntoView() {
    var parent$$1 = this.anchor;

    this.children.push({
      fragment: parent$$1,
      firstChild: parent$$1.firstChild,
      lastChild: parent$$1.lastChild,
      returnToCache: function returnToCache() {},
      removeNodes: function removeNodes() {
        var last = void 0;

        while (last = parent$$1.lastChild) {
          parent$$1.removeChild(last);
        }
      },
      created: function created() {},
      bind: function bind() {},
      unbind: function unbind() {},
      attached: function attached() {},
      detached: function detached() {}
    });
  };

  ViewSlot.prototype.bind = function bind(bindingContext, overrideContext) {
    var i = void 0;
    var ii = void 0;
    var children = void 0;

    if (this.isBound) {
      if (this.bindingContext === bindingContext) {
        return;
      }

      this.unbind();
    }

    this.isBound = true;
    this.bindingContext = bindingContext = bindingContext || this.bindingContext;
    this.overrideContext = overrideContext = overrideContext || this.overrideContext;

    children = this.children;
    for (i = 0, ii = children.length; i < ii; ++i) {
      children[i].bind(bindingContext, overrideContext, true);
    }
  };

  ViewSlot.prototype.unbind = function unbind() {
    if (this.isBound) {
      var i = void 0;
      var ii = void 0;
      var _children4 = this.children;

      this.isBound = false;
      this.bindingContext = null;
      this.overrideContext = null;

      for (i = 0, ii = _children4.length; i < ii; ++i) {
        _children4[i].unbind();
      }
    }
  };

  ViewSlot.prototype.add = function add(view) {
    if (this.anchorIsContainer) {
      view.appendNodesTo(this.anchor);
    } else {
      view.insertNodesBefore(this.anchor);
    }

    this.children.push(view);

    if (this.isAttached) {
      view.attached();
      return this.animateView(view, 'enter');
    }
  };

  ViewSlot.prototype.insert = function insert(index, view) {
    var children = this.children;
    var length = children.length;

    if (index === 0 && length === 0 || index >= length) {
      return this.add(view);
    }

    view.insertNodesBefore(children[index].firstChild);
    children.splice(index, 0, view);

    if (this.isAttached) {
      view.attached();
      return this.animateView(view, 'enter');
    }
  };

  ViewSlot.prototype.move = function move(sourceIndex, targetIndex) {
    if (sourceIndex === targetIndex) {
      return;
    }

    var children = this.children;
    var view = children[sourceIndex];

    view.removeNodes();
    view.insertNodesBefore(children[targetIndex].firstChild);
    children.splice(sourceIndex, 1);
    children.splice(targetIndex, 0, view);
  };

  ViewSlot.prototype.remove = function remove(view, returnToCache, skipAnimation) {
    return this.removeAt(this.children.indexOf(view), returnToCache, skipAnimation);
  };

  ViewSlot.prototype.removeMany = function removeMany(viewsToRemove, returnToCache, skipAnimation) {
    var _this3 = this;

    var children = this.children;
    var ii = viewsToRemove.length;
    var i = void 0;
    var rmPromises = [];

    viewsToRemove.forEach(function (child) {
      if (skipAnimation) {
        child.removeNodes();
        return;
      }

      var animation = _this3.animateView(child, 'leave');
      if (animation) {
        rmPromises.push(animation.then(function () {
          return child.removeNodes();
        }));
      } else {
        child.removeNodes();
      }
    });

    var removeAction = function removeAction() {
      if (_this3.isAttached) {
        for (i = 0; i < ii; ++i) {
          viewsToRemove[i].detached();
        }
      }

      if (returnToCache) {
        for (i = 0; i < ii; ++i) {
          viewsToRemove[i].returnToCache();
        }
      }

      for (i = 0; i < ii; ++i) {
        var index = children.indexOf(viewsToRemove[i]);
        if (index >= 0) {
          children.splice(index, 1);
        }
      }
    };

    if (rmPromises.length > 0) {
      return Promise.all(rmPromises).then(function () {
        return removeAction();
      });
    }

    return removeAction();
  };

  ViewSlot.prototype.removeAt = function removeAt(index, returnToCache, skipAnimation) {
    var _this4 = this;

    var view = this.children[index];

    var removeAction = function removeAction() {
      index = _this4.children.indexOf(view);
      view.removeNodes();
      _this4.children.splice(index, 1);

      if (_this4.isAttached) {
        view.detached();
      }

      if (returnToCache) {
        view.returnToCache();
      }

      return view;
    };

    if (!skipAnimation) {
      var animation = this.animateView(view, 'leave');
      if (animation) {
        return animation.then(function () {
          return removeAction();
        });
      }
    }

    return removeAction();
  };

  ViewSlot.prototype.removeAll = function removeAll(returnToCache, skipAnimation) {
    var _this5 = this;

    var children = this.children;
    var ii = children.length;
    var i = void 0;
    var rmPromises = [];

    children.forEach(function (child) {
      if (skipAnimation) {
        child.removeNodes();
        return;
      }

      var animation = _this5.animateView(child, 'leave');
      if (animation) {
        rmPromises.push(animation.then(function () {
          return child.removeNodes();
        }));
      } else {
        child.removeNodes();
      }
    });

    var removeAction = function removeAction() {
      if (_this5.isAttached) {
        for (i = 0; i < ii; ++i) {
          children[i].detached();
        }
      }

      if (returnToCache) {
        for (i = 0; i < ii; ++i) {
          var _child3 = children[i];

          if (_child3) {
            _child3.returnToCache();
          }
        }
      }

      _this5.children = [];
    };

    if (rmPromises.length > 0) {
      return Promise.all(rmPromises).then(function () {
        return removeAction();
      });
    }

    return removeAction();
  };

  ViewSlot.prototype.attached = function attached() {
    var i = void 0;
    var ii = void 0;
    var children = void 0;
    var child = void 0;

    if (this.isAttached) {
      return;
    }

    this.isAttached = true;

    children = this.children;
    for (i = 0, ii = children.length; i < ii; ++i) {
      child = children[i];
      child.attached();
      this.animateView(child, 'enter');
    }
  };

  ViewSlot.prototype.detached = function detached() {
    var i = void 0;
    var ii = void 0;
    var children = void 0;

    if (this.isAttached) {
      this.isAttached = false;
      children = this.children;
      for (i = 0, ii = children.length; i < ii; ++i) {
        children[i].detached();
      }
    }
  };

  ViewSlot.prototype.projectTo = function projectTo(slots) {
    var _this6 = this;

    this.projectToSlots = slots;
    this.add = this._projectionAdd;
    this.insert = this._projectionInsert;
    this.move = this._projectionMove;
    this.remove = this._projectionRemove;
    this.removeAt = this._projectionRemoveAt;
    this.removeMany = this._projectionRemoveMany;
    this.removeAll = this._projectionRemoveAll;
    this.children.forEach(function (view) {
      return ShadowDOM.distributeView(view, slots, _this6);
    });
  };

  ViewSlot.prototype._projectionAdd = function _projectionAdd(view) {
    ShadowDOM.distributeView(view, this.projectToSlots, this);

    this.children.push(view);

    if (this.isAttached) {
      view.attached();
    }
  };

  ViewSlot.prototype._projectionInsert = function _projectionInsert(index, view) {
    if (index === 0 && !this.children.length || index >= this.children.length) {
      this.add(view);
    } else {
      ShadowDOM.distributeView(view, this.projectToSlots, this, index);

      this.children.splice(index, 0, view);

      if (this.isAttached) {
        view.attached();
      }
    }
  };

  ViewSlot.prototype._projectionMove = function _projectionMove(sourceIndex, targetIndex) {
    if (sourceIndex === targetIndex) {
      return;
    }

    var children = this.children;
    var view = children[sourceIndex];

    ShadowDOM.undistributeView(view, this.projectToSlots, this);
    ShadowDOM.distributeView(view, this.projectToSlots, this, targetIndex);

    children.splice(sourceIndex, 1);
    children.splice(targetIndex, 0, view);
  };

  ViewSlot.prototype._projectionRemove = function _projectionRemove(view, returnToCache) {
    ShadowDOM.undistributeView(view, this.projectToSlots, this);
    this.children.splice(this.children.indexOf(view), 1);

    if (this.isAttached) {
      view.detached();
    }
    if (returnToCache) {
      view.returnToCache();
    }
  };

  ViewSlot.prototype._projectionRemoveAt = function _projectionRemoveAt(index, returnToCache) {
    var view = this.children[index];

    ShadowDOM.undistributeView(view, this.projectToSlots, this);
    this.children.splice(index, 1);

    if (this.isAttached) {
      view.detached();
    }
    if (returnToCache) {
      view.returnToCache();
    }
  };

  ViewSlot.prototype._projectionRemoveMany = function _projectionRemoveMany(viewsToRemove, returnToCache) {
    var _this7 = this;

    viewsToRemove.forEach(function (view) {
      return _this7.remove(view, returnToCache);
    });
  };

  ViewSlot.prototype._projectionRemoveAll = function _projectionRemoveAll(returnToCache) {
    ShadowDOM.undistributeAll(this.projectToSlots, this);

    var children = this.children;
    var ii = children.length;

    for (var i = 0; i < ii; ++i) {
      if (returnToCache) {
        children[i].returnToCache();
      } else if (this.isAttached) {
        children[i].detached();
      }
    }

    this.children = [];
  };

  return ViewSlot;
}();

var ProviderResolver = resolver(_class12$1 = function () {
  function ProviderResolver() {
    
  }

  ProviderResolver.prototype.get = function get(container, key) {
    var id = key.__providerId__;
    return id in container ? container[id] : container[id] = container.invoke(key);
  };

  return ProviderResolver;
}()) || _class12$1;

var providerResolverInstance = new ProviderResolver();

function elementContainerGet(key) {
  if (key === DOM.Element) {
    return this.element;
  }

  if (key === BoundViewFactory) {
    if (this.boundViewFactory) {
      return this.boundViewFactory;
    }

    var factory$$1 = this.instruction.viewFactory;
    var _partReplacements = this.partReplacements;

    if (_partReplacements) {
      factory$$1 = _partReplacements[factory$$1.part] || factory$$1;
    }

    this.boundViewFactory = new BoundViewFactory(this, factory$$1, _partReplacements);
    return this.boundViewFactory;
  }

  if (key === ViewSlot) {
    if (this.viewSlot === undefined) {
      this.viewSlot = new ViewSlot(this.element, this.instruction.anchorIsContainer);
      this.element.isContentProjectionSource = this.instruction.lifting;
      this.children.push(this.viewSlot);
    }

    return this.viewSlot;
  }

  if (key === ElementEvents) {
    return this.elementEvents || (this.elementEvents = new ElementEvents(this.element));
  }

  if (key === CompositionTransaction) {
    return this.compositionTransaction || (this.compositionTransaction = this.parent.get(key));
  }

  if (key === ViewResources) {
    return this.viewResources;
  }

  if (key === TargetInstruction) {
    return this.instruction;
  }

  return this.superGet(key);
}

function createElementContainer(parent$$1, element, instruction, children, partReplacements, resources) {
  var container = parent$$1.createChild();
  var providers = void 0;
  var i = void 0;

  container.element = element;
  container.instruction = instruction;
  container.children = children;
  container.viewResources = resources;
  container.partReplacements = partReplacements;

  providers = instruction.providers;
  i = providers.length;

  while (i--) {
    container._resolvers.set(providers[i], providerResolverInstance);
  }

  container.superGet = container.get;
  container.get = elementContainerGet;

  return container;
}

function hasAttribute(name) {
  return this._element.hasAttribute(name);
}

function getAttribute(name) {
  return this._element.getAttribute(name);
}

function setAttribute(name, value) {
  this._element.setAttribute(name, value);
}

function makeElementIntoAnchor(element, elementInstruction) {
  var anchor = DOM.createComment('anchor');

  if (elementInstruction) {
    var firstChild = element.firstChild;

    if (firstChild && firstChild.tagName === 'AU-CONTENT') {
      anchor.contentElement = firstChild;
    }

    anchor._element = element;

    anchor.hasAttribute = hasAttribute;
    anchor.getAttribute = getAttribute;
    anchor.setAttribute = setAttribute;
  }

  DOM.replaceNode(anchor, element);

  return anchor;
}

function applyInstructions(containers, element, instruction, controllers, bindings, children, shadowSlots, partReplacements, resources) {
  var behaviorInstructions = instruction.behaviorInstructions;
  var expressions = instruction.expressions;
  var elementContainer = void 0;
  var i = void 0;
  var ii = void 0;
  var current = void 0;
  var instance = void 0;

  if (instruction.contentExpression) {
    bindings.push(instruction.contentExpression.createBinding(element.nextSibling));
    element.nextSibling.auInterpolationTarget = true;
    element.parentNode.removeChild(element);
    return;
  }

  if (instruction.shadowSlot) {
    var commentAnchor = DOM.createComment('slot');
    var slot = void 0;

    if (instruction.slotDestination) {
      slot = new PassThroughSlot(commentAnchor, instruction.slotName, instruction.slotDestination, instruction.slotFallbackFactory);
    } else {
      slot = new ShadowSlot(commentAnchor, instruction.slotName, instruction.slotFallbackFactory);
    }

    DOM.replaceNode(commentAnchor, element);
    shadowSlots[instruction.slotName] = slot;
    controllers.push(slot);
    return;
  }

  if (instruction.letElement) {
    for (i = 0, ii = expressions.length; i < ii; ++i) {
      bindings.push(expressions[i].createBinding());
    }
    element.parentNode.removeChild(element);
    return;
  }

  if (behaviorInstructions.length) {
    if (!instruction.anchorIsContainer) {
      element = makeElementIntoAnchor(element, instruction.elementInstruction);
    }

    containers[instruction.injectorId] = elementContainer = createElementContainer(containers[instruction.parentInjectorId], element, instruction, children, partReplacements, resources);

    for (i = 0, ii = behaviorInstructions.length; i < ii; ++i) {
      current = behaviorInstructions[i];
      instance = current.type.create(elementContainer, current, element, bindings);
      controllers.push(instance);
    }
  }

  for (i = 0, ii = expressions.length; i < ii; ++i) {
    bindings.push(expressions[i].createBinding(element));
  }
}

function styleStringToObject(style, target) {
  var attributes = style.split(';');
  var firstIndexOfColon = void 0;
  var i = void 0;
  var current = void 0;
  var key = void 0;
  var value = void 0;

  target = target || {};

  for (i = 0; i < attributes.length; i++) {
    current = attributes[i];
    firstIndexOfColon = current.indexOf(':');
    key = current.substring(0, firstIndexOfColon).trim();
    value = current.substring(firstIndexOfColon + 1).trim();
    target[key] = value;
  }

  return target;
}

function styleObjectToString(obj) {
  var result = '';

  for (var _key4 in obj) {
    result += _key4 + ':' + obj[_key4] + ';';
  }

  return result;
}

function applySurrogateInstruction(container, element, instruction, controllers, bindings, children) {
  var behaviorInstructions = instruction.behaviorInstructions;
  var expressions = instruction.expressions;
  var providers = instruction.providers;
  var values = instruction.values;
  var i = void 0;
  var ii = void 0;
  var current = void 0;
  var instance = void 0;
  var currentAttributeValue = void 0;

  i = providers.length;
  while (i--) {
    container._resolvers.set(providers[i], providerResolverInstance);
  }

  for (var _key5 in values) {
    currentAttributeValue = element.getAttribute(_key5);

    if (currentAttributeValue) {
      if (_key5 === 'class') {
        element.setAttribute('class', currentAttributeValue + ' ' + values[_key5]);
      } else if (_key5 === 'style') {
        var styleObject = styleStringToObject(values[_key5]);
        styleStringToObject(currentAttributeValue, styleObject);
        element.setAttribute('style', styleObjectToString(styleObject));
      }
    } else {
      element.setAttribute(_key5, values[_key5]);
    }
  }

  if (behaviorInstructions.length) {
    for (i = 0, ii = behaviorInstructions.length; i < ii; ++i) {
      current = behaviorInstructions[i];
      instance = current.type.create(container, current, element, bindings);

      if (instance.contentView) {
        children.push(instance.contentView);
      }

      controllers.push(instance);
    }
  }

  for (i = 0, ii = expressions.length; i < ii; ++i) {
    bindings.push(expressions[i].createBinding(element));
  }
}

var BoundViewFactory = function () {
  function BoundViewFactory(parentContainer, viewFactory, partReplacements) {
    

    this.parentContainer = parentContainer;
    this.viewFactory = viewFactory;
    this.factoryCreateInstruction = { partReplacements: partReplacements };
  }

  BoundViewFactory.prototype.create = function create() {
    var view = this.viewFactory.create(this.parentContainer.createChild(), this.factoryCreateInstruction);
    view._isUserControlled = true;
    return view;
  };

  BoundViewFactory.prototype.setCacheSize = function setCacheSize(size, doNotOverrideIfAlreadySet) {
    this.viewFactory.setCacheSize(size, doNotOverrideIfAlreadySet);
  };

  BoundViewFactory.prototype.getCachedView = function getCachedView() {
    return this.viewFactory.getCachedView();
  };

  BoundViewFactory.prototype.returnViewToCache = function returnViewToCache(view) {
    this.viewFactory.returnViewToCache(view);
  };

  _createClass$2(BoundViewFactory, [{
    key: 'isCaching',
    get: function get() {
      return this.viewFactory.isCaching;
    }
  }]);

  return BoundViewFactory;
}();

var ViewFactory = function () {
  function ViewFactory(template, instructions, resources) {
    

    this.isCaching = false;

    this.template = template;
    this.instructions = instructions;
    this.resources = resources;
    this.cacheSize = -1;
    this.cache = null;
  }

  ViewFactory.prototype.setCacheSize = function setCacheSize(size, doNotOverrideIfAlreadySet) {
    if (size) {
      if (size === '*') {
        size = Number.MAX_VALUE;
      } else if (typeof size === 'string') {
        size = parseInt(size, 10);
      }
    }

    if (this.cacheSize === -1 || !doNotOverrideIfAlreadySet) {
      this.cacheSize = size;
    }

    if (this.cacheSize > 0) {
      this.cache = [];
    } else {
      this.cache = null;
    }

    this.isCaching = this.cacheSize > 0;
  };

  ViewFactory.prototype.getCachedView = function getCachedView() {
    return this.cache !== null ? this.cache.pop() || null : null;
  };

  ViewFactory.prototype.returnViewToCache = function returnViewToCache(view) {
    if (view.isAttached) {
      view.detached();
    }

    if (view.isBound) {
      view.unbind();
    }

    if (this.cache !== null && this.cache.length < this.cacheSize) {
      view.fromCache = true;
      this.cache.push(view);
    }
  };

  ViewFactory.prototype.create = function create(container, createInstruction, element) {
    createInstruction = createInstruction || BehaviorInstruction.normal;

    var cachedView = this.getCachedView();
    if (cachedView !== null) {
      return cachedView;
    }

    var fragment = createInstruction.enhance ? this.template : this.template.cloneNode(true);
    var instructables = fragment.querySelectorAll('.au-target');
    var instructions = this.instructions;
    var resources = this.resources;
    var controllers = [];
    var bindings = [];
    var children = [];
    var shadowSlots = Object.create(null);
    var containers = { root: container };
    var partReplacements = createInstruction.partReplacements;
    var i = void 0;
    var ii = void 0;
    var view = void 0;
    var instructable = void 0;
    var instruction = void 0;

    this.resources._invokeHook('beforeCreate', this, container, fragment, createInstruction);

    if (element && this.surrogateInstruction !== null) {
      applySurrogateInstruction(container, element, this.surrogateInstruction, controllers, bindings, children);
    }

    if (createInstruction.enhance && fragment.hasAttribute('au-target-id')) {
      instructable = fragment;
      instruction = instructions[instructable.getAttribute('au-target-id')];
      applyInstructions(containers, instructable, instruction, controllers, bindings, children, shadowSlots, partReplacements, resources);
    }

    for (i = 0, ii = instructables.length; i < ii; ++i) {
      instructable = instructables[i];
      instruction = instructions[instructable.getAttribute('au-target-id')];
      applyInstructions(containers, instructable, instruction, controllers, bindings, children, shadowSlots, partReplacements, resources);
    }

    view = new View(container, this, fragment, controllers, bindings, children, shadowSlots);

    if (!createInstruction.initiatedByBehavior) {
      view.created();
    }

    this.resources._invokeHook('afterCreate', view);

    return view;
  };

  return ViewFactory;
}();

var nextInjectorId = 0;
function getNextInjectorId() {
  return ++nextInjectorId;
}

var lastAUTargetID = 0;
function getNextAUTargetID() {
  return (++lastAUTargetID).toString();
}

function makeIntoInstructionTarget(element) {
  var value = element.getAttribute('class');
  var auTargetID = getNextAUTargetID();

  element.setAttribute('class', value ? value + ' au-target' : 'au-target');
  element.setAttribute('au-target-id', auTargetID);

  return auTargetID;
}

function makeShadowSlot(compiler, resources, node, instructions, parentInjectorId) {
  var auShadowSlot = DOM.createElement('au-shadow-slot');
  DOM.replaceNode(auShadowSlot, node);

  var auTargetID = makeIntoInstructionTarget(auShadowSlot);
  var instruction = TargetInstruction.shadowSlot(parentInjectorId);

  instruction.slotName = node.getAttribute('name') || ShadowDOM.defaultSlotKey;
  instruction.slotDestination = node.getAttribute('slot');

  if (node.innerHTML.trim()) {
    var fragment = DOM.createDocumentFragment();
    var _child4 = void 0;

    while (_child4 = node.firstChild) {
      fragment.appendChild(_child4);
    }

    instruction.slotFallbackFactory = compiler.compile(fragment, resources);
  }

  instructions[auTargetID] = instruction;

  return auShadowSlot;
}

var defaultLetHandler = BindingLanguage.prototype.createLetExpressions;

var ViewCompiler = (_dec7$1 = inject(BindingLanguage, ViewResources), _dec7$1(_class14$1 = function () {
  function ViewCompiler(bindingLanguage, resources) {
    

    this.bindingLanguage = bindingLanguage;
    this.resources = resources;
  }

  ViewCompiler.prototype.compile = function compile(source, resources, compileInstruction) {
    resources = resources || this.resources;
    compileInstruction = compileInstruction || ViewCompileInstruction.normal;
    source = typeof source === 'string' ? DOM.createTemplateFromMarkup(source) : source;

    var content = void 0;
    var part = void 0;
    var cacheSize = void 0;

    if (source.content) {
      part = source.getAttribute('part');
      cacheSize = source.getAttribute('view-cache');
      content = DOM.adoptNode(source.content);
    } else {
      content = source;
    }

    compileInstruction.targetShadowDOM = compileInstruction.targetShadowDOM && FEATURE.shadowDOM;
    resources._invokeHook('beforeCompile', content, resources, compileInstruction);

    var instructions = {};
    this._compileNode(content, resources, instructions, source, 'root', !compileInstruction.targetShadowDOM);

    var firstChild = content.firstChild;
    if (firstChild && firstChild.nodeType === 1) {
      var targetId = firstChild.getAttribute('au-target-id');
      if (targetId) {
        var ins = instructions[targetId];

        if (ins.shadowSlot || ins.lifting || ins.elementInstruction && !ins.elementInstruction.anchorIsContainer) {
          content.insertBefore(DOM.createComment('view'), firstChild);
        }
      }
    }

    var factory$$1 = new ViewFactory(content, instructions, resources);

    factory$$1.surrogateInstruction = compileInstruction.compileSurrogate ? this._compileSurrogate(source, resources) : null;
    factory$$1.part = part;

    if (cacheSize) {
      factory$$1.setCacheSize(cacheSize);
    }

    resources._invokeHook('afterCompile', factory$$1);

    return factory$$1;
  };

  ViewCompiler.prototype._compileNode = function _compileNode(node, resources, instructions, parentNode, parentInjectorId, targetLightDOM) {
    switch (node.nodeType) {
      case 1:
        return this._compileElement(node, resources, instructions, parentNode, parentInjectorId, targetLightDOM);
      case 3:
        var expression = resources.getBindingLanguage(this.bindingLanguage).inspectTextContent(resources, node.wholeText);
        if (expression) {
          var marker = DOM.createElement('au-marker');
          var auTargetID = makeIntoInstructionTarget(marker);
          (node.parentNode || parentNode).insertBefore(marker, node);
          node.textContent = ' ';
          instructions[auTargetID] = TargetInstruction.contentExpression(expression);

          while (node.nextSibling && node.nextSibling.nodeType === 3) {
            (node.parentNode || parentNode).removeChild(node.nextSibling);
          }
        } else {
          while (node.nextSibling && node.nextSibling.nodeType === 3) {
            node = node.nextSibling;
          }
        }
        return node.nextSibling;
      case 11:
        var currentChild = node.firstChild;
        while (currentChild) {
          currentChild = this._compileNode(currentChild, resources, instructions, node, parentInjectorId, targetLightDOM);
        }
        break;
      default:
        break;
    }

    return node.nextSibling;
  };

  ViewCompiler.prototype._compileSurrogate = function _compileSurrogate(node, resources) {
    var tagName = node.tagName.toLowerCase();
    var attributes = node.attributes;
    var bindingLanguage = resources.getBindingLanguage(this.bindingLanguage);
    var knownAttribute = void 0;
    var property = void 0;
    var instruction = void 0;
    var i = void 0;
    var ii = void 0;
    var attr = void 0;
    var attrName = void 0;
    var attrValue = void 0;
    var info = void 0;
    var type = void 0;
    var expressions = [];
    var expression = void 0;
    var behaviorInstructions = [];
    var values = {};
    var hasValues = false;
    var providers = [];

    for (i = 0, ii = attributes.length; i < ii; ++i) {
      attr = attributes[i];
      attrName = attr.name;
      attrValue = attr.value;

      info = bindingLanguage.inspectAttribute(resources, tagName, attrName, attrValue);
      type = resources.getAttribute(info.attrName);

      if (type) {
        knownAttribute = resources.mapAttribute(info.attrName);
        if (knownAttribute) {
          property = type.attributes[knownAttribute];

          if (property) {
            info.defaultBindingMode = property.defaultBindingMode;

            if (!info.command && !info.expression) {
              info.command = property.hasOptions ? 'options' : null;
            }

            if (info.command && info.command !== 'options' && type.primaryProperty) {
              var _primaryProperty = type.primaryProperty;
              attrName = info.attrName = _primaryProperty.attribute;

              info.defaultBindingMode = _primaryProperty.defaultBindingMode;
            }
          }
        }
      }

      instruction = bindingLanguage.createAttributeInstruction(resources, node, info, undefined, type);

      if (instruction) {
        if (instruction.alteredAttr) {
          type = resources.getAttribute(instruction.attrName);
        }

        if (instruction.discrete) {
          expressions.push(instruction);
        } else {
          if (type) {
            instruction.type = type;
            this._configureProperties(instruction, resources);

            if (type.liftsContent) {
              throw new Error('You cannot place a template controller on a surrogate element.');
            } else {
              behaviorInstructions.push(instruction);
            }
          } else {
            expressions.push(instruction.attributes[instruction.attrName]);
          }
        }
      } else {
        if (type) {
          instruction = BehaviorInstruction.attribute(attrName, type);
          instruction.attributes[resources.mapAttribute(attrName)] = attrValue;

          if (type.liftsContent) {
            throw new Error('You cannot place a template controller on a surrogate element.');
          } else {
            behaviorInstructions.push(instruction);
          }
        } else if (attrName !== 'id' && attrName !== 'part' && attrName !== 'replace-part') {
          hasValues = true;
          values[attrName] = attrValue;
        }
      }
    }

    if (expressions.length || behaviorInstructions.length || hasValues) {
      for (i = 0, ii = behaviorInstructions.length; i < ii; ++i) {
        instruction = behaviorInstructions[i];
        instruction.type.compile(this, resources, node, instruction);
        providers.push(instruction.type.target);
      }

      for (i = 0, ii = expressions.length; i < ii; ++i) {
        expression = expressions[i];
        if (expression.attrToRemove !== undefined) {
          node.removeAttribute(expression.attrToRemove);
        }
      }

      return TargetInstruction.surrogate(providers, behaviorInstructions, expressions, values);
    }

    return null;
  };

  ViewCompiler.prototype._compileElement = function _compileElement(node, resources, instructions, parentNode, parentInjectorId, targetLightDOM) {
    var tagName = node.tagName.toLowerCase();
    var attributes = node.attributes;
    var expressions = [];
    var expression = void 0;
    var behaviorInstructions = [];
    var providers = [];
    var bindingLanguage = resources.getBindingLanguage(this.bindingLanguage);
    var liftingInstruction = void 0;
    var viewFactory = void 0;
    var type = void 0;
    var elementInstruction = void 0;
    var elementProperty = void 0;
    var i = void 0;
    var ii = void 0;
    var attr = void 0;
    var attrName = void 0;
    var attrValue = void 0;
    var originalAttrName = void 0;
    var instruction = void 0;
    var info = void 0;
    var property = void 0;
    var knownAttribute = void 0;
    var auTargetID = void 0;
    var injectorId = void 0;

    if (tagName === 'slot') {
      if (targetLightDOM) {
        node = makeShadowSlot(this, resources, node, instructions, parentInjectorId);
      }
      return node.nextSibling;
    } else if (tagName === 'template') {
      if (!('content' in node)) {
        throw new Error('You cannot place a template element within ' + node.namespaceURI + ' namespace');
      }
      viewFactory = this.compile(node, resources);
      viewFactory.part = node.getAttribute('part');
    } else {
      type = resources.getElement(node.getAttribute('as-element') || tagName);

      if (tagName === 'let' && !type && bindingLanguage.createLetExpressions !== defaultLetHandler) {
        expressions = bindingLanguage.createLetExpressions(resources, node);
        auTargetID = makeIntoInstructionTarget(node);
        instructions[auTargetID] = TargetInstruction.letElement(expressions);
        return node.nextSibling;
      }
      if (type) {
        elementInstruction = BehaviorInstruction.element(node, type);
        type.processAttributes(this, resources, node, attributes, elementInstruction);
        behaviorInstructions.push(elementInstruction);
      }
    }

    for (i = 0, ii = attributes.length; i < ii; ++i) {
      attr = attributes[i];
      originalAttrName = attrName = attr.name;
      attrValue = attr.value;
      info = bindingLanguage.inspectAttribute(resources, tagName, attrName, attrValue);

      if (targetLightDOM && info.attrName === 'slot') {
        info.attrName = attrName = 'au-slot';
      }

      type = resources.getAttribute(info.attrName);
      elementProperty = null;

      if (type) {
        knownAttribute = resources.mapAttribute(info.attrName);
        if (knownAttribute) {
          property = type.attributes[knownAttribute];

          if (property) {
            info.defaultBindingMode = property.defaultBindingMode;

            if (!info.command && !info.expression) {
              info.command = property.hasOptions ? 'options' : null;
            }

            if (info.command && info.command !== 'options' && type.primaryProperty) {
              var _primaryProperty2 = type.primaryProperty;
              attrName = info.attrName = _primaryProperty2.attribute;

              info.defaultBindingMode = _primaryProperty2.defaultBindingMode;
            }
          }
        }
      } else if (elementInstruction) {
        elementProperty = elementInstruction.type.attributes[info.attrName];
        if (elementProperty) {
          info.defaultBindingMode = elementProperty.defaultBindingMode;
        }
      }

      if (elementProperty) {
        instruction = bindingLanguage.createAttributeInstruction(resources, node, info, elementInstruction);
      } else {
        instruction = bindingLanguage.createAttributeInstruction(resources, node, info, undefined, type);
      }

      if (instruction) {
        if (instruction.alteredAttr) {
          type = resources.getAttribute(instruction.attrName);
        }

        if (instruction.discrete) {
          expressions.push(instruction);
        } else {
          if (type) {
            instruction.type = type;
            this._configureProperties(instruction, resources);

            if (type.liftsContent) {
              instruction.originalAttrName = originalAttrName;
              liftingInstruction = instruction;
              break;
            } else {
              behaviorInstructions.push(instruction);
            }
          } else if (elementProperty) {
            elementInstruction.attributes[info.attrName].targetProperty = elementProperty.name;
          } else {
            expressions.push(instruction.attributes[instruction.attrName]);
          }
        }
      } else {
        if (type) {
          instruction = BehaviorInstruction.attribute(attrName, type);
          instruction.attributes[resources.mapAttribute(attrName)] = attrValue;

          if (type.liftsContent) {
            instruction.originalAttrName = originalAttrName;
            liftingInstruction = instruction;
            break;
          } else {
            behaviorInstructions.push(instruction);
          }
        } else if (elementProperty) {
          elementInstruction.attributes[attrName] = attrValue;
        }
      }
    }

    if (liftingInstruction) {
      liftingInstruction.viewFactory = viewFactory;
      node = liftingInstruction.type.compile(this, resources, node, liftingInstruction, parentNode);
      auTargetID = makeIntoInstructionTarget(node);
      instructions[auTargetID] = TargetInstruction.lifting(parentInjectorId, liftingInstruction);
    } else {
      var skipContentProcessing = false;

      if (expressions.length || behaviorInstructions.length) {
        injectorId = behaviorInstructions.length ? getNextInjectorId() : false;

        for (i = 0, ii = behaviorInstructions.length; i < ii; ++i) {
          instruction = behaviorInstructions[i];
          instruction.type.compile(this, resources, node, instruction, parentNode);
          providers.push(instruction.type.target);
          skipContentProcessing = skipContentProcessing || instruction.skipContentProcessing;
        }

        for (i = 0, ii = expressions.length; i < ii; ++i) {
          expression = expressions[i];
          if (expression.attrToRemove !== undefined) {
            node.removeAttribute(expression.attrToRemove);
          }
        }

        auTargetID = makeIntoInstructionTarget(node);
        instructions[auTargetID] = TargetInstruction.normal(injectorId, parentInjectorId, providers, behaviorInstructions, expressions, elementInstruction);
      }

      if (skipContentProcessing) {
        return node.nextSibling;
      }

      var currentChild = node.firstChild;
      while (currentChild) {
        currentChild = this._compileNode(currentChild, resources, instructions, node, injectorId || parentInjectorId, targetLightDOM);
      }
    }

    return node.nextSibling;
  };

  ViewCompiler.prototype._configureProperties = function _configureProperties(instruction, resources) {
    var type = instruction.type;
    var attrName = instruction.attrName;
    var attributes = instruction.attributes;
    var property = void 0;
    var key = void 0;
    var value = void 0;

    var knownAttribute = resources.mapAttribute(attrName);
    if (knownAttribute && attrName in attributes && knownAttribute !== attrName) {
      attributes[knownAttribute] = attributes[attrName];
      delete attributes[attrName];
    }

    for (key in attributes) {
      value = attributes[key];

      if (value !== null && (typeof value === 'undefined' ? 'undefined' : _typeof$4(value)) === 'object') {
        property = type.attributes[key];

        if (property !== undefined) {
          value.targetProperty = property.name;
        } else {
          value.targetProperty = key;
        }
      }
    }
  };

  return ViewCompiler;
}()) || _class14$1);

var ResourceModule = function () {
  function ResourceModule(moduleId) {
    

    this.id = moduleId;
    this.moduleInstance = null;
    this.mainResource = null;
    this.resources = null;
    this.viewStrategy = null;
    this.isInitialized = false;
    this.onLoaded = null;
    this.loadContext = null;
  }

  ResourceModule.prototype.initialize = function initialize(container) {
    var current = this.mainResource;
    var resources = this.resources;
    var vs = this.viewStrategy;

    if (this.isInitialized) {
      return;
    }

    this.isInitialized = true;

    if (current !== undefined) {
      current.metadata.viewStrategy = vs;
      current.initialize(container);
    }

    for (var i = 0, ii = resources.length; i < ii; ++i) {
      current = resources[i];
      current.metadata.viewStrategy = vs;
      current.initialize(container);
    }
  };

  ResourceModule.prototype.register = function register(registry, name) {
    var main = this.mainResource;
    var resources = this.resources;

    if (main !== undefined) {
      main.register(registry, name);
      name = null;
    }

    for (var i = 0, ii = resources.length; i < ii; ++i) {
      resources[i].register(registry, name);
      name = null;
    }
  };

  ResourceModule.prototype.load = function load(container, loadContext) {
    if (this.onLoaded !== null) {
      return this.loadContext === loadContext ? Promise.resolve() : this.onLoaded;
    }

    var main = this.mainResource;
    var resources = this.resources;
    var loads = void 0;

    if (main !== undefined) {
      loads = new Array(resources.length + 1);
      loads[0] = main.load(container, loadContext);
      for (var i = 0, ii = resources.length; i < ii; ++i) {
        loads[i + 1] = resources[i].load(container, loadContext);
      }
    } else {
      loads = new Array(resources.length);
      for (var _i2 = 0, _ii = resources.length; _i2 < _ii; ++_i2) {
        loads[_i2] = resources[_i2].load(container, loadContext);
      }
    }

    this.loadContext = loadContext;
    this.onLoaded = Promise.all(loads);
    return this.onLoaded;
  };

  return ResourceModule;
}();

var ResourceDescription = function () {
  function ResourceDescription(key, exportedValue, resourceTypeMeta) {
    

    if (!resourceTypeMeta) {
      resourceTypeMeta = metadata.get(metadata.resource, exportedValue);

      if (!resourceTypeMeta) {
        resourceTypeMeta = new HtmlBehaviorResource();
        resourceTypeMeta.elementName = _hyphenate(key);
        metadata.define(metadata.resource, resourceTypeMeta, exportedValue);
      }
    }

    if (resourceTypeMeta instanceof HtmlBehaviorResource) {
      if (resourceTypeMeta.elementName === undefined) {
        resourceTypeMeta.elementName = _hyphenate(key);
      } else if (resourceTypeMeta.attributeName === undefined) {
        resourceTypeMeta.attributeName = _hyphenate(key);
      } else if (resourceTypeMeta.attributeName === null && resourceTypeMeta.elementName === null) {
        HtmlBehaviorResource.convention(key, resourceTypeMeta);
      }
    } else if (!resourceTypeMeta.name) {
      resourceTypeMeta.name = _hyphenate(key);
    }

    this.metadata = resourceTypeMeta;
    this.value = exportedValue;
  }

  ResourceDescription.prototype.initialize = function initialize(container) {
    this.metadata.initialize(container, this.value);
  };

  ResourceDescription.prototype.register = function register(registry, name) {
    this.metadata.register(registry, name);
  };

  ResourceDescription.prototype.load = function load(container, loadContext) {
    return this.metadata.load(container, this.value, loadContext);
  };

  return ResourceDescription;
}();

var ModuleAnalyzer = function () {
  function ModuleAnalyzer() {
    

    this.cache = Object.create(null);
  }

  ModuleAnalyzer.prototype.getAnalysis = function getAnalysis(moduleId) {
    return this.cache[moduleId];
  };

  ModuleAnalyzer.prototype.analyze = function analyze(moduleId, moduleInstance, mainResourceKey) {
    var mainResource = void 0;
    var fallbackValue = void 0;
    var fallbackKey = void 0;
    var resourceTypeMeta = void 0;
    var key = void 0;
    var exportedValue = void 0;
    var resources = [];
    var conventional = void 0;
    var vs = void 0;
    var resourceModule = void 0;

    resourceModule = this.cache[moduleId];
    if (resourceModule) {
      return resourceModule;
    }

    resourceModule = new ResourceModule(moduleId);
    this.cache[moduleId] = resourceModule;

    if (typeof moduleInstance === 'function') {
      moduleInstance = { 'default': moduleInstance };
    }

    if (mainResourceKey) {
      mainResource = new ResourceDescription(mainResourceKey, moduleInstance[mainResourceKey]);
    }

    for (key in moduleInstance) {
      exportedValue = moduleInstance[key];

      if (key === mainResourceKey || typeof exportedValue !== 'function') {
        continue;
      }

      resourceTypeMeta = metadata.get(metadata.resource, exportedValue);

      if (resourceTypeMeta) {
        if (resourceTypeMeta instanceof HtmlBehaviorResource) {
          ViewResources.convention(exportedValue, resourceTypeMeta);

          if (resourceTypeMeta.attributeName === null && resourceTypeMeta.elementName === null) {
            HtmlBehaviorResource.convention(key, resourceTypeMeta);
          }

          if (resourceTypeMeta.attributeName === null && resourceTypeMeta.elementName === null) {
            resourceTypeMeta.elementName = _hyphenate(key);
          }
        }

        if (!mainResource && resourceTypeMeta instanceof HtmlBehaviorResource && resourceTypeMeta.elementName !== null) {
          mainResource = new ResourceDescription(key, exportedValue, resourceTypeMeta);
        } else {
          resources.push(new ResourceDescription(key, exportedValue, resourceTypeMeta));
        }
      } else if (viewStrategy.decorates(exportedValue)) {
        vs = exportedValue;
      } else if (exportedValue instanceof TemplateRegistryEntry) {
        vs = new TemplateRegistryViewStrategy(moduleId, exportedValue);
      } else {
        if (conventional = ViewResources.convention(exportedValue)) {
          if (conventional.elementName !== null && !mainResource) {
            mainResource = new ResourceDescription(key, exportedValue, conventional);
          } else {
            resources.push(new ResourceDescription(key, exportedValue, conventional));
          }
          metadata.define(metadata.resource, conventional, exportedValue);
        } else if (conventional = HtmlBehaviorResource.convention(key)) {
          if (conventional.elementName !== null && !mainResource) {
            mainResource = new ResourceDescription(key, exportedValue, conventional);
          } else {
            resources.push(new ResourceDescription(key, exportedValue, conventional));
          }

          metadata.define(metadata.resource, conventional, exportedValue);
        } else if (conventional = ValueConverterResource.convention(key) || BindingBehaviorResource.convention(key) || ViewEngineHooksResource.convention(key)) {
          resources.push(new ResourceDescription(key, exportedValue, conventional));
          metadata.define(metadata.resource, conventional, exportedValue);
        } else if (!fallbackValue) {
          fallbackValue = exportedValue;
          fallbackKey = key;
        }
      }
    }

    if (!mainResource && fallbackValue) {
      mainResource = new ResourceDescription(fallbackKey, fallbackValue);
    }

    resourceModule.moduleInstance = moduleInstance;
    resourceModule.mainResource = mainResource;
    resourceModule.resources = resources;
    resourceModule.viewStrategy = vs;

    return resourceModule;
  };

  return ModuleAnalyzer;
}();

var logger$1 = getLogger('templating');

function ensureRegistryEntry(loader, urlOrRegistryEntry) {
  if (urlOrRegistryEntry instanceof TemplateRegistryEntry) {
    return Promise.resolve(urlOrRegistryEntry);
  }

  return loader.loadTemplate(urlOrRegistryEntry);
}

var ProxyViewFactory = function () {
  function ProxyViewFactory(promise) {
    var _this8 = this;

    

    promise.then(function (x) {
      return _this8.viewFactory = x;
    });
  }

  ProxyViewFactory.prototype.create = function create(container, bindingContext, createInstruction, element) {
    return this.viewFactory.create(container, bindingContext, createInstruction, element);
  };

  ProxyViewFactory.prototype.setCacheSize = function setCacheSize(size, doNotOverrideIfAlreadySet) {
    this.viewFactory.setCacheSize(size, doNotOverrideIfAlreadySet);
  };

  ProxyViewFactory.prototype.getCachedView = function getCachedView() {
    return this.viewFactory.getCachedView();
  };

  ProxyViewFactory.prototype.returnViewToCache = function returnViewToCache(view) {
    this.viewFactory.returnViewToCache(view);
  };

  _createClass$2(ProxyViewFactory, [{
    key: 'isCaching',
    get: function get() {
      return this.viewFactory.isCaching;
    }
  }]);

  return ProxyViewFactory;
}();

var auSlotBehavior = null;

var ViewEngine = (_dec8$1 = inject(Loader, Container, ViewCompiler, ModuleAnalyzer, ViewResources), _dec8$1(_class15 = (_temp5 = _class16 = function () {
  function ViewEngine(loader, container, viewCompiler, moduleAnalyzer, appResources) {
    

    this.loader = loader;
    this.container = container;
    this.viewCompiler = viewCompiler;
    this.moduleAnalyzer = moduleAnalyzer;
    this.appResources = appResources;
    this._pluginMap = {};

    if (auSlotBehavior === null) {
      auSlotBehavior = new HtmlBehaviorResource();
      auSlotBehavior.attributeName = 'au-slot';
      metadata.define(metadata.resource, auSlotBehavior, SlotCustomAttribute);
    }

    auSlotBehavior.initialize(container, SlotCustomAttribute);
    auSlotBehavior.register(appResources);
  }

  ViewEngine.prototype.addResourcePlugin = function addResourcePlugin(extension, implementation) {
    var name = extension.replace('.', '') + '-resource-plugin';
    this._pluginMap[extension] = name;
    this.loader.addPlugin(name, implementation);
  };

  ViewEngine.prototype.loadViewFactory = function loadViewFactory(urlOrRegistryEntry, compileInstruction, loadContext, target) {
    var _this9 = this;

    loadContext = loadContext || new ResourceLoadContext();

    return ensureRegistryEntry(this.loader, urlOrRegistryEntry).then(function (registryEntry) {
      var url = registryEntry.address;

      if (registryEntry.onReady) {
        if (!loadContext.hasDependency(url)) {
          loadContext.addDependency(url);
          return registryEntry.onReady;
        }

        if (registryEntry.template === null) {
          return registryEntry.onReady;
        }

        return Promise.resolve(new ProxyViewFactory(registryEntry.onReady));
      }

      loadContext.addDependency(url);

      registryEntry.onReady = _this9.loadTemplateResources(registryEntry, compileInstruction, loadContext, target).then(function (resources) {
        registryEntry.resources = resources;

        if (registryEntry.template === null) {
          return registryEntry.factory = null;
        }

        var viewFactory = _this9.viewCompiler.compile(registryEntry.template, resources, compileInstruction);
        return registryEntry.factory = viewFactory;
      });

      return registryEntry.onReady;
    });
  };

  ViewEngine.prototype.loadTemplateResources = function loadTemplateResources(registryEntry, compileInstruction, loadContext, target) {
    var resources = new ViewResources(this.appResources, registryEntry.address);
    var dependencies = registryEntry.dependencies;
    var importIds = void 0;
    var names = void 0;

    compileInstruction = compileInstruction || ViewCompileInstruction.normal;

    if (dependencies.length === 0 && !compileInstruction.associatedModuleId) {
      return Promise.resolve(resources);
    }

    importIds = dependencies.map(function (x) {
      return x.src;
    });
    names = dependencies.map(function (x) {
      return x.name;
    });
    logger$1.debug('importing resources for ' + registryEntry.address, importIds);

    if (target) {
      var viewModelRequires = metadata.get(ViewEngine.viewModelRequireMetadataKey, target);
      if (viewModelRequires) {
        var templateImportCount = importIds.length;
        for (var i = 0, ii = viewModelRequires.length; i < ii; ++i) {
          var req = viewModelRequires[i];
          var importId = typeof req === 'function' ? Origin.get(req).moduleId : relativeToFile(req.src || req, registryEntry.address);

          if (importIds.indexOf(importId) === -1) {
            importIds.push(importId);
            names.push(req.as);
          }
        }
        logger$1.debug('importing ViewModel resources for ' + compileInstruction.associatedModuleId, importIds.slice(templateImportCount));
      }
    }

    return this.importViewResources(importIds, names, resources, compileInstruction, loadContext);
  };

  ViewEngine.prototype.importViewModelResource = function importViewModelResource(moduleImport, moduleMember) {
    var _this10 = this;

    return this.loader.loadModule(moduleImport).then(function (viewModelModule) {
      var normalizedId = Origin.get(viewModelModule).moduleId;
      var resourceModule = _this10.moduleAnalyzer.analyze(normalizedId, viewModelModule, moduleMember);

      if (!resourceModule.mainResource) {
        throw new Error('No view model found in module "' + moduleImport + '".');
      }

      resourceModule.initialize(_this10.container);

      return resourceModule.mainResource;
    });
  };

  ViewEngine.prototype.importViewResources = function importViewResources(moduleIds, names, resources, compileInstruction, loadContext) {
    var _this11 = this;

    loadContext = loadContext || new ResourceLoadContext();
    compileInstruction = compileInstruction || ViewCompileInstruction.normal;

    moduleIds = moduleIds.map(function (x) {
      return _this11._applyLoaderPlugin(x);
    });

    return this.loader.loadAllModules(moduleIds).then(function (imports) {
      var i = void 0;
      var ii = void 0;
      var analysis = void 0;
      var normalizedId = void 0;
      var current = void 0;
      var associatedModule = void 0;
      var container = _this11.container;
      var moduleAnalyzer = _this11.moduleAnalyzer;
      var allAnalysis = new Array(imports.length);

      for (i = 0, ii = imports.length; i < ii; ++i) {
        current = imports[i];
        normalizedId = Origin.get(current).moduleId;

        analysis = moduleAnalyzer.analyze(normalizedId, current);
        analysis.initialize(container);
        analysis.register(resources, names[i]);

        allAnalysis[i] = analysis;
      }

      if (compileInstruction.associatedModuleId) {
        associatedModule = moduleAnalyzer.getAnalysis(compileInstruction.associatedModuleId);

        if (associatedModule) {
          associatedModule.register(resources);
        }
      }

      for (i = 0, ii = allAnalysis.length; i < ii; ++i) {
        allAnalysis[i] = allAnalysis[i].load(container, loadContext);
      }

      return Promise.all(allAnalysis).then(function () {
        return resources;
      });
    });
  };

  ViewEngine.prototype._applyLoaderPlugin = function _applyLoaderPlugin(id) {
    var index = id.lastIndexOf('.');
    if (index !== -1) {
      var ext = id.substring(index);
      var pluginName = this._pluginMap[ext];

      if (pluginName === undefined) {
        return id;
      }

      return this.loader.applyPluginToUrl(id, pluginName);
    }

    return id;
  };

  return ViewEngine;
}(), _class16.viewModelRequireMetadataKey = 'aurelia:view-model-require', _temp5)) || _class15);

var Controller = function () {
  function Controller(behavior, instruction, viewModel, container) {
    

    this.behavior = behavior;
    this.instruction = instruction;
    this.viewModel = viewModel;
    this.isAttached = false;
    this.view = null;
    this.isBound = false;
    this.scope = null;
    this.container = container;
    this.elementEvents = container.elementEvents || null;

    var observerLookup = behavior.observerLocator.getOrCreateObserversLookup(viewModel);
    var handlesBind = behavior.handlesBind;
    var attributes = instruction.attributes;
    var boundProperties = this.boundProperties = [];
    var properties = behavior.properties;
    var i = void 0;
    var ii = void 0;

    behavior._ensurePropertiesDefined(viewModel, observerLookup);

    for (i = 0, ii = properties.length; i < ii; ++i) {
      properties[i]._initialize(viewModel, observerLookup, attributes, handlesBind, boundProperties);
    }
  }

  Controller.prototype.created = function created(owningView) {
    if (this.behavior.handlesCreated) {
      this.viewModel.created(owningView, this.view);
    }
  };

  Controller.prototype.automate = function automate(overrideContext, owningView) {
    this.view.bindingContext = this.viewModel;
    this.view.overrideContext = overrideContext || createOverrideContext(this.viewModel);
    this.view._isUserControlled = true;

    if (this.behavior.handlesCreated) {
      this.viewModel.created(owningView || null, this.view);
    }

    this.bind(this.view);
  };

  Controller.prototype.bind = function bind(scope) {
    var skipSelfSubscriber = this.behavior.handlesBind;
    var boundProperties = this.boundProperties;
    var i = void 0;
    var ii = void 0;
    var x = void 0;
    var observer = void 0;
    var selfSubscriber = void 0;

    if (this.isBound) {
      if (this.scope === scope) {
        return;
      }

      this.unbind();
    }

    this.isBound = true;
    this.scope = scope;

    for (i = 0, ii = boundProperties.length; i < ii; ++i) {
      x = boundProperties[i];
      observer = x.observer;
      selfSubscriber = observer.selfSubscriber;
      observer.publishing = false;

      if (skipSelfSubscriber) {
        observer.selfSubscriber = null;
      }

      x.binding.bind(scope);
      observer.call();

      observer.publishing = true;
      observer.selfSubscriber = selfSubscriber;
    }

    var overrideContext = void 0;
    if (this.view !== null) {
      if (skipSelfSubscriber) {
        this.view.viewModelScope = scope;
      }

      if (this.viewModel === scope.overrideContext.bindingContext) {
        overrideContext = scope.overrideContext;
      } else if (this.instruction.inheritBindingContext) {
        overrideContext = createOverrideContext(this.viewModel, scope.overrideContext);
      } else {
        overrideContext = createOverrideContext(this.viewModel);
        overrideContext.__parentOverrideContext = scope.overrideContext;
      }

      this.view.bind(this.viewModel, overrideContext);
    } else if (skipSelfSubscriber) {
      overrideContext = scope.overrideContext;

      if (scope.overrideContext.__parentOverrideContext !== undefined && this.viewModel.viewFactory && this.viewModel.viewFactory.factoryCreateInstruction.partReplacements) {
        overrideContext = Object.assign({}, scope.overrideContext);
        overrideContext.parentOverrideContext = scope.overrideContext.__parentOverrideContext;
      }
      this.viewModel.bind(scope.bindingContext, overrideContext);
    }
  };

  Controller.prototype.unbind = function unbind() {
    if (this.isBound) {
      var _boundProperties = this.boundProperties;
      var _i3 = void 0;
      var _ii2 = void 0;

      this.isBound = false;
      this.scope = null;

      if (this.view !== null) {
        this.view.unbind();
      }

      if (this.behavior.handlesUnbind) {
        this.viewModel.unbind();
      }

      if (this.elementEvents !== null) {
        this.elementEvents.disposeAll();
      }

      for (_i3 = 0, _ii2 = _boundProperties.length; _i3 < _ii2; ++_i3) {
        _boundProperties[_i3].binding.unbind();
      }
    }
  };

  Controller.prototype.attached = function attached() {
    if (this.isAttached) {
      return;
    }

    this.isAttached = true;

    if (this.behavior.handlesAttached) {
      this.viewModel.attached();
    }

    if (this.view !== null) {
      this.view.attached();
    }
  };

  Controller.prototype.detached = function detached() {
    if (this.isAttached) {
      this.isAttached = false;

      if (this.view !== null) {
        this.view.detached();
      }

      if (this.behavior.handlesDetached) {
        this.viewModel.detached();
      }
    }
  };

  return Controller;
}();

var BehaviorPropertyObserver = (_dec9$1 = subscriberCollection(), _dec9$1(_class17 = function () {
  function BehaviorPropertyObserver(taskQueue, obj, propertyName, selfSubscriber, initialValue) {
    

    this.taskQueue = taskQueue;
    this.obj = obj;
    this.propertyName = propertyName;
    this.notqueued = true;
    this.publishing = false;
    this.selfSubscriber = selfSubscriber;
    this.currentValue = this.oldValue = initialValue;
  }

  BehaviorPropertyObserver.prototype.getValue = function getValue() {
    return this.currentValue;
  };

  BehaviorPropertyObserver.prototype.setValue = function setValue(newValue) {
    var oldValue = this.currentValue;

    if (!Object.is(newValue, oldValue)) {
      this.oldValue = oldValue;
      this.currentValue = newValue;

      if (this.publishing && this.notqueued) {
        if (this.taskQueue.flushing) {
          this.call();
        } else {
          this.notqueued = false;
          this.taskQueue.queueMicroTask(this);
        }
      }
    }
  };

  BehaviorPropertyObserver.prototype.call = function call() {
    var oldValue = this.oldValue;
    var newValue = this.currentValue;

    this.notqueued = true;

    if (Object.is(newValue, oldValue)) {
      return;
    }

    if (this.selfSubscriber) {
      this.selfSubscriber(newValue, oldValue);
    }

    this.callSubscribers(newValue, oldValue);
    this.oldValue = newValue;
  };

  BehaviorPropertyObserver.prototype.subscribe = function subscribe(context, callable) {
    this.addSubscriber(context, callable);
  };

  BehaviorPropertyObserver.prototype.unsubscribe = function unsubscribe(context, callable) {
    this.removeSubscriber(context, callable);
  };

  return BehaviorPropertyObserver;
}()) || _class17);

function getObserver(instance, name) {
  var lookup = instance.__observers__;

  if (lookup === undefined) {
    var ctor = Object.getPrototypeOf(instance).constructor;
    var _behavior = metadata.get(metadata.resource, ctor);
    if (!_behavior.isInitialized) {
      _behavior.initialize(Container.instance || new Container(), instance.constructor);
    }

    lookup = _behavior.observerLocator.getOrCreateObserversLookup(instance);
    _behavior._ensurePropertiesDefined(instance, lookup);
  }

  return lookup[name];
}

var BindableProperty = function () {
  function BindableProperty(nameOrConfig) {
    

    if (typeof nameOrConfig === 'string') {
      this.name = nameOrConfig;
    } else {
      Object.assign(this, nameOrConfig);
    }

    this.attribute = this.attribute || _hyphenate(this.name);
    var defaultBindingMode = this.defaultBindingMode;
    if (defaultBindingMode === null || defaultBindingMode === undefined) {
      this.defaultBindingMode = bindingMode.oneWay;
    } else if (typeof defaultBindingMode === 'string') {
      this.defaultBindingMode = bindingMode[defaultBindingMode] || bindingMode.oneWay;
    }
    this.changeHandler = this.changeHandler || null;
    this.owner = null;
    this.descriptor = null;
  }

  BindableProperty.prototype.registerWith = function registerWith(target, behavior, descriptor) {
    behavior.properties.push(this);
    behavior.attributes[this.attribute] = this;
    this.owner = behavior;

    if (descriptor) {
      this.descriptor = descriptor;
      return this._configureDescriptor(descriptor);
    }

    return undefined;
  };

  BindableProperty.prototype._configureDescriptor = function _configureDescriptor(descriptor) {
    var name = this.name;

    descriptor.configurable = true;
    descriptor.enumerable = true;

    if ('initializer' in descriptor) {
      this.defaultValue = descriptor.initializer;
      delete descriptor.initializer;
      delete descriptor.writable;
    }

    if ('value' in descriptor) {
      this.defaultValue = descriptor.value;
      delete descriptor.value;
      delete descriptor.writable;
    }

    descriptor.get = function () {
      return getObserver(this, name).getValue();
    };

    descriptor.set = function (value) {
      getObserver(this, name).setValue(value);
    };

    descriptor.get.getObserver = function (obj) {
      return getObserver(obj, name);
    };

    return descriptor;
  };

  BindableProperty.prototype.defineOn = function defineOn(target, behavior) {
    var name = this.name;
    var handlerName = void 0;

    if (this.changeHandler === null) {
      handlerName = name + 'Changed';
      if (handlerName in target.prototype) {
        this.changeHandler = handlerName;
      }
    }

    if (this.descriptor === null) {
      Object.defineProperty(target.prototype, name, this._configureDescriptor(behavior, {}));
    }
  };

  BindableProperty.prototype.createObserver = function createObserver(viewModel) {
    var selfSubscriber = null;
    var defaultValue = this.defaultValue;
    var changeHandlerName = this.changeHandler;
    var name = this.name;
    var initialValue = void 0;

    if (this.hasOptions) {
      return undefined;
    }

    if (changeHandlerName in viewModel) {
      if ('propertyChanged' in viewModel) {
        selfSubscriber = function selfSubscriber(newValue, oldValue) {
          viewModel[changeHandlerName](newValue, oldValue);
          viewModel.propertyChanged(name, newValue, oldValue);
        };
      } else {
        selfSubscriber = function selfSubscriber(newValue, oldValue) {
          return viewModel[changeHandlerName](newValue, oldValue);
        };
      }
    } else if ('propertyChanged' in viewModel) {
      selfSubscriber = function selfSubscriber(newValue, oldValue) {
        return viewModel.propertyChanged(name, newValue, oldValue);
      };
    } else if (changeHandlerName !== null) {
      throw new Error('Change handler ' + changeHandlerName + ' was specified but not declared on the class.');
    }

    if (defaultValue !== undefined) {
      initialValue = typeof defaultValue === 'function' ? defaultValue.call(viewModel) : defaultValue;
    }

    return new BehaviorPropertyObserver(this.owner.taskQueue, viewModel, this.name, selfSubscriber, initialValue);
  };

  BindableProperty.prototype._initialize = function _initialize(viewModel, observerLookup, attributes, behaviorHandlesBind, boundProperties) {
    var selfSubscriber = void 0;
    var observer = void 0;
    var attribute = void 0;
    var defaultValue = this.defaultValue;

    if (this.isDynamic) {
      for (var _key6 in attributes) {
        this._createDynamicProperty(viewModel, observerLookup, behaviorHandlesBind, _key6, attributes[_key6], boundProperties);
      }
    } else if (!this.hasOptions) {
      observer = observerLookup[this.name];

      if (attributes !== null) {
        selfSubscriber = observer.selfSubscriber;
        attribute = attributes[this.attribute];

        if (behaviorHandlesBind) {
          observer.selfSubscriber = null;
        }

        if (typeof attribute === 'string') {
          viewModel[this.name] = attribute;
          observer.call();
        } else if (attribute) {
          boundProperties.push({ observer: observer, binding: attribute.createBinding(viewModel) });
        } else if (defaultValue !== undefined) {
          observer.call();
        }

        observer.selfSubscriber = selfSubscriber;
      }

      observer.publishing = true;
    }
  };

  BindableProperty.prototype._createDynamicProperty = function _createDynamicProperty(viewModel, observerLookup, behaviorHandlesBind, name, attribute, boundProperties) {
    var changeHandlerName = name + 'Changed';
    var selfSubscriber = null;
    var observer = void 0;
    var info = void 0;

    if (changeHandlerName in viewModel) {
      if ('propertyChanged' in viewModel) {
        selfSubscriber = function selfSubscriber(newValue, oldValue) {
          viewModel[changeHandlerName](newValue, oldValue);
          viewModel.propertyChanged(name, newValue, oldValue);
        };
      } else {
        selfSubscriber = function selfSubscriber(newValue, oldValue) {
          return viewModel[changeHandlerName](newValue, oldValue);
        };
      }
    } else if ('propertyChanged' in viewModel) {
      selfSubscriber = function selfSubscriber(newValue, oldValue) {
        return viewModel.propertyChanged(name, newValue, oldValue);
      };
    }

    observer = observerLookup[name] = new BehaviorPropertyObserver(this.owner.taskQueue, viewModel, name, selfSubscriber);

    Object.defineProperty(viewModel, name, {
      configurable: true,
      enumerable: true,
      get: observer.getValue.bind(observer),
      set: observer.setValue.bind(observer)
    });

    if (behaviorHandlesBind) {
      observer.selfSubscriber = null;
    }

    if (typeof attribute === 'string') {
      viewModel[name] = attribute;
      observer.call();
    } else if (attribute) {
      info = { observer: observer, binding: attribute.createBinding(viewModel) };
      boundProperties.push(info);
    }

    observer.publishing = true;
    observer.selfSubscriber = selfSubscriber;
  };

  return BindableProperty;
}();

var lastProviderId = 0;

function nextProviderId() {
  return ++lastProviderId;
}

function doProcessContent() {
  return true;
}
function doProcessAttributes() {}

var HtmlBehaviorResource = function () {
  function HtmlBehaviorResource() {
    

    this.elementName = null;
    this.attributeName = null;
    this.attributeDefaultBindingMode = undefined;
    this.liftsContent = false;
    this.targetShadowDOM = false;
    this.shadowDOMOptions = null;
    this.processAttributes = doProcessAttributes;
    this.processContent = doProcessContent;
    this.usesShadowDOM = false;
    this.childBindings = null;
    this.hasDynamicOptions = false;
    this.containerless = false;
    this.properties = [];
    this.attributes = {};
    this.isInitialized = false;
    this.primaryProperty = null;
  }

  HtmlBehaviorResource.convention = function convention(name, existing) {
    var behavior = void 0;

    if (name.endsWith('CustomAttribute')) {
      behavior = existing || new HtmlBehaviorResource();
      behavior.attributeName = _hyphenate(name.substring(0, name.length - 15));
    }

    if (name.endsWith('CustomElement')) {
      behavior = existing || new HtmlBehaviorResource();
      behavior.elementName = _hyphenate(name.substring(0, name.length - 13));
    }

    return behavior;
  };

  HtmlBehaviorResource.prototype.addChildBinding = function addChildBinding(behavior) {
    if (this.childBindings === null) {
      this.childBindings = [];
    }

    this.childBindings.push(behavior);
  };

  HtmlBehaviorResource.prototype.initialize = function initialize(container, target) {
    var proto = target.prototype;
    var properties = this.properties;
    var attributeName = this.attributeName;
    var attributeDefaultBindingMode = this.attributeDefaultBindingMode;
    var i = void 0;
    var ii = void 0;
    var current = void 0;

    if (this.isInitialized) {
      return;
    }

    this.isInitialized = true;
    target.__providerId__ = nextProviderId();

    this.observerLocator = container.get(ObserverLocator);
    this.taskQueue = container.get(TaskQueue);

    this.target = target;
    this.usesShadowDOM = this.targetShadowDOM && FEATURE.shadowDOM;
    this.handlesCreated = 'created' in proto;
    this.handlesBind = 'bind' in proto;
    this.handlesUnbind = 'unbind' in proto;
    this.handlesAttached = 'attached' in proto;
    this.handlesDetached = 'detached' in proto;
    this.htmlName = this.elementName || this.attributeName;

    if (attributeName !== null) {
      if (properties.length === 0) {
        new BindableProperty({
          name: 'value',
          changeHandler: 'valueChanged' in proto ? 'valueChanged' : null,
          attribute: attributeName,
          defaultBindingMode: attributeDefaultBindingMode
        }).registerWith(target, this);
      }

      current = properties[0];

      if (properties.length === 1 && current.name === 'value') {
        current.isDynamic = current.hasOptions = this.hasDynamicOptions;
        current.defineOn(target, this);
      } else {
        for (i = 0, ii = properties.length; i < ii; ++i) {
          properties[i].defineOn(target, this);
          if (properties[i].primaryProperty) {
            if (this.primaryProperty) {
              throw new Error('Only one bindable property on a custom element can be defined as the default');
            }
            this.primaryProperty = properties[i];
          }
        }

        current = new BindableProperty({
          name: 'value',
          changeHandler: 'valueChanged' in proto ? 'valueChanged' : null,
          attribute: attributeName,
          defaultBindingMode: attributeDefaultBindingMode
        });

        current.hasOptions = true;
        current.registerWith(target, this);
      }
    } else {
      for (i = 0, ii = properties.length; i < ii; ++i) {
        properties[i].defineOn(target, this);
      }

      this._copyInheritedProperties(container, target);
    }
  };

  HtmlBehaviorResource.prototype.register = function register(registry, name) {
    var _this12 = this;

    if (this.attributeName !== null) {
      registry.registerAttribute(name || this.attributeName, this, this.attributeName);

      if (Array.isArray(this.aliases)) {
        this.aliases.forEach(function (alias) {
          registry.registerAttribute(alias, _this12, _this12.attributeName);
        });
      }
    }

    if (this.elementName !== null) {
      registry.registerElement(name || this.elementName, this);
    }
  };

  HtmlBehaviorResource.prototype.load = function load(container, target, loadContext, viewStrategy, transientView) {
    var _this13 = this;

    var options = void 0;

    if (this.elementName !== null) {
      viewStrategy = container.get(ViewLocator).getViewStrategy(viewStrategy || this.viewStrategy || target);
      options = new ViewCompileInstruction(this.targetShadowDOM, true);

      if (!viewStrategy.moduleId) {
        viewStrategy.moduleId = Origin.get(target).moduleId;
      }

      return viewStrategy.loadViewFactory(container.get(ViewEngine), options, loadContext, target).then(function (viewFactory) {
        if (!transientView || !_this13.viewFactory) {
          _this13.viewFactory = viewFactory;
        }

        return viewFactory;
      });
    }

    return Promise.resolve(this);
  };

  HtmlBehaviorResource.prototype.compile = function compile(compiler, resources, node, instruction, parentNode) {
    if (this.liftsContent) {
      if (!instruction.viewFactory) {
        var _template = DOM.createElement('template');
        var fragment = DOM.createDocumentFragment();
        var cacheSize = node.getAttribute('view-cache');
        var part = node.getAttribute('part');

        node.removeAttribute(instruction.originalAttrName);
        DOM.replaceNode(_template, node, parentNode);
        fragment.appendChild(node);
        instruction.viewFactory = compiler.compile(fragment, resources);

        if (part) {
          instruction.viewFactory.part = part;
          node.removeAttribute('part');
        }

        if (cacheSize) {
          instruction.viewFactory.setCacheSize(cacheSize);
          node.removeAttribute('view-cache');
        }

        node = _template;
      }
    } else if (this.elementName !== null) {
      var _partReplacements2 = {};

      if (this.processContent(compiler, resources, node, instruction) && node.hasChildNodes()) {
        var currentChild = node.firstChild;
        var contentElement = this.usesShadowDOM ? null : DOM.createElement('au-content');
        var nextSibling = void 0;
        var toReplace = void 0;

        while (currentChild) {
          nextSibling = currentChild.nextSibling;

          if (currentChild.tagName === 'TEMPLATE' && (toReplace = currentChild.getAttribute('replace-part'))) {
            _partReplacements2[toReplace] = compiler.compile(currentChild, resources);
            DOM.removeNode(currentChild, parentNode);
            instruction.partReplacements = _partReplacements2;
          } else if (contentElement !== null) {
            if (currentChild.nodeType === 3 && _isAllWhitespace(currentChild)) {
              DOM.removeNode(currentChild, parentNode);
            } else {
              contentElement.appendChild(currentChild);
            }
          }

          currentChild = nextSibling;
        }

        if (contentElement !== null && contentElement.hasChildNodes()) {
          node.appendChild(contentElement);
        }

        instruction.skipContentProcessing = false;
      } else {
        instruction.skipContentProcessing = true;
      }
    } else if (!this.processContent(compiler, resources, node, instruction)) {
      instruction.skipContentProcessing = true;
    }

    return node;
  };

  HtmlBehaviorResource.prototype.create = function create(container, instruction, element, bindings) {
    var viewHost = void 0;
    var au = null;

    instruction = instruction || BehaviorInstruction.normal;
    element = element || null;
    bindings = bindings || null;

    if (this.elementName !== null && element) {
      if (this.usesShadowDOM) {
        viewHost = element.attachShadow(this.shadowDOMOptions);
        container.registerInstance(DOM.boundary, viewHost);
      } else {
        viewHost = element;
        if (this.targetShadowDOM) {
          container.registerInstance(DOM.boundary, viewHost);
        }
      }
    }

    if (element !== null) {
      element.au = au = element.au || {};
    }

    var viewModel = instruction.viewModel || container.get(this.target);
    var controller = new Controller(this, instruction, viewModel, container);
    var childBindings = this.childBindings;
    var viewFactory = void 0;

    if (this.liftsContent) {
      au.controller = controller;
    } else if (this.elementName !== null) {
      viewFactory = instruction.viewFactory || this.viewFactory;
      container.viewModel = viewModel;

      if (viewFactory) {
        controller.view = viewFactory.create(container, instruction, element);
      }

      if (element !== null) {
        au.controller = controller;

        if (controller.view) {
          if (!this.usesShadowDOM && (element.childNodes.length === 1 || element.contentElement)) {
            var contentElement = element.childNodes[0] || element.contentElement;
            controller.view.contentView = { fragment: contentElement };
            contentElement.parentNode && DOM.removeNode(contentElement);
          }

          if (instruction.anchorIsContainer) {
            if (childBindings !== null) {
              for (var _i4 = 0, _ii3 = childBindings.length; _i4 < _ii3; ++_i4) {
                controller.view.addBinding(childBindings[_i4].create(element, viewModel, controller));
              }
            }

            controller.view.appendNodesTo(viewHost);
          } else {
            controller.view.insertNodesBefore(viewHost);
          }
        } else if (childBindings !== null) {
          for (var _i5 = 0, _ii4 = childBindings.length; _i5 < _ii4; ++_i5) {
            bindings.push(childBindings[_i5].create(element, viewModel, controller));
          }
        }
      } else if (controller.view) {
        controller.view.controller = controller;

        if (childBindings !== null) {
          for (var _i6 = 0, _ii5 = childBindings.length; _i6 < _ii5; ++_i6) {
            controller.view.addBinding(childBindings[_i6].create(instruction.host, viewModel, controller));
          }
        }
      } else if (childBindings !== null) {
        for (var _i7 = 0, _ii6 = childBindings.length; _i7 < _ii6; ++_i7) {
          bindings.push(childBindings[_i7].create(instruction.host, viewModel, controller));
        }
      }
    } else if (childBindings !== null) {
      for (var _i8 = 0, _ii7 = childBindings.length; _i8 < _ii7; ++_i8) {
        bindings.push(childBindings[_i8].create(element, viewModel, controller));
      }
    }

    if (au !== null) {
      au[this.htmlName] = controller;
    }

    if (instruction.initiatedByBehavior && viewFactory) {
      controller.view.created();
    }

    return controller;
  };

  HtmlBehaviorResource.prototype._ensurePropertiesDefined = function _ensurePropertiesDefined(instance, lookup) {
    var properties = void 0;
    var i = void 0;
    var ii = void 0;
    var observer = void 0;

    if ('__propertiesDefined__' in lookup) {
      return;
    }

    lookup.__propertiesDefined__ = true;
    properties = this.properties;

    for (i = 0, ii = properties.length; i < ii; ++i) {
      observer = properties[i].createObserver(instance);

      if (observer !== undefined) {
        lookup[observer.propertyName] = observer;
      }
    }
  };

  HtmlBehaviorResource.prototype._copyInheritedProperties = function _copyInheritedProperties(container, target) {
    var _this14 = this;

    var behavior = void 0;
    var derived = target;

    while (true) {
      var proto = Object.getPrototypeOf(target.prototype);
      target = proto && proto.constructor;
      if (!target) {
        return;
      }
      behavior = metadata.getOwn(metadata.resource, target);
      if (behavior) {
        break;
      }
    }
    behavior.initialize(container, target);

    var _loop = function _loop(_i9, _ii8) {
      var prop = behavior.properties[_i9];

      if (_this14.properties.some(function (p) {
        return p.name === prop.name;
      })) {
        return 'continue';
      }

      new BindableProperty(prop).registerWith(derived, _this14);
    };

    for (var _i9 = 0, _ii8 = behavior.properties.length; _i9 < _ii8; ++_i9) {
      var _ret = _loop(_i9, _ii8);

      if (_ret === 'continue') continue;
    }
  };

  return HtmlBehaviorResource;
}();

function createChildObserverDecorator(selectorOrConfig, all$$1) {
  return function (target, key, descriptor) {
    var actualTarget = typeof key === 'string' ? target.constructor : target;
    var r = metadata.getOrCreateOwn(metadata.resource, HtmlBehaviorResource, actualTarget);

    if (typeof selectorOrConfig === 'string') {
      selectorOrConfig = {
        selector: selectorOrConfig,
        name: key
      };
    }

    if (descriptor) {
      descriptor.writable = true;
      descriptor.configurable = true;
    }

    selectorOrConfig.all = all$$1;
    r.addChildBinding(new ChildObserver(selectorOrConfig));
  };
}

function children(selectorOrConfig) {
  return createChildObserverDecorator(selectorOrConfig, true);
}

function child(selectorOrConfig) {
  return createChildObserverDecorator(selectorOrConfig, false);
}

var ChildObserver = function () {
  function ChildObserver(config) {
    

    this.name = config.name;
    this.changeHandler = config.changeHandler || this.name + 'Changed';
    this.selector = config.selector;
    this.all = config.all;
  }

  ChildObserver.prototype.create = function create(viewHost, viewModel, controller) {
    return new ChildObserverBinder(this.selector, viewHost, this.name, viewModel, controller, this.changeHandler, this.all);
  };

  return ChildObserver;
}();

var noMutations = [];

function trackMutation(groupedMutations, binder, record) {
  var mutations = groupedMutations.get(binder);

  if (!mutations) {
    mutations = [];
    groupedMutations.set(binder, mutations);
  }

  mutations.push(record);
}

function onChildChange(mutations, observer) {
  var binders = observer.binders;
  var bindersLength = binders.length;
  var groupedMutations = new Map();

  for (var _i10 = 0, _ii9 = mutations.length; _i10 < _ii9; ++_i10) {
    var record = mutations[_i10];
    var added = record.addedNodes;
    var removed = record.removedNodes;

    for (var j = 0, jj = removed.length; j < jj; ++j) {
      var _node = removed[j];
      if (_node.nodeType === 1) {
        for (var k = 0; k < bindersLength; ++k) {
          var binder = binders[k];
          if (binder.onRemove(_node)) {
            trackMutation(groupedMutations, binder, record);
          }
        }
      }
    }

    for (var _j = 0, _jj = added.length; _j < _jj; ++_j) {
      var _node2 = added[_j];
      if (_node2.nodeType === 1) {
        for (var _k = 0; _k < bindersLength; ++_k) {
          var _binder = binders[_k];
          if (_binder.onAdd(_node2)) {
            trackMutation(groupedMutations, _binder, record);
          }
        }
      }
    }
  }

  groupedMutations.forEach(function (value, key) {
    if (key.changeHandler !== null) {
      key.viewModel[key.changeHandler](value);
    }
  });
}

var ChildObserverBinder = function () {
  function ChildObserverBinder(selector, viewHost, property, viewModel, controller, changeHandler, all$$1) {
    

    this.selector = selector;
    this.viewHost = viewHost;
    this.property = property;
    this.viewModel = viewModel;
    this.controller = controller;
    this.changeHandler = changeHandler in viewModel ? changeHandler : null;
    this.usesShadowDOM = controller.behavior.usesShadowDOM;
    this.all = all$$1;

    if (!this.usesShadowDOM && controller.view && controller.view.contentView) {
      this.contentView = controller.view.contentView;
    } else {
      this.contentView = null;
    }
  }

  ChildObserverBinder.prototype.matches = function matches(element) {
    if (element.matches(this.selector)) {
      if (this.contentView === null) {
        return true;
      }

      var contentView = this.contentView;
      var assignedSlot = element.auAssignedSlot;

      if (assignedSlot && assignedSlot.projectFromAnchors) {
        var anchors = assignedSlot.projectFromAnchors;

        for (var _i11 = 0, _ii10 = anchors.length; _i11 < _ii10; ++_i11) {
          if (anchors[_i11].auOwnerView === contentView) {
            return true;
          }
        }

        return false;
      }

      return element.auOwnerView === contentView;
    }

    return false;
  };

  ChildObserverBinder.prototype.bind = function bind(source) {
    var viewHost = this.viewHost;
    var viewModel = this.viewModel;
    var observer = viewHost.__childObserver__;

    if (!observer) {
      observer = viewHost.__childObserver__ = DOM.createMutationObserver(onChildChange);

      var options = {
        childList: true,
        subtree: !this.usesShadowDOM
      };

      observer.observe(viewHost, options);
      observer.binders = [];
    }

    observer.binders.push(this);

    if (this.usesShadowDOM) {
      var current = viewHost.firstElementChild;

      if (this.all) {
        var items = viewModel[this.property];
        if (!items) {
          items = viewModel[this.property] = [];
        } else {
          items.splice(0);
        }

        while (current) {
          if (this.matches(current)) {
            items.push(current.au && current.au.controller ? current.au.controller.viewModel : current);
          }

          current = current.nextElementSibling;
        }

        if (this.changeHandler !== null) {
          this.viewModel[this.changeHandler](noMutations);
        }
      } else {
        while (current) {
          if (this.matches(current)) {
            var _value = current.au && current.au.controller ? current.au.controller.viewModel : current;
            this.viewModel[this.property] = _value;

            if (this.changeHandler !== null) {
              this.viewModel[this.changeHandler](_value);
            }

            break;
          }

          current = current.nextElementSibling;
        }
      }
    }
  };

  ChildObserverBinder.prototype.onRemove = function onRemove(element) {
    if (this.matches(element)) {
      var _value2 = element.au && element.au.controller ? element.au.controller.viewModel : element;

      if (this.all) {
        var items = this.viewModel[this.property] || (this.viewModel[this.property] = []);
        var index = items.indexOf(_value2);

        if (index !== -1) {
          items.splice(index, 1);
        }

        return true;
      }

      return false;
    }

    return false;
  };

  ChildObserverBinder.prototype.onAdd = function onAdd(element) {
    if (this.matches(element)) {
      var _value3 = element.au && element.au.controller ? element.au.controller.viewModel : element;

      if (this.all) {
        var items = this.viewModel[this.property] || (this.viewModel[this.property] = []);

        if (this.selector === '*') {
          items.push(_value3);
          return true;
        }

        var index = 0;
        var prev = element.previousElementSibling;

        while (prev) {
          if (this.matches(prev)) {
            index++;
          }

          prev = prev.previousElementSibling;
        }

        items.splice(index, 0, _value3);
        return true;
      }

      this.viewModel[this.property] = _value3;

      if (this.changeHandler !== null) {
        this.viewModel[this.changeHandler](_value3);
      }
    }

    return false;
  };

  ChildObserverBinder.prototype.unbind = function unbind() {
    if (this.viewHost.__childObserver__) {
      this.viewHost.__childObserver__.disconnect();
      this.viewHost.__childObserver__ = null;
      this.viewModel[this.property] = null;
    }
  };

  return ChildObserverBinder;
}();

function remove(viewSlot, previous) {
  return Array.isArray(previous) ? viewSlot.removeMany(previous, true) : viewSlot.remove(previous, true);
}

var SwapStrategies = {
  before: function before(viewSlot, previous, callback) {
    return previous === undefined ? callback() : callback().then(function () {
      return remove(viewSlot, previous);
    });
  },
  with: function _with(viewSlot, previous, callback) {
    return previous === undefined ? callback() : Promise.all([remove(viewSlot, previous), callback()]);
  },
  after: function after(viewSlot, previous, callback) {
    return Promise.resolve(viewSlot.removeAll(true)).then(callback);
  }
};

function tryActivateViewModel(context) {
  if (context.skipActivation || typeof context.viewModel.activate !== 'function') {
    return Promise.resolve();
  }

  return context.viewModel.activate(context.model) || Promise.resolve();
}

var CompositionEngine = (_dec10$1 = inject(ViewEngine, ViewLocator), _dec10$1(_class18 = function () {
  function CompositionEngine(viewEngine, viewLocator) {
    

    this.viewEngine = viewEngine;
    this.viewLocator = viewLocator;
  }

  CompositionEngine.prototype._swap = function _swap(context, view) {
    var swapStrategy = SwapStrategies[context.swapOrder] || SwapStrategies.after;
    var previousViews = context.viewSlot.children.slice();

    return swapStrategy(context.viewSlot, previousViews, function () {
      return Promise.resolve(context.viewSlot.add(view)).then(function () {
        if (context.currentController) {
          context.currentController.unbind();
        }
      });
    }).then(function () {
      if (context.compositionTransactionNotifier) {
        context.compositionTransactionNotifier.done();
      }
    });
  };

  CompositionEngine.prototype._createControllerAndSwap = function _createControllerAndSwap(context) {
    var _this15 = this;

    return this.createController(context).then(function (controller) {
      if (context.compositionTransactionOwnershipToken) {
        return context.compositionTransactionOwnershipToken.waitForCompositionComplete().then(function () {
          controller.automate(context.overrideContext, context.owningView);

          return _this15._swap(context, controller.view);
        }).then(function () {
          return controller;
        });
      }

      controller.automate(context.overrideContext, context.owningView);

      return _this15._swap(context, controller.view).then(function () {
        return controller;
      });
    });
  };

  CompositionEngine.prototype.createController = function createController(context) {
    var _this16 = this;

    var childContainer = void 0;
    var viewModel = void 0;
    var viewModelResource = void 0;

    var m = void 0;

    return this.ensureViewModel(context).then(tryActivateViewModel).then(function () {
      childContainer = context.childContainer;
      viewModel = context.viewModel;
      viewModelResource = context.viewModelResource;
      m = viewModelResource.metadata;

      var viewStrategy = _this16.viewLocator.getViewStrategy(context.view || viewModel);

      if (context.viewResources) {
        viewStrategy.makeRelativeTo(context.viewResources.viewUrl);
      }

      return m.load(childContainer, viewModelResource.value, null, viewStrategy, true);
    }).then(function (viewFactory) {
      return m.create(childContainer, BehaviorInstruction.dynamic(context.host, viewModel, viewFactory));
    });
  };

  CompositionEngine.prototype.ensureViewModel = function ensureViewModel(context) {
    var childContainer = context.childContainer = context.childContainer || context.container.createChild();

    if (typeof context.viewModel === 'string') {
      context.viewModel = context.viewResources ? context.viewResources.relativeToView(context.viewModel) : context.viewModel;

      return this.viewEngine.importViewModelResource(context.viewModel).then(function (viewModelResource) {
        childContainer.autoRegister(viewModelResource.value);

        if (context.host) {
          childContainer.registerInstance(DOM.Element, context.host);
        }

        context.viewModel = childContainer.viewModel = childContainer.get(viewModelResource.value);
        context.viewModelResource = viewModelResource;
        return context;
      });
    }

    var ctor = context.viewModel.constructor;
    var isClass = typeof context.viewModel === 'function';
    if (isClass) {
      ctor = context.viewModel;
      childContainer.autoRegister(ctor);
    }
    var m = metadata.getOrCreateOwn(metadata.resource, HtmlBehaviorResource, ctor);

    m.elementName = m.elementName || 'dynamic-element';

    m.initialize(isClass ? childContainer : context.container || childContainer, ctor);

    context.viewModelResource = { metadata: m, value: ctor };

    if (context.host) {
      childContainer.registerInstance(DOM.Element, context.host);
    }
    childContainer.viewModel = context.viewModel = isClass ? childContainer.get(ctor) : context.viewModel;
    return Promise.resolve(context);
  };

  CompositionEngine.prototype.compose = function compose(context) {
    var _this17 = this;

    context.childContainer = context.childContainer || context.container.createChild();
    context.view = this.viewLocator.getViewStrategy(context.view);

    var transaction = context.childContainer.get(CompositionTransaction);
    var compositionTransactionOwnershipToken = transaction.tryCapture();

    if (compositionTransactionOwnershipToken) {
      context.compositionTransactionOwnershipToken = compositionTransactionOwnershipToken;
    } else {
      context.compositionTransactionNotifier = transaction.enlist();
    }

    if (context.viewModel) {
      return this._createControllerAndSwap(context);
    } else if (context.view) {
      if (context.viewResources) {
        context.view.makeRelativeTo(context.viewResources.viewUrl);
      }

      return context.view.loadViewFactory(this.viewEngine, new ViewCompileInstruction()).then(function (viewFactory) {
        var result = viewFactory.create(context.childContainer);
        result.bind(context.bindingContext, context.overrideContext);

        if (context.compositionTransactionOwnershipToken) {
          return context.compositionTransactionOwnershipToken.waitForCompositionComplete().then(function () {
            return _this17._swap(context, result);
          }).then(function () {
            return result;
          });
        }

        return _this17._swap(context, result).then(function () {
          return result;
        });
      });
    } else if (context.viewSlot) {
      context.viewSlot.removeAll();

      if (context.compositionTransactionNotifier) {
        context.compositionTransactionNotifier.done();
      }

      return Promise.resolve(null);
    }

    return Promise.resolve(null);
  };

  return CompositionEngine;
}()) || _class18);

var ElementConfigResource = function () {
  function ElementConfigResource() {
    
  }

  ElementConfigResource.prototype.initialize = function initialize(container, target) {};

  ElementConfigResource.prototype.register = function register(registry, name) {};

  ElementConfigResource.prototype.load = function load(container, target) {
    var config = new target();
    var eventManager = container.get(EventManager);
    eventManager.registerElementConfig(config);
  };

  return ElementConfigResource;
}();

function resource(instanceOrConfig) {
  return function (target) {
    var isConfig = typeof instanceOrConfig === 'string' || Object.getPrototypeOf(instanceOrConfig) === Object.prototype;
    if (isConfig) {
      target.$resource = instanceOrConfig;
    } else {
      metadata.define(metadata.resource, instanceOrConfig, target);
    }
  };
}

function behavior(override) {
  return function (target) {
    if (override instanceof HtmlBehaviorResource) {
      metadata.define(metadata.resource, override, target);
    } else {
      var r = metadata.getOrCreateOwn(metadata.resource, HtmlBehaviorResource, target);
      Object.assign(r, override);
    }
  };
}

function customElement(name) {
  return function (target) {
    var r = metadata.getOrCreateOwn(metadata.resource, HtmlBehaviorResource, target);
    r.elementName = validateBehaviorName(name, 'custom element');
  };
}

function customAttribute(name, defaultBindingMode, aliases) {
  return function (target) {
    var r = metadata.getOrCreateOwn(metadata.resource, HtmlBehaviorResource, target);
    r.attributeName = validateBehaviorName(name, 'custom attribute');
    r.attributeDefaultBindingMode = defaultBindingMode;
    r.aliases = aliases;
  };
}

function templateController(target) {
  var deco = function deco(t) {
    var r = metadata.getOrCreateOwn(metadata.resource, HtmlBehaviorResource, t);
    r.liftsContent = true;
  };

  return target ? deco(target) : deco;
}

function bindable(nameOrConfigOrTarget, key, descriptor) {
  var deco = function deco(target, key2, descriptor2) {
    var actualTarget = key2 ? target.constructor : target;
    var r = metadata.getOrCreateOwn(metadata.resource, HtmlBehaviorResource, actualTarget);
    var prop = void 0;

    if (key2) {
      nameOrConfigOrTarget = nameOrConfigOrTarget || {};
      nameOrConfigOrTarget.name = key2;
    }

    prop = new BindableProperty(nameOrConfigOrTarget);
    return prop.registerWith(actualTarget, r, descriptor2);
  };

  if (!nameOrConfigOrTarget) {
    return deco;
  }

  if (key) {
    var _target = nameOrConfigOrTarget;
    nameOrConfigOrTarget = null;
    return deco(_target, key, descriptor);
  }

  return deco;
}

function dynamicOptions(target) {
  var deco = function deco(t) {
    var r = metadata.getOrCreateOwn(metadata.resource, HtmlBehaviorResource, t);
    r.hasDynamicOptions = true;
  };

  return target ? deco(target) : deco;
}

var defaultShadowDOMOptions = { mode: 'open' };

function useShadowDOM(targetOrOptions) {
  var options = typeof targetOrOptions === 'function' || !targetOrOptions ? defaultShadowDOMOptions : targetOrOptions;

  var deco = function deco(t) {
    var r = metadata.getOrCreateOwn(metadata.resource, HtmlBehaviorResource, t);
    r.targetShadowDOM = true;
    r.shadowDOMOptions = options;
  };

  return typeof targetOrOptions === 'function' ? deco(targetOrOptions) : deco;
}

function processAttributes(processor) {
  return function (t) {
    var r = metadata.getOrCreateOwn(metadata.resource, HtmlBehaviorResource, t);
    r.processAttributes = function (compiler, resources, node, attributes, elementInstruction) {
      try {
        processor(compiler, resources, node, attributes, elementInstruction);
      } catch (error) {
        getLogger('templating').error(error);
      }
    };
  };
}

function doNotProcessContent() {
  return false;
}

function processContent(processor) {
  return function (t) {
    var r = metadata.getOrCreateOwn(metadata.resource, HtmlBehaviorResource, t);
    r.processContent = processor ? function (compiler, resources, node, instruction) {
      try {
        return processor(compiler, resources, node, instruction);
      } catch (error) {
        getLogger('templating').error(error);
        return false;
      }
    } : doNotProcessContent;
  };
}

function containerless(target) {
  var deco = function deco(t) {
    var r = metadata.getOrCreateOwn(metadata.resource, HtmlBehaviorResource, t);
    r.containerless = true;
  };

  return target ? deco(target) : deco;
}

function useViewStrategy(strategy) {
  return function (target) {
    metadata.define(ViewLocator.viewStrategyMetadataKey, strategy, target);
  };
}

function useView(path) {
  return useViewStrategy(new RelativeViewStrategy(path));
}

function inlineView(markup, dependencies, dependencyBaseUrl) {
  return useViewStrategy(new InlineViewStrategy(markup, dependencies, dependencyBaseUrl));
}

function noView(targetOrDependencies, dependencyBaseUrl) {
  var target = void 0;
  var dependencies = void 0;
  if (typeof targetOrDependencies === 'function') {
    target = targetOrDependencies;
  } else {
    dependencies = targetOrDependencies;
    target = undefined;
  }

  var deco = function deco(t) {
    metadata.define(ViewLocator.viewStrategyMetadataKey, new NoViewStrategy(dependencies, dependencyBaseUrl), t);
  };

  return target ? deco(target) : deco;
}

function view(templateOrConfig) {
  return function (target) {
    target.$view = templateOrConfig;
  };
}

function elementConfig(target) {
  var deco = function deco(t) {
    metadata.define(metadata.resource, new ElementConfigResource(), t);
  };

  return target ? deco(target) : deco;
}

function viewResources() {
  for (var _len = arguments.length, resources = Array(_len), _key7 = 0; _key7 < _len; _key7++) {
    resources[_key7] = arguments[_key7];
  }

  return function (target) {
    metadata.define(ViewEngine.viewModelRequireMetadataKey, resources, target);
  };
}

var TemplatingEngine = (_dec11 = inject(Container, ModuleAnalyzer, ViewCompiler, CompositionEngine), _dec11(_class19 = function () {
  function TemplatingEngine(container, moduleAnalyzer, viewCompiler, compositionEngine) {
    

    this._container = container;
    this._moduleAnalyzer = moduleAnalyzer;
    this._viewCompiler = viewCompiler;
    this._compositionEngine = compositionEngine;
    container.registerInstance(Animator, Animator.instance = new Animator());
  }

  TemplatingEngine.prototype.configureAnimator = function configureAnimator(animator) {
    this._container.unregister(Animator);
    this._container.registerInstance(Animator, Animator.instance = animator);
  };

  TemplatingEngine.prototype.compose = function compose(context) {
    return this._compositionEngine.compose(context);
  };

  TemplatingEngine.prototype.enhance = function enhance(instruction) {
    if (instruction instanceof DOM.Element) {
      instruction = { element: instruction };
    }

    var compilerInstructions = { letExpressions: [] };
    var resources = instruction.resources || this._container.get(ViewResources);

    this._viewCompiler._compileNode(instruction.element, resources, compilerInstructions, instruction.element.parentNode, 'root', true);

    var factory$$1 = new ViewFactory(instruction.element, compilerInstructions, resources);
    var container = instruction.container || this._container.createChild();
    var view = factory$$1.create(container, BehaviorInstruction.enhance());

    view.bind(instruction.bindingContext || {}, instruction.overrideContext);

    view.firstChild = view.lastChild = view.fragment;
    view.fragment = DOM.createDocumentFragment();
    view.attached();

    return view;
  };

  return TemplatingEngine;
}()) || _class19);

var aureliaTemplating = /*#__PURE__*/Object.freeze({
    animationEvent: animationEvent,
    Animator: Animator,
    CompositionTransactionNotifier: CompositionTransactionNotifier,
    CompositionTransactionOwnershipToken: CompositionTransactionOwnershipToken,
    CompositionTransaction: CompositionTransaction,
    _hyphenate: _hyphenate,
    _isAllWhitespace: _isAllWhitespace,
    ViewEngineHooksResource: ViewEngineHooksResource,
    viewEngineHooks: viewEngineHooks,
    ElementEvents: ElementEvents,
    ResourceLoadContext: ResourceLoadContext,
    ViewCompileInstruction: ViewCompileInstruction,
    BehaviorInstruction: BehaviorInstruction,
    TargetInstruction: TargetInstruction,
    viewStrategy: viewStrategy,
    RelativeViewStrategy: RelativeViewStrategy,
    ConventionalViewStrategy: ConventionalViewStrategy,
    NoViewStrategy: NoViewStrategy,
    TemplateRegistryViewStrategy: TemplateRegistryViewStrategy,
    InlineViewStrategy: InlineViewStrategy,
    StaticViewStrategy: StaticViewStrategy,
    ViewLocator: ViewLocator,
    BindingLanguage: BindingLanguage,
    SlotCustomAttribute: SlotCustomAttribute,
    PassThroughSlot: PassThroughSlot,
    ShadowSlot: ShadowSlot,
    ShadowDOM: ShadowDOM,
    validateBehaviorName: validateBehaviorName,
    ViewResources: ViewResources,
    View: View,
    ViewSlot: ViewSlot,
    BoundViewFactory: BoundViewFactory,
    ViewFactory: ViewFactory,
    ViewCompiler: ViewCompiler,
    ResourceModule: ResourceModule,
    ResourceDescription: ResourceDescription,
    ModuleAnalyzer: ModuleAnalyzer,
    ViewEngine: ViewEngine,
    Controller: Controller,
    BehaviorPropertyObserver: BehaviorPropertyObserver,
    BindableProperty: BindableProperty,
    HtmlBehaviorResource: HtmlBehaviorResource,
    children: children,
    child: child,
    SwapStrategies: SwapStrategies,
    CompositionEngine: CompositionEngine,
    ElementConfigResource: ElementConfigResource,
    resource: resource,
    behavior: behavior,
    customElement: customElement,
    customAttribute: customAttribute,
    templateController: templateController,
    bindable: bindable,
    dynamicOptions: dynamicOptions,
    useShadowDOM: useShadowDOM,
    processAttributes: processAttributes,
    processContent: processContent,
    containerless: containerless,
    useViewStrategy: useViewStrategy,
    useView: useView,
    inlineView: inlineView,
    noView: noView,
    view: view,
    elementConfig: elementConfig,
    viewResources: viewResources,
    TemplatingEngine: TemplatingEngine
});

const logger$2 = getLogger('aurelia');

function unwrapExports (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var deepExtend_1 = createCommonjsModule(function (module, exports) {
/*!
 * @description Recursive object extending
 * @author Viacheslav Lotsmanov <lotsmanov89@gmail.com>
 * @license MIT
 *
 * The MIT License (MIT)
 *
 * Copyright (c) 2013-2015 Viacheslav Lotsmanov
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
Object.defineProperty(exports, "__esModule", { value: true });
function isSpecificValue(val) {
    return (val instanceof Buffer
        || val instanceof Date
        || val instanceof RegExp) ? true : false;
}
function cloneSpecificValue(val) {
    if (val instanceof Buffer) {
        var x = new Buffer(val.length);
        val.copy(x);
        return x;
    }
    else if (val instanceof Date) {
        return new Date(val.getTime());
    }
    else if (val instanceof RegExp) {
        return new RegExp(val);
    }
    else {
        throw new Error('Unexpected situation');
    }
}
function deepCloneArray(arr) {
    var clone = [];
    arr.forEach(function (item, index) {
        if (typeof item === 'object' && item !== null) {
            if (Array.isArray(item)) {
                clone[index] = deepCloneArray(item);
            }
            else if (isSpecificValue(item)) {
                clone[index] = cloneSpecificValue(item);
            }
            else {
                clone[index] = deepExtend({}, item);
            }
        }
        else {
            clone[index] = item;
        }
    });
    return clone;
}
var deepExtend;
exports.default = deepExtend = function () {
    if (arguments.length < 1 || typeof arguments[0] !== 'object') {
        return false;
    }
    if (arguments.length < 2) {
        return arguments[0];
    }
    var target = arguments[0];
    var args = Array.prototype.slice.call(arguments, 1);
    var val, src;
    args.forEach(function (obj) {
        if (typeof obj !== 'object' || Array.isArray(obj)) {
            return;
        }
        Object.keys(obj).forEach(function (key) {
            src = target[key];
            val = obj[key];
            if (val === target) {
                return;
            }
            else if (typeof val !== 'object' || val === null) {
                target[key] = val;
                return;
            }
            else if (Array.isArray(val)) {
                target[key] = deepCloneArray(val);
                return;
            }
            else if (isSpecificValue(val)) {
                target[key] = cloneSpecificValue(val);
                return;
            }
            else if (typeof src !== 'object' || src === null || Array.isArray(src)) {
                target[key] = deepExtend({}, val);
                return;
            }
            else {
                target[key] = deepExtend(src, val);
                return;
            }
        });
    });
    return target;
};

});

unwrapExports(deepExtend_1);

var windowInfo = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });
var WindowInfo = (function () {
    function WindowInfo() {
    }
    return WindowInfo;
}());
exports.WindowInfo = WindowInfo;

});

unwrapExports(windowInfo);
var windowInfo_1 = windowInfo.WindowInfo;

var aureliaConfiguration = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });



var AureliaConfiguration = (function () {
    function AureliaConfiguration() {
        this.environment = 'default';
        this.environments = null;
        this.directory = 'config';
        this.config_file = 'config.json';
        this.cascade_mode = true;
        this.base_path_mode = false;
        this._config_object = {};
        this._config_merge_object = {};
        this.window = new windowInfo.WindowInfo();
        this.window.hostName = window.location.hostname;
        this.window.port = window.location.port;
        if (window.location.pathname && window.location.pathname.length > 1) {
            this.window.pathName = window.location.pathname;
        }
    }
    AureliaConfiguration.prototype.setDirectory = function (path) {
        this.directory = path;
    };
    AureliaConfiguration.prototype.setConfig = function (name) {
        this.config_file = name;
    };
    AureliaConfiguration.prototype.setEnvironment = function (environment) {
        this.environment = environment;
    };
    AureliaConfiguration.prototype.setEnvironments = function (environments) {
        if (environments === void 0) { environments = null; }
        if (environments !== null) {
            this.environments = environments;
            this.check();
        }
    };
    AureliaConfiguration.prototype.setCascadeMode = function (bool) {
        if (bool === void 0) { bool = true; }
        this.cascade_mode = bool;
    };
    AureliaConfiguration.prototype.setWindow = function (window) {
        this.window = window;
    };
    AureliaConfiguration.prototype.setBasePathMode = function (bool) {
        if (bool === void 0) { bool = true; }
        this.base_path_mode = bool;
    };
    Object.defineProperty(AureliaConfiguration.prototype, "obj", {
        get: function () {
            return this._config_object;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AureliaConfiguration.prototype, "config", {
        get: function () {
            return this.config_file;
        },
        enumerable: true,
        configurable: true
    });
    AureliaConfiguration.prototype.is = function (environment) {
        return (environment === this.environment);
    };
    AureliaConfiguration.prototype.check = function () {
        var hostname = this.window.hostName;
        if (this.window.port != '')
            hostname += ':' + this.window.port;
        if (this.base_path_mode)
            hostname += this.window.pathName;
        if (this.environments) {
            for (var env in this.environments) {
                var hostnames = this.environments[env];
                if (hostnames) {
                    for (var _i = 0, hostnames_1 = hostnames; _i < hostnames_1.length; _i++) {
                        var host = hostnames_1[_i];
                        if (hostname.search('(?:^|\W)' + host + '(?:$|\W)') !== -1) {
                            this.setEnvironment(env);
                            return;
                        }
                    }
                }
            }
        }
    };
    AureliaConfiguration.prototype.environmentEnabled = function () {
        return (!(this.environment === 'default' || this.environment === '' || !this.environment));
    };
    AureliaConfiguration.prototype.environmentExists = function () {
        return this.environment in this.obj;
    };
    AureliaConfiguration.prototype.getDictValue = function (baseObject, key) {
        var splitKey = key.split('.');
        var currentObject = baseObject;
        splitKey.forEach(function (key) {
            if (currentObject[key]) {
                currentObject = currentObject[key];
            }
            else {
                throw 'Key ' + key + ' not found';
            }
        });
        return currentObject;
    };
    AureliaConfiguration.prototype.get = function (key, defaultValue) {
        if (defaultValue === void 0) { defaultValue = null; }
        var returnVal = defaultValue;
        if (key.indexOf('.') === -1) {
            if (!this.environmentEnabled()) {
                return this.obj[key] ? this.obj[key] : defaultValue;
            }
            if (this.environmentEnabled()) {
                if (this.environmentExists() && this.obj[this.environment][key]) {
                    returnVal = this.obj[this.environment][key];
                }
                else if (this.cascade_mode && this.obj[key]) {
                    returnVal = this.obj[key];
                }
                return returnVal;
            }
        }
        else {
            if (this.environmentEnabled()) {
                if (this.environmentExists()) {
                    try {
                        return this.getDictValue(this.obj[this.environment], key);
                    }
                    catch (_a) {
                        if (this.cascade_mode) {
                            try {
                                return this.getDictValue(this.obj, key);
                            }
                            catch (_b) { }
                        }
                    }
                }
            }
            else {
                try {
                    return this.getDictValue(this.obj, key);
                }
                catch (_c) { }
            }
        }
        return returnVal;
    };
    AureliaConfiguration.prototype.set = function (key, val) {
        if (key.indexOf('.') === -1) {
            this.obj[key] = val;
        }
        else {
            var splitKey = key.split('.');
            var parent_1 = splitKey[0];
            var child = splitKey[1];
            if (this.obj[parent_1] === undefined) {
                this.obj[parent_1] = {};
            }
            this.obj[parent_1][child] = val;
        }
    };
    AureliaConfiguration.prototype.merge = function (obj) {
        var currentConfig = this._config_object;
        this._config_object = deepExtend_1.default(currentConfig, obj);
    };
    AureliaConfiguration.prototype.lazyMerge = function (obj) {
        var currentMergeConfig = (this._config_merge_object || {});
        this._config_merge_object = deepExtend_1.default(currentMergeConfig, obj);
    };
    AureliaConfiguration.prototype.setAll = function (obj) {
        this._config_object = obj;
    };
    AureliaConfiguration.prototype.getAll = function () {
        return this.obj;
    };
    AureliaConfiguration.prototype.loadConfig = function () {
        var _this = this;
        return this.loadConfigFile(aureliaPath.join(this.directory, this.config), function (data) { return _this.setAll(data); })
            .then(function () {
            if (_this._config_merge_object) {
                _this.merge(_this._config_merge_object);
                _this._config_merge_object = null;
            }
        });
    };
    AureliaConfiguration.prototype.loadConfigFile = function (path, action) {
        return new Promise(function (resolve, reject) {
            var pathClosure = path.toString();
            var xhr = new XMLHttpRequest();
            if (xhr.overrideMimeType) {
                xhr.overrideMimeType('application/json');
            }
            xhr.open('GET', pathClosure, true);
            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4 && xhr.status == 200) {
                    var data = JSON.parse(this.responseText);
                    action(data);
                    resolve(data);
                }
            };
            xhr.onloadend = function () {
                if (xhr.status == 404) {
                    reject('Configuration file could not be found: ' + path);
                }
            };
            xhr.onerror = function () {
                reject("Configuration file could not be found or loaded: " + pathClosure);
            };
            xhr.send(null);
        });
    };
    AureliaConfiguration.prototype.mergeConfigFile = function (path, optional) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this
                .loadConfigFile(path, function (data) {
                _this.lazyMerge(data);
                resolve();
            })
                .catch(function (error) {
                if (optional === true) {
                    resolve();
                }
                else {
                    reject(error);
                }
            });
        });
    };
    return AureliaConfiguration;
}());
exports.AureliaConfiguration = AureliaConfiguration;

});

unwrapExports(aureliaConfiguration);
var aureliaConfiguration_1 = aureliaConfiguration.AureliaConfiguration;

var commonjs = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });

exports.AureliaConfiguration = aureliaConfiguration.AureliaConfiguration;
function configure(aurelia, configCallback) {
    var instance = aurelia.container.get(aureliaConfiguration.AureliaConfiguration);
    var promise = null;
    if (configCallback !== undefined && typeof (configCallback) === 'function') {
        promise = Promise.resolve(configCallback(instance));
    }
    else {
        promise = Promise.resolve();
    }
    return promise
        .then(function () {
        return instance.loadConfig();
    });
}
exports.configure = configure;

});

unwrapExports(commonjs);
var commonjs_1 = commonjs.AureliaConfiguration;
var commonjs_2 = commonjs.configure;

// import { EntityManager } from 'aurelia-orm';
// import { AuthService } from 'aurelia-authentication';
// import { UserService } from './services/user/service';
// import { Hotel } from "packages/aurelia-erp-hotel";
// require("packages/aurelia-erp-hotel");
PLATFORM.moduleName('./index');
// tslint:disable-next-line:completed-docs
exports.App = class App {
    // private user: any = this.UserService.getInfos();
    constructor(
    // tslint:disable-next-line:no-shadowed-variable
    AureliaConfiguration) {
        this.AureliaConfiguration = AureliaConfiguration;
        this.application = '';
        // // auth: any;
        // router: Router;
        // auth: AuthService;
        this.routes = Array();
        // console.log(this.application);
        // this.auth = auth;
        this.config = this.AureliaConfiguration.get('apps').filter((x) => x.name == this.application)[0];
    }
    // replace current view
    determineActivationStrategy() {
        return 'replace';
    }
    configureRouter(config) {
        this.generateMenus();
        // console.log(this.routes);
        config.title = this.application;
        // this.routes
        config.map(this.routes);
        // this.router = router;
    }
    /// TODO: Remove THAT PART
    generateMenus() {
        // console.log(this.config.menus);
        // console.log(this.user.permission);
        this.config.menus
            //  filter user permissions
            // .filter(menu => menu.settings.permissions.includes(this.user.permission))
            .map((menu) => {
            // console.log(menu);
            // this.entityManager.registerEntity(require('./entity/' + menu.entity));
            const entity = this.config.entities[menu.entity];
            menu.href = `/#/u/${this.application}/${menu.name}`;
            if (menu.default == true) {
                menu.title = menu.title || menu.name;
                menu.settings.name = `${this.application}-${menu.name}`;
                this.routes.push({
                    route: ['', menu.name],
                    href: menu.href,
                    // route: ["/", menu.settings.name],
                    name: menu.settings.name,
                    nav: true,
                    title: menu.title,
                    moduleId: PLATFORM.moduleName(menu.moduleId),
                    // moduleId: PLATFORM.moduleName("aurelia-erp-hotel"),
                    // moduleId: PLATFORM.moduleName(
                    //   `apps/${this.application}/components/${menu.moduleId}`
                    //   // "apps/hotel/components/dashboard/index"
                    // ),
                    settings: menu.settings
                });
            }
            else if (menu.crud == false) {
                menu.title = menu.title || menu.name;
                menu.settings.name = `${menu.name}-${this.application}`;
                this.routes.push({
                    href: menu.href,
                    route: menu.name,
                    name: menu.settings.name,
                    nav: true,
                    title: menu.title,
                    // moduleId: PLATFORM.moduleName(menu.moduleId),
                    moduleId: PLATFORM.moduleName(`apps/${this.application}/components/${menu.moduleId}`
                    // "apps/hotel/components/dashboard/index"
                    ),
                    settings: menu.settings
                });
            }
            else {
                // console.log(this.config);
                this.addCrudRoutes(menu, entity);
            }
        });
    }
    addCrudRoutes(menu, entity) {
        // console.log(menu.entity);
        menu.href = `/#/u/${this.application}/${menu.entity}`;
        this.routes.push({
            href: menu.href,
            route: menu.entity,
            name: menu.entity,
            // moduleId: PLATFORM.moduleName("../../shared/crud/list/index"),
            moduleId: PLATFORM.moduleName('shared/crud/list/index'),
            nav: menu.nav == undefined ? true : menu.nav,
            title: menu.name,
            settings: {
                entity: entity,
                resource: menu.entity,
                icon: menu.settings.icon
            }
        }, {
            href: `${menu.href}/new`,
            route: `${menu.entity}/new`,
            name: `new-${menu.entity}`,
            // moduleId: PLATFORM.moduleName(menu.new || "shared/crud/new/index"),
            moduleId: PLATFORM.moduleName('shared/crud/new/index'),
            // nav: true,
            title: 'new',
            settings: {
                entity: entity,
                resource: menu.entity,
                icon: menu.settings.icon
            }
        }, {
            href: `${menu.href}/:id`,
            route: `${menu.entity}'/:id`,
            name: `edit-${menu.entity}`,
            moduleId: PLATFORM.moduleName(`shared/crud/edit/index`),
            // menu.edit || menu.new || `shared/crud/edit/index`
            // nav: true,
            title: 'edit',
            settings: {
                entity: entity,
                icon: menu.settings.icon,
                resource: menu.entity
            }
        });
    }
};
exports.App = __decorate([
    noView(),
    autoinject(),
    __metadata("design:paramtypes", [commonjs_1])
], exports.App);

var typer = {
  /**
   * Detect the type of `value`. Returns 'integer', 'float', 'boolean' or 'string'; defaults to 'string'.
   *
   * @param {*} value
   *
   * @returns {String}
   */
  detect : function (value) {
    value += '';

    if (value.search(/^\-?\d+$/) > -1) {
      return 'integer';
    }

    if (value.search(/^\-?\d+\.\d+[\d.]*$/) > -1) {
      return 'float';
    }

    if ('false' === value || 'true' === value) {
      return 'boolean';
    }

    if (value.search(/^\d{4}\-\d{2}\-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z?$/) > -1) {
      return 'datetime';
    }

    return 'string';
  },

  /**
   * Cast `value` to given `type`.
   *
   * @param {*}      value
   * @param {String} [type]
   *
   * @returns {*}
   */
  cast : function (value, type) {
    type = type || 'smart';

    switch (type) {
      case 'boolean':
      case 'bool':
        if (typeof value !== 'string') {
          value = !!value;
        } else {
          value = ['null', 'undefined', '0', 'false'].indexOf(value) === -1;
        }

        break;

      case 'string':
      case 'text':
        value = this.cast(value, 'boolean') ? value + '' : null;
        break;

      case 'date':
      case 'datetime':
        value = new Date(value);
        break;

      case 'int':
      case 'integer':
      case 'number':
        value = ~~value;
        break;

      case 'float':
        value = parseFloat(value);
        break;

      case 'smart':
        value = this.cast(value, this.detect(value));
        break;

      default:
        throw new Error('Expected valid casting type.');
    }

    return value;
  }
};

var hasOwn = Object.prototype.hasOwnProperty;
var toStr = Object.prototype.toString;
var defineProperty = Object.defineProperty;
var gOPD = Object.getOwnPropertyDescriptor;

var isArray = function isArray(arr) {
	if (typeof Array.isArray === 'function') {
		return Array.isArray(arr);
	}

	return toStr.call(arr) === '[object Array]';
};

var isPlainObject = function isPlainObject(obj) {
	if (!obj || toStr.call(obj) !== '[object Object]') {
		return false;
	}

	var hasOwnConstructor = hasOwn.call(obj, 'constructor');
	var hasIsPrototypeOf = obj.constructor && obj.constructor.prototype && hasOwn.call(obj.constructor.prototype, 'isPrototypeOf');
	// Not own constructor property must be Object
	if (obj.constructor && !hasOwnConstructor && !hasIsPrototypeOf) {
		return false;
	}

	// Own properties are enumerated firstly, so to speed up,
	// if last one is own, then all properties are own.
	var key;
	for (key in obj) { /**/ }

	return typeof key === 'undefined' || hasOwn.call(obj, key);
};

// If name is '__proto__', and Object.defineProperty is available, define __proto__ as an own property on target
var setProperty = function setProperty(target, options) {
	if (defineProperty && options.name === '__proto__') {
		defineProperty(target, options.name, {
			enumerable: true,
			configurable: true,
			value: options.newValue,
			writable: true
		});
	} else {
		target[options.name] = options.newValue;
	}
};

// Return undefined instead of __proto__ if '__proto__' is not an own property
var getProperty = function getProperty(obj, name) {
	if (name === '__proto__') {
		if (!hasOwn.call(obj, name)) {
			return void 0;
		} else if (gOPD) {
			// In early versions of node, obj['__proto__'] is buggy when obj has
			// __proto__ as an own property. Object.getOwnPropertyDescriptor() works.
			return gOPD(obj, name).value;
		}
	}

	return obj[name];
};

var extend = function extend() {
	var options, name, src, copy, copyIsArray, clone;
	var target = arguments[0];
	var i = 1;
	var length = arguments.length;
	var deep = false;

	// Handle a deep copy situation
	if (typeof target === 'boolean') {
		deep = target;
		target = arguments[1] || {};
		// skip the boolean and the target
		i = 2;
	}
	if (target == null || (typeof target !== 'object' && typeof target !== 'function')) {
		target = {};
	}

	for (; i < length; ++i) {
		options = arguments[i];
		// Only deal with non-null/undefined values
		if (options != null) {
			// Extend the base object
			for (name in options) {
				src = getProperty(target, name);
				copy = getProperty(options, name);

				// Prevent never-ending loop
				if (target !== copy) {
					// Recurse if we're merging plain objects or arrays
					if (deep && copy && (isPlainObject(copy) || (copyIsArray = isArray(copy)))) {
						if (copyIsArray) {
							copyIsArray = false;
							clone = src && isArray(src) ? src : [];
						} else {
							clone = src && isPlainObject(src) ? src : {};
						}

						// Never move original objects, clone them
						setProperty(target, { name: name, newValue: extend(deep, clone, copy) });

					// Don't bring in undefined values
					} else if (typeof copy !== 'undefined') {
						setProperty(target, { name: name, newValue: copy });
					}
				}
			}
		}
	}

	// Return the modified object
	return target;
};

function json(body, replacer) {
    return JSON.stringify((body !== undefined ? body : {}), replacer);
}

var retryStrategy = {
    fixed: 0,
    incremental: 1,
    exponential: 2,
    random: 3
};
var defaultRetryConfig = {
    maxRetries: 3,
    interval: 1000,
    strategy: retryStrategy.fixed
};
var RetryInterceptor = (function () {
    function RetryInterceptor(retryConfig) {
        this.retryConfig = Object.assign({}, defaultRetryConfig, retryConfig || {});
        if (this.retryConfig.strategy === retryStrategy.exponential &&
            this.retryConfig.interval <= 1000) {
            throw new Error('An interval less than or equal to 1 second is not allowed when using the exponential retry strategy');
        }
    }
    RetryInterceptor.prototype.request = function (request) {
        var $r = request;
        if (!$r.retryConfig) {
            $r.retryConfig = Object.assign({}, this.retryConfig);
            $r.retryConfig.counter = 0;
        }
        $r.retryConfig.requestClone = request.clone();
        return request;
    };
    RetryInterceptor.prototype.response = function (response, request) {
        delete request.retryConfig;
        return response;
    };
    RetryInterceptor.prototype.responseError = function (error, request, httpClient) {
        var retryConfig = request.retryConfig;
        var requestClone = retryConfig.requestClone;
        return Promise.resolve().then(function () {
            if (retryConfig.counter < retryConfig.maxRetries) {
                var result = retryConfig.doRetry ? retryConfig.doRetry(error, request) : true;
                return Promise.resolve(result).then(function (doRetry) {
                    if (doRetry) {
                        retryConfig.counter++;
                        return new Promise(function (resolve) { return PLATFORM.global.setTimeout(resolve, calculateDelay(retryConfig) || 0); })
                            .then(function () {
                            var newRequest = requestClone.clone();
                            if (typeof (retryConfig.beforeRetry) === 'function') {
                                return retryConfig.beforeRetry(newRequest, httpClient);
                            }
                            return newRequest;
                        })
                            .then(function (newRequest) {
                            return httpClient.fetch(Object.assign(newRequest, { retryConfig: retryConfig }));
                        });
                    }
                    delete request.retryConfig;
                    throw error;
                });
            }
            delete request.retryConfig;
            throw error;
        });
    };
    return RetryInterceptor;
}());
function calculateDelay(retryConfig) {
    var interval = retryConfig.interval, strategy = retryConfig.strategy, minRandomInterval = retryConfig.minRandomInterval, maxRandomInterval = retryConfig.maxRandomInterval, counter = retryConfig.counter;
    if (typeof (strategy) === 'function') {
        return retryConfig.strategy(counter);
    }
    switch (strategy) {
        case (retryStrategy.fixed):
            return retryStrategies[retryStrategy.fixed](interval);
        case (retryStrategy.incremental):
            return retryStrategies[retryStrategy.incremental](counter, interval);
        case (retryStrategy.exponential):
            return retryStrategies[retryStrategy.exponential](counter, interval);
        case (retryStrategy.random):
            return retryStrategies[retryStrategy.random](counter, interval, minRandomInterval, maxRandomInterval);
        default:
            throw new Error('Unrecognized retry strategy');
    }
}
var retryStrategies = [
    function (interval) { return interval; },
    function (retryCount, interval) { return interval * retryCount; },
    function (retryCount, interval) { return retryCount === 1 ? interval : Math.pow(interval, retryCount) / 1000; },
    function (retryCount, interval, minRandomInterval, maxRandomInterval) {
        if (minRandomInterval === void 0) { minRandomInterval = 0; }
        if (maxRandomInterval === void 0) { maxRandomInterval = 60000; }
        return Math.random() * (maxRandomInterval - minRandomInterval) + minRandomInterval;
    }
];

var HttpClientConfiguration = (function () {
    function HttpClientConfiguration() {
        this.baseUrl = '';
        this.defaults = {};
        this.interceptors = [];
    }
    HttpClientConfiguration.prototype.withBaseUrl = function (baseUrl) {
        this.baseUrl = baseUrl;
        return this;
    };
    HttpClientConfiguration.prototype.withDefaults = function (defaults) {
        this.defaults = defaults;
        return this;
    };
    HttpClientConfiguration.prototype.withInterceptor = function (interceptor) {
        this.interceptors.push(interceptor);
        return this;
    };
    HttpClientConfiguration.prototype.useStandardConfiguration = function () {
        var standardConfig = { credentials: 'same-origin' };
        Object.assign(this.defaults, standardConfig, this.defaults);
        return this.rejectErrorResponses();
    };
    HttpClientConfiguration.prototype.rejectErrorResponses = function () {
        return this.withInterceptor({ response: rejectOnError });
    };
    HttpClientConfiguration.prototype.withRetry = function (config) {
        var interceptor = new RetryInterceptor(config);
        return this.withInterceptor(interceptor);
    };
    return HttpClientConfiguration;
}());
function rejectOnError(response) {
    if (!response.ok) {
        throw response;
    }
    return response;
}

var HttpClient = (function () {
    function HttpClient() {
        this.activeRequestCount = 0;
        this.isRequesting = false;
        this.isConfigured = false;
        this.baseUrl = '';
        this.defaults = null;
        this.interceptors = [];
        if (typeof fetch === 'undefined') {
            throw new Error('HttpClient requires a Fetch API implementation, but the current environment doesn\'t support it. You may need to load a polyfill such as https://github.com/github/fetch');
        }
    }
    HttpClient.prototype.configure = function (config) {
        var normalizedConfig;
        if (typeof config === 'object') {
            normalizedConfig = { defaults: config };
        }
        else if (typeof config === 'function') {
            normalizedConfig = new HttpClientConfiguration();
            normalizedConfig.baseUrl = this.baseUrl;
            normalizedConfig.defaults = Object.assign({}, this.defaults);
            normalizedConfig.interceptors = this.interceptors;
            var c = config(normalizedConfig);
            if (HttpClientConfiguration.prototype.isPrototypeOf(c)) {
                normalizedConfig = c;
            }
        }
        else {
            throw new Error('invalid config');
        }
        var defaults = normalizedConfig.defaults;
        if (defaults && Headers.prototype.isPrototypeOf(defaults.headers)) {
            throw new Error('Default headers must be a plain object.');
        }
        var interceptors = normalizedConfig.interceptors;
        if (interceptors && interceptors.length) {
            if (interceptors.filter(function (x) { return RetryInterceptor.prototype.isPrototypeOf(x); }).length > 1) {
                throw new Error('Only one RetryInterceptor is allowed.');
            }
            var retryInterceptorIndex = interceptors.findIndex(function (x) { return RetryInterceptor.prototype.isPrototypeOf(x); });
            if (retryInterceptorIndex >= 0 && retryInterceptorIndex !== interceptors.length - 1) {
                throw new Error('The retry interceptor must be the last interceptor defined.');
            }
        }
        this.baseUrl = normalizedConfig.baseUrl;
        this.defaults = defaults;
        this.interceptors = normalizedConfig.interceptors || [];
        this.isConfigured = true;
        return this;
    };
    HttpClient.prototype.fetch = function (input, init) {
        var _this = this;
        trackRequestStart(this);
        var request = this.buildRequest(input, init);
        return processRequest(request, this.interceptors, this).then(function (result) {
            var response = null;
            if (Response.prototype.isPrototypeOf(result)) {
                response = Promise.resolve(result);
            }
            else if (Request.prototype.isPrototypeOf(result)) {
                request = result;
                response = fetch(result);
            }
            else {
                throw new Error("An invalid result was returned by the interceptor chain. Expected a Request or Response instance, but got [" + result + "]");
            }
            return processResponse(response, _this.interceptors, request, _this);
        })
            .then(function (result) {
            if (Request.prototype.isPrototypeOf(result)) {
                return _this.fetch(result);
            }
            return result;
        })
            .then(function (result) {
            trackRequestEnd(_this);
            return result;
        }, function (error) {
            trackRequestEnd(_this);
            throw error;
        });
    };
    HttpClient.prototype.buildRequest = function (input, init) {
        var defaults = this.defaults || {};
        var request;
        var body;
        var requestContentType;
        var parsedDefaultHeaders = parseHeaderValues(defaults.headers);
        if (Request.prototype.isPrototypeOf(input)) {
            request = input;
            requestContentType = new Headers(request.headers).get('Content-Type');
        }
        else {
            if (!init) {
                init = {};
            }
            body = init.body;
            var bodyObj = body ? { body: body } : null;
            var requestInit = Object.assign({}, defaults, { headers: {} }, init, bodyObj);
            requestContentType = new Headers(requestInit.headers).get('Content-Type');
            request = new Request(getRequestUrl(this.baseUrl, input), requestInit);
        }
        if (!requestContentType) {
            if (new Headers(parsedDefaultHeaders).has('content-type')) {
                request.headers.set('Content-Type', new Headers(parsedDefaultHeaders).get('content-type'));
            }
            else if (body && isJSON(body)) {
                request.headers.set('Content-Type', 'application/json');
            }
        }
        setDefaultHeaders(request.headers, parsedDefaultHeaders);
        if (body && Blob.prototype.isPrototypeOf(body) && body.type) {
            request.headers.set('Content-Type', body.type);
        }
        return request;
    };
    HttpClient.prototype.get = function (input, init) {
        return this.fetch(input, init);
    };
    HttpClient.prototype.post = function (input, body, init) {
        return callFetch(this, input, body, init, 'POST');
    };
    HttpClient.prototype.put = function (input, body, init) {
        return callFetch(this, input, body, init, 'PUT');
    };
    HttpClient.prototype.patch = function (input, body, init) {
        return callFetch(this, input, body, init, 'PATCH');
    };
    HttpClient.prototype.delete = function (input, body, init) {
        return callFetch(this, input, body, init, 'DELETE');
    };
    return HttpClient;
}());
var absoluteUrlRegexp = /^([a-z][a-z0-9+\-.]*:)?\/\//i;
function trackRequestStart(client) {
    client.isRequesting = !!(++client.activeRequestCount);
    if (client.isRequesting) {
        var evt_1 = DOM.createCustomEvent('aurelia-fetch-client-request-started', { bubbles: true, cancelable: true });
        setTimeout(function () { return DOM.dispatchEvent(evt_1); }, 1);
    }
}
function trackRequestEnd(client) {
    client.isRequesting = !!(--client.activeRequestCount);
    if (!client.isRequesting) {
        var evt_2 = DOM.createCustomEvent('aurelia-fetch-client-requests-drained', { bubbles: true, cancelable: true });
        setTimeout(function () { return DOM.dispatchEvent(evt_2); }, 1);
    }
}
function parseHeaderValues(headers) {
    var parsedHeaders = {};
    for (var name_1 in headers || {}) {
        if (headers.hasOwnProperty(name_1)) {
            parsedHeaders[name_1] = (typeof headers[name_1] === 'function') ? headers[name_1]() : headers[name_1];
        }
    }
    return parsedHeaders;
}
function getRequestUrl(baseUrl, url) {
    if (absoluteUrlRegexp.test(url)) {
        return url;
    }
    return (baseUrl || '') + url;
}
function setDefaultHeaders(headers, defaultHeaders) {
    for (var name_2 in defaultHeaders || {}) {
        if (defaultHeaders.hasOwnProperty(name_2) && !headers.has(name_2)) {
            headers.set(name_2, defaultHeaders[name_2]);
        }
    }
}
function processRequest(request, interceptors, http) {
    return applyInterceptors(request, interceptors, 'request', 'requestError', http);
}
function processResponse(response, interceptors, request, http) {
    return applyInterceptors(response, interceptors, 'response', 'responseError', request, http);
}
function applyInterceptors(input, interceptors, successName, errorName) {
    var interceptorArgs = [];
    for (var _i = 4; _i < arguments.length; _i++) {
        interceptorArgs[_i - 4] = arguments[_i];
    }
    return (interceptors || [])
        .reduce(function (chain, interceptor) {
        var successHandler = interceptor[successName];
        var errorHandler = interceptor[errorName];
        return chain.then(successHandler && (function (value) { return successHandler.call.apply(successHandler, [interceptor, value].concat(interceptorArgs)); }) || identity, errorHandler && (function (reason) { return errorHandler.call.apply(errorHandler, [interceptor, reason].concat(interceptorArgs)); }) || thrower);
    }, Promise.resolve(input));
}
function isJSON(str) {
    try {
        JSON.parse(str);
    }
    catch (err) {
        return false;
    }
    return true;
}
function identity(x) {
    return x;
}
function thrower(x) {
    throw x;
}
function callFetch(client, input, body, init, method) {
    if (!init) {
        init = {};
    }
    init.method = method;
    if (body) {
        init.body = body;
    }
    return client.fetch(input, init);
}

var aureliaFetchClient = /*#__PURE__*/Object.freeze({
    json: json,
    retryStrategy: retryStrategy,
    RetryInterceptor: RetryInterceptor,
    HttpClientConfiguration: HttpClientConfiguration,
    HttpClient: HttpClient
});

var aureliaApi = createCommonjsModule(function (module, exports) {

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Endpoint = exports.Config = exports.Rest = undefined;

var _dec, _class3;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.configure = configure;



var _extend2 = _interopRequireDefault(extend);







function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }



var Rest = exports.Rest = function () {
  function Rest(httpClient, endpoint, useTraditionalUriTemplates) {
    

    this.defaults = {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    };

    this.client = httpClient;
    this.endpoint = endpoint;
    this.useTraditionalUriTemplates = !!useTraditionalUriTemplates;
  }

  Rest.prototype.request = function request(method, path, body, options, responseOutput) {
    var requestOptions = (0, _extend2.default)(true, { headers: {} }, this.defaults || {}, options || {}, { method: method, body: body });
    var contentType = requestOptions.headers['Content-Type'] || requestOptions.headers['content-type'];

    if ((typeof body === 'undefined' ? 'undefined' : _typeof(body)) === 'object' && body !== null && contentType) {
      requestOptions.body = /^application\/(.+\+)?json/.test(contentType.toLowerCase()) ? JSON.stringify(body) : (0, aureliaPath.buildQueryString)(body);
    }

    return this.client.fetch(path, requestOptions).then(function (response) {
      if (response.status >= 200 && response.status < 400) {
        if (responseOutput) {
          responseOutput.response = response;
        }

        return response.json().catch(function () {
          return null;
        });
      }

      throw response;
    });
  };

  Rest.prototype.find = function find(resource, idOrCriteria, options, responseOutput) {
    return this.request('GET', getRequestPath(resource, this.useTraditionalUriTemplates, idOrCriteria), undefined, options, responseOutput);
  };

  Rest.prototype.findOne = function findOne(resource, id, criteria, options, responseOutput) {
    return this.request('GET', getRequestPath(resource, this.useTraditionalUriTemplates, id, criteria), undefined, options, responseOutput);
  };

  Rest.prototype.post = function post(resource, body, options, responseOutput) {
    return this.request('POST', resource, body, options, responseOutput);
  };

  Rest.prototype.update = function update(resource, idOrCriteria, body, options, responseOutput) {
    return this.request('PUT', getRequestPath(resource, this.useTraditionalUriTemplates, idOrCriteria), body, options, responseOutput);
  };

  Rest.prototype.updateOne = function updateOne(resource, id, criteria, body, options, responseOutput) {
    return this.request('PUT', getRequestPath(resource, this.useTraditionalUriTemplates, id, criteria), body, options, responseOutput);
  };

  Rest.prototype.patch = function patch(resource, idOrCriteria, body, options, responseOutput) {
    return this.request('PATCH', getRequestPath(resource, this.useTraditionalUriTemplates, idOrCriteria), body, options, responseOutput);
  };

  Rest.prototype.patchOne = function patchOne(resource, id, criteria, body, options, responseOutput) {
    return this.request('PATCH', getRequestPath(resource, this.useTraditionalUriTemplates, id, criteria), body, options, responseOutput);
  };

  Rest.prototype.destroy = function destroy(resource, idOrCriteria, options, responseOutput) {
    return this.request('DELETE', getRequestPath(resource, this.useTraditionalUriTemplates, idOrCriteria), undefined, options, responseOutput);
  };

  Rest.prototype.destroyOne = function destroyOne(resource, id, criteria, options, responseOutput) {
    return this.request('DELETE', getRequestPath(resource, this.useTraditionalUriTemplates, id, criteria), undefined, options, responseOutput);
  };

  Rest.prototype.create = function create(resource, body, options, responseOutput) {
    return this.post(resource, body, options, responseOutput);
  };

  return Rest;
}();

function getRequestPath(resource, traditional, idOrCriteria, criteria) {
  var hasSlash = resource.slice(-1) === '/';

  if (typeof idOrCriteria === 'string' || typeof idOrCriteria === 'number') {
    resource = '' + (0, aureliaPath.join)(resource, String(idOrCriteria)) + (hasSlash ? '/' : '');
  } else {
    criteria = idOrCriteria;
  }

  if ((typeof criteria === 'undefined' ? 'undefined' : _typeof(criteria)) === 'object' && criteria !== null) {
    resource += '?' + (0, aureliaPath.buildQueryString)(criteria, traditional);
  } else if (criteria) {
    resource += '' + (hasSlash ? '' : '/') + criteria + (hasSlash ? '/' : '');
  }

  return resource;
}

var Config = exports.Config = function () {
  function Config() {
    

    this.endpoints = {};
  }

  Config.prototype.registerEndpoint = function registerEndpoint(name, configureMethod, defaults, restOptions) {
    var _this = this;

    var newClient = new aureliaFetchClient.HttpClient();
    var useTraditionalUriTemplates = void 0;

    if (restOptions !== undefined) {
      useTraditionalUriTemplates = restOptions.useTraditionalUriTemplates;
    }
    this.endpoints[name] = new Rest(newClient, name, useTraditionalUriTemplates);

    if (defaults !== undefined) {
      this.endpoints[name].defaults = defaults;
    }

    if (typeof configureMethod === 'function') {
      newClient.configure(function (newClientConfig) {
        return configureMethod(newClientConfig.withDefaults(_this.endpoints[name].defaults));
      });

      this.endpoints[name].defaults = newClient.defaults;

      return this;
    }

    if (typeof configureMethod !== 'string' && !this.defaultBaseUrl) {
      return this;
    }

    if (this.defaultBaseUrl && typeof configureMethod !== 'string' && typeof configureMethod !== 'function') {
      newClient.configure(function (configure) {
        configure.withBaseUrl(_this.defaultBaseUrl);
      });

      return this;
    }

    newClient.configure(function (configure) {
      configure.withBaseUrl(configureMethod);
    });

    return this;
  };

  Config.prototype.getEndpoint = function getEndpoint(name) {
    if (!name) {
      return this.defaultEndpoint || null;
    }

    return this.endpoints[name] || null;
  };

  Config.prototype.endpointExists = function endpointExists(name) {
    return !!this.endpoints[name];
  };

  Config.prototype.setDefaultEndpoint = function setDefaultEndpoint(name) {
    this.defaultEndpoint = this.getEndpoint(name);

    return this;
  };

  Config.prototype.setDefaultBaseUrl = function setDefaultBaseUrl(baseUrl) {
    this.defaultBaseUrl = baseUrl;

    return this;
  };

  Config.prototype.configure = function configure(config) {
    var _this2 = this;

    if (config.defaultBaseUrl) {
      this.defaultBaseUrl = config.defaultBaseUrl;
    }

    config.endpoints.forEach(function (endpoint) {
      _this2.registerEndpoint(endpoint.name, endpoint.endpoint, endpoint.config);

      if (endpoint.default) {
        _this2.setDefaultEndpoint(endpoint.name);
      }
    });

    if (config.defaultEndpoint) {
      this.setDefaultEndpoint(config.defaultEndpoint);
    }

    return this;
  };

  return Config;
}();

function configure(frameworkConfig, configOrConfigure) {
  var config = frameworkConfig.container.get(Config);

  if (typeof configOrConfigure === 'function') {
    configOrConfigure(config);

    return;
  }

  config.configure(configOrConfigure);
}

var Endpoint = exports.Endpoint = (_dec = (0, aureliaDependencyInjection.resolver)(), _dec(_class3 = function () {
  function Endpoint(key) {
    

    this._key = key;
  }

  Endpoint.prototype.get = function get(container) {
    return container.get(Config).getEndpoint(this._key);
  };

  Endpoint.of = function of(key) {
    return new Endpoint(key);
  };

  return Endpoint;
}()) || _class3);
});

unwrapExports(aureliaApi);
var aureliaApi_1 = aureliaApi.Endpoint;
var aureliaApi_2 = aureliaApi.Config;
var aureliaApi_3 = aureliaApi.Rest;
var aureliaApi_4 = aureliaApi.configure;

/**
 * Gets the DOM element associated with the data-binding. Most of the time it's
 * the binding.target but sometimes binding.target is an aurelia custom element,
 * or custom attribute which is a javascript "class" instance, so we need to use
 * the controller's container to retrieve the actual DOM element.
 */
function getTargetDOMElement(binding, view$$1) {
    const target = binding.target;
    // DOM element
    if (target instanceof Element) {
        return target;
    }
    // custom element or custom attribute
    // tslint:disable-next-line:prefer-const
    for (let i = 0, ii = view$$1.controllers.length; i < ii; i++) {
        const controller = view$$1.controllers[i];
        if (controller.viewModel === target) {
            const element = controller.container.get(DOM.Element);
            if (element) {
                return element;
            }
            throw new Error(`Unable to locate target element for "${binding.sourceExpression}".`);
        }
    }
    throw new Error(`Unable to locate target element for "${binding.sourceExpression}".`);
}

function getObject(expression, objectExpression, source) {
    const value = objectExpression.evaluate(source, null);
    if (value === null || value === undefined || value instanceof Object) {
        return value;
    }
    // tslint:disable-next-line:max-line-length
    throw new Error(`The '${objectExpression}' part of '${expression}' evaluates to ${value} instead of an object, null or undefined.`);
}
/**
 * Retrieves the object and property name for the specified expression.
 * @param expression The expression
 * @param source The scope
 */
function getPropertyInfo(expression, source) {
    const originalExpression = expression;
    while (expression instanceof BindingBehavior || expression instanceof ValueConverter) {
        expression = expression.expression;
    }
    let object;
    let propertyName;
    if (expression instanceof AccessScope) {
        object = getContextFor(expression.name, source, expression.ancestor);
        propertyName = expression.name;
    }
    else if (expression instanceof AccessMember) {
        object = getObject(originalExpression, expression.object, source);
        propertyName = expression.name;
    }
    else if (expression instanceof AccessKeyed) {
        object = getObject(originalExpression, expression.object, source);
        propertyName = expression.key.evaluate(source);
    }
    else {
        throw new Error(`Expression '${originalExpression}' is not compatible with the validate binding-behavior.`);
    }
    if (object === null || object === undefined) {
        return null;
    }
    return { object, propertyName };
}

function isString(value) {
    return Object.prototype.toString.call(value) === '[object String]';
}
function isNumber(value) {
    return Object.prototype.toString.call(value) === '[object Number]';
}

class PropertyAccessorParser {
    constructor(parser) {
        this.parser = parser;
    }
    parse(property) {
        if (isString(property) || isNumber(property)) {
            return property;
        }
        const accessorText = getAccessorExpression(property.toString());
        const accessor = this.parser.parse(accessorText);
        if (accessor instanceof AccessScope
            || accessor instanceof AccessMember && accessor.object instanceof AccessScope) {
            return accessor.name;
        }
        throw new Error(`Invalid property expression: "${accessor}"`);
    }
}
PropertyAccessorParser.inject = [Parser];
function getAccessorExpression(fn) {
    /* tslint:disable:max-line-length */
    const classic = /^function\s*\([$_\w\d]+\)\s*\{(?:\s*"use strict";)?\s*(?:[$_\w\d.['"\]+;]+)?\s*return\s+[$_\w\d]+\.([$_\w\d]+)\s*;?\s*\}$/;
    /* tslint:enable:max-line-length */
    const arrow = /^\(?[$_\w\d]+\)?\s*=>\s*[$_\w\d]+\.([$_\w\d]+)$/;
    const match = classic.exec(fn) || arrow.exec(fn);
    if (match === null) {
        throw new Error(`Unable to parse accessor function:\n${fn}`);
    }
    return match[1];
}

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */

function __decorate$2(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}

/**
 * Validation triggers.
 */
var validateTrigger;
(function (validateTrigger) {
    /**
     * Manual validation.  Use the controller's `validate()` and  `reset()` methods
     * to validate all bindings.
     */
    validateTrigger[validateTrigger["manual"] = 0] = "manual";
    /**
     * Validate the binding when the binding's target element fires a DOM "blur" event.
     */
    validateTrigger[validateTrigger["blur"] = 1] = "blur";
    /**
     * Validate the binding when it updates the model due to a change in the view.
     */
    validateTrigger[validateTrigger["change"] = 2] = "change";
    /**
     * Validate the binding when the binding's target element fires a DOM "blur" event and
     * when it updates the model due to a change in the view.
     */
    validateTrigger[validateTrigger["changeOrBlur"] = 3] = "changeOrBlur";
})(validateTrigger || (validateTrigger = {}));

/**
 * Validates objects and properties.
 */
class Validator {
}

/**
 * The result of validating an individual validation rule.
 */
class ValidateResult {
    /**
     * @param rule The rule associated with the result. Validator implementation specific.
     * @param object The object that was validated.
     * @param propertyName The name of the property that was validated.
     * @param error The error, if the result is a validation error.
     */
    constructor(rule, object, propertyName, valid, message = null) {
        this.rule = rule;
        this.object = object;
        this.propertyName = propertyName;
        this.valid = valid;
        this.message = message;
        this.id = ValidateResult.nextId++;
    }
    toString() {
        return this.valid ? 'Valid.' : this.message;
    }
}
ValidateResult.nextId = 0;

class ValidateEvent {
    constructor(
    /**
     * The type of validate event. Either "validate" or "reset".
     */
    type, 
    /**
     * The controller's current array of errors. For an array containing both
     * failed rules and passed rules, use the "results" property.
     */
    errors, 
    /**
     * The controller's current array of validate results. This
     * includes both passed rules and failed rules. For an array of only failed rules,
     * use the "errors" property.
     */
    results, 
    /**
     * The instruction passed to the "validate" or "reset" event. Will be null when
     * the controller's validate/reset method was called with no instruction argument.
     */
    instruction, 
    /**
     * In events with type === "validate", this property will contain the result
     * of validating the instruction (see "instruction" property). Use the controllerValidateResult
     * to access the validate results specific to the call to "validate"
     * (as opposed to using the "results" and "errors" properties to access the controller's entire
     * set of results/errors).
     */
    controllerValidateResult) {
        this.type = type;
        this.errors = errors;
        this.results = results;
        this.instruction = instruction;
        this.controllerValidateResult = controllerValidateResult;
    }
}

/**
 * Orchestrates validation.
 * Manages a set of bindings, renderers and objects.
 * Exposes the current list of validation results for binding purposes.
 */
class ValidationController {
    constructor(validator, propertyParser) {
        this.validator = validator;
        this.propertyParser = propertyParser;
        // Registered bindings (via the validate binding behavior)
        this.bindings = new Map();
        // Renderers that have been added to the controller instance.
        this.renderers = [];
        /**
         * Validation results that have been rendered by the controller.
         */
        this.results = [];
        /**
         * Validation errors that have been rendered by the controller.
         */
        this.errors = [];
        /**
         *  Whether the controller is currently validating.
         */
        this.validating = false;
        // Elements related to validation results that have been rendered.
        this.elements = new Map();
        // Objects that have been added to the controller instance (entity-style validation).
        this.objects = new Map();
        /**
         * The trigger that will invoke automatic validation of a property used in a binding.
         */
        this.validateTrigger = validateTrigger.blur;
        // Promise that resolves when validation has completed.
        this.finishValidating = Promise.resolve();
        this.eventCallbacks = [];
    }
    /**
     * Subscribe to controller validate and reset events. These events occur when the
     * controller's "validate"" and "reset" methods are called.
     * @param callback The callback to be invoked when the controller validates or resets.
     */
    subscribe(callback) {
        this.eventCallbacks.push(callback);
        return {
            dispose: () => {
                const index = this.eventCallbacks.indexOf(callback);
                if (index === -1) {
                    return;
                }
                this.eventCallbacks.splice(index, 1);
            }
        };
    }
    /**
     * Adds an object to the set of objects that should be validated when validate is called.
     * @param object The object.
     * @param rules Optional. The rules. If rules aren't supplied the Validator implementation will lookup the rules.
     */
    addObject(object, rules) {
        this.objects.set(object, rules);
    }
    /**
     * Removes an object from the set of objects that should be validated when validate is called.
     * @param object The object.
     */
    removeObject(object) {
        this.objects.delete(object);
        this.processResultDelta('reset', this.results.filter(result => result.object === object), []);
    }
    /**
     * Adds and renders an error.
     */
    addError(message, object, propertyName = null) {
        let resolvedPropertyName;
        if (propertyName === null) {
            resolvedPropertyName = propertyName;
        }
        else {
            resolvedPropertyName = this.propertyParser.parse(propertyName);
        }
        const result = new ValidateResult({ __manuallyAdded__: true }, object, resolvedPropertyName, false, message);
        this.processResultDelta('validate', [], [result]);
        return result;
    }
    /**
     * Removes and unrenders an error.
     */
    removeError(result) {
        if (this.results.indexOf(result) !== -1) {
            this.processResultDelta('reset', [result], []);
        }
    }
    /**
     * Adds a renderer.
     * @param renderer The renderer.
     */
    addRenderer(renderer) {
        this.renderers.push(renderer);
        renderer.render({
            kind: 'validate',
            render: this.results.map(result => ({ result, elements: this.elements.get(result) })),
            unrender: []
        });
    }
    /**
     * Removes a renderer.
     * @param renderer The renderer.
     */
    removeRenderer(renderer) {
        this.renderers.splice(this.renderers.indexOf(renderer), 1);
        renderer.render({
            kind: 'reset',
            render: [],
            unrender: this.results.map(result => ({ result, elements: this.elements.get(result) }))
        });
    }
    /**
     * Registers a binding with the controller.
     * @param binding The binding instance.
     * @param target The DOM element.
     * @param rules (optional) rules associated with the binding. Validator implementation specific.
     */
    registerBinding(binding, target, rules) {
        this.bindings.set(binding, { target, rules, propertyInfo: null });
    }
    /**
     * Unregisters a binding with the controller.
     * @param binding The binding instance.
     */
    unregisterBinding(binding) {
        this.resetBinding(binding);
        this.bindings.delete(binding);
    }
    /**
     * Interprets the instruction and returns a predicate that will identify
     * relevant results in the list of rendered validation results.
     */
    getInstructionPredicate(instruction) {
        if (instruction) {
            const { object, propertyName, rules } = instruction;
            let predicate;
            if (instruction.propertyName) {
                predicate = x => x.object === object && x.propertyName === propertyName;
            }
            else {
                predicate = x => x.object === object;
            }
            if (rules) {
                return x => predicate(x) && this.validator.ruleExists(rules, x.rule);
            }
            return predicate;
        }
        else {
            return () => true;
        }
    }
    /**
     * Validates and renders results.
     * @param instruction Optional. Instructions on what to validate. If undefined, all
     * objects and bindings will be validated.
     */
    validate(instruction) {
        // Get a function that will process the validation instruction.
        let execute;
        if (instruction) {
            // tslint:disable-next-line:prefer-const
            let { object, propertyName, rules } = instruction;
            // if rules were not specified, check the object map.
            rules = rules || this.objects.get(object);
            // property specified?
            if (instruction.propertyName === undefined) {
                // validate the specified object.
                execute = () => this.validator.validateObject(object, rules);
            }
            else {
                // validate the specified property.
                execute = () => this.validator.validateProperty(object, propertyName, rules);
            }
        }
        else {
            // validate all objects and bindings.
            execute = () => {
                const promises = [];
                for (const [object, rules] of Array.from(this.objects)) {
                    promises.push(this.validator.validateObject(object, rules));
                }
                for (const [binding, { rules }] of Array.from(this.bindings)) {
                    const propertyInfo = getPropertyInfo(binding.sourceExpression, binding.source);
                    if (!propertyInfo || this.objects.has(propertyInfo.object)) {
                        continue;
                    }
                    promises.push(this.validator.validateProperty(propertyInfo.object, propertyInfo.propertyName, rules));
                }
                return Promise.all(promises).then(resultSets => resultSets.reduce((a, b) => a.concat(b), []));
            };
        }
        // Wait for any existing validation to finish, execute the instruction, render the results.
        this.validating = true;
        const returnPromise = this.finishValidating
            .then(execute)
            .then((newResults) => {
            const predicate = this.getInstructionPredicate(instruction);
            const oldResults = this.results.filter(predicate);
            this.processResultDelta('validate', oldResults, newResults);
            if (returnPromise === this.finishValidating) {
                this.validating = false;
            }
            const result = {
                instruction,
                valid: newResults.find(x => !x.valid) === undefined,
                results: newResults
            };
            this.invokeCallbacks(instruction, result);
            return result;
        })
            .catch(exception => {
            // recover, to enable subsequent calls to validate()
            this.validating = false;
            this.finishValidating = Promise.resolve();
            return Promise.reject(exception);
        });
        this.finishValidating = returnPromise;
        return returnPromise;
    }
    /**
     * Resets any rendered validation results (unrenders).
     * @param instruction Optional. Instructions on what to reset. If unspecified all rendered results
     * will be unrendered.
     */
    reset(instruction) {
        const predicate = this.getInstructionPredicate(instruction);
        const oldResults = this.results.filter(predicate);
        this.processResultDelta('reset', oldResults, []);
        this.invokeCallbacks(instruction, null);
    }
    /**
     * Gets the elements associated with an object and propertyName (if any).
     */
    getAssociatedElements({ object, propertyName }) {
        const elements$$1 = [];
        for (const [binding, { target }] of Array.from(this.bindings)) {
            const propertyInfo = getPropertyInfo(binding.sourceExpression, binding.source);
            if (propertyInfo && propertyInfo.object === object && propertyInfo.propertyName === propertyName) {
                elements$$1.push(target);
            }
        }
        return elements$$1;
    }
    processResultDelta(kind, oldResults, newResults) {
        // prepare the instruction.
        const instruction = {
            kind,
            render: [],
            unrender: []
        };
        // create a shallow copy of newResults so we can mutate it without causing side-effects.
        newResults = newResults.slice(0);
        // create unrender instructions from the old results.
        for (const oldResult of oldResults) {
            // get the elements associated with the old result.
            const elements$$1 = this.elements.get(oldResult);
            // remove the old result from the element map.
            this.elements.delete(oldResult);
            // create the unrender instruction.
            instruction.unrender.push({ result: oldResult, elements: elements$$1 });
            // determine if there's a corresponding new result for the old result we are unrendering.
            const newResultIndex = newResults.findIndex(x => x.rule === oldResult.rule && x.object === oldResult.object && x.propertyName === oldResult.propertyName);
            if (newResultIndex === -1) {
                // no corresponding new result... simple remove.
                this.results.splice(this.results.indexOf(oldResult), 1);
                if (!oldResult.valid) {
                    this.errors.splice(this.errors.indexOf(oldResult), 1);
                }
            }
            else {
                // there is a corresponding new result...
                const newResult = newResults.splice(newResultIndex, 1)[0];
                // get the elements that are associated with the new result.
                const elements$$1 = this.getAssociatedElements(newResult);
                this.elements.set(newResult, elements$$1);
                // create a render instruction for the new result.
                instruction.render.push({ result: newResult, elements: elements$$1 });
                // do an in-place replacement of the old result with the new result.
                // this ensures any repeats bound to this.results will not thrash.
                this.results.splice(this.results.indexOf(oldResult), 1, newResult);
                if (!oldResult.valid && newResult.valid) {
                    this.errors.splice(this.errors.indexOf(oldResult), 1);
                }
                else if (!oldResult.valid && !newResult.valid) {
                    this.errors.splice(this.errors.indexOf(oldResult), 1, newResult);
                }
                else if (!newResult.valid) {
                    this.errors.push(newResult);
                }
            }
        }
        // create render instructions from the remaining new results.
        for (const result of newResults) {
            const elements$$1 = this.getAssociatedElements(result);
            instruction.render.push({ result, elements: elements$$1 });
            this.elements.set(result, elements$$1);
            this.results.push(result);
            if (!result.valid) {
                this.errors.push(result);
            }
        }
        // render.
        for (const renderer of this.renderers) {
            renderer.render(instruction);
        }
    }
    /**
     * Validates the property associated with a binding.
     */
    validateBinding(binding) {
        if (!binding.isBound) {
            return;
        }
        const propertyInfo = getPropertyInfo(binding.sourceExpression, binding.source);
        let rules;
        const registeredBinding = this.bindings.get(binding);
        if (registeredBinding) {
            rules = registeredBinding.rules;
            registeredBinding.propertyInfo = propertyInfo;
        }
        if (!propertyInfo) {
            return;
        }
        const { object, propertyName } = propertyInfo;
        this.validate({ object, propertyName, rules });
    }
    /**
     * Resets the results for a property associated with a binding.
     */
    resetBinding(binding) {
        const registeredBinding = this.bindings.get(binding);
        let propertyInfo = getPropertyInfo(binding.sourceExpression, binding.source);
        if (!propertyInfo && registeredBinding) {
            propertyInfo = registeredBinding.propertyInfo;
        }
        if (registeredBinding) {
            registeredBinding.propertyInfo = null;
        }
        if (!propertyInfo) {
            return;
        }
        const { object, propertyName } = propertyInfo;
        this.reset({ object, propertyName });
    }
    /**
     * Changes the controller's validateTrigger.
     * @param newTrigger The new validateTrigger
     */
    changeTrigger(newTrigger) {
        this.validateTrigger = newTrigger;
        const bindings = Array.from(this.bindings.keys());
        for (const binding of bindings) {
            const source = binding.source;
            binding.unbind();
            binding.bind(source);
        }
    }
    /**
     * Revalidates the controller's current set of errors.
     */
    revalidateErrors() {
        for (const { object, propertyName, rule } of this.errors) {
            if (rule.__manuallyAdded__) {
                continue;
            }
            const rules = [[rule]];
            this.validate({ object, propertyName, rules });
        }
    }
    invokeCallbacks(instruction, result) {
        if (this.eventCallbacks.length === 0) {
            return;
        }
        const event = new ValidateEvent(result ? 'validate' : 'reset', this.errors, this.results, instruction || null, result);
        for (let i = 0; i < this.eventCallbacks.length; i++) {
            this.eventCallbacks[i](event);
        }
    }
}
ValidationController.inject = [Validator, PropertyAccessorParser];

/**
 * Binding behavior. Indicates the bound property should be validated.
 */
class ValidateBindingBehaviorBase {
    constructor(taskQueue) {
        this.taskQueue = taskQueue;
    }
    bind(binding, source, rulesOrController, rules) {
        // identify the target element.
        const target = getTargetDOMElement(binding, source);
        // locate the controller.
        let controller;
        if (rulesOrController instanceof ValidationController) {
            controller = rulesOrController;
        }
        else {
            controller = source.container.get(Optional.of(ValidationController));
            rules = rulesOrController;
        }
        if (controller === null) {
            throw new Error(`A ValidationController has not been registered.`);
        }
        controller.registerBinding(binding, target, rules);
        binding.validationController = controller;
        const trigger = this.getValidateTrigger(controller);
        // tslint:disable-next-line:no-bitwise
        if (trigger & validateTrigger.change) {
            binding.vbbUpdateSource = binding.updateSource;
            // tslint:disable-next-line:only-arrow-functions
            // tslint:disable-next-line:space-before-function-paren
            binding.updateSource = function (value) {
                this.vbbUpdateSource(value);
                this.validationController.validateBinding(this);
            };
        }
        // tslint:disable-next-line:no-bitwise
        if (trigger & validateTrigger.blur) {
            binding.validateBlurHandler = () => {
                this.taskQueue.queueMicroTask(() => controller.validateBinding(binding));
            };
            binding.validateTarget = target;
            target.addEventListener('blur', binding.validateBlurHandler);
        }
        if (trigger !== validateTrigger.manual) {
            binding.standardUpdateTarget = binding.updateTarget;
            // tslint:disable-next-line:only-arrow-functions
            // tslint:disable-next-line:space-before-function-paren
            binding.updateTarget = function (value) {
                this.standardUpdateTarget(value);
                this.validationController.resetBinding(this);
            };
        }
    }
    unbind(binding) {
        // reset the binding to it's original state.
        if (binding.vbbUpdateSource) {
            binding.updateSource = binding.vbbUpdateSource;
            binding.vbbUpdateSource = null;
        }
        if (binding.standardUpdateTarget) {
            binding.updateTarget = binding.standardUpdateTarget;
            binding.standardUpdateTarget = null;
        }
        if (binding.validateBlurHandler) {
            binding.validateTarget.removeEventListener('blur', binding.validateBlurHandler);
            binding.validateBlurHandler = null;
            binding.validateTarget = null;
        }
        binding.validationController.unregisterBinding(binding);
        binding.validationController = null;
    }
}

/**
 * Binding behavior. Indicates the bound property should be validated
 * when the validate trigger specified by the associated controller's
 * validateTrigger property occurs.
 */
let ValidateBindingBehavior = class ValidateBindingBehavior extends ValidateBindingBehaviorBase {
    getValidateTrigger(controller) {
        return controller.validateTrigger;
    }
};
ValidateBindingBehavior.inject = [TaskQueue];
ValidateBindingBehavior = __decorate$2([
    bindingBehavior('validate')
], ValidateBindingBehavior);
/**
 * Binding behavior. Indicates the bound property will be validated
 * manually, by calling controller.validate(). No automatic validation
 * triggered by data-entry or blur will occur.
 */
let ValidateManuallyBindingBehavior = class ValidateManuallyBindingBehavior extends ValidateBindingBehaviorBase {
    getValidateTrigger() {
        return validateTrigger.manual;
    }
};
ValidateManuallyBindingBehavior.inject = [TaskQueue];
ValidateManuallyBindingBehavior = __decorate$2([
    bindingBehavior('validateManually')
], ValidateManuallyBindingBehavior);
/**
 * Binding behavior. Indicates the bound property should be validated
 * when the associated element blurs.
 */
let ValidateOnBlurBindingBehavior = class ValidateOnBlurBindingBehavior extends ValidateBindingBehaviorBase {
    getValidateTrigger() {
        return validateTrigger.blur;
    }
};
ValidateOnBlurBindingBehavior.inject = [TaskQueue];
ValidateOnBlurBindingBehavior = __decorate$2([
    bindingBehavior('validateOnBlur')
], ValidateOnBlurBindingBehavior);
/**
 * Binding behavior. Indicates the bound property should be validated
 * when the associated element is changed by the user, causing a change
 * to the model.
 */
let ValidateOnChangeBindingBehavior = class ValidateOnChangeBindingBehavior extends ValidateBindingBehaviorBase {
    getValidateTrigger() {
        return validateTrigger.change;
    }
};
ValidateOnChangeBindingBehavior.inject = [TaskQueue];
ValidateOnChangeBindingBehavior = __decorate$2([
    bindingBehavior('validateOnChange')
], ValidateOnChangeBindingBehavior);
/**
 * Binding behavior. Indicates the bound property should be validated
 * when the associated element blurs or is changed by the user, causing
 * a change to the model.
 */
let ValidateOnChangeOrBlurBindingBehavior = class ValidateOnChangeOrBlurBindingBehavior extends ValidateBindingBehaviorBase {
    getValidateTrigger() {
        return validateTrigger.changeOrBlur;
    }
};
ValidateOnChangeOrBlurBindingBehavior.inject = [TaskQueue];
ValidateOnChangeOrBlurBindingBehavior = __decorate$2([
    bindingBehavior('validateOnChangeOrBlur')
], ValidateOnChangeOrBlurBindingBehavior);

/**
 * Creates ValidationController instances.
 */
class ValidationControllerFactory {
    constructor(container) {
        this.container = container;
    }
    static get(container) {
        return new ValidationControllerFactory(container);
    }
    /**
     * Creates a new controller instance.
     */
    create(validator) {
        if (!validator) {
            validator = this.container.get(Validator);
        }
        const propertyParser = this.container.get(PropertyAccessorParser);
        return new ValidationController(validator, propertyParser);
    }
    /**
     * Creates a new controller and registers it in the current element's container so that it's
     * available to the validate binding behavior and renderers.
     */
    createForCurrentScope(validator) {
        const controller = this.create(validator);
        this.container.registerInstance(ValidationController, controller);
        return controller;
    }
}
ValidationControllerFactory['protocol:aurelia:resolver'] = true;

let ValidationErrorsCustomAttribute = class ValidationErrorsCustomAttribute {
    constructor(boundaryElement, controllerAccessor) {
        this.boundaryElement = boundaryElement;
        this.controllerAccessor = controllerAccessor;
        this.controller = null;
        this.errors = [];
        this.errorsInternal = [];
    }
    static inject() {
        return [DOM.Element, Lazy.of(ValidationController)];
    }
    sort() {
        this.errorsInternal.sort((a, b) => {
            if (a.targets[0] === b.targets[0]) {
                return 0;
            }
            // tslint:disable-next-line:no-bitwise
            return a.targets[0].compareDocumentPosition(b.targets[0]) & 2 ? 1 : -1;
        });
    }
    interestingElements(elements$$1) {
        return elements$$1.filter(e => this.boundaryElement.contains(e));
    }
    render(instruction) {
        for (const { result } of instruction.unrender) {
            const index = this.errorsInternal.findIndex(x => x.error === result);
            if (index !== -1) {
                this.errorsInternal.splice(index, 1);
            }
        }
        for (const { result, elements: elements$$1 } of instruction.render) {
            if (result.valid) {
                continue;
            }
            const targets = this.interestingElements(elements$$1);
            if (targets.length) {
                this.errorsInternal.push({ error: result, targets });
            }
        }
        this.sort();
        this.errors = this.errorsInternal;
    }
    bind() {
        if (!this.controller) {
            this.controller = this.controllerAccessor();
        }
        // this will call render() with the side-effect of updating this.errors
        this.controller.addRenderer(this);
    }
    unbind() {
        if (this.controller) {
            this.controller.removeRenderer(this);
        }
    }
};
__decorate$2([
    bindable({ defaultBindingMode: bindingMode.oneWay })
], ValidationErrorsCustomAttribute.prototype, "controller", void 0);
__decorate$2([
    bindable({ primaryProperty: true, defaultBindingMode: bindingMode.twoWay })
], ValidationErrorsCustomAttribute.prototype, "errors", void 0);
ValidationErrorsCustomAttribute = __decorate$2([
    customAttribute('validation-errors')
], ValidationErrorsCustomAttribute);

let ValidationRendererCustomAttribute = class ValidationRendererCustomAttribute {
    created(view$$1) {
        this.container = view$$1.container;
    }
    bind() {
        this.controller = this.container.get(ValidationController);
        this.renderer = this.container.get(this.value);
        this.controller.addRenderer(this.renderer);
    }
    unbind() {
        this.controller.removeRenderer(this.renderer);
        this.controller = null;
        this.renderer = null;
    }
};
ValidationRendererCustomAttribute = __decorate$2([
    customAttribute('validation-renderer')
], ValidationRendererCustomAttribute);

/**
 * Sets, unsets and retrieves rules on an object or constructor function.
 */
class Rules {
    /**
     * Applies the rules to a target.
     */
    static set(target, rules) {
        if (target instanceof Function) {
            target = target.prototype;
        }
        Object.defineProperty(target, Rules.key, { enumerable: false, configurable: false, writable: true, value: rules });
    }
    /**
     * Removes rules from a target.
     */
    static unset(target) {
        if (target instanceof Function) {
            target = target.prototype;
        }
        target[Rules.key] = null;
    }
    /**
     * Retrieves the target's rules.
     */
    static get(target) {
        return target[Rules.key] || null;
    }
}
/**
 * The name of the property that stores the rules.
 */
Rules.key = '__rules__';

// tslint:disable:no-empty
class ExpressionVisitor {
    visitChain(chain) {
        this.visitArgs(chain.expressions);
    }
    visitBindingBehavior(behavior$$1) {
        behavior$$1.expression.accept(this);
        this.visitArgs(behavior$$1.args);
    }
    visitValueConverter(converter) {
        converter.expression.accept(this);
        this.visitArgs(converter.args);
    }
    visitAssign(assign) {
        assign.target.accept(this);
        assign.value.accept(this);
    }
    visitConditional(conditional) {
        conditional.condition.accept(this);
        conditional.yes.accept(this);
        conditional.no.accept(this);
    }
    visitAccessThis(access) {
        access.ancestor = access.ancestor;
    }
    visitAccessScope(access) {
        access.name = access.name;
    }
    visitAccessMember(access) {
        access.object.accept(this);
    }
    visitAccessKeyed(access) {
        access.object.accept(this);
        access.key.accept(this);
    }
    visitCallScope(call) {
        this.visitArgs(call.args);
    }
    visitCallFunction(call) {
        call.func.accept(this);
        this.visitArgs(call.args);
    }
    visitCallMember(call) {
        call.object.accept(this);
        this.visitArgs(call.args);
    }
    visitPrefix(prefix) {
        prefix.expression.accept(this);
    }
    visitBinary(binary) {
        binary.left.accept(this);
        binary.right.accept(this);
    }
    visitLiteralPrimitive(literal) {
        literal.value = literal.value;
    }
    visitLiteralArray(literal) {
        this.visitArgs(literal.elements);
    }
    visitLiteralObject(literal) {
        this.visitArgs(literal.values);
    }
    visitLiteralString(literal) {
        literal.value = literal.value;
    }
    visitArgs(args) {
        for (let i = 0; i < args.length; i++) {
            args[i].accept(this);
        }
    }
}

class ValidationMessageParser {
    constructor(bindinqLanguage) {
        this.bindinqLanguage = bindinqLanguage;
        this.emptyStringExpression = new LiteralString('');
        this.nullExpression = new LiteralPrimitive(null);
        this.undefinedExpression = new LiteralPrimitive(undefined);
        this.cache = {};
    }
    parse(message) {
        if (this.cache[message] !== undefined) {
            return this.cache[message];
        }
        const parts = this.bindinqLanguage.parseInterpolation(null, message);
        if (parts === null) {
            return new LiteralString(message);
        }
        let expression = new LiteralString(parts[0]);
        for (let i = 1; i < parts.length; i += 2) {
            expression = new Binary('+', expression, new Binary('+', this.coalesce(parts[i]), new LiteralString(parts[i + 1])));
        }
        MessageExpressionValidator.validate(expression, message);
        this.cache[message] = expression;
        return expression;
    }
    coalesce(part) {
        // part === null || part === undefined ? '' : part
        return new Conditional(new Binary('||', new Binary('===', part, this.nullExpression), new Binary('===', part, this.undefinedExpression)), this.emptyStringExpression, new CallMember(part, 'toString', []));
    }
}
ValidationMessageParser.inject = [BindingLanguage];
class MessageExpressionValidator extends ExpressionVisitor {
    constructor(originalMessage) {
        super();
        this.originalMessage = originalMessage;
    }
    static validate(expression, originalMessage) {
        const visitor = new MessageExpressionValidator(originalMessage);
        expression.accept(visitor);
    }
    visitAccessScope(access) {
        if (access.ancestor !== 0) {
            throw new Error('$parent is not permitted in validation message expressions.');
        }
        if (['displayName', 'propertyName', 'value', 'object', 'config', 'getDisplayName'].indexOf(access.name) !== -1) {
            getLogger('aurelia-validation')
                // tslint:disable-next-line:max-line-length
                .warn(`Did you mean to use "$${access.name}" instead of "${access.name}" in this validation message template: "${this.originalMessage}"?`);
        }
    }
}

/**
 * Dictionary of validation messages. [messageKey]: messageExpression
 */
const validationMessages = {
    /**
     * The default validation message. Used with rules that have no standard message.
     */
    default: `\${$displayName} is invalid.`,
    required: `\${$displayName} is required.`,
    matches: `\${$displayName} is not correctly formatted.`,
    email: `\${$displayName} is not a valid email.`,
    minLength: `\${$displayName} must be at least \${$config.length} character\${$config.length === 1 ? '' : 's'}.`,
    maxLength: `\${$displayName} cannot be longer than \${$config.length} character\${$config.length === 1 ? '' : 's'}.`,
    minItems: `\${$displayName} must contain at least \${$config.count} item\${$config.count === 1 ? '' : 's'}.`,
    maxItems: `\${$displayName} cannot contain more than \${$config.count} item\${$config.count === 1 ? '' : 's'}.`,
    min: `\${$displayName} must be at least \${$config.constraint}.`,
    max: `\${$displayName} must be at most \${$config.constraint}.`,
    range: `\${$displayName} must be between or equal to \${$config.min} and \${$config.max}.`,
    between: `\${$displayName} must be between but not equal to \${$config.min} and \${$config.max}.`,
    equals: `\${$displayName} must be \${$config.expectedValue}.`,
};
/**
 * Retrieves validation messages and property display names.
 */
class ValidationMessageProvider {
    constructor(parser) {
        this.parser = parser;
    }
    /**
     * Returns a message binding expression that corresponds to the key.
     * @param key The message key.
     */
    getMessage(key) {
        let message;
        if (key in validationMessages) {
            message = validationMessages[key];
        }
        else {
            message = validationMessages['default'];
        }
        return this.parser.parse(message);
    }
    /**
     * Formulates a property display name using the property name and the configured
     * displayName (if provided).
     * Override this with your own custom logic.
     * @param propertyName The property name.
     */
    getDisplayName(propertyName, displayName) {
        if (displayName !== null && displayName !== undefined) {
            return (displayName instanceof Function) ? displayName() : displayName;
        }
        // split on upper-case letters.
        const words = propertyName.toString().split(/(?=[A-Z])/).join(' ');
        // capitalize first letter.
        return words.charAt(0).toUpperCase() + words.slice(1);
    }
}
ValidationMessageProvider.inject = [ValidationMessageParser];

/**
 * Validates.
 * Responsible for validating objects and properties.
 */
class StandardValidator extends Validator {
    constructor(messageProvider, resources) {
        super();
        this.messageProvider = messageProvider;
        this.lookupFunctions = resources.lookupFunctions;
        this.getDisplayName = messageProvider.getDisplayName.bind(messageProvider);
    }
    /**
     * Validates the specified property.
     * @param object The object to validate.
     * @param propertyName The name of the property to validate.
     * @param rules Optional. If unspecified, the rules will be looked up using the metadata
     * for the object created by ValidationRules....on(class/object)
     */
    validateProperty(object, propertyName, rules) {
        return this.validate(object, propertyName, rules || null);
    }
    /**
     * Validates all rules for specified object and it's properties.
     * @param object The object to validate.
     * @param rules Optional. If unspecified, the rules will be looked up using the metadata
     * for the object created by ValidationRules....on(class/object)
     */
    validateObject(object, rules) {
        return this.validate(object, null, rules || null);
    }
    /**
     * Determines whether a rule exists in a set of rules.
     * @param rules The rules to search.
     * @parem rule The rule to find.
     */
    ruleExists(rules, rule) {
        let i = rules.length;
        while (i--) {
            if (rules[i].indexOf(rule) !== -1) {
                return true;
            }
        }
        return false;
    }
    getMessage(rule, object, value) {
        const expression = rule.message || this.messageProvider.getMessage(rule.messageKey);
        // tslint:disable-next-line:prefer-const
        let { name: propertyName, displayName } = rule.property;
        if (propertyName !== null) {
            displayName = this.messageProvider.getDisplayName(propertyName, displayName);
        }
        const overrideContext = {
            $displayName: displayName,
            $propertyName: propertyName,
            $value: value,
            $object: object,
            $config: rule.config,
            // returns the name of a given property, given just the property name (irrespective of the property's displayName)
            // split on capital letters, first letter ensured to be capitalized
            $getDisplayName: this.getDisplayName
        };
        return expression.evaluate({ bindingContext: object, overrideContext }, this.lookupFunctions);
    }
    validateRuleSequence(object, propertyName, ruleSequence, sequence, results) {
        // are we validating all properties or a single property?
        const validateAllProperties = propertyName === null || propertyName === undefined;
        const rules = ruleSequence[sequence];
        let allValid = true;
        // validate each rule.
        const promises = [];
        for (let i = 0; i < rules.length; i++) {
            const rule = rules[i];
            // is the rule related to the property we're validating.
            // tslint:disable-next-line:triple-equals | Use loose equality for property keys
            if (!validateAllProperties && rule.property.name != propertyName) {
                continue;
            }
            // is this a conditional rule? is the condition met?
            if (rule.when && !rule.when(object)) {
                continue;
            }
            // validate.
            const value = rule.property.name === null ? object : object[rule.property.name];
            let promiseOrBoolean = rule.condition(value, object);
            if (!(promiseOrBoolean instanceof Promise)) {
                promiseOrBoolean = Promise.resolve(promiseOrBoolean);
            }
            promises.push(promiseOrBoolean.then(valid => {
                const message = valid ? null : this.getMessage(rule, object, value);
                results.push(new ValidateResult(rule, object, rule.property.name, valid, message));
                allValid = allValid && valid;
                return valid;
            }));
        }
        return Promise.all(promises)
            .then(() => {
            sequence++;
            if (allValid && sequence < ruleSequence.length) {
                return this.validateRuleSequence(object, propertyName, ruleSequence, sequence, results);
            }
            return results;
        });
    }
    validate(object, propertyName, rules) {
        // rules specified?
        if (!rules) {
            // no. attempt to locate the rules.
            rules = Rules.get(object);
        }
        // any rules?
        if (!rules || rules.length === 0) {
            return Promise.resolve([]);
        }
        return this.validateRuleSequence(object, propertyName, rules, 0, []);
    }
}
StandardValidator.inject = [ValidationMessageProvider, ViewResources];

/**
 * Part of the fluent rule API. Enables customizing property rules.
 */
class FluentRuleCustomizer {
    constructor(property, condition, config = {}, fluentEnsure, fluentRules, parsers) {
        this.fluentEnsure = fluentEnsure;
        this.fluentRules = fluentRules;
        this.parsers = parsers;
        this.rule = {
            property,
            condition,
            config,
            when: null,
            messageKey: 'default',
            message: null,
            sequence: fluentRules.sequence
        };
        this.fluentEnsure._addRule(this.rule);
    }
    /**
     * Validate subsequent rules after previously declared rules have
     * been validated successfully. Use to postpone validation of costly
     * rules until less expensive rules pass validation.
     */
    then() {
        this.fluentRules.sequence++;
        return this;
    }
    /**
     * Specifies the key to use when looking up the rule's validation message.
     */
    withMessageKey(key) {
        this.rule.messageKey = key;
        this.rule.message = null;
        return this;
    }
    /**
     * Specifies rule's validation message.
     */
    withMessage(message) {
        this.rule.messageKey = 'custom';
        this.rule.message = this.parsers.message.parse(message);
        return this;
    }
    /**
     * Specifies a condition that must be met before attempting to validate the rule.
     * @param condition A function that accepts the object as a parameter and returns true
     * or false whether the rule should be evaluated.
     */
    when(condition) {
        this.rule.when = condition;
        return this;
    }
    /**
     * Tags the rule instance, enabling the rule to be found easily
     * using ValidationRules.taggedRules(rules, tag)
     */
    tag(tag) {
        this.rule.tag = tag;
        return this;
    }
    ///// FluentEnsure APIs /////
    /**
     * Target a property with validation rules.
     * @param property The property to target. Can be the property name or a property accessor function.
     */
    ensure(subject) {
        return this.fluentEnsure.ensure(subject);
    }
    /**
     * Targets an object with validation rules.
     */
    ensureObject() {
        return this.fluentEnsure.ensureObject();
    }
    /**
     * Rules that have been defined using the fluent API.
     */
    get rules() {
        return this.fluentEnsure.rules;
    }
    /**
     * Applies the rules to a class or object, making them discoverable by the StandardValidator.
     * @param target A class or object.
     */
    on(target) {
        return this.fluentEnsure.on(target);
    }
    ///////// FluentRules APIs /////////
    /**
     * Applies an ad-hoc rule function to the ensured property or object.
     * @param condition The function to validate the rule.
     * Will be called with two arguments, the property value and the object.
     * Should return a boolean or a Promise that resolves to a boolean.
     */
    satisfies(condition, config) {
        return this.fluentRules.satisfies(condition, config);
    }
    /**
     * Applies a rule by name.
     * @param name The name of the custom or standard rule.
     * @param args The rule's arguments.
     */
    satisfiesRule(name, ...args) {
        return this.fluentRules.satisfiesRule(name, ...args);
    }
    /**
     * Applies the "required" rule to the property.
     * The value cannot be null, undefined or whitespace.
     */
    required() {
        return this.fluentRules.required();
    }
    /**
     * Applies the "matches" rule to the property.
     * Value must match the specified regular expression.
     * null, undefined and empty-string values are considered valid.
     */
    matches(regex) {
        return this.fluentRules.matches(regex);
    }
    /**
     * Applies the "email" rule to the property.
     * null, undefined and empty-string values are considered valid.
     */
    email() {
        return this.fluentRules.email();
    }
    /**
     * Applies the "minLength" STRING validation rule to the property.
     * null, undefined and empty-string values are considered valid.
     */
    minLength(length) {
        return this.fluentRules.minLength(length);
    }
    /**
     * Applies the "maxLength" STRING validation rule to the property.
     * null, undefined and empty-string values are considered valid.
     */
    maxLength(length) {
        return this.fluentRules.maxLength(length);
    }
    /**
     * Applies the "minItems" ARRAY validation rule to the property.
     * null and undefined values are considered valid.
     */
    minItems(count) {
        return this.fluentRules.minItems(count);
    }
    /**
     * Applies the "maxItems" ARRAY validation rule to the property.
     * null and undefined values are considered valid.
     */
    maxItems(count) {
        return this.fluentRules.maxItems(count);
    }
    /**
     * Applies the "min" NUMBER validation rule to the property.
     * Value must be greater than or equal to the specified constraint.
     * null and undefined values are considered valid.
     */
    min(value) {
        return this.fluentRules.min(value);
    }
    /**
     * Applies the "max" NUMBER validation rule to the property.
     * Value must be less than or equal to the specified constraint.
     * null and undefined values are considered valid.
     */
    max(value) {
        return this.fluentRules.max(value);
    }
    /**
     * Applies the "range" NUMBER validation rule to the property.
     * Value must be between or equal to the specified min and max.
     * null and undefined values are considered valid.
     */
    range(min, max) {
        return this.fluentRules.range(min, max);
    }
    /**
     * Applies the "between" NUMBER validation rule to the property.
     * Value must be between but not equal to the specified min and max.
     * null and undefined values are considered valid.
     */
    between(min, max) {
        return this.fluentRules.between(min, max);
    }
    /**
     * Applies the "equals" validation rule to the property.
     * null, undefined and empty-string values are considered valid.
     */
    equals(expectedValue) {
        return this.fluentRules.equals(expectedValue);
    }
}
/**
 * Part of the fluent rule API. Enables applying rules to properties and objects.
 */
class FluentRules {
    constructor(fluentEnsure, parsers, property) {
        this.fluentEnsure = fluentEnsure;
        this.parsers = parsers;
        this.property = property;
        /**
         * Current rule sequence number. Used to postpone evaluation of rules until rules
         * with lower sequence number have successfully validated. The "then" fluent API method
         * manages this property, there's usually no need to set it directly.
         */
        this.sequence = 0;
    }
    /**
     * Sets the display name of the ensured property.
     */
    displayName(name) {
        this.property.displayName = name;
        return this;
    }
    /**
     * Applies an ad-hoc rule function to the ensured property or object.
     * @param condition The function to validate the rule.
     * Will be called with two arguments, the property value and the object.
     * Should return a boolean or a Promise that resolves to a boolean.
     */
    satisfies(condition, config) {
        return new FluentRuleCustomizer(this.property, condition, config, this.fluentEnsure, this, this.parsers);
    }
    /**
     * Applies a rule by name.
     * @param name The name of the custom or standard rule.
     * @param args The rule's arguments.
     */
    satisfiesRule(name, ...args) {
        let rule = FluentRules.customRules[name];
        if (!rule) {
            // standard rule?
            rule = this[name];
            if (rule instanceof Function) {
                return rule.call(this, ...args);
            }
            throw new Error(`Rule with name "${name}" does not exist.`);
        }
        const config = rule.argsToConfig ? rule.argsToConfig(...args) : undefined;
        return this.satisfies((value, obj) => rule.condition.call(this, value, obj, ...args), config)
            .withMessageKey(name);
    }
    /**
     * Applies the "required" rule to the property.
     * The value cannot be null, undefined or whitespace.
     */
    required() {
        return this.satisfies(value => value !== null
            && value !== undefined
            && !(isString(value) && !/\S/.test(value))).withMessageKey('required');
    }
    /**
     * Applies the "matches" rule to the property.
     * Value must match the specified regular expression.
     * null, undefined and empty-string values are considered valid.
     */
    matches(regex) {
        return this.satisfies(value => value === null || value === undefined || value.length === 0 || regex.test(value))
            .withMessageKey('matches');
    }
    /**
     * Applies the "email" rule to the property.
     * null, undefined and empty-string values are considered valid.
     */
    email() {
        // regex from https://html.spec.whatwg.org/multipage/forms.html#valid-e-mail-address
        /* tslint:disable:max-line-length */
        return this.matches(/^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/)
            /* tslint:enable:max-line-length */
            .withMessageKey('email');
    }
    /**
     * Applies the "minLength" STRING validation rule to the property.
     * null, undefined and empty-string values are considered valid.
     */
    minLength(length) {
        return this.satisfies((value) => value === null || value === undefined || value.length === 0 || value.length >= length, { length })
            .withMessageKey('minLength');
    }
    /**
     * Applies the "maxLength" STRING validation rule to the property.
     * null, undefined and empty-string values are considered valid.
     */
    maxLength(length) {
        return this.satisfies((value) => value === null || value === undefined || value.length === 0 || value.length <= length, { length })
            .withMessageKey('maxLength');
    }
    /**
     * Applies the "minItems" ARRAY validation rule to the property.
     * null and undefined values are considered valid.
     */
    minItems(count) {
        return this.satisfies((value) => value === null || value === undefined || value.length >= count, { count })
            .withMessageKey('minItems');
    }
    /**
     * Applies the "maxItems" ARRAY validation rule to the property.
     * null and undefined values are considered valid.
     */
    maxItems(count) {
        return this.satisfies((value) => value === null || value === undefined || value.length <= count, { count })
            .withMessageKey('maxItems');
    }
    /**
     * Applies the "min" NUMBER validation rule to the property.
     * Value must be greater than or equal to the specified constraint.
     * null and undefined values are considered valid.
     */
    min(constraint) {
        return this.satisfies((value) => value === null || value === undefined || value >= constraint, { constraint })
            .withMessageKey('min');
    }
    /**
     * Applies the "max" NUMBER validation rule to the property.
     * Value must be less than or equal to the specified constraint.
     * null and undefined values are considered valid.
     */
    max(constraint) {
        return this.satisfies((value) => value === null || value === undefined || value <= constraint, { constraint })
            .withMessageKey('max');
    }
    /**
     * Applies the "range" NUMBER validation rule to the property.
     * Value must be between or equal to the specified min and max.
     * null and undefined values are considered valid.
     */
    range(min, max) {
        return this.satisfies((value) => value === null || value === undefined || (value >= min && value <= max), { min, max })
            .withMessageKey('range');
    }
    /**
     * Applies the "between" NUMBER validation rule to the property.
     * Value must be between but not equal to the specified min and max.
     * null and undefined values are considered valid.
     */
    between(min, max) {
        return this.satisfies((value) => value === null || value === undefined || (value > min && value < max), { min, max })
            .withMessageKey('between');
    }
    /**
     * Applies the "equals" validation rule to the property.
     * null and undefined values are considered valid.
     */
    equals(expectedValue) {
        return this.satisfies(value => value === null || value === undefined || value === '' || value === expectedValue, { expectedValue })
            .withMessageKey('equals');
    }
}
FluentRules.customRules = {};
/**
 * Part of the fluent rule API. Enables targeting properties and objects with rules.
 */
class FluentEnsure {
    constructor(parsers) {
        this.parsers = parsers;
        /**
         * Rules that have been defined using the fluent API.
         */
        this.rules = [];
    }
    /**
     * Target a property with validation rules.
     * @param property The property to target. Can be the property name or a property accessor
     * function.
     */
    ensure(property) {
        this.assertInitialized();
        const name = this.parsers.property.parse(property);
        const fluentRules = new FluentRules(this, this.parsers, { name, displayName: null });
        return this.mergeRules(fluentRules, name);
    }
    /**
     * Targets an object with validation rules.
     */
    ensureObject() {
        this.assertInitialized();
        const fluentRules = new FluentRules(this, this.parsers, { name: null, displayName: null });
        return this.mergeRules(fluentRules, null);
    }
    /**
     * Applies the rules to a class or object, making them discoverable by the StandardValidator.
     * @param target A class or object.
     */
    on(target) {
        Rules.set(target, this.rules);
        return this;
    }
    /**
     * Adds a rule definition to the sequenced ruleset.
     * @internal
     */
    _addRule(rule) {
        while (this.rules.length < rule.sequence + 1) {
            this.rules.push([]);
        }
        this.rules[rule.sequence].push(rule);
    }
    assertInitialized() {
        if (this.parsers) {
            return;
        }
        throw new Error(`Did you forget to add ".plugin('aurelia-validation')" to your main.js?`);
    }
    mergeRules(fluentRules, propertyName) {
        // tslint:disable-next-line:triple-equals | Use loose equality for property keys
        const existingRules = this.rules.find(r => r.length > 0 && r[0].property.name == propertyName);
        if (existingRules) {
            const rule = existingRules[existingRules.length - 1];
            fluentRules.sequence = rule.sequence;
            if (rule.property.displayName !== null) {
                fluentRules = fluentRules.displayName(rule.property.displayName);
            }
        }
        return fluentRules;
    }
}
/**
 * Fluent rule definition API.
 */
class ValidationRules {
    static initialize(messageParser, propertyParser) {
        this.parsers = {
            message: messageParser,
            property: propertyParser
        };
    }
    /**
     * Target a property with validation rules.
     * @param property The property to target. Can be the property name or a property accessor function.
     */
    static ensure(property) {
        return new FluentEnsure(ValidationRules.parsers).ensure(property);
    }
    /**
     * Targets an object with validation rules.
     */
    static ensureObject() {
        return new FluentEnsure(ValidationRules.parsers).ensureObject();
    }
    /**
     * Defines a custom rule.
     * @param name The name of the custom rule. Also serves as the message key.
     * @param condition The rule function.
     * @param message The message expression
     * @param argsToConfig A function that maps the rule's arguments to a "config"
     * object that can be used when evaluating the message expression.
     */
    static customRule(name, condition, message, argsToConfig) {
        validationMessages[name] = message;
        FluentRules.customRules[name] = { condition, argsToConfig };
    }
    /**
     * Returns rules with the matching tag.
     * @param rules The rules to search.
     * @param tag The tag to search for.
     */
    static taggedRules(rules, tag) {
        return rules.map(x => x.filter(r => r.tag === tag));
    }
    /**
     * Returns rules that have no tag.
     * @param rules The rules to search.
     */
    static untaggedRules(rules) {
        return rules.map(x => x.filter(r => r.tag === undefined));
    }
    /**
     * Removes the rules from a class or object.
     * @param target A class or object.
     */
    static off(target) {
        Rules.unset(target);
    }
}

// Exports
/**
 * Aurelia Validation Configuration API
 */
class AureliaValidationConfiguration {
    constructor() {
        this.validatorType = StandardValidator;
    }
    /**
     * Use a custom Validator implementation.
     */
    customValidator(type) {
        this.validatorType = type;
    }
    /**
     * Applies the configuration.
     */
    apply(container) {
        const validator = container.get(this.validatorType);
        container.registerInstance(Validator, validator);
    }
}
/**
 * Configures the plugin.
 */
function configure(
// tslint:disable-next-line:ban-types
frameworkConfig, callback) {
    // the fluent rule definition API needs the parser to translate messages
    // to interpolation expressions.
    const messageParser = frameworkConfig.container.get(ValidationMessageParser);
    const propertyParser = frameworkConfig.container.get(PropertyAccessorParser);
    ValidationRules.initialize(messageParser, propertyParser);
    // configure...
    const config = new AureliaValidationConfiguration();
    if (callback instanceof Function) {
        callback(config);
    }
    config.apply(frameworkConfig.container);
    // globalize the behaviors.
    if (frameworkConfig.globalResources) {
        frameworkConfig.globalResources(ValidateBindingBehavior, ValidateManuallyBindingBehavior, ValidateOnBlurBindingBehavior, ValidateOnChangeBindingBehavior, ValidateOnChangeOrBlurBindingBehavior, ValidationErrorsCustomAttribute, ValidationRendererCustomAttribute);
    }
}

var aureliaValidation = /*#__PURE__*/Object.freeze({
    AureliaValidationConfiguration: AureliaValidationConfiguration,
    configure: configure,
    getTargetDOMElement: getTargetDOMElement,
    getPropertyInfo: getPropertyInfo,
    PropertyAccessorParser: PropertyAccessorParser,
    getAccessorExpression: getAccessorExpression,
    get ValidateBindingBehavior () { return ValidateBindingBehavior; },
    get ValidateManuallyBindingBehavior () { return ValidateManuallyBindingBehavior; },
    get ValidateOnBlurBindingBehavior () { return ValidateOnBlurBindingBehavior; },
    get ValidateOnChangeBindingBehavior () { return ValidateOnChangeBindingBehavior; },
    get ValidateOnChangeOrBlurBindingBehavior () { return ValidateOnChangeOrBlurBindingBehavior; },
    ValidateEvent: ValidateEvent,
    ValidateResult: ValidateResult,
    get validateTrigger () { return validateTrigger; },
    ValidationController: ValidationController,
    ValidationControllerFactory: ValidationControllerFactory,
    get ValidationErrorsCustomAttribute () { return ValidationErrorsCustomAttribute; },
    get ValidationRendererCustomAttribute () { return ValidationRendererCustomAttribute; },
    Validator: Validator,
    Rules: Rules,
    StandardValidator: StandardValidator,
    validationMessages: validationMessages,
    ValidationMessageProvider: ValidationMessageProvider,
    ValidationMessageParser: ValidationMessageParser,
    MessageExpressionValidator: MessageExpressionValidator,
    FluentRuleCustomizer: FluentRuleCustomizer,
    FluentRules: FluentRules,
    FluentEnsure: FluentEnsure,
    ValidationRules: ValidationRules
});

var aureliaViewManager = createCommonjsModule(function (module, exports) {

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ResolvedViewStrategy = exports.ViewManager = exports.Config = undefined;

var _dec, _class2, _dec2, _class3;

exports.configure = configure;
exports.resolvedView = resolvedView;



var _extend2 = _interopRequireDefault(extend);







function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }



var Config = exports.Config = function () {
  function Config() {
    

    this.defaults = {
      location: '{{framework}}/{{view}}.html',
      framework: 'bootstrap',
      map: {}
    };
    this.namespaces = {};

    this.namespaces.defaults = this.defaults;
  }

  Config.prototype.configureDefaults = function configureDefaults(configs) {
    (0, _extend2.default)(true, this.defaults, configs);

    return this;
  };

  Config.prototype.configureNamespace = function configureNamespace(name) {
    var _configure;

    var configs = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : { map: {} };

    var namespace = this.fetch(name);

    (0, _extend2.default)(true, namespace, configs);

    this.configure((_configure = {}, _configure[name] = namespace, _configure));

    return this;
  };

  Config.prototype.configure = function configure(config) {
    (0, _extend2.default)(true, this.namespaces, config);

    return this;
  };

  Config.prototype.fetch = function fetch(properties) {
    if (!this.namespaces[properties]) {
      return this.defaults;
    }

    var result = this.namespaces;
    var args = Array.from(arguments);

    for (var index in args) {
      if (!args.hasOwnProperty(index)) {
        continue;
      }
      var key = args[index];
      var value = result[key];

      if (!value) {
        return value;
      }
      result = result[key];
    }

    return result;
  };

  return Config;
}();

function configure(aurelia, configOrConfigure) {
  var config = aurelia.container.get(Config);

  if (typeof configOrConfigure === 'function') {
    return configOrConfigure(config);
  }
  config.configure(configOrConfigure);
}

var ViewManager = exports.ViewManager = (_dec = (0, aureliaDependencyInjection.inject)(Config), _dec(_class2 = function () {
  function ViewManager(config) {
    

    this.config = config;
  }

  ViewManager.prototype.resolve = function resolve(namespace, view) {
    if (!namespace || !view) {
      throw new Error('Cannot resolve without namespace and view. Got namespace "' + namespace + '" and view "' + view + '" in stead');
    }

    var namespaceOrDefault = Object.create(this.config.fetch(namespace));

    namespaceOrDefault.view = view;

    var location = (namespaceOrDefault.map || {})[view] || namespaceOrDefault.location;

    return render(location, namespaceOrDefault);
  };

  return ViewManager;
}()) || _class2);

function render(template, data) {
  var result = template;

  for (var key in data) {
    var regexString = ['{{', key, '}}'].join('');
    var regex = new RegExp(regexString, 'g');
    var value = data[key];

    result = result.replace(regex, value);
  }

  if (template !== result) {
    result = render(result, data);
  }

  return result;
}

var ResolvedViewStrategy = exports.ResolvedViewStrategy = (_dec2 = (0, aureliaTemplating.viewStrategy)(), _dec2(_class3 = function () {
  function ResolvedViewStrategy(namespace, view) {
    

    this.namespace = namespace;
    this.view = view;
  }

  ResolvedViewStrategy.prototype.loadViewFactory = function loadViewFactory(viewEngine, compileInstruction, loadContext) {
    var viewManager = viewEngine.container.get(ViewManager);
    var path = viewManager.resolve(this.namespace, this.view);

    compileInstruction.associatedModuleId = this.moduleId;

    return viewEngine.loadViewFactory(this.moduleId ? (0, aureliaPath.relativeToFile)(path, this.moduleId) : path, compileInstruction, loadContext);
  };

  return ResolvedViewStrategy;
}()) || _class3);
function resolvedView(namespace, view) {
  return (0, aureliaTemplating.useViewStrategy)(new ResolvedViewStrategy(namespace, view));
}
});

unwrapExports(aureliaViewManager);
var aureliaViewManager_1 = aureliaViewManager.ResolvedViewStrategy;
var aureliaViewManager_2 = aureliaViewManager.ViewManager;
var aureliaViewManager_3 = aureliaViewManager.Config;
var aureliaViewManager_4 = aureliaViewManager.configure;
var aureliaViewManager_5 = aureliaViewManager.resolvedView;

var aureliaOrm = createCommonjsModule(function (module, exports) {

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.logger = exports.EntityManager = exports.Entity = exports.Metadata = exports.OrmMetadata = exports.DefaultRepository = exports.Repository = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _dec, _class, _dec2, _class3, _class4, _temp, _dec3, _class5, _dec4, _class6;

exports.idProperty = idProperty;
exports.identifier = identifier;
exports.name = name;
exports.repository = repository;
exports.resource = resource;
exports.validation = validation;
exports.validatedResource = validatedResource;
exports.configure = configure;
exports.data = data;
exports.endpoint = endpoint;
exports.ensurePropertyIsConfigurable = ensurePropertyIsConfigurable;
exports.association = association;
exports.enumeration = enumeration;
exports.type = type;



var _typer2 = _interopRequireDefault(typer);













function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }



var Repository = exports.Repository = (_dec = (0, aureliaDependencyInjection.inject)(aureliaApi.Config), _dec(_class = function () {
  function Repository(clientConfig) {
    

    this.transport = null;

    this.clientConfig = clientConfig;
  }

  Repository.prototype.getTransport = function getTransport() {
    if (this.transport === null) {
      this.transport = this.clientConfig.getEndpoint(this.getMeta().fetch('endpoint'));

      if (!this.transport) {
        throw new Error('No transport found for \'' + (this.getMeta().fetch('endpoint') || 'default') + '\'.');
      }
    }

    return this.transport;
  };

  Repository.prototype.setMeta = function setMeta(meta) {
    this.meta = meta;
  };

  Repository.prototype.getMeta = function getMeta() {
    return this.meta;
  };

  Repository.prototype.setIdentifier = function setIdentifier(identifier) {
    this.identifier = identifier;

    return this;
  };

  Repository.prototype.getIdentifier = function getIdentifier() {
    return this.identifier;
  };

  Repository.prototype.setResource = function setResource(resource) {
    this.resource = resource;

    return this;
  };

  Repository.prototype.getResource = function getResource() {
    return this.resource;
  };

  Repository.prototype.find = function find(criteria, raw) {
    return this.findPath(this.resource, criteria, raw);
  };

  Repository.prototype.findOne = function findOne(criteria, raw) {
    return this.findPath(this.resource, criteria, raw, true);
  };

  Repository.prototype.findPath = function findPath(path, criteria, raw, single) {
    var _this = this;

    var transport = this.getTransport();
    var findQuery = void 0;

    if (single) {
      if ((typeof criteria === 'undefined' ? 'undefined' : _typeof(criteria)) === 'object' && criteria !== null) {
        criteria.limit = 1;
      }

      findQuery = transport.findOne(path, criteria);
    } else {
      findQuery = transport.find(path, criteria);
    }

    if (raw) {
      return findQuery;
    }

    return findQuery.then(function (response) {
      return _this.populateEntities(response);
    }).then(function (populated) {
      if (!populated) {
        return null;
      }

      if (!Array.isArray(populated)) {
        return populated.markClean();
      }

      populated.forEach(function (entity) {
        return entity.markClean();
      });

      return populated;
    });
  };

  Repository.prototype.count = function count(criteria) {
    return this.getTransport().find(this.resource + '/count', criteria);
  };

  Repository.prototype.populateEntities = function populateEntities(data, clean) {
    var _this2 = this;

    if (!data) {
      return null;
    }

    if (!Array.isArray(data)) {
      return this.getPopulatedEntity(data, null, clean);
    }

    var collection = [];

    data.forEach(function (source) {
      collection.push(_this2.getPopulatedEntity(source, null, clean));
    });

    return collection;
  };

  Repository.prototype.getPopulatedEntity = function getPopulatedEntity(data, entity, clean) {
    entity = entity || this.getNewEntity();
    var entityMetadata = entity.getMeta();
    var populatedData = {};
    var key = void 0;

    for (key in data) {
      if (!data.hasOwnProperty(key)) {
        continue;
      }

      var value = data[key];

      if (entityMetadata.has('types', key)) {
        var dataType = entityMetadata.fetch('types', key);

        if ((dataType === 'date' || dataType === 'datetime') && !value) {
          continue;
        }

        populatedData[key] = _typer2.default.cast(value, dataType);

        continue;
      }

      if (!entityMetadata.has('associations', key) || (typeof value === 'undefined' ? 'undefined' : _typeof(value)) !== 'object') {
        populatedData[key] = value;

        continue;
      }

      var _repository = this.entityManager.getRepository(entityMetadata.fetch('associations', key).entity);

      populatedData[key] = _repository.populateEntities(value, clean);
    }

    return entity.setData(populatedData, clean);
  };

  Repository.prototype.getNewEntity = function getNewEntity() {
    return this.entityManager.getEntity(this.identifier || this.resource);
  };

  Repository.prototype.getNewPopulatedEntity = function getNewPopulatedEntity() {
    var entity = this.getNewEntity();
    var associations = entity.getMeta().fetch('associations');

    for (var property in associations) {
      if (associations.hasOwnProperty(property)) {
        var assocMeta = associations[property];

        if (assocMeta.type !== 'entity') {
          continue;
        }

        entity[property] = this.entityManager.getRepository(assocMeta.entity).getNewEntity();
      }
    }

    return entity;
  };

  return Repository;
}()) || _class);
var DefaultRepository = exports.DefaultRepository = (_dec2 = (0, aureliaDependencyInjection.transient)(), _dec2(_class3 = function (_Repository) {
  _inherits(DefaultRepository, _Repository);

  function DefaultRepository() {
    

    return _possibleConstructorReturn(this, _Repository.apply(this, arguments));
  }

  return DefaultRepository;
}(Repository)) || _class3);

var OrmMetadata = exports.OrmMetadata = function () {
  function OrmMetadata() {
    
  }

  OrmMetadata.forTarget = function forTarget(target) {
    return aureliaMetadata.metadata.getOrCreateOwn(Metadata.key, Metadata, target, target.name);
  };

  return OrmMetadata;
}();

var Metadata = exports.Metadata = (_temp = _class4 = function () {
  function Metadata() {
    

    this.metadata = {
      repository: DefaultRepository,
      identifier: null,
      resource: null,
      endpoint: null,
      name: null,
      idProperty: 'id',
      associations: {}
    };
  }

  Metadata.prototype.addTo = function addTo(key, value) {
    if (typeof this.metadata[key] === 'undefined') {
      this.metadata[key] = [];
    } else if (!Array.isArray(this.metadata[key])) {
      this.metadata[key] = [this.metadata[key]];
    }

    this.metadata[key].push(value);

    return this;
  };

  Metadata.prototype.put = function put(key, valueOrNestedKey, valueOrNull) {
    if (!valueOrNull) {
      this.metadata[key] = valueOrNestedKey;

      return this;
    }

    if (_typeof(this.metadata[key]) !== 'object') {
      this.metadata[key] = {};
    }

    this.metadata[key][valueOrNestedKey] = valueOrNull;

    return this;
  };

  Metadata.prototype.has = function has(key, nested) {
    if (typeof nested === 'undefined') {
      return typeof this.metadata[key] !== 'undefined';
    }

    return typeof this.metadata[key] !== 'undefined' && typeof this.metadata[key][nested] !== 'undefined';
  };

  Metadata.prototype.fetch = function fetch(key, nested) {
    if (!nested) {
      return this.has(key) ? this.metadata[key] : null;
    }

    if (!this.has(key, nested)) {
      return null;
    }

    return this.metadata[key][nested];
  };

  return Metadata;
}(), _class4.key = 'spoonx:orm:metadata', _temp);
var Entity = exports.Entity = (_dec3 = (0, aureliaDependencyInjection.transient)(), _dec3(_class5 = function () {
  function Entity() {
    

    this.define('__meta', OrmMetadata.forTarget(this.constructor)).define('__cleanValues', {}, true);
  }

  Entity.prototype.getTransport = function getTransport() {
    return this.getRepository().getTransport();
  };

  Entity.prototype.getRepository = function getRepository() {
    return this.__repository;
  };

  Entity.prototype.setRepository = function setRepository(repository) {
    return this.define('__repository', repository);
  };

  Entity.prototype.define = function define(property, value, writable) {
    Object.defineProperty(this, property, {
      value: value,
      writable: !!writable,
      enumerable: false
    });

    return this;
  };

  Entity.prototype.getMeta = function getMeta() {
    return this.__meta;
  };

  Entity.prototype.getIdProperty = function getIdProperty() {
    return this.getMeta().fetch('idProperty');
  };

  Entity.getIdProperty = function getIdProperty() {
    var idProperty = OrmMetadata.forTarget(this).fetch('idProperty');

    return idProperty;
  };

  Entity.prototype.getId = function getId() {
    return this[this.getIdProperty()];
  };

  Entity.prototype.setId = function setId(id) {
    this[this.getIdProperty()] = id;

    return this;
  };

  Entity.prototype.save = function save() {
    var _this4 = this;

    if (!this.isNew()) {
      return this.update();
    }

    var response = void 0;

    return this.getTransport().create(this.getResource(), this.asObject(true)).then(function (created) {
      _this4.setId(created[_this4.getIdProperty()]);
      response = created;
    }).then(function () {
      return _this4.saveCollections();
    }).then(function () {
      return _this4.markClean();
    }).then(function () {
      return response;
    });
  };

  Entity.prototype.update = function update() {
    var _this5 = this;

    if (this.isNew()) {
      throw new Error('Required value "id" missing on entity.');
    }

    if (this.isClean()) {
      return this.saveCollections().then(function () {
        return _this5.markClean();
      }).then(function () {
        return null;
      });
    }

    var requestBody = this.asObject(true);
    var response = void 0;

    return this.getTransport().update(this.getResource(), this.getId(), requestBody).then(function (updated) {
      response = updated;
    }).then(function () {
      return _this5.saveCollections();
    }).then(function () {
      return _this5.markClean();
    }).then(function () {
      return response;
    });
  };

  Entity.prototype.addCollectionAssociation = function addCollectionAssociation(entity, property) {
    var _this6 = this;

    property = property || getPropertyForAssociation(this, entity);
    var url = [this.getResource(), this.getId(), property];

    if (this.isNew()) {
      throw new Error('Cannot add association to entity that does not have an id.');
    }

    if (!(entity instanceof Entity)) {
      url.push(entity);

      return this.getTransport().create(url.join('/'));
    }

    if (entity.isNew()) {
      var associationProperty = getPropertyForAssociation(entity, this);
      var relation = entity.getMeta().fetch('association', associationProperty);

      if (!relation || relation.type !== 'entity') {
        return entity.save().then(function () {
          if (entity.isNew()) {
            throw new Error('Entity did not return return an id on saving.');
          }

          return _this6.addCollectionAssociation(entity, property);
        });
      }

      entity[associationProperty] = this.getId();

      return entity.save().then(function () {
        return entity;
      });
    }

    url.push(entity.getId());

    return this.getTransport().create(url.join('/')).then(function () {
      return entity;
    });
  };

  Entity.prototype.removeCollectionAssociation = function removeCollectionAssociation(entity, property) {
    property = property || getPropertyForAssociation(this, entity);
    var idToRemove = entity;

    if (entity instanceof Entity) {
      if (!entity.getId()) {
        return Promise.resolve(null);
      }

      idToRemove = entity.getId();
    }

    return this.getTransport().destroy([this.getResource(), this.getId(), property, idToRemove].join('/'));
  };

  Entity.prototype.saveCollections = function saveCollections() {
    var _this7 = this;

    var tasks = [];
    var currentCollections = getCollectionsCompact(this, true);
    var cleanCollections = this.__cleanValues.data ? this.__cleanValues.data.collections : null;

    var addTasksForDifferences = function addTasksForDifferences(base, candidate, method) {
      if (base === null) {
        return;
      }

      Object.getOwnPropertyNames(base).forEach(function (property) {
        base[property].forEach(function (id) {
          if (candidate === null || !Array.isArray(candidate[property]) || candidate[property].indexOf(id) === -1) {
            tasks.push(method.call(_this7, id, property));
          }
        });
      });
    };

    addTasksForDifferences(currentCollections, cleanCollections, this.addCollectionAssociation);

    addTasksForDifferences(cleanCollections, currentCollections, this.removeCollectionAssociation);

    return Promise.all(tasks).then(function (results) {
      return _this7;
    });
  };

  Entity.prototype.markClean = function markClean() {
    var cleanValues = getFlat(this);

    this.__cleanValues = {
      checksum: JSON.stringify(cleanValues),
      data: cleanValues
    };

    return this;
  };

  Entity.prototype.isClean = function isClean() {
    return getFlat(this, true) === this.__cleanValues.checksum;
  };

  Entity.prototype.isDirty = function isDirty() {
    return !this.isClean();
  };

  Entity.prototype.isNew = function isNew() {
    return !this.getId();
  };

  Entity.prototype.reset = function reset(shallow) {
    var _this8 = this;
    var metadata = this.getMeta();

    Object.keys(this).forEach(function (propertyName) {
      var value = _this8[propertyName];
      var association = metadata.fetch('associations', propertyName);

      if (!association || !value) {

        return;
      }
    });

    if (this.isClean()) {
      return this;
    }

    var isNew = this.isNew();
    var associations = this.getMeta().fetch('associations');

    Object.keys(this).forEach(function (propertyName) {
      if (Object.getOwnPropertyNames(associations).indexOf(propertyName) === -1) {
        delete _this8[propertyName];
      }
    });

    if (isNew) {
      return this.markClean();
    }

    this.setData(this.__cleanValues.data.entity);

    if (shallow) {
      return this.markClean();
    }

    var collections = this.__cleanValues.data.collections;

    Object.getOwnPropertyNames(collections).forEach(function (index) {
      _this8[index] = [];
      collections[index].forEach(function (entity) {
        if (typeof entity === 'number') {
          _this8[index].push(entity);
        }
      });
    });

    return this.markClean();
  };

  Entity.prototype.clear = function clear() {
    if (!this.isNew()) {
      return this.setData(this.__cleanValues.data.entity);
    }

    return this;
  };

  Entity.getIdentifier = function getIdentifier() {
    return OrmMetadata.forTarget(this).fetch('identifier');
  };

  Entity.prototype.getIdentifier = function getIdentifier() {
    return this.__identifier || this.getMeta().fetch('identifier');
  };

  Entity.prototype.setIdentifier = function setIdentifier(identifier) {
    return this.define('__identifier', identifier);
  };

  Entity.getResource = function getResource() {
    return OrmMetadata.forTarget(this).fetch('resource');
  };

  Entity.prototype.getResource = function getResource() {
    return this.__resource || this.getMeta().fetch('resource');
  };

  Entity.prototype.setResource = function setResource(resource) {
    return this.define('__resource', resource);
  };

  Entity.prototype.destroy = function destroy() {
    if (!this.getId()) {
      throw new Error('Required value "id" missing on entity.');
    }

    return this.getTransport().destroy(this.getResource(), this.getId());
  };

  Entity.prototype.getName = function getName() {
    var metaName = this.getMeta().fetch('name');

    if (metaName) {
      return metaName;
    }

    return this.getResource();
  };

  Entity.getName = function getName() {
    var metaName = OrmMetadata.forTarget(this).fetch('name');

    if (metaName) {
      return metaName;
    }

    return this.getResource();
  };

  Entity.prototype.setData = function setData(data, markClean) {
    Object.assign(this, data);

    if (markClean) {
      this.markClean();
    }

    return this;
  };

  Entity.prototype.setValidator = function setValidator(validator) {
    this.define('__validator', validator);

    return this;
  };

  Entity.prototype.getValidator = function getValidator() {
    if (!this.hasValidation()) {
      return null;
    }

    return this.__validator;
  };

  Entity.prototype.hasValidation = function hasValidation() {
    return !!this.getMeta().fetch('validation');
  };

  Entity.prototype.validate = function validate(propertyName, rules) {
    if (!this.hasValidation()) {
      return Promise.resolve([]);
    }

    return propertyName ? this.getValidator().validateProperty(this, propertyName, rules) : this.getValidator().validateObject(this, rules);
  };

  Entity.prototype.asObject = function asObject(shallow) {
    return _asObject(this, shallow);
  };

  Entity.prototype.asJson = function asJson(shallow) {
    return _asJson(this, shallow);
  };

  return Entity;
}()) || _class5);

function _asObject(entity, shallow) {
  var pojo = {};
  var metadata = entity.getMeta();

  Object.keys(entity).forEach(function (propertyName) {
    var value = entity[propertyName];
    var association = metadata.fetch('associations', propertyName);

    if (!association || !value) {
      pojo[propertyName] = value;

      return;
    }

    if (shallow) {
      if (association.type === 'collection') {
        return;
      }

      if (value instanceof Entity && value.getId()) {
        pojo[propertyName] = value.getId();

        return;
      }

      if (value instanceof Entity) {
        pojo[propertyName] = value.asObject();

        return;
      }

      if (['string', 'number', 'boolean'].indexOf(typeof value === 'undefined' ? 'undefined' : _typeof(value)) > -1 || value.constructor === Object) {
        pojo[propertyName] = value;

        return;
      }
    }

    if (!Array.isArray(value)) {
      pojo[propertyName] = !(value instanceof Entity) ? value : value.asObject(shallow);

      return;
    }

    var asObjects = [];

    value.forEach(function (childValue) {
      if ((typeof childValue === 'undefined' ? 'undefined' : _typeof(childValue)) !== 'object') {
        return;
      }

      if (!(childValue instanceof Entity)) {
        asObjects.push(childValue);

        return;
      }

      if (!shallow || (typeof childValue === 'undefined' ? 'undefined' : _typeof(childValue)) === 'object' && !childValue.getId()) {
        asObjects.push(childValue.asObject(shallow));
      }
    });

    pojo[propertyName] = asObjects;
  });

  return pojo;
}

function _asJson(entity, shallow) {
  var json = void 0;

  try {
    json = JSON.stringify(_asObject(entity, shallow));
  } catch (error) {
    json = '';
  }

  return json;
}

function getCollectionsCompact(forEntity, includeNew) {
  var associations = forEntity.getMeta().fetch('associations');
  var collections = {};

  Object.getOwnPropertyNames(associations).forEach(function (index) {
    var association = associations[index];

    if (association.type !== 'collection') {
      return;
    }

    collections[index] = [];
    if (!Array.isArray(forEntity[index])) {
      return;
    }

    forEntity[index].forEach(function (entity) {
      if (typeof entity === 'number') {
        collections[index].push(entity);

        return;
      }

      if (!(entity instanceof Entity)) {
        return;
      }

      if (entity.getId()) {
        collections[index].push(entity.getId());

        return;
      }

      if (includeNew) {
        collections[index].push(entity);

        return;
      }
    });
  });

  return collections;
}

function getFlat(entity, json) {
  var flat = {
    entity: _asObject(entity, true),
    collections: getCollectionsCompact(entity)
  };

  if (json) {
    flat = JSON.stringify(flat);
  }

  return flat;
}

function getPropertyForAssociation(forEntity, entity) {
  var associations = forEntity.getMeta().fetch('associations');

  return Object.keys(associations).filter(function (key) {
    return associations[key].entity === entity.getResource();
  })[0];
}

function idProperty(propertyName) {
  return function (target) {
    OrmMetadata.forTarget(target).put('idProperty', propertyName);
  };
}

function identifier(identifierName) {
  return function (target) {
    OrmMetadata.forTarget(target).put('identifier', identifierName || target.name.toLowerCase());
  };
}

function name(entityName) {
  return function (target) {
    OrmMetadata.forTarget(target).put('name', entityName || target.name.toLowerCase());
  };
}

function repository(repositoryReference) {
  return function (target) {
    OrmMetadata.forTarget(target).put('repository', repositoryReference);
  };
}

function resource(resourceName) {
  return function (target) {
    OrmMetadata.forTarget(target).put('resource', resourceName || target.name.toLowerCase());
  };
}

function validation() {
  var ValidatorClass = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : aureliaValidation.Validator;

  return function (target) {
    OrmMetadata.forTarget(target).put('validation', ValidatorClass);
  };
}

var EntityManager = exports.EntityManager = (_dec4 = (0, aureliaDependencyInjection.inject)(aureliaDependencyInjection.Container), _dec4(_class6 = function () {
  function EntityManager(container) {
    

    this.repositories = {};
    this.entities = {};

    this.container = container;
  }

  EntityManager.prototype.registerEntities = function registerEntities(EntityClasses) {
    for (var property in EntityClasses) {
      if (EntityClasses.hasOwnProperty(property)) {
        this.registerEntity(EntityClasses[property]);
      }
    }

    return this;
  };

  EntityManager.prototype.registerEntity = function registerEntity(EntityClass) {
    var meta = OrmMetadata.forTarget(EntityClass);

    this.entities[meta.fetch('identifier') || meta.fetch('resource')] = EntityClass;

    return this;
  };

  EntityManager.prototype.getRepository = function getRepository(entity) {
    var reference = this.resolveEntityReference(entity);
    var identifier = entity;
    var resource = entity;

    if (typeof reference.getResource === 'function') {
      resource = reference.getResource() || resource;
    }

    if (typeof reference.getIdentifier === 'function') {
      identifier = reference.getIdentifier() || resource;
    }

    if (typeof resource !== 'string') {
      throw new Error('Unable to find resource for entity.');
    }

    if (this.repositories[identifier]) {
      return this.repositories[identifier];
    }

    var metaData = OrmMetadata.forTarget(reference);
    var repository = metaData.fetch('repository');
    var instance = this.container.get(repository);

    if (instance.meta && instance.resource && instance.entityManager) {
      return instance;
    }

    instance.setMeta(metaData);
    instance.resource = resource;
    instance.identifier = identifier;
    instance.entityManager = this;

    if (instance instanceof DefaultRepository) {
      this.repositories[identifier] = instance;
    }

    return instance;
  };

  EntityManager.prototype.resolveEntityReference = function resolveEntityReference(resource) {
    var entityReference = resource;

    if (typeof resource === 'string') {
      entityReference = this.entities[resource] || Entity;
    }

    if (typeof entityReference === 'function') {
      return entityReference;
    }

    throw new Error('Unable to resolve to entity reference. Expected string or function.');
  };

  EntityManager.prototype.getEntity = function getEntity(entity) {
    var reference = this.resolveEntityReference(entity);
    var instance = this.container.get(reference);
    var resource = reference.getResource();
    var identifier = reference.getIdentifier() || resource;

    if (!resource) {
      if (typeof entity !== 'string') {
        throw new Error('Unable to find resource for entity.');
      }

      resource = entity;
      identifier = entity;
    }

    if (instance.hasValidation() && !instance.getValidator()) {
      var validator = this.container.get(OrmMetadata.forTarget(reference).fetch('validation'));

      instance.setValidator(validator);
    }

    return instance.setResource(resource).setIdentifier(identifier).setRepository(this.getRepository(identifier));
  };

  return EntityManager;
}()) || _class6);
function validatedResource(resourceName, ValidatorClass) {
  return function (target, propertyName) {
    resource(resourceName)(target);
    validation(ValidatorClass)(target, propertyName);
  };
}

function configure(frameworkConfig, configCallback) {
  aureliaValidation.ValidationRules.customRule('hasAssociation', function (value) {
    return value instanceof Entity && typeof value.id === 'number' || typeof value === 'number';
  }, '${$displayName} must be an association.');

  var entityManagerInstance = frameworkConfig.container.get(EntityManager);

  configCallback(entityManagerInstance);

  frameworkConfig.container.get(aureliaViewManager.Config).configureNamespace('spoonx/orm', {
    location: './view/{{framework}}/{{view}}.html'
  });

  frameworkConfig.globalResources('./component/association-select');
  frameworkConfig.globalResources('./component/paged');
}

var logger = exports.logger = (0, aureliaLogging.getLogger)('aurelia-orm');

function data(metaData) {
  return function (target, propertyName) {
    if ((typeof metaData === 'undefined' ? 'undefined' : _typeof(metaData)) !== 'object') {
      logger.error('data must be an object, ' + (typeof metaData === 'undefined' ? 'undefined' : _typeof(metaData)) + ' given.');
    }

    OrmMetadata.forTarget(target.constructor).put('data', propertyName, metaData);
  };
}

function endpoint(entityEndpoint) {
  return function (target) {
    if (!OrmMetadata.forTarget(target).fetch('resource')) {
      logger.warn('Need to set the resource before setting the endpoint!');
    }

    OrmMetadata.forTarget(target).put('endpoint', entityEndpoint);
  };
}

function ensurePropertyIsConfigurable(target, propertyName, descriptor) {
  if (descriptor && descriptor.configurable === false) {
    descriptor.configurable = true;

    if (!Reflect.defineProperty(target, propertyName, descriptor)) {
      logger.warn('Cannot make configurable property \'' + propertyName + '\' of object', target);
    }
  }
}

function association(associationData) {
  return function (target, propertyName, descriptor) {
    ensurePropertyIsConfigurable(target, propertyName, descriptor);

    if (!associationData) {
      associationData = { entity: propertyName };
    } else if (typeof associationData === 'string') {
      associationData = { entity: associationData };
    }

    OrmMetadata.forTarget(target.constructor).put('associations', propertyName, {
      type: associationData.entity ? 'entity' : 'collection',
      entity: associationData.entity || associationData.collection
    });
  };
}

function enumeration(values) {
  return function (target, propertyName, descriptor) {
    ensurePropertyIsConfigurable(target, propertyName, descriptor);

    OrmMetadata.forTarget(target.constructor).put('enumerations', propertyName, values);
  };
}

function type(typeValue) {
  return function (target, propertyName, descriptor) {
    ensurePropertyIsConfigurable(target, propertyName, descriptor);

    OrmMetadata.forTarget(target.constructor).put('types', propertyName, typeValue);
  };
}
});

unwrapExports(aureliaOrm);
var aureliaOrm_1 = aureliaOrm.logger;
var aureliaOrm_2 = aureliaOrm.EntityManager;
var aureliaOrm_3 = aureliaOrm.Entity;
var aureliaOrm_4 = aureliaOrm.Metadata;
var aureliaOrm_5 = aureliaOrm.OrmMetadata;
var aureliaOrm_6 = aureliaOrm.DefaultRepository;
var aureliaOrm_7 = aureliaOrm.Repository;
var aureliaOrm_8 = aureliaOrm.idProperty;
var aureliaOrm_9 = aureliaOrm.identifier;
var aureliaOrm_10 = aureliaOrm.name;
var aureliaOrm_11 = aureliaOrm.repository;
var aureliaOrm_12 = aureliaOrm.resource;
var aureliaOrm_13 = aureliaOrm.validation;
var aureliaOrm_14 = aureliaOrm.validatedResource;
var aureliaOrm_15 = aureliaOrm.configure;
var aureliaOrm_16 = aureliaOrm.data;
var aureliaOrm_17 = aureliaOrm.endpoint;
var aureliaOrm_18 = aureliaOrm.ensurePropertyIsConfigurable;
var aureliaOrm_19 = aureliaOrm.association;
var aureliaOrm_20 = aureliaOrm.enumeration;
var aureliaOrm_21 = aureliaOrm.type;

exports.Service = class Service {
    constructor(EntityManager) {
        this.EntityManager = EntityManager;
        this.entity = '';
    }
    get(id = undefined) {
        if (id) {
            return this.EntityManager.getRepository(this.entity).find(id);
        }
        return this.EntityManager.getRepository(this.entity).find();
    }
    getAll(filters = {}) {
        return this.EntityManager.getRepository(this.entity).find(filters);
    }
};
exports.Service = __decorate([
    autoinject,
    __metadata("design:paramtypes", [aureliaOrm_2])
], exports.Service);

/**
 * The code was extracted from:
 * https://github.com/davidchambers/Base64.js
 */

var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

function InvalidCharacterError(message) {
  this.message = message;
}

InvalidCharacterError.prototype = new Error();
InvalidCharacterError.prototype.name = 'InvalidCharacterError';

function polyfill (input) {
  var str = String(input).replace(/=+$/, '');
  if (str.length % 4 == 1) {
    throw new InvalidCharacterError("'atob' failed: The string to be decoded is not correctly encoded.");
  }
  for (
    // initialize result and counters
    var bc = 0, bs, buffer, idx = 0, output = '';
    // get next character
    buffer = str.charAt(idx++);
    // character found in table? initialize bit storage and add its ascii value;
    ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer,
      // and if not first of each 4 characters,
      // convert the first 8 bits to one ascii character
      bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0
  ) {
    // try to find character in table (0-63, not found => -1)
    buffer = chars.indexOf(buffer);
  }
  return output;
}


var atob = typeof window !== 'undefined' && window.atob && window.atob.bind(window) || polyfill;

function b64DecodeUnicode(str) {
  return decodeURIComponent(atob(str).replace(/(.)/g, function (m, p) {
    var code = p.charCodeAt(0).toString(16).toUpperCase();
    if (code.length < 2) {
      code = '0' + code;
    }
    return '%' + code;
  }));
}

var base64_url_decode = function(str) {
  var output = str.replace(/-/g, "+").replace(/_/g, "/");
  switch (output.length % 4) {
    case 0:
      break;
    case 2:
      output += "==";
      break;
    case 3:
      output += "=";
      break;
    default:
      throw "Illegal base64url string!";
  }

  try{
    return b64DecodeUnicode(output);
  } catch (err) {
    return atob(output);
  }
};

function InvalidTokenError(message) {
  this.message = message;
}

InvalidTokenError.prototype = new Error();
InvalidTokenError.prototype.name = 'InvalidTokenError';

var lib = function (token,options) {
  if (typeof token !== 'string') {
    throw new InvalidTokenError('Invalid token specified');
  }

  options = options || {};
  var pos = options.header === true ? 0 : 1;
  try {
    return JSON.parse(base64_url_decode(token.split('.')[pos]));
  } catch (e) {
    throw new InvalidTokenError('Invalid token specified: ' + e.message);
  }
};

var InvalidTokenError_1 = InvalidTokenError;
lib.InvalidTokenError = InvalidTokenError_1;

var logger$3 = getLogger('event-aggregator');

var Handler = function () {
  function Handler(messageType, callback) {
    

    this.messageType = messageType;
    this.callback = callback;
  }

  Handler.prototype.handle = function handle(message) {
    if (message instanceof this.messageType) {
      this.callback.call(null, message);
    }
  };

  return Handler;
}();

function invokeCallback(callback, data, event) {
  try {
    callback(data, event);
  } catch (e) {
    logger$3.error(e);
  }
}

function invokeHandler(handler, data) {
  try {
    handler.handle(data);
  } catch (e) {
    logger$3.error(e);
  }
}

var EventAggregator = function () {
  function EventAggregator() {
    

    this.eventLookup = {};
    this.messageHandlers = [];
  }

  EventAggregator.prototype.publish = function publish(event, data) {
    var subscribers = void 0;
    var i = void 0;

    if (!event) {
      throw new Error('Event was invalid.');
    }

    if (typeof event === 'string') {
      subscribers = this.eventLookup[event];
      if (subscribers) {
        subscribers = subscribers.slice();
        i = subscribers.length;

        while (i--) {
          invokeCallback(subscribers[i], data, event);
        }
      }
    } else {
      subscribers = this.messageHandlers.slice();
      i = subscribers.length;

      while (i--) {
        invokeHandler(subscribers[i], event);
      }
    }
  };

  EventAggregator.prototype.subscribe = function subscribe(event, callback) {
    var handler = void 0;
    var subscribers = void 0;

    if (!event) {
      throw new Error('Event channel/type was invalid.');
    }

    if (typeof event === 'string') {
      handler = callback;
      subscribers = this.eventLookup[event] || (this.eventLookup[event] = []);
    } else {
      handler = new Handler(event, callback);
      subscribers = this.messageHandlers;
    }

    subscribers.push(handler);

    return {
      dispose: function dispose() {
        var idx = subscribers.indexOf(handler);
        if (idx !== -1) {
          subscribers.splice(idx, 1);
        }
      }
    };
  };

  EventAggregator.prototype.subscribeOnce = function subscribeOnce(event, callback) {
    var sub = this.subscribe(event, function (a, b) {
      sub.dispose();
      return callback(a, b);
    });

    return sub;
  };

  return EventAggregator;
}();

function includeEventsIn(obj) {
  var ea = new EventAggregator();

  obj.subscribeOnce = function (event, callback) {
    return ea.subscribeOnce(event, callback);
  };

  obj.subscribe = function (event, callback) {
    return ea.subscribe(event, callback);
  };

  obj.publish = function (event, data) {
    ea.publish(event, data);
  };

  return ea;
}

function configure$1(config) {
  config.instance(EventAggregator, includeEventsIn(config.aurelia));
}

var aureliaEventAggregator = /*#__PURE__*/Object.freeze({
    EventAggregator: EventAggregator,
    includeEventsIn: includeEventsIn,
    configure: configure$1
});

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */

function __decorate$3(decorators$$1, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators$$1, target, key, desc);
    else for (var i = decorators$$1.length - 1; i >= 0; i--) if (d = decorators$$1[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}

var ActivationStrategy;
(function (ActivationStrategy) {
    ActivationStrategy["InvokeLifecycle"] = "invoke-lifecycle";
    ActivationStrategy["Replace"] = "replace";
})(ActivationStrategy || (ActivationStrategy = {}));
let Compose = class Compose {
    constructor(element, container, compositionEngine, viewSlot, viewResources$$1, taskQueue) {
        this.activationStrategy = ActivationStrategy.InvokeLifecycle;
        this.element = element;
        this.container = container;
        this.compositionEngine = compositionEngine;
        this.viewSlot = viewSlot;
        this.viewResources = viewResources$$1;
        this.taskQueue = taskQueue;
        this.currentController = null;
        this.currentViewModel = null;
        this.changes = Object.create(null);
    }
    static inject() {
        return [DOM.Element, Container, CompositionEngine, ViewSlot, ViewResources, TaskQueue];
    }
    created(owningView) {
        this.owningView = owningView;
    }
    bind(bindingContext, overrideContext) {
        this.bindingContext = bindingContext;
        this.overrideContext = overrideContext;
        let changes = this.changes;
        changes.view = this.view;
        changes.viewModel = this.viewModel;
        changes.model = this.model;
        if (!this.pendingTask) {
            processChanges(this);
        }
    }
    unbind() {
        this.changes = Object.create(null);
        this.bindingContext = null;
        this.overrideContext = null;
        let returnToCache = true;
        let skipAnimation = true;
        this.viewSlot.removeAll(returnToCache, skipAnimation);
    }
    modelChanged(newValue, oldValue) {
        this.changes.model = newValue;
        requestUpdate(this);
    }
    viewChanged(newValue, oldValue) {
        this.changes.view = newValue;
        requestUpdate(this);
    }
    viewModelChanged(newValue, oldValue) {
        this.changes.viewModel = newValue;
        requestUpdate(this);
    }
};
__decorate$3([
    bindable
], Compose.prototype, "model", void 0);
__decorate$3([
    bindable
], Compose.prototype, "view", void 0);
__decorate$3([
    bindable
], Compose.prototype, "viewModel", void 0);
__decorate$3([
    bindable
], Compose.prototype, "activationStrategy", void 0);
__decorate$3([
    bindable
], Compose.prototype, "swapOrder", void 0);
Compose = __decorate$3([
    noView,
    customElement('compose')
], Compose);
function isEmpty(obj) {
    for (const _ in obj) {
        return false;
    }
    return true;
}
function tryActivateViewModel$1(vm, model) {
    if (vm && typeof vm.activate === 'function') {
        return Promise.resolve(vm.activate(model));
    }
}
function createInstruction(composer, instruction) {
    return Object.assign(instruction, {
        bindingContext: composer.bindingContext,
        overrideContext: composer.overrideContext,
        owningView: composer.owningView,
        container: composer.container,
        viewSlot: composer.viewSlot,
        viewResources: composer.viewResources,
        currentController: composer.currentController,
        host: composer.element,
        swapOrder: composer.swapOrder
    });
}
function processChanges(composer) {
    const changes = composer.changes;
    composer.changes = Object.create(null);
    if (needsReInitialization(composer, changes)) {
        let instruction = {
            view: composer.view,
            viewModel: composer.currentViewModel || composer.viewModel,
            model: composer.model
        };
        instruction = Object.assign(instruction, changes);
        instruction = createInstruction(composer, instruction);
        composer.pendingTask = composer.compositionEngine.compose(instruction).then(controller => {
            composer.currentController = controller;
            composer.currentViewModel = controller ? controller.viewModel : null;
        });
    }
    else {
        composer.pendingTask = tryActivateViewModel$1(composer.currentViewModel, changes.model);
        if (!composer.pendingTask) {
            return;
        }
    }
    composer.pendingTask = composer.pendingTask
        .then(() => {
        completeCompositionTask(composer);
    }, reason => {
        completeCompositionTask(composer);
        throw reason;
    });
}
function completeCompositionTask(composer) {
    composer.pendingTask = null;
    if (!isEmpty(composer.changes)) {
        processChanges(composer);
    }
}
function requestUpdate(composer) {
    if (composer.pendingTask || composer.updateRequested) {
        return;
    }
    composer.updateRequested = true;
    composer.taskQueue.queueMicroTask(() => {
        composer.updateRequested = false;
        processChanges(composer);
    });
}
function needsReInitialization(composer, changes) {
    let activationStrategy = composer.activationStrategy;
    const vm = composer.currentViewModel;
    if (vm && typeof vm.determineActivationStrategy === 'function') {
        activationStrategy = vm.determineActivationStrategy();
    }
    return 'view' in changes
        || 'viewModel' in changes
        || activationStrategy === ActivationStrategy.Replace;
}

class IfCore {
    constructor(viewFactory, viewSlot) {
        this.viewFactory = viewFactory;
        this.viewSlot = viewSlot;
        this.view = null;
        this.bindingContext = null;
        this.overrideContext = null;
        this.showing = false;
        this.cache = true;
    }
    bind(bindingContext, overrideContext) {
        this.bindingContext = bindingContext;
        this.overrideContext = overrideContext;
    }
    unbind() {
        if (this.view === null) {
            return;
        }
        this.view.unbind();
        if (!this.viewFactory.isCaching) {
            return;
        }
        if (this.showing) {
            this.showing = false;
            this.viewSlot.remove(this.view, true, true);
        }
        else {
            this.view.returnToCache();
        }
        this.view = null;
    }
    _show() {
        if (this.showing) {
            if (!this.view.isBound) {
                this.view.bind(this.bindingContext, this.overrideContext);
            }
            return;
        }
        if (this.view === null) {
            this.view = this.viewFactory.create();
        }
        if (!this.view.isBound) {
            this.view.bind(this.bindingContext, this.overrideContext);
        }
        this.showing = true;
        return this.viewSlot.add(this.view);
    }
    _hide() {
        if (!this.showing) {
            return;
        }
        this.showing = false;
        let removed = this.viewSlot.remove(this.view);
        if (removed instanceof Promise) {
            return removed.then(() => {
                this._unbindView();
            });
        }
        this._unbindView();
    }
    _unbindView() {
        const cache = this.cache === 'false' ? false : !!this.cache;
        this.view.unbind();
        if (!cache) {
            this.view = null;
        }
    }
}

let If = class If extends IfCore {
    constructor() {
        super(...arguments);
        this.cache = true;
    }
    bind(bindingContext, overrideContext) {
        super.bind(bindingContext, overrideContext);
        if (this.condition) {
            this._show();
        }
        else {
            this._hide();
        }
    }
    conditionChanged(newValue) {
        this._update(newValue);
    }
    _update(show) {
        if (this.animating) {
            return;
        }
        let promise;
        if (this.elseVm) {
            promise = show ? this._swap(this.elseVm, this) : this._swap(this, this.elseVm);
        }
        else {
            promise = show ? this._show() : this._hide();
        }
        if (promise) {
            this.animating = true;
            promise.then(() => {
                this.animating = false;
                if (this.condition !== this.showing) {
                    this._update(this.condition);
                }
            });
        }
    }
    _swap(remove, add) {
        switch (this.swapOrder) {
            case 'before':
                return Promise.resolve(add._show()).then(() => remove._hide());
            case 'with':
                return Promise.all([remove._hide(), add._show()]);
            default:
                let promise = remove._hide();
                return promise ? promise.then(() => add._show()) : add._show();
        }
    }
};
__decorate$3([
    bindable({ primaryProperty: true })
], If.prototype, "condition", void 0);
__decorate$3([
    bindable
], If.prototype, "swapOrder", void 0);
__decorate$3([
    bindable
], If.prototype, "cache", void 0);
If = __decorate$3([
    customAttribute('if'),
    templateController,
    inject(BoundViewFactory, ViewSlot)
], If);

let Else = class Else extends IfCore {
    constructor(viewFactory, viewSlot) {
        super(viewFactory, viewSlot);
        this._registerInIf();
    }
    bind(bindingContext, overrideContext) {
        super.bind(bindingContext, overrideContext);
        if (this.ifVm.condition) {
            this._hide();
        }
        else {
            this._show();
        }
    }
    _registerInIf() {
        let previous = this.viewSlot.anchor.previousSibling;
        while (previous && !previous.au) {
            previous = previous.previousSibling;
        }
        if (!previous || !previous.au.if) {
            throw new Error("Can't find matching If for Else custom attribute.");
        }
        this.ifVm = previous.au.if.viewModel;
        this.ifVm.elseVm = this;
    }
};
Else = __decorate$3([
    customAttribute('else'),
    templateController,
    inject(BoundViewFactory, ViewSlot)
], Else);

let With = class With {
    constructor(viewFactory, viewSlot) {
        this.viewFactory = viewFactory;
        this.viewSlot = viewSlot;
        this.parentOverrideContext = null;
        this.view = null;
    }
    bind(bindingContext, overrideContext) {
        this.parentOverrideContext = overrideContext;
        this.valueChanged(this.value);
    }
    valueChanged(newValue) {
        let overrideContext = createOverrideContext(newValue, this.parentOverrideContext);
        let view$$1 = this.view;
        if (!view$$1) {
            view$$1 = this.view = this.viewFactory.create();
            view$$1.bind(newValue, overrideContext);
            this.viewSlot.add(view$$1);
        }
        else {
            view$$1.bind(newValue, overrideContext);
        }
    }
    unbind() {
        let view$$1 = this.view;
        this.parentOverrideContext = null;
        if (view$$1) {
            view$$1.unbind();
        }
    }
};
With = __decorate$3([
    customAttribute('with'),
    templateController,
    inject(BoundViewFactory, ViewSlot)
], With);

const oneTime = bindingMode.oneTime;
function updateOverrideContexts(views, startIndex) {
    let length = views.length;
    if (startIndex > 0) {
        startIndex = startIndex - 1;
    }
    for (; startIndex < length; ++startIndex) {
        updateOverrideContext(views[startIndex].overrideContext, startIndex, length);
    }
}
function createFullOverrideContext(repeat, data, index, length, key) {
    let bindingContext = {};
    let overrideContext = createOverrideContext(bindingContext, repeat.scope.overrideContext);
    if (typeof key !== 'undefined') {
        bindingContext[repeat.key] = key;
        bindingContext[repeat.value] = data;
    }
    else {
        bindingContext[repeat.local] = data;
    }
    updateOverrideContext(overrideContext, index, length);
    return overrideContext;
}
function updateOverrideContext(overrideContext, index, length) {
    let first = (index === 0);
    let last = (index === length - 1);
    let even = index % 2 === 0;
    overrideContext.$index = index;
    overrideContext.$first = first;
    overrideContext.$last = last;
    overrideContext.$middle = !(first || last);
    overrideContext.$odd = !even;
    overrideContext.$even = even;
}
function getItemsSourceExpression(instruction, attrName) {
    return instruction.behaviorInstructions
        .filter(bi => bi.originalAttrName === attrName)[0]
        .attributes
        .items
        .sourceExpression;
}
function unwrapExpression(expression) {
    let unwrapped = false;
    while (expression instanceof BindingBehavior) {
        expression = expression.expression;
    }
    while (expression instanceof ValueConverter) {
        expression = expression.expression;
        unwrapped = true;
    }
    return unwrapped ? expression : null;
}
function isOneTime(expression) {
    while (expression instanceof BindingBehavior) {
        if (expression.name === 'oneTime') {
            return true;
        }
        expression = expression.expression;
    }
    return false;
}
function updateOneTimeBinding(binding) {
    if (binding.call && binding.mode === oneTime) {
        binding.call(sourceContext);
    }
    else if (binding.updateOneTimeBindings) {
        binding.updateOneTimeBindings();
    }
}
function indexOf(array, item, matcher, startIndex) {
    if (!matcher) {
        return array.indexOf(item);
    }
    const length = array.length;
    for (let index = startIndex || 0; index < length; index++) {
        if (matcher(array[index], item)) {
            return index;
        }
    }
    return -1;
}

class ArrayRepeatStrategy {
    getCollectionObserver(observerLocator, items) {
        return observerLocator.getArrayObserver(items);
    }
    instanceChanged(repeat, items) {
        const $repeat = repeat;
        const itemsLength = items.length;
        if (!items || itemsLength === 0) {
            $repeat.removeAllViews(true, !$repeat.viewsRequireLifecycle);
            return;
        }
        const children$$1 = $repeat.views();
        const viewsLength = children$$1.length;
        if (viewsLength === 0) {
            this._standardProcessInstanceChanged($repeat, items);
            return;
        }
        if ($repeat.viewsRequireLifecycle) {
            const childrenSnapshot = children$$1.slice(0);
            const itemNameInBindingContext = $repeat.local;
            const matcher = $repeat.matcher();
            let itemsPreviouslyInViews = [];
            const viewsToRemove = [];
            for (let index = 0; index < viewsLength; index++) {
                const view$$1 = childrenSnapshot[index];
                const oldItem = view$$1.bindingContext[itemNameInBindingContext];
                if (indexOf(items, oldItem, matcher) === -1) {
                    viewsToRemove.push(view$$1);
                }
                else {
                    itemsPreviouslyInViews.push(oldItem);
                }
            }
            let updateViews;
            let removePromise;
            if (itemsPreviouslyInViews.length > 0) {
                removePromise = $repeat.removeViews(viewsToRemove, true, !$repeat.viewsRequireLifecycle);
                updateViews = () => {
                    for (let index = 0; index < itemsLength; index++) {
                        const item = items[index];
                        const indexOfView = indexOf(itemsPreviouslyInViews, item, matcher, index);
                        let view$$1;
                        if (indexOfView === -1) {
                            const overrideContext = createFullOverrideContext($repeat, items[index], index, itemsLength);
                            $repeat.insertView(index, overrideContext.bindingContext, overrideContext);
                            itemsPreviouslyInViews.splice(index, 0, undefined);
                        }
                        else if (indexOfView === index) {
                            view$$1 = children$$1[indexOfView];
                            itemsPreviouslyInViews[indexOfView] = undefined;
                        }
                        else {
                            view$$1 = children$$1[indexOfView];
                            $repeat.moveView(indexOfView, index);
                            itemsPreviouslyInViews.splice(indexOfView, 1);
                            itemsPreviouslyInViews.splice(index, 0, undefined);
                        }
                        if (view$$1) {
                            updateOverrideContext(view$$1.overrideContext, index, itemsLength);
                        }
                    }
                    this._inPlaceProcessItems($repeat, items);
                };
            }
            else {
                removePromise = $repeat.removeAllViews(true, !$repeat.viewsRequireLifecycle);
                updateViews = () => this._standardProcessInstanceChanged($repeat, items);
            }
            if (removePromise instanceof Promise) {
                removePromise.then(updateViews);
            }
            else {
                updateViews();
            }
        }
        else {
            this._inPlaceProcessItems($repeat, items);
        }
    }
    _standardProcessInstanceChanged(repeat, items) {
        for (let i = 0, ii = items.length; i < ii; i++) {
            let overrideContext = createFullOverrideContext(repeat, items[i], i, ii);
            repeat.addView(overrideContext.bindingContext, overrideContext);
        }
    }
    _inPlaceProcessItems(repeat, items) {
        let itemsLength = items.length;
        let viewsLength = repeat.viewCount();
        while (viewsLength > itemsLength) {
            viewsLength--;
            repeat.removeView(viewsLength, true, !repeat.viewsRequireLifecycle);
        }
        let local = repeat.local;
        for (let i = 0; i < viewsLength; i++) {
            let view$$1 = repeat.view(i);
            let last = i === itemsLength - 1;
            let middle = i !== 0 && !last;
            let bindingContext = view$$1.bindingContext;
            let overrideContext = view$$1.overrideContext;
            if (bindingContext[local] === items[i]
                && overrideContext.$middle === middle
                && overrideContext.$last === last) {
                continue;
            }
            bindingContext[local] = items[i];
            overrideContext.$middle = middle;
            overrideContext.$last = last;
            repeat.updateBindings(view$$1);
        }
        for (let i = viewsLength; i < itemsLength; i++) {
            let overrideContext = createFullOverrideContext(repeat, items[i], i, itemsLength);
            repeat.addView(overrideContext.bindingContext, overrideContext);
        }
    }
    instanceMutated(repeat, array, splices) {
        if (repeat.__queuedSplices) {
            for (let i = 0, ii = splices.length; i < ii; ++i) {
                let { index, removed, addedCount } = splices[i];
                mergeSplice(repeat.__queuedSplices, index, removed, addedCount);
            }
            repeat.__array = array.slice(0);
            return;
        }
        let maybePromise = this._runSplices(repeat, array.slice(0), splices);
        if (maybePromise instanceof Promise) {
            let queuedSplices = repeat.__queuedSplices = [];
            let runQueuedSplices = () => {
                if (!queuedSplices.length) {
                    repeat.__queuedSplices = undefined;
                    repeat.__array = undefined;
                    return;
                }
                let nextPromise = this._runSplices(repeat, repeat.__array, queuedSplices) || Promise.resolve();
                queuedSplices = repeat.__queuedSplices = [];
                nextPromise.then(runQueuedSplices);
            };
            maybePromise.then(runQueuedSplices);
        }
    }
    _runSplices(repeat, array, splices) {
        let removeDelta = 0;
        let rmPromises = [];
        for (let i = 0, ii = splices.length; i < ii; ++i) {
            let splice = splices[i];
            let removed = splice.removed;
            for (let j = 0, jj = removed.length; j < jj; ++j) {
                let viewOrPromise = repeat.removeView(splice.index + removeDelta + rmPromises.length, true);
                if (viewOrPromise instanceof Promise) {
                    rmPromises.push(viewOrPromise);
                }
            }
            removeDelta -= splice.addedCount;
        }
        if (rmPromises.length > 0) {
            return Promise.all(rmPromises).then(() => {
                let spliceIndexLow = this._handleAddedSplices(repeat, array, splices);
                updateOverrideContexts(repeat.views(), spliceIndexLow);
            });
        }
        let spliceIndexLow = this._handleAddedSplices(repeat, array, splices);
        updateOverrideContexts(repeat.views(), spliceIndexLow);
        return undefined;
    }
    _handleAddedSplices(repeat, array, splices) {
        let spliceIndex;
        let spliceIndexLow;
        let arrayLength = array.length;
        for (let i = 0, ii = splices.length; i < ii; ++i) {
            let splice = splices[i];
            let addIndex = spliceIndex = splice.index;
            let end = splice.index + splice.addedCount;
            if (typeof spliceIndexLow === 'undefined' || spliceIndexLow === null || spliceIndexLow > splice.index) {
                spliceIndexLow = spliceIndex;
            }
            for (; addIndex < end; ++addIndex) {
                let overrideContext = createFullOverrideContext(repeat, array[addIndex], addIndex, arrayLength);
                repeat.insertView(addIndex, overrideContext.bindingContext, overrideContext);
            }
        }
        return spliceIndexLow;
    }
}

class MapRepeatStrategy {
    getCollectionObserver(observerLocator, items) {
        return observerLocator.getMapObserver(items);
    }
    instanceChanged(repeat, items) {
        let removePromise = repeat.removeAllViews(true, !repeat.viewsRequireLifecycle);
        if (removePromise instanceof Promise) {
            removePromise.then(() => this._standardProcessItems(repeat, items));
            return;
        }
        this._standardProcessItems(repeat, items);
    }
    _standardProcessItems(repeat, items) {
        let index = 0;
        let overrideContext;
        items.forEach((value, key) => {
            overrideContext = createFullOverrideContext(repeat, value, index, items.size, key);
            repeat.addView(overrideContext.bindingContext, overrideContext);
            ++index;
        });
    }
    instanceMutated(repeat, map, records) {
        let key;
        let i;
        let ii;
        let overrideContext;
        let removeIndex;
        let addIndex;
        let record;
        let rmPromises = [];
        let viewOrPromise;
        for (i = 0, ii = records.length; i < ii; ++i) {
            record = records[i];
            key = record.key;
            switch (record.type) {
                case 'update':
                    removeIndex = this._getViewIndexByKey(repeat, key);
                    viewOrPromise = repeat.removeView(removeIndex, true, !repeat.viewsRequireLifecycle);
                    if (viewOrPromise instanceof Promise) {
                        rmPromises.push(viewOrPromise);
                    }
                    overrideContext = createFullOverrideContext(repeat, map.get(key), removeIndex, map.size, key);
                    repeat.insertView(removeIndex, overrideContext.bindingContext, overrideContext);
                    break;
                case 'add':
                    addIndex = repeat.viewCount() <= map.size - 1 ? repeat.viewCount() : map.size - 1;
                    overrideContext = createFullOverrideContext(repeat, map.get(key), addIndex, map.size, key);
                    repeat.insertView(map.size - 1, overrideContext.bindingContext, overrideContext);
                    break;
                case 'delete':
                    if (record.oldValue === undefined) {
                        return;
                    }
                    removeIndex = this._getViewIndexByKey(repeat, key);
                    viewOrPromise = repeat.removeView(removeIndex, true, !repeat.viewsRequireLifecycle);
                    if (viewOrPromise instanceof Promise) {
                        rmPromises.push(viewOrPromise);
                    }
                    break;
                case 'clear':
                    repeat.removeAllViews(true, !repeat.viewsRequireLifecycle);
                    break;
                default:
                    continue;
            }
        }
        if (rmPromises.length > 0) {
            Promise.all(rmPromises).then(() => {
                updateOverrideContexts(repeat.views(), 0);
            });
        }
        else {
            updateOverrideContexts(repeat.views(), 0);
        }
    }
    _getViewIndexByKey(repeat, key) {
        let i;
        let ii;
        let child$$1;
        for (i = 0, ii = repeat.viewCount(); i < ii; ++i) {
            child$$1 = repeat.view(i);
            if (child$$1.bindingContext[repeat.key] === key) {
                return i;
            }
        }
        return undefined;
    }
}

class NullRepeatStrategy {
    instanceChanged(repeat, items) {
        repeat.removeAllViews(true);
    }
    getCollectionObserver(observerLocator, items) {
    }
}

class NumberRepeatStrategy {
    getCollectionObserver() {
        return null;
    }
    instanceChanged(repeat, value) {
        let removePromise = repeat.removeAllViews(true, !repeat.viewsRequireLifecycle);
        if (removePromise instanceof Promise) {
            removePromise.then(() => this._standardProcessItems(repeat, value));
            return;
        }
        this._standardProcessItems(repeat, value);
    }
    _standardProcessItems(repeat, value) {
        let childrenLength = repeat.viewCount();
        let i;
        let ii;
        let overrideContext;
        let viewsToRemove;
        value = Math.floor(value);
        viewsToRemove = childrenLength - value;
        if (viewsToRemove > 0) {
            if (viewsToRemove > childrenLength) {
                viewsToRemove = childrenLength;
            }
            for (i = 0, ii = viewsToRemove; i < ii; ++i) {
                repeat.removeView(childrenLength - (i + 1), true, !repeat.viewsRequireLifecycle);
            }
            return;
        }
        for (i = childrenLength, ii = value; i < ii; ++i) {
            overrideContext = createFullOverrideContext(repeat, i, i, ii);
            repeat.addView(overrideContext.bindingContext, overrideContext);
        }
        updateOverrideContexts(repeat.views(), 0);
    }
}

class SetRepeatStrategy {
    getCollectionObserver(observerLocator, items) {
        return observerLocator.getSetObserver(items);
    }
    instanceChanged(repeat, items) {
        let removePromise = repeat.removeAllViews(true, !repeat.viewsRequireLifecycle);
        if (removePromise instanceof Promise) {
            removePromise.then(() => this._standardProcessItems(repeat, items));
            return;
        }
        this._standardProcessItems(repeat, items);
    }
    _standardProcessItems(repeat, items) {
        let index = 0;
        let overrideContext;
        items.forEach(value => {
            overrideContext = createFullOverrideContext(repeat, value, index, items.size);
            repeat.addView(overrideContext.bindingContext, overrideContext);
            ++index;
        });
    }
    instanceMutated(repeat, set, records) {
        let value;
        let i;
        let ii;
        let overrideContext;
        let removeIndex;
        let record;
        let rmPromises = [];
        let viewOrPromise;
        for (i = 0, ii = records.length; i < ii; ++i) {
            record = records[i];
            value = record.value;
            switch (record.type) {
                case 'add':
                    let size = Math.max(set.size - 1, 0);
                    overrideContext = createFullOverrideContext(repeat, value, size, set.size);
                    repeat.insertView(size, overrideContext.bindingContext, overrideContext);
                    break;
                case 'delete':
                    removeIndex = this._getViewIndexByValue(repeat, value);
                    viewOrPromise = repeat.removeView(removeIndex, true, !repeat.viewsRequireLifecycle);
                    if (viewOrPromise instanceof Promise) {
                        rmPromises.push(viewOrPromise);
                    }
                    break;
                case 'clear':
                    repeat.removeAllViews(true, !repeat.viewsRequireLifecycle);
                    break;
                default:
                    continue;
            }
        }
        if (rmPromises.length > 0) {
            Promise.all(rmPromises).then(() => {
                updateOverrideContexts(repeat.views(), 0);
            });
        }
        else {
            updateOverrideContexts(repeat.views(), 0);
        }
    }
    _getViewIndexByValue(repeat, value) {
        let i;
        let ii;
        let child$$1;
        for (i = 0, ii = repeat.viewCount(); i < ii; ++i) {
            child$$1 = repeat.view(i);
            if (child$$1.bindingContext[repeat.local] === value) {
                return i;
            }
        }
        return undefined;
    }
}

class RepeatStrategyLocator {
    constructor() {
        this.matchers = [];
        this.strategies = [];
        this.addStrategy(items => items === null || items === undefined, new NullRepeatStrategy());
        this.addStrategy(items => items instanceof Array, new ArrayRepeatStrategy());
        this.addStrategy(items => items instanceof Map, new MapRepeatStrategy());
        this.addStrategy(items => items instanceof Set, new SetRepeatStrategy());
        this.addStrategy(items => typeof items === 'number', new NumberRepeatStrategy());
    }
    addStrategy(matcher, strategy) {
        this.matchers.push(matcher);
        this.strategies.push(strategy);
    }
    getStrategy(items) {
        let matchers = this.matchers;
        for (let i = 0, ii = matchers.length; i < ii; ++i) {
            if (matchers[i](items)) {
                return this.strategies[i];
            }
        }
        return null;
    }
}

const lifecycleOptionalBehaviors = ['focus', 'if', 'else', 'repeat', 'show', 'hide', 'with'];
function behaviorRequiresLifecycle(instruction) {
    let t = instruction.type;
    let name = t.elementName !== null ? t.elementName : t.attributeName;
    return lifecycleOptionalBehaviors.indexOf(name) === -1 && (t.handlesAttached || t.handlesBind || t.handlesCreated || t.handlesDetached || t.handlesUnbind)
        || t.viewFactory && viewsRequireLifecycle(t.viewFactory)
        || instruction.viewFactory && viewsRequireLifecycle(instruction.viewFactory);
}
function targetRequiresLifecycle(instruction) {
    let behaviors = instruction.behaviorInstructions;
    if (behaviors) {
        let i = behaviors.length;
        while (i--) {
            if (behaviorRequiresLifecycle(behaviors[i])) {
                return true;
            }
        }
    }
    return instruction.viewFactory && viewsRequireLifecycle(instruction.viewFactory);
}
function viewsRequireLifecycle(viewFactory) {
    if ('_viewsRequireLifecycle' in viewFactory) {
        return viewFactory._viewsRequireLifecycle;
    }
    viewFactory._viewsRequireLifecycle = false;
    if (viewFactory.viewFactory) {
        viewFactory._viewsRequireLifecycle = viewsRequireLifecycle(viewFactory.viewFactory);
        return viewFactory._viewsRequireLifecycle;
    }
    if (viewFactory.template.querySelector('.au-animate')) {
        viewFactory._viewsRequireLifecycle = true;
        return true;
    }
    for (let id in viewFactory.instructions) {
        if (targetRequiresLifecycle(viewFactory.instructions[id])) {
            viewFactory._viewsRequireLifecycle = true;
            return true;
        }
    }
    viewFactory._viewsRequireLifecycle = false;
    return false;
}

class AbstractRepeater {
    constructor(options) {
        Object.assign(this, {
            local: 'items',
            viewsRequireLifecycle: true
        }, options);
    }
    viewCount() {
        throw new Error('subclass must implement `viewCount`');
    }
    views() {
        throw new Error('subclass must implement `views`');
    }
    view(index) {
        throw new Error('subclass must implement `view`');
    }
    matcher() {
        throw new Error('subclass must implement `matcher`');
    }
    addView(bindingContext, overrideContext) {
        throw new Error('subclass must implement `addView`');
    }
    insertView(index, bindingContext, overrideContext) {
        throw new Error('subclass must implement `insertView`');
    }
    moveView(sourceIndex, targetIndex) {
        throw new Error('subclass must implement `moveView`');
    }
    removeAllViews(returnToCache, skipAnimation) {
        throw new Error('subclass must implement `removeAllViews`');
    }
    removeViews(viewsToRemove, returnToCache, skipAnimation) {
        throw new Error('subclass must implement `removeView`');
    }
    removeView(index, returnToCache, skipAnimation) {
        throw new Error('subclass must implement `removeView`');
    }
    updateBindings(view$$1) {
        throw new Error('subclass must implement `updateBindings`');
    }
}

var Repeat_1;
let Repeat = Repeat_1 = class Repeat extends AbstractRepeater {
    constructor(viewFactory, instruction, viewSlot, viewResources$$1, observerLocator, strategyLocator) {
        super({
            local: 'item',
            viewsRequireLifecycle: viewsRequireLifecycle(viewFactory)
        });
        this.viewFactory = viewFactory;
        this.instruction = instruction;
        this.viewSlot = viewSlot;
        this.lookupFunctions = viewResources$$1.lookupFunctions;
        this.observerLocator = observerLocator;
        this.key = 'key';
        this.value = 'value';
        this.strategyLocator = strategyLocator;
        this.ignoreMutation = false;
        this.sourceExpression = getItemsSourceExpression(this.instruction, 'repeat.for');
        this.isOneTime = isOneTime(this.sourceExpression);
        this.viewsRequireLifecycle = viewsRequireLifecycle(viewFactory);
    }
    call(context, changes) {
        this[context](this.items, changes);
    }
    bind(bindingContext, overrideContext) {
        this.scope = { bindingContext, overrideContext };
        this.matcherBinding = this._captureAndRemoveMatcherBinding();
        this.itemsChanged();
    }
    unbind() {
        this.scope = null;
        this.items = null;
        this.matcherBinding = null;
        this.viewSlot.removeAll(true, true);
        this._unsubscribeCollection();
    }
    _unsubscribeCollection() {
        if (this.collectionObserver) {
            this.collectionObserver.unsubscribe(this.callContext, this);
            this.collectionObserver = null;
            this.callContext = null;
        }
    }
    itemsChanged() {
        this._unsubscribeCollection();
        if (!this.scope) {
            return;
        }
        let items = this.items;
        this.strategy = this.strategyLocator.getStrategy(items);
        if (!this.strategy) {
            throw new Error(`Value for '${this.sourceExpression}' is non-repeatable`);
        }
        if (!this.isOneTime && !this._observeInnerCollection()) {
            this._observeCollection();
        }
        this.ignoreMutation = true;
        this.strategy.instanceChanged(this, items);
        this.observerLocator.taskQueue.queueMicroTask(() => {
            this.ignoreMutation = false;
        });
    }
    _getInnerCollection() {
        let expression = unwrapExpression(this.sourceExpression);
        if (!expression) {
            return null;
        }
        return expression.evaluate(this.scope, null);
    }
    handleCollectionMutated(collection, changes) {
        if (!this.collectionObserver) {
            return;
        }
        if (this.ignoreMutation) {
            return;
        }
        this.strategy.instanceMutated(this, collection, changes);
    }
    handleInnerCollectionMutated(collection, changes) {
        if (!this.collectionObserver) {
            return;
        }
        if (this.ignoreMutation) {
            return;
        }
        this.ignoreMutation = true;
        let newItems = this.sourceExpression.evaluate(this.scope, this.lookupFunctions);
        this.observerLocator.taskQueue.queueMicroTask(() => this.ignoreMutation = false);
        if (newItems === this.items) {
            this.itemsChanged();
        }
        else {
            this.items = newItems;
        }
    }
    _observeInnerCollection() {
        let items = this._getInnerCollection();
        let strategy = this.strategyLocator.getStrategy(items);
        if (!strategy) {
            return false;
        }
        this.collectionObserver = strategy.getCollectionObserver(this.observerLocator, items);
        if (!this.collectionObserver) {
            return false;
        }
        this.callContext = 'handleInnerCollectionMutated';
        this.collectionObserver.subscribe(this.callContext, this);
        return true;
    }
    _observeCollection() {
        let items = this.items;
        this.collectionObserver = this.strategy.getCollectionObserver(this.observerLocator, items);
        if (this.collectionObserver) {
            this.callContext = 'handleCollectionMutated';
            this.collectionObserver.subscribe(this.callContext, this);
        }
    }
    _captureAndRemoveMatcherBinding() {
        const viewFactory = this.viewFactory.viewFactory;
        if (viewFactory) {
            const template = viewFactory.template;
            const instructions = viewFactory.instructions;
            if (Repeat_1.useInnerMatcher) {
                return extractMatcherBindingExpression(instructions);
            }
            if (template.children.length > 1) {
                return undefined;
            }
            const repeatedElement = template.firstElementChild;
            if (!repeatedElement.hasAttribute('au-target-id')) {
                return undefined;
            }
            const repeatedElementTargetId = repeatedElement.getAttribute('au-target-id');
            return extractMatcherBindingExpression(instructions, repeatedElementTargetId);
        }
        return undefined;
    }
    viewCount() { return this.viewSlot.children.length; }
    views() { return this.viewSlot.children; }
    view(index) { return this.viewSlot.children[index]; }
    matcher() {
        const matcherBinding = this.matcherBinding;
        return matcherBinding
            ? matcherBinding.sourceExpression.evaluate(this.scope, matcherBinding.lookupFunctions)
            : null;
    }
    addView(bindingContext, overrideContext) {
        let view$$1 = this.viewFactory.create();
        view$$1.bind(bindingContext, overrideContext);
        this.viewSlot.add(view$$1);
    }
    insertView(index, bindingContext, overrideContext) {
        let view$$1 = this.viewFactory.create();
        view$$1.bind(bindingContext, overrideContext);
        this.viewSlot.insert(index, view$$1);
    }
    moveView(sourceIndex, targetIndex) {
        this.viewSlot.move(sourceIndex, targetIndex);
    }
    removeAllViews(returnToCache, skipAnimation) {
        return this.viewSlot.removeAll(returnToCache, skipAnimation);
    }
    removeViews(viewsToRemove, returnToCache, skipAnimation) {
        return this.viewSlot.removeMany(viewsToRemove, returnToCache, skipAnimation);
    }
    removeView(index, returnToCache, skipAnimation) {
        return this.viewSlot.removeAt(index, returnToCache, skipAnimation);
    }
    updateBindings(view$$1) {
        const $view = view$$1;
        let j = $view.bindings.length;
        while (j--) {
            updateOneTimeBinding($view.bindings[j]);
        }
        j = $view.controllers.length;
        while (j--) {
            let k = $view.controllers[j].boundProperties.length;
            while (k--) {
                let binding = $view.controllers[j].boundProperties[k].binding;
                updateOneTimeBinding(binding);
            }
        }
    }
};
Repeat.useInnerMatcher = true;
__decorate$3([
    bindable
], Repeat.prototype, "items", void 0);
__decorate$3([
    bindable
], Repeat.prototype, "local", void 0);
__decorate$3([
    bindable
], Repeat.prototype, "key", void 0);
__decorate$3([
    bindable
], Repeat.prototype, "value", void 0);
Repeat = Repeat_1 = __decorate$3([
    customAttribute('repeat'),
    templateController,
    inject(BoundViewFactory, TargetInstruction, ViewSlot, ViewResources, ObserverLocator, RepeatStrategyLocator)
], Repeat);
const extractMatcherBindingExpression = (instructions, targetedElementId) => {
    const instructionIds = Object.keys(instructions);
    for (let i = 0; i < instructionIds.length; i++) {
        const instructionId = instructionIds[i];
        if (targetedElementId !== undefined && instructionId !== targetedElementId) {
            continue;
        }
        const expressions = instructions[instructionId].expressions;
        if (expressions) {
            for (let ii = 0; ii < expressions.length; ii++) {
                if (expressions[ii].targetProperty === 'matcher') {
                    const matcherBindingExpression = expressions[ii];
                    expressions.splice(ii, 1);
                    return matcherBindingExpression;
                }
            }
        }
    }
};

const aureliaHideClassName = 'aurelia-hide';
const aureliaHideClass = `.${aureliaHideClassName} { display:none !important; }`;
function injectAureliaHideStyleAtHead() {
    DOM.injectStyles(aureliaHideClass);
}
function injectAureliaHideStyleAtBoundary(domBoundary) {
    if (FEATURE.shadowDOM && domBoundary && !domBoundary.hasAureliaHideStyle) {
        domBoundary.hasAureliaHideStyle = true;
        DOM.injectStyles(aureliaHideClass, domBoundary);
    }
}

let Show = class Show {
    constructor(element, animator, domBoundary) {
        this.element = element;
        this.animator = animator;
        this.domBoundary = domBoundary;
    }
    static inject() {
        return [DOM.Element, Animator, Optional.of(DOM.boundary, true)];
    }
    created() {
        injectAureliaHideStyleAtBoundary(this.domBoundary);
    }
    valueChanged(newValue) {
        let element = this.element;
        let animator = this.animator;
        if (newValue) {
            animator.removeClass(element, aureliaHideClassName);
        }
        else {
            animator.addClass(element, aureliaHideClassName);
        }
    }
    bind(bindingContext) {
        this.valueChanged(this.value);
    }
};
Show = __decorate$3([
    customAttribute('show')
], Show);

let Hide = class Hide {
    constructor(element, animator, domBoundary) {
        this.element = element;
        this.animator = animator;
        this.domBoundary = domBoundary;
    }
    static inject() {
        return [DOM.Element, Animator, Optional.of(DOM.boundary, true)];
    }
    created() {
        injectAureliaHideStyleAtBoundary(this.domBoundary);
    }
    valueChanged(newValue) {
        if (newValue) {
            this.animator.addClass(this.element, aureliaHideClassName);
        }
        else {
            this.animator.removeClass(this.element, aureliaHideClassName);
        }
    }
    bind(bindingContext) {
        this.valueChanged(this.value);
    }
    value(value) {
        throw new Error('Method not implemented.');
    }
};
Hide = __decorate$3([
    customAttribute('hide')
], Hide);

const SCRIPT_REGEX = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
let needsToWarn = true;
class HTMLSanitizer {
    sanitize(input) {
        if (needsToWarn) {
            needsToWarn = false;
            getLogger('html-sanitizer')
                .warn(`CAUTION: The default HTMLSanitizer does NOT provide security against a wide variety of sophisticated XSS attacks,
and should not be relied on for sanitizing input from unknown sources.
Please see https://aurelia.io/docs/binding/basics#element-content for instructions on how to use a secure solution like DOMPurify or sanitize-html.`);
        }
        return input.replace(SCRIPT_REGEX, '');
    }
}

let SanitizeHTMLValueConverter = class SanitizeHTMLValueConverter {
    constructor(sanitizer) {
        this.sanitizer = sanitizer;
    }
    toView(untrustedMarkup) {
        if (untrustedMarkup === null || untrustedMarkup === undefined) {
            return null;
        }
        return this.sanitizer.sanitize(untrustedMarkup);
    }
};
SanitizeHTMLValueConverter = __decorate$3([
    valueConverter('sanitizeHTML'),
    inject(HTMLSanitizer)
], SanitizeHTMLValueConverter);

let Replaceable = class Replaceable {
    constructor(viewFactory, viewSlot) {
        this.viewFactory = viewFactory;
        this.viewSlot = viewSlot;
        this.view = null;
    }
    bind(bindingContext, overrideContext) {
        if (this.view === null) {
            this.view = this.viewFactory.create();
            this.viewSlot.add(this.view);
        }
        this.view.bind(bindingContext, overrideContext);
    }
    unbind() {
        this.view.unbind();
    }
};
Replaceable = __decorate$3([
    customAttribute('replaceable'),
    templateController,
    inject(BoundViewFactory, ViewSlot)
], Replaceable);

let Focus = class Focus {
    constructor(element, taskQueue) {
        this.element = element;
        this.taskQueue = taskQueue;
        this.isAttached = false;
        this.needsApply = false;
    }
    static inject() {
        return [DOM.Element, TaskQueue];
    }
    valueChanged(newValue) {
        if (this.isAttached) {
            this._apply();
        }
        else {
            this.needsApply = true;
        }
    }
    _apply() {
        if (this.value) {
            this.taskQueue.queueMicroTask(() => {
                if (this.value) {
                    this.element.focus();
                }
            });
        }
        else {
            this.element.blur();
        }
    }
    attached() {
        this.isAttached = true;
        if (this.needsApply) {
            this.needsApply = false;
            this._apply();
        }
        this.element.addEventListener('focus', this);
        this.element.addEventListener('blur', this);
    }
    detached() {
        this.isAttached = false;
        this.element.removeEventListener('focus', this);
        this.element.removeEventListener('blur', this);
    }
    handleEvent(e) {
        if (e.type === 'focus') {
            this.value = true;
        }
        else if (DOM.activeElement !== this.element) {
            this.value = false;
        }
    }
};
Focus = __decorate$3([
    customAttribute('focus', bindingMode.twoWay)
], Focus);

let cssUrlMatcher = /url\((?!['"]data)([^)]+)\)/gi;
function fixupCSSUrls(address, css) {
    if (typeof css !== 'string') {
        throw new Error(`Failed loading required CSS file: ${address}`);
    }
    return css.replace(cssUrlMatcher, (match, p1) => {
        let quote = p1.charAt(0);
        if (quote === '\'' || quote === '"') {
            p1 = p1.substr(1, p1.length - 2);
        }
        return 'url(\'' + relativeToFile(p1, address) + '\')';
    });
}
class CSSResource {
    constructor(address) {
        this.address = address;
        this._scoped = null;
        this._global = false;
        this._alreadyGloballyInjected = false;
    }
    initialize(container, Target) {
        this._scoped = new Target(this);
    }
    register(registry, name) {
        if (name === 'scoped') {
            registry.registerViewEngineHooks(this._scoped);
        }
        else {
            this._global = true;
        }
    }
    load(container) {
        return container.get(Loader)
            .loadText(this.address)
            .catch(err => null)
            .then(text => {
            text = fixupCSSUrls(this.address, text);
            this._scoped.css = text;
            if (this._global) {
                this._alreadyGloballyInjected = true;
                DOM.injectStyles(text);
            }
        });
    }
}
class CSSViewEngineHooks {
    constructor(owner) {
        this.owner = owner;
        this.css = null;
    }
    beforeCompile(content, resources, instruction) {
        if (instruction.targetShadowDOM) {
            DOM.injectStyles(this.css, content, true);
        }
        else if (FEATURE.scopedCSS) {
            let styleNode = DOM.injectStyles(this.css, content, true);
            styleNode.setAttribute('scoped', 'scoped');
        }
        else if (this._global && !this.owner._alreadyGloballyInjected) {
            DOM.injectStyles(this.css);
            this.owner._alreadyGloballyInjected = true;
        }
    }
}
function _createCSSResource(address) {
    let ViewCSS = class ViewCSS extends CSSViewEngineHooks {
    };
    ViewCSS = __decorate$3([
        resource(new CSSResource(address))
    ], ViewCSS);
    return ViewCSS;
}

let AttrBindingBehavior = class AttrBindingBehavior {
    bind(binding, source) {
        binding.targetObserver = new DataAttributeObserver(binding.target, binding.targetProperty);
    }
    unbind(binding, source) {
    }
};
AttrBindingBehavior = __decorate$3([
    bindingBehavior('attr')
], AttrBindingBehavior);

let modeBindingBehavior = {
    bind(binding, source, lookupFunctions) {
        binding.originalMode = binding.mode;
        binding.mode = this.mode;
    },
    unbind(binding, source) {
        binding.mode = binding.originalMode;
        binding.originalMode = null;
    }
};
let OneTimeBindingBehavior = class OneTimeBindingBehavior {
    constructor() {
        this.mode = bindingMode.oneTime;
    }
};
OneTimeBindingBehavior = __decorate$3([
    mixin(modeBindingBehavior),
    bindingBehavior('oneTime')
], OneTimeBindingBehavior);
let OneWayBindingBehavior = class OneWayBindingBehavior {
    constructor() {
        this.mode = bindingMode.toView;
    }
};
OneWayBindingBehavior = __decorate$3([
    mixin(modeBindingBehavior),
    bindingBehavior('oneWay')
], OneWayBindingBehavior);
let ToViewBindingBehavior = class ToViewBindingBehavior {
    constructor() {
        this.mode = bindingMode.toView;
    }
};
ToViewBindingBehavior = __decorate$3([
    mixin(modeBindingBehavior),
    bindingBehavior('toView')
], ToViewBindingBehavior);
let FromViewBindingBehavior = class FromViewBindingBehavior {
    constructor() {
        this.mode = bindingMode.fromView;
    }
};
FromViewBindingBehavior = __decorate$3([
    mixin(modeBindingBehavior),
    bindingBehavior('fromView')
], FromViewBindingBehavior);
let TwoWayBindingBehavior = class TwoWayBindingBehavior {
    constructor() {
        this.mode = bindingMode.twoWay;
    }
};
TwoWayBindingBehavior = __decorate$3([
    mixin(modeBindingBehavior),
    bindingBehavior('twoWay')
], TwoWayBindingBehavior);

function throttle(newValue) {
    let state = this.throttleState;
    let elapsed = +new Date() - state.last;
    if (elapsed >= state.delay) {
        clearTimeout(state.timeoutId);
        state.timeoutId = null;
        state.last = +new Date();
        this.throttledMethod(newValue);
        return;
    }
    state.newValue = newValue;
    if (state.timeoutId === null) {
        state.timeoutId = setTimeout(() => {
            state.timeoutId = null;
            state.last = +new Date();
            this.throttledMethod(state.newValue);
        }, state.delay - elapsed);
    }
}
let ThrottleBindingBehavior = class ThrottleBindingBehavior {
    bind(binding, source, delay = 200) {
        let methodToThrottle = 'updateTarget';
        if (binding.callSource) {
            methodToThrottle = 'callSource';
        }
        else if (binding.updateSource && binding.mode === bindingMode.twoWay) {
            methodToThrottle = 'updateSource';
        }
        binding.throttledMethod = binding[methodToThrottle];
        binding.throttledMethod.originalName = methodToThrottle;
        binding[methodToThrottle] = throttle;
        binding.throttleState = {
            delay: delay,
            last: 0,
            timeoutId: null
        };
    }
    unbind(binding, source) {
        let methodToRestore = binding.throttledMethod.originalName;
        binding[methodToRestore] = binding.throttledMethod;
        binding.throttledMethod = null;
        clearTimeout(binding.throttleState.timeoutId);
        binding.throttleState = null;
    }
};
ThrottleBindingBehavior = __decorate$3([
    bindingBehavior('throttle')
], ThrottleBindingBehavior);

const unset = {};
function debounceCallSource(event) {
    const state = this.debounceState;
    clearTimeout(state.timeoutId);
    state.timeoutId = setTimeout(() => this.debouncedMethod(event), state.delay);
}
function debounceCall(context, newValue, oldValue) {
    const state = this.debounceState;
    clearTimeout(state.timeoutId);
    if (context !== state.callContextToDebounce) {
        state.oldValue = unset;
        this.debouncedMethod(context, newValue, oldValue);
        return;
    }
    if (state.oldValue === unset) {
        state.oldValue = oldValue;
    }
    state.timeoutId = setTimeout(() => {
        const _oldValue = state.oldValue;
        state.oldValue = unset;
        this.debouncedMethod(context, newValue, _oldValue);
    }, state.delay);
}
let DebounceBindingBehavior = class DebounceBindingBehavior {
    bind(binding, source, delay = 200) {
        const isCallSource = binding.callSource !== undefined;
        const methodToDebounce = isCallSource ? 'callSource' : 'call';
        const debouncer = isCallSource ? debounceCallSource : debounceCall;
        const mode = binding.mode;
        const callContextToDebounce = mode === bindingMode.twoWay || mode === bindingMode.fromView ? targetContext : sourceContext;
        binding.debouncedMethod = binding[methodToDebounce];
        binding.debouncedMethod.originalName = methodToDebounce;
        binding[methodToDebounce] = debouncer;
        binding.debounceState = {
            callContextToDebounce,
            delay,
            timeoutId: 0,
            oldValue: unset
        };
    }
    unbind(binding, source) {
        const methodToRestore = binding.debouncedMethod.originalName;
        binding[methodToRestore] = binding.debouncedMethod;
        binding.debouncedMethod = null;
        clearTimeout(binding.debounceState.timeoutId);
        binding.debounceState = null;
    }
};
DebounceBindingBehavior = __decorate$3([
    bindingBehavior('debounce')
], DebounceBindingBehavior);

function findOriginalEventTarget$1(event) {
    return (event.path && event.path[0]) || (event.deepPath && event.deepPath[0]) || event.target;
}
function handleSelfEvent(event) {
    let target = findOriginalEventTarget$1(event);
    if (this.target !== target) {
        return;
    }
    this.selfEventCallSource(event);
}
let SelfBindingBehavior = class SelfBindingBehavior {
    bind(binding, source) {
        if (!binding.callSource || !binding.targetEvent) {
            throw new Error('Self binding behavior only supports event.');
        }
        binding.selfEventCallSource = binding.callSource;
        binding.callSource = handleSelfEvent;
    }
    unbind(binding, source) {
        binding.callSource = binding.selfEventCallSource;
        binding.selfEventCallSource = null;
    }
};
SelfBindingBehavior = __decorate$3([
    bindingBehavior('self')
], SelfBindingBehavior);

class BindingSignaler {
    constructor() {
        this.signals = {};
    }
    signal(name) {
        let bindings = this.signals[name];
        if (!bindings) {
            return;
        }
        let i = bindings.length;
        while (i--) {
            bindings[i].call(sourceContext);
        }
    }
}

let SignalBindingBehavior = class SignalBindingBehavior {
    constructor(bindingSignaler) {
        this.signals = bindingSignaler.signals;
    }
    static inject() { return [BindingSignaler]; }
    bind(binding, source, ...names) {
        if (!binding.updateTarget) {
            throw new Error('Only property bindings and string interpolation bindings can be signaled.  Trigger, delegate and call bindings cannot be signaled.');
        }
        let signals = this.signals;
        if (names.length === 1) {
            let name = names[0];
            let bindings = signals[name] || (signals[name] = []);
            bindings.push(binding);
            binding.signalName = name;
        }
        else if (names.length > 1) {
            let i = names.length;
            while (i--) {
                let name = names[i];
                let bindings = signals[name] || (signals[name] = []);
                bindings.push(binding);
            }
            binding.signalName = names;
        }
        else {
            throw new Error('Signal name is required.');
        }
    }
    unbind(binding, source) {
        let signals = this.signals;
        let name = binding.signalName;
        binding.signalName = null;
        if (Array.isArray(name)) {
            let names = name;
            let i = names.length;
            while (i--) {
                let n = names[i];
                let bindings = signals[n];
                bindings.splice(bindings.indexOf(binding), 1);
            }
        }
        else {
            let bindings = signals[name];
            bindings.splice(bindings.indexOf(binding), 1);
        }
    }
};
SignalBindingBehavior = __decorate$3([
    bindingBehavior('signal')
], SignalBindingBehavior);

const eventNamesRequired = 'The updateTrigger binding behavior requires at least one event name argument: eg <input value.bind="firstName & updateTrigger:\'blur\'">';
const notApplicableMessage = 'The updateTrigger binding behavior can only be applied to two-way/ from-view bindings on input/select elements.';
let UpdateTriggerBindingBehavior = class UpdateTriggerBindingBehavior {
    bind(binding, source, ...events) {
        if (events.length === 0) {
            throw new Error(eventNamesRequired);
        }
        if (binding.mode !== bindingMode.twoWay && binding.mode !== bindingMode.fromView) {
            throw new Error(notApplicableMessage);
        }
        let targetObserver = binding.observerLocator.getObserver(binding.target, binding.targetProperty);
        if (!targetObserver.handler) {
            throw new Error(notApplicableMessage);
        }
        binding.targetObserver = targetObserver;
        targetObserver.originalHandler = binding.targetObserver.handler;
        let handler = new EventSubscriber(events);
        targetObserver.handler = handler;
    }
    unbind(binding, source) {
        let targetObserver = binding.targetObserver;
        targetObserver.handler.dispose();
        targetObserver.handler = targetObserver.originalHandler;
        targetObserver.originalHandler = null;
    }
};
UpdateTriggerBindingBehavior = __decorate$3([
    bindingBehavior('updateTrigger')
], UpdateTriggerBindingBehavior);

function _createDynamicElement({ name, viewUrl, bindableNames, useShadowDOMmode }) {
    let DynamicElement = class DynamicElement {
        bind(bindingContext) {
            this.$parent = bindingContext;
        }
    };
    DynamicElement = __decorate$3([
        customElement(name),
        useView(viewUrl)
    ], DynamicElement);
    for (let i = 0, ii = bindableNames.length; i < ii; ++i) {
        bindable(bindableNames[i])(DynamicElement);
    }
    switch (useShadowDOMmode) {
        case 'open':
            useShadowDOM({ mode: 'open' })(DynamicElement);
            break;
        case 'closed':
            useShadowDOM({ mode: 'closed' })(DynamicElement);
            break;
        case '':
            useShadowDOM(DynamicElement);
            break;
        case null:
            break;
        default:
            getLogger('aurelia-html-only-element')
                .warn(`Expected 'use-shadow-dom' value to be "close", "open" or "", received ${useShadowDOMmode}`);
            break;
    }
    return DynamicElement;
}

function getElementName(address) {
    return /([^\/^\?]+)\.html/i.exec(address)[1].toLowerCase();
}
function configure$2(config) {
    const viewEngine = config.container.get(ViewEngine);
    const loader = config.aurelia.loader;
    viewEngine.addResourcePlugin('.html', {
        'fetch': function (viewUrl) {
            return loader.loadTemplate(viewUrl).then(registryEntry => {
                let bindableNames = registryEntry.template.getAttribute('bindable');
                const useShadowDOMmode = registryEntry.template.getAttribute('use-shadow-dom');
                const name = getElementName(viewUrl);
                if (bindableNames) {
                    bindableNames = bindableNames.split(',').map(x => x.trim());
                    registryEntry.template.removeAttribute('bindable');
                }
                else {
                    bindableNames = [];
                }
                return { [name]: _createDynamicElement({ name, viewUrl, bindableNames, useShadowDOMmode }) };
            });
        }
    });
}

function configure$1$1(config) {
    injectAureliaHideStyleAtHead();
    config.globalResources(Compose, If, Else, With, Repeat, Show, Hide, Replaceable, Focus, SanitizeHTMLValueConverter, OneTimeBindingBehavior, OneWayBindingBehavior, ToViewBindingBehavior, FromViewBindingBehavior, TwoWayBindingBehavior, ThrottleBindingBehavior, DebounceBindingBehavior, SelfBindingBehavior, SignalBindingBehavior, UpdateTriggerBindingBehavior, AttrBindingBehavior);
    configure$2(config);
    let viewEngine = config.container.get(ViewEngine);
    let styleResourcePlugin = {
        fetch(address) {
            return { [address]: _createCSSResource(address) };
        }
    };
    ['.css', '.less', '.sass', '.scss', '.styl'].forEach(ext => viewEngine.addResourcePlugin(ext, styleResourcePlugin));
}

var aureliaTemplatingResources = /*#__PURE__*/Object.freeze({
    AbstractRepeater: AbstractRepeater,
    ArrayRepeatStrategy: ArrayRepeatStrategy,
    get AttrBindingBehavior () { return AttrBindingBehavior; },
    BindingSignaler: BindingSignaler,
    get Compose () { return Compose; },
    get DebounceBindingBehavior () { return DebounceBindingBehavior; },
    get Else () { return Else; },
    get Focus () { return Focus; },
    get FromViewBindingBehavior () { return FromViewBindingBehavior; },
    HTMLSanitizer: HTMLSanitizer,
    get Hide () { return Hide; },
    get If () { return If; },
    MapRepeatStrategy: MapRepeatStrategy,
    NullRepeatStrategy: NullRepeatStrategy,
    NumberRepeatStrategy: NumberRepeatStrategy,
    get OneTimeBindingBehavior () { return OneTimeBindingBehavior; },
    get OneWayBindingBehavior () { return OneWayBindingBehavior; },
    get Repeat () { return Repeat; },
    RepeatStrategyLocator: RepeatStrategyLocator,
    get Replaceable () { return Replaceable; },
    get SanitizeHTMLValueConverter () { return SanitizeHTMLValueConverter; },
    get SelfBindingBehavior () { return SelfBindingBehavior; },
    SetRepeatStrategy: SetRepeatStrategy,
    get Show () { return Show; },
    get SignalBindingBehavior () { return SignalBindingBehavior; },
    get ThrottleBindingBehavior () { return ThrottleBindingBehavior; },
    get ToViewBindingBehavior () { return ToViewBindingBehavior; },
    get TwoWayBindingBehavior () { return TwoWayBindingBehavior; },
    get UpdateTriggerBindingBehavior () { return UpdateTriggerBindingBehavior; },
    get With () { return With; },
    configure: configure$1$1,
    createFullOverrideContext: createFullOverrideContext,
    getItemsSourceExpression: getItemsSourceExpression,
    isOneTime: isOneTime,
    unwrapExpression: unwrapExpression,
    updateOneTimeBinding: updateOneTimeBinding,
    updateOverrideContext: updateOverrideContext,
    viewsRequireLifecycle: viewsRequireLifecycle
});

function mi$1(name) {
  throw new Error('History must implement ' + name + '().');
}

var History = function () {
  function History() {
    
  }

  History.prototype.activate = function activate(options) {
    mi$1('activate');
  };

  History.prototype.deactivate = function deactivate() {
    mi$1('deactivate');
  };

  History.prototype.getAbsoluteRoot = function getAbsoluteRoot() {
    mi$1('getAbsoluteRoot');
  };

  History.prototype.navigate = function navigate(fragment, options) {
    mi$1('navigate');
  };

  History.prototype.navigateBack = function navigateBack() {
    mi$1('navigateBack');
  };

  History.prototype.setTitle = function setTitle(title) {
    mi$1('setTitle');
  };

  History.prototype.setState = function setState(key, value) {
    mi$1('setState');
  };

  History.prototype.getState = function getState(key) {
    mi$1('getState');
  };

  History.prototype.getHistoryIndex = function getHistoryIndex() {
    mi$1('getHistoryIndex');
  };

  History.prototype.go = function go(movement) {
    mi$1('go');
  };

  return History;
}();

var State = function () {
  function State(charSpec) {
    

    this.charSpec = charSpec;
    this.nextStates = [];
  }

  State.prototype.get = function get(charSpec) {
    for (var _iterator = this.nextStates, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
      var _ref;

      if (_isArray) {
        if (_i >= _iterator.length) break;
        _ref = _iterator[_i++];
      } else {
        _i = _iterator.next();
        if (_i.done) break;
        _ref = _i.value;
      }

      var child = _ref;

      var isEqual = child.charSpec.validChars === charSpec.validChars && child.charSpec.invalidChars === charSpec.invalidChars;

      if (isEqual) {
        return child;
      }
    }

    return undefined;
  };

  State.prototype.put = function put(charSpec) {
    var state = this.get(charSpec);

    if (state) {
      return state;
    }

    state = new State(charSpec);

    this.nextStates.push(state);

    if (charSpec.repeat) {
      state.nextStates.push(state);
    }

    return state;
  };

  State.prototype.match = function match(ch) {
    var nextStates = this.nextStates;
    var results = [];

    for (var i = 0, l = nextStates.length; i < l; i++) {
      var child = nextStates[i];
      var charSpec = child.charSpec;

      if (charSpec.validChars !== undefined) {
        if (charSpec.validChars.indexOf(ch) !== -1) {
          results.push(child);
        }
      } else if (charSpec.invalidChars !== undefined) {
        if (charSpec.invalidChars.indexOf(ch) === -1) {
          results.push(child);
        }
      }
    }

    return results;
  };

  return State;
}();

var specials = ['/', '.', '*', '+', '?', '|', '(', ')', '[', ']', '{', '}', '\\'];

var escapeRegex = new RegExp('(\\' + specials.join('|\\') + ')', 'g');

var StaticSegment = function () {
  function StaticSegment(string, caseSensitive) {
    

    this.string = string;
    this.caseSensitive = caseSensitive;
  }

  StaticSegment.prototype.eachChar = function eachChar(callback) {
    var s = this.string;
    for (var i = 0, ii = s.length; i < ii; ++i) {
      var ch = s[i];
      callback({ validChars: this.caseSensitive ? ch : ch.toUpperCase() + ch.toLowerCase() });
    }
  };

  StaticSegment.prototype.regex = function regex() {
    return this.string.replace(escapeRegex, '\\$1');
  };

  StaticSegment.prototype.generate = function generate() {
    return this.string;
  };

  return StaticSegment;
}();

var DynamicSegment = function () {
  function DynamicSegment(name, optional) {
    

    this.name = name;
    this.optional = optional;
  }

  DynamicSegment.prototype.eachChar = function eachChar(callback) {
    callback({ invalidChars: '/', repeat: true });
  };

  DynamicSegment.prototype.regex = function regex() {
    return '([^/]+)';
  };

  DynamicSegment.prototype.generate = function generate(params, consumed) {
    consumed[this.name] = true;
    return params[this.name];
  };

  return DynamicSegment;
}();

var StarSegment = function () {
  function StarSegment(name) {
    

    this.name = name;
  }

  StarSegment.prototype.eachChar = function eachChar(callback) {
    callback({ invalidChars: '', repeat: true });
  };

  StarSegment.prototype.regex = function regex() {
    return '(.+)';
  };

  StarSegment.prototype.generate = function generate(params, consumed) {
    consumed[this.name] = true;
    return params[this.name];
  };

  return StarSegment;
}();

var EpsilonSegment = function () {
  function EpsilonSegment() {
    
  }

  EpsilonSegment.prototype.eachChar = function eachChar() {};

  EpsilonSegment.prototype.regex = function regex() {
    return '';
  };

  EpsilonSegment.prototype.generate = function generate() {
    return '';
  };

  return EpsilonSegment;
}();

var RouteRecognizer = function () {
  function RouteRecognizer() {
    

    this.rootState = new State();
    this.names = {};
    this.routes = new Map();
  }

  RouteRecognizer.prototype.add = function add(route) {
    var _this = this;

    if (Array.isArray(route)) {
      route.forEach(function (r) {
        return _this.add(r);
      });
      return undefined;
    }

    var currentState = this.rootState;
    var skippableStates = [];
    var regex = '^';
    var types = { statics: 0, dynamics: 0, stars: 0 };
    var names = [];
    var routeName = route.handler.name;
    var isEmpty = true;
    var segments = parse(route.path, names, types, route.caseSensitive);

    for (var i = 0, ii = segments.length; i < ii; i++) {
      var segment = segments[i];
      if (segment instanceof EpsilonSegment) {
        continue;
      }

      var _addSegment = addSegment(currentState, segment),
          firstState = _addSegment[0],
          nextState = _addSegment[1];

      for (var j = 0, jj = skippableStates.length; j < jj; j++) {
        skippableStates[j].nextStates.push(firstState);
      }

      if (segment.optional) {
        skippableStates.push(nextState);
        regex += '(?:/' + segment.regex() + ')?';
      } else {
        currentState = nextState;
        regex += '/' + segment.regex();
        skippableStates.length = 0;
        isEmpty = false;
      }
    }

    if (isEmpty) {
      currentState = currentState.put({ validChars: '/' });
      regex += '/?';
    }

    var handlers = [{ handler: route.handler, names: names }];

    this.routes.set(route.handler, { segments: segments, handlers: handlers });
    if (routeName) {
      var routeNames = Array.isArray(routeName) ? routeName : [routeName];
      for (var _i2 = 0; _i2 < routeNames.length; _i2++) {
        if (!(routeNames[_i2] in this.names)) {
          this.names[routeNames[_i2]] = { segments: segments, handlers: handlers };
        }
      }
    }

    for (var _i3 = 0; _i3 < skippableStates.length; _i3++) {
      var state = skippableStates[_i3];
      state.handlers = handlers;
      state.regex = new RegExp(regex + '$', route.caseSensitive ? '' : 'i');
      state.types = types;
    }

    currentState.handlers = handlers;
    currentState.regex = new RegExp(regex + '$', route.caseSensitive ? '' : 'i');
    currentState.types = types;

    return currentState;
  };

  RouteRecognizer.prototype.getRoute = function getRoute(nameOrRoute) {
    return typeof nameOrRoute === 'string' ? this.names[nameOrRoute] : this.routes.get(nameOrRoute);
  };

  RouteRecognizer.prototype.handlersFor = function handlersFor(nameOrRoute) {
    var route = this.getRoute(nameOrRoute);
    if (!route) {
      throw new Error('There is no route named ' + nameOrRoute);
    }

    return [].concat(route.handlers);
  };

  RouteRecognizer.prototype.hasRoute = function hasRoute(nameOrRoute) {
    return !!this.getRoute(nameOrRoute);
  };

  RouteRecognizer.prototype.generate = function generate(nameOrRoute, params) {
    var route = this.getRoute(nameOrRoute);
    if (!route) {
      throw new Error('There is no route named ' + nameOrRoute);
    }

    var handler = route.handlers[0].handler;
    if (handler.generationUsesHref) {
      return handler.href;
    }

    var routeParams = Object.assign({}, params);
    var segments = route.segments;
    var consumed = {};
    var output = '';

    for (var i = 0, l = segments.length; i < l; i++) {
      var segment = segments[i];

      if (segment instanceof EpsilonSegment) {
        continue;
      }

      var segmentValue = segment.generate(routeParams, consumed);
      if (segmentValue === null || segmentValue === undefined) {
        if (!segment.optional) {
          throw new Error('A value is required for route parameter \'' + segment.name + '\' in route \'' + nameOrRoute + '\'.');
        }
      } else {
        output += '/';
        output += segmentValue;
      }
    }

    if (output.charAt(0) !== '/') {
      output = '/' + output;
    }

    for (var param in consumed) {
      delete routeParams[param];
    }

    var queryString = buildQueryString(routeParams);
    output += queryString ? '?' + queryString : '';

    return output;
  };

  RouteRecognizer.prototype.recognize = function recognize(path) {
    var states = [this.rootState];
    var queryParams = {};
    var isSlashDropped = false;
    var normalizedPath = path;

    var queryStart = normalizedPath.indexOf('?');
    if (queryStart !== -1) {
      var queryString = normalizedPath.substr(queryStart + 1, normalizedPath.length);
      normalizedPath = normalizedPath.substr(0, queryStart);
      queryParams = parseQueryString(queryString);
    }

    normalizedPath = decodeURI(normalizedPath);

    if (normalizedPath.charAt(0) !== '/') {
      normalizedPath = '/' + normalizedPath;
    }

    var pathLen = normalizedPath.length;
    if (pathLen > 1 && normalizedPath.charAt(pathLen - 1) === '/') {
      normalizedPath = normalizedPath.substr(0, pathLen - 1);
      isSlashDropped = true;
    }

    for (var i = 0, l = normalizedPath.length; i < l; i++) {
      states = recognizeChar(states, normalizedPath.charAt(i));
      if (!states.length) {
        break;
      }
    }

    var solutions = [];
    for (var _i4 = 0, _l = states.length; _i4 < _l; _i4++) {
      if (states[_i4].handlers) {
        solutions.push(states[_i4]);
      }
    }

    states = sortSolutions(solutions);

    var state = solutions[0];
    if (state && state.handlers) {
      if (isSlashDropped && state.regex.source.slice(-5) === '(.+)$') {
        normalizedPath = normalizedPath + '/';
      }

      return findHandler(state, normalizedPath, queryParams);
    }
  };

  return RouteRecognizer;
}();

var RecognizeResults = function RecognizeResults(queryParams) {
  

  this.splice = Array.prototype.splice;
  this.slice = Array.prototype.slice;
  this.push = Array.prototype.push;
  this.length = 0;
  this.queryParams = queryParams || {};
};

function parse(route, names, types, caseSensitive) {
  var normalizedRoute = route;
  if (route.charAt(0) === '/') {
    normalizedRoute = route.substr(1);
  }

  var results = [];

  var splitRoute = normalizedRoute.split('/');
  for (var i = 0, ii = splitRoute.length; i < ii; ++i) {
    var segment = splitRoute[i];

    var match = segment.match(/^:([^?]+)(\?)?$/);
    if (match) {
      var _match = match,
          _name = _match[1],
          optional = _match[2];

      if (_name.indexOf('=') !== -1) {
        throw new Error('Parameter ' + _name + ' in route ' + route + ' has a default value, which is not supported.');
      }
      results.push(new DynamicSegment(_name, !!optional));
      names.push(_name);
      types.dynamics++;
      continue;
    }

    match = segment.match(/^\*(.+)$/);
    if (match) {
      results.push(new StarSegment(match[1]));
      names.push(match[1]);
      types.stars++;
    } else if (segment === '') {
      results.push(new EpsilonSegment());
    } else {
      results.push(new StaticSegment(segment, caseSensitive));
      types.statics++;
    }
  }

  return results;
}

function sortSolutions(states) {
  return states.sort(function (a, b) {
    if (a.types.stars !== b.types.stars) {
      return a.types.stars - b.types.stars;
    }

    if (a.types.stars) {
      if (a.types.statics !== b.types.statics) {
        return b.types.statics - a.types.statics;
      }
      if (a.types.dynamics !== b.types.dynamics) {
        return b.types.dynamics - a.types.dynamics;
      }
    }

    if (a.types.dynamics !== b.types.dynamics) {
      return a.types.dynamics - b.types.dynamics;
    }

    if (a.types.statics !== b.types.statics) {
      return b.types.statics - a.types.statics;
    }

    return 0;
  });
}

function recognizeChar(states, ch) {
  var nextStates = [];

  for (var i = 0, l = states.length; i < l; i++) {
    var state = states[i];
    nextStates.push.apply(nextStates, state.match(ch));
  }

  return nextStates;
}

function findHandler(state, path, queryParams) {
  var handlers = state.handlers;
  var regex = state.regex;
  var captures = path.match(regex);
  var currentCapture = 1;
  var result = new RecognizeResults(queryParams);

  for (var i = 0, l = handlers.length; i < l; i++) {
    var _handler = handlers[i];
    var _names = _handler.names;
    var _params = {};

    for (var j = 0, m = _names.length; j < m; j++) {
      _params[_names[j]] = captures[currentCapture++];
    }

    result.push({ handler: _handler.handler, params: _params, isDynamic: !!_names.length });
  }

  return result;
}

function addSegment(currentState, segment) {
  var firstState = currentState.put({ validChars: '/' });
  var nextState = firstState;
  segment.eachChar(function (ch) {
    nextState = nextState.put(ch);
  });

  return [firstState, nextState];
}

/**
 * Class used to represent an instruction during a navigation.
 */
class NavigationInstruction {
    constructor(init) {
        /**
         * Current built viewport plan of this nav instruction
         */
        this.plan = null;
        this.options = {};
        Object.assign(this, init);
        this.params = this.params || {};
        this.viewPortInstructions = {};
        let ancestorParams = [];
        let current = this;
        do {
            let currentParams = Object.assign({}, current.params);
            if (current.config && current.config.hasChildRouter) {
                // remove the param for the injected child route segment
                delete currentParams[current.getWildCardName()];
            }
            ancestorParams.unshift(currentParams);
            current = current.parentInstruction;
        } while (current);
        let allParams = Object.assign({}, this.queryParams, ...ancestorParams);
        this.lifecycleArgs = [allParams, this.config, this];
    }
    /**
     * Gets an array containing this instruction and all child instructions for the current navigation.
     */
    getAllInstructions() {
        let instructions = [this];
        let viewPortInstructions = this.viewPortInstructions;
        for (let key in viewPortInstructions) {
            let childInstruction = viewPortInstructions[key].childNavigationInstruction;
            if (childInstruction) {
                instructions.push(...childInstruction.getAllInstructions());
            }
        }
        return instructions;
    }
    /**
     * Gets an array containing the instruction and all child instructions for the previous navigation.
     * Previous instructions are no longer available after navigation completes.
     */
    getAllPreviousInstructions() {
        return this.getAllInstructions().map(c => c.previousInstruction).filter(c => c);
    }
    addViewPortInstruction(nameOrInitOptions, strategy, moduleId, component) {
        let viewPortInstruction;
        let viewPortName = typeof nameOrInitOptions === 'string' ? nameOrInitOptions : nameOrInitOptions.name;
        const lifecycleArgs = this.lifecycleArgs;
        const config = Object.assign({}, lifecycleArgs[1], { currentViewPort: viewPortName });
        if (typeof nameOrInitOptions === 'string') {
            viewPortInstruction = {
                name: nameOrInitOptions,
                strategy: strategy,
                moduleId: moduleId,
                component: component,
                childRouter: component.childRouter,
                lifecycleArgs: [lifecycleArgs[0], config, lifecycleArgs[2]]
            };
        }
        else {
            viewPortInstruction = {
                name: viewPortName,
                strategy: nameOrInitOptions.strategy,
                component: nameOrInitOptions.component,
                moduleId: nameOrInitOptions.moduleId,
                childRouter: nameOrInitOptions.component.childRouter,
                lifecycleArgs: [lifecycleArgs[0], config, lifecycleArgs[2]]
            };
        }
        return this.viewPortInstructions[viewPortName] = viewPortInstruction;
    }
    /**
     * Gets the name of the route pattern's wildcard parameter, if applicable.
     */
    getWildCardName() {
        // todo: potential issue, or at least unsafe typings
        let configRoute = this.config.route;
        let wildcardIndex = configRoute.lastIndexOf('*');
        return configRoute.substr(wildcardIndex + 1);
    }
    /**
     * Gets the path and query string created by filling the route
     * pattern's wildcard parameter with the matching param.
     */
    getWildcardPath() {
        let wildcardName = this.getWildCardName();
        let path = this.params[wildcardName] || '';
        let queryString = this.queryString;
        if (queryString) {
            path += '?' + queryString;
        }
        return path;
    }
    /**
     * Gets the instruction's base URL, accounting for wildcard route parameters.
     */
    getBaseUrl() {
        let $encodeURI = encodeURI;
        let fragment = decodeURI(this.fragment);
        if (fragment === '') {
            let nonEmptyRoute = this.router.routes.find(route => {
                return route.name === this.config.name &&
                    route.route !== '';
            });
            if (nonEmptyRoute) {
                fragment = nonEmptyRoute.route;
            }
        }
        if (!this.params) {
            return $encodeURI(fragment);
        }
        let wildcardName = this.getWildCardName();
        let path = this.params[wildcardName] || '';
        if (!path) {
            return $encodeURI(fragment);
        }
        return $encodeURI(fragment.substr(0, fragment.lastIndexOf(path)));
    }
    /**
     * Finalize a viewport instruction
     * @internal
     */
    _commitChanges(waitToSwap) {
        let router = this.router;
        router.currentInstruction = this;
        const previousInstruction = this.previousInstruction;
        if (previousInstruction) {
            previousInstruction.config.navModel.isActive = false;
        }
        this.config.navModel.isActive = true;
        router.refreshNavigation();
        let loads = [];
        let delaySwaps = [];
        let viewPortInstructions = this.viewPortInstructions;
        for (let viewPortName in viewPortInstructions) {
            let viewPortInstruction = viewPortInstructions[viewPortName];
            let viewPort = router.viewPorts[viewPortName];
            if (!viewPort) {
                throw new Error(`There was no router-view found in the view for ${viewPortInstruction.moduleId}.`);
            }
            let childNavInstruction = viewPortInstruction.childNavigationInstruction;
            if (viewPortInstruction.strategy === "replace" /* Replace */) {
                if (childNavInstruction && childNavInstruction.parentCatchHandler) {
                    loads.push(childNavInstruction._commitChanges(waitToSwap));
                }
                else {
                    if (waitToSwap) {
                        delaySwaps.push({ viewPort, viewPortInstruction });
                    }
                    loads.push(viewPort
                        .process(viewPortInstruction, waitToSwap)
                        .then(() => childNavInstruction
                        ? childNavInstruction._commitChanges(waitToSwap)
                        : Promise.resolve()));
                }
            }
            else {
                if (childNavInstruction) {
                    loads.push(childNavInstruction._commitChanges(waitToSwap));
                }
            }
        }
        return Promise
            .all(loads)
            .then(() => {
            delaySwaps.forEach(x => x.viewPort.swap(x.viewPortInstruction));
            return null;
        })
            .then(() => prune(this));
    }
    /**@internal */
    _updateTitle() {
        let router = this.router;
        let title = this._buildTitle(router.titleSeparator);
        if (title) {
            router.history.setTitle(title);
        }
    }
    /**@internal */
    _buildTitle(separator = ' | ') {
        let title = '';
        let childTitles = [];
        let navModelTitle = this.config.navModel.title;
        let instructionRouter = this.router;
        let viewPortInstructions = this.viewPortInstructions;
        if (navModelTitle) {
            title = instructionRouter.transformTitle(navModelTitle);
        }
        for (let viewPortName in viewPortInstructions) {
            let viewPortInstruction = viewPortInstructions[viewPortName];
            let child_nav_instruction = viewPortInstruction.childNavigationInstruction;
            if (child_nav_instruction) {
                let childTitle = child_nav_instruction._buildTitle(separator);
                if (childTitle) {
                    childTitles.push(childTitle);
                }
            }
        }
        if (childTitles.length) {
            title = childTitles.join(separator) + (title ? separator : '') + title;
        }
        if (instructionRouter.title) {
            title += (title ? separator : '') + instructionRouter.transformTitle(instructionRouter.title);
        }
        return title;
    }
}
const prune = (instruction) => {
    instruction.previousInstruction = null;
    instruction.plan = null;
};

/**
* Class for storing and interacting with a route's navigation settings.
*/
class NavModel {
    constructor(router, relativeHref) {
        /**
        * True if this nav item is currently active.
        */
        this.isActive = false;
        /**
        * The title.
        */
        this.title = null;
        /**
        * This nav item's absolute href.
        */
        this.href = null;
        /**
        * This nav item's relative href.
        */
        this.relativeHref = null;
        /**
        * Data attached to the route at configuration time.
        */
        this.settings = {};
        /**
        * The route config.
        */
        this.config = null;
        this.router = router;
        this.relativeHref = relativeHref;
    }
    /**
    * Sets the route's title and updates document.title.
    *  If the a navigation is in progress, the change will be applied
    *  to document.title when the navigation completes.
    *
    * @param title The new title.
    */
    setTitle(title) {
        this.title = title;
        if (this.isActive) {
            this.router.updateTitle();
        }
    }
}

function _normalizeAbsolutePath(path, hasPushState, absolute = false) {
    if (!hasPushState && path[0] !== '#') {
        path = '#' + path;
    }
    if (hasPushState && absolute) {
        path = path.substring(1, path.length);
    }
    return path;
}
function _createRootedPath(fragment, baseUrl, hasPushState, absolute) {
    if (isAbsoluteUrl.test(fragment)) {
        return fragment;
    }
    let path = '';
    if (baseUrl.length && baseUrl[0] !== '/') {
        path += '/';
    }
    path += baseUrl;
    if ((!path.length || path[path.length - 1] !== '/') && fragment[0] !== '/') {
        path += '/';
    }
    if (path.length && path[path.length - 1] === '/' && fragment[0] === '/') {
        path = path.substring(0, path.length - 1);
    }
    return _normalizeAbsolutePath(path + fragment, hasPushState, absolute);
}
function _resolveUrl(fragment, baseUrl, hasPushState) {
    if (isRootedPath.test(fragment)) {
        return _normalizeAbsolutePath(fragment, hasPushState);
    }
    return _createRootedPath(fragment, baseUrl, hasPushState);
}
function _ensureArrayWithSingleRoutePerConfig(config) {
    let routeConfigs = [];
    if (Array.isArray(config.route)) {
        for (let i = 0, ii = config.route.length; i < ii; ++i) {
            let current = Object.assign({}, config);
            current.route = config.route[i];
            routeConfigs.push(current);
        }
    }
    else {
        routeConfigs.push(Object.assign({}, config));
    }
    return routeConfigs;
}
const isRootedPath = /^#?\//;
const isAbsoluteUrl = /^([a-z][a-z0-9+\-.]*:)?\/\//i;

/**
 * Class used to configure a [[Router]] instance.
 *
 * @constructor
 */
class RouterConfiguration {
    constructor() {
        this.instructions = [];
        this.options = {};
        this.pipelineSteps = [];
    }
    /**
     * Adds a step to be run during the [[Router]]'s navigation pipeline.
     *
     * @param name The name of the pipeline slot to insert the step into.
     * @param step The pipeline step.
     * @chainable
     */
    addPipelineStep(name, step) {
        if (step === null || step === undefined) {
            throw new Error('Pipeline step cannot be null or undefined.');
        }
        this.pipelineSteps.push({ name, step });
        return this;
    }
    /**
     * Adds a step to be run during the [[Router]]'s authorize pipeline slot.
     *
     * @param step The pipeline step.
     * @chainable
     */
    addAuthorizeStep(step) {
        return this.addPipelineStep("authorize" /* Authorize */, step);
    }
    /**
     * Adds a step to be run during the [[Router]]'s preActivate pipeline slot.
     *
     * @param step The pipeline step.
     * @chainable
     */
    addPreActivateStep(step) {
        return this.addPipelineStep("preActivate" /* PreActivate */, step);
    }
    /**
     * Adds a step to be run during the [[Router]]'s preRender pipeline slot.
     *
     * @param step The pipeline step.
     * @chainable
     */
    addPreRenderStep(step) {
        return this.addPipelineStep("preRender" /* PreRender */, step);
    }
    /**
     * Adds a step to be run during the [[Router]]'s postRender pipeline slot.
     *
     * @param step The pipeline step.
     * @chainable
     */
    addPostRenderStep(step) {
        return this.addPipelineStep("postRender" /* PostRender */, step);
    }
    /**
     * Configures a route that will be used if there is no previous location available on navigation cancellation.
     *
     * @param fragment The URL fragment to use as the navigation destination.
     * @chainable
     */
    fallbackRoute(fragment) {
        this._fallbackRoute = fragment;
        return this;
    }
    /**
     * Maps one or more routes to be registered with the router.
     *
     * @param route The [[RouteConfig]] to map, or an array of [[RouteConfig]] to map.
     * @chainable
     */
    map(route) {
        if (Array.isArray(route)) {
            route.forEach(r => this.map(r));
            return this;
        }
        return this.mapRoute(route);
    }
    /**
     * Configures defaults to use for any view ports.
     *
     * @param viewPortConfig a view port configuration object to use as a
     *  default, of the form { viewPortName: { moduleId } }.
     * @chainable
     */
    useViewPortDefaults(viewPortConfig) {
        this.viewPortDefaults = viewPortConfig;
        return this;
    }
    /**
     * Maps a single route to be registered with the router.
     *
     * @param route The [[RouteConfig]] to map.
     * @chainable
     */
    mapRoute(config) {
        this.instructions.push(router => {
            let routeConfigs = _ensureArrayWithSingleRoutePerConfig(config);
            let navModel;
            for (let i = 0, ii = routeConfigs.length; i < ii; ++i) {
                let routeConfig = routeConfigs[i];
                routeConfig.settings = routeConfig.settings || {};
                if (!navModel) {
                    navModel = router.createNavModel(routeConfig);
                }
                router.addRoute(routeConfig, navModel);
            }
        });
        return this;
    }
    /**
     * Registers an unknown route handler to be run when the URL fragment doesn't match any registered routes.
     *
     * @param config A string containing a moduleId to load, or a [[RouteConfig]], or a function that takes the
     *  [[NavigationInstruction]] and selects a moduleId to load.
     * @chainable
     */
    mapUnknownRoutes(config) {
        this.unknownRouteConfig = config;
        return this;
    }
    /**
     * Applies the current configuration to the specified [[Router]].
     *
     * @param router The [[Router]] to apply the configuration to.
     */
    exportToRouter(router) {
        let instructions = this.instructions;
        for (let i = 0, ii = instructions.length; i < ii; ++i) {
            instructions[i](router);
        }
        let { title, titleSeparator, unknownRouteConfig, _fallbackRoute, viewPortDefaults } = this;
        if (title) {
            router.title = title;
        }
        if (titleSeparator) {
            router.titleSeparator = titleSeparator;
        }
        if (unknownRouteConfig) {
            router.handleUnknownRoutes(unknownRouteConfig);
        }
        if (_fallbackRoute) {
            router.fallbackRoute = _fallbackRoute;
        }
        if (viewPortDefaults) {
            router.useViewPortDefaults(viewPortDefaults);
        }
        Object.assign(router.options, this.options);
        let pipelineSteps = this.pipelineSteps;
        let pipelineStepCount = pipelineSteps.length;
        if (pipelineStepCount) {
            if (!router.isRoot) {
                throw new Error('Pipeline steps can only be added to the root router');
            }
            let pipelineProvider = router.pipelineProvider;
            for (let i = 0, ii = pipelineStepCount; i < ii; ++i) {
                let { name, step } = pipelineSteps[i];
                pipelineProvider.addStep(name, step);
            }
        }
    }
}

/**
 * The primary class responsible for handling routing and navigation.
 */
class Router {
    /**
     * @param container The [[Container]] to use when child routers.
     * @param history The [[History]] implementation to delegate navigation requests to.
     */
    constructor(container, history) {
        /**
         * The parent router, or null if this instance is not a child router.
         */
        this.parent = null;
        this.options = {};
        /**
         * The defaults used when a viewport lacks specified content
         */
        this.viewPortDefaults = {};
        /**
         * Extension point to transform the document title before it is built and displayed.
         * By default, child routers delegate to the parent router, and the app router
         * returns the title unchanged.
         */
        this.transformTitle = (title) => {
            if (this.parent) {
                return this.parent.transformTitle(title);
            }
            return title;
        };
        this.container = container;
        this.history = history;
        this.reset();
    }
    /**
     * Fully resets the router's internal state. Primarily used internally by the framework when multiple calls to setRoot are made.
     * Use with caution (actually, avoid using this). Do not use this to simply change your navigation model.
     */
    reset() {
        this.viewPorts = {};
        this.routes = [];
        this.baseUrl = '';
        this.isConfigured = false;
        this.isNavigating = false;
        this.isExplicitNavigation = false;
        this.isExplicitNavigationBack = false;
        this.isNavigatingFirst = false;
        this.isNavigatingNew = false;
        this.isNavigatingRefresh = false;
        this.isNavigatingForward = false;
        this.isNavigatingBack = false;
        this.couldDeactivate = false;
        this.navigation = [];
        this.currentInstruction = null;
        this.viewPortDefaults = {};
        this._fallbackOrder = 100;
        this._recognizer = new RouteRecognizer();
        this._childRecognizer = new RouteRecognizer();
        this._configuredPromise = new Promise(resolve => {
            this._resolveConfiguredPromise = resolve;
        });
    }
    /**
     * Gets a value indicating whether or not this [[Router]] is the root in the router tree. I.e., it has no parent.
     */
    get isRoot() {
        return !this.parent;
    }
    /**
     * Registers a viewPort to be used as a rendering target for activated routes.
     *
     * @param viewPort The viewPort.
     * @param name The name of the viewPort. 'default' if unspecified.
     */
    registerViewPort(viewPort, name) {
        name = name || 'default';
        this.viewPorts[name] = viewPort;
    }
    /**
     * Returns a Promise that resolves when the router is configured.
     */
    ensureConfigured() {
        return this._configuredPromise;
    }
    /**
     * Configures the router.
     *
     * @param callbackOrConfig The [[RouterConfiguration]] or a callback that takes a [[RouterConfiguration]].
     */
    configure(callbackOrConfig) {
        this.isConfigured = true;
        let result = callbackOrConfig;
        let config;
        if (typeof callbackOrConfig === 'function') {
            config = new RouterConfiguration();
            result = callbackOrConfig(config);
        }
        return Promise
            .resolve(result)
            .then((c) => {
            if (c && c.exportToRouter) {
                config = c;
            }
            config.exportToRouter(this);
            this.isConfigured = true;
            this._resolveConfiguredPromise();
        });
    }
    /**
     * Navigates to a new location.
     *
     * @param fragment The URL fragment to use as the navigation destination.
     * @param options The navigation options.
     */
    navigate(fragment, options) {
        if (!this.isConfigured && this.parent) {
            return this.parent.navigate(fragment, options);
        }
        this.isExplicitNavigation = true;
        return this.history.navigate(_resolveUrl(fragment, this.baseUrl, this.history._hasPushState), options);
    }
    /**
     * Navigates to a new location corresponding to the route and params specified. Equivallent to [[Router.generate]] followed
     * by [[Router.navigate]].
     *
     * @param route The name of the route to use when generating the navigation location.
     * @param params The route parameters to be used when populating the route pattern.
     * @param options The navigation options.
     */
    navigateToRoute(route, params, options) {
        let path = this.generate(route, params);
        return this.navigate(path, options);
    }
    /**
     * Navigates back to the most recent location in history.
     */
    navigateBack() {
        this.isExplicitNavigationBack = true;
        this.history.navigateBack();
    }
    /**
     * Creates a child router of the current router.
     *
     * @param container The [[Container]] to provide to the child router. Uses the current [[Router]]'s [[Container]] if unspecified.
     * @returns {Router} The new child Router.
     */
    createChild(container) {
        let childRouter = new Router(container || this.container.createChild(), this.history);
        childRouter.parent = this;
        return childRouter;
    }
    /**
     * Generates a URL fragment matching the specified route pattern.
     *
     * @param name The name of the route whose pattern should be used to generate the fragment.
     * @param params The route params to be used to populate the route pattern.
     * @param options If options.absolute = true, then absolute url will be generated; otherwise, it will be relative url.
     * @returns {string} A string containing the generated URL fragment.
     */
    generate(nameOrRoute, params = {}, options = {}) {
        // A child recognizer generates routes for potential child routes. Any potential child route is added
        // to the childRoute property of params for the childRouter to recognize. When generating routes, we
        // use the childRecognizer when childRoute params are available to generate a child router enabled route.
        let recognizer = 'childRoute' in params ? this._childRecognizer : this._recognizer;
        let hasRoute = recognizer.hasRoute(nameOrRoute);
        if (!hasRoute) {
            if (this.parent) {
                return this.parent.generate(nameOrRoute, params, options);
            }
            throw new Error(`A route with name '${nameOrRoute}' could not be found. Check that \`name: '${nameOrRoute}'\` was specified in the route's config.`);
        }
        let path = recognizer.generate(nameOrRoute, params);
        let rootedPath = _createRootedPath(path, this.baseUrl, this.history._hasPushState, options.absolute);
        return options.absolute ? `${this.history.getAbsoluteRoot()}${rootedPath}` : rootedPath;
    }
    /**
     * Creates a [[NavModel]] for the specified route config.
     *
     * @param config The route config.
     */
    createNavModel(config) {
        let navModel = new NavModel(this, 'href' in config
            ? config.href
            // potential error when config.route is a string[] ?
            : config.route);
        navModel.title = config.title;
        navModel.order = config.nav;
        navModel.href = config.href;
        navModel.settings = config.settings;
        navModel.config = config;
        return navModel;
    }
    /**
     * Registers a new route with the router.
     *
     * @param config The [[RouteConfig]].
     * @param navModel The [[NavModel]] to use for the route. May be omitted for single-pattern routes.
     */
    addRoute(config, navModel) {
        if (Array.isArray(config.route)) {
            let routeConfigs = _ensureArrayWithSingleRoutePerConfig(config);
            // the following is wrong. todo: fix this after TS refactoring release
            routeConfigs.forEach(this.addRoute.bind(this));
            return;
        }
        validateRouteConfig(config);
        if (!('viewPorts' in config) && !config.navigationStrategy) {
            config.viewPorts = {
                'default': {
                    moduleId: config.moduleId,
                    view: config.view
                }
            };
        }
        if (!navModel) {
            navModel = this.createNavModel(config);
        }
        this.routes.push(config);
        let path = config.route;
        if (path.charAt(0) === '/') {
            path = path.substr(1);
        }
        let caseSensitive = config.caseSensitive === true;
        let state = this._recognizer.add({
            path: path,
            handler: config,
            caseSensitive: caseSensitive
        });
        if (path) {
            let settings = config.settings;
            delete config.settings;
            let withChild = JSON.parse(JSON.stringify(config));
            config.settings = settings;
            withChild.route = `${path}/*childRoute`;
            withChild.hasChildRouter = true;
            this._childRecognizer.add({
                path: withChild.route,
                handler: withChild,
                caseSensitive: caseSensitive
            });
            withChild.navModel = navModel;
            withChild.settings = config.settings;
            withChild.navigationStrategy = config.navigationStrategy;
        }
        config.navModel = navModel;
        let navigation = this.navigation;
        if ((navModel.order || navModel.order === 0) && navigation.indexOf(navModel) === -1) {
            if ((!navModel.href && navModel.href !== '') && (state.types.dynamics || state.types.stars)) {
                throw new Error('Invalid route config for "' + config.route + '" : dynamic routes must specify an "href:" to be included in the navigation model.');
            }
            if (typeof navModel.order !== 'number') {
                navModel.order = ++this._fallbackOrder;
            }
            navigation.push(navModel);
            // this is a potential error / inconsistency between browsers
            //
            // MDN: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
            // If compareFunction(a, b) returns 0, leave a and b unchanged with respect to each other,
            // but sorted with respect to all different elements.
            // Note: the ECMAscript standard does not guarantee this behaviour,
            // and thus not all browsers (e.g. Mozilla versions dating back to at least 2003) respect this.
            navigation.sort((a, b) => a.order - b.order);
        }
    }
    /**
     * Gets a value indicating whether or not this [[Router]] or one of its ancestors has a route registered with the specified name.
     *
     * @param name The name of the route to check.
     */
    hasRoute(name) {
        return !!(this._recognizer.hasRoute(name) || this.parent && this.parent.hasRoute(name));
    }
    /**
     * Gets a value indicating whether or not this [[Router]] has a route registered with the specified name.
     *
     * @param name The name of the route to check.
     */
    hasOwnRoute(name) {
        return this._recognizer.hasRoute(name);
    }
    /**
     * Register a handler to use when the incoming URL fragment doesn't match any registered routes.
     *
     * @param config The moduleId, or a function that selects the moduleId, or a [[RouteConfig]].
     */
    handleUnknownRoutes(config) {
        if (!config) {
            throw new Error('Invalid unknown route handler');
        }
        this.catchAllHandler = instruction => {
            return this
                ._createRouteConfig(config, instruction)
                .then(c => {
                instruction.config = c;
                return instruction;
            });
        };
    }
    /**
     * Updates the document title using the current navigation instruction.
     */
    updateTitle() {
        let parentRouter = this.parent;
        if (parentRouter) {
            return parentRouter.updateTitle();
        }
        let currentInstruction = this.currentInstruction;
        if (currentInstruction) {
            currentInstruction._updateTitle();
        }
        return undefined;
    }
    /**
     * Updates the navigation routes with hrefs relative to the current location.
     * Note: This method will likely move to a plugin in a future release.
     */
    refreshNavigation() {
        let nav = this.navigation;
        for (let i = 0, length = nav.length; i < length; i++) {
            let current = nav[i];
            if (!current.config.href) {
                current.href = _createRootedPath(current.relativeHref, this.baseUrl, this.history._hasPushState);
            }
            else {
                current.href = _normalizeAbsolutePath(current.config.href, this.history._hasPushState);
            }
        }
    }
    /**
     * Sets the default configuration for the view ports. This specifies how to
     *  populate a view port for which no module is specified. The default is
     *  an empty view/view-model pair.
     */
    useViewPortDefaults($viewPortDefaults) {
        // a workaround to have strong typings while not requiring to expose interface ViewPortInstruction
        let viewPortDefaults = $viewPortDefaults;
        for (let viewPortName in viewPortDefaults) {
            let viewPortConfig = viewPortDefaults[viewPortName];
            this.viewPortDefaults[viewPortName] = {
                moduleId: viewPortConfig.moduleId
            };
        }
    }
    /**@internal */
    _refreshBaseUrl() {
        let parentRouter = this.parent;
        if (parentRouter) {
            this.baseUrl = generateBaseUrl(parentRouter, parentRouter.currentInstruction);
        }
    }
    /**@internal */
    _createNavigationInstruction(url = '', parentInstruction = null) {
        let fragment = url;
        let queryString = '';
        let queryIndex = url.indexOf('?');
        if (queryIndex !== -1) {
            fragment = url.substr(0, queryIndex);
            queryString = url.substr(queryIndex + 1);
        }
        let urlRecognizationResults = this._recognizer.recognize(url);
        if (!urlRecognizationResults || !urlRecognizationResults.length) {
            urlRecognizationResults = this._childRecognizer.recognize(url);
        }
        let instructionInit = {
            fragment,
            queryString,
            config: null,
            parentInstruction,
            previousInstruction: this.currentInstruction,
            router: this,
            options: {
                compareQueryParams: this.options.compareQueryParams
            }
        };
        let result;
        if (urlRecognizationResults && urlRecognizationResults.length) {
            let first = urlRecognizationResults[0];
            let instruction = new NavigationInstruction(Object.assign({}, instructionInit, {
                params: first.params,
                queryParams: first.queryParams || urlRecognizationResults.queryParams,
                config: first.config || first.handler
            }));
            if (typeof first.handler === 'function') {
                result = evaluateNavigationStrategy(instruction, first.handler, first);
            }
            else if (first.handler && typeof first.handler.navigationStrategy === 'function') {
                result = evaluateNavigationStrategy(instruction, first.handler.navigationStrategy, first.handler);
            }
            else {
                result = Promise.resolve(instruction);
            }
        }
        else if (this.catchAllHandler) {
            let instruction = new NavigationInstruction(Object.assign({}, instructionInit, {
                params: { path: fragment },
                queryParams: urlRecognizationResults ? urlRecognizationResults.queryParams : {},
                config: null // config will be created by the catchAllHandler
            }));
            result = evaluateNavigationStrategy(instruction, this.catchAllHandler);
        }
        else if (this.parent) {
            let router = this._parentCatchAllHandler(this.parent);
            if (router) {
                let newParentInstruction = this._findParentInstructionFromRouter(router, parentInstruction);
                let instruction = new NavigationInstruction(Object.assign({}, instructionInit, {
                    params: { path: fragment },
                    queryParams: urlRecognizationResults ? urlRecognizationResults.queryParams : {},
                    router: router,
                    parentInstruction: newParentInstruction,
                    parentCatchHandler: true,
                    config: null // config will be created by the chained parent catchAllHandler
                }));
                result = evaluateNavigationStrategy(instruction, router.catchAllHandler);
            }
        }
        if (result && parentInstruction) {
            this.baseUrl = generateBaseUrl(this.parent, parentInstruction);
        }
        return result || Promise.reject(new Error(`Route not found: ${url}`));
    }
    /**@internal */
    _findParentInstructionFromRouter(router, instruction) {
        if (instruction.router === router) {
            instruction.fragment = router.baseUrl; // need to change the fragment in case of a redirect instead of moduleId
            return instruction;
        }
        else if (instruction.parentInstruction) {
            return this._findParentInstructionFromRouter(router, instruction.parentInstruction);
        }
        return undefined;
    }
    /**@internal */
    _parentCatchAllHandler(router) {
        if (router.catchAllHandler) {
            return router;
        }
        else if (router.parent) {
            return this._parentCatchAllHandler(router.parent);
        }
        return false;
    }
    /**
     * @internal
     */
    _createRouteConfig(config, instruction) {
        return Promise
            .resolve(config)
            .then((c) => {
            if (typeof c === 'string') {
                return { moduleId: c };
            }
            else if (typeof c === 'function') {
                return c(instruction);
            }
            return c;
        })
            // typing here could be either RouteConfig or RedirectConfig
            // but temporarily treat both as RouteConfig
            // todo: improve typings precision
            .then((c) => typeof c === 'string' ? { moduleId: c } : c)
            .then((c) => {
            c.route = instruction.params.path;
            validateRouteConfig(c);
            if (!c.navModel) {
                c.navModel = this.createNavModel(c);
            }
            return c;
        });
    }
}
/* @internal exported for unit testing */
const generateBaseUrl = (router, instruction) => {
    return `${router.baseUrl || ''}${instruction.getBaseUrl() || ''}`;
};
/* @internal exported for unit testing */
const validateRouteConfig = (config) => {
    if (typeof config !== 'object') {
        throw new Error('Invalid Route Config');
    }
    if (typeof config.route !== 'string') {
        let name = config.name || '(no name)';
        throw new Error('Invalid Route Config for "' + name + '": You must specify a "route:" pattern.');
    }
    if (!('redirect' in config || config.moduleId || config.navigationStrategy || config.viewPorts)) {
        throw new Error('Invalid Route Config for "' + config.route + '": You must specify a "moduleId:", "redirect:", "navigationStrategy:", or "viewPorts:".');
    }
};
/* @internal exported for unit testing */
const evaluateNavigationStrategy = (instruction, evaluator, context) => {
    return Promise
        .resolve(evaluator.call(context, instruction))
        .then(() => {
        if (!('viewPorts' in instruction.config)) {
            instruction.config.viewPorts = {
                'default': {
                    moduleId: instruction.config.moduleId
                }
            };
        }
        return instruction;
    });
};

/**@internal exported for unit testing */
const createNextFn = (instruction, steps) => {
    let index = -1;
    const next = function () {
        index++;
        if (index < steps.length) {
            let currentStep = steps[index];
            try {
                return currentStep(instruction, next);
            }
            catch (e) {
                return next.reject(e);
            }
        }
        else {
            return next.complete();
        }
    };
    next.complete = createCompletionHandler(next, "completed" /* Completed */);
    next.cancel = createCompletionHandler(next, "canceled" /* Canceled */);
    next.reject = createCompletionHandler(next, "rejected" /* Rejected */);
    return next;
};
/**@internal exported for unit testing */
const createCompletionHandler = (next, status) => {
    return (output) => Promise
        .resolve({
        status,
        output,
        completed: status === "completed" /* Completed */
    });
};

/**
 * The class responsible for managing and processing the navigation pipeline.
 */
class Pipeline {
    constructor() {
        /**
         * The pipeline steps. And steps added via addStep will be converted to a function
         * The actualy running functions with correct step contexts of this pipeline
         */
        this.steps = [];
    }
    /**
     * Adds a step to the pipeline.
     *
     * @param step The pipeline step.
     */
    addStep(step) {
        let run;
        if (typeof step === 'function') {
            run = step;
        }
        else if (typeof step.getSteps === 'function') {
            // getSteps is to enable support open slots
            // where devs can add multiple steps into the same slot name
            let steps = step.getSteps();
            for (let i = 0, l = steps.length; i < l; i++) {
                this.addStep(steps[i]);
            }
            return this;
        }
        else {
            run = step.run.bind(step);
        }
        this.steps.push(run);
        return this;
    }
    /**
     * Runs the pipeline.
     *
     * @param instruction The navigation instruction to process.
     */
    run(instruction) {
        const nextFn = createNextFn(instruction, this.steps);
        return nextFn();
    }
}

/**
* Determines if the provided object is a navigation command.
* A navigation command is anything with a navigate method.
*
* @param obj The object to check.
*/
function isNavigationCommand(obj) {
    return obj && typeof obj.navigate === 'function';
}
/**
* Used during the activation lifecycle to cause a redirect.
*/
class Redirect {
    /**
     * @param url The URL fragment to use as the navigation destination.
     * @param options The navigation options.
     */
    constructor(url, options = {}) {
        this.url = url;
        this.options = Object.assign({ trigger: true, replace: true }, options);
        this.shouldContinueProcessing = false;
    }
    /**
     * Called by the activation system to set the child router.
     *
     * @param router The router.
     */
    setRouter(router) {
        this.router = router;
    }
    /**
     * Called by the navigation pipeline to navigate.
     *
     * @param appRouter The router to be redirected.
     */
    navigate(appRouter) {
        let navigatingRouter = this.options.useAppRouter ? appRouter : (this.router || appRouter);
        navigatingRouter.navigate(this.url, this.options);
    }
}
/**
 * Used during the activation lifecycle to cause a redirect to a named route.
 */
class RedirectToRoute {
    /**
     * @param route The name of the route.
     * @param params The parameters to be sent to the activation method.
     * @param options The options to use for navigation.
     */
    constructor(route, params = {}, options = {}) {
        this.route = route;
        this.params = params;
        this.options = Object.assign({ trigger: true, replace: true }, options);
        this.shouldContinueProcessing = false;
    }
    /**
     * Called by the activation system to set the child router.
     *
     * @param router The router.
     */
    setRouter(router) {
        this.router = router;
    }
    /**
     * Called by the navigation pipeline to navigate.
     *
     * @param appRouter The router to be redirected.
     */
    navigate(appRouter) {
        let navigatingRouter = this.options.useAppRouter ? appRouter : (this.router || appRouter);
        navigatingRouter.navigateToRoute(this.route, this.params, this.options);
    }
}

/**
 * @internal exported for unit testing
 */
function _buildNavigationPlan(instruction, forceLifecycleMinimum) {
    let config = instruction.config;
    if ('redirect' in config) {
        return buildRedirectPlan(instruction);
    }
    const prevInstruction = instruction.previousInstruction;
    const defaultViewPortConfigs = instruction.router.viewPortDefaults;
    if (prevInstruction) {
        return buildTransitionPlans(instruction, prevInstruction, defaultViewPortConfigs, forceLifecycleMinimum);
    }
    // first navigation, only need to prepare a few information for each viewport plan
    const viewPortPlans = {};
    let viewPortConfigs = config.viewPorts;
    for (let viewPortName in viewPortConfigs) {
        let viewPortConfig = viewPortConfigs[viewPortName];
        if (viewPortConfig.moduleId === null && viewPortName in defaultViewPortConfigs) {
            viewPortConfig = defaultViewPortConfigs[viewPortName];
        }
        viewPortPlans[viewPortName] = {
            name: viewPortName,
            strategy: "replace" /* Replace */,
            config: viewPortConfig
        };
    }
    return Promise.resolve(viewPortPlans);
}
/**
 * Build redirect plan based on config of a navigation instruction
 * @internal exported for unit testing
 */
const buildRedirectPlan = (instruction) => {
    const config = instruction.config;
    const router = instruction.router;
    return router
        ._createNavigationInstruction(config.redirect)
        .then(redirectInstruction => {
        const params = {};
        const originalInstructionParams = instruction.params;
        const redirectInstructionParams = redirectInstruction.params;
        for (let key in redirectInstructionParams) {
            // If the param on the redirect points to another param, e.g. { route: first/:this, redirect: second/:this }
            let val = redirectInstructionParams[key];
            if (typeof val === 'string' && val[0] === ':') {
                val = val.slice(1);
                // And if that param is found on the original instruction then use it
                if (val in originalInstructionParams) {
                    params[key] = originalInstructionParams[val];
                }
            }
            else {
                params[key] = redirectInstructionParams[key];
            }
        }
        let redirectLocation = router.generate(redirectInstruction.config, params, instruction.options);
        // Special handling for child routes
        for (let key in originalInstructionParams) {
            redirectLocation = redirectLocation.replace(`:${key}`, originalInstructionParams[key]);
        }
        let queryString = instruction.queryString;
        if (queryString) {
            redirectLocation += '?' + queryString;
        }
        return Promise.resolve(new Redirect(redirectLocation));
    });
};
/**
 * @param viewPortPlans the Plan record that holds information about built plans
 * @internal exported for unit testing
 */
const buildTransitionPlans = (currentInstruction, previousInstruction, defaultViewPortConfigs, forceLifecycleMinimum) => {
    let viewPortPlans = {};
    let newInstructionConfig = currentInstruction.config;
    let hasNewParams = hasDifferentParameterValues(previousInstruction, currentInstruction);
    let pending = [];
    let previousViewPortInstructions = previousInstruction.viewPortInstructions;
    for (let viewPortName in previousViewPortInstructions) {
        const prevViewPortInstruction = previousViewPortInstructions[viewPortName];
        const prevViewPortComponent = prevViewPortInstruction.component;
        const newInstructionViewPortConfigs = newInstructionConfig.viewPorts;
        // if this is invoked on a viewport without any changes, based on new url,
        // newViewPortConfig will be the existing viewport instruction
        let nextViewPortConfig = viewPortName in newInstructionViewPortConfigs
            ? newInstructionViewPortConfigs[viewPortName]
            : prevViewPortInstruction;
        if (nextViewPortConfig.moduleId === null && viewPortName in defaultViewPortConfigs) {
            nextViewPortConfig = defaultViewPortConfigs[viewPortName];
        }
        const viewPortActivationStrategy = determineActivationStrategy(currentInstruction, prevViewPortInstruction, nextViewPortConfig, hasNewParams, forceLifecycleMinimum);
        const viewPortPlan = viewPortPlans[viewPortName] = {
            name: viewPortName,
            // ViewPortInstruction can quack like a RouteConfig
            config: nextViewPortConfig,
            prevComponent: prevViewPortComponent,
            prevModuleId: prevViewPortInstruction.moduleId,
            strategy: viewPortActivationStrategy
        };
        // recursively build nav plans for all existing child routers/viewports of this viewport
        // this is possible because existing child viewports and routers already have necessary information
        // to process the wildcard path from parent instruction
        if (viewPortActivationStrategy !== "replace" /* Replace */ && prevViewPortInstruction.childRouter) {
            const path = currentInstruction.getWildcardPath();
            const task = prevViewPortInstruction
                .childRouter
                ._createNavigationInstruction(path, currentInstruction)
                .then((childInstruction) => {
                viewPortPlan.childNavigationInstruction = childInstruction;
                return _buildNavigationPlan(childInstruction, 
                // is it safe to assume viewPortPlan has not been changed from previous assignment?
                // if so, can just use local variable viewPortPlanStrategy
                // there could be user code modifying viewport plan during _createNavigationInstruction?
                viewPortPlan.strategy === "invoke-lifecycle" /* InvokeLifecycle */)
                    .then(childPlan => {
                    if (childPlan instanceof Redirect) {
                        return Promise.reject(childPlan);
                    }
                    childInstruction.plan = childPlan;
                    // for bluebird ?
                    return null;
                });
            });
            pending.push(task);
        }
    }
    return Promise.all(pending).then(() => viewPortPlans);
};
/**
 * @param newViewPortConfig if this is invoked on a viewport without any changes, based on new url, newViewPortConfig will be the existing viewport instruction
 * @internal exported for unit testing
 */
const determineActivationStrategy = (currentNavInstruction, prevViewPortInstruction, newViewPortConfig, 
// indicates whether there is difference between old and new url params
hasNewParams, forceLifecycleMinimum) => {
    let newInstructionConfig = currentNavInstruction.config;
    let prevViewPortViewModel = prevViewPortInstruction.component.viewModel;
    let viewPortPlanStrategy;
    if (prevViewPortInstruction.moduleId !== newViewPortConfig.moduleId) {
        viewPortPlanStrategy = "replace" /* Replace */;
    }
    else if ('determineActivationStrategy' in prevViewPortViewModel) {
        viewPortPlanStrategy = prevViewPortViewModel.determineActivationStrategy(...currentNavInstruction.lifecycleArgs);
    }
    else if (newInstructionConfig.activationStrategy) {
        viewPortPlanStrategy = newInstructionConfig.activationStrategy;
    }
    else if (hasNewParams || forceLifecycleMinimum) {
        viewPortPlanStrategy = "invoke-lifecycle" /* InvokeLifecycle */;
    }
    else {
        viewPortPlanStrategy = "no-change" /* NoChange */;
    }
    return viewPortPlanStrategy;
};
/**@internal exported for unit testing */
const hasDifferentParameterValues = (prev, next) => {
    let prevParams = prev.params;
    let nextParams = next.params;
    let nextWildCardName = next.config.hasChildRouter ? next.getWildCardName() : null;
    for (let key in nextParams) {
        if (key === nextWildCardName) {
            continue;
        }
        if (prevParams[key] !== nextParams[key]) {
            return true;
        }
    }
    for (let key in prevParams) {
        if (key === nextWildCardName) {
            continue;
        }
        if (prevParams[key] !== nextParams[key]) {
            return true;
        }
    }
    if (!next.options.compareQueryParams) {
        return false;
    }
    let prevQueryParams = prev.queryParams;
    let nextQueryParams = next.queryParams;
    for (let key in nextQueryParams) {
        if (prevQueryParams[key] !== nextQueryParams[key]) {
            return true;
        }
    }
    for (let key in prevQueryParams) {
        if (prevQueryParams[key] !== nextQueryParams[key]) {
            return true;
        }
    }
    return false;
};

/**
 * Transform a navigation instruction into viewport plan record object,
 * or a redirect request if user viewmodel demands
 */
class BuildNavigationPlanStep {
    run(navigationInstruction, next) {
        return _buildNavigationPlan(navigationInstruction)
            .then(plan => {
            if (plan instanceof Redirect) {
                return next.cancel(plan);
            }
            navigationInstruction.plan = plan;
            return next();
        })
            .catch(next.cancel);
    }
}

/**
 * @internal Exported for unit testing
 */
const loadNewRoute = (routeLoader, navigationInstruction) => {
    let loadingPlans = determineLoadingPlans(navigationInstruction);
    let loadPromises = loadingPlans.map((loadingPlan) => loadRoute(routeLoader, loadingPlan.navigationInstruction, loadingPlan.viewPortPlan));
    return Promise.all(loadPromises);
};
/**
 * @internal Exported for unit testing
 */
const determineLoadingPlans = (navigationInstruction, loadingPlans = []) => {
    let viewPortPlans = navigationInstruction.plan;
    for (let viewPortName in viewPortPlans) {
        let viewPortPlan = viewPortPlans[viewPortName];
        let childNavInstruction = viewPortPlan.childNavigationInstruction;
        if (viewPortPlan.strategy === "replace" /* Replace */) {
            loadingPlans.push({ viewPortPlan, navigationInstruction });
            if (childNavInstruction) {
                determineLoadingPlans(childNavInstruction, loadingPlans);
            }
        }
        else {
            let viewPortInstruction = navigationInstruction.addViewPortInstruction({
                name: viewPortName,
                strategy: viewPortPlan.strategy,
                moduleId: viewPortPlan.prevModuleId,
                component: viewPortPlan.prevComponent
            });
            if (childNavInstruction) {
                viewPortInstruction.childNavigationInstruction = childNavInstruction;
                determineLoadingPlans(childNavInstruction, loadingPlans);
            }
        }
    }
    return loadingPlans;
};
/**
 * @internal Exported for unit testing
 */
const loadRoute = (routeLoader, navigationInstruction, viewPortPlan) => {
    let planConfig = viewPortPlan.config;
    let moduleId = planConfig ? planConfig.moduleId : null;
    return loadComponent(routeLoader, navigationInstruction, planConfig)
        .then((component) => {
        let viewPortInstruction = navigationInstruction.addViewPortInstruction({
            name: viewPortPlan.name,
            strategy: viewPortPlan.strategy,
            moduleId: moduleId,
            component: component
        });
        let childRouter = component.childRouter;
        if (childRouter) {
            let path = navigationInstruction.getWildcardPath();
            return childRouter
                ._createNavigationInstruction(path, navigationInstruction)
                .then((childInstruction) => {
                viewPortPlan.childNavigationInstruction = childInstruction;
                return _buildNavigationPlan(childInstruction)
                    .then((childPlan) => {
                    if (childPlan instanceof Redirect) {
                        return Promise.reject(childPlan);
                    }
                    childInstruction.plan = childPlan;
                    viewPortInstruction.childNavigationInstruction = childInstruction;
                    return loadNewRoute(routeLoader, childInstruction);
                });
            });
        }
        // ts complains without this, though they are same
        return void 0;
    });
};
/**
 * Load a routed-component based on navigation instruction and route config
 * @internal exported for unit testing only
 */
const loadComponent = (routeLoader, navigationInstruction, config) => {
    let router = navigationInstruction.router;
    let lifecycleArgs = navigationInstruction.lifecycleArgs;
    return Promise.resolve()
        .then(() => routeLoader.loadRoute(router, config, navigationInstruction))
        .then(
    /**
     * @param component an object carrying information about loaded route
     * typically contains information about view model, childContainer, view and router
     */
    (component) => {
        let { viewModel, childContainer } = component;
        component.router = router;
        component.config = config;
        if ('configureRouter' in viewModel) {
            let childRouter = childContainer.getChildRouter();
            component.childRouter = childRouter;
            return childRouter
                .configure(c => viewModel.configureRouter(c, childRouter, lifecycleArgs[0], lifecycleArgs[1], lifecycleArgs[2]))
                .then(() => component);
        }
        return component;
    });
};

/**
 * Abstract class that is responsible for loading view / view model from a route config
 * The default implementation can be found in `aurelia-templating-router`
 */
class RouteLoader {
    /**
     * Load a route config based on its viewmodel / view configuration
     */
    // return typing: return typings used to be never
    // as it was a throw. Changing it to Promise<any> should not cause any issues
    loadRoute(router, config, navigationInstruction) {
        throw new Error('Route loaders must implement "loadRoute(router, config, navigationInstruction)".');
    }
}

/**
 * A pipeline step responsible for loading a route config of a navigation instruction
 */
class LoadRouteStep {
    /**@internal */
    static inject() { return [RouteLoader]; }
    constructor(routeLoader) {
        this.routeLoader = routeLoader;
    }
    /**
     * Run the internal to load route config of a navigation instruction to prepare for next steps in the pipeline
     */
    run(navigationInstruction, next) {
        return loadNewRoute(this.routeLoader, navigationInstruction)
            .then(next, next.cancel);
    }
}

/**
 * A pipeline step for instructing a piepline to commit changes on a navigation instruction
 */
class CommitChangesStep {
    run(navigationInstruction, next) {
        return navigationInstruction
            ._commitChanges(/*wait to swap?*/ true)
            .then(() => {
            navigationInstruction._updateTitle();
            return next();
        });
    }
}

/**
 * An optional interface describing the available activation strategies.
 * @internal Used internally.
 */
var InternalActivationStrategy;
(function (InternalActivationStrategy) {
    /**
     * Reuse the existing view model, without invoking Router lifecycle hooks.
     */
    InternalActivationStrategy["NoChange"] = "no-change";
    /**
     * Reuse the existing view model, invoking Router lifecycle hooks.
     */
    InternalActivationStrategy["InvokeLifecycle"] = "invoke-lifecycle";
    /**
     * Replace the existing view model, invoking Router lifecycle hooks.
     */
    InternalActivationStrategy["Replace"] = "replace";
})(InternalActivationStrategy || (InternalActivationStrategy = {}));
/**
 * The strategy to use when activating modules during navigation.
 */
// kept for compat reason
const activationStrategy = {
    noChange: "no-change" /* NoChange */,
    invokeLifecycle: "invoke-lifecycle" /* InvokeLifecycle */,
    replace: "replace" /* Replace */
};

/**
 * Recursively find list of deactivate-able view models
 * and invoke the either 'canDeactivate' or 'deactivate' on each
 * @internal exported for unit testing
 */
const processDeactivatable = (navigationInstruction, callbackName, next, ignoreResult) => {
    let plan = navigationInstruction.plan;
    let infos = findDeactivatable(plan, callbackName);
    let i = infos.length; // query from inside out
    function inspect(val) {
        if (ignoreResult || shouldContinue(val)) {
            return iterate();
        }
        return next.cancel(val);
    }
    function iterate() {
        if (i--) {
            try {
                let viewModel = infos[i];
                let result = viewModel[callbackName](navigationInstruction);
                return processPotential(result, inspect, next.cancel);
            }
            catch (error) {
                return next.cancel(error);
            }
        }
        navigationInstruction.router.couldDeactivate = true;
        return next();
    }
    return iterate();
};
/**
 * Recursively find and returns a list of deactivate-able view models
 * @internal exported for unit testing
 */
const findDeactivatable = (plan, callbackName, list = []) => {
    for (let viewPortName in plan) {
        let viewPortPlan = plan[viewPortName];
        let prevComponent = viewPortPlan.prevComponent;
        if ((viewPortPlan.strategy === activationStrategy.invokeLifecycle || viewPortPlan.strategy === activationStrategy.replace)
            && prevComponent) {
            let viewModel = prevComponent.viewModel;
            if (callbackName in viewModel) {
                list.push(viewModel);
            }
        }
        if (viewPortPlan.strategy === activationStrategy.replace && prevComponent) {
            addPreviousDeactivatable(prevComponent, callbackName, list);
        }
        else if (viewPortPlan.childNavigationInstruction) {
            findDeactivatable(viewPortPlan.childNavigationInstruction.plan, callbackName, list);
        }
    }
    return list;
};
/**
 * @internal exported for unit testing
 */
const addPreviousDeactivatable = (component, callbackName, list) => {
    let childRouter = component.childRouter;
    if (childRouter && childRouter.currentInstruction) {
        let viewPortInstructions = childRouter.currentInstruction.viewPortInstructions;
        for (let viewPortName in viewPortInstructions) {
            let viewPortInstruction = viewPortInstructions[viewPortName];
            let prevComponent = viewPortInstruction.component;
            let prevViewModel = prevComponent.viewModel;
            if (callbackName in prevViewModel) {
                list.push(prevViewModel);
            }
            addPreviousDeactivatable(prevComponent, callbackName, list);
        }
    }
};
/**
 * @internal exported for unit testing
 */
const processActivatable = (navigationInstruction, callbackName, next, ignoreResult) => {
    let infos = findActivatable(navigationInstruction, callbackName);
    let length = infos.length;
    let i = -1; // query from top down
    function inspect(val, router) {
        if (ignoreResult || shouldContinue(val, router)) {
            return iterate();
        }
        return next.cancel(val);
    }
    function iterate() {
        i++;
        if (i < length) {
            try {
                let current = infos[i];
                let result = current.viewModel[callbackName](...current.lifecycleArgs);
                return processPotential(result, (val) => inspect(val, current.router), next.cancel);
            }
            catch (error) {
                return next.cancel(error);
            }
        }
        return next();
    }
    return iterate();
};
/**
 * Find list of activatable view model and add to list (3rd parameter)
 * @internal exported for unit testing
 */
const findActivatable = (navigationInstruction, callbackName, list = [], router) => {
    let plan = navigationInstruction.plan;
    Object
        .keys(plan)
        .forEach((viewPortName) => {
        let viewPortPlan = plan[viewPortName];
        let viewPortInstruction = navigationInstruction.viewPortInstructions[viewPortName];
        let viewPortComponent = viewPortInstruction.component;
        let viewModel = viewPortComponent.viewModel;
        if ((viewPortPlan.strategy === activationStrategy.invokeLifecycle
            || viewPortPlan.strategy === activationStrategy.replace)
            && callbackName in viewModel) {
            list.push({
                viewModel,
                lifecycleArgs: viewPortInstruction.lifecycleArgs,
                router
            });
        }
        let childNavInstruction = viewPortPlan.childNavigationInstruction;
        if (childNavInstruction) {
            findActivatable(childNavInstruction, callbackName, list, viewPortComponent.childRouter || router);
        }
    });
    return list;
};
const shouldContinue = (output, router) => {
    if (output instanceof Error) {
        return false;
    }
    if (isNavigationCommand(output)) {
        if (typeof output.setRouter === 'function') {
            output.setRouter(router);
        }
        return !!output.shouldContinueProcessing;
    }
    if (output === undefined) {
        return true;
    }
    return output;
};
/**
 * wraps a subscription, allowing unsubscribe calls even if
 * the first value comes synchronously
 */
class SafeSubscription {
    constructor(subscriptionFunc) {
        this._subscribed = true;
        this._subscription = subscriptionFunc(this);
        if (!this._subscribed) {
            this.unsubscribe();
        }
    }
    get subscribed() {
        return this._subscribed;
    }
    unsubscribe() {
        if (this._subscribed && this._subscription) {
            this._subscription.unsubscribe();
        }
        this._subscribed = false;
    }
}
/**
 * A function to process return value from `activate`/`canActivate` steps
 * Supports observable/promise
 *
 * For observable, resolve at first next() or on complete()
 */
const processPotential = (obj, resolve, reject) => {
    // if promise like
    if (obj && typeof obj.then === 'function') {
        return Promise.resolve(obj).then(resolve).catch(reject);
    }
    // if observable
    if (obj && typeof obj.subscribe === 'function') {
        let obs = obj;
        return new SafeSubscription(sub => obs.subscribe({
            next() {
                if (sub.subscribed) {
                    sub.unsubscribe();
                    resolve(obj);
                }
            },
            error(error) {
                if (sub.subscribed) {
                    sub.unsubscribe();
                    reject(error);
                }
            },
            complete() {
                if (sub.subscribed) {
                    sub.unsubscribe();
                    resolve(obj);
                }
            }
        }));
    }
    // else just resolve
    try {
        return resolve(obj);
    }
    catch (error) {
        return reject(error);
    }
};

/**
 * A pipeline step responsible for finding and activating method `canDeactivate` on a view model of a route
 */
class CanDeactivatePreviousStep {
    run(navigationInstruction, next) {
        return processDeactivatable(navigationInstruction, 'canDeactivate', next);
    }
}
/**
 * A pipeline step responsible for finding and activating method `canActivate` on a view model of a route
 */
class CanActivateNextStep {
    run(navigationInstruction, next) {
        return processActivatable(navigationInstruction, 'canActivate', next);
    }
}
/**
 * A pipeline step responsible for finding and activating method `deactivate` on a view model of a route
 */
class DeactivatePreviousStep {
    run(navigationInstruction, next) {
        return processDeactivatable(navigationInstruction, 'deactivate', next, true);
    }
}
/**
 * A pipeline step responsible for finding and activating method `activate` on a view model of a route
 */
class ActivateNextStep {
    run(navigationInstruction, next) {
        return processActivatable(navigationInstruction, 'activate', next, true);
    }
}

/**
 * A multi-slots Pipeline Placeholder Step for hooking into a pipeline execution
 */
class PipelineSlot {
    constructor(container, name, alias) {
        this.steps = [];
        this.container = container;
        this.slotName = name;
        this.slotAlias = alias;
    }
    getSteps() {
        return this.steps.map(x => this.container.get(x));
    }
}
/**
 * Class responsible for creating the navigation pipeline.
 */
class PipelineProvider {
    /**@internal */
    static inject() { return [Container]; }
    constructor(container) {
        this.container = container;
        this.steps = [
            BuildNavigationPlanStep,
            CanDeactivatePreviousStep,
            LoadRouteStep,
            createPipelineSlot(container, "authorize" /* Authorize */),
            CanActivateNextStep,
            createPipelineSlot(container, "preActivate" /* PreActivate */, 'modelbind'),
            // NOTE: app state changes start below - point of no return
            DeactivatePreviousStep,
            ActivateNextStep,
            createPipelineSlot(container, "preRender" /* PreRender */, 'precommit'),
            CommitChangesStep,
            createPipelineSlot(container, "postRender" /* PostRender */, 'postcomplete')
        ];
    }
    /**
     * Create the navigation pipeline.
     */
    createPipeline(useCanDeactivateStep = true) {
        let pipeline = new Pipeline();
        this.steps.forEach(step => {
            if (useCanDeactivateStep || step !== CanDeactivatePreviousStep) {
                pipeline.addStep(this.container.get(step));
            }
        });
        return pipeline;
    }
    /**@internal */
    _findStep(name) {
        // Steps that are not PipelineSlots are constructor functions, and they will automatically fail. Probably.
        return this.steps.find(x => x.slotName === name || x.slotAlias === name);
    }
    /**
     * Adds a step into the pipeline at a known slot location.
     */
    addStep(name, step) {
        let found = this._findStep(name);
        if (found) {
            let slotSteps = found.steps;
            // prevent duplicates
            if (!slotSteps.includes(step)) {
                slotSteps.push(step);
            }
        }
        else {
            throw new Error(`Invalid pipeline slot name: ${name}.`);
        }
    }
    /**
     * Removes a step from a slot in the pipeline
     */
    removeStep(name, step) {
        let slot = this._findStep(name);
        if (slot) {
            let slotSteps = slot.steps;
            slotSteps.splice(slotSteps.indexOf(step), 1);
        }
    }
    /**
     * Clears all steps from a slot in the pipeline
     * @internal
     */
    _clearSteps(name = '') {
        let slot = this._findStep(name);
        if (slot) {
            slot.steps = [];
        }
    }
    /**
     * Resets all pipeline slots
     */
    reset() {
        this._clearSteps("authorize" /* Authorize */);
        this._clearSteps("preActivate" /* PreActivate */);
        this._clearSteps("preRender" /* PreRender */);
        this._clearSteps("postRender" /* PostRender */);
    }
}
/**@internal */
const createPipelineSlot = (container, name, alias) => {
    return new PipelineSlot(container, name, alias);
};

const logger$4 = getLogger('app-router');
/**
 * The main application router.
 */
class AppRouter extends Router {
    /**@internal */
    static inject() { return [Container, History, PipelineProvider, EventAggregator]; }
    constructor(container, history, pipelineProvider, events) {
        super(container, history); // Note the super will call reset internally.
        this.pipelineProvider = pipelineProvider;
        this.events = events;
    }
    /**
     * Fully resets the router's internal state. Primarily used internally by the framework when multiple calls to setRoot are made.
     * Use with caution (actually, avoid using this). Do not use this to simply change your navigation model.
     */
    reset() {
        super.reset();
        this.maxInstructionCount = 10;
        if (!this._queue) {
            this._queue = [];
        }
        else {
            this._queue.length = 0;
        }
    }
    /**
     * Loads the specified URL.
     *
     * @param url The URL fragment to load.
     */
    loadUrl(url) {
        return this
            ._createNavigationInstruction(url)
            .then(instruction => this._queueInstruction(instruction))
            .catch(error => {
            logger$4.error(error);
            restorePreviousLocation(this);
        });
    }
    /**
     * Registers a viewPort to be used as a rendering target for activated routes.
     *
     * @param viewPort The viewPort. This is typically a <router-view/> element in Aurelia default impl
     * @param name The name of the viewPort. 'default' if unspecified.
     */
    registerViewPort(viewPort, name) {
        // having strong typing without changing public API
        const $viewPort = viewPort;
        super.registerViewPort($viewPort, name);
        // beside adding viewport to the registry of this instance
        // AppRouter also configure routing/history to start routing functionality
        // There are situation where there are more than 1 <router-view/> element at root view
        // in that case, still only activate once via the following guard
        if (!this.isActive) {
            const viewModel = this._findViewModel($viewPort);
            if ('configureRouter' in viewModel) {
                // If there are more than one <router-view/> element at root view
                // use this flag to guard against configure method being invoked multiple times
                // this flag is set inside method configure
                if (!this.isConfigured) {
                    // replace the real resolve with a noop to guarantee that any action in base class Router
                    // won't resolve the configurePromise prematurely
                    const resolveConfiguredPromise = this._resolveConfiguredPromise;
                    this._resolveConfiguredPromise = () => { };
                    return this
                        .configure(config => Promise
                        .resolve(viewModel.configureRouter(config, this))
                        // an issue with configure interface. Should be fixed there
                        // todo: fix this via configure interface in router
                        .then(() => config))
                        .then(() => {
                        this.activate();
                        resolveConfiguredPromise();
                    });
                }
            }
            else {
                this.activate();
            }
        }
        // when a viewport is added dynamically to a root view that is already activated
        // just process the navigation instruction
        else {
            this._dequeueInstruction();
        }
        return Promise.resolve();
    }
    /**
     * Activates the router. This instructs the router to begin listening for history changes and processing instructions.
     *
     * @params options The set of options to activate the router with.
     */
    activate(options) {
        if (this.isActive) {
            return;
        }
        this.isActive = true;
        // route handler property is responsible for handling url change
        // the interface of aurelia-history isn't clear on this perspective
        this.options = Object.assign({ routeHandler: this.loadUrl.bind(this) }, this.options, options);
        this.history.activate(this.options);
        this._dequeueInstruction();
    }
    /**
     * Deactivates the router.
     */
    deactivate() {
        this.isActive = false;
        this.history.deactivate();
    }
    /**@internal */
    _queueInstruction(instruction) {
        return new Promise((resolve) => {
            instruction.resolve = resolve;
            this._queue.unshift(instruction);
            this._dequeueInstruction();
        });
    }
    /**@internal */
    _dequeueInstruction(instructionCount = 0) {
        return Promise.resolve().then(() => {
            if (this.isNavigating && !instructionCount) {
                // ts complains about inconsistent returns without void 0
                return void 0;
            }
            let instruction = this._queue.shift();
            this._queue.length = 0;
            if (!instruction) {
                // ts complains about inconsistent returns without void 0
                return void 0;
            }
            this.isNavigating = true;
            let navtracker = this.history.getState('NavigationTracker');
            let currentNavTracker = this.currentNavigationTracker;
            if (!navtracker && !currentNavTracker) {
                this.isNavigatingFirst = true;
                this.isNavigatingNew = true;
            }
            else if (!navtracker) {
                this.isNavigatingNew = true;
            }
            else if (!currentNavTracker) {
                this.isNavigatingRefresh = true;
            }
            else if (currentNavTracker < navtracker) {
                this.isNavigatingForward = true;
            }
            else if (currentNavTracker > navtracker) {
                this.isNavigatingBack = true;
            }
            if (!navtracker) {
                navtracker = Date.now();
                this.history.setState('NavigationTracker', navtracker);
            }
            this.currentNavigationTracker = navtracker;
            instruction.previousInstruction = this.currentInstruction;
            let maxInstructionCount = this.maxInstructionCount;
            if (!instructionCount) {
                this.events.publish("router:navigation:processing" /* Processing */, { instruction });
            }
            else if (instructionCount === maxInstructionCount - 1) {
                logger$4.error(`${instructionCount + 1} navigation instructions have been attempted without success. Restoring last known good location.`);
                restorePreviousLocation(this);
                return this._dequeueInstruction(instructionCount + 1);
            }
            else if (instructionCount > maxInstructionCount) {
                throw new Error('Maximum navigation attempts exceeded. Giving up.');
            }
            let pipeline = this.pipelineProvider.createPipeline(!this.couldDeactivate);
            return pipeline
                .run(instruction)
                .then(result => processResult(instruction, result, instructionCount, this))
                .catch(error => {
                return { output: error instanceof Error ? error : new Error(error) };
            })
                .then(result => resolveInstruction(instruction, result, !!instructionCount, this));
        });
    }
    /**@internal */
    _findViewModel(viewPort) {
        if (this.container.viewModel) {
            return this.container.viewModel;
        }
        if (viewPort.container) {
            let container = viewPort.container;
            while (container) {
                if (container.viewModel) {
                    this.container.viewModel = container.viewModel;
                    return container.viewModel;
                }
                container = container.parent;
            }
        }
        return undefined;
    }
}
const processResult = (instruction, result, instructionCount, router) => {
    if (!(result && 'completed' in result && 'output' in result)) {
        result = result || {};
        result.output = new Error(`Expected router pipeline to return a navigation result, but got [${JSON.stringify(result)}] instead.`);
    }
    let finalResult = null;
    let navigationCommandResult = null;
    if (isNavigationCommand(result.output)) {
        navigationCommandResult = result.output.navigate(router);
    }
    else {
        finalResult = result;
        if (!result.completed) {
            if (result.output instanceof Error) {
                logger$4.error(result.output.toString());
            }
            restorePreviousLocation(router);
        }
    }
    return Promise.resolve(navigationCommandResult)
        .then(_ => router._dequeueInstruction(instructionCount + 1))
        .then(innerResult => finalResult || innerResult || result);
};
const resolveInstruction = (instruction, result, isInnerInstruction, router) => {
    instruction.resolve(result);
    let eventAggregator = router.events;
    let eventArgs = { instruction, result };
    if (!isInnerInstruction) {
        router.isNavigating = false;
        router.isExplicitNavigation = false;
        router.isExplicitNavigationBack = false;
        router.isNavigatingFirst = false;
        router.isNavigatingNew = false;
        router.isNavigatingRefresh = false;
        router.isNavigatingForward = false;
        router.isNavigatingBack = false;
        router.couldDeactivate = false;
        let eventName;
        if (result.output instanceof Error) {
            eventName = "router:navigation:error" /* Error */;
        }
        else if (!result.completed) {
            eventName = "router:navigation:canceled" /* Canceled */;
        }
        else {
            let queryString = instruction.queryString ? ('?' + instruction.queryString) : '';
            router.history.previousLocation = instruction.fragment + queryString;
            eventName = "router:navigation:success" /* Success */;
        }
        eventAggregator.publish(eventName, eventArgs);
        eventAggregator.publish("router:navigation:complete" /* Complete */, eventArgs);
    }
    else {
        eventAggregator.publish("router:navigation:child:complete" /* ChildComplete */, eventArgs);
    }
    return result;
};
const restorePreviousLocation = (router) => {
    let previousLocation = router.history.previousLocation;
    if (previousLocation) {
        router.navigate(previousLocation, { trigger: false, replace: true });
    }
    else if (router.fallbackRoute) {
        router.navigate(router.fallbackRoute, { trigger: true, replace: true });
    }
    else {
        logger$4.error('Router navigation failed, and no previous location or fallbackRoute could be restored.');
    }
};

/**
* The status of a Pipeline.
*/
var PipelineStatus;
(function (PipelineStatus) {
    PipelineStatus["Completed"] = "completed";
    PipelineStatus["Canceled"] = "canceled";
    PipelineStatus["Rejected"] = "rejected";
    PipelineStatus["Running"] = "running";
})(PipelineStatus || (PipelineStatus = {}));

/**
 * A list of known router events used by the Aurelia router
 * to signal the pipeline has come to a certain state
 */
// const enum is preserved in tsconfig
var RouterEvent;
(function (RouterEvent) {
    RouterEvent["Processing"] = "router:navigation:processing";
    RouterEvent["Error"] = "router:navigation:error";
    RouterEvent["Canceled"] = "router:navigation:canceled";
    RouterEvent["Complete"] = "router:navigation:complete";
    RouterEvent["Success"] = "router:navigation:success";
    RouterEvent["ChildComplete"] = "router:navigation:child:complete";
})(RouterEvent || (RouterEvent = {}));

/**
 * Available pipeline slot names to insert interceptor into router pipeline
 */
// const enum is preserved in tsconfig
var PipelineSlotName;
(function (PipelineSlotName) {
    /**
     * Authorization slot. Invoked early in the pipeline,
     * before `canActivate` hook of incoming route
     */
    PipelineSlotName["Authorize"] = "authorize";
    /**
     * Pre-activation slot. Invoked early in the pipeline,
     * Invoked timing:
     *   - after Authorization slot
     *   - after canActivate hook on new view model
     *   - before deactivate hook on old view model
     *   - before activate hook on new view model
     */
    PipelineSlotName["PreActivate"] = "preActivate";
    /**
     * Pre-render slot. Invoked later in the pipeline
     * Invokcation timing:
     *   - after activate hook on new view model
     *   - before commit step on new navigation instruction
     */
    PipelineSlotName["PreRender"] = "preRender";
    /**
     * Post-render slot. Invoked last in the pipeline
     */
    PipelineSlotName["PostRender"] = "postRender";
})(PipelineSlotName || (PipelineSlotName = {}));

var aureliaRouter = /*#__PURE__*/Object.freeze({
    ActivateNextStep: ActivateNextStep,
    AppRouter: AppRouter,
    BuildNavigationPlanStep: BuildNavigationPlanStep,
    CanActivateNextStep: CanActivateNextStep,
    CanDeactivatePreviousStep: CanDeactivatePreviousStep,
    CommitChangesStep: CommitChangesStep,
    DeactivatePreviousStep: DeactivatePreviousStep,
    LoadRouteStep: LoadRouteStep,
    NavModel: NavModel,
    NavigationInstruction: NavigationInstruction,
    Pipeline: Pipeline,
    PipelineProvider: PipelineProvider,
    get PipelineSlotName () { return PipelineSlotName; },
    get PipelineStatus () { return PipelineStatus; },
    Redirect: Redirect,
    RedirectToRoute: RedirectToRoute,
    RouteLoader: RouteLoader,
    Router: Router,
    RouterConfiguration: RouterConfiguration,
    get RouterEvent () { return RouterEvent; },
    activationStrategy: activationStrategy,
    isNavigationCommand: isNavigationCommand
});

var authFilterValueConverter = createCommonjsModule(function (module, exports) {

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AuthFilterValueConverter = undefined;





var AuthFilterValueConverter = exports.AuthFilterValueConverter = function () {
  function AuthFilterValueConverter() {
    
  }

  AuthFilterValueConverter.prototype.toView = function toView(routes, isAuthenticated) {
    return routes.filter(function (route) {
      return typeof route.config.auth !== 'boolean' || route.config.auth === isAuthenticated;
    });
  };

  return AuthFilterValueConverter;
}();
});

unwrapExports(authFilterValueConverter);
var authFilterValueConverter_1 = authFilterValueConverter.AuthFilterValueConverter;

var authenticatedValueConverter = createCommonjsModule(function (module, exports) {

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AuthenticatedValueConverter = undefined;

var _dec, _class;







var AuthenticatedValueConverter = exports.AuthenticatedValueConverter = (_dec = (0, aureliaDependencyInjection.inject)(aureliaAuthentication.AuthService), _dec(_class = function () {
  function AuthenticatedValueConverter(authService) {
    

    this.authService = authService;
  }

  AuthenticatedValueConverter.prototype.toView = function toView() {
    return this.authService.authenticated;
  };

  return AuthenticatedValueConverter;
}()) || _class);
});

unwrapExports(authenticatedValueConverter);
var authenticatedValueConverter_1 = authenticatedValueConverter.AuthenticatedValueConverter;

var authenticatedFilterValueConverter = createCommonjsModule(function (module, exports) {

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AuthenticatedFilterValueConverter = undefined;

var _dec, _class;









var AuthenticatedFilterValueConverter = exports.AuthenticatedFilterValueConverter = (_dec = (0, aureliaDependencyInjection.inject)(aureliaAuthentication.AuthService), _dec(_class = function () {
  function AuthenticatedFilterValueConverter(authService) {
    

    this.authService = authService;
  }

  AuthenticatedFilterValueConverter.prototype.toView = function toView(routes) {
    var isAuthenticated = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.authService.authenticated;

    return routes.filter(function (route) {
      return typeof route.config.auth !== 'boolean' || route.config.auth === isAuthenticated;
    });
  };

  return AuthenticatedFilterValueConverter;
}()) || _class);
});

unwrapExports(authenticatedFilterValueConverter);
var authenticatedFilterValueConverter_1 = authenticatedFilterValueConverter.AuthenticatedFilterValueConverter;

var aureliaAuthentication = createCommonjsModule(function (module, exports) {

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FetchConfig = exports.AuthorizeStep = exports.AuthenticateStep = exports.AuthService = exports.Authentication = exports.OAuth2 = exports.OAuth1 = exports.AuthLock = exports.Storage = exports.BaseConfig = exports.logger = exports.Popup = undefined;

var _dec, _class2, _dec2, _class3, _dec3, _class4, _dec4, _class5, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _class6, _class7, _dec12, _dec13, _class8, _class9, _dec14, _class11, _dec15, _class12, _dec16, _class13;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.configure = configure;



var _extend2 = _interopRequireDefault(extend);



var _jwtDecode2 = _interopRequireDefault(lib);



























function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) {
  var desc = {};
  Object['ke' + 'ys'](descriptor).forEach(function (key) {
    desc[key] = descriptor[key];
  });
  desc.enumerable = !!desc.enumerable;
  desc.configurable = !!desc.configurable;

  if ('value' in desc || desc.initializer) {
    desc.writable = true;
  }

  desc = decorators.slice().reverse().reduce(function (desc, decorator) {
    return decorator(target, property, desc) || desc;
  }, desc);

  if (context && desc.initializer !== void 0) {
    desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
    desc.initializer = undefined;
  }

  if (desc.initializer === void 0) {
    Object['define' + 'Property'](target, property, desc);
    desc = null;
  }

  return desc;
}



var Popup = exports.Popup = function () {
  function Popup() {
    

    this.popupWindow = null;
    this.polling = null;
    this.url = '';
  }

  Popup.prototype.open = function open(url, windowName, options) {
    this.url = url;
    var optionsString = buildPopupWindowOptions(options || {});

    this.popupWindow = aureliaPal.PLATFORM.global.open(url, windowName, optionsString);

    if (this.popupWindow && this.popupWindow.focus) {
      this.popupWindow.focus();
    }

    return this;
  };

  Popup.prototype.eventListener = function eventListener(redirectUri) {
    var _this = this;

    return new Promise(function (resolve, reject) {
      _this.popupWindow.addEventListener('loadstart', function (event) {
        if (event.url.indexOf(redirectUri) !== 0) {
          return;
        }

        var parser = aureliaPal.DOM.createElement('a');

        parser.href = event.url;

        if (parser.search || parser.hash) {
          var qs = parseUrl(parser);

          if (qs.error) {
            reject({ error: qs.error });
          } else {
            resolve(qs);
          }

          _this.popupWindow.close();
        }
      });

      _this.popupWindow.addEventListener('exit', function () {
        reject({ data: 'Provider Popup was closed' });
      });

      _this.popupWindow.addEventListener('loaderror', function () {
        reject({ data: 'Authorization Failed' });
      });
    });
  };

  Popup.prototype.pollPopup = function pollPopup() {
    var _this2 = this;

    return new Promise(function (resolve, reject) {
      _this2.polling = aureliaPal.PLATFORM.global.setInterval(function () {
        var errorData = void 0;

        try {
          if (_this2.popupWindow.location.host === aureliaPal.PLATFORM.global.document.location.host && (_this2.popupWindow.location.search || _this2.popupWindow.location.hash)) {
            var qs = parseUrl(_this2.popupWindow.location);

            if (qs.error) {
              reject({ error: qs.error });
            } else {
              resolve(qs);
            }

            _this2.popupWindow.close();
            aureliaPal.PLATFORM.global.clearInterval(_this2.polling);
          }
        } catch (error) {
          errorData = error;
        }

        if (!_this2.popupWindow) {
          aureliaPal.PLATFORM.global.clearInterval(_this2.polling);
          reject({
            error: errorData,
            data: 'Provider Popup Blocked'
          });
        } else if (_this2.popupWindow.closed) {
          aureliaPal.PLATFORM.global.clearInterval(_this2.polling);
          reject({
            error: errorData,
            data: 'Problem poll popup'
          });
        }
      }, 35);
    });
  };

  return Popup;
}();

var buildPopupWindowOptions = function buildPopupWindowOptions(options) {
  var width = options.width || 500;
  var height = options.height || 500;

  var extended = (0, _extend2.default)({
    width: width,
    height: height,
    left: aureliaPal.PLATFORM.global.screenX + (aureliaPal.PLATFORM.global.outerWidth - width) / 2,
    top: aureliaPal.PLATFORM.global.screenY + (aureliaPal.PLATFORM.global.outerHeight - height) / 2.5
  }, options);

  var parts = [];

  Object.keys(extended).map(function (key) {
    return parts.push(key + '=' + extended[key]);
  });

  return parts.join(',');
};

var parseUrl = function parseUrl(url) {
  var hash = url.hash.charAt(0) === '#' ? url.hash.substr(1) : url.hash;

  return (0, _extend2.default)(true, {}, (0, aureliaPath.parseQueryString)(url.search), (0, aureliaPath.parseQueryString)(hash));
};

var logger = exports.logger = (0, aureliaLogging.getLogger)('aurelia-authentication');

var BaseConfig = exports.BaseConfig = function () {
  function BaseConfig() {
    

    this.client = null;
    this.endpoint = null;
    this.configureEndpoints = null;
    this.loginRedirect = '#/';
    this.logoutRedirect = '#/';
    this.loginRoute = '/login';
    this.loginOnSignup = true;
    this.signupRedirect = '#/login';
    this.expiredRedirect = '#/';
    this.storageChangedRedirect = '#/';
    this.baseUrl = '';
    this.loginUrl = '/auth/login';
    this.logoutUrl = null;
    this.logoutMethod = 'get';
    this.signupUrl = '/auth/signup';
    this.profileUrl = '/auth/me';
    this.profileMethod = 'put';
    this.unlinkUrl = '/auth/unlink/';
    this.unlinkMethod = 'get';
    this.refreshTokenUrl = null;
    this.authHeader = 'Authorization';
    this.authTokenType = 'Bearer';
    this.logoutOnInvalidToken = false;
    this.accessTokenProp = 'access_token';
    this.accessTokenName = 'token';
    this.accessTokenRoot = false;
    this.useRefreshToken = false;
    this.autoUpdateToken = true;
    this.clientId = false;
    this.clientSecret = null;
    this.refreshTokenProp = 'refresh_token';
    this.refreshTokenSubmitProp = 'refresh_token';
    this.keepOldResponseProperties = false;
    this.refreshTokenName = 'token';
    this.refreshTokenRoot = false;
    this.idTokenProp = 'id_token';
    this.idTokenName = 'token';
    this.idTokenRoot = false;
    this.httpInterceptor = true;
    this.withCredentials = true;
    this.platform = 'browser';
    this.storage = 'localStorage';
    this.storageKey = 'aurelia_authentication';
    this.storageChangedReload = false;
    this.getExpirationDateFromResponse = null;
    this.getAccessTokenFromResponse = null;
    this.getRefreshTokenFromResponse = null;
    this.globalValueConverters = ['authFilterValueConverter'];
    this.defaultHeadersForTokenRequests = {
      'Content-Type': 'application/json'
    };
    this.providers = {
      facebook: {
        name: 'facebook',
        url: '/auth/facebook',
        authorizationEndpoint: 'https://www.facebook.com/v2.5/dialog/oauth',
        redirectUri: aureliaPal.PLATFORM.location.origin + '/',
        requiredUrlParams: ['display', 'scope'],
        scope: ['email'],
        scopeDelimiter: ',',
        display: 'popup',
        oauthType: '2.0',
        popupOptions: { width: 580, height: 400 }
      },
      google: {
        name: 'google',
        url: '/auth/google',
        authorizationEndpoint: 'https://accounts.google.com/o/oauth2/auth',
        redirectUri: aureliaPal.PLATFORM.location.origin,
        requiredUrlParams: ['scope'],
        optionalUrlParams: ['display', 'state'],
        scope: ['profile', 'email'],
        scopePrefix: 'openid',
        scopeDelimiter: ' ',
        display: 'popup',
        oauthType: '2.0',
        popupOptions: { width: 452, height: 633 },
        state: randomState
      },
      github: {
        name: 'github',
        url: '/auth/github',
        authorizationEndpoint: 'https://github.com/login/oauth/authorize',
        redirectUri: aureliaPal.PLATFORM.location.origin,
        optionalUrlParams: ['scope'],
        scope: ['user:email'],
        scopeDelimiter: ' ',
        oauthType: '2.0',
        popupOptions: { width: 1020, height: 618 }
      },
      instagram: {
        name: 'instagram',
        url: '/auth/instagram',
        authorizationEndpoint: 'https://api.instagram.com/oauth/authorize',
        redirectUri: aureliaPal.PLATFORM.location.origin,
        requiredUrlParams: ['scope'],
        scope: ['basic'],
        scopeDelimiter: '+',
        oauthType: '2.0'
      },
      linkedin: {
        name: 'linkedin',
        url: '/auth/linkedin',
        authorizationEndpoint: 'https://www.linkedin.com/uas/oauth2/authorization',
        redirectUri: aureliaPal.PLATFORM.location.origin,
        requiredUrlParams: ['state'],
        scope: ['r_emailaddress'],
        scopeDelimiter: ' ',
        state: 'STATE',
        oauthType: '2.0',
        popupOptions: { width: 527, height: 582 }
      },
      twitter: {
        name: 'twitter',
        url: '/auth/twitter',
        authorizationEndpoint: 'https://api.twitter.com/oauth/authenticate',
        redirectUri: aureliaPal.PLATFORM.location.origin,
        oauthType: '1.0',
        popupOptions: { width: 495, height: 645 }
      },
      twitch: {
        name: 'twitch',
        url: '/auth/twitch',
        authorizationEndpoint: 'https://api.twitch.tv/kraken/oauth2/authorize',
        redirectUri: aureliaPal.PLATFORM.location.origin,
        requiredUrlParams: ['scope'],
        scope: ['user_read'],
        scopeDelimiter: ' ',
        display: 'popup',
        oauthType: '2.0',
        popupOptions: { width: 500, height: 560 }
      },
      live: {
        name: 'live',
        url: '/auth/live',
        authorizationEndpoint: 'https://login.live.com/oauth20_authorize.srf',
        redirectUri: aureliaPal.PLATFORM.location.origin,
        requiredUrlParams: ['display', 'scope'],
        scope: ['wl.emails'],
        scopeDelimiter: ' ',
        display: 'popup',
        oauthType: '2.0',
        popupOptions: { width: 500, height: 560 }
      },
      yahoo: {
        name: 'yahoo',
        url: '/auth/yahoo',
        authorizationEndpoint: 'https://api.login.yahoo.com/oauth2/request_auth',
        redirectUri: aureliaPal.PLATFORM.location.origin,
        scope: [],
        scopeDelimiter: ',',
        oauthType: '2.0',
        popupOptions: { width: 559, height: 519 }
      },
      bitbucket: {
        name: 'bitbucket',
        url: '/auth/bitbucket',
        authorizationEndpoint: 'https://bitbucket.org/site/oauth2/authorize',
        redirectUri: aureliaPal.PLATFORM.location.origin + '/',
        requiredUrlParams: ['scope'],
        scope: ['email'],
        scopeDelimiter: ' ',
        oauthType: '2.0',
        popupOptions: { width: 1028, height: 529 }
      },
      azure_ad: {
        name: 'azure_ad',
        url: '/auth/azure_ad',
        authorizationEndpoint: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
        redirectUri: window.location.origin,
        logoutEndpoint: 'https://login.microsoftonline.com/common/oauth2/v2.0/logout',
        postLogoutRedirectUri: window.location.origin,
        requiredUrlParams: ['scope'],
        scope: ['user.read'],
        scopeDelimiter: ' ',
        oauthType: '2.0'
      },
      auth0: {
        name: 'auth0',
        oauthType: 'auth0-lock',
        clientId: 'your_client_id',
        clientDomain: 'your_domain_url',
        display: 'popup',
        lockOptions: {},
        responseType: 'token',
        state: randomState
      }
    };
    this._authToken = 'Bearer';
    this._responseTokenProp = 'access_token';
    this._tokenName = 'token';
    this._tokenRoot = false;
    this._tokenPrefix = 'aurelia';
    this._logoutOnInvalidtoken = false;
  }

  BaseConfig.prototype.joinBase = function joinBase(url) {
    return (0, aureliaPath.join)(this.baseUrl, url);
  };

  BaseConfig.prototype.configure = function configure(incoming) {
    for (var key in incoming) {
      if (incoming.hasOwnProperty(key)) {
        var value = incoming[key];

        if (value !== undefined) {
          if (Array.isArray(value) || (typeof value === 'undefined' ? 'undefined' : _typeof(value)) !== 'object' || value === null) {
            this[key] = value;
          } else {
            (0, _extend2.default)(true, this[key], value);
          }
        }
      }
    }
  };

  BaseConfig.prototype.getOptionsForTokenRequests = function getOptionsForTokenRequests() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    return (0, _extend2.default)(true, {}, { headers: this.defaultHeadersForTokenRequests }, options);
  };

  _createClass(BaseConfig, [{
    key: 'authToken',
    set: function set(authToken) {
      logger.warn('BaseConfig.authToken is deprecated. Use BaseConfig.authTokenType instead.');
      this._authTokenType = authToken;
      this.authTokenType = authToken;

      return authToken;
    },
    get: function get() {
      return this._authTokenType;
    }
  }, {
    key: 'responseTokenProp',
    set: function set(responseTokenProp) {
      logger.warn('BaseConfig.responseTokenProp is deprecated. Use BaseConfig.accessTokenProp instead.');
      this._responseTokenProp = responseTokenProp;
      this.accessTokenProp = responseTokenProp;

      return responseTokenProp;
    },
    get: function get() {
      return this._responseTokenProp;
    }
  }, {
    key: 'tokenRoot',
    set: function set(tokenRoot) {
      logger.warn('BaseConfig.tokenRoot is deprecated. Use BaseConfig.accessTokenRoot instead.');
      this._tokenRoot = tokenRoot;
      this.accessTokenRoot = tokenRoot;

      return tokenRoot;
    },
    get: function get() {
      return this._tokenRoot;
    }
  }, {
    key: 'tokenName',
    set: function set(tokenName) {
      logger.warn('BaseConfig.tokenName is deprecated. Use BaseConfig.accessTokenName instead.');
      this._tokenName = tokenName;
      this.accessTokenName = tokenName;

      return tokenName;
    },
    get: function get() {
      return this._tokenName;
    }
  }, {
    key: 'tokenPrefix',
    set: function set(tokenPrefix) {
      logger.warn('BaseConfig.tokenPrefix is obsolete. Use BaseConfig.storageKey instead.');
      this._tokenPrefix = tokenPrefix;

      return tokenPrefix;
    },
    get: function get() {
      return this._tokenPrefix || 'aurelia';
    }
  }, {
    key: 'current',
    get: function get() {
      logger.warn('Getter BaseConfig.current is deprecated. Use BaseConfig directly instead.');

      return this;
    },
    set: function set(_) {
      throw new Error('Setter BaseConfig.current has been removed. Use BaseConfig directly instead.');
    }
  }, {
    key: '_current',
    get: function get() {
      logger.warn('Getter BaseConfig._current is deprecated. Use BaseConfig directly instead.');

      return this;
    },
    set: function set(_) {
      throw new Error('Setter BaseConfig._current has been removed. Use BaseConfig directly instead.');
    }
  }, {
    key: 'logoutOnInvalidtoken',
    set: function set(logoutOnInvalidtoken) {
      logger.warn('BaseConfig.logoutOnInvalidtoken is obsolete. Use BaseConfig.logoutOnInvalidToken instead.');
      this._logoutOnInvalidtoken = logoutOnInvalidtoken;
      this.logoutOnInvalidToken = logoutOnInvalidtoken;

      return logoutOnInvalidtoken;
    },
    get: function get() {
      return this._logoutOnInvalidtoken;
    }
  }]);

  return BaseConfig;
}();

function randomState() {
  var rand = Math.random().toString(36).substr(2);

  return encodeURIComponent(rand);
}

var Storage = exports.Storage = (_dec = (0, aureliaDependencyInjection.inject)(BaseConfig), _dec(_class2 = function () {
  function Storage(config) {
    

    this.config = config;
  }

  Storage.prototype.get = function get(key) {
    return aureliaPal.PLATFORM.global[this.config.storage].getItem(key);
  };

  Storage.prototype.set = function set(key, value) {
    aureliaPal.PLATFORM.global[this.config.storage].setItem(key, value);
  };

  Storage.prototype.remove = function remove(key) {
    aureliaPal.PLATFORM.global[this.config.storage].removeItem(key);
  };

  return Storage;
}()) || _class2);
var AuthLock = exports.AuthLock = (_dec2 = (0, aureliaDependencyInjection.inject)(Storage, BaseConfig), _dec2(_class3 = function () {
  function AuthLock(storage, config) {
    

    this.storage = storage;
    this.config = config;
    this.defaults = {
      name: null,
      state: null,
      scope: null,
      scopeDelimiter: ' ',
      redirectUri: null,
      clientId: null,
      clientDomain: null,
      display: 'popup',
      lockOptions: {},
      popupOptions: null,
      responseType: 'token'
    };
  }

  AuthLock.prototype.open = function open(options, userData) {
    var _this3 = this;

    if (typeof aureliaPal.PLATFORM.global.Auth0Lock !== 'function') {
      throw new Error('Auth0Lock was not found in global scope. Please load it before using this provider.');
    }
    var provider = (0, _extend2.default)(true, {}, this.defaults, options);
    var stateName = provider.name + '_state';

    if (typeof provider.state === 'function') {
      this.storage.set(stateName, provider.state());
    } else if (typeof provider.state === 'string') {
      this.storage.set(stateName, provider.state);
    }

    var opts = {
      auth: {
        params: {}
      }
    };

    if (Array.isArray(provider.scope) && provider.scope.length) {
      opts.auth.params.scope = provider.scope.join(provider.scopeDelimiter);
    }
    if (provider.state) {
      opts.auth.params.state = this.storage.get(provider.name + '_state');
    }
    if (provider.display === 'popup') {
      opts.auth.redirect = false;
    } else if (typeof provider.redirectUri === 'string') {
      opts.auth.redirect = true;
      opts.auth.redirectUrl = provider.redirectUri;
    }
    if (_typeof(provider.popupOptions) === 'object') {
      opts.popupOptions = provider.popupOptions;
    }
    if (typeof provider.responseType === 'string') {
      opts.auth.responseType = provider.responseType;
    }
    var lockOptions = (0, _extend2.default)(true, {}, provider.lockOptions, opts);

    this.lock = this.lock || new aureliaPal.PLATFORM.global.Auth0Lock(provider.clientId, provider.clientDomain, lockOptions);

    var openPopup = new Promise(function (resolve, reject) {
      _this3.lock.on('authenticated', function (authResponse) {
        if (!lockOptions.auth.redirect) {
          _this3.lock.hide();
        }
        resolve({
          access_token: authResponse.accessToken,
          id_token: authResponse.idToken
        });
      });
      _this3.lock.on('unrecoverable_error', function (err) {
        if (!lockOptions.auth.redirect) {
          _this3.lock.hide();
        }
        reject(err);
      });
      _this3.lock.show();
    });

    return openPopup.then(function (lockResponse) {
      if (provider.responseType === 'token' || provider.responseType === 'id_token%20token' || provider.responseType === 'token%20id_token' || provider.responseType === 'token id_token') {
        return lockResponse;
      }

      throw new Error('Only `token` responseType is supported');
    });
  };

  return AuthLock;
}()) || _class3);
var OAuth1 = exports.OAuth1 = (_dec3 = (0, aureliaDependencyInjection.inject)(Storage, Popup, BaseConfig), _dec3(_class4 = function () {
  function OAuth1(storage, popup, config) {
    

    this.storage = storage;
    this.config = config;
    this.popup = popup;
    this.defaults = {
      url: null,
      name: null,
      popupOptions: null,
      redirectUri: null,
      authorizationEndpoint: null
    };
  }

  OAuth1.prototype.open = function open(options, userData) {
    var _this4 = this;

    var provider = (0, _extend2.default)(true, {}, this.defaults, options);
    var serverUrl = this.config.joinBase(provider.url);

    if (this.config.platform !== 'mobile') {
      this.popup = this.popup.open('', provider.name, provider.popupOptions);
    }

    return this.config.client.post(serverUrl).then(function (response) {
      var url = provider.authorizationEndpoint + '?' + (0, aureliaPath.buildQueryString)(response);

      if (_this4.config.platform === 'mobile') {
        _this4.popup = _this4.popup.open(url, provider.name, provider.popupOptions);
      } else {
        _this4.popup.popupWindow.location = url;
      }

      var popupListener = _this4.config.platform === 'mobile' ? _this4.popup.eventListener(provider.redirectUri) : _this4.popup.pollPopup();

      return popupListener.then(function (result) {
        return _this4.exchangeForToken(result, userData, provider);
      });
    });
  };

  OAuth1.prototype.exchangeForToken = function exchangeForToken(oauthData, userData, provider) {
    var data = (0, _extend2.default)(true, {}, userData, oauthData);
    var serverUrl = this.config.joinBase(provider.url);
    var credentials = this.config.withCredentials ? 'include' : 'same-origin';

    return this.config.client.post(serverUrl, data, { credentials: credentials });
  };

  return OAuth1;
}()) || _class4);
var OAuth2 = exports.OAuth2 = (_dec4 = (0, aureliaDependencyInjection.inject)(Storage, Popup, BaseConfig), _dec4(_class5 = function () {
  function OAuth2(storage, popup, config) {
    

    this.storage = storage;
    this.config = config;
    this.popup = popup;
    this.defaults = {
      url: null,
      name: null,
      state: null,
      scope: null,
      scopeDelimiter: null,
      redirectUri: null,
      popupOptions: null,
      authorizationEndpoint: null,
      responseParams: null,
      requiredUrlParams: null,
      optionalUrlParams: null,
      defaultUrlParams: ['response_type', 'client_id', 'redirect_uri'],
      responseType: 'code'
    };
  }

  OAuth2.prototype.open = function open(options, userData) {
    var _this5 = this;

    var provider = (0, _extend2.default)(true, {}, this.defaults, options);
    var stateName = provider.name + '_state';

    if (typeof provider.state === 'function') {
      this.storage.set(stateName, provider.state());
    } else if (typeof provider.state === 'string') {
      this.storage.set(stateName, provider.state);
    }

    var url = provider.authorizationEndpoint + '?' + (0, aureliaPath.buildQueryString)(this.buildQuery(provider));
    var popup = this.popup.open(url, provider.name, provider.popupOptions);
    var openPopup = this.config.platform === 'mobile' ? popup.eventListener(provider.redirectUri) : popup.pollPopup();

    return openPopup.then(function (oauthData) {
      if (provider.responseType === 'token' || provider.responseType === 'id_token token' || provider.responseType === 'token id_token') {
        return oauthData;
      }
      if (oauthData.state && oauthData.state !== _this5.storage.get(stateName)) {
        return Promise.reject('OAuth 2.0 state parameter mismatch.');
      }

      return _this5.exchangeForToken(oauthData, userData, provider);
    });
  };

  OAuth2.prototype.exchangeForToken = function exchangeForToken(oauthData, userData, provider) {
    var data = (0, _extend2.default)(true, {}, userData, {
      clientId: provider.clientId,
      redirectUri: provider.redirectUri
    }, oauthData);

    var serverUrl = this.config.joinBase(provider.url);
    var credentials = this.config.withCredentials ? 'include' : 'same-origin';

    return this.config.client.post(serverUrl, data, { credentials: credentials });
  };

  OAuth2.prototype.buildQuery = function buildQuery(provider) {
    var _this6 = this;

    var query = {};
    var urlParams = ['defaultUrlParams', 'requiredUrlParams', 'optionalUrlParams'];

    urlParams.forEach(function (params) {
      (provider[params] || []).forEach(function (paramName) {
        var camelizedName = camelCase(paramName);
        var paramValue = typeof provider[paramName] === 'function' ? provider[paramName]() : provider[camelizedName];

        if (paramName === 'state') {
          paramValue = encodeURIComponent(_this6.storage.get(provider.name + '_state'));
        }

        if (paramName === 'scope' && Array.isArray(paramValue)) {
          paramValue = paramValue.join(provider.scopeDelimiter);

          if (provider.scopePrefix) {
            paramValue = provider.scopePrefix + provider.scopeDelimiter + paramValue;
          }
        }

        query[paramName] = paramValue;
      });
    });

    return query;
  };

  OAuth2.prototype.close = function close(options) {
    var provider = (0, _extend2.default)(true, {}, this.defaults, options);
    var url = provider.logoutEndpoint + '?' + (0, aureliaPath.buildQueryString)(this.buildLogoutQuery(provider));
    var popup = this.popup.open(url, provider.name, provider.popupOptions);
    var openPopup = this.config.platform === 'mobile' ? popup.eventListener(provider.postLogoutRedirectUri) : popup.pollPopup();

    return openPopup;
  };

  OAuth2.prototype.buildLogoutQuery = function buildLogoutQuery(provider) {
    var query = {};
    var authResponse = this.storage.get(this.config.storageKey);

    if (provider.postLogoutRedirectUri) {
      query.post_logout_redirect_uri = provider.postLogoutRedirectUri;
    }
    if (this.storage.get(provider.name + '_state')) {
      query.state = this.storage.get(provider.name + '_state');
    }
    if (JSON.parse(authResponse).id_token) {
      query.id_token_hint = JSON.parse(authResponse).id_token;
    }

    return query;
  };

  return OAuth2;
}()) || _class5);

function camelCase(name) {
  return name.replace(/([:\-_]+(.))/g, function (_, separator, letter, offset) {
    return offset ? letter.toUpperCase() : letter;
  });
}

var Authentication = exports.Authentication = (_dec5 = (0, aureliaDependencyInjection.inject)(Storage, BaseConfig, OAuth1, OAuth2, AuthLock), _dec6 = (0, aureliaMetadata.deprecated)({ message: 'Use baseConfig.loginRoute instead.' }), _dec7 = (0, aureliaMetadata.deprecated)({ message: 'Use baseConfig.loginRedirect instead.' }), _dec8 = (0, aureliaMetadata.deprecated)({ message: 'Use baseConfig.joinBase(baseConfig.loginUrl) instead.' }), _dec9 = (0, aureliaMetadata.deprecated)({ message: 'Use baseConfig.joinBase(baseConfig.signupUrl) instead.' }), _dec10 = (0, aureliaMetadata.deprecated)({ message: 'Use baseConfig.joinBase(baseConfig.profileUrl) instead.' }), _dec11 = (0, aureliaMetadata.deprecated)({ message: 'Use .getAccessToken() instead.' }), _dec5(_class6 = (_class7 = function () {
  function Authentication(storage, config, oAuth1, oAuth2, auth0Lock) {
    

    this.storage = storage;
    this.config = config;
    this.oAuth1 = oAuth1;
    this.oAuth2 = oAuth2;
    this.auth0Lock = auth0Lock;
    this.updateTokenCallstack = [];
    this.accessToken = null;
    this.refreshToken = null;
    this.idToken = null;
    this.payload = null;
    this.exp = null;
    this.responseAnalyzed = false;
  }

  Authentication.prototype.getLoginRoute = function getLoginRoute() {
    return this.config.loginRoute;
  };

  Authentication.prototype.getLoginRedirect = function getLoginRedirect() {
    return this.config.loginRedirect;
  };

  Authentication.prototype.getLoginUrl = function getLoginUrl() {
    return this.Config.joinBase(this.config.loginUrl);
  };

  Authentication.prototype.getSignupUrl = function getSignupUrl() {
    return this.Config.joinBase(this.config.signupUrl);
  };

  Authentication.prototype.getProfileUrl = function getProfileUrl() {
    return this.Config.joinBase(this.config.profileUrl);
  };

  Authentication.prototype.getToken = function getToken() {
    return this.getAccessToken();
  };

  Authentication.prototype.getResponseObject = function getResponseObject() {
    return JSON.parse(this.storage.get(this.config.storageKey));
  };

  Authentication.prototype.setResponseObject = function setResponseObject(response) {
    if (response) {
      if (this.config.keepOldResponseProperties) {
        var oldResponse = this.getResponseObject();

        response = Object.assign({}, oldResponse, response);
      }
      this.getDataFromResponse(response);
      this.storage.set(this.config.storageKey, JSON.stringify(response));

      return;
    }
    this.accessToken = null;
    this.refreshToken = null;
    this.idToken = null;
    this.payload = null;
    this.exp = null;
    this.responseAnalyzed = false;

    this.storage.remove(this.config.storageKey);
  };

  Authentication.prototype.getAccessToken = function getAccessToken() {
    if (!this.responseAnalyzed) this.getDataFromResponse(this.getResponseObject());

    return this.accessToken;
  };

  Authentication.prototype.getRefreshToken = function getRefreshToken() {
    if (!this.responseAnalyzed) this.getDataFromResponse(this.getResponseObject());

    return this.refreshToken;
  };

  Authentication.prototype.getIdToken = function getIdToken() {
    if (!this.responseAnalyzed) this.getDataFromResponse(this.getResponseObject());

    return this.idToken;
  };

  Authentication.prototype.getPayload = function getPayload() {
    if (!this.responseAnalyzed) this.getDataFromResponse(this.getResponseObject());

    return this.payload;
  };

  Authentication.prototype.getIdPayload = function getIdPayload() {
    if (!this.responseAnalyzed) this.getDataFromResponse(this.getResponseObject());

    return this.idPayload;
  };

  Authentication.prototype.getExp = function getExp() {
    if (!this.responseAnalyzed) this.getDataFromResponse(this.getResponseObject());

    return this.exp;
  };

  Authentication.prototype.getTtl = function getTtl() {
    var exp = this.getExp();

    return Number.isNaN(exp) ? NaN : exp - Math.round(new Date().getTime() / 1000);
  };

  Authentication.prototype.isTokenExpired = function isTokenExpired() {
    var timeLeft = this.getTtl();

    return Number.isNaN(timeLeft) ? undefined : timeLeft < 0;
  };

  Authentication.prototype.isAuthenticated = function isAuthenticated() {
    return !!this.getAccessToken() && !this.isTokenExpired();
  };

  Authentication.prototype.getDataFromResponse = function getDataFromResponse(response) {
    var config = this.config;

    this.accessToken = typeof this.config.getAccessTokenFromResponse === 'function' ? this.config.getAccessTokenFromResponse(response) : this.getTokenFromResponse(response, config.accessTokenProp, config.accessTokenName, config.accessTokenRoot);

    this.refreshToken = null;
    if (config.useRefreshToken) {
      try {
        this.refreshToken = typeof this.config.getRefreshTokenFromResponse === 'function' ? this.config.getRefreshTokenFromResponse(response) : this.getTokenFromResponse(response, config.refreshTokenProp, config.refreshTokenName, config.refreshTokenRoot);
      } catch (e) {
        this.refreshToken = null;

        logger.warn('useRefreshToken is set, but could not extract a refresh token');
      }
    }

    this.idToken = null;
    try {
      this.idToken = this.getTokenFromResponse(response, config.idTokenProp, config.idTokenName, config.idTokenRoot);
    } catch (e) {
      this.idToken = null;
    }

    this.payload = getPayload(this.accessToken);
    this.idPayload = getPayload(this.idToken);

    this.exp = parseInt(typeof this.config.getExpirationDateFromResponse === 'function' ? this.config.getExpirationDateFromResponse(response) : this.payload && this.payload.exp, 10) || NaN;

    this.responseAnalyzed = true;

    return {
      accessToken: this.accessToken,
      refreshToken: this.refreshToken,
      idToken: this.idToken,
      payload: this.payload,
      exp: this.exp
    };
  };

  Authentication.prototype.getTokenFromResponse = function getTokenFromResponse(response, tokenProp, tokenName, tokenRoot) {
    if (!response) return undefined;

    var responseTokenProp = tokenProp.split('.').reduce(function (o, x) {
      return o[x];
    }, response);

    if (typeof responseTokenProp === 'string') {
      return responseTokenProp;
    }

    if ((typeof responseTokenProp === 'undefined' ? 'undefined' : _typeof(responseTokenProp)) === 'object') {
      var tokenRootData = tokenRoot && tokenRoot.split('.').reduce(function (o, x) {
        return o[x];
      }, responseTokenProp);
      var _token = tokenRootData ? tokenRootData[tokenName] : responseTokenProp[tokenName];

      if (!_token) {
        var error = new Error('Token not found in response');

        error.responseObject = response;
        throw error;
      }

      return _token;
    }

    var token = response[tokenName] === undefined ? null : response[tokenName];

    if (!token) {
      var _error = new Error('Token not found in response');

      _error.responseObject = response;
      throw _error;
    }

    return token;
  };

  Authentication.prototype.toUpdateTokenCallstack = function toUpdateTokenCallstack() {
    var _this7 = this;

    return new Promise(function (resolve) {
      return _this7.updateTokenCallstack.push(resolve);
    });
  };

  Authentication.prototype.resolveUpdateTokenCallstack = function resolveUpdateTokenCallstack(response) {
    this.updateTokenCallstack.map(function (resolve) {
      return resolve(response);
    });
    this.updateTokenCallstack = [];
  };

  Authentication.prototype.authenticate = function authenticate(name) {
    var userData = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    var oauthType = this.config.providers[name].type;

    if (oauthType) {
      logger.warn('DEPRECATED: Setting provider.type is deprecated and replaced by provider.oauthType');
    } else {
      oauthType = this.config.providers[name].oauthType;
    }

    var providerLogin = void 0;

    if (oauthType === 'auth0-lock') {
      providerLogin = this.auth0Lock;
    } else {
      providerLogin = oauthType === '1.0' ? this.oAuth1 : this.oAuth2;
    }

    return providerLogin.open(this.config.providers[name], userData);
  };

  Authentication.prototype.logout = function logout(name) {
    var rtnValue = Promise.resolve('Not Applicable');

    if (this.config.providers[name].oauthType !== '2.0' || !this.config.providers[name].logoutEndpoint) {
      return rtnValue;
    }

    return this.oAuth2.close(this.config.providers[name]);
  };

  Authentication.prototype.redirect = function redirect(redirectUrl, defaultRedirectUrl, query) {
    if (redirectUrl === true) {
      logger.warn('DEPRECATED: Setting redirectUrl === true to actually *not redirect* is deprecated. Set redirectUrl === \'\' instead.');

      return;
    }

    if (redirectUrl === false) {
      logger.warn('BREAKING CHANGE: Setting redirectUrl === false to actually *do redirect* is deprecated. Set redirectUrl to undefined or null to use the defaultRedirectUrl if so desired.');
    }

    if (redirectUrl === 0) {
      logger.warn('BREAKING CHANGE: Setting redirectUrl === 0 is deprecated. Set redirectUrl to \'\' instead.');

      return;
    }

    if (redirectUrl === '') {
      return;
    }

    if (typeof redirectUrl === 'string') {
      aureliaPal.PLATFORM.location.href = encodeURI(redirectUrl + (query ? '?' + (0, aureliaPath.buildQueryString)(query) : ''));
    } else if (defaultRedirectUrl) {
      aureliaPal.PLATFORM.location.href = defaultRedirectUrl + (query ? '?' + (0, aureliaPath.buildQueryString)(query) : '');
    }
  };

  _createClass(Authentication, [{
    key: 'responseObject',
    get: function get() {
      logger.warn('Getter Authentication.responseObject is deprecated. Use Authentication.getResponseObject() instead.');

      return this.getResponseObject();
    },
    set: function set(response) {
      logger.warn('Setter Authentication.responseObject is deprecated. Use AuthServive.setResponseObject(response) instead.');
      this.setResponseObject(response);
    }
  }, {
    key: 'hasDataStored',
    get: function get() {
      logger.warn('Authentication.hasDataStored is deprecated. Use Authentication.responseAnalyzed instead.');

      return this.responseAnalyzed;
    }
  }]);

  return Authentication;
}(), (_applyDecoratedDescriptor(_class7.prototype, 'getLoginRoute', [_dec6], Object.getOwnPropertyDescriptor(_class7.prototype, 'getLoginRoute'), _class7.prototype), _applyDecoratedDescriptor(_class7.prototype, 'getLoginRedirect', [_dec7], Object.getOwnPropertyDescriptor(_class7.prototype, 'getLoginRedirect'), _class7.prototype), _applyDecoratedDescriptor(_class7.prototype, 'getLoginUrl', [_dec8], Object.getOwnPropertyDescriptor(_class7.prototype, 'getLoginUrl'), _class7.prototype), _applyDecoratedDescriptor(_class7.prototype, 'getSignupUrl', [_dec9], Object.getOwnPropertyDescriptor(_class7.prototype, 'getSignupUrl'), _class7.prototype), _applyDecoratedDescriptor(_class7.prototype, 'getProfileUrl', [_dec10], Object.getOwnPropertyDescriptor(_class7.prototype, 'getProfileUrl'), _class7.prototype), _applyDecoratedDescriptor(_class7.prototype, 'getToken', [_dec11], Object.getOwnPropertyDescriptor(_class7.prototype, 'getToken'), _class7.prototype)), _class7)) || _class6);

function getPayload(token) {
  var payload = null;

  try {
    payload = token ? (0, _jwtDecode2.default)(token) : null;
  } catch (_) {}

  return payload;
}

var AuthService = exports.AuthService = (_dec12 = (0, aureliaDependencyInjection.inject)(Authentication, BaseConfig, aureliaTemplatingResources.BindingSignaler, aureliaEventAggregator.EventAggregator), _dec13 = (0, aureliaMetadata.deprecated)({ message: 'Use .getAccessToken() instead.' }), _dec12(_class8 = (_class9 = function () {
  function AuthService(authentication, config, bindingSignaler, eventAggregator) {
    var _this8 = this;

    

    this.authenticated = false;
    this.timeoutID = 0;

    this.storageEventHandler = function (event) {
      if (event.key !== _this8.config.storageKey || event.newValue === event.oldValue) {
        return;
      }

      if (event.newValue) {
        _this8.authentication.storage.set(_this8.config.storageKey, event.newValue);
      } else {
        _this8.authentication.storage.remove(_this8.config.storageKey);
      }

      if (event.newValue && _this8.config.autoUpdateToken && _this8.authentication.getAccessToken() && _this8.authentication.getRefreshToken()) {
        _this8.setResponseObject(_this8.authentication.getResponseObject());

        return;
      }

      logger.info('Stored token changed event');

      var wasAuthenticated = _this8.authenticated;

      _this8.authentication.responseAnalyzed = false;
      _this8.updateAuthenticated();

      if (wasAuthenticated === _this8.authenticated) {
        return;
      }

      if (_this8.config.storageChangedRedirect) {
        aureliaPal.PLATFORM.location.href = _this8.config.storageChangedRedirect;
      }

      if (_this8.config.storageChangedReload) {
        aureliaPal.PLATFORM.location.reload();
      }
    };

    this.authentication = authentication;
    this.config = config;
    this.bindingSignaler = bindingSignaler;
    this.eventAggregator = eventAggregator;

    var oldStorageKey = config.tokenPrefix ? config.tokenPrefix + '_' + config.tokenName : config.tokenName;
    var oldToken = authentication.storage.get(oldStorageKey);

    if (oldToken) {
      logger.info('Found token with deprecated format in storage. Converting it to new format. No further action required.');
      var fakeOldResponse = {};

      fakeOldResponse[config.accessTokenProp] = oldToken;
      this.setResponseObject(fakeOldResponse);
      authentication.storage.remove(oldStorageKey);
    }

    this.setResponseObject(this.authentication.getResponseObject());

    aureliaPal.PLATFORM.addEventListener('storage', this.storageEventHandler);
  }

  AuthService.prototype.setTimeout = function setTimeout(ttl) {
    var _this9 = this;

    var maxTimeout = 2147483647;
    if (ttl > maxTimeout) {
      ttl = maxTimeout;
      logger.warn('Token timeout limited to ', maxTimeout, ' ms (ca 24.85d).');
    }

    this.clearTimeout();

    var expiredTokenHandler = function expiredTokenHandler() {
      if (_this9.config.autoUpdateToken && _this9.authentication.getAccessToken() && _this9.authentication.getRefreshToken()) {
        _this9.updateToken().catch(function (error) {
          return logger.warn(error.message);
        });

        return;
      }

      _this9.setResponseObject(null);

      if (_this9.config.expiredRedirect) {
        aureliaPal.PLATFORM.location.assign(_this9.config.expiredRedirect);
      }
    };

    this.timeoutID = aureliaPal.PLATFORM.global.setTimeout(expiredTokenHandler, ttl);
    aureliaPal.PLATFORM.addEventListener('focus', function () {
      if (_this9.isTokenExpired()) {
        expiredTokenHandler();
      }
    });
  };

  AuthService.prototype.clearTimeout = function clearTimeout() {
    if (this.timeoutID) {
      aureliaPal.PLATFORM.global.clearTimeout(this.timeoutID);
    }
    this.timeoutID = 0;
  };

  AuthService.prototype.setResponseObject = function setResponseObject(response) {
    this.authentication.setResponseObject(response);

    this.updateAuthenticated();
  };

  AuthService.prototype.updateAuthenticated = function updateAuthenticated() {
    this.clearTimeout();

    var wasAuthenticated = this.authenticated;

    this.authenticated = this.authentication.isAuthenticated();

    if (this.authenticated && !Number.isNaN(this.authentication.exp)) {
      this.setTimeout(this.getTtl() * 1000);
    }

    if (wasAuthenticated !== this.authenticated) {
      this.bindingSignaler.signal('authentication-change');
      this.eventAggregator.publish('authentication-change', this.authenticated);

      logger.info('Authorization changed to: ' + this.authenticated);
    }
  };

  AuthService.prototype.getMe = function getMe(criteriaOrId) {
    if (typeof criteriaOrId === 'string' || typeof criteriaOrId === 'number') {
      criteriaOrId = { id: criteriaOrId };
    }

    return this.client.find(this.config.joinBase(this.config.profileUrl), criteriaOrId);
  };

  AuthService.prototype.updateMe = function updateMe(body, criteriaOrId) {
    if (typeof criteriaOrId === 'string' || typeof criteriaOrId === 'number') {
      criteriaOrId = { id: criteriaOrId };
    }
    if (this.config.profileMethod === 'put') {
      return this.client.update(this.config.joinBase(this.config.profileUrl), criteriaOrId, body);
    }

    return this.client.patch(this.config.joinBase(this.config.profileUrl), criteriaOrId, body);
  };

  AuthService.prototype.getAccessToken = function getAccessToken() {
    return this.authentication.getAccessToken();
  };

  AuthService.prototype.getCurrentToken = function getCurrentToken() {
    return this.getAccessToken();
  };

  AuthService.prototype.getRefreshToken = function getRefreshToken() {
    return this.authentication.getRefreshToken();
  };

  AuthService.prototype.getIdToken = function getIdToken() {
    return this.authentication.getIdToken();
  };

  AuthService.prototype.isAuthenticated = function isAuthenticated(callback) {
    var _this10 = this;

    this.authentication.responseAnalyzed = false;

    var authenticated = this.authentication.isAuthenticated();

    if (!authenticated && this.config.autoUpdateToken && this.authentication.getAccessToken() && this.authentication.getRefreshToken()) {
      this.updateToken().then(function () {
        if (typeof callback === 'function') {
          callback(_this10.authenticated);
        }
      }).catch(function (error) {
        return logger.warn(error.message);
      });

      authenticated = true;
    } else if (typeof callback === 'function') {
      aureliaPal.PLATFORM.global.setTimeout(function () {
        try {
          callback(authenticated);
        } catch (error) {
          logger.warn(error.message);
        }
      }, 1);
    }

    return authenticated;
  };

  AuthService.prototype.getExp = function getExp() {
    return this.authentication.getExp();
  };

  AuthService.prototype.getTtl = function getTtl() {
    return this.authentication.getTtl();
  };

  AuthService.prototype.isTokenExpired = function isTokenExpired() {
    return this.authentication.isTokenExpired();
  };

  AuthService.prototype.getTokenPayload = function getTokenPayload() {
    return this.authentication.getPayload();
  };

  AuthService.prototype.getIdTokenPayload = function getIdTokenPayload() {
    return this.authentication.getIdPayload();
  };

  AuthService.prototype.updateToken = function updateToken() {
    var _this11 = this;

    if (!this.authentication.getRefreshToken()) {
      return Promise.reject(new Error('refreshToken not set'));
    }

    if (this.authentication.updateTokenCallstack.length === 0) {
      var content = {
        grant_type: 'refresh_token'
      };

      if (this.config.clientId) {
        content.client_id = this.config.clientId;
      }
      if (this.config.clientSecret) {
        content.client_secret = this.config.clientSecret;
      }

      content[this.config.refreshTokenSubmitProp] = this.authentication.getRefreshToken();

      this.client.post(this.config.joinBase(this.config.refreshTokenUrl ? this.config.refreshTokenUrl : this.config.loginUrl), content, this.config.getOptionsForTokenRequests()).then(function (response) {
        _this11.setResponseObject(response);
        if (_this11.getAccessToken()) {
          _this11.authentication.resolveUpdateTokenCallstack(_this11.isAuthenticated());
        } else {
          _this11.setResponseObject(null);

          if (_this11.config.expiredRedirect) {
            aureliaPal.PLATFORM.location.assign(_this11.config.expiredRedirect);
          }
          _this11.authentication.resolveUpdateTokenCallstack(Promise.reject(new Error('accessToken not found in refreshToken response')));
        }
      }).catch(function (error) {
        _this11.setResponseObject(null);

        if (_this11.config.expiredRedirect) {
          aureliaPal.PLATFORM.location.assign(_this11.config.expiredRedirect);
        }
        _this11.authentication.resolveUpdateTokenCallstack(Promise.reject(error));
      });
    }

    return this.authentication.toUpdateTokenCallstack();
  };

  AuthService.prototype.signup = function signup(displayNameOrCredentials, emailOrOptions, passwordOrRedirectUri, options, redirectUri) {
    var _this12 = this;

    var normalized = {};

    if ((typeof displayNameOrCredentials === 'undefined' ? 'undefined' : _typeof(displayNameOrCredentials)) === 'object') {
      normalized.credentials = displayNameOrCredentials;
      normalized.options = emailOrOptions;
      normalized.redirectUri = passwordOrRedirectUri;
    } else {
      normalized.credentials = {
        'displayName': displayNameOrCredentials,
        'email': emailOrOptions,
        'password': passwordOrRedirectUri
      };
      normalized.options = options;
      normalized.redirectUri = redirectUri;
    }

    return this.client.post(this.config.joinBase(this.config.signupUrl), normalized.credentials, normalized.options).then(function (response) {
      if (_this12.config.loginOnSignup) {
        _this12.setResponseObject(response);
      }
      _this12.authentication.redirect(normalized.redirectUri, _this12.config.signupRedirect);

      return response;
    });
  };

  AuthService.prototype.login = function login(emailOrCredentials, passwordOrOptions, optionsOrRedirectUri, redirectUri) {
    var _this13 = this;

    var normalized = {};

    if ((typeof emailOrCredentials === 'undefined' ? 'undefined' : _typeof(emailOrCredentials)) === 'object') {
      normalized.credentials = emailOrCredentials;
      normalized.options = this.config.getOptionsForTokenRequests(passwordOrOptions);
      normalized.redirectUri = optionsOrRedirectUri;
    } else if (typeof emailOrCredentials === 'string') {
      normalized.credentials = {
        'email': emailOrCredentials,
        'password': passwordOrOptions
      };
      normalized.options = this.config.getOptionsForTokenRequests(optionsOrRedirectUri);
      normalized.redirectUri = redirectUri;
    }

    if (this.config.clientId) {
      normalized.credentials.client_id = this.config.clientId;
    }

    if (this.config.clientSecret) {
      normalized.credentials.client_secret = this.config.clientSecret;
    }

    return this.client.post(this.config.joinBase(this.config.loginUrl), normalized.credentials, normalized.options).then(function (response) {
      _this13.setResponseObject(response);

      _this13.authentication.redirect(normalized.redirectUri, _this13.config.loginRedirect);

      return response;
    });
  };

  AuthService.prototype.logout = function logout(redirectUri, query, name) {
    var _this14 = this;

    var localLogout = function localLogout(response) {
      return new Promise(function (resolve) {
        _this14.setResponseObject(null);

        _this14.authentication.redirect(redirectUri, _this14.config.logoutRedirect, query);

        if (typeof _this14.onLogout === 'function') {
          _this14.onLogout(response);
        }
        resolve(response);
      });
    };

    if (name) {
      if (this.config.providers[name].logoutEndpoint) {
        return this.authentication.logout(name).then(function (logoutResponse) {
          var stateValue = _this14.authentication.storage.get(name + '_state');

          if (logoutResponse.state !== stateValue) {
            return Promise.reject('OAuth2 response state value differs');
          }

          return localLogout(logoutResponse);
        });
      }
    } else {
      return this.config.logoutUrl ? this.client.request(this.config.logoutMethod, this.config.joinBase(this.config.logoutUrl)).then(localLogout).catch(localLogout) : localLogout();
    }
  };

  AuthService.prototype.authenticate = function authenticate(name, redirectUri, userData) {
    var _this15 = this;

    return this.authentication.authenticate(name, userData).then(function (response) {
      _this15.setResponseObject(response);

      _this15.authentication.redirect(redirectUri, _this15.config.loginRedirect);

      return response;
    });
  };

  AuthService.prototype.unlink = function unlink(name, redirectUri) {
    var _this16 = this;

    var unlinkUrl = this.config.joinBase(this.config.unlinkUrl) + name;

    return this.client.request(this.config.unlinkMethod, unlinkUrl).then(function (response) {
      _this16.authentication.redirect(redirectUri);

      return response;
    });
  };

  _createClass(AuthService, [{
    key: 'client',
    get: function get() {
      return this.config.client;
    }
  }, {
    key: 'auth',
    get: function get() {
      logger.warn('AuthService.auth is deprecated. Use .authentication instead.');

      return this.authentication;
    }
  }]);

  return AuthService;
}(), (_applyDecoratedDescriptor(_class9.prototype, 'getCurrentToken', [_dec13], Object.getOwnPropertyDescriptor(_class9.prototype, 'getCurrentToken'), _class9.prototype)), _class9)) || _class8);
var AuthenticateStep = exports.AuthenticateStep = (_dec14 = (0, aureliaDependencyInjection.inject)(AuthService), _dec14(_class11 = function () {
  function AuthenticateStep(authService) {
    

    this.authService = authService;
  }

  AuthenticateStep.prototype.run = function run(routingContext, next) {
    var isLoggedIn = this.authService.authenticated;
    var loginRoute = this.authService.config.loginRoute;

    if (routingContext.getAllInstructions().some(function (route) {
      return route.config.auth === true;
    })) {
      if (!isLoggedIn) {
        return next.cancel(new aureliaRouter.Redirect(loginRoute));
      }
    } else if (isLoggedIn && routingContext.getAllInstructions().some(function (route) {
      return route.fragment === loginRoute;
    })) {
      return next.cancel(new aureliaRouter.Redirect(this.authService.config.loginRedirect));
    }

    return next();
  };

  return AuthenticateStep;
}()) || _class11);
var AuthorizeStep = exports.AuthorizeStep = (_dec15 = (0, aureliaDependencyInjection.inject)(AuthService), _dec15(_class12 = function () {
  function AuthorizeStep(authService) {
    

    logger.warn('AuthorizeStep is deprecated. Use AuthenticateStep instead.');

    this.authService = authService;
  }

  AuthorizeStep.prototype.run = function run(routingContext, next) {
    var isLoggedIn = this.authService.isAuthenticated();
    var loginRoute = this.authService.config.loginRoute;

    if (routingContext.getAllInstructions().some(function (route) {
      return route.config.auth;
    })) {
      if (!isLoggedIn) {
        return next.cancel(new aureliaRouter.Redirect(loginRoute));
      }
    } else if (isLoggedIn && routingContext.getAllInstructions().some(function (route) {
      return route.fragment === loginRoute;
    })) {
      return next.cancel(new aureliaRouter.Redirect(this.authService.config.loginRedirect));
    }

    return next();
  };

  return AuthorizeStep;
}()) || _class12);
var FetchConfig = exports.FetchConfig = (_dec16 = (0, aureliaDependencyInjection.inject)(aureliaFetchClient.HttpClient, aureliaApi.Config, AuthService, BaseConfig), _dec16(_class13 = function () {
  function FetchConfig(httpClient, clientConfig, authService, config) {
    

    this.httpClient = httpClient;
    this.clientConfig = clientConfig;
    this.authService = authService;
    this.config = config;
  }

  FetchConfig.prototype.configure = function configure(client) {
    var _this17 = this;

    if (Array.isArray(client)) {
      var configuredClients = [];

      client.forEach(function (toConfigure) {
        configuredClients.push(_this17.configure(toConfigure));
      });

      return configuredClients;
    }

    if (typeof client === 'string') {
      var endpoint = this.clientConfig.getEndpoint(client);

      if (!endpoint) {
        throw new Error('There is no \'' + (client || 'default') + '\' endpoint registered.');
      }
      client = endpoint.client;
    } else if (client instanceof aureliaApi.Rest) {
      client = client.client;
    } else if (!(client instanceof aureliaFetchClient.HttpClient)) {
      client = this.httpClient;
    }

    client.interceptors.push(this.interceptor);

    return client;
  };

  _createClass(FetchConfig, [{
    key: 'interceptor',
    get: function get() {
      var _this18 = this;

      return {
        request: function (_request) {
          function request(_x3) {
            return _request.apply(this, arguments);
          }

          request.toString = function () {
            return _request.toString();
          };

          return request;
        }(function (request) {
          if (!_this18.config.httpInterceptor || !_this18.authService.isAuthenticated()) {
            return request;
          }
          var token = _this18.authService.getAccessToken();

          if (_this18.config.authTokenType) {
            token = _this18.config.authTokenType + ' ' + token;
          }

          request.headers.set(_this18.config.authHeader, token);

          return request;
        }),
        response: function (_response) {
          function response(_x4, _x5) {
            return _response.apply(this, arguments);
          }

          response.toString = function () {
            return _response.toString();
          };

          return response;
        }(function (response, request) {
          return new Promise(function (resolve, reject) {
            if (response.ok) {
              return resolve(response);
            }

            if (response.status !== 401) {
              return resolve(response);
            }

            if (!_this18.authService.authenticated) {
              return reject(response);
            }

            if (_this18.config.httpInterceptor && _this18.config.logoutOnInvalidToken && !_this18.authService.isTokenExpired()) {
              return reject(_this18.authService.logout());
            }

            if (!_this18.config.httpInterceptor || !_this18.authService.isTokenExpired()) {
              return resolve(response);
            }

            if (!_this18.config.useRefreshToken || !_this18.authService.getRefreshToken()) {
              return resolve(response);
            }

            resolve(_this18.authService.updateToken().then(function () {
              var token = _this18.authService.getAccessToken();

              if (_this18.config.authTokenType) {
                token = _this18.config.authTokenType + ' ' + token;
              }

              request.headers.set(_this18.config.authHeader, token);

              return _this18.httpClient.fetch(request).then(resolve);
            }));
          });
        })
      };
    }
  }]);

  return FetchConfig;
}()) || _class13);
function configure(frameworkConfig, config) {
  if (!aureliaPal.PLATFORM.location.origin) {
    aureliaPal.PLATFORM.location.origin = aureliaPal.PLATFORM.location.protocol + '//' + aureliaPal.PLATFORM.location.hostname + (aureliaPal.PLATFORM.location.port ? ':' + aureliaPal.PLATFORM.location.port : '');
  }

  var baseConfig = frameworkConfig.container.get(BaseConfig);

  if (typeof config === 'function') {
    config(baseConfig);
  } else if ((typeof config === 'undefined' ? 'undefined' : _typeof(config)) === 'object') {
    baseConfig.configure(config);
  }

  for (var _iterator = baseConfig.globalValueConverters, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
    var _ref;

    if (_isArray) {
      if (_i >= _iterator.length) break;
      _ref = _iterator[_i++];
    } else {
      _i = _iterator.next();
      if (_i.done) break;
      _ref = _i.value;
    }

    var converter = _ref;

    frameworkConfig.globalResources(aureliaPal.PLATFORM.moduleName('./' + converter));
    logger.info('Add globalResources value-converter: ' + converter);
  }
  var fetchConfig = frameworkConfig.container.get(FetchConfig);
  var clientConfig = frameworkConfig.container.get(aureliaApi.Config);

  if (Array.isArray(baseConfig.configureEndpoints)) {
    baseConfig.configureEndpoints.forEach(function (endpointToPatch) {
      fetchConfig.configure(endpointToPatch);
    });
  }

  var client = void 0;

  if (baseConfig.endpoint !== null) {
    if (typeof baseConfig.endpoint === 'string') {
      var endpoint = clientConfig.getEndpoint(baseConfig.endpoint);

      if (!endpoint) {
        throw new Error('There is no \'' + (baseConfig.endpoint || 'default') + '\' endpoint registered.');
      }
      client = endpoint;
    } else if (baseConfig.endpoint instanceof aureliaFetchClient.HttpClient) {
      client = new aureliaApi.Rest(baseConfig.endpoint);
    }
  }

  if (!(client instanceof aureliaApi.Rest)) {
    client = new aureliaApi.Rest(frameworkConfig.container.get(aureliaFetchClient.HttpClient));
  }

  baseConfig.client = client;
}
});

unwrapExports(aureliaAuthentication);
var aureliaAuthentication_1 = aureliaAuthentication.FetchConfig;
var aureliaAuthentication_2 = aureliaAuthentication.AuthorizeStep;
var aureliaAuthentication_3 = aureliaAuthentication.AuthenticateStep;
var aureliaAuthentication_4 = aureliaAuthentication.AuthService;
var aureliaAuthentication_5 = aureliaAuthentication.Authentication;
var aureliaAuthentication_6 = aureliaAuthentication.OAuth2;
var aureliaAuthentication_7 = aureliaAuthentication.OAuth1;
var aureliaAuthentication_8 = aureliaAuthentication.AuthLock;
var aureliaAuthentication_9 = aureliaAuthentication.Storage;
var aureliaAuthentication_10 = aureliaAuthentication.BaseConfig;
var aureliaAuthentication_11 = aureliaAuthentication.logger;
var aureliaAuthentication_12 = aureliaAuthentication.Popup;
var aureliaAuthentication_13 = aureliaAuthentication.configure;

exports.User = class User {
    constructor(AuthService) {
        this.AuthService = AuthService;
    }
    getInfos() {
        this.user = this.AuthService.getTokenPayload();
        return this.user && this.user.user;
    }
    logout() {
        this.AuthService.logout();
    }
};
exports.User = __decorate([
    autoinject(),
    __metadata("design:paramtypes", [aureliaAuthentication_4])
], exports.User);

function configure$3(config) {
    config.container
        .get(aureliaViewManager_3)
        .configureNamespace("spoonx/datatable", {
        map: {
            datatable: PLATFORM.moduleName("./elements/aurelia-datatable/datatable.html")
        }
    })
        .configureNamespace("aurelia-pager", {
        framework: "aurelia",
        map: {
            pager: PLATFORM.moduleName("./elements/aurelia-pager/pager.html")
        }
    })
        .configureNamespace("spoonx/form", {
        map: {
            "aurelia-form": PLATFORM.moduleName("./elements/aurelia-form/aurelia-form.html"),
            "entity-form": PLATFORM.moduleName("./elements/aurelia-form/entity-form.html"),
            "form-element": PLATFORM.moduleName("./elements/aurelia-form/form-element.html"),
            "form-label": PLATFORM.moduleName("./elements/aurelia-form/form-label.html"),
            "form-button": PLATFORM.moduleName("./elements/aurelia-form/form-button.html"),
            "form-help": PLATFORM.moduleName("./elements/aurelia-form/form-help.html"),
            "form-group": PLATFORM.moduleName("./elements/aurelia-form/form-group.html"),
            "form-checkbox": PLATFORM.moduleName("./elements/aurelia-form/form-checkbox.html"),
            "form-association": PLATFORM.moduleName("./elements/aurelia-form/form-association.html"),
            "form-error": PLATFORM.moduleName("./elements/aurelia-form/form-error.html"),
            "form-input": PLATFORM.moduleName("./elements/aurelia-form/form-input.html"),
            "form-radio": PLATFORM.moduleName("./elements/aurelia-form/form-radio.html"),
            "form-select": PLATFORM.moduleName("./elements/aurelia-form/form-select.html"),
            "form-textarea": PLATFORM.moduleName("./elements/aurelia-form/form-textarea.html")
        }
    })
        .configureNamespace("spoonx/orm", {
        framework: "bulma",
        map: {
            "association-select": PLATFORM.moduleName("./elements/aurelia-orm/association-select.html"),
            paged: PLATFORM.moduleName("./elements/aurelia-orm/paged.html")
        }
    });
}

exports.__esModule = true;
var ColumnsFilterValueConverter = (exports.ColumnsFilterValueConverter = (function () {
    function ColumnsFilterValueConverter() { }
    ColumnsFilterValueConverter.prototype.toView = function toView(array) {
        return array.filter(function (item) {
            return item.column.indexOf(".") === -1;
        });
    };
    return ColumnsFilterValueConverter;
})());

let ConvertManagerValueConverter = class ConvertManagerValueConverter {
    constructor(viewResources$$1) {
        this.viewResources = viewResources$$1;
        this.logger = getLogger("aurelia-datatable");
    }
    runConverter(value, converter, convertParams, rowData) {
        let valueConverter$$1 = this.viewResources.getValueConverter(converter);
        if (valueConverter$$1) {
            return valueConverter$$1.toView(value, convertParams, rowData);
        }
        this.logger.error('No ValueConverter named "' + converter + '" was found!');
        return value;
    }
    toView(value, converters, rowData) {
        if (!converters) {
            return value;
        }
        if (typeof converters === "string") {
            converters = converters.split(" | ");
        }
        for (let converter of converters) {
            let index = converter.indexOf(":");
            if (index < 0) {
                value = this.runConverter(value, converter, null, rowData);
                continue;
            }
            let name = converter.slice(0, index);
            let param = this.parseParams(converter.slice(index + 1).trim());
            value = this.runConverter(value, name, param, rowData);
        }
        return value;
    }
    parseParams(str) {
        if (!str) {
            return null;
        }
        if (typer.detect(str) === "string" && str[0] !== "{") {
            return str.substr(1, str.length - 2);
        }
        return typer.cast(str);
    }
};
ConvertManagerValueConverter = __decorate([
    inject(ViewResources),
    __metadata("design:paramtypes", [Object])
], ConvertManagerValueConverter);

function styleInject(css, ref) {
  if ( ref === void 0 ) ref = {};
  var insertAt = ref.insertAt;

  if (!css || typeof document === 'undefined') { return; }

  var head = document.head || document.getElementsByTagName('head')[0];
  var style = document.createElement('style');
  style.type = 'text/css';

  if (insertAt === 'top') {
    if (head.firstChild) {
      head.insertBefore(style, head.firstChild);
    } else {
      head.appendChild(style);
    }
  } else {
    head.appendChild(style);
  }

  if (style.styleSheet) {
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(document.createTextNode(css));
  }
}

var css = ".dropdown-menu li {\n  display: block;\n  padding: 0 !important;\n}\n\n.dropdown-menu li a {\n  display: block;\n  padding: 2px 10px;\n}\n";
styleInject(css);

const logger$5 = console;
let AutoCompleteCustomElement = class AutoCompleteCustomElement {
    /**
     * Autocomplete constructor.
     *
     * @param {Config}  api
     * @param {Element} element
     */
    constructor(api, element) {
        this.lastFindPromise = false;
        // the query string is set after selecting an option. To avoid this
        // triggering a new query we set the justSelected to true. When true it will
        // avoid performing a query until it is toggled of.
        this.justSelected = false;
        // Holds the value last used to perform a search
        this.previousValue = null;
        // Simple property that maintains if this is the initial (first) request.
        this.initial = true;
        this.hasFocus = false;
        //
        this.offline = false;
        this.showEdit = false;
        this.showNew = false;
        this.alwaysQuery = false;
        // How many characters are required to type before starting a search.
        this.minInput = 0;
        // the name of the input element
        this.name = "";
        // The max amount of results to return. (optional)
        this.limit = 5;
        // Debounce value
        this.debounce = 100;
        // initial value
        this.initValue = "";
        // The string to be used to do a contains search with. By default it will look if the name contains this value.
        this.value = "";
        // The property to query on.
        this.attribute = "name";
        // Used to pass the result of the selected value to the user's view model
        this.result = null;
        // The results returned from the endpoint. These can be observed and mutated.
        this.results = [];
        // Which relations to populate for results
        this.populate = "";
        // The label to show in the footer. Gets pulled through aurelia-i18n.
        this.footerLabel = "Create";
        // Never, always or no-results
        this.footerVisibility = "never";
        // Used to determine the string to be shown as option label
        this.label = (result) => {
            return typeof result === "object" && result !== null
                ? result[this.attribute]
                : result;
        };
        // Input field's placeholder
        this.placeholder = "Search";
        // Sort method that takes a list and returns a sorted list. No sorting by default.
        this.sort = (items) => items;
        // Used to make the criteria more specific
        this.criteria = {};
        this.element = element;
        this.apiEndpoint = api;
        this.application = location.hash.split("/")[2];
    }
    get showFooter() {
        let visibility = this.footerVisibility;
        return (visibility === "always" ||
            (visibility === "no-results" &&
                this.value &&
                this.value.length &&
                (!this.results || !this.results.length)));
    }
    /**
     * Bind callback.
     *
     * @returns {void}
     */
    bind() {
        if (!this.resource && !this.items) {
            return logger$5.error("auto complete requires resource or items bindable to be defined");
        }
        this.value = this.label(this.result);
        this.apiEndpoint = this.apiEndpoint.getEndpoint(this.endpoint);
    }
    /**
     * Set focus on dropdown.
     *
     * @param {boolean} value
     * @param {Event}   [event]
     *
     * @returns {boolean}
     */
    setFocus(value, event = null) {
        function isDescendant(parent$$1, child$$1) {
            let node = child$$1.parentNode;
            while (node !== null) {
                if (node === parent$$1) {
                    return true;
                }
                node = node.parentNode;
            }
            return false;
        }
        // console.log(event);
        // If descendant, don't toggle dropdown so that other listeners will be called.
        if (event &&
            event.relatedTarget &&
            isDescendant(this.element, event.relatedTarget)) {
            return true;
        }
        if (!this.hasEnoughCharacters()) {
            this.hasFocus = false;
            return true;
        }
        if (value) {
            this.valueChanged();
        }
        this.hasFocus = value;
        return false;
    }
    /**
     * returns HTML that wraps matching substrings with strong tags.
     * If not a "stringable" it returns an empty string.
     *
     * @param {Object} result
     *
     * @returns {String}
     */
    labelWithMatches(result) {
        let label = this.label(result);
        if (typeof label !== "string") {
            return "";
        }
        return label.replace(this.regex, match => {
            return `<strong>${match}</strong>`;
        });
    }
    /**
     * Handle keyUp events from value.
     *
     * @param {Event} event
     *
     * @returns {*}
     */
    handleKeyUp(event) {
        if (event.keyCode !== 27) {
            return;
        }
        if (this.hasFocus) {
            event.stopPropagation();
        }
        this.setFocus(false);
        return true;
    }
    /**
     * Handle keyDown events from value.
     *
     * @param {Event} event
     *
     * @returns {*}
     */
    handleKeyDown(event) {
        if (event.keyCode === 27) {
            return;
        }
        if (event.keyCode === 40 || event.keyCode === 38) {
            this.selected = this.nextFoundResult(this.selected, event.keyCode === 38);
            return event.preventDefault();
        }
        if (event.keyCode === 9 || event.keyCode === 13) {
            if (this.hasFocus) {
                event.stopPropagation();
                event.preventDefault();
            }
            this.onSelect();
        }
        else {
            this.setFocus(true);
        }
        return true;
    }
    /**
     * Get the next result in the list.
     *
     * @param {Object}  current    selected item
     * @param {Boolean} [reversed] when true gets the previous instead
     *
     * @returns {Object} the next of previous item
     */
    nextFoundResult(current, reversed) {
        let index = (this.results.indexOf(current) + (reversed ? -1 : 1)) %
            this.results.length;
        if (index < 0) {
            index = this.results.length - 1;
        }
        return this.results[index];
    }
    /**
     * Set the text in the input to that of the selected item and set the
     * selected item as the value. Then hide the results(dropdown)
     *
     * @param {Object} [result] when defined uses the result instead of the this.selected value
     *
     * @returns {boolean}
     */
    onSelect(result = null) {
        // console.log(result);
        result = arguments.length === 0 ? this.selected : result;
        this.justSelected = true;
        this.value = this.label(result);
        this.previousValue = this.value;
        this.result = result;
        // this.initValue = '';
        this.selected = this.result.id || this.result.idx;
        this.setFocus(false);
        return true;
    }
    /**
     * when search string changes perform a request, assign it to results
     * and select the first result by default.
     *
     * @returns {Promise}
     */
    valueChanged() {
        if (!this.shouldPerformRequest()) {
            // console.log('req', this.resource)
            return Promise.resolve();
        }
        if (this.hasEnoughCharacters() && this.items) {
            // console.log('req chd', this.resource)
            this.results = [];
            // console.log(this.items)
            this.results = this.sort(this.filter(this.items));
            return Promise.resolve();
        }
        this.result = null;
        // when resource is not defined it will not perform a request. Instead it
        // will search for the first items that pass the predicate
        if (this.items) {
            this.results = this.sort(this.filter(this.items));
            return Promise.resolve();
        }
        let lastFindPromise = this.findResults(this.searchQuery(this.value)).then((results) => {
            if (this.lastFindPromise !== lastFindPromise) {
                return;
            }
            this.previousValue = this.value;
            this.lastFindPromise = false;
            this.results = this.sort(results || []);
            if (this.results.length !== 0) ;
        });
        this.lastFindPromise = lastFindPromise;
        return;
    }
    /**
     * returns a list of length that is smaller or equal to the limit. The
     * default predicate is based on the regex
     *
     * @param {Object[]} items
     *
     * @returns {Object[]}
     */
    filter(items) {
        let results = [];
        items.some((item) => {
            // add an item if it matches
            if (this.itemMatches(item)) {
                results.push(item);
            }
            return results.length >= this.limit;
        });
        return results;
    }
    /**
     * returns true when the finding of matching results should continue
     *
     * @param {*} item
     *
     * @return {Boolean}
     */
    itemMatches(item) {
        // search matches if value
        if (this.value) {
            return this.regex.test(this.label(item));
        }
        else {
            return true;
        }
    }
    get regex() {
        return new RegExp(this.value, "gi");
    }
    /**
     * returns true when a request will be performed on a search change
     *
     * @returns {Boolean}
     */
    shouldPerformRequest() {
        if (this.alwaysQuery) {
            return true;
        }
        if (this.justSelected === true) {
            this.justSelected = false;
            return false;
        }
        if (this.initial) {
            this.initial = false;
            return true;
        }
        return this.value !== this.previousValue;
    }
    /**
     * Returns whether or not value has enough characters (meets minInput).
     *
     * @returns {boolean}
     */
    hasEnoughCharacters() {
        return ((this.value && this.value.length) || 0) >= this.minInput;
    }
    /**
     * @param {Object} query a waterline query object
     *
     * @returns {Promise} which resolves to the found results
     */
    findResults(query) {
        return this.apiEndpoint
            .find(this.resource, query)
            .catch((err) => logger$5.error("not able to find results", err));
    }
    /**
     * Emit custom event, or call function depending on supplied value.
     *
     * @param {string} value
     */
    onFooterSelected(value) {
        if (typeof this.footerSelected === "function") {
            this.footerSelected(value);
            return;
        }
        this.element.dispatchEvent(DOM.createCustomEvent("footer-selected", {
            detail: {
                value
            }
        }));
    }
    /**
     * Takes a string and converts to to a waterline query object that is used to
     * perform a forgiving search.
     *
     * @param {String} string the string to search with
     *
     * @returns {Object} a waterline query object
     */
    searchQuery(string) {
        let mergedWhere = Object.assign({
            [this.attribute]: {
                contains: string
            }
        }, this.criteria);
        let query = {
            populate: this.populate || "",
            where: mergedWhere,
            limit: 30
        };
        // only assign limit to query if it is defined. Allows to default to server
        // limit when limit bindable is set to falsy value
        if (this.limit) {
            query.limit = this.limit;
        }
        return query;
    }
    activate() {
        this.valueChanged();
    }
};
__decorate([
    bindable,
    __metadata("design:type", Object)
], AutoCompleteCustomElement.prototype, "showEdit", void 0);
__decorate([
    bindable,
    __metadata("design:type", Object)
], AutoCompleteCustomElement.prototype, "showNew", void 0);
__decorate([
    bindable,
    __metadata("design:type", Object)
], AutoCompleteCustomElement.prototype, "alwaysQuery", void 0);
__decorate([
    bindable,
    __metadata("design:type", Object)
], AutoCompleteCustomElement.prototype, "minInput", void 0);
__decorate([
    bindable,
    __metadata("design:type", Object)
], AutoCompleteCustomElement.prototype, "name", void 0);
__decorate([
    bindable,
    __metadata("design:type", Object)
], AutoCompleteCustomElement.prototype, "limit", void 0);
__decorate([
    bindable,
    __metadata("design:type", Object)
], AutoCompleteCustomElement.prototype, "debounce", void 0);
__decorate([
    bindable,
    __metadata("design:type", Object)
], AutoCompleteCustomElement.prototype, "initValue", void 0);
__decorate([
    bindable,
    __metadata("design:type", Object)
], AutoCompleteCustomElement.prototype, "resource", void 0);
__decorate([
    bindable,
    __metadata("design:type", Object)
], AutoCompleteCustomElement.prototype, "items", void 0);
__decorate([
    bindable({
        defaultBindingMode: bindingMode.twoWay
    }),
    __metadata("design:type", Object)
], AutoCompleteCustomElement.prototype, "value", void 0);
__decorate([
    bindable,
    __metadata("design:type", Object)
], AutoCompleteCustomElement.prototype, "selected", void 0);
__decorate([
    bindable,
    __metadata("design:type", Object)
], AutoCompleteCustomElement.prototype, "attribute", void 0);
__decorate([
    bindable({
        defaultBindingMode: bindingMode.twoWay
    }),
    __metadata("design:type", Object)
], AutoCompleteCustomElement.prototype, "result", void 0);
__decorate([
    bindable({
        defaultBindingMode: bindingMode.twoWay
    }),
    __metadata("design:type", Object)
], AutoCompleteCustomElement.prototype, "results", void 0);
__decorate([
    bindable,
    __metadata("design:type", Object)
], AutoCompleteCustomElement.prototype, "populate", void 0);
__decorate([
    bindable,
    __metadata("design:type", Object)
], AutoCompleteCustomElement.prototype, "footerLabel", void 0);
__decorate([
    bindable,
    __metadata("design:type", Object)
], AutoCompleteCustomElement.prototype, "footerSelected", void 0);
__decorate([
    bindable,
    __metadata("design:type", Object)
], AutoCompleteCustomElement.prototype, "footerVisibility", void 0);
__decorate([
    bindable,
    __metadata("design:type", Object)
], AutoCompleteCustomElement.prototype, "label", void 0);
__decorate([
    bindable,
    __metadata("design:type", Object)
], AutoCompleteCustomElement.prototype, "endpoint", void 0);
__decorate([
    bindable,
    __metadata("design:type", Object)
], AutoCompleteCustomElement.prototype, "placeholder", void 0);
__decorate([
    bindable,
    __metadata("design:type", Object)
], AutoCompleteCustomElement.prototype, "sort", void 0);
__decorate([
    bindable,
    __metadata("design:type", Object)
], AutoCompleteCustomElement.prototype, "criteria", void 0);
__decorate([
    computedFrom("results", "value"),
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], AutoCompleteCustomElement.prototype, "showFooter", null);
__decorate([
    computedFrom("value"),
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], AutoCompleteCustomElement.prototype, "regex", null);
AutoCompleteCustomElement = __decorate([
    inject(aureliaApi_2, DOM.Element),
    __metadata("design:paramtypes", [Object, Object])
], AutoCompleteCustomElement);

Object.keys(elements).forEach(function (key) { exports[key] = elements[key]; });
exports.ConvertManagerValueConverter = elements.ConvertManagerValueConverter;
exports.AutoCompleteCustomElement = elements.AutoCompleteCustomElement;
exports.configure = configure$3;
