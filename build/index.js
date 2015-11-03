(function(e, a) { for(var i in a) e[i] = a[i]; }(exports, /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _interopRequireDefault = __webpack_require__(1)['default'];
	
	Object.defineProperty(exports, '__esModule', {
	  value: true
	});
	
	var _schema = __webpack_require__(2);
	
	var _schema2 = _interopRequireDefault(_schema);
	
	var _validation = __webpack_require__(82);
	
	var _validation2 = _interopRequireDefault(_validation);
	
	exports['default'] = { Schema: _schema2['default'], Validation: _validation2['default'] };
	module.exports = exports['default'];

/***/ },
/* 1 */
/***/ function(module, exports) {

	"use strict";
	
	exports["default"] = function (obj) {
	  return obj && obj.__esModule ? obj : {
	    "default": obj
	  };
	};
	
	exports.__esModule = true;

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _get = __webpack_require__(3)['default'];
	
	var _inherits = __webpack_require__(17)['default'];
	
	var _classCallCheck = __webpack_require__(28)['default'];
	
	var _createClass = __webpack_require__(29)['default'];
	
	var _slicedToArray = __webpack_require__(32)['default'];
	
	var _Object$assign = __webpack_require__(61)['default'];
	
	var _Reflect$ownKeys = __webpack_require__(67)['default'];
	
	var _Object$keys = __webpack_require__(71)['default'];
	
	var _Object$entries = __webpack_require__(74)['default'];
	
	var _Object$values = __webpack_require__(78)['default'];
	
	Object.defineProperty(exports, '__esModule', {
	  value: true
	});
	
	var _util = __webpack_require__(81);
	
	// Thank you IE, for making this necessary
	// Per http://babeljs.io/docs/advanced/caveats/, static methods do not
	// propagate down the inheritance chain because __proto__ is not a thing.
	// Decorate any concrete schema class with this to ensure that it and any
	// cloned versions of itself will have these static methods.
	function staticify(cls) {
	  _Object$assign(cls, {
	    clone: function clone(overrides) {
	      var _this = this;
	
	      var cloned = (function (_ref) {
	        _inherits(cloned, _ref);
	
	        function cloned() {
	          _classCallCheck(this, cloned);
	
	          _get(Object.getPrototypeOf(cloned.prototype), 'constructor', this).apply(this, arguments);
	        }
	
	        return cloned;
	      })(this);
	
	      ;
	      _Object$assign(cloned.prototype, overrides);
	      staticify(cloned);
	      // Also, thank you IE, for making this necessary
	      _Reflect$ownKeys(this).forEach(function (k) {
	        if (!cloned.hasOwnProperty(k)) {
	          cloned[k] = _this[k];
	        }
	      });
	      return cloned;
	    },
	
	    named: function named(name) {
	      return this.clone({ name: name });
	    },
	
	    using: function using(overrides) {
	      // maybe pre-process overrides?
	      return this.clone(overrides);
	    },
	
	    validatedBy: function validatedBy() {
	      for (var _len = arguments.length, validators = Array(_len), _key = 0; _key < _len; _key++) {
	        validators[_key] = arguments[_key];
	      }
	
	      return this.clone({ validators: validators });
	    },
	
	    fromDefaults: function fromDefaults() {
	      var defaulted = new this();
	      defaulted.setDefault();
	      return defaulted;
	    }
	  });
	}
	
	var Type = (function () {
	  function Type(value) {
	    _classCallCheck(this, Type);
	
	    this.valid = undefined;
	    value !== undefined && this.set(value);
	    this._watchers = [];
	  }
	
	  _createClass(Type, [{
	    key: 'observe',
	    value: function observe(watcher) {
	      this._watchers.push(watcher);
	    }
	  }, {
	    key: 'notifyWatchers',
	    value: function notifyWatchers() {
	      for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
	        args[_key2] = arguments[_key2];
	      }
	
	      this._watchers.forEach(function (watcher) {
	        return watcher.apply(undefined, args);
	      });
	    }
	  }, {
	    key: 'addError',
	    value: function addError(error) {
	      this.errors.push(error);
	    }
	  }, {
	    key: 'setDefault',
	    value: function setDefault() {
	      this.set(this['default']);
	    }
	  }, {
	    key: 'hasValidator',
	    value: function hasValidator(validator) {
	      return this.validatorFactories.indexOf(validator) !== -1;
	    }
	  }, {
	    key: 'validatorFactories',
	    get: function get() {
	      return this.validators.map(function (v) {
	        return v.factory;
	      });
	    }
	  }]);
	
	  return Type;
	})();
	
	Type.prototype['default'] = undefined;
	Type.prototype.validators = [];
	
	var AdaptationError = (function (_Error) {
	  _inherits(AdaptationError, _Error);
	
	  function AdaptationError() {
	    _classCallCheck(this, AdaptationError);
	
	    _get(Object.getPrototypeOf(AdaptationError.prototype), 'constructor', this).apply(this, arguments);
	  }
	
	  return AdaptationError;
	})(Error);
	
	;
	
	var Scalar = (function (_Type) {
	  _inherits(Scalar, _Type);
	
	  function Scalar() {
	    _classCallCheck(this, Scalar);
	
	    _get(Object.getPrototypeOf(Scalar.prototype), 'constructor', this).call(this);
	    this._watchers = [];
	    this.value = undefined;
	  }
	
	  _createClass(Scalar, [{
	    key: 'set',
	    value: function set(raw) {
	      try {
	        this.value = this.adapt(raw);
	      } catch (e) {
	        this.value = undefined;
	        this.notifyWatchers(false, this);
	        return false;
	      }
	      this.notifyWatchers(true, this);
	
	      return true;
	    }
	  }, {
	    key: 'validate',
	    value: function validate(context) {
	      var _this2 = this;
	
	      this.errors = [];
	
	      this.valid = this.validators.reduce(function (valid, v) {
	        return valid && v(_this2, context);
	      }, true);
	
	      return this.valid;
	    }
	  }, {
	    key: 'allErrors',
	    get: function get() {
	      return this.errors;
	    }
	  }]);
	
	  return Scalar;
	})(Type);
	
	var Bool = (function (_Scalar) {
	  _inherits(Bool, _Scalar);
	
	  function Bool() {
	    _classCallCheck(this, _Bool);
	
	    _get(Object.getPrototypeOf(_Bool.prototype), 'constructor', this).apply(this, arguments);
	  }
	
	  _createClass(Bool, [{
	    key: 'adapt',
	    value: function adapt(raw) {
	      // TODO: more restrictive?
	      return !!raw;
	    }
	  }]);
	
	  var _Bool = Bool;
	  Bool = staticify(Bool) || Bool;
	  return Bool;
	})(Scalar);
	
	var Str = (function (_Scalar2) {
	  _inherits(Str, _Scalar2);
	
	  function Str() {
	    _classCallCheck(this, _Str);
	
	    _get(Object.getPrototypeOf(_Str.prototype), 'constructor', this).apply(this, arguments);
	  }
	
	  _createClass(Str, [{
	    key: 'adapt',
	    value: function adapt(raw) {
	      return raw.toString();
	    }
	  }]);
	
	  var _Str = Str;
	  Str = staticify(Str) || Str;
	  return Str;
	})(Scalar);
	
	var Num = (function (_Scalar3) {
	  _inherits(Num, _Scalar3);
	
	  function Num() {
	    _classCallCheck(this, Num);
	
	    _get(Object.getPrototypeOf(Num.prototype), 'constructor', this).apply(this, arguments);
	  }
	
	  return Num;
	})(Scalar);
	
	var Int = (function (_Num) {
	  _inherits(Int, _Num);
	
	  function Int() {
	    _classCallCheck(this, _Int);
	
	    _get(Object.getPrototypeOf(_Int.prototype), 'constructor', this).apply(this, arguments);
	  }
	
	  _createClass(Int, [{
	    key: 'adapt',
	    value: function adapt(raw) {
	      var value = parseInt(raw, 10);
	      if (isNaN(value)) {
	        throw new AdaptationError(value + ' is not a number');
	      }
	      return value;
	    }
	  }]);
	
	  var _Int = Int;
	  Int = staticify(Int) || Int;
	  return Int;
	})(Num);
	
	var Enum = (function (_Scalar4) {
	  _inherits(Enum, _Scalar4);
	
	  function Enum(value) {
	    _classCallCheck(this, _Enum);
	
	    _get(Object.getPrototypeOf(_Enum.prototype), 'constructor', this).call(this);
	    this.childSchema = new this.childType();
	    if (value !== undefined) {
	      this.set(value);
	    }
	  }
	
	  _createClass(Enum, [{
	    key: 'adapt',
	    value: function adapt(raw) {
	      var value = this.childSchema.adapt(raw);
	      if (!this.validValue(value)) {
	        throw new AdaptationError();
	      }
	      return value;
	    }
	  }, {
	    key: 'validValue',
	    value: function validValue(value) {
	      return this.validValues.indexOf(value) !== -1;
	    }
	  }], [{
	    key: 'of',
	    value: function of(childType) {
	      return this.clone({ childType: childType });
	    }
	  }, {
	    key: 'valued',
	    value: function valued(validValues) {
	      return this.clone({ validValues: validValues });
	    }
	  }]);
	
	  var _Enum = Enum;
	  Enum = staticify(Enum) || Enum;
	  return Enum;
	})(Scalar);
	
	Enum.prototype.childType = Str;
	
	var Container = (function (_Type2) {
	  _inherits(Container, _Type2);
	
	  function Container() {
	    _classCallCheck(this, Container);
	
	    _get(Object.getPrototypeOf(Container.prototype), 'constructor', this).apply(this, arguments);
	  }
	
	  _createClass(Container, [{
	    key: 'validate',
	    value: function validate(context) {
	      var _this3 = this;
	
	      this.errors = [];
	      var success = !!this.memberValues.reduce(function (valid, member) {
	        var result = member.validate(context);
	        return valid && result;
	      }, true);
	      this.valid = !!this.validators.reduce(function (valid, validator) {
	        return valid &= validator(_this3, context);
	      }, success);
	      return this.valid;
	    }
	  }]);
	
	  return Container;
	})(Type);
	
	var List = (function (_Container) {
	  _inherits(List, _Container);
	
	  function List() {
	    _classCallCheck(this, _List);
	
	    _get(Object.getPrototypeOf(_List.prototype), 'constructor', this).apply(this, arguments);
	  }
	
	  _createClass(List, [{
	    key: 'set',
	
	    // Attempt to convert each member of raw array to the
	    // member type of the List. Any failure will result in an
	    // empty array for this.members.
	
	    // TODO: short-circuit conversion if any member fails.
	    value: function set(raw) {
	      var _this4 = this;
	
	      var previousMembers = this.members || [];
	      this.members = [];
	      if (!(raw && raw.forEach)) {
	        this.notifyWatchers(false, this);
	        return false;
	      }
	      var success = true;
	      var items = [];
	      raw.forEach(function (mbr, i) {
	        var member = new _this4.memberType();
	        member.parent = _this4;
	        success &= member.set(mbr);
	        // keep around any watchers that were present on the previous member
	        if (previousMembers[i] && previousMembers[i]._watchers) {
	          member._watchers = previousMembers[i]._watchers;
	        } else {
	          member.observe(_this4.notifyWatchers.bind(_this4));
	        }
	        items.push(member);
	      });
	      this.members = success ? items : this.members;
	      this.notifyWatchers(!!success, this);
	      return !!success;
	    }
	  }, {
	    key: 'value',
	    get: function get() {
	      return this.members.map(function (m) {
	        return m.value;
	      });
	    }
	  }, {
	    key: 'members',
	    get: function get() {
	      return this._members;
	    },
	
	    // aliased for concordance with Container.prototype.validate()
	    set: function set(members) {
	      this._members = members;
	    }
	  }, {
	    key: 'memberValues',
	    get: function get() {
	      return this._members;
	    }
	  }, {
	    key: 'allErrors',
	    get: function get() {
	      return {
	        self: this.errors,
	        children: this.members.map(function (m) {
	          return m.allErrors;
	        })
	      };
	    }
	  }], [{
	    key: 'of',
	    value: function of(type) {
	      return this.clone({ memberType: type });
	    }
	  }]);
	
	  var _List = List;
	  List = staticify(List) || List;
	  return List;
	})(Container);
	
	List.prototype.members = [];
	
	var Map = (function (_Container2) {
	  _inherits(Map, _Container2);
	
	  function Map(value) {
	    _classCallCheck(this, _Map);
	
	    _get(Object.getPrototypeOf(_Map.prototype), 'constructor', this).call(this, value);
	    // construct an empty schema
	    if (!this._members) {
	      this.set({});
	    }
	  }
	
	  _createClass(Map, [{
	    key: 'set',
	    value: function set(raw) {
	      var _this5 = this;
	
	      var _ref2 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
	
	      var _ref2$notify = _ref2.notify;
	      var notify = _ref2$notify === undefined ? true : _ref2$notify;
	
	      var success = true;
	      if (raw === undefined) {
	        raw = {};
	      }
	      if (!(0, _util.isObject)(raw)) {
	        raw = {};
	        success = false;
	      }
	      var keys = _Object$keys(this.memberSchema);
	      var members = {};
	      success = !!keys.reduce(function (success, k) {
	        var member = new _this5.memberSchema[k]();
	        member.name = k;
	        member.parent = _this5;
	        members[k] = member;
	        if (raw[k] !== undefined) {
	          success &= member.set(raw[k]);
	        }
	        // keep around any watchers that were present on the previous member
	        if (_this5.members && _this5.members[k]) {
	          members[k]._watchers = _this5.members[k]._watchers;
	        } else {
	          member.observe(_this5.notifyWatchers.bind(_this5));
	        }
	        return success;
	      }, true);
	
	      if (success) {
	        // should this.members only be defined here?
	        // or in constructor?
	        this.members = members;
	      } else {
	        // TODO: We don't need to do this if raw was not an object.
	        this.set({}, { notify: false });
	      }
	      if (notify) this.notifyWatchers(success, this);
	      return success;
	    }
	  }, {
	    key: 'value',
	    get: function get() {
	      var _this6 = this;
	
	      return _Object$keys(this._members).reduce(function (v, m) {
	        v[m] = _this6._members[m].value;
	        return v;
	      }, {});
	    }
	  }, {
	    key: 'default',
	    get: function get() {
	      return _Object$entries(this.memberSchema).reduce(function (defaults, _ref3) {
	        var _ref32 = _slicedToArray(_ref3, 2);
	
	        var k = _ref32[0];
	        var v = _ref32[1];
	
	        if (v.prototype['default'] !== undefined) {
	          defaults[k] = v.prototype['default'];
	        }
	        return defaults;
	      }, {});
	    }
	
	    // member elements as list
	  }, {
	    key: 'memberValues',
	    get: function get() {
	      return _Object$values(this._members);
	    }
	  }, {
	    key: 'members',
	    get: function get() {
	      return this._members;
	    },
	    set: function set(members) {
	      this._members = members;
	    }
	  }, {
	    key: 'allErrors',
	    get: function get() {
	      return {
	        self: this.errors,
	        children: _Object$entries(this.members).reduce(function (errors, _ref4) {
	          var _ref42 = _slicedToArray(_ref4, 2);
	
	          var k = _ref42[0];
	          var v = _ref42[1];
	
	          errors[k] = v.allErrors;
	          return errors;
	        }, {})
	      };
	    }
	  }], [{
	    key: 'of',
	    value: function of() {
	      for (var _len3 = arguments.length, members = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
	        members[_key3] = arguments[_key3];
	      }
	
	      var memberSchema = members.reduce(function (ms, m) {
	        ms[m.prototype.name] = m;
	        return ms;
	      }, {});
	      return this.clone({ memberSchema: memberSchema });
	    }
	  }, {
	    key: 'fromDefaults',
	    value: function fromDefaults() {
	      var defaulted = new this();
	      _Object$entries(defaulted['default']).forEach(function (_ref5) {
	        var _ref52 = _slicedToArray(_ref5, 2);
	
	        var k = _ref52[0];
	        var v = _ref52[1];
	        return defaulted.members[k].set(v);
	      });
	      return defaulted;
	    }
	  }]);
	
	  var _Map = Map;
	  Map = staticify(Map) || Map;
	  return Map;
	})(Container);
	
	exports['default'] = { Type: Type, Scalar: Scalar, Num: Num, Int: Int, Str: Str, Bool: Bool, Enum: Enum, Container: Container, List: List, Map: Map };
	module.exports = exports['default'];

	// ?

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var _Object$getOwnPropertyDescriptor = __webpack_require__(4)["default"];
	
	exports["default"] = function get(_x, _x2, _x3) {
	  var _again = true;
	
	  _function: while (_again) {
	    var object = _x,
	        property = _x2,
	        receiver = _x3;
	    desc = parent = getter = undefined;
	    _again = false;
	    if (object === null) object = Function.prototype;
	
	    var desc = _Object$getOwnPropertyDescriptor(object, property);
	
	    if (desc === undefined) {
	      var parent = Object.getPrototypeOf(object);
	
	      if (parent === null) {
	        return undefined;
	      } else {
	        _x = parent;
	        _x2 = property;
	        _x3 = receiver;
	        _again = true;
	        continue _function;
	      }
	    } else if ("value" in desc) {
	      return desc.value;
	    } else {
	      var getter = desc.get;
	
	      if (getter === undefined) {
	        return undefined;
	      }
	
	      return getter.call(receiver);
	    }
	  }
	};
	
	exports.__esModule = true;

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(5), __esModule: true };

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	var $ = __webpack_require__(6);
	__webpack_require__(7);
	module.exports = function getOwnPropertyDescriptor(it, key){
	  return $.getDesc(it, key);
	};

