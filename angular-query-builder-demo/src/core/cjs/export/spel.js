"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.spelFormat = exports.compareToSign = exports._spelFormat = void 0;
var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));
var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));
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
// https://docs.spring.io/spring-framework/docs/3.2.x/spring-framework-reference/html/expressions.html#expressions

var compareToSign = exports.compareToSign = "${0}.compareTo(${1})";
var TypesWithCompareTo = {
  datetime: true,
  time: true,
  date: true
};
var spelFormat = exports.spelFormat = function spelFormat(tree, config) {
  return _spelFormat(tree, config, false);
};
var _spelFormat = exports._spelFormat = function _spelFormat(tree, config) {
  var returnErrors = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
  //meta is mutable
  var meta = {
    errors: []
  };
  var extendedConfig = (0, _configUtils.extendConfig)(config, undefined, false);
  var res = formatItem(tree, extendedConfig, meta, null);
  if (returnErrors) {
    return [res, meta.errors];
  } else {
    if (meta.errors.length) console.warn("Errors while exporting to SpEL:", meta.errors);
    return res;
  }
};
var formatItem = function formatItem(item, config, meta) {
  var parentField = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
  if (!item) return undefined;
  var type = item.get("type");
  if (type === "group" || type === "rule_group") {
    return formatGroup(item, config, meta, parentField);
  } else if (type === "rule") {
    return formatRule(item, config, meta, parentField);
  } else if (type == "switch_group") {
    return formatSwitch(item, config, meta, parentField);
  } else if (type == "case_group") {
    return formatCase(item, config, meta, parentField);
  }
  return undefined;
};
var formatCase = function formatCase(item, config, meta) {
  var parentField = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
  var type = item.get("type");
  if (type != "case_group") {
    meta.errors.push("Unexpected child of type ".concat(type, " inside switch"));
    return undefined;
  }
  var properties = item.get("properties") || new _immutable.Map();
  var _formatItemValue = formatItemValue(config, properties, meta, null, parentField, "!case_value"),
    _formatItemValue2 = (0, _slicedToArray2["default"])(_formatItemValue, 3),
    formattedValue = _formatItemValue2[0],
    valueSrc = _formatItemValue2[1],
    valueType = _formatItemValue2[2];
  var cond = formatGroup(item, config, meta, parentField);
  return [cond, formattedValue];
};
var formatSwitch = function formatSwitch(item, config, meta) {
  var parentField = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
  var properties = item.get("properties") || new _immutable.Map();
  var children = item.get("children1");
  if (!children) return undefined;
  var cases = children.map(function (currentChild) {
    return formatCase(currentChild, config, meta, null);
  }).filter(function (currentChild) {
    return typeof currentChild !== "undefined";
  }).toArray();
  if (!cases.length) return undefined;
  if (cases.length == 1 && !cases[0][0]) {
    // only 1 case without condition
    return cases[0][1];
  }
  var filteredCases = [];
  for (var i = 0; i < cases.length; i++) {
    if (i != cases.length - 1 && !cases[i][0]) {
      meta.errors.push("No condition for case ".concat(i));
    } else {
      filteredCases.push(cases[i]);
      if (i == cases.length - 1 && cases[i][0]) {
        // no default - add null as default
        filteredCases.push([undefined, null]);
      }
    }
  }
  var left = "",
    right = "";
  for (var _i = 0; _i < filteredCases.length; _i++) {
    var _filteredCases$_i = (0, _slicedToArray2["default"])(filteredCases[_i], 2),
      cond = _filteredCases$_i[0],
      value = _filteredCases$_i[1];
    if (value == undefined) value = "null";
    if (cond == undefined) cond = "true";
    if (_i != filteredCases.length - 1) {
      left += "(".concat(cond, " ? ").concat(value, " : ");
      right += ")";
    } else {
      left += "".concat(value);
    }
  }
  return left + right;
};
var formatGroup = function formatGroup(item, config, meta) {
  var parentField = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
  var type = item.get("type");
  var properties = item.get("properties") || new _immutable.Map();
  var mode = properties.get("mode");
  var children = item.get("children1") || new _immutable.List();
  var field = properties.get("field");
  var conjunction = properties.get("conjunction");
  if (!conjunction) conjunction = (0, _defaultUtils.defaultConjunction)(config);
  var conjunctionDefinition = config.conjunctions[conjunction];
  var not = properties.get("not");
  var isRuleGroup = type === "rule_group";
  var isRuleGroupArray = isRuleGroup && mode != "struct";
  var groupField = isRuleGroupArray ? field : parentField;
  var groupFieldDef = (0, _configUtils.getFieldConfig)(config, groupField) || {};
  var isSpelArray = groupFieldDef.isSpelArray;
  var fieldSeparator = config.settings.fieldSeparator;

  // check op for reverse
  var groupOperator = properties.get("operator");
  if (!groupOperator && (!mode || mode == "some")) {
    groupOperator = "some";
  }
  var realGroupOperator = checkOp(config, groupOperator, field);
  var isGroupOpRev = realGroupOperator != groupOperator;
  var realGroupOperatorDefinition = groupOperator && (0, _configUtils.getOperatorConfig)(config, realGroupOperator, field) || null;
  var isGroup0 = isRuleGroup && (!realGroupOperator || realGroupOperatorDefinition.cardinality == 0);

  // build value for aggregation op
  var _formatItemValue3 = formatItemValue(config, properties, meta, realGroupOperator, parentField, null),
    _formatItemValue4 = (0, _slicedToArray2["default"])(_formatItemValue3, 3),
    formattedValue = _formatItemValue4[0],
    valueSrc = _formatItemValue4[1],
    valueType = _formatItemValue4[2];

  // build filter in aggregation
  var list = children.map(function (currentChild) {
    return formatItem(currentChild, config, meta, groupField);
  }).filter(function (currentChild) {
    return typeof currentChild !== "undefined";
  });
  if (isRuleGroupArray && !isGroup0) {
    // "count" rule can have no "having" children, but should have number value
    if (formattedValue == undefined) return undefined;
  } else {
    if (!list.size) return undefined;
  }
  var omitBrackets = isRuleGroup;
  var filter = list.size ? conjunctionDefinition.spelFormatConj(list, conjunction, not, omitBrackets) : null;

  // build result
  var ret;
  if (isRuleGroupArray) {
    var formattedField = formatField(meta, config, field, parentField);
    var sep = fieldSeparator || ".";
    var getSize = sep + (isSpelArray ? "length" : "size()");
    var fullSize = "".concat(formattedField).concat(getSize);
    // https://docs.spring.io/spring-framework/docs/3.2.x/spring-framework-reference/html/expressions.html#expressions-collection-selection
    var filteredSize = filter ? "".concat(formattedField, ".?[").concat(filter, "]").concat(getSize) : fullSize;
    var groupValue = isGroup0 ? fullSize : formattedValue;
    // format expression
    ret = formatExpression(meta, config, properties, filteredSize, groupValue, realGroupOperator, valueSrc, valueType, isGroupOpRev);
  } else {
    ret = filter;
  }
  return ret;
};
var buildFnToFormatOp = function buildFnToFormatOp(operator, operatorDefinition, valueType) {
  var spelOp = operatorDefinition.spelOp;
  if (!spelOp) return undefined;
  var isSign = spelOp.includes("${0}");
  var isCompareTo = TypesWithCompareTo[valueType];
  var sop = spelOp;
  var fn;
  var cardinality = (0, _stuff.defaultValue)(operatorDefinition.cardinality, 1);
  if (isCompareTo) {
    // date1.compareTo(date2) >= 0
    //   instead of
    // date1 >= date2
    fn = function fn(field, op, values, valueSrc, valueType, opDef, operatorOptions, fieldDef) {
      var compareRes = compareToSign.replace(/\${(\w+)}/g, function (_, k) {
        return k == 0 ? field : cardinality > 1 ? values[k - 1] : values;
      });
      return "".concat(compareRes, " ").concat(sop, " 0");
    };
  } else if (isSign) {
    fn = function fn(field, op, values, valueSrc, valueType, opDef, operatorOptions, fieldDef) {
      return spelOp.replace(/\${(\w+)}/g, function (_, k) {
        return k == 0 ? field : cardinality > 1 ? values[k - 1] : values;
      });
    };
  } else if (cardinality == 0) {
    // should not be
    fn = function fn(field, op, values, valueSrc, valueType, opDef, operatorOptions, fieldDef) {
      return "".concat(field, " ").concat(sop);
    };
  } else if (cardinality == 1) {
    fn = function fn(field, op, values, valueSrc, valueType, opDef, operatorOptions, fieldDef) {
      return "".concat(field, " ").concat(sop, " ").concat(values);
    };
  }
  return fn;
};
var formatExpression = function formatExpression(meta, config, properties, formattedField, formattedValue, operator, valueSrc, valueType) {
  var isRev = arguments.length > 8 && arguments[8] !== undefined ? arguments[8] : false;
  var field = properties.get("field");
  var opDef = (0, _configUtils.getOperatorConfig)(config, operator, field) || {};
  var fieldDef = (0, _configUtils.getFieldConfig)(config, field) || {};
  var operatorOptions = properties.get("operatorOptions");

  //find fn to format expr
  var fn = opDef.spelFormatOp || buildFnToFormatOp(operator, opDef, valueType);
  if (!fn) {
    meta.errors.push("Operator ".concat(operator, " is not supported"));
    return undefined;
  }

  //format expr
  var args = [formattedField, operator, formattedValue, valueSrc, valueType, (0, _omit["default"])(opDef, _stuff.opDefKeysToOmit), operatorOptions, fieldDef];
  var ret;
  ret = fn.call.apply(fn, [config.ctx].concat(args));

  //rev
  if (isRev) {
    ret = config.settings.spelFormatReverse(ret);
  }
  if (ret === undefined) {
    meta.errors.push("Operator ".concat(operator, " is not supported for value source ").concat(valueSrc));
  }
  return ret;
};
var checkOp = function checkOp(config, operator, field) {
  if (!operator) return undefined;
  var opDef = (0, _configUtils.getOperatorConfig)(config, operator, field) || {};
  var reversedOp = opDef.reversedOp;
  var revOpDef = (0, _configUtils.getOperatorConfig)(config, reversedOp, field) || {};
  var isRev = false;
  var canFormatOp = opDef.spelOp || opDef.spelFormatOp;
  var canFormatRevOp = revOpDef.spelOp || revOpDef.spelFormatOp;
  if (!canFormatOp && !canFormatRevOp) {
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
  return operator;
};
var formatRule = function formatRule(item, config, meta) {
  var parentField = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
  var properties = item.get("properties") || new _immutable.Map();
  var field = properties.get("field");
  var fieldSrc = properties.get("fieldSrc");
  var operator = properties.get("operator");
  if (field == null || operator == null) return undefined;

  // check op for reverse
  var realOp = checkOp(config, operator, field);
  if (!realOp) {
    meta.errors.push("Operator ".concat(operator, " is not supported"));
    return undefined;
  }
  var isRev = realOp != operator;

  //format value
  var _formatItemValue5 = formatItemValue(config, properties, meta, realOp, parentField, null),
    _formatItemValue6 = (0, _slicedToArray2["default"])(_formatItemValue5, 3),
    formattedValue = _formatItemValue6[0],
    valueSrc = _formatItemValue6[1],
    valueType = _formatItemValue6[2];
  if (formattedValue === undefined) return undefined;

  //format field
  var formattedField = formatLhs(meta, config, field, fieldSrc, parentField);
  if (formattedField === undefined) return undefined;

  // format expression
  var res = formatExpression(meta, config, properties, formattedField, formattedValue, realOp, valueSrc, valueType, isRev);
  return res;
};
var formatLhs = function formatLhs(meta, config, field, fieldSrc) {
  var parentField = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : null;
  if (fieldSrc === "func") return formatFunc(meta, config, field, parentField);else return formatField(meta, config, field, parentField);
};
var formatItemValue = function formatItemValue(config, properties, meta, operator, parentField) {
  var expectedValueType = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : null;
  var field = properties.get("field");
  var iValueSrc = properties.get("valueSrc");
  var iValueType = properties.get("valueType");
  if (expectedValueType == "!case_value" || iValueType && iValueType.get(0) == "case_value") {
    field = "!case_value";
  }
  var fieldDef = (0, _configUtils.getFieldConfig)(config, field) || {};
  var operatorDefinition = (0, _configUtils.getOperatorConfig)(config, operator, field) || {};
  var cardinality = (0, _stuff.defaultValue)(operatorDefinition.cardinality, 1);
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
      var fv = formatValue(meta, config, cValue, valueSrc, valueType, fieldWidgetDef, fieldDef, operator, operatorDefinition, parentField, asyncListValues);
      if (fv !== undefined) {
        valueSrcs.push(valueSrc);
        valueTypes.push(valueType);
      }
      return fv;
    });
    var hasUndefinedValues = fvalue.filter(function (v) {
      return v === undefined;
    }).size > 0;
    if (!(fvalue.size < cardinality || hasUndefinedValues)) {
      formattedValue = cardinality > 1 ? fvalue.toArray() : cardinality == 1 ? fvalue.first() : null;
    }
  }
  return [formattedValue, valueSrcs.length > 1 ? valueSrcs : valueSrcs[0], valueTypes.length > 1 ? valueTypes : valueTypes[0]];
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
  } else {
    if (typeof fieldWidgetDef.spelFormatValue === "function") {
      var fn = fieldWidgetDef.spelFormatValue;
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
      ret = (0, _export.spelEscape)(currentValue);
    }
  }
  return ret;
};
var formatField = function formatField(meta, config, field) {
  var parentField = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
  if (!field) return;
  var fieldSeparator = config.settings.fieldSeparator;
  var fieldDefinition = (0, _configUtils.getFieldConfig)(config, field) || {};
  var fieldParts = (0, _configUtils.getFieldParts)(field, config);
  var fieldPartsConfigs = (0, _ruleUtils.getFieldPartsConfigs)(field, config, parentField);
  var formatFieldFn = config.settings.formatSpelField;
  var fieldName = (0, _ruleUtils.formatFieldName)(field, config, meta, parentField);
  var fieldPartsMeta = fieldPartsConfigs.map(function (_ref3) {
    var _ref4 = (0, _slicedToArray2["default"])(_ref3, 3),
      key = _ref4[0],
      cnf = _ref4[1],
      parentCnf = _ref4[2];
    var parent;
    if (parentCnf) {
      if (parentCnf.type == "!struct" || parentCnf.type == "!group" && parentCnf.mode == "struct") parent = cnf.isSpelMap ? "map" : "class";else if (parentCnf.type == "!group") parent = cnf.isSpelItemMap ? "[map]" : "[class]";else parent = "class";
    }
    var isSpelVariable = cnf === null || cnf === void 0 ? void 0 : cnf.isSpelVariable;
    return {
      key: key,
      parent: parent,
      isSpelVariable: isSpelVariable,
      fieldSeparator: fieldSeparator
    };
  });
  var formattedField = formatFieldFn.call(config.ctx, fieldName, parentField, fieldParts, fieldPartsMeta, fieldDefinition, config);
  return formattedField;
};
var formatFunc = function formatFunc(meta, config, currentValue) {
  var parentField = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
  var funcKey = currentValue.get("func");
  var args = currentValue.get("args");
  var funcConfig = (0, _configUtils.getFuncConfig)(config, funcKey);
  if (!funcConfig) {
    meta.errors.push("Func ".concat(funcKey, " is not defined in config"));
    return undefined;
  }
  var formattedArgs = {};
  var gaps = [];
  var missingArgKeys = [];
  for (var argKey in funcConfig.args) {
    var _argConfig$spelEscape;
    var argConfig = funcConfig.args[argKey];
    var fieldDef = (0, _configUtils.getFieldConfig)(config, argConfig);
    var _defaultValue = argConfig.defaultValue,
      isOptional = argConfig.isOptional;
    var defaultValueSrc = _defaultValue !== null && _defaultValue !== void 0 && _defaultValue.func ? "func" : "value";
    var argVal = args ? args.get(argKey) : undefined;
    var argValue = argVal ? argVal.get("value") : undefined;
    var argValueSrc = argVal ? argVal.get("valueSrc") : undefined;
    var argAsyncListValues = argVal ? argVal.get("asyncListValues") : undefined;
    var doEscape = (_argConfig$spelEscape = argConfig.spelEscapeForFormat) !== null && _argConfig$spelEscape !== void 0 ? _argConfig$spelEscape : true;
    var operator = null;
    var widget = (0, _ruleUtils.getWidgetForFieldOp)(config, argConfig, operator, argValueSrc);
    var fieldWidgetDef = (0, _omit["default"])((0, _configUtils.getFieldWidgetConfig)(config, argConfig, operator, widget, argValueSrc), ["factory"]);
    var formattedArgVal = formatValue(meta, config, argValue, argValueSrc, argConfig.type, fieldWidgetDef, fieldDef, null, null, parentField, argAsyncListValues);
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
      formattedDefaultVal = formatValue(meta, config, _defaultValue, defaultValueSrc, argConfig.type, defaultFieldWidgetDef, fieldDef, null, null, parentField, argAsyncListValues);
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
        var _iterator = _createForOfIteratorHelper(gaps),
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
      formattedArgs[argKey] = doEscape ? finalFormattedVal : argValue !== null && argValue !== void 0 ? argValue : _defaultValue;
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
  if (typeof funcConfig.spelFormatFunc === "function") {
    var fn = funcConfig.spelFormatFunc;
    var _args = [formattedArgs];
    ret = fn.call.apply(fn, [config.ctx].concat(_args));
  } else if (funcConfig.spelFunc) {
    // fill arg values
    ret = funcConfig.spelFunc.replace(/\${(\w+)}/g, function (found, argKey) {
      var _formattedArgs$argKey;
      return (_formattedArgs$argKey = formattedArgs[argKey]) !== null && _formattedArgs$argKey !== void 0 ? _formattedArgs$argKey : found;
    });
    // remove optional args (from end only)
    var optionalArgs = Object.keys(funcConfig.args || {}).reverse().filter(function (argKey) {
      return !!funcConfig.args[argKey].isOptional;
    });
    var _iterator2 = _createForOfIteratorHelper(optionalArgs),
      _step2;
    try {
      for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
        var _argKey = _step2.value;
        if (formattedArgs[_argKey] != undefined) break;
        ret = ret.replace(new RegExp("(, )?" + "\\${" + _argKey + "}", "g"), "");
      }
      // missing required arg vals
    } catch (err) {
      _iterator2.e(err);
    } finally {
      _iterator2.f();
    }
    ret = ret.replace(/\${(\w+)}/g, "null");
  } else {
    meta.errors.push("Func ".concat(funcKey, " is not supported"));
  }
  return ret;
};