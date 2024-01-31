"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "applyJsonLogic", {
  enumerable: true,
  get: function get() {
    return _jsonLogic.applyJsonLogic;
  }
});
Object.defineProperty(exports, "cleanJSX", {
  enumerable: true,
  get: function get() {
    return _stuff.cleanJSX;
  }
});
exports.decompressConfig = exports.configKeys = exports.compressConfig = exports.compileConfig = void 0;
Object.defineProperty(exports, "isDirtyJSX", {
  enumerable: true,
  get: function get() {
    return _stuff.isDirtyJSX;
  }
});
Object.defineProperty(exports, "isJSX", {
  enumerable: true,
  get: function get() {
    return _stuff.isJSX;
  }
});
var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));
var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));
var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));
var _merge = _interopRequireDefault(require("lodash/merge"));
var _pick = _interopRequireDefault(require("lodash/pick"));
var _stuff = require("./stuff");
var _clone = _interopRequireDefault(require("clone"));
var _jsonLogicJs = _interopRequireDefault(require("json-logic-js"));
var _jsonLogic = require("./jsonLogic");
var _ = require("..");
var _configUtils = require("./configUtils");
function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { (0, _defineProperty2["default"])(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
// Add new operations for JsonLogic
(0, _jsonLogic.addRequiredJsonLogicOperations)();
function applyJsonLogicWithPath(logic, data, path) {
  var ret;
  try {
    ret = _jsonLogicJs["default"].apply(logic, data);
  } catch (e) {
    e.message = "".concat(path.join("."), " :: ").concat(e.message);
    throw e;
  }
  return ret;
}
function callContextFn(_this, fn, args, path) {
  var ret;
  try {
    ret = fn.call.apply(fn, [_this].concat((0, _toConsumableArray2["default"])(args)));
  } catch (e) {
    e.message = "".concat(path.join("."), " :: ").concat(e.message);
    throw e;
  }
  return ret;
}
var configKeys = exports.configKeys = ["conjunctions", "fields", "types", "operators", "widgets", "settings", "funcs", "ctx"];

// type: 
//  x - iterate (with nesting `subfields`)
//  "r" - RenderedReactElement
//    Will be compiled with renderReactElement() into React element rendered with `React.createElement` (`ctx.RCE`)
//  "rf" - JsonLogicFunction/string to render React
//    JL data is { props, ctx }
//    Should return {type, props} or string, where type or string - React component
//    Can use { JSX: ["SomeComponent", {var: "props"}] } or just return "SomeComponent"
//    Returned component will be searched in ctx.components/ctx.W/ctx.O, see getReactComponentFromCtx()
//    Will be compiled with compileJsonLogicReact() into function with args (props, ctx) that will return renderReactElement()
//  "f" - JsonLogicFunction/string
//    JL data is { args, ctx } plus named args defined in `args` inside `compileMeta`
//    Can use { CALL: [ {var: "ctx.someFunc"}, null, {var: "args[0]" }] } 
//    If string is passed, it's a path to function in ctx (with dot notation)
//    Will be compiled with compileJsonLogic() into function with any args and `this` should be `ctx`

var compileMetaFieldSettings = {
  asyncFetch: {
    type: "f",
    args: ["search", "offset"]
  },
  labelYes: {
    type: "r"
  },
  labelNo: {
    type: "r"
  },
  marks: {
    type: "r",
    isArr: true
  },
  validateValue: {
    type: "f",
    args: ["val", "fieldSettings", "op", "opDef", "rightFieldDef"]
  }
};
var compileMetaWidget = _objectSpread(_objectSpread({}, compileMetaFieldSettings), {}, {
  factory: {
    type: "rf"
  },
  formatValue: {
    type: "f",
    args: ["val", "fieldDef", "wgtDef", "isForDisplay", "op", "opDef", "rightFieldDef"]
  },
  sqlFormatValue: {
    type: "f",
    args: ["val", "fieldDef", "wgtDef", "op", "opDef", "rightFieldDef"]
  },
  spelFormatValue: {
    type: "f",
    args: ["val", "fieldDef", "wgtDef", "op", "opDef", "rightFieldDef"]
  },
  spelImportValue: {
    type: "f",
    args: ["val", "wgtDef", "args"]
  },
  mongoFormatValue: {
    type: "f",
    args: ["val", "fieldDef", "wgtDef", "op", "opDef"]
  },
  elasticSearchFormatValue: {
    type: "f",
    args: ["queryType", "val", "op", "field", "config"]
  },
  jsonLogic: {
    type: "f",
    args: ["val", "fieldDef", "wgtDef", "op", "opDef"]
  },
  validateValue: {
    type: "f",
    args: ["val", "fieldSettings", "op", "opDef", "rightFieldDef"]
  },
  // obsolete
  toJS: {
    type: "f",
    args: ["val"]
  }
});
var compileMetaOperator = {
  options: {
    // proximity
    factory: {
      type: "rf"
    }
  },
  formatOp: {
    type: "f",
    args: ["field", "op", "vals", "valueSrc", "valueType", "opDef", "operatorOptions", "isForDisplay", "fieldDef"]
  },
  mongoFormatOp: {
    type: "f",
    args: ["field", "op", "vals", "useExpr", "valueSrc", "valueType", "opDef", "operatorOptions", "fieldDef"]
  },
  sqlFormatOp: {
    type: "f",
    args: ["field", "op", "vals", "valueSrc", "valueType", "opDef", "operatorOptions", "fieldDef"]
  },
  spelFormatOp: {
    type: "f",
    args: ["field", "op", "vals", "valueSrc", "valueType", "opDef", "operatorOptions", "fieldDef"]
  },
  jsonLogic: {
    type: "f",
    ignore: "string",
    args: ["field", "op", "vals", "opDef", "operatorOptions", "fieldDef"]
  },
  elasticSearchQueryType: {
    type: "f",
    ignore: "string",
    args: ["valueType"]
  },
  textSeparators: {
    type: "r",
    isArr: true
  }
};
var compileMetaConjunction = {
  formatConj: {
    type: "f",
    args: ["children", "conj", "not", "isForDisplay"]
  },
  sqlFormatConj: {
    type: "f",
    args: ["children", "conj", "not"]
  },
  spelFormatConj: {
    type: "f",
    args: ["children", "conj", "not", "omitBrackets"]
  }
};
var compileMetaWidgetForType = {
  widgetProps: compileMetaWidget,
  opProps: compileMetaOperator
};
var compileMetaFunc = {
  renderBrackets: {
    type: "r",
    isArr: true
  },
  renderSeps: {
    type: "r",
    isArr: true
  },
  jsonLogic: {
    type: "f",
    ignore: "string",
    args: ["formattedArgs"]
  },
  jsonLogicImport: {
    type: "f",
    args: ["val"]
  },
  spelImport: {
    type: "f",
    args: ["spel"]
  },
  formatFunc: {
    type: "f",
    args: ["formattedArgs", "isForDisplay"]
  },
  sqlFormatFunc: {
    type: "f",
    args: ["formattedArgs"]
  },
  mongoFormatFunc: {
    type: "f",
    args: ["formattedArgs"]
  },
  spelFormatFunc: {
    type: "f",
    args: ["formattedArgs"]
  }
};
var compileMetaSettings = {
  locale: {
    mui: {
      type: "f",
      args: [],
      invokeWith: [],
      ignore: "jl"
    }
  },
  canCompareFieldWithField: {
    type: "f",
    args: ["leftField", "leftFieldConfig", "rightField", "rightFieldConfig", "op"]
  },
  formatReverse: {
    type: "f",
    args: ["q", "op", "reversedOp", "operatorDefinition", "revOperatorDefinition", "isForDisplay"]
  },
  sqlFormatReverse: {
    type: "f",
    args: ["q"]
  },
  spelFormatReverse: {
    type: "f",
    args: ["q"]
  },
  formatField: {
    type: "f",
    args: ["field", "parts", "label2", "fieldDefinition", "config", "isForDisplay"]
  },
  formatSpelField: {
    type: "f",
    args: ["field", "parentField", "parts", "partsExt", "fieldDefinition", "config"]
  },
  formatAggr: {
    type: "f",
    args: ["whereStr", "aggrField", "operator", "value", "valueSrc", "valueType", "opDef", "operatorOptions", "isForDisplay", "aggrFieldDef"]
  },
  normalizeListValues: {
    type: "f",
    args: ["listValues", "type", "fieldSettings"]
  },
  renderConfirm: {
    type: "f",
    args: ["props"]
  },
  useConfirm: {
    type: "f",
    args: []
  },
  renderField: {
    type: "rf"
  },
  renderOperator: {
    type: "rf"
  },
  renderFunc: {
    type: "rf"
  },
  renderConjs: {
    type: "rf"
  },
  renderButton: {
    type: "rf"
  },
  renderIcon: {
    type: "rf"
  },
  renderButtonGroup: {
    type: "rf"
  },
  renderValueSources: {
    type: "rf"
  },
  renderFieldSources: {
    type: "rf"
  },
  renderProvider: {
    type: "rf"
  },
  renderSwitch: {
    type: "rf"
  },
  renderSwitchPrefix: {
    type: "r"
  },
  renderItem: {
    type: "rf"
  },
  renderBeforeWidget: {
    type: "rf"
  },
  renderAfterWidget: {
    type: "rf"
  },
  renderBeforeActions: {
    type: "rf"
  },
  renderAfterActions: {
    type: "rf"
  },
  renderRuleError: {
    type: "rf"
  }
};
var compileMeta = {
  fields: {
    x: {
      fieldSettings: compileMetaFieldSettings,
      widgets: {
        x: compileMetaWidgetForType
      },
      mainWidgetProps: compileMetaWidget
    }
  },
  widgets: {
    x: compileMetaWidget
  },
  conjunctions: {
    x: compileMetaConjunction
  },
  operators: {
    x: compileMetaOperator
  },
  types: {
    x: {
      widgets: {
        x: compileMetaWidgetForType
      }
    }
  },
  funcs: {
    x: compileMetaFunc
  },
  settings: compileMetaSettings
};
var isObject = function isObject(v) {
  return (0, _typeof2["default"])(v) == "object" && v !== null && !Array.isArray(v);
};

/////////////

var compressConfig = exports.compressConfig = function compressConfig(config, baseConfig) {
  if (config.__fieldNames) {
    throw new Error("Don't apply `compressConfig()` to extended config");
  }
  var zipConfig = (0, _pick["default"])(config, configKeys);
  delete zipConfig.ctx;
  var _clean = function _clean(target, base, path, meta) {
    if (isObject(target)) {
      if ((0, _stuff.isDirtyJSX)(target)) {
        target = (0, _stuff.cleanJSX)(target);
      }
      if (path[0] === "funcs" && !base) {
        var funcKey = path[path.length - 1];
        // todo: if there will be change in `BasicFuncs` when funcs can be nested, need to chnage code to find `base`
        base = (0, _configUtils.getFieldRawConfig)({
          funcs: meta.BasicFuncs
        }, funcKey, "funcs", "subfields") || undefined;
        if (base) {
          target["$$key"] = funcKey;
        }
      }
      if (base !== undefined && isObject(base)) {
        for (var k in base) {
          if (Object.prototype.hasOwnProperty.call(base, k)) {
            if (!Object.keys(target).includes(k) || target[k] === undefined && base[k] !== undefined) {
              // deleted in target
              target[k] = "$$deleted";
            } else {
              target[k] = _clean(target[k], base[k], [].concat((0, _toConsumableArray2["default"])(path), [k]), meta);
              if (target[k] === undefined) {
                delete target[k];
              }
            }
          }
        }
      }
      for (var _k in target) {
        if (Object.prototype.hasOwnProperty.call(target, _k)) {
          if (!base || !Object.keys(base).includes(_k)) {
            var _base;
            // new in target
            target[_k] = _clean(target[_k], (_base = base) === null || _base === void 0 ? void 0 : _base[_k], [].concat((0, _toConsumableArray2["default"])(path), [_k]), meta);
          }
          if (target[_k] === undefined) {
            delete target[_k];
          }
        }
      }
      if (Object.keys(target).length === 0) {
        target = undefined;
      }
    } else if (Array.isArray(target)) {
      // don't deep compare arrays, but allow clean JSX inside array
      target.forEach(function (val, ind) {
        target[ind] = _clean(target[ind], undefined, [].concat((0, _toConsumableArray2["default"])(path), [ind]), meta);
      });
    }
    if (base !== undefined && (0, _stuff.shallowEqual)(target, base, true)) {
      return undefined;
    }
    if (typeof target === "function") {
      throw new Error("compressConfig: function at ".concat(path.join("."), " should be converted to JsonLogic"));
    }
    return target;
  };
  for (var _i = 0, _configKeys = configKeys; _i < _configKeys.length; _i++) {
    var rootKey = _configKeys[_i];
    if (rootKey === "ctx") {
      // ignore
    } else if (rootKey === "fields") {
      // just copy
      zipConfig[rootKey] = (0, _clone["default"])(zipConfig[rootKey]);
      _clean(zipConfig[rootKey], {}, [rootKey]);
    } else if (rootKey === "funcs") {
      // leave only diff for every used func
      zipConfig[rootKey] = (0, _clone["default"])(zipConfig[rootKey] || {});
      for (var k in zipConfig[rootKey]) {
        _clean(zipConfig[rootKey][k], null, [rootKey, k], {
          BasicFuncs: _.BasicFuncs
        });
      }
    } else {
      // leave only diff
      zipConfig[rootKey] = (0, _clone["default"])(zipConfig[rootKey]);
      _clean(zipConfig[rootKey], baseConfig[rootKey], [rootKey]);
    }
  }
  return zipConfig;
};
var decompressConfig = exports.decompressConfig = function decompressConfig(zipConfig, baseConfig, ctx) {
  if (!zipConfig.settings.useConfigCompress) {
    throw new Error("Please enable `useConfigCompress` in config settings to use decompressConfig()");
  }
  var unzipConfig = {};
  var _mergeDeep = function _mergeDeep(target, mixin, path) {
    if (isObject(mixin)) {
      if (!isObject(target)) {
        target = {};
      }
      for (var k in mixin) {
        if (Object.prototype.hasOwnProperty.call(mixin, k)) {
          if (mixin[k] === "$$deleted") {
            delete target[k];
          } else {
            target[k] = _mergeDeep(target[k], mixin[k], [].concat((0, _toConsumableArray2["default"])(path), [k]));
          }
        }
      }
    } else if (Array.isArray(mixin)) {
      // don't merge arrays, just replace
      target = (0, _clone["default"])(mixin);
    } else {
      target = mixin;
    }
    return target;
  };
  var _resolveAndMergeDeep = function _resolveAndMergeDeep(target, path, meta) {
    // try to resolve by $$key and merge
    var resolved = false;
    if (isObject(target) && Object.prototype.hasOwnProperty.call(target, "$$key") && target["$$key"]) {
      var func = (0, _configUtils.getFieldRawConfig)({
        funcs: meta.BasicFuncs
      }, target["$$key"], "funcs", "subfields");
      if (func) {
        // deep merge func <- zip
        delete target["$$key"];
        target = _mergeDeep((0, _clone["default"])(func), target, path);
        resolved = true;
      } else {
        throw new Error("decompressConfig: basic function not found by key ".concat(target["$$key"], " at ").concat(path.join(".")));
      }
    }
    if (!resolved) {
      if (isObject(target)) {
        // loop through object to find refs ($$key)
        for (var k in target) {
          if (Object.prototype.hasOwnProperty.call(target, k)) {
            target[k] = _resolveAndMergeDeep(target[k], [].concat((0, _toConsumableArray2["default"])(path), [k]), meta);
          }
        }
      } else if (Array.isArray(target)) {
        // also loop through array to find refs ($$key)
        var _iterator = _createForOfIteratorHelper(target),
          _step;
        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var _k2 = _step.value;
            target[_k2] = _resolveAndMergeDeep(target[_k2], [].concat((0, _toConsumableArray2["default"])(path), [_k2]), meta);
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }
      }
    }
    return target;
  };
  for (var _i2 = 0, _configKeys2 = configKeys; _i2 < _configKeys2.length; _i2++) {
    var rootKey = _configKeys2[_i2];
    if (rootKey === "ctx") {
      // simple deep merge
      unzipConfig[rootKey] = (0, _merge["default"])({}, baseConfig.ctx || {}, ctx || {});
    } else if (rootKey === "funcs") {
      // use $$key to pick funcs from BasicFuncs
      unzipConfig[rootKey] = (0, _clone["default"])(zipConfig[rootKey] || {});
      _resolveAndMergeDeep(unzipConfig[rootKey], [rootKey], {
        BasicFuncs: _.BasicFuncs
      });
    } else if (rootKey === "fields") {
      // just copy
      unzipConfig[rootKey] = (0, _clone["default"])(zipConfig[rootKey] || {});
    } else {
      // deep merge base <- zip
      unzipConfig[rootKey] = (0, _clone["default"])(baseConfig[rootKey] || {});
      _mergeDeep(unzipConfig[rootKey], zipConfig[rootKey] || {}, [rootKey]);
    }
  }
  return unzipConfig;
};

/////////////

var compileConfig = exports.compileConfig = function compileConfig(config) {
  if (config.__compliled) {
    return config;
  }
  config = (0, _clone["default"])(config);
  var opts = {
    ctx: config.ctx
  };
  var logs = [];
  _compileConfigParts(config, config, opts, compileMeta, logs);
  //console.log(logs.join("\n"));

  Object.defineProperty(config, "__compliled", {
    enumerable: false,
    writable: false,
    value: true
  });
  return config;
};
function _compileConfigParts(config, subconfig, opts, meta, logs) {
  var path = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : [];
  if (!subconfig) return;
  var isRoot = !path.length;
  for (var k in meta) {
    var submeta = meta[k];
    var newPath = k === "x" ? path : [].concat((0, _toConsumableArray2["default"])(path), [k]);
    // if (isRoot) {
    //   //logs.push(`Cloned ${newPath.join(".")}`);
    //   config[k] = clone(config[k]);
    // }
    if (submeta.type === "r") {
      var targetObj = subconfig;
      var val = targetObj[k];
      if (submeta.isArr) {
        for (var ind in val) {
          var newVal = renderReactElement(val[ind], opts, [].concat((0, _toConsumableArray2["default"])(newPath), [ind]));
          if (newVal !== val[ind]) {
            logs.push("Compiled ".concat(newPath.join("."), "[").concat(ind, "]"));
            val[ind] = newVal;
          }
        }
      } else {
        var _newVal = renderReactElement(val, opts, newPath, undefined);
        if (_newVal !== val) {
          logs.push("Compiled R ".concat(newPath.join(".")));
          targetObj[k] = _newVal;
        }
      }
    } else if (submeta.type === "rf") {
      var _targetObj = subconfig;
      var _val = _targetObj[k];
      var _newVal2 = compileJsonLogicReact(_val, opts, newPath, submeta.ignore);
      if (_newVal2 !== _val) {
        logs.push("Compiled JL-RF ".concat(newPath.join(".")));
        _targetObj[k] = _newVal2;
      }
    } else if (submeta.type === "f") {
      var _targetObj2 = subconfig;
      var _val2 = _targetObj2[k];
      var _newVal3 = compileJsonLogic(_val2, opts, newPath, submeta.args, submeta.ignore);
      if (submeta.invokeWith && _newVal3 && typeof _newVal3 === "function") {
        var _newVal4;
        _newVal3 = (_newVal4 = _newVal3).call.apply(_newVal4, [null].concat((0, _toConsumableArray2["default"])(submeta.invokeWith)));
      }
      if (_newVal3 !== _val2) {
        logs.push("Compiled JL-F ".concat(newPath.join(".")));
        _targetObj2[k] = _newVal3;
      }
    } else if (k === "x") {
      for (var field in subconfig) {
        newPath = [].concat((0, _toConsumableArray2["default"])(path), [field]);
        var def = subconfig[field];
        _compileConfigParts(config, def, opts, submeta, logs, newPath);
        if (def.subfields) {
          // tip: need to pass `meta`, not `submeta`
          _compileConfigParts(config, def.subfields, opts, meta, logs, newPath);
        }
      }
    } else {
      var _def = subconfig[k];
      _compileConfigParts(config, _def, opts, submeta, logs, newPath);
    }
  }
}
function compileJsonLogicReact(jl, opts, path) {
  var ignore = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : undefined;
  if ((0, _stuff.isJsonLogic)(jl)) {
    return function (props, ctx) {
      ctx = ctx || (opts === null || opts === void 0 ? void 0 : opts.ctx); // can use context compile-time if not passed at runtime
      var data = {
        props: props,
        ctx: ctx
      };
      var re = applyJsonLogicWithPath(jl, data, path);
      if (typeof re === "string") {
        re = {
          type: re,
          props: props
        };
      }
      var ret = renderReactElement(re, {
        ctx: ctx
      }, path);
      return ret;
    };
  } else if (typeof jl === "string") {
    return function (props, ctx) {
      ctx = ctx || (opts === null || opts === void 0 ? void 0 : opts.ctx); // can use context compile-time if not passed at runtime
      var fn = jl.split(".").reduce(function (o, k) {
        return o === null || o === void 0 ? void 0 : o[k];
      }, ctx);
      if (fn) {
        return callContextFn(this, fn, [props, ctx], path);
      } else {
        var re = {
          type: jl,
          props: props
        };
        var ret = renderReactElement(re, {
          ctx: ctx
        }, path);
        return ret;
      }
    };
  }
  return jl;
}
function compileJsonLogic(jl, opts, path, argNames) {
  var ignore = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : undefined;
  if ((0, _stuff.isJsonLogic)(jl) && ignore !== "jl") {
    return function () {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      var ctx = this || (opts === null || opts === void 0 ? void 0 : opts.ctx); // can use context compile-time if not passed at runtime
      var data = (argNames || []).reduce(function (acc, k, i) {
        return _objectSpread(_objectSpread({}, acc), {}, (0, _defineProperty2["default"])({}, k, args[i]));
      }, {
        args: args,
        ctx: ctx
      });
      var ret = applyJsonLogicWithPath(jl, data, path);
      return ret;
    }.bind(opts === null || opts === void 0 ? void 0 : opts.ctx);
  } else if (typeof jl === "string" && ignore !== "string") {
    return function () {
      var ctx = this || (opts === null || opts === void 0 ? void 0 : opts.ctx); // can use context compile-time if not passed at runtime
      var fn = jl.split(".").reduce(function (o, k) {
        return o === null || o === void 0 ? void 0 : o[k];
      }, ctx);
      if (fn) {
        for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          args[_key2] = arguments[_key2];
        }
        return callContextFn(this, fn, args, path);
      } else {
        throw new Error("".concat(path.join("."), " :: Function ").concat(jl, " is not found in ctx"));
      }
    }.bind(opts === null || opts === void 0 ? void 0 : opts.ctx);
  }
  return jl;
}
function getReactComponentFromCtx(name, ctx) {
  var _ctx$components;
  return (ctx === null || ctx === void 0 || (_ctx$components = ctx.components) === null || _ctx$components === void 0 ? void 0 : _ctx$components[name]) || ctx.W[name] || ctx.O[name];
}
function renderReactElement(jsx, opts, path) {
  var key = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : undefined;
  if ((0, _stuff.isJSX)(jsx)) {
    var _props;
    var type = jsx.type,
      props = jsx.props;
    if (typeof type !== "string") {
      throw new Error("renderReactElement for ".concat(path.join("."), ": type should be string"));
    }
    var Cmp = getReactComponentFromCtx(type, opts.ctx) || type.toLowerCase();
    var children;
    if (key !== undefined) {
      props = _objectSpread(_objectSpread({}, props), {}, {
        key: key
      });
    }
    if ((_props = props) !== null && _props !== void 0 && _props.children) {
      children = renderReactElement(props.children, opts, path);
      props = _objectSpread(_objectSpread({}, props), {}, {
        children: children
      });
    }
    var res = opts.ctx.RCE(Cmp, props);
    return res;
  } else if (jsx instanceof Array) {
    return jsx.map(function (el, i) {
      return renderReactElement(el, opts, path, "" + i);
    });
  }
  return jsx;
}