/***/ },
/* 6 */
/***/ function(module, exports) {

	var $Object = Object;
	module.exports = {
	  create:     $Object.create,
	  getProto:   $Object.getPrototypeOf,
	  isEnum:     {}.propertyIsEnumerable,
	  getDesc:    $Object.getOwnPropertyDescriptor,
	  setDesc:    $Object.defineProperty,
	  setDescs:   $Object.defineProperties,
	  getKeys:    $Object.keys,
	  getNames:   $Object.getOwnPropertyNames,
	  getSymbols: $Object.getOwnPropertySymbols,
	  each:       [].forEach
	};

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	// 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)
	var toIObject = __webpack_require__(8);
	
	__webpack_require__(12)('getOwnPropertyDescriptor', function($getOwnPropertyDescriptor){
	  return function getOwnPropertyDescriptor(it, key){
	    return $getOwnPropertyDescriptor(toIObject(it), key);
	  };
	});

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	// to indexed object, toObject with fallback for non-array-like ES3 strings
	var IObject = __webpack_require__(9)
	  , defined = __webpack_require__(11);
	module.exports = function(it){
	  return IObject(defined(it));
	};

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	// indexed object, fallback for non-array-like ES3 strings
	var cof = __webpack_require__(10);
	module.exports = 0 in Object('z') ? Object : function(it){
	  return cof(it) == 'String' ? it.split('') : Object(it);
	};

/***/ },
/* 10 */
/***/ function(module, exports) {

	var toString = {}.toString;
	
	module.exports = function(it){
	  return toString.call(it).slice(8, -1);
	};

/***/ },
/* 11 */
/***/ function(module, exports) {

	// 7.2.1 RequireObjectCoercible(argument)
	module.exports = function(it){
	  if(it == undefined)throw TypeError("Can't call method on  " + it);
	  return it;
	};

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	// most Object methods by ES6 should accept primitives
	module.exports = function(KEY, exec){
	  var $def = __webpack_require__(13)
	    , fn   = (__webpack_require__(15).Object || {})[KEY] || Object[KEY]
	    , exp  = {};
	  exp[KEY] = exec(fn);
	  $def($def.S + $def.F * __webpack_require__(16)(function(){ fn(1); }), 'Object', exp);
	};

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	var global    = __webpack_require__(14)
	  , core      = __webpack_require__(15)
	  , PROTOTYPE = 'prototype';
	var ctx = function(fn, that){
	  return function(){
	    return fn.apply(that, arguments);
	  };
	};
	var $def = function(type, name, source){
	  var key, own, out, exp
	    , isGlobal = type & $def.G
	    , isProto  = type & $def.P
	    , target   = isGlobal ? global : type & $def.S
	        ? global[name] : (global[name] || {})[PROTOTYPE]
	    , exports  = isGlobal ? core : core[name] || (core[name] = {});
	  if(isGlobal)source = name;
	  for(key in source){
	    // contains in native
	    own = !(type & $def.F) && target && key in target;
	    if(own && key in exports)continue;
	    // export native or passed
	    out = own ? target[key] : source[key];
	    // prevent global pollution for namespaces
	    if(isGlobal && typeof target[key] != 'function')exp = source[key];
	    // bind timers to global for call from export context
	    else if(type & $def.B && own)exp = ctx(out, global);
	    // wrap global constructors for prevent change them in library
	    else if(type & $def.W && target[key] == out)!function(C){
	      exp = function(param){
	        return this instanceof C ? new C(param) : C(param);
	      };
	      exp[PROTOTYPE] = C[PROTOTYPE];
	    }(out);
	    else exp = isProto && typeof out == 'function' ? ctx(Function.call, out) : out;
	    // export
	    exports[key] = exp;
	    if(isProto)(exports[PROTOTYPE] || (exports[PROTOTYPE] = {}))[key] = out;
	  }
	};
	// type bitmap
	$def.F = 1;  // forced
	$def.G = 2;  // global
	$def.S = 4;  // static
	$def.P = 8;  // proto
	$def.B = 16; // bind
	$def.W = 32; // wrap
	module.exports = $def;

/***/ },
/* 14 */
/***/ function(module, exports) {

	// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
	var UNDEFINED = 'undefined';
	var global = module.exports = typeof window != UNDEFINED && window.Math == Math
	  ? window : typeof self != UNDEFINED && self.Math == Math ? self : Function('return this')();
	if(typeof __g == 'number')__g = global; // eslint-disable-line no-undef

/***/ },
/* 15 */
/***/ function(module, exports) {

	var core = module.exports = {};
	if(typeof __e == 'number')__e = core; // eslint-disable-line no-undef

/***/ },
/* 16 */
/***/ function(module, exports) {

	module.exports = function(exec){
	  try {
	    return !!exec();
	  } catch(e){
	    return true;
	  }
	};

/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var _Object$create = __webpack_require__(18)["default"];
	
	var _Object$setPrototypeOf = __webpack_require__(20)["default"];
	
	exports["default"] = function (subClass, superClass) {
	  if (typeof superClass !== "function" && superClass !== null) {
	    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
	  }
	
	  subClass.prototype = _Object$create(superClass && superClass.prototype, {
	    constructor: {
	      value: subClass,
	      enumerable: false,
	      writable: true,
	      configurable: true
	    }
	  });
	  if (superClass) _Object$setPrototypeOf ? _Object$setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
	};
	
	exports.__esModule = true;

/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(19), __esModule: true };

