"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.jsonLogicFormat = void 0;
var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));
var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));
var _stuff = require("../utils/stuff");
var _configUtils = require("../utils/configUtils");
var _ruleUtils = require("../utils/ruleUtils");
var _defaultUtils = require("../utils/defaultUtils");
var _immutable = require("immutable");
var _omit = _interopRequireDefault(require("lodash/omit"));
var _pick = _interopRequireDefault(require("lodash/pick"));
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { (0, _defineProperty2["default"])(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
// http://jsonlogic.com/

var jsonLogicFormat = exports.jsonLogicFormat = function jsonLogicFormat(item, config) {
  //meta is mutable
  var meta = {
    usedFields: [],
    errors: []
  };
  var extendedConfig = (0, _configUtils.extendConfig)(config, undefined, false);
  var logic = formatItem(item, extendedConfig, meta, true);

  // build empty data
  var errors = meta.errors,
    usedFields = meta.usedFields;
  var fieldSeparator = extendedConfig.settings.fieldSeparator;
  var data = {};
  var _iterator = _createForOfIteratorHelper(usedFields),
    _step;
  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var ff = _step.value;
      //const fieldSrc = typeof ff === "string" ? "field" : "func";
      var parts = (0, _configUtils.getFieldParts)(ff, config);
      var def = (0, _configUtils.getFieldConfig)(extendedConfig, ff) || {};
      var tmp = data;
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i];
        var pdef = (0, _configUtils.getFieldConfig)(extendedConfig, parts.slice(0, i + 1)) || {};
        if (i != parts.length - 1) {
          if (pdef.type == "!group" && pdef.mode != "struct") {
            if (!tmp[p]) tmp[p] = [{}];
            tmp = tmp[p][0];
          } else {
            if (!tmp[p]) tmp[p] = {};
            tmp = tmp[p];
          }
        } else {
          if (!tmp[p]) tmp[p] = null; // can use def.type for sample values
        }
      }
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
  return {
    errors: errors,
    logic: logic,
    data: data
  };
};
var formatItem = function formatItem(item, config, meta, isRoot) {
  var parentField = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : null;
  if (!item) return undefined;
  var type = item.get("type");
  var properties = item.get("properties") || new _immutable.Map();
  var isLocked = properties.get("isLocked");
  var lockedOp = config.settings.jsonLogic.lockedOp;
  var ret;
  if (type === "group" || type === "rule_group") {
    ret = formatGroup(item, config, meta, isRoot, parentField);
  } else if (type === "rule") {
    ret = formatRule(item, config, meta, parentField);
  }
  if (isLocked && ret && lockedOp) {
    ret = (0, _defineProperty2["default"])({}, lockedOp, ret);
  }
  return ret;
};
var formatGroup = function formatGroup(item, config, meta, isRoot) {
  var parentField = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : null;
  var type = item.get("type");
  var properties = item.get("properties") || new _immutable.Map();
  var mode = properties.get("mode");
  var children = item.get("children1") || new _immutable.List();
  var field = properties.get("field");
  var conjunction = properties.get("conjunction");
  if (!conjunction) conjunction = (0, _defaultUtils.defaultConjunction)(config);
  var conjunctionDefinition = config.conjunctions[conjunction];
  var conj = conjunctionDefinition.jsonLogicConj || conjunction.toLowerCase();
  var not = properties.get("not");
  var isRuleGroup = type === "rule_group" && !isRoot;
  var groupField = isRuleGroup && mode != "struct" ? field : parentField;
  var groupOperator = properties.get("operator");
  var groupOperatorDefinition = groupOperator && (0, _configUtils.getOperatorConfig)(config, groupOperator, field) || null;
  var formattedValue = formatItemValue(config, properties, meta, groupOperator, parentField);
  var isGroup0 = isRuleGroup && (!groupOperator || groupOperatorDefinition.cardinality == 0);
  var list = children.map(function (currentChild) {
    return formatItem(currentChild, config, meta, false, groupField);
  }).filter(function (currentChild) {
    return typeof currentChild !== "undefined";
  });
  if (isRuleGroup && mode != "struct" && !isGroup0) {
    // "count" rule can have no "having" children, but should have number value
    if (formattedValue == undefined) return undefined;
  } else {
    if (!list.size) return undefined;
  }
  var resultQuery = {};
  if (list.size == 1 && !isRoot) resultQuery = list.first();else resultQuery[conj] = list.toList().toJS();

  // revert
  if (not) {
    resultQuery = {
      "!": resultQuery
    };
  }

  // rule_group (issue #246)
  if (isRuleGroup && mode != "struct") {
    var formattedField = formatField(meta, config, field, parentField);
    if (isGroup0) {
      // config.settings.groupOperators
      var op = groupOperator || "some";
      resultQuery = (0, _defineProperty2["default"])({}, op, [formattedField, resultQuery]);
    } else {
      // there is rule for count
      var filter = !list.size ? formattedField : {
        "filter": [formattedField, resultQuery]
      };
      var count = {
        "reduce": [filter, {
          "+": [1, {
            "var": "accumulator"
          }]
        }, 0]
      };
      resultQuery = formatLogic(config, properties, count, formattedValue, groupOperator);
    }
  }
  return resultQuery;
};
var formatRule = function formatRule(item, config, meta) {
  var parentField = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
  var properties = item.get("properties") || new _immutable.Map();
  var field = properties.get("field");
  var fieldSrc = properties.get("fieldSrc");
  var operator = properties.get("operator");
  var operatorOptions = properties.get("operatorOptions");
  operatorOptions = operatorOptions ? operatorOptions.toJS() : null;
  if (operatorOptions && !Object.keys(operatorOptions).length) operatorOptions = null;
  if (field == null || operator == null) return undefined;
  var fieldDefinition = (0, _configUtils.getFieldConfig)(config, field) || {};
  var operatorDefinition = (0, _configUtils.getOperatorConfig)(config, operator, field) || {};
  var reversedOp = operatorDefinition.reversedOp;
  var revOperatorDefinition = (0, _configUtils.getOperatorConfig)(config, reversedOp, field) || {};

  // check op
  var isRev = false;
  if (!operatorDefinition.jsonLogic && !revOperatorDefinition.jsonLogic) {
    meta.errors.push("Operator ".concat(operator, " is not supported"));
    return undefined;
  }
  if (!operatorDefinition.jsonLogic && revOperatorDefinition.jsonLogic) {
    isRev = true;
    var _ref = [reversedOp, operator];
    operator = _ref[0];
    reversedOp = _ref[1];
    var _ref2 = [revOperatorDefinition, operatorDefinition];
    operatorDefinition = _ref2[0];
    revOperatorDefinition = _ref2[1];
  }
  var formattedValue = formatItemValue(config, properties, meta, operator, parentField);
  if (formattedValue === undefined) return undefined;
  var formattedField = fieldSrc === "func" ? formatFunc(meta, config, field, parentField) : formatField(meta, config, field, parentField);
  if (formattedField === undefined) return undefined;
  return formatLogic(config, properties, formattedField, formattedValue, operator, operatorOptions, fieldDefinition, isRev);
};
var formatItemValue = function formatItemValue(config, properties, meta, operator, parentField) {
  var field = properties.get("field");
  var iValueSrc = properties.get("valueSrc");
  var iValueType = properties.get("valueType");
  var fieldDefinition = (0, _configUtils.getFieldConfig)(config, field) || {};
  var operatorDefinition = (0, _configUtils.getOperatorConfig)(config, operator, field) || {};
  var cardinality = (0, _stuff.defaultValue)(operatorDefinition.cardinality, 1);
  var iValue = properties.get("value");
  var asyncListValues = properties.get("asyncListValues");
  if (iValue == undefined) return undefined;
  var valueSrcs = [];
  var valueTypes = [];
  var oldUsedFields = meta.usedFields;
  var fvalue = iValue.map(function (currentValue, ind) {
    var valueSrc = iValueSrc ? iValueSrc.get(ind) : null;
    var valueType = iValueType ? iValueType.get(ind) : null;
    var cValue = (0, _ruleUtils.completeValue)(currentValue, valueSrc, config);
    var widget = (0, _ruleUtils.getWidgetForFieldOp)(config, field, operator, valueSrc);
    var fieldWidgetDef = (0, _omit["default"])((0, _configUtils.getFieldWidgetConfig)(config, field, operator, widget, valueSrc), ["factory"]);
    var fv = formatValue(meta, config, cValue, valueSrc, valueType, fieldWidgetDef, fieldDefinition, operator, operatorDefinition, parentField, asyncListValues);
    if (fv !== undefined) {
      valueSrcs.push(valueSrc);
      valueTypes.push(valueType);
    }
    return fv;
  });
  var hasUndefinedValues = fvalue.filter(function (v) {
    return v === undefined;
  }).size > 0;
  if (fvalue.size < cardinality || hasUndefinedValues) {
    meta.usedFields = oldUsedFields; // restore
    return undefined;
  }
  return cardinality > 1 ? fvalue.toArray() : cardinality == 1 ? fvalue.first() : null;
};
var formatValue = function formatValue(meta, config, currentValue, valueSrc, valueType, fieldWidgetDef, fieldDef, operator, operatorDef) {
  var parentField = arguments.length > 9 && arguments[9] !== undefined ? arguments[9] : null;
  var asyncListValues = arguments.length > 10 ? arguments[10] : undefined;
  if (currentValue === undefined) return undefined;
  var ret;
  if (valueSrc == "field") {
    ret = formatField(meta, config, currentValue, parentField);
  } else if (valueSrc == "func") {
    ret = formatFunc(meta, config, currentValue, parentField);
  } else if (typeof fieldWidgetDef.jsonLogic === "function") {
    var fn = fieldWidgetDef.jsonLogic;
    var args = [currentValue, _objectSpread(_objectSpread({}, (0, _pick["default"])(fieldDef, ["fieldSettings", "listValues"])), {}, {
      asyncListValues: asyncListValues
    }),
    //useful options: valueFormat for date/time
    (0, _omit["default"])(fieldWidgetDef, _stuff.widgetDefKeysToOmit)];
    if (operator) {
      args.push(operator);
      args.push(operatorDef);
    }
    ret = fn.call.apply(fn, [config.ctx].concat(args));
  } else {
    ret = currentValue;
  }
  return ret;
};
var formatFunc = function formatFunc(meta, config, currentValue) {
  var parentField = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
  var funcKey = currentValue.get("func");
  var args = currentValue.get("args");
  var funcConfig = (0, _configUtils.getFuncConfig)(config, funcKey);
  var funcParts = (0, _configUtils.getFieldParts)(funcKey, config);
  var funcLastKey = funcParts[funcParts.length - 1];
  if (!funcConfig) {
    meta.errors.push("Func ".concat(funcKey, " is not defined in config"));
    return undefined;
  }
  if (!(funcConfig !== null && funcConfig !== void 0 && funcConfig.jsonLogic)) {
    meta.errors.push("Func ".concat(funcKey, " is not supported"));
    return undefined;
  }
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
    var operator = null;
    var widget = (0, _ruleUtils.getWidgetForFieldOp)(config, argConfig, operator, argValueSrc);
    var fieldWidgetDef = (0, _omit["default"])((0, _configUtils.getFieldWidgetConfig)(config, argConfig, operator, widget, argValueSrc), ["factory"]);
    var formattedArgVal = formatValue(meta, config, argValue, argValueSrc, argConfig.type, fieldWidgetDef, fieldDef, null, null, parentField);
    if (argValue != undefined && formattedArgVal === undefined) {
      if (argValueSrc != "func")
        // don't triger error if args value is another uncomplete function
        meta.errors.push("Can't format value of arg ".concat(argKey, " for func ").concat(funcKey));
      return undefined;
    }
    var formattedDefaultVal = void 0;
    if (formattedArgVal === undefined && !isOptional && _defaultValue != undefined) {
      var defaultWidget = (0, _ruleUtils.getWidgetForFieldOp)(config, argConfig, operator, defaultValueSrc);
      var defaultFieldWidgetDef = (0, _omit["default"])((0, _configUtils.getFieldWidgetConfig)(config, argConfig, operator, defaultWidget, defaultValueSrc), ["factory"]);
      formattedDefaultVal = formatValue(meta, config, _defaultValue, defaultValueSrc, argConfig.type, defaultFieldWidgetDef, fieldDef, null, null, parentField);
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
        var _iterator2 = _createForOfIteratorHelper(gaps),
          _step2;
        try {
          for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
            var missedArgKey = _step2.value;
            formattedArgs[missedArgKey] = undefined;
          }
        } catch (err) {
          _iterator2.e(err);
        } finally {
          _iterator2.f();
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

  var formattedArgsArr = Object.values(formattedArgs);
  var ret;
  if (typeof funcConfig.jsonLogic === "function") {
    var fn = funcConfig.jsonLogic;
    var _args = [formattedArgs];
    ret = fn.call.apply(fn, [config.ctx].concat(_args));
  } else {
    var funcName = funcConfig.jsonLogic || funcLastKey;
    var isMethod = !!funcConfig.jsonLogicIsMethod;
    if (isMethod) {
      var obj = formattedArgsArr[0],
        params = formattedArgsArr.slice(1);
      if (params.length) {
        ret = {
          "method": [obj, funcName, params]
        };
      } else {
        ret = {
          "method": [obj, funcName]
        };
      }
    } else {
      ret = (0, _defineProperty2["default"])({}, funcName, formattedArgsArr);
    }
  }
  return ret;
};
var formatField = function formatField(meta, config, field) {
  var parentField = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
  var _config$settings = config.settings,
    fieldSeparator = _config$settings.fieldSeparator,
    jsonLogic = _config$settings.jsonLogic;
  var ret;
  if (field) {
    if (Array.isArray(field)) field = field.join(fieldSeparator);
    var fieldDef = (0, _configUtils.getFieldConfig)(config, field) || {};
    var fieldName = (0, _ruleUtils.formatFieldName)(field, config, meta, parentField);
    var varName = fieldDef.jsonLogicVar || (fieldDef.type == "!group" ? jsonLogic.groupVarKey : "var");
    ret = (0, _defineProperty2["default"])({}, varName, fieldName);
    if (meta.usedFields.indexOf(field) == -1) meta.usedFields.push(field);
  }
  return ret;
};
var buildFnToFormatOp = function buildFnToFormatOp(operator, operatorDefinition, formattedField, formattedValue) {
  var formatteOp = operator;
  var cardinality = (0, _stuff.defaultValue)(operatorDefinition.cardinality, 1);
  var isReverseArgs = (0, _stuff.defaultValue)(operatorDefinition._jsonLogicIsRevArgs, false);
  if (typeof operatorDefinition.jsonLogic == "string") formatteOp = operatorDefinition.jsonLogic;
  var rangeOps = ["<", "<=", ">", ">="];
  var eqOps = ["==", "!="];
  var fn = function fn(field, op, val, opDef, opOpts) {
    if (cardinality == 0 && eqOps.includes(formatteOp)) return (0, _defineProperty2["default"])({}, formatteOp, [formattedField, null]);else if (cardinality == 0) return (0, _defineProperty2["default"])({}, formatteOp, formattedField);else if (cardinality == 1 && isReverseArgs) return (0, _defineProperty2["default"])({}, formatteOp, [formattedValue, formattedField]);else if (cardinality == 1) return (0, _defineProperty2["default"])({}, formatteOp, [formattedField, formattedValue]);else if (cardinality == 2 && rangeOps.includes(formatteOp)) return (0, _defineProperty2["default"])({}, formatteOp, [formattedValue[0], formattedField, formattedValue[1]]);else return (0, _defineProperty2["default"])({}, formatteOp, [formattedField].concat((0, _toConsumableArray2["default"])(formattedValue)));
  };
  return fn;
};
var formatLogic = function formatLogic(config, properties, formattedField, formattedValue, operator) {
  var operatorOptions = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : null;
  var fieldDefinition = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : null;
  var isRev = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : false;
  var field = properties.get("field");
  //const fieldSrc = properties.get("fieldSrc");
  var operatorDefinition = (0, _configUtils.getOperatorConfig)(config, operator, field) || {};
  var fn = typeof operatorDefinition.jsonLogic == "function" ? operatorDefinition.jsonLogic : buildFnToFormatOp(operator, operatorDefinition, formattedField, formattedValue);
  var args = [formattedField, operator, formattedValue, (0, _omit["default"])(operatorDefinition, _stuff.opDefKeysToOmit), operatorOptions, fieldDefinition];
  var ruleQuery = fn.call.apply(fn, [config.ctx].concat(args));
  if (isRev) {
    ruleQuery = {
      "!": ruleQuery
    };
  }
  return ruleQuery;
};