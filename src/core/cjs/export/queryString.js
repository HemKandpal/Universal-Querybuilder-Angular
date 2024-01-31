"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.queryString = void 0;
var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));
var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));
var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));
var _configUtils = require("../utils/configUtils");
var _ruleUtils = require("../utils/ruleUtils");
var _omit = _interopRequireDefault(require("lodash/omit"));
var _pick = _interopRequireDefault(require("lodash/pick"));
var _stuff = require("../utils/stuff");
var _defaultUtils = require("../utils/defaultUtils");
var _immutable = require("immutable");
function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { (0, _defineProperty2["default"])(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
var queryString = exports.queryString = function queryString(item, config) {
  var isForDisplay = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
  //meta is mutable
  var meta = {
    errors: []
  };
  var extendedConfig = (0, _configUtils.extendConfig)(config, undefined, false);
  var res = formatItem(item, extendedConfig, meta, isForDisplay, null);
  if (meta.errors.length) console.warn("Errors while exporting to string:", meta.errors);
  return res;
};
var formatItem = function formatItem(item, config, meta) {
  var isForDisplay = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
  var parentField = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : null;
  if (!item) return undefined;
  var type = item.get("type");
  var children = item.get("children1");
  if (type === "group" || type === "rule_group") {
    return formatGroup(item, config, meta, isForDisplay, parentField);
  } else if (type === "rule") {
    return formatRule(item, config, meta, isForDisplay, parentField);
  }
  return undefined;
};
var formatGroup = function formatGroup(item, config, meta) {
  var isForDisplay = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
  var parentField = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : null;
  var type = item.get("type");
  var properties = item.get("properties") || new _immutable.Map();
  var mode = properties.get("mode");
  var children = item.get("children1") || new _immutable.List();
  var isRuleGroup = type === "rule_group";
  // TIP: don't cut group for mode == 'struct' and don't do aggr format (maybe later)
  var groupField = isRuleGroup && mode == "array" ? properties.get("field") : null;
  var canHaveEmptyChildren = isRuleGroup && mode == "array";
  var not = properties.get("not");
  var list = children.map(function (currentChild) {
    return formatItem(currentChild, config, meta, isForDisplay, groupField);
  }).filter(function (currentChild) {
    return typeof currentChild !== "undefined";
  });
  if (!canHaveEmptyChildren && !list.size) return undefined;
  var conjunction = properties.get("conjunction");
  if (!conjunction) conjunction = (0, _defaultUtils.defaultConjunction)(config);
  var conjunctionDefinition = config.conjunctions[conjunction];
  var conjStr = list.size ? conjunctionDefinition.formatConj(list, conjunction, not, isForDisplay) : null;
  var ret;
  if (groupField) {
    var aggrArgs = formatRule(item, config, meta, isForDisplay, parentField, true);
    if (aggrArgs) {
      var _config$settings;
      var isRev = aggrArgs.pop();
      var args = [conjStr].concat((0, _toConsumableArray2["default"])(aggrArgs));
      ret = (_config$settings = config.settings).formatAggr.apply(_config$settings, (0, _toConsumableArray2["default"])(args));
      if (isRev) {
        ret = config.settings.formatReverse(ret, null, null, null, null, isForDisplay);
      }
    }
  } else {
    ret = conjStr;
  }
  return ret;
};
var formatItemValue = function formatItemValue(config, properties, meta, _operator, isForDisplay, parentField) {
  var field = properties.get("field");
  var iValueSrc = properties.get("valueSrc");
  var iValueType = properties.get("valueType");
  var fieldDef = (0, _configUtils.getFieldConfig)(config, field) || {};
  var operator = _operator || properties.get("operator");
  var operatorDef = (0, _configUtils.getOperatorConfig)(config, operator, field) || {};
  var cardinality = (0, _stuff.defaultValue)(operatorDef.cardinality, 1);
  var iValue = properties.get("value");
  var asyncListValues = properties.get("asyncListValues");
  var valueSrcs = [];
  var valueTypes = [];
  var formattedValue;
  if (iValue != undefined) {
    var fvalue = iValue.map(function (currentValue, ind) {
      var valueSrc = iValueSrc ? iValueSrc.get(ind) : null;
      var valueType = iValueType ? iValueType.get(ind) : null;
      var cValue = (0, _ruleUtils.completeValue)(currentValue, valueSrc, config);
      var widget = (0, _ruleUtils.getWidgetForFieldOp)(config, field, operator, valueSrc);
      var fieldWidgetDef = (0, _omit["default"])((0, _configUtils.getFieldWidgetConfig)(config, field, operator, widget, valueSrc), ["factory"]);
      var fv = formatValue(config, meta, cValue, valueSrc, valueType, fieldWidgetDef, fieldDef, operator, operatorDef, isForDisplay, parentField, asyncListValues);
      if (fv !== undefined) {
        valueSrcs.push(valueSrc);
        valueTypes.push(valueType);
      }
      return fv;
    });
    var hasUndefinedValues = fvalue.filter(function (v) {
      return v === undefined;
    }).size > 0;
    if (!(hasUndefinedValues || fvalue.size < cardinality)) {
      formattedValue = cardinality == 1 ? fvalue.first() : fvalue;
    }
  }
  return [formattedValue, valueSrcs.length > 1 ? valueSrcs : valueSrcs[0], valueTypes.length > 1 ? valueTypes : valueTypes[0]];
};
var buildFnToFormatOp = function buildFnToFormatOp(operator, operatorDefinition) {
  var fop = operatorDefinition.labelForFormat || operator;
  var cardinality = (0, _stuff.defaultValue)(operatorDefinition.cardinality, 1);
  var fn;
  if (cardinality == 0) {
    fn = function fn(field, op, values, valueSrc, valueType, opDef, operatorOptions, isForDisplay) {
      return "".concat(field, " ").concat(fop);
    };
  } else if (cardinality == 1) {
    fn = function fn(field, op, values, valueSrc, valueType, opDef, operatorOptions, isForDisplay) {
      return "".concat(field, " ").concat(fop, " ").concat(values);
    };
  } else if (cardinality == 2) {
    // between
    fn = function fn(field, op, values, valueSrc, valueType, opDef, operatorOptions, isForDisplay) {
      var valFrom = values.first();
      var valTo = values.get(1);
      return "".concat(field, " ").concat(fop, " ").concat(valFrom, " AND ").concat(valTo);
    };
  }
  return fn;
};
var formatRule = function formatRule(item, config, meta) {
  var isForDisplay = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
  var parentField = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : null;
  var returnArgs = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : false;
  var properties = item.get("properties") || new _immutable.Map();
  var field = properties.get("field");
  var fieldSrc = properties.get("fieldSrc");
  var operator = properties.get("operator");
  var operatorOptions = properties.get("operatorOptions");
  if (field == null || operator == null) return undefined;
  var fieldDef = (0, _configUtils.getFieldConfig)(config, field) || {};
  var operatorDef = (0, _configUtils.getOperatorConfig)(config, operator, field) || {};
  var reversedOp = operatorDef.reversedOp;
  var revOperatorDef = (0, _configUtils.getOperatorConfig)(config, reversedOp, field) || {};

  //check op
  var isRev = false;
  var fn = operatorDef.formatOp;
  if (!fn && reversedOp) {
    fn = revOperatorDef.formatOp;
    if (fn) {
      isRev = true;
      var _ref = [reversedOp, operator];
      operator = _ref[0];
      reversedOp = _ref[1];
      var _ref2 = [revOperatorDef, operatorDef];
      operatorDef = _ref2[0];
      revOperatorDef = _ref2[1];
    }
  }

  //find fn to format expr
  if (!fn) fn = buildFnToFormatOp(operator, operatorDef);
  if (!fn) return undefined;

  //format field
  var formattedField = fieldSrc === "func" ? formatFunc(config, meta, field, isForDisplay, parentField) : formatField(config, meta, field, isForDisplay, parentField);
  if (formattedField == undefined) return undefined;

  //format value
  var _formatItemValue = formatItemValue(config, properties, meta, operator, isForDisplay, parentField),
    _formatItemValue2 = (0, _slicedToArray2["default"])(_formatItemValue, 3),
    formattedValue = _formatItemValue2[0],
    valueSrc = _formatItemValue2[1],
    valueType = _formatItemValue2[2];
  if (formattedValue === undefined) return undefined;
  var args = [formattedField, operator, formattedValue, valueSrc, valueType, (0, _omit["default"])(operatorDef, _stuff.opDefKeysToOmit), operatorOptions, isForDisplay, fieldDef, isRev];
  if (returnArgs) {
    return args;
  } else {
    var _fn;
    //format expr
    var ret = (_fn = fn).call.apply(_fn, [config.ctx].concat(args));

    //rev
    if (isRev) {
      ret = config.settings.formatReverse(ret, operator, reversedOp, operatorDef, revOperatorDef, isForDisplay);
    }
    return ret;
  }
};
var formatValue = function formatValue(config, meta, value, valueSrc, valueType, fieldWidgetDef, fieldDef, operator, opDef, isForDisplay) {
  var parentField = arguments.length > 10 && arguments[10] !== undefined ? arguments[10] : null;
  var asyncListValues = arguments.length > 11 ? arguments[11] : undefined;
  if (value === undefined) return undefined;
  var ret;
  if (valueSrc == "field") {
    ret = formatField(config, meta, value, isForDisplay, parentField);
  } else if (valueSrc == "func") {
    ret = formatFunc(config, meta, value, isForDisplay, parentField);
  } else {
    if (typeof fieldWidgetDef.formatValue === "function") {
      var fn = fieldWidgetDef.formatValue;
      var args = [value, _objectSpread(_objectSpread({}, (0, _pick["default"])(fieldDef, ["fieldSettings", "listValues"])), {}, {
        asyncListValues: asyncListValues
      }),
      //useful options: valueFormat for date/time
      (0, _omit["default"])(fieldWidgetDef, _stuff.widgetDefKeysToOmit), isForDisplay];
      if (operator) {
        args.push(operator);
        args.push(opDef);
      }
      if (valueSrc == "field") {
        var valFieldDefinition = (0, _configUtils.getFieldConfig)(config, value) || {};
        args.push(valFieldDefinition);
      }
      ret = fn.call.apply(fn, [config.ctx].concat(args));
    } else {
      ret = value;
    }
  }
  return ret;
};
var formatField = function formatField(config, meta, field, isForDisplay) {
  var parentField = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : null;
  var cutParentField = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : true;
  var _config$settings2 = config.settings,
    fieldSeparator = _config$settings2.fieldSeparator,
    fieldSeparatorDisplay = _config$settings2.fieldSeparatorDisplay;
  var ret = null;
  if (field) {
    var fieldDefinition = (0, _configUtils.getFieldConfig)(config, field) || {};
    var fieldParts = (0, _configUtils.getFieldParts)(field, config);
    var fieldPartsLabels = (0, _ruleUtils.getFieldPathLabels)(field, config, cutParentField ? parentField : null);
    var fieldFullLabel = fieldPartsLabels ? fieldPartsLabels.join(fieldSeparatorDisplay) : null;
    var fieldLabel2 = fieldDefinition.label2 || fieldFullLabel;
    var formatFieldFn = config.settings.formatField;
    var fieldName = (0, _ruleUtils.formatFieldName)(field, config, meta, cutParentField ? parentField : null, {
      useTableName: true
    });
    ret = formatFieldFn(fieldName, fieldParts, fieldLabel2, fieldDefinition, config, isForDisplay);
  }
  return ret;
};
var formatFunc = function formatFunc(config, meta, funcValue, isForDisplay) {
  var parentField = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : null;
  var funcKey = funcValue.get("func");
  var args = funcValue.get("args");
  var funcConfig = (0, _configUtils.getFuncConfig)(config, funcKey);
  if (!funcConfig) {
    meta.errors.push("Func ".concat(funcKey, " is not defined in config"));
    return undefined;
  }
  var funcParts = (0, _configUtils.getFieldParts)(funcKey, config);
  var funcLastKey = funcParts[funcParts.length - 1];
  var funcName = isForDisplay && funcConfig.label || funcLastKey;
  var formattedArgs = {};
  var gaps = [];
  var missingArgKeys = [];
  var formattedArgsWithNames = {};
  for (var argKey in funcConfig.args) {
    var argConfig = funcConfig.args[argKey];
    var fieldDef = (0, _configUtils.getFieldConfig)(config, argConfig);
    var _defaultValue = argConfig.defaultValue,
      isOptional = argConfig.isOptional;
    var defaultValueSrc = _defaultValue !== null && _defaultValue !== void 0 && _defaultValue.func ? "func" : "value";
    var argName = isForDisplay && argConfig.label || argKey;
    var argVal = args ? args.get(argKey) : undefined;
    var argValue = argVal ? argVal.get("value") : undefined;
    var argValueSrc = argVal ? argVal.get("valueSrc") : undefined;
    var argAsyncListValues = argVal ? argVal.get("asyncListValues") : undefined;
    var formattedArgVal = formatValue(config, meta, argValue, argValueSrc, argConfig.type, fieldDef, argConfig, null, null, isForDisplay, parentField, argAsyncListValues);
    if (argValue != undefined && formattedArgVal === undefined) {
      if (argValueSrc != "func")
        // don't triger error if args value is another uncomplete function
        meta.errors.push("Can't format value of arg ".concat(argKey, " for func ").concat(funcKey));
      return undefined;
    }
    var formattedDefaultVal = void 0;
    if (formattedArgVal === undefined && !isOptional && _defaultValue != undefined) {
      formattedDefaultVal = formatValue(config, meta, _defaultValue, defaultValueSrc, argConfig.type, fieldDef, argConfig, null, null, isForDisplay, parentField, argAsyncListValues);
      if (formattedDefaultVal === undefined) {
        if (defaultValueSrc != "func")
          // don't triger error if args value is another uncomplete function
          meta.errors.push("Can't format default value of arg ".concat(argKey, " for func ").concat(funcKey));
        return undefined;
      }
    }
    var finalFormattedVal = formattedArgVal !== null && formattedArgVal !== void 0 ? formattedArgVal : formattedDefaultVal;
    if (finalFormattedVal !== undefined) {
      if (gaps.length) {
        var _iterator = _createForOfIteratorHelper(argKey),
          _step;
        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var _step$value = (0, _slicedToArray2["default"])(_step.value, 2),
              missedArgKey = _step$value[0],
              missedArgName = _step$value[1];
            formattedArgs[missedArgKey] = undefined;
            //formattedArgsWithNames[missedArgName] = undefined;
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }
        gaps = [];
      }
      formattedArgs[argKey] = finalFormattedVal;
      formattedArgsWithNames[argName] = finalFormattedVal;
    } else {
      if (!isOptional) missingArgKeys.push(argKey);
      gaps.push([argKey, argName]);
    }
  }
  if (missingArgKeys.length) {
    //meta.errors.push(`Missing vals for args ${missingArgKeys.join(", ")} for func ${funcKey}`);
    return undefined; // uncomplete
  }

  var ret = null;
  if (typeof funcConfig.formatFunc === "function") {
    var fn = funcConfig.formatFunc;
    var _args = [formattedArgs, isForDisplay];
    ret = fn.call.apply(fn, [config.ctx].concat(_args));
  } else {
    var argsStr = Object.entries(isForDisplay ? formattedArgsWithNames : formattedArgs).map(function (_ref3) {
      var _ref4 = (0, _slicedToArray2["default"])(_ref3, 2),
        k = _ref4[0],
        v = _ref4[1];
      return isForDisplay ? "".concat(k, ": ").concat(v) : "".concat(v);
    }).join(", ");
    ret = "".concat(funcName, "(").concat(argsStr, ")");
  }
  return ret;
};