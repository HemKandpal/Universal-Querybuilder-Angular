"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.sqlFormat = exports._sqlFormat = void 0;
var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));
var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));
var _configUtils = require("../utils/configUtils");
var _ruleUtils = require("../utils/ruleUtils");
var _omit = _interopRequireDefault(require("lodash/omit"));
var _pick = _interopRequireDefault(require("lodash/pick"));
var _stuff = require("../utils/stuff");
var _defaultUtils = require("../utils/defaultUtils");
var _immutable = require("immutable");
var _export = require("../utils/export");
function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { (0, _defineProperty2["default"])(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
var sqlFormat = exports.sqlFormat = function sqlFormat(tree, config) {
  return _sqlFormat(tree, config, false);
};
var _sqlFormat = exports._sqlFormat = function _sqlFormat(tree, config) {
  var returnErrors = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
  //meta is mutable
  var meta = {
    errors: []
  };
  var extendedConfig = (0, _configUtils.extendConfig)(config, undefined, false);
  var res = formatItem(tree, extendedConfig, meta);
  if (returnErrors) {
    return [res, meta.errors];
  } else {
    if (meta.errors.length) console.warn("Errors while exporting to SQL:", meta.errors);
    return res;
  }
};
var formatItem = function formatItem(item, config, meta) {
  if (!item) return undefined;
  var type = item.get("type");
  var children = item.get("children1");
  if (type === "group" || type === "rule_group") {
    return formatGroup(item, config, meta);
  } else if (type === "rule") {
    return formatRule(item, config, meta);
  }
  return undefined;
};
var formatGroup = function formatGroup(item, config, meta) {
  var type = item.get("type");
  var properties = item.get("properties") || new _immutable.Map();
  var children = item.get("children1") || new _immutable.List();
  var isRuleGroup = type === "rule_group";
  var groupField = isRuleGroup ? properties.get("field") : null;
  var groupFieldDef = (0, _configUtils.getFieldConfig)(config, groupField) || {};
  var mode = groupFieldDef.mode;
  if (mode == "array") {
    meta.errors.push("Aggregation is not supported for ".concat(groupField));
  }
  var not = properties.get("not");
  var canHaveEmptyChildren = false; //isRuleGroup && mode == "array";
  var list = children.map(function (currentChild) {
    return formatItem(currentChild, config, meta);
  }).filter(function (currentChild) {
    return typeof currentChild !== "undefined";
  });
  if (!canHaveEmptyChildren && !list.size) return undefined;
  var conjunction = properties.get("conjunction");
  if (!conjunction) conjunction = (0, _defaultUtils.defaultConjunction)(config);
  var conjunctionDefinition = config.conjunctions[conjunction];
  return conjunctionDefinition.sqlFormatConj(list, conjunction, not);
};
var buildFnToFormatOp = function buildFnToFormatOp(operator, operatorDefinition) {
  var sqlOp = operatorDefinition.sqlOp || operator;
  var cardinality = (0, _stuff.defaultValue)(operatorDefinition.cardinality, 1);
  var fn;
  if (cardinality == 0) {
    fn = function fn(field, op, values, valueSrc, valueType, opDef, operatorOptions, fieldDef) {
      return "".concat(field, " ").concat(sqlOp);
    };
  } else if (cardinality == 1) {
    fn = function fn(field, op, value, valueSrc, valueType, opDef, operatorOptions, fieldDef) {
      return "".concat(field, " ").concat(sqlOp, " ").concat(value);
    };
  } else if (cardinality == 2) {
    // between
    fn = function fn(field, op, values, valueSrc, valueType, opDef, operatorOptions, fieldDef) {
      var valFrom = values.first();
      var valTo = values.get(1);
      return "".concat(field, " ").concat(sqlOp, " ").concat(valFrom, " AND ").concat(valTo);
    };
  }
  return fn;
};
var formatRule = function formatRule(item, config, meta) {
  var properties = item.get("properties") || new _immutable.Map();
  var field = properties.get("field");
  var fieldSrc = properties.get("fieldSrc");
  var operator = properties.get("operator");
  var operatorOptions = properties.get("operatorOptions");
  var iValueSrc = properties.get("valueSrc");
  var iValueType = properties.get("valueType");
  var iValue = properties.get("value");
  var asyncListValues = properties.get("asyncListValues");
  if (field == null || operator == null) return undefined;
  var fieldDefinition = (0, _configUtils.getFieldConfig)(config, field) || {};
  var opDef = (0, _configUtils.getOperatorConfig)(config, operator, field) || {};
  var reversedOp = opDef.reversedOp;
  var revOpDef = (0, _configUtils.getOperatorConfig)(config, reversedOp, field) || {};
  var cardinality = (0, _stuff.defaultValue)(opDef.cardinality, 1);

  // check op
  var isRev = false;
  var canFormatOp = opDef.sqlOp || opDef.sqlFormatOp;
  var canFormatRevOp = revOpDef.sqlOp || revOpDef.sqlFormatOp;
  if (!canFormatOp && !canFormatRevOp) {
    meta.errors.push("Operator ".concat(operator, " is not supported"));
    return undefined;
  }
  if (!canFormatOp && canFormatRevOp) {
    isRev = true;
    var _ref = [reversedOp, operator];
    operator = _ref[0];
    reversedOp = _ref[1];
    var _ref2 = [revOpDef, opDef];
    opDef = _ref2[0];
    revOpDef = _ref2[1];
  }

  //format value
  var valueSrcs = [];
  var valueTypes = [];
  var fvalue = iValue.map(function (currentValue, ind) {
    var valueSrc = iValueSrc ? iValueSrc.get(ind) : null;
    var valueType = iValueType ? iValueType.get(ind) : null;
    var cValue = (0, _ruleUtils.completeValue)(currentValue, valueSrc, config);
    var widget = (0, _ruleUtils.getWidgetForFieldOp)(config, field, operator, valueSrc);
    var fieldWidgetDefinition = (0, _omit["default"])((0, _configUtils.getFieldWidgetConfig)(config, field, operator, widget, valueSrc), ["factory"]);
    var fv = formatValue(meta, config, cValue, valueSrc, valueType, fieldWidgetDefinition, fieldDefinition, operator, opDef, asyncListValues);
    if (fv !== undefined) {
      valueSrcs.push(valueSrc);
      valueTypes.push(valueType);
    }
    return fv;
  });
  var hasUndefinedValues = fvalue.filter(function (v) {
    return v === undefined;
  }).size > 0;
  if (hasUndefinedValues || fvalue.size < cardinality) return undefined;
  var formattedValue = cardinality == 1 ? fvalue.first() : fvalue;

  //find fn to format expr
  var fn = opDef.sqlFormatOp || buildFnToFormatOp(operator, opDef);
  if (!fn) {
    meta.errors.push("Operator ".concat(operator, " is not supported"));
    return undefined;
  }

  //format field
  var formattedField = fieldSrc == "func" ? formatFunc(meta, config, field) : formatField(meta, config, field);
  if (formattedField == undefined) return undefined;

  //format expr
  var args = [formattedField, operator, formattedValue, valueSrcs.length > 1 ? valueSrcs : valueSrcs[0], valueTypes.length > 1 ? valueTypes : valueTypes[0], (0, _omit["default"])(opDef, _stuff.opDefKeysToOmit), operatorOptions, fieldDefinition];
  var ret;
  ret = fn.call.apply(fn, [config.ctx].concat(args));
  if (isRev) {
    ret = config.settings.sqlFormatReverse(ret);
  }
  if (ret === undefined) {
    meta.errors.push("Operator ".concat(operator, " is not supported for value source ").concat(valueSrcs.join(", ")));
    return undefined;
  }
  return ret;
};
var formatValue = function formatValue(meta, config, currentValue, valueSrc, valueType, fieldWidgetDef, fieldDef, operator, operatorDef, asyncListValues) {
  if (currentValue === undefined) return undefined;
  var ret;
  if (valueSrc == "field") {
    ret = formatField(meta, config, currentValue);
  } else if (valueSrc == "func") {
    ret = formatFunc(meta, config, currentValue);
  } else {
    if (typeof fieldWidgetDef.sqlFormatValue === "function") {
      var fn = fieldWidgetDef.sqlFormatValue;
      var args = [currentValue, _objectSpread(_objectSpread({}, (0, _pick["default"])(fieldDef, ["fieldSettings", "listValues"])), {}, {
        asyncListValues: asyncListValues
      }),
      //useful options: valueFormat for date/time
      (0, _omit["default"])(fieldWidgetDef, _stuff.widgetDefKeysToOmit)];
      if (operator) {
        args.push(operator);
        args.push(operatorDef);
      }
      if (valueSrc == "field") {
        var valFieldDefinition = (0, _configUtils.getFieldConfig)(config, currentValue) || {};
        args.push(valFieldDefinition);
      }
      ret = fn.call.apply(fn, [config.ctx].concat(args));
    } else {
      if (Array.isArray(currentValue)) {
        ret = currentValue.map(function (v) {
          return _export.SqlString.escape(v);
        });
      } else {
        ret = _export.SqlString.escape(currentValue);
      }
    }
  }
  return ret;
};
var formatField = function formatField(meta, config, field) {
  if (!field) return;
  var fieldSeparator = config.settings.fieldSeparator;
  var fieldDefinition = (0, _configUtils.getFieldConfig)(config, field) || {};
  var fieldParts = (0, _configUtils.getFieldParts)(field, config);
  var fieldPartsLabels = (0, _ruleUtils.getFieldPathLabels)(field, config);
  var fieldFullLabel = fieldPartsLabels ? fieldPartsLabels.join(fieldSeparator) : null;
  var formatFieldFn = config.settings.formatField;
  var fieldName = (0, _ruleUtils.formatFieldName)(field, config, meta, null, {
    useTableName: true
  });
  var formattedField = formatFieldFn(fieldName, fieldParts, fieldFullLabel, fieldDefinition, config);
  return formattedField;
};
var formatFunc = function formatFunc(meta, config, currentValue) {
  var funcKey = currentValue.get("func");
  var args = currentValue.get("args");
  var funcConfig = (0, _configUtils.getFuncConfig)(config, funcKey);
  if (!funcConfig) {
    meta.errors.push("Func ".concat(funcKey, " is not defined in config"));
    return undefined;
  }
  var funcParts = (0, _configUtils.getFieldParts)(funcKey, config);
  var funcLastKey = funcParts[funcParts.length - 1];
  var funcName = funcConfig.sqlFunc || funcLastKey;
  var formattedArgs = {};
  var gaps = [];
  var missingArgKeys = [];
  for (var argKey in funcConfig.args) {
    var argConfig = funcConfig.args[argKey];
    var fieldDef = (0, _configUtils.getFieldConfig)(config, argConfig);
    var _defaultValue = argConfig.defaultValue,
      isOptional = argConfig.isOptional;
    var defaultValueSrc = _defaultValue !== null && _defaultValue !== void 0 && _defaultValue.func ? "func" : "value";
    var argVal = args ? args.get(argKey) : undefined;
    var argValue = argVal ? argVal.get("value") : undefined;
    var argValueSrc = argVal ? argVal.get("valueSrc") : undefined;
    var argAsyncListValues = argVal ? argVal.get("asyncListValues") : undefined;
    var formattedArgVal = formatValue(meta, config, argValue, argValueSrc, argConfig.type, fieldDef, argConfig, null, null, argAsyncListValues);
    if (argValue != undefined && formattedArgVal === undefined) {
      if (argValueSrc != "func")
        // don't triger error if args value is another uncomplete function
        meta.errors.push("Can't format value of arg ".concat(argKey, " for func ").concat(funcKey));
      return undefined;
    }
    var formattedDefaultVal = void 0;
    if (formattedArgVal === undefined && !isOptional && _defaultValue != undefined) {
      formattedDefaultVal = formatValue(meta, config, _defaultValue, defaultValueSrc, argConfig.type, fieldDef, argConfig, null, null, argAsyncListValues);
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
            var missedArgKey = _step.value;
            formattedArgs[missedArgKey] = undefined;
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }
        gaps = [];
      }
      formattedArgs[argKey] = finalFormattedVal;
    } else {
      if (!isOptional) missingArgKeys.push(argKey);
      gaps.push(argKey);
    }
  }
  if (missingArgKeys.length) {
    //meta.errors.push(`Missing vals for args ${missingArgKeys.join(", ")} for func ${funcKey}`);
    return undefined; // uncomplete
  }

  var ret;
  if (typeof funcConfig.sqlFormatFunc === "function") {
    var fn = funcConfig.sqlFormatFunc;
    var _args = [formattedArgs];
    ret = fn.call.apply(fn, [config.ctx].concat(_args));
  } else {
    var argsStr = Object.entries(formattedArgs).map(function (_ref3) {
      var _ref4 = (0, _slicedToArray2["default"])(_ref3, 2),
        k = _ref4[0],
        v = _ref4[1];
      return v;
    }).join(", ");
    ret = "".concat(funcName, "(").concat(argsStr, ")");
  }
  return ret;
};