"use strict";

var _regeneratorRuntime2 = require("@babel/runtime/regenerator");
var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
var _exportNames = {
  extendConfig: true,
  iterateFuncs: true,
  iterateFields: true,
  getFieldRawConfig: true,
  normalizeField: true,
  getFuncSignature: true,
  getFuncConfig: true,
  getFuncArgConfig: true,
  isFieldDescendantOfField: true,
  getFieldPath: true,
  getFieldParts: true,
  getFieldPathParts: true,
  getFieldSrc: true,
  getFieldConfig: true,
  getOperatorConfig: true,
  getFieldWidgetConfig: true,
  _widgetDefKeysToOmit: true
};
exports.isFieldDescendantOfField = exports.getOperatorConfig = exports.getFuncSignature = exports.getFuncConfig = exports.getFuncArgConfig = exports.getFieldWidgetConfig = exports.getFieldSrc = exports.getFieldRawConfig = exports.getFieldPathParts = exports.getFieldPath = exports.getFieldParts = exports.getFieldConfig = exports.extendConfig = exports._widgetDefKeysToOmit = void 0;
exports.iterateFields = iterateFields;
exports.iterateFuncs = iterateFuncs;
exports.normalizeField = void 0;
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));
var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));
var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));
var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));
var _merge = _interopRequireDefault(require("lodash/merge"));
var _pick = _interopRequireDefault(require("lodash/pick"));
var _uuid = _interopRequireDefault(require("../utils/uuid"));
var _mergeWith = _interopRequireDefault(require("lodash/mergeWith"));
var _default = require("../config/default");
var _moment = _interopRequireDefault(require("moment"));
var _stuff = require("./stuff");
var _ruleUtils = require("./ruleUtils");
var _clone = _interopRequireDefault(require("clone"));
var _configSerialize = require("./configSerialize");
Object.keys(_configSerialize).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _configSerialize[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _configSerialize[key];
    }
  });
});
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { (0, _defineProperty2["default"])(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
var _marked = /*#__PURE__*/_regeneratorRuntime2.mark(iterateFuncs),
  _marked2 = /*#__PURE__*/_regeneratorRuntime2.mark(iterateFields);
function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
/////////////

var extendConfig = exports.extendConfig = function extendConfig(config, configId) {
  var canCompile = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
  //operators, defaultOperator - merge
  //widgetProps (including valueLabel, valuePlaceholder, hideOperator, operatorInlineLabel) - concrete by widget

  if (config.__configId) {
    return config;
  }

  // Clone (and compile if need)
  if (canCompile && config.settings.useConfigCompress) {
    if (config.__compliled) {
      // already compiled
      config = (0, _clone["default"])(config);
    } else {
      // will be cloned and compiled
      config = (0, _configSerialize.compileConfig)(config);
    }
  } else {
    config = (0, _clone["default"])(config);
  }
  config.settings = (0, _mergeWith["default"])({}, _default.settings, config.settings, mergeCustomizerNoArrays);
  config.__fieldsCntByType = {};
  config.__funcsCntByType = {};
  config.__fieldNames = {};
  _extendTypesConfig(config.types, config);
  _extendFieldsConfig(config.fields, config);
  _extendFuncArgsConfig(config.funcs, config);
  var momentLocale = config.settings.locale.moment;
  if (momentLocale) {
    _moment["default"].locale(momentLocale);
  }
  Object.defineProperty(config, "__configId", {
    enumerable: false,
    writable: false,
    value: configId || (0, _uuid["default"])()
  });
  (0, _stuff.deepFreeze)(config);
  return config;
};
function _extendTypesConfig(typesConfig, config) {
  for (var type in typesConfig) {
    var typeConfig = typesConfig[type];
    _extendTypeConfig(type, typeConfig, config);
  }
}
function _extendTypeConfig(type, typeConfig, config) {
  var operators = null,
    defaultOperator = null;
  typeConfig.mainWidget = typeConfig.mainWidget || Object.keys(typeConfig.widgets).filter(function (w) {
    return w != "field" && w != "func";
  })[0];
  for (var widget in typeConfig.widgets) {
    var typeWidgetConfig = typeConfig.widgets[widget];
    if (typeWidgetConfig.operators) {
      var typeWidgetOperators = typeWidgetConfig.operators;
      if (typeConfig.excludeOperators) {
        typeWidgetOperators = typeWidgetOperators.filter(function (op) {
          return !typeConfig.excludeOperators.includes(op);
        });
      }
      operators = (0, _stuff.mergeArraysSmart)(operators, typeWidgetOperators);
    }
    if (typeWidgetConfig.defaultOperator) defaultOperator = typeWidgetConfig.defaultOperator;
    if (widget == typeConfig.mainWidget) {
      typeWidgetConfig = (0, _merge["default"])({}, {
        widgetProps: typeConfig.mainWidgetProps || {}
      }, typeWidgetConfig);
    }
    typeConfig.widgets[widget] = typeWidgetConfig;
  }
  if (!typeConfig.valueSources) typeConfig.valueSources = Object.keys(config.settings.valueSourcesInfo);
  var _iterator = _createForOfIteratorHelper(typeConfig.valueSources),
    _step;
  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var valueSrc = _step.value;
      if (valueSrc != "value" && !typeConfig.widgets[valueSrc]) {
        typeConfig.widgets[valueSrc] = {};
      }
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
  if (!typeConfig.operators && operators) typeConfig.operators = Array.from(new Set(operators)); //unique
  if (!typeConfig.defaultOperator && defaultOperator) typeConfig.defaultOperator = defaultOperator;
}
function _extendFieldsConfig(subconfig, config) {
  var path = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
  for (var field in subconfig) {
    _extendFieldConfig(subconfig[field], config, [].concat((0, _toConsumableArray2["default"])(path), [field]));
    if (subconfig[field].subfields) {
      _extendFieldsConfig(subconfig[field].subfields, config, [].concat((0, _toConsumableArray2["default"])(path), [field]));
    }
  }
}
function _extendFuncArgsConfig(subconfig, config) {
  var _config$settings;
  var path = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
  if (!subconfig) return;
  var fieldSeparator = (config === null || config === void 0 || (_config$settings = config.settings) === null || _config$settings === void 0 ? void 0 : _config$settings.fieldSeparator) || ".";
  for (var funcKey in subconfig) {
    var funcPath = [].concat((0, _toConsumableArray2["default"])(path), [funcKey]).join(fieldSeparator);
    var funcDef = subconfig[funcKey];
    if (funcDef.returnType) {
      if (!config.__funcsCntByType[funcDef.returnType]) config.__funcsCntByType[funcDef.returnType] = 0;
      config.__funcsCntByType[funcDef.returnType]++;
    }
    for (var argKey in funcDef.args) {
      _extendFieldConfig(funcDef.args[argKey], config, null, true);
    }

    // isOptional can be only in the end
    if (funcDef.args) {
      var argKeys = Object.keys(funcDef.args);
      var tmpIsOptional = true;
      var _iterator2 = _createForOfIteratorHelper(argKeys.reverse()),
        _step2;
      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var _argKey = _step2.value;
          var argDef = funcDef.args[_argKey];
          if (!tmpIsOptional && argDef.isOptional) {
            _stuff.logger.info("Arg ".concat(_argKey, " for func ").concat(funcPath, " can't be optional"));
            delete argDef.isOptional;
          }
          if (!argDef.isOptional) tmpIsOptional = false;
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
    }
    if (funcDef.subfields) {
      _extendFuncArgsConfig(funcDef.subfields, config, [].concat((0, _toConsumableArray2["default"])(path), [funcKey]));
    }
  }
}
function _extendFieldConfig(fieldConfig, config) {
  var path = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
  var isFuncArg = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
  var operators = null,
    defaultOperator = null;
  var typeConfig = config.types[fieldConfig.type];
  var excludeOperatorsForField = fieldConfig.excludeOperators || [];
  if (fieldConfig.type != "!struct" && fieldConfig.type != "!group") {
    var keysToPutInFieldSettings = ["listValues", "treeValues", "allowCustomValues", "validateValue"];
    if (!fieldConfig.fieldSettings) fieldConfig.fieldSettings = {};
    for (var _i = 0, _keysToPutInFieldSett = keysToPutInFieldSettings; _i < _keysToPutInFieldSett.length; _i++) {
      var k = _keysToPutInFieldSett[_i];
      if (fieldConfig[k]) {
        fieldConfig.fieldSettings[k] = fieldConfig[k];
        delete fieldConfig[k];
      }
    }

    // normalize listValues
    if (fieldConfig.fieldSettings.listValues) {
      if (config.settings.normalizeListValues) {
        fieldConfig.fieldSettings.listValues = config.settings.normalizeListValues.call(config.ctx, fieldConfig.fieldSettings.listValues, fieldConfig.type, fieldConfig.fieldSettings);
      }
    }
    // same for treeValues
    if (fieldConfig.fieldSettings.treeValues) {
      if (config.settings.normalizeListValues) {
        fieldConfig.fieldSettings.treeValues = config.settings.normalizeListValues.call(config.ctx, fieldConfig.fieldSettings.treeValues, fieldConfig.type, fieldConfig.fieldSettings);
      }
    }
    if (!typeConfig) {
      //console.warn(`No type config for ${fieldConfig.type}`);
      fieldConfig.disabled = true;
      return;
    }
    if (!isFuncArg) {
      if (!config.__fieldsCntByType[fieldConfig.type]) config.__fieldsCntByType[fieldConfig.type] = 0;
      config.__fieldsCntByType[fieldConfig.type]++;
    }
    if (!fieldConfig.widgets) fieldConfig.widgets = {};
    if (isFuncArg) fieldConfig._isFuncArg = true;
    fieldConfig.mainWidget = fieldConfig.mainWidget || typeConfig.mainWidget;
    fieldConfig.valueSources = fieldConfig.valueSources || typeConfig.valueSources;
    var excludeOperatorsForType = typeConfig.excludeOperators || [];
    var _loop = function _loop() {
      var fieldWidgetConfig = fieldConfig.widgets[widget] || {};
      var typeWidgetConfig = typeConfig.widgets[widget] || {};
      if (!isFuncArg) {
        //todo: why I've excluded isFuncArg ?
        var excludeOperators = [].concat((0, _toConsumableArray2["default"])(excludeOperatorsForField), (0, _toConsumableArray2["default"])(excludeOperatorsForType));
        var shouldIncludeOperators = fieldConfig.preferWidgets && (widget == "field" || fieldConfig.preferWidgets.includes(widget)) || excludeOperators.length > 0;
        if (fieldWidgetConfig.operators) {
          var addOperators = fieldWidgetConfig.operators.filter(function (o) {
            return !excludeOperators.includes(o);
          });
          operators = [].concat((0, _toConsumableArray2["default"])(operators || []), (0, _toConsumableArray2["default"])(addOperators));
        } else if (shouldIncludeOperators && typeWidgetConfig.operators) {
          var _addOperators = typeWidgetConfig.operators.filter(function (o) {
            return !excludeOperators.includes(o);
          });
          operators = [].concat((0, _toConsumableArray2["default"])(operators || []), (0, _toConsumableArray2["default"])(_addOperators));
        }
        if (fieldWidgetConfig.defaultOperator) defaultOperator = fieldWidgetConfig.defaultOperator;
      }
      if (widget == fieldConfig.mainWidget) {
        fieldWidgetConfig = (0, _merge["default"])({}, {
          widgetProps: fieldConfig.mainWidgetProps || {}
        }, fieldWidgetConfig);
      }
      fieldConfig.widgets[widget] = fieldWidgetConfig;
    };
    for (var widget in typeConfig.widgets) {
      _loop();
    }
    if (!isFuncArg) {
      if (!fieldConfig.operators && operators) fieldConfig.operators = Array.from(new Set(operators));
      fieldConfig._origDefaultOperator = fieldConfig.defaultOperator;
      if (!fieldConfig.defaultOperator && defaultOperator) fieldConfig.defaultOperator = defaultOperator;
    }
  }
  var _computeFieldName = computeFieldName(config, path),
    fieldName = _computeFieldName.fieldName,
    inGroup = _computeFieldName.inGroup;
  if (fieldName) {
    fieldConfig.fieldName = fieldName;
    if (!config.__fieldNames[fieldName]) config.__fieldNames[fieldName] = [];
    config.__fieldNames[fieldName].push({
      fullPath: path,
      inGroup: inGroup
    });
  }
}

/////////////

var mergeCustomizerNoArrays = function mergeCustomizerNoArrays(objValue, srcValue, _key, _object, _source, _stack) {
  if (Array.isArray(objValue)) {
    return srcValue;
  }
};
function iterateFuncs(config) {
  return _regenerator["default"].wrap(function iterateFuncs$(_context) {
    while (1) switch (_context.prev = _context.next) {
      case 0:
        return _context.delegateYield(_iterateFields(config, config.funcs || {}, []), "t0", 1);
      case 1:
      case "end":
        return _context.stop();
    }
  }, _marked);
}
function iterateFields(config) {
  return _regenerator["default"].wrap(function iterateFields$(_context2) {
    while (1) switch (_context2.prev = _context2.next) {
      case 0:
        return _context2.delegateYield(_iterateFields(config, config.fields || {}, []), "t0", 1);
      case 1:
      case "end":
        return _context2.stop();
    }
  }, _marked2);
}
function _iterateFields(config, subfields, path) {
  var subfieldsKey = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : "subfields";
  return /*#__PURE__*/_regenerator["default"].mark(function _callee(_config$settings2) {
    var fieldSeparator, fieldKey, fieldConfig;
    return _regenerator["default"].wrap(function _callee$(_context3) {
      while (1) switch (_context3.prev = _context3.next) {
        case 0:
          fieldSeparator = (config === null || config === void 0 || (_config$settings2 = config.settings) === null || _config$settings2 === void 0 ? void 0 : _config$settings2.fieldSeparator) || ".";
          _context3.t0 = _regenerator["default"].keys(subfields);
        case 2:
          if ((_context3.t1 = _context3.t0()).done) {
            _context3.next = 13;
            break;
          }
          fieldKey = _context3.t1.value;
          fieldConfig = subfields[fieldKey];
          if (!fieldConfig[subfieldsKey]) {
            _context3.next = 9;
            break;
          }
          return _context3.delegateYield(_iterateFields(config, fieldConfig[subfieldsKey], [].concat((0, _toConsumableArray2["default"])(path), [fieldKey]), subfieldsKey), "t2", 7);
        case 7:
          _context3.next = 11;
          break;
        case 9:
          _context3.next = 11;
          return [[].concat((0, _toConsumableArray2["default"])(path), [fieldKey]).join(fieldSeparator), fieldConfig];
        case 11:
          _context3.next = 2;
          break;
        case 13:
        case "end":
          return _context3.stop();
      }
    }, _callee);
  })();
}
var getFieldRawConfig = exports.getFieldRawConfig = function getFieldRawConfig(config, field) {
  var _config$settings3;
  var fieldsKey = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "fields";
  var subfieldsKey = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : "subfields";
  if (!field) return null;
  if (field == "!case_value") {
    return {
      type: "case_value",
      mainWidget: "case_value",
      widgets: {
        "case_value": config.widgets["case_value"]
      }
    };
  }
  var fieldSeparator = (config === null || config === void 0 || (_config$settings3 = config.settings) === null || _config$settings3 === void 0 ? void 0 : _config$settings3.fieldSeparator) || ".";
  var parts = getFieldParts(field, config);
  var targetFields = config[fieldsKey];
  if (!targetFields) return null;
  var fields = targetFields;
  var fieldConfig = null;
  var path = [];
  for (var i = 0; i < parts.length; i++) {
    var part = parts[i];
    path.push(part);
    var pathKey = path.join(fieldSeparator);
    fieldConfig = fields[pathKey];
    if (i < parts.length - 1) {
      if (fieldConfig && fieldConfig[subfieldsKey]) {
        fields = fieldConfig[subfieldsKey];
        path = [];
      } else {
        fieldConfig = null;
      }
    }
  }
  return fieldConfig;
};
var computeFieldName = function computeFieldName(config, path) {
  if (!path) return {};
  var fieldSeparator = config.settings.fieldSeparator;
  var _reduce = (0, _toConsumableArray2["default"])(path).reduce(function (_ref, f, i, arr) {
      var computedPath = _ref.computedPath,
        computed = _ref.computed,
        inGroup = _ref.inGroup;
      var fullPath = [].concat((0, _toConsumableArray2["default"])(arr.slice(0, i)), [f]);
      var fConfig = getFieldRawConfig(config, fullPath);
      if ((fConfig === null || fConfig === void 0 ? void 0 : fConfig.type) === "!group" && i < arr.length - 1) {
        // don't include group in final field name
        inGroup = fullPath.join(fieldSeparator);
        computedPath = [];
      } else if (fConfig !== null && fConfig !== void 0 && fConfig.fieldName) {
        // tip: fieldName overrides path !
        computed = true;
        computedPath = [fConfig.fieldName];
      } else {
        computedPath = [].concat((0, _toConsumableArray2["default"])(computedPath), [f]);
      }
      return {
        computedPath: computedPath,
        computed: computed,
        inGroup: inGroup
      };
    }, {
      computedPath: [],
      computed: false,
      inGroup: undefined
    }),
    computedPath = _reduce.computedPath,
    computed = _reduce.computed,
    inGroup = _reduce.inGroup;
  return computed ? {
    fieldName: computedPath.join(fieldSeparator),
    inGroup: inGroup
  } : {};
};

// if `field` is alias (fieldName), convert to original full path
var normalizeField = exports.normalizeField = function normalizeField(config, field) {
  var _config$__fieldNames$, _config$__fieldNames$2;
  var parentField = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
  // tip: if parentField is present, field is not full path
  var fieldSeparator = config.settings.fieldSeparator;
  var path = [parentField].concat((0, _toConsumableArray2["default"])(field.split(fieldSeparator))).filter(function (f) {
    return f != null;
  });
  var findStr = field;
  var normalizedPath = (_config$__fieldNames$ = config.__fieldNames[findStr]) === null || _config$__fieldNames$ === void 0 || (_config$__fieldNames$2 = _config$__fieldNames$.find) === null || _config$__fieldNames$2 === void 0 || (_config$__fieldNames$2 = _config$__fieldNames$2.call(_config$__fieldNames$, function (_ref2) {
    var inGroup = _ref2.inGroup;
    if (inGroup) return parentField === null || parentField === void 0 ? void 0 : parentField.startsWith(inGroup);
    return true;
  })) === null || _config$__fieldNames$2 === void 0 ? void 0 : _config$__fieldNames$2.fullPath;
  return (normalizedPath || path).join(fieldSeparator);
};
var getFuncSignature = exports.getFuncSignature = function getFuncSignature(config, func) {
  if (!func) return null;
  var funcConfig = getFieldRawConfig(config, func, "funcs", "subfields");
  if (!funcConfig) return null;
  var returnType = funcConfig.returnType,
    args = funcConfig.args;
  var argsSignature = Object.fromEntries(Object.entries(args || {}).map(function (_ref3) {
    var _ref4 = (0, _slicedToArray2["default"])(_ref3, 2),
      k = _ref4[0],
      v = _ref4[1];
    var argSignature = (0, _pick["default"])(v, ["type", "valueSources", "defaultValue", "fieldSettings",
    // "asyncListValues", // not supported
    "isOptional"]);
    return [k, argSignature];
  }));
  var signature = {
    returnType: returnType,
    args: argsSignature
  };
  return signature;
};
var getFuncConfig = exports.getFuncConfig = function getFuncConfig(config, func) {
  if (!func) return null;
  var funcConfig = getFieldRawConfig(config, func, "funcs", "subfields");
  if (!funcConfig) return null; //throw new Error("Can't find func " + func + ", please check your config");
  var typeConfig = config.types[funcConfig.returnType] || {};
  return _objectSpread(_objectSpread(_objectSpread({}, typeConfig), funcConfig), {}, {
    type: funcConfig.returnType || funcConfig.type
  });
};
var getFuncArgConfig = exports.getFuncArgConfig = function getFuncArgConfig(config, funcKey, argKey) {
  var funcConfig = getFuncConfig(config, funcKey);
  if (!funcConfig) return null; //throw new Error(`Can't find func ${funcKey}, please check your config`);
  var argConfig = funcConfig.args && funcConfig.args[argKey] || null;
  if (!argConfig) return null; //throw new Error(`Can't find arg ${argKey} for func ${funcKey}, please check your config`);

  //merge, but don't merge operators (rewrite instead)
  var typeConfig = config.types[argConfig.type] || {};
  var ret = (0, _mergeWith["default"])({}, typeConfig, argConfig || {}, mergeCustomizerNoArrays);
  return ret;
};
var isFieldDescendantOfField = exports.isFieldDescendantOfField = function isFieldDescendantOfField(field, parentField) {
  var _config$settings4;
  var config = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
  if (!parentField) return false;
  var fieldSeparator = (config === null || config === void 0 || (_config$settings4 = config.settings) === null || _config$settings4 === void 0 ? void 0 : _config$settings4.fieldSeparator) || ".";
  var path = getFieldPath(field, config);
  var parentPath = getFieldPath(parentField, config);
  return path.startsWith(parentPath + fieldSeparator);
};
var getFieldPath = exports.getFieldPath = function getFieldPath(field) {
  var _config$settings5;
  var config = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
  if (typeof field === "string") return field;
  var fieldSeparator = (config === null || config === void 0 || (_config$settings5 = config.settings) === null || _config$settings5 === void 0 ? void 0 : _config$settings5.fieldSeparator) || ".";
  return getFieldParts(field, config).join(fieldSeparator);
};
var getFieldParts = exports.getFieldParts = function getFieldParts(field) {
  var _config$settings6, _field$get, _field$split;
  var config = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
  if (!field) return [];
  if (Array.isArray(field)) return field;
  var fieldSeparator = (config === null || config === void 0 || (_config$settings6 = config.settings) === null || _config$settings6 === void 0 ? void 0 : _config$settings6.fieldSeparator) || ".";
  if (field !== null && field !== void 0 && field.func) {
    return Array.isArray(field.func) ? field.func : field.func.split(fieldSeparator);
  }
  if (field !== null && field !== void 0 && (_field$get = field.get) !== null && _field$get !== void 0 && _field$get.call(field, "func")) {
    var _field$get2;
    // immutable
    return field === null || field === void 0 || (_field$get2 = field.get) === null || _field$get2 === void 0 ? void 0 : _field$get2.call(field, "func").split(fieldSeparator);
  }
  return (field === null || field === void 0 || (_field$split = field.split) === null || _field$split === void 0 ? void 0 : _field$split.call(field, fieldSeparator)) || [];
};
var getFieldPathParts = exports.getFieldPathParts = function getFieldPathParts(field, config) {
  var onlyKeys = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
  if (!field) return null;
  var fieldSeparator = config.settings.fieldSeparator;
  var parts = getFieldParts(field, config);
  if (onlyKeys) return parts;else return parts.map(function (_curr, ind, arr) {
    return arr.slice(0, ind + 1);
  }).map(function (parts) {
    return parts.join(fieldSeparator);
  });
};
var getFieldSrc = exports.getFieldSrc = function getFieldSrc(field) {
  var _field$get3;
  if (!field) return null;
  if ((0, _typeof2["default"])(field) == "object") {
    if (!field.func && !!field.type) {
      // it's already a config
      return "field";
    }
    if (field.func) {
      if (field.func && field.arg) {
        // it's func arg
        return null;
      } else {
        // it's field func
        return "func";
      }
    }
  }
  if (field !== null && field !== void 0 && (_field$get3 = field.get) !== null && _field$get3 !== void 0 && _field$get3.call(field, "func")) {
    // immutable
    if (field !== null && field !== void 0 && field.get("arg")) {
      // it's func arg
      return null;
    } else {
      // it's field func
      return "func";
    }
  }
  return "field";
};
var getFieldConfig = exports.getFieldConfig = function getFieldConfig(config, field) {
  var _field$get4;
  if (!field) return null;
  if ((0, _typeof2["default"])(field) == "object") {
    if (!field.func && !!field.type) {
      // it's already a config
      // if (!field.defaultOperator) {
      //   // if not complete config..
      //   // merge, but don't merge operators (rewrite instead)
      //   const typeConfig = config.types[field.type] || {};
      //   return mergeWith({}, typeConfig, field, mergeCustomizerNoArrays);
      // }
      return field;
    }
    if (field.func) {
      if (field.func && field.arg) {
        // it's func arg
        return getFuncArgConfig(config, field.func, field.arg);
      } else {
        // it's field func
        return getFuncConfig(config, field.func);
      }
    }
  }
  if (field !== null && field !== void 0 && (_field$get4 = field.get) !== null && _field$get4 !== void 0 && _field$get4.call(field, "func")) {
    // immutable
    if (field !== null && field !== void 0 && field.get("arg")) {
      // it's func arg
      return getFuncArgConfig(config, field.get("func"), field.get("arg"));
    } else {
      // it's field func
      return getFuncConfig(config, field.get("func"));
    }
  }
  var fieldConfig = getFieldRawConfig(config, field);
  if (!fieldConfig) return null; //throw new Error("Can't find field " + field + ", please check your config");

  //merge, but don't merge operators (rewrite instead)
  var typeConfig = config.types[fieldConfig.type] || {};
  var ret = (0, _mergeWith["default"])({}, typeConfig, fieldConfig || {}, mergeCustomizerNoArrays);
  return ret;
};
var getOperatorConfig = exports.getOperatorConfig = function getOperatorConfig(config, operator) {
  var field = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
  if (!operator) return null;
  var opConfig = config.operators[operator];
  if (field) {
    var fieldConfig = getFieldConfig(config, field);
    var widget = (0, _ruleUtils.getWidgetForFieldOp)(config, field, operator, null);
    var widgetConfig = config.widgets[widget] || {};
    var fieldWidgetConfig = (fieldConfig && fieldConfig.widgets ? fieldConfig.widgets[widget] : {}) || {};
    var widgetOpProps = (widgetConfig.opProps || {})[operator];
    var fieldWidgetOpProps = (fieldWidgetConfig.opProps || {})[operator];
    var mergedOpConfig = (0, _merge["default"])({}, opConfig, widgetOpProps, fieldWidgetOpProps);
    return mergedOpConfig;
  } else {
    return opConfig;
  }
};
var getFieldWidgetConfig = exports.getFieldWidgetConfig = function getFieldWidgetConfig(config, field, operator) {
  var widget = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
  var valueSrc = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : null;
  if (!field) return null;
  if (!(operator || widget) && valueSrc != "const" && field != "!case_value") return null;
  var fieldConfig = getFieldConfig(config, field);
  if (!widget) widget = (0, _ruleUtils.getWidgetForFieldOp)(config, field, operator, valueSrc);
  var widgetConfig = config.widgets[widget] || {};
  var fieldWidgetConfig = (fieldConfig && fieldConfig.widgets ? fieldConfig.widgets[widget] : {}) || {};
  var fieldWidgetProps = fieldWidgetConfig.widgetProps || {};
  var valueFieldSettings = (valueSrc == "value" || !valueSrc) && fieldConfig && fieldConfig.fieldSettings || {}; // useful to take 'validateValue'
  var mergedConfig = (0, _merge["default"])({}, widgetConfig, fieldWidgetProps, valueFieldSettings);
  return mergedConfig;
};
var _widgetDefKeysToOmit = exports._widgetDefKeysToOmit = _stuff.widgetDefKeysToOmit;