/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	var $ = __webpack_require__(6);
	module.exports = function create(P, D){
	  return $.create(P, D);
	};

/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(21), __esModule: true };

/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(22);
	module.exports = __webpack_require__(15).Object.setPrototypeOf;

/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	// 19.1.3.19 Object.setPrototypeOf(O, proto)
	var $def = __webpack_require__(13);
	$def($def.S, 'Object', {setPrototypeOf: __webpack_require__(23).set});

/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	// Works with __proto__ only. Old v8 can't work with null proto objects.
	/* eslint-disable no-proto */
	var getDesc  = __webpack_require__(6).getDesc
	  , isObject = __webpack_require__(24)
	  , anObject = __webpack_require__(25);
	var check = function(O, proto){
	  anObject(O);
	  if(!isObject(proto) && proto !== null)throw TypeError(proto + ": can't set as prototype!");
	};
	module.exports = {
	  set: Object.setPrototypeOf || ('__proto__' in {} // eslint-disable-line
	    ? function(buggy, set){
	        try {
	          set = __webpack_require__(26)(Function.call, getDesc(Object.prototype, '__proto__').set, 2);
	          set({}, []);
	        } catch(e){ buggy = true; }
	        return function setPrototypeOf(O, proto){
	          check(O, proto);
	          if(buggy)O.__proto__ = proto;
	          else set(O, proto);
	          return O;
	        };
	      }()
	    : undefined),
	  check: check
	};

