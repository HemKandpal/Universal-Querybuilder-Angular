"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.mongodbFormat = exports._mongodbFormat = void 0;
var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));
var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));
var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));
var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));
var _stuff = require("../utils/stuff");
var _configUtils = require("../utils/configUtils");
var _ruleUtils = require("../utils/ruleUtils");
var _defaultUtils = require("../utils/defaultUtils");
var _omit = _interopRequireDefault(require("lodash/omit"));
var _pick = _interopRequireDefault(require("lodash/pick"));
var _immutable = require("immutable");
function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { (0, _defineProperty2["default"])(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
// helpers
var isObject = function isObject(v) {
  return (0, _typeof2["default"])(v) == "object" && v !== null && !Array.isArray(v);
};
var mongodbFormat = exports.mongodbFormat = function mongodbFormat(tree, config) {
  return _mongodbFormat(tree, config, false);
};
var _mongodbFormat = exports._mongodbFormat = function _mongodbFormat(tree, config) {
  var returnErrors = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
  //meta is mutable
  var meta = {
    errors: []
  };
  var extendedConfig = (0, _configUtils.extendConfig)(config, undefined, false);
  var res = formatItem([], tree, extendedConfig, meta);
  if (returnErrors) {
    return [res, meta.errors];
  } else {
    if (meta.errors.length) console.warn("Errors while exporting to MongoDb:", meta.errors);
    return res;
  }
};
var formatItem = function formatItem(parents, item, config, meta) {
  var _not = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;
  var _canWrapExpr = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : true;
  var _formatFieldName = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : undefined;
  var _value = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : undefined;
  if (!item) return undefined;
  var type = item.get("type");
  if (type === "group" || type === "rule_group") {
    return formatGroup(parents, item, config, meta, _not, _canWrapExpr, _formatFieldName, _value);
  } else if (type === "rule") {
    return formatRule(parents, item, config, meta, _not, _canWrapExpr, _formatFieldName, _value);
  }
  return undefined;
};
var formatGroup = function formatGroup(parents, item, config, meta) {
  var _not = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;
  var _canWrapExpr = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : true;
  var _formatFieldName = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : undefined;
  var _value = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : undefined;
  var type = item.get("type");
  var properties = item.get("properties") || new _immutable.Map();
  var children = item.get("children1") || new _immutable.List();
  var _config$settings = config.settings,
    canShortMongoQuery = _config$settings.canShortMongoQuery,
    fieldSeparator = _config$settings.fieldSeparator;
  var sep = fieldSeparator;
  var hasParentRuleGroup = parents.filter(function (it) {
    return it.get("type") == "rule_group";
  }).length > 0;
  var parentPath = parents.filter(function (it) {
    return it.get("type") == "rule_group";
  }).map(function (it) {
    return it.get("properties").get("field");
  }).slice(-1).pop();
  var realParentPath = hasParentRuleGroup && parentPath;
  var groupField = type === "rule_group" ? properties.get("field") : null;
  var groupFieldName = (0, _ruleUtils.formatFieldName)(groupField, config, meta, realParentPath);
  var groupFieldDef = (0, _configUtils.getFieldConfig)(config, groupField) || {};
  var mode = groupFieldDef.mode; //properties.get("mode");
  var canHaveEmptyChildren = groupField && mode == "array";
  var not = _not ? !properties.get("not") : properties.get("not");
  var list = children.map(function (currentChild) {
    return formatItem([].concat((0, _toConsumableArray2["default"])(parents), [item]), currentChild, config, meta, not, mode != "array", mode == "array" ? function (f) {
      return "$$el".concat(sep).concat(f);
    } : undefined);
  }).filter(function (currentChild) {
    return typeof currentChild !== "undefined";
  });
  if (!canHaveEmptyChildren && !list.size) return undefined;
  var conjunction = properties.get("conjunction");
  if (!conjunction) conjunction = (0, _defaultUtils.defaultConjunction)(config);
  var conjunctionDefinition = config.conjunctions[conjunction];
  var reversedConj = conjunctionDefinition.reversedConj;
  if (not && reversedConj) {
    conjunction = reversedConj;
    conjunctionDefinition = config.conjunctions[conjunction];
  }
  var mongoConj = conjunctionDefinition.mongoConj;
  var resultQuery;
  if (list.size == 1) {
    resultQuery = list.first();
  } else if (list.size > 1) {
    var rules = list.toList().toJS();
    var canShort = canShortMongoQuery && mongoConj == "$and";
    if (canShort) {
      resultQuery = rules.reduce(function (acc, rule) {
        if (!acc) return undefined;
        for (var k in rule) {
          if (k[0] == "$") {
            acc = undefined;
            break;
          }
          if (acc[k] == undefined) {
            acc[k] = rule[k];
          } else {
            // https://github.com/ukrbublik/react-awesome-query-builder/issues/182
            var prev = acc[k],
              next = rule[k];
            if (!isObject(prev)) {
              prev = {
                "$eq": prev
              };
            }
            if (!isObject(next)) {
              next = {
                "$eq": next
              };
            }
            var prevOp = Object.keys(prev)[0],
              nextOp = Object.keys(next)[0];
            if (prevOp == nextOp) {
              acc = undefined;
              break;
            }
            acc[k] = Object.assign({}, prev, next);
          }
        }
        return acc;
      }, {});
    }
    if (!resultQuery)
      // can't be shorten
      resultQuery = (0, _defineProperty2["default"])({}, mongoConj, rules);
  }
  if (groupField) {
    if (mode == "array") {
      var totalQuery = {
        "$size": {
          "$ifNull": ["$" + groupFieldName, []]
        }
      };
      var filterQuery = resultQuery ? {
        "$size": {
          "$ifNull": [{
            "$filter": {
              input: "$" + groupFieldName,
              as: "el",
              cond: resultQuery
            }
          }, []]
        }
      } : totalQuery;
      resultQuery = formatItem(parents, item.set("type", "rule"), config, meta, false, false, function (_f) {
        return filterQuery;
      }, totalQuery);
      resultQuery = {
        "$expr": resultQuery
      };
    } else {
      resultQuery = (0, _defineProperty2["default"])({}, groupFieldName, {
        "$elemMatch": resultQuery
      });
    }
  }
  return resultQuery;
};
var formatRule = function formatRule(parents, item, config, meta) {
  var _not = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;
  var _canWrapExpr = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : true;
  var _formatFieldName = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : undefined;
  var _value = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : undefined;
  var properties = item.get("properties") || new _immutable.Map();
  var hasParentRuleGroup = parents.filter(function (it) {
    return it.get("type") == "rule_group";
  }).length > 0;
  var parentPath = parents.filter(function (it) {
    return it.get("type") == "rule_group";
  }).map(function (it) {
    return it.get("properties").get("field");
  }).slice(-1).pop();
  var realParentPath = hasParentRuleGroup && parentPath;
  var operator = properties.get("operator");
  var operatorOptions = properties.get("operatorOptions");
  var field = properties.get("field");
  var fieldSrc = properties.get("fieldSrc");
  var iValue = properties.get("value");
  var iValueSrc = properties.get("valueSrc");
  var iValueType = properties.get("valueType");
  var asyncListValues = properties.get("asyncListValues");
  if (field == null || operator == null || iValue === undefined) return undefined;
  var fieldDef = (0, _configUtils.getFieldConfig)(config, field) || {};
  var operatorDefinition = (0, _configUtils.getOperatorConfig)(config, operator, field) || {};
  var reversedOp = operatorDefinition.reversedOp;
  var revOperatorDefinition = (0, _configUtils.getOperatorConfig)(config, reversedOp, field) || {};
  var cardinality = (0, _stuff.defaultValue)(operatorDefinition.cardinality, 1);
  var not = _not;
  if (not && reversedOp) {
    var _ref = [reversedOp, operator];
    operator = _ref[0];
    reversedOp = _ref[1];
    var _ref2 = [revOperatorDefinition, operatorDefinition];
    operatorDefinition = _ref2[0];
    revOperatorDefinition = _ref2[1];
    not = false;
  }
  var formattedField;
  var useExpr = false;
  if (fieldSrc == "func") {
    var _formatFunc = formatFunc(meta, config, field, realParentPath);
    var _formatFunc2 = (0, _slicedToArray2["default"])(_formatFunc, 2);
    formattedField = _formatFunc2[0];
    useExpr = _formatFunc2[1];
  } else {
    formattedField = (0, _ruleUtils.formatFieldName)(field, config, meta, realParentPath);
    if (_formatFieldName) {
      useExpr = true;
      formattedField = _formatFieldName(formattedField);
    }
  }
  if (formattedField == undefined) return undefined;

  //format value
  var valueSrcs = [];
  var valueTypes = [];
  var fvalue = iValue.map(function (currentValue, ind) {
    var valueSrc = iValueSrc ? iValueSrc.get(ind) : null;
    var valueType = iValueType ? iValueType.get(ind) : null;
    var cValue = (0, _ruleUtils.completeValue)(currentValue, valueSrc, config);
    var widget = (0, _ruleUtils.getWidgetForFieldOp)(config, field, operator, valueSrc);
    var fieldWidgetDef = (0, _omit["default"])((0, _configUtils.getFieldWidgetConfig)(config, field, operator, widget, valueSrc), ["factory"]);
    var _formatValue = formatValue(meta, config, cValue, valueSrc, valueType, fieldWidgetDef, fieldDef, realParentPath, operator, operatorDefinition, asyncListValues),
      _formatValue2 = (0, _slicedToArray2["default"])(_formatValue, 2),
      fv = _formatValue2[0],
      fvUseExpr = _formatValue2[1];
    if (fv !== undefined) {
      useExpr = useExpr || fvUseExpr;
      valueSrcs.push(valueSrc);
      valueTypes.push(valueType);
    }
    return fv;
  });
  var wrapExpr = useExpr && _canWrapExpr;
  var hasUndefinedValues = fvalue.filter(function (v) {
    return v === undefined;
  }).size > 0;
  if (fvalue.size < cardinality || hasUndefinedValues) return undefined;
  var formattedValue = cardinality > 1 ? fvalue.toArray() : cardinality == 1 ? fvalue.first() : null;

  //build rule
  var fn = operatorDefinition.mongoFormatOp;
  if (!fn) {
    meta.errors.push("Operator ".concat(operator, " is not supported"));
    return undefined;
  }
  var args = [formattedField, operator, _value !== undefined && formattedValue == null ? _value : formattedValue, useExpr, valueSrcs.length > 1 ? valueSrcs : valueSrcs[0], valueTypes.length > 1 ? valueTypes : valueTypes[0], (0, _omit["default"])(operatorDefinition, _stuff.opDefKeysToOmit), operatorOptions, fieldDef];
  var ruleQuery = fn.call.apply(fn, [config.ctx].concat(args));
  if (wrapExpr) {
    ruleQuery = {
      "$expr": ruleQuery
    };
  }
  if (not) {
    ruleQuery = {
      "$not": ruleQuery
    };
  }
  return ruleQuery;
};
var formatValue = function formatValue(meta, config, currentValue, valueSrc, valueType, fieldWidgetDef, fieldDef, parentPath, operator, operatorDef, asyncListValues) {
  if (currentValue === undefined) return [undefined, false];
  var ret;
  var useExpr = false;
  if (valueSrc == "field") {
    var _formatRightField = formatRightField(meta, config, currentValue, parentPath);
    var _formatRightField2 = (0, _slicedToArray2["default"])(_formatRightField, 2);
    ret = _formatRightField2[0];
    useExpr = _formatRightField2[1];
  } else if (valueSrc == "func") {
    var _formatFunc3 = formatFunc(meta, config, currentValue, parentPath);
    var _formatFunc4 = (0, _slicedToArray2["default"])(_formatFunc3, 2);
    ret = _formatFunc4[0];
    useExpr = _formatFunc4[1];
  } else {
    if (typeof fieldWidgetDef.mongoFormatValue === "function") {
      var fn = fieldWidgetDef.mongoFormatValue;
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
  }
  return [ret, useExpr];
};
var formatRightField = function formatRightField(meta, config, rightField, parentPath) {
  var fieldSeparator = config.settings.fieldSeparator;
  var ret;
  var useExpr = true;
  if (rightField) {
    var rightFieldDefinition = (0, _configUtils.getFieldConfig)(config, rightField) || {};
    var fieldParts = (0, _configUtils.getFieldParts)(rightField, config);
    var fieldPartsLabels = (0, _ruleUtils.getFieldPathLabels)(rightField, config);
    var fieldFullLabel = fieldPartsLabels ? fieldPartsLabels.join(fieldSeparator) : null;
    var formatFieldFn = config.settings.formatField;
    var rightFieldName = (0, _ruleUtils.formatFieldName)(rightField, config, meta, parentPath);
    var formattedField = formatFieldFn(rightFieldName, fieldParts, fieldFullLabel, rightFieldDefinition, config, false);
    ret = "$" + formattedField;
  }
  return [ret, useExpr];
};
var formatFunc = function formatFunc(meta, config, currentValue, parentPath) {
  var useExpr = true;
  var ret;
  var funcKey = currentValue.get("func");
  var args = currentValue.get("args");
  var funcConfig = (0, _configUtils.getFuncConfig)(config, funcKey);
  if (!funcConfig) {
    meta.errors.push("Func ".concat(funcKey, " is not defined in config"));
    return [undefined, false];
  }
  var funcParts = (0, _configUtils.getFieldParts)(funcKey, config);
  var funcLastKey = funcParts[funcParts.length - 1];
  var funcName = funcConfig.mongoFunc || funcLastKey;
  var mongoArgsAsObject = funcConfig.mongoArgsAsObject;
  var formattedArgs = {};
  var argsCnt = 0;
  var lastArg = undefined;
  var gaps = [];
  var missingArgKeys = [];
  for (var argKey in funcConfig.args) {
    argsCnt++;
    var argConfig = funcConfig.args[argKey];
    var fieldDef = (0, _configUtils.getFieldConfig)(config, argConfig);
    var _defaultValue = argConfig.defaultValue,
      isOptional = argConfig.isOptional;
    var defaultValueSrc = _defaultValue !== null && _defaultValue !== void 0 && _defaultValue.func ? "func" : "value";
    var argVal = args ? args.get(argKey) : undefined;
    var argValue = argVal ? argVal.get("value") : undefined;
    var argValueSrc = argVal ? argVal.get("valueSrc") : undefined;
    var argAsyncListValues = argVal ? argVal.get("asyncListValues") : undefined;
    var operator = null;
    var widget = (0, _ruleUtils.getWidgetForFieldOp)(config, argConfig, operator, argValueSrc);
    var fieldWidgetDef = (0, _omit["default"])((0, _configUtils.getFieldWidgetConfig)(config, argConfig, operator, widget, argValueSrc), ["factory"]);
    var _formatValue3 = formatValue(meta, config, argValue, argValueSrc, argConfig.type, fieldWidgetDef, fieldDef, parentPath, null, null, argAsyncListValues),
      _formatValue4 = (0, _slicedToArray2["default"])(_formatValue3, 2),
      formattedArgVal = _formatValue4[0],
      _argUseExpr = _formatValue4[1];
    if (argValue != undefined && formattedArgVal === undefined) {
      if (argValueSrc != "func")
        // don't triger error if args value is another uncomplete function
        meta.errors.push("Can't format value of arg ".concat(argKey, " for func ").concat(funcKey));
      return [undefined, false];
    }
    var formattedDefaultVal = void 0;
    if (formattedArgVal === undefined && !isOptional && _defaultValue != undefined) {
      var defaultWidget = (0, _ruleUtils.getWidgetForFieldOp)(config, argConfig, operator, defaultValueSrc);
      var defaultFieldWidgetDef = (0, _omit["default"])((0, _configUtils.getFieldWidgetConfig)(config, argConfig, operator, defaultWidget, defaultValueSrc), ["factory"]);
      var _ = void 0;
      var _formatValue5 = formatValue(meta, config, _defaultValue, defaultValueSrc, argConfig.type, defaultFieldWidgetDef, fieldDef, parentPath, null, null, argAsyncListValues);
      var _formatValue6 = (0, _slicedToArray2["default"])(_formatValue5, 2);
      formattedDefaultVal = _formatValue6[0];
      _ = _formatValue6[1];
      if (formattedDefaultVal === undefined) {
        if (defaultValueSrc != "func")
          // don't triger error if args value is another uncomplete function
          meta.errors.push("Can't format default value of arg ".concat(argKey, " for func ").concat(funcKey));
        return [undefined, false];
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
      formattedArgs[argKey] = finalFormattedVal;
      lastArg = finalFormattedVal;
    } else {
      if (!isOptional) missingArgKeys.push(argKey);
      gaps.push(argKey);
    }
  }
  if (missingArgKeys.length) {
    //meta.errors.push(`Missing vals for args ${missingArgKeys.join(", ")} for func ${funcKey}`);
    return [undefined, false]; // uncomplete
  }

  if (typeof funcConfig.mongoFormatFunc === "function") {
    var fn = funcConfig.mongoFormatFunc;
    var _args = [formattedArgs];
    ret = fn.call.apply(fn, [config.ctx].concat(_args));
  } else if (funcConfig.mongoFormatFunc === null) {
    meta.errors.push("Functon ".concat(funcName, " is not supported"));
    return [undefined, false];
  } else {
    if (mongoArgsAsObject) ret = (0, _defineProperty2["default"])({}, funcName, formattedArgs);else if (argsCnt == 1 && lastArg !== undefined) ret = (0, _defineProperty2["default"])({}, funcName, lastArg);else ret = (0, _defineProperty2["default"])({}, funcName, Object.values(formattedArgs));
  }
  return [ret, useExpr];
};