/***/ },
/* 24 */
/***/ function(module, exports) {

	// http://jsperf.com/core-js-isobject
	module.exports = function(it){
	  return it !== null && (typeof it == 'object' || typeof it == 'function');
	};

/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	var isObject = __webpack_require__(24);
	module.exports = function(it){
	  if(!isObject(it))throw TypeError(it + ' is not an object!');
	  return it;
	};

/***/ },
/* 26 */
/***/ function(module, exports, __webpack_require__) {

	// optional / simple context binding
	var aFunction = __webpack_require__(27);
	module.exports = function(fn, that, length){
	  aFunction(fn);
	  if(that === undefined)return fn;
	  switch(length){
	    case 1: return function(a){
	      return fn.call(that, a);
	    };
	    case 2: return function(a, b){
	      return fn.call(that, a, b);
	    };
	    case 3: return function(a, b, c){
	      return fn.call(that, a, b, c);
	    };
	  } return function(/* ...args */){
	      return fn.apply(that, arguments);
	    };
	};

/***/ },
/* 27 */
/***/ function(module, exports) {

	module.exports = function(it){
	  if(typeof it != 'function')throw TypeError(it + ' is not a function!');
	  return it;
	};

/***/ },
/* 28 */
/***/ function(module, exports) {

	"use strict";
	
	exports["default"] = function (instance, Constructor) {
	  if (!(instance instanceof Constructor)) {
	    throw new TypeError("Cannot call a class as a function");
	  }
	};
	
	exports.__esModule = true;

/***/ },
/* 29 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var _Object$defineProperty = __webpack_require__(30)["default"];
	
	exports["default"] = (function () {
	  function defineProperties(target, props) {
	    for (var i = 0; i < props.length; i++) {
	      var descriptor = props[i];
	      descriptor.enumerable = descriptor.enumerable || false;
	      descriptor.configurable = true;
	      if ("value" in descriptor) descriptor.writable = true;
	
	      _Object$defineProperty(target, descriptor.key, descriptor);
	    }
	  }
	
	  return function (Constructor, protoProps, staticProps) {
	    if (protoProps) defineProperties(Constructor.prototype, protoProps);
	    if (staticProps) defineProperties(Constructor, staticProps);
	    return Constructor;
	  };
	})();
	
	exports.__esModule = true;

/***/ },
/* 30 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(31), __esModule: true };

/***/ },
/* 31 */
/***/ function(module, exports, __webpack_require__) {

	var $ = __webpack_require__(6);
	module.exports = function defineProperty(it, key, desc){
	  return $.setDesc(it, key, desc);
	};

/***/ },
/* 32 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var _getIterator = __webpack_require__(33)["default"];
	
	var _isIterable = __webpack_require__(58)["default"];
	
	exports["default"] = (function () {
	  function sliceIterator(arr, i) {
	    var _arr = [];
	    var _n = true;
	    var _d = false;
	    var _e = undefined;
	
	    try {
	      for (var _i = _getIterator(arr), _s; !(_n = (_s = _i.next()).done); _n = true) {
	        _arr.push(_s.value);
	
	        if (i && _arr.length === i) break;
	      }
	    } catch (err) {
	      _d = true;
	      _e = err;
	    } finally {
	      try {
	        if (!_n && _i["return"]) _i["return"]();
	      } finally {
	        if (_d) throw _e;
	      }
	    }
	
	    return _arr;
	  }
	
	  return function (arr, i) {
	    if (Array.isArray(arr)) {
	      return arr;
	    } else if (_isIterable(Object(arr))) {
	      return sliceIterator(arr, i);
	    } else {
	      throw new TypeError("Invalid attempt to destructure non-iterable instance");
	    }
	  };
	})();
	
	exports.__esModule = true;

/***/ },
/* 33 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(34), __esModule: true };

/***/ },
/* 34 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(35);
	__webpack_require__(52);
	module.exports = __webpack_require__(55);

/***/ },
/* 35 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(36);
	var Iterators = __webpack_require__(39);
	Iterators.NodeList = Iterators.HTMLCollection = Iterators.Array;

/***/ },
/* 36 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var setUnscope = __webpack_require__(37)
	  , step       = __webpack_require__(38)
	  , Iterators  = __webpack_require__(39)
	  , toIObject  = __webpack_require__(8);
	
	// 22.1.3.4 Array.prototype.entries()
	// 22.1.3.13 Array.prototype.keys()
	// 22.1.3.29 Array.prototype.values()
	// 22.1.3.30 Array.prototype[@@iterator]()
	__webpack_require__(40)(Array, 'Array', function(iterated, kind){
	  this._t = toIObject(iterated); // target
	  this._i = 0;                   // next index
	  this._k = kind;                // kind
	// 22.1.5.2.1 %ArrayIteratorPrototype%.next()
	}, function(){
	  var O     = this._t
	    , kind  = this._k
	    , index = this._i++;
	  if(!O || index >= O.length){
	    this._t = undefined;
	    return step(1);
	  }
	  if(kind == 'keys'  )return step(0, index);
	  if(kind == 'values')return step(0, O[index]);
	  return step(0, [index, O[index]]);
	}, 'values');
	
	// argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)
	Iterators.Arguments = Iterators.Array;
	
	setUnscope('keys');
	setUnscope('values');
	setUnscope('entries');

/***/ },
/* 37 */
/***/ function(module, exports) {

	module.exports = function(){ /* empty */ };

/***/ },
/* 38 */
/***/ function(module, exports) {

	module.exports = function(done, value){
	  return {value: value, done: !!done};
	};

/***/ },
/* 39 */
/***/ function(module, exports) {

	module.exports = {};

/***/ },
/* 40 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var LIBRARY         = __webpack_require__(41)
	  , $def            = __webpack_require__(13)
	  , $redef          = __webpack_require__(42)
	  , hide            = __webpack_require__(43)
	  , has             = __webpack_require__(46)
	  , SYMBOL_ITERATOR = __webpack_require__(47)('iterator')
	  , Iterators       = __webpack_require__(39)
	  , BUGGY           = !([].keys && 'next' in [].keys()) // Safari has buggy iterators w/o `next`
	  , FF_ITERATOR     = '@@iterator'
	  , KEYS            = 'keys'
	  , VALUES          = 'values';
	var returnThis = function(){ return this; };
	module.exports = function(Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCE){
	  __webpack_require__(50)(Constructor, NAME, next);
	  var createMethod = function(kind){
	    switch(kind){
	      case KEYS: return function keys(){ return new Constructor(this, kind); };
	      case VALUES: return function values(){ return new Constructor(this, kind); };
	    } return function entries(){ return new Constructor(this, kind); };
	  };
	  var TAG      = NAME + ' Iterator'
	    , proto    = Base.prototype
	    , _native  = proto[SYMBOL_ITERATOR] || proto[FF_ITERATOR] || DEFAULT && proto[DEFAULT]
	    , _default = _native || createMethod(DEFAULT)
	    , methods, key;
	  // Fix native
	  if(_native){
	    var IteratorPrototype = __webpack_require__(6).getProto(_default.call(new Base));
	    // Set @@toStringTag to native iterators
	    __webpack_require__(51)(IteratorPrototype, TAG, true);
	    // FF fix
	    if(!LIBRARY && has(proto, FF_ITERATOR))hide(IteratorPrototype, SYMBOL_ITERATOR, returnThis);
	  }
	  // Define iterator
	  if(!LIBRARY || FORCE)hide(proto, SYMBOL_ITERATOR, _default);
	  // Plug for library
	  Iterators[NAME] = _default;
	  Iterators[TAG]  = returnThis;
	  if(DEFAULT){
	    methods = {
	      keys:    IS_SET            ? _default : createMethod(KEYS),
	      values:  DEFAULT == VALUES ? _default : createMethod(VALUES),
	      entries: DEFAULT != VALUES ? _default : createMethod('entries')
	    };
	    if(FORCE)for(key in methods){
	      if(!(key in proto))$redef(proto, key, methods[key]);
	    } else $def($def.P + $def.F * BUGGY, NAME, methods);
	  }
	};

/***/ },
/* 41 */
/***/ function(module, exports) {

	module.exports = true;

/***/ },
/* 42 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(43);

/***/ },
/* 43 */
/***/ function(module, exports, __webpack_require__) {

	var $          = __webpack_require__(6)
	  , createDesc = __webpack_require__(44);
	module.exports = __webpack_require__(45) ? function(object, key, value){
	  return $.setDesc(object, key, createDesc(1, value));
	} : function(object, key, value){
	  object[key] = value;
	  return object;
	};

/***/ },
/* 44 */
/***/ function(module, exports) {

	module.exports = function(bitmap, value){
	  return {
	    enumerable  : !(bitmap & 1),
	    configurable: !(bitmap & 2),
	    writable    : !(bitmap & 4),
	    value       : value
	  };
	};

/***/ },
/* 45 */
/***/ function(module, exports, __webpack_require__) {

	// Thank's IE8 for his funny defineProperty
	module.exports = !__webpack_require__(16)(function(){
	  return Object.defineProperty({}, 'a', {get: function(){ return 7; }}).a != 7;
	});

/***/ },
/* 46 */
/***/ function(module, exports) {

	var hasOwnProperty = {}.hasOwnProperty;
	module.exports = function(it, key){
	  return hasOwnProperty.call(it, key);
	};

/***/ },
/* 47 */
/***/ function(module, exports, __webpack_require__) {

	var store  = __webpack_require__(48)('wks')
	  , Symbol = __webpack_require__(14).Symbol;
	module.exports = function(name){
	  return store[name] || (store[name] =
	    Symbol && Symbol[name] || (Symbol || __webpack_require__(49))('Symbol.' + name));
	};

/***/ },
/* 48 */
/***/ function(module, exports, __webpack_require__) {

	var global = __webpack_require__(14)
	  , SHARED = '__core-js_shared__'
	  , store  = global[SHARED] || (global[SHARED] = {});
	module.exports = function(key){
	  return store[key] || (store[key] = {});
	};

/***/ },
/* 49 */
/***/ function(module, exports) {

	var id = 0
	  , px = Math.random();
	module.exports = function(key){
	  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
	};

/***/ },
/* 50 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var $ = __webpack_require__(6)
	  , IteratorPrototype = {};
	
	// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
	__webpack_require__(43)(IteratorPrototype, __webpack_require__(47)('iterator'), function(){ return this; });
	
	module.exports = function(Constructor, NAME, next){
	  Constructor.prototype = $.create(IteratorPrototype, {next: __webpack_require__(44)(1,next)});
	  __webpack_require__(51)(Constructor, NAME + ' Iterator');
	};

/***/ },
/* 51 */
/***/ function(module, exports, __webpack_require__) {

	var has  = __webpack_require__(46)
	  , hide = __webpack_require__(43)
	  , TAG  = __webpack_require__(47)('toStringTag');
	
	module.exports = function(it, tag, stat){
	  if(it && !has(it = stat ? it : it.prototype, TAG))hide(it, TAG, tag);
	};

/***/ },
/* 52 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var $at  = __webpack_require__(53)(true);
	
	// 21.1.3.27 String.prototype[@@iterator]()
	__webpack_require__(40)(String, 'String', function(iterated){
	  this._t = String(iterated); // target
	  this._i = 0;                // next index
	// 21.1.5.2.1 %StringIteratorPrototype%.next()
	}, function(){
	  var O     = this._t
	    , index = this._i
	    , point;
	  if(index >= O.length)return {value: undefined, done: true};
	  point = $at(O, index);
	  this._i += point.length;
	  return {value: point, done: false};
	});

/***/ },
/* 53 */
/***/ function(module, exports, __webpack_require__) {

	// true  -> String#at
	// false -> String#codePointAt
	var toInteger = __webpack_require__(54)
	  , defined   = __webpack_require__(11);
	module.exports = function(TO_STRING){
	  return function(that, pos){
	    var s = String(defined(that))
	      , i = toInteger(pos)
	      , l = s.length
	      , a, b;
	    if(i < 0 || i >= l)return TO_STRING ? '' : undefined;
	    a = s.charCodeAt(i);
	    return a < 0xd800 || a > 0xdbff || i + 1 === l
	      || (b = s.charCodeAt(i + 1)) < 0xdc00 || b > 0xdfff
	        ? TO_STRING ? s.charAt(i) : a
	        : TO_STRING ? s.slice(i, i + 2) : (a - 0xd800 << 10) + (b - 0xdc00) + 0x10000;
	  };
	};

/***/ },
/* 54 */
/***/ function(module, exports) {

	// 7.1.4 ToInteger
	var ceil  = Math.ceil
	  , floor = Math.floor;
	module.exports = function(it){
	  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
	};

/***/ },
/* 55 */
/***/ function(module, exports, __webpack_require__) {

	var anObject = __webpack_require__(25)
	  , get      = __webpack_require__(56);
	module.exports = __webpack_require__(15).getIterator = function(it){
	  var iterFn = get(it);
	  if(typeof iterFn != 'function')throw TypeError(it + ' is not iterable!');
	  return anObject(iterFn.call(it));
	};

/***/ },
/* 56 */
/***/ function(module, exports, __webpack_require__) {

	var classof   = __webpack_require__(57)
	  , ITERATOR  = __webpack_require__(47)('iterator')
	  , Iterators = __webpack_require__(39);
	module.exports = __webpack_require__(15).getIteratorMethod = function(it){
	  if(it != undefined)return it[ITERATOR] || it['@@iterator'] || Iterators[classof(it)];
	};

/***/ },
/* 57 */
/***/ function(module, exports, __webpack_require__) {

	// getting tag from 19.1.3.6 Object.prototype.toString()
	var cof = __webpack_require__(10)
	  , TAG = __webpack_require__(47)('toStringTag')
	  // ES3 wrong here
	  , ARG = cof(function(){ return arguments; }()) == 'Arguments';
	
	module.exports = function(it){
	  var O, T, B;
	  return it === undefined ? 'Undefined' : it === null ? 'Null'
	    // @@toStringTag case
	    : typeof (T = (O = Object(it))[TAG]) == 'string' ? T
	    // builtinTag case
	    : ARG ? cof(O)
	    // ES3 arguments fallback
	    : (B = cof(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : B;
	};

/***/ },
/* 58 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(59), __esModule: true };

/***/ },
/* 59 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(35);
	__webpack_require__(52);
	module.exports = __webpack_require__(60);

/***/ },
/* 60 */
/***/ function(module, exports, __webpack_require__) {

	var classof   = __webpack_require__(57)
	  , ITERATOR  = __webpack_require__(47)('iterator')
	  , Iterators = __webpack_require__(39);
	module.exports = __webpack_require__(15).isIterable = function(it){
	  var O = Object(it);
	  return ITERATOR in O || '@@iterator' in O || Iterators.hasOwnProperty(classof(O));
	};

/***/ },
/* 61 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(62), __esModule: true };

/***/ },
/* 62 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(63);
	module.exports = __webpack_require__(15).Object.assign;

/***/ },
/* 63 */
/***/ function(module, exports, __webpack_require__) {

	// 19.1.3.1 Object.assign(target, source)
	var $def = __webpack_require__(13);
	
	$def($def.S + $def.F, 'Object', {assign: __webpack_require__(64)});

/***/ },
/* 64 */
/***/ function(module, exports, __webpack_require__) {

	// 19.1.2.1 Object.assign(target, source, ...)
	var toObject = __webpack_require__(65)
	  , IObject  = __webpack_require__(9)
	  , enumKeys = __webpack_require__(66);
	
	module.exports = __webpack_require__(16)(function(){
	  return Symbol() in Object.assign({}); // Object.assign available and Symbol is native
	}) ? function assign(target, source){   // eslint-disable-line no-unused-vars
	  var T = toObject(target)
	    , l = arguments.length
	    , i = 1;
	  while(l > i){
	    var S      = IObject(arguments[i++])
	      , keys   = enumKeys(S)
	      , length = keys.length
	      , j      = 0
	      , key;
	    while(length > j)T[key = keys[j++]] = S[key];
	  }
	  return T;
	} : Object.assign;

/***/ },
/* 65 */
/***/ function(module, exports, __webpack_require__) {

	// 7.1.13 ToObject(argument)
	var defined = __webpack_require__(11);
	module.exports = function(it){
	  return Object(defined(it));
	};

/***/ },
/* 66 */
/***/ function(module, exports, __webpack_require__) {

	// all enumerable object keys, includes symbols
	var $ = __webpack_require__(6);
	module.exports = function(it){
	  var keys       = $.getKeys(it)
	    , getSymbols = $.getSymbols;
	  if(getSymbols){
	    var symbols = getSymbols(it)
	      , isEnum  = $.isEnum
	      , i       = 0
	      , key;
	    while(symbols.length > i)if(isEnum.call(it, key = symbols[i++]))keys.push(key);
	  }
	  return keys;
	};

/***/ },
/* 67 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(68), __esModule: true };

/***/ },
/* 68 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(69);
	module.exports = __webpack_require__(15).Reflect.ownKeys;

/***/ },
/* 69 */
/***/ function(module, exports, __webpack_require__) {

	// 26.1.11 Reflect.ownKeys(target)
	var $def = __webpack_require__(13);
	
	$def($def.S, 'Reflect', {ownKeys: __webpack_require__(70)});

/***/ },
/* 70 */
/***/ function(module, exports, __webpack_require__) {

	// all object keys, includes non-enumerable and symbols
	var $        = __webpack_require__(6)
	  , anObject = __webpack_require__(25)
	  , Reflect  = __webpack_require__(14).Reflect;
	module.exports = Reflect && Reflect.ownKeys || function ownKeys(it){
	  var keys       = $.getNames(anObject(it))
	    , getSymbols = $.getSymbols;
	  return getSymbols ? keys.concat(getSymbols(it)) : keys;
	};

/***/ },
/* 71 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(72), __esModule: true };

/***/ },
/* 72 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(73);
	module.exports = __webpack_require__(15).Object.keys;

/***/ },
/* 73 */
/***/ function(module, exports, __webpack_require__) {

	// 19.1.2.14 Object.keys(O)
	var toObject = __webpack_require__(65);
	
	__webpack_require__(12)('keys', function($keys){
	  return function keys(it){
	    return $keys(toObject(it));
	  };
	});

/***/ },
/* 74 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(75), __esModule: true };

/***/ },
/* 75 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(76);
	module.exports = __webpack_require__(15).Object.entries;

/***/ },
/* 76 */
/***/ function(module, exports, __webpack_require__) {

	// http://goo.gl/XkBrjD
	var $def     = __webpack_require__(13)
	  , $entries = __webpack_require__(77)(true);
	
	$def($def.S, 'Object', {
	  entries: function entries(it){
	    return $entries(it);
	  }
	});

/***/ },
/* 77 */
/***/ function(module, exports, __webpack_require__) {

	var $         = __webpack_require__(6)
	  , toIObject = __webpack_require__(8);
	module.exports = function(isEntries){
	  return function(it){
	    var O      = toIObject(it)
	      , keys   = $.getKeys(O)
	      , length = keys.length
	      , i      = 0
	      , result = Array(length)
	      , key;
	    if(isEntries)while(length > i)result[i] = [key = keys[i++], O[key]];
	    else while(length > i)result[i] = O[keys[i++]];
	    return result;
	  };
	};

/***/ },
/* 78 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(79), __esModule: true };

/***/ },
/* 79 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(80);
	module.exports = __webpack_require__(15).Object.values;

/***/ },
/* 80 */
/***/ function(module, exports, __webpack_require__) {

	// http://goo.gl/XkBrjD
	var $def    = __webpack_require__(13)
	  , $values = __webpack_require__(77)(false);
	
	$def($def.S, 'Object', {
	  values: function values(it){
	    return $values(it);
	  }
	});

/***/ },
/* 81 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, '__esModule', {
	  value: true
	});
	var toString = Object.prototype.toString;
	
	var isObject = function isObject(o) {
	  return toString.call(o) === '[object Object]';
	};
	
	var consume = function consume(i) {
	  var iterator = i && i.keys;
	  if (!iterator) return;
	  var arr = [];
	  while ((res = iterator.next(), !res.isDone)) arr.push(res.value);
	  return res;
	};
	
	exports['default'] = { isObject: isObject, consume: consume };
	module.exports = exports['default'];

/***/ },
/* 82 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var _slicedToArray = __webpack_require__(32)["default"];
	
	var _Object$entries = __webpack_require__(74)["default"];
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	function _Restriction(valueTransformer) {
	  return function (msg, isFailure) {
	    var validator = function validator(element, context) {
	      if (isFailure(valueTransformer(element))) {
	        element.addError(msg);
	        return false;
	      }
	      return true;
	    };
	    return validator;
	  };
	  return factory;
	}
	
	// Scalars
	var _ValueRestriction = _Restriction(function (e) {
	  return e.value;
	});
	
	function createValidators(validators) {
	  return _Object$entries(validators).reduce(function (factorized, _ref) {
	    var _ref2 = _slicedToArray(_ref, 2);
	
	    var name = _ref2[0];
	    var original = _ref2[1];
	
	    var wrapped = function wrapped() {
	      var validator = original.apply(undefined, arguments);
	      validator.factory = wrapped;
	      return validator;
	    };
	    factorized[name] = wrapped;
	    return factorized;
	  }, {});
	}
	
	var Value = createValidators({
	  // Ok, Present *is* in terms of the serialized property but it's really
	  // all about the value. You got me.
	  Present: function Present(msg) {
	    return _ValueRestriction(msg, function (v) {
	      return v === undefined;
	    });
	  },
	  AtLeast: function AtLeast(min, msg) {
	    return _ValueRestriction(msg, function (v) {
	      return v < min;
	    });
	  },
	  AtMost: function AtMost(max, msg) {
	    return _ValueRestriction(msg, function (v) {
	      return v > max;
	    });
	  },
	  Between: function Between(min, max, msg) {
	    return _ValueRestriction(msg, function (v) {
	      return v < min || v > max;
	    });
	  }
	});
	
	// Strings & Lists
	var _LengthRestriction = _Restriction(function (e) {
	  return e.value ? e.value.length : 0;
	});
	
	var Length = createValidators({
	  AtLeast: function AtLeast(min, msg) {
	    return _LengthRestriction(msg, function (v) {
	      return v < min;
	    });
	  },
	  AtMost: function AtMost(max, msg) {
	    return _LengthRestriction(msg, function (v) {
	      return v > max;
	    });
	  },
	  Between: function Between(min, max, msg) {
	    return _LengthRestriction(msg, function (v) {
	      return v < min || v > max;
	    });
	  },
	  Exactly: function Exactly(count, msg) {
	    return _LengthRestriction(msg, function (v) {
	      return v === count;
	    });
	  }
	});
	
	exports["default"] = { Value: Value, Length: Length };
	module.exports = exports["default"];

/***/ }
/******/ ])));
//# sourceMappingURL=index.js.map