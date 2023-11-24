"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getDefaultSubField = exports.getDefaultOperator = exports.getDefaultFieldSrc = exports.getDefaultField = exports.emptyProperies = exports.defaultRuleProperties = exports.defaultRule = exports.defaultRoot = exports.defaultOperatorOptions = exports.defaultItemProperties = exports.defaultGroupProperties = exports.defaultGroupConjunction = exports.defaultConjunction = exports.createListFromArray = void 0;
var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));
var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));
var _immutable = _interopRequireDefault(require("immutable"));
var _uuid = _interopRequireDefault(require("./uuid"));
var _configUtils = require("./configUtils");
var _ruleUtils = require("../utils/ruleUtils");
var _stuff = require("./stuff");
var _import = require("../import");
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { (0, _defineProperty2["default"])(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
var getDefaultField = exports.getDefaultField = function getDefaultField(config) {
  var canGetFirst = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
  var parentRuleGroupPath = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
  var defaultField = config.settings.defaultField;
  var f = (!parentRuleGroupPath ? defaultField : getDefaultSubField(config, parentRuleGroupPath)) || canGetFirst && (0, _ruleUtils.getFirstField)(config, parentRuleGroupPath) || null;
  // if default LHS is func, convert to Immutable
  if (f != null && typeof f !== "string" && !(0, _stuff.isImmutable)(f)) {
    f = (0, _import.jsToImmutable)(f);
  }
  return f;
};
var getDefaultSubField = exports.getDefaultSubField = function getDefaultSubField(config) {
  var _config$settings;
  var parentRuleGroupPath = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
  if (!parentRuleGroupPath) return null;
  var fieldSeparator = (config === null || config === void 0 || (_config$settings = config.settings) === null || _config$settings === void 0 ? void 0 : _config$settings.fieldSeparator) || ".";
  var parentRuleGroupConfig = (0, _configUtils.getFieldConfig)(config, parentRuleGroupPath);
  var f = parentRuleGroupConfig === null || parentRuleGroupConfig === void 0 ? void 0 : parentRuleGroupConfig.defaultField;
  if (f) {
    f = [].concat((0, _toConsumableArray2["default"])((0, _configUtils.getFieldParts)(parentRuleGroupPath)), [f]).join(fieldSeparator);
  }
  return f;
};
var getDefaultFieldSrc = exports.getDefaultFieldSrc = function getDefaultFieldSrc(config) {
  var _config$settings$fiel;
  var canGetFirst = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
  return canGetFirst && ((_config$settings$fiel = config.settings.fieldSources) === null || _config$settings$fiel === void 0 ? void 0 : _config$settings$fiel[0]) || "field";
};
var getDefaultOperator = exports.getDefaultOperator = function getDefaultOperator(config, field) {
  var canGetFirst = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
  var defaultOperator = config.settings.defaultOperator;
  var fieldConfig = (0, _configUtils.getFieldConfig)(config, field);
  var fieldOperators = (fieldConfig === null || fieldConfig === void 0 ? void 0 : fieldConfig.operators) || [];
  if (defaultOperator && !fieldOperators.includes(defaultOperator)) defaultOperator = null;
  var fieldDefaultOperator = fieldConfig === null || fieldConfig === void 0 ? void 0 : fieldConfig.defaultOperator;
  if (fieldDefaultOperator && !fieldOperators.includes(fieldDefaultOperator)) fieldDefaultOperator = null;
  if (!fieldDefaultOperator && canGetFirst) fieldDefaultOperator = (0, _ruleUtils.getFirstOperator)(config, field);
  var fieldHasExplicitDefOp = fieldConfig === null || fieldConfig === void 0 ? void 0 : fieldConfig._origDefaultOperator;
  var op = fieldHasExplicitDefOp && fieldDefaultOperator || defaultOperator || fieldDefaultOperator;
  return op;
};

//used for complex operators like proximity
var defaultOperatorOptions = exports.defaultOperatorOptions = function defaultOperatorOptions(config, operator, field) {
  var operatorConfig = operator ? (0, _configUtils.getOperatorConfig)(config, operator, field) : null;
  if (!operatorConfig) return null; //new Immutable.Map();
  return operatorConfig.options ? new _immutable["default"].Map(operatorConfig.options && operatorConfig.options.defaults || {}) : null;
};
var defaultRuleProperties = exports.defaultRuleProperties = function defaultRuleProperties(config) {
  var parentRuleGroupPath = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
  var item = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
  var canUseDefaultFieldAndOp = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;
  var canGetFirst = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;
  var field = null,
    operator = null,
    fieldSrc = null;
  var showErrorMessage = config.settings.showErrorMessage;
  if (item) {
    var _item$properties, _item$properties2, _item$properties3;
    fieldSrc = item === null || item === void 0 || (_item$properties = item.properties) === null || _item$properties === void 0 ? void 0 : _item$properties.fieldSrc;
    field = item === null || item === void 0 || (_item$properties2 = item.properties) === null || _item$properties2 === void 0 ? void 0 : _item$properties2.field;
    operator = item === null || item === void 0 || (_item$properties3 = item.properties) === null || _item$properties3 === void 0 ? void 0 : _item$properties3.operator;
  } else if (canUseDefaultFieldAndOp) {
    field = getDefaultField(config, canGetFirst, parentRuleGroupPath);
    if (field) {
      fieldSrc = (0, _stuff.isImmutable)(field) ? "func" : "field";
    } else {
      fieldSrc = getDefaultFieldSrc(config);
    }
    operator = getDefaultOperator(config, field, true);
  } else {
    fieldSrc = getDefaultFieldSrc(config);
  }
  var current = new _immutable["default"].Map({
    fieldSrc: fieldSrc,
    field: field,
    operator: operator,
    value: new _immutable["default"].List(),
    valueSrc: new _immutable["default"].List(),
    //used for complex operators like proximity
    operatorOptions: defaultOperatorOptions(config, operator, field)
  });
  if (showErrorMessage) {
    current = current.set("valueError", new _immutable["default"].List());
  }
  if (field && operator) {
    var _getNewValueForFieldO = (0, _ruleUtils.getNewValueForFieldOp)(config, config, current, field, operator, "operator", false),
      newValue = _getNewValueForFieldO.newValue,
      newValueSrc = _getNewValueForFieldO.newValueSrc,
      newValueType = _getNewValueForFieldO.newValueType,
      newValueError = _getNewValueForFieldO.newValueError;
    current = current.set("value", newValue).set("valueSrc", newValueSrc).set("valueType", newValueType);
    if (showErrorMessage) {
      current = current.set("valueError", newValueError);
    }
  }
  return current;
};
var defaultGroupConjunction = exports.defaultGroupConjunction = function defaultGroupConjunction(config) {
  var fieldConfig = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
  fieldConfig = (0, _configUtils.getFieldConfig)(config, fieldConfig); // if `fieldConfig` is field name, not config
  var conjs = fieldConfig && fieldConfig.conjunctions || Object.keys(config.conjunctions);
  if (conjs.length == 1) return conjs[0];
  return config.settings.defaultGroupConjunction || config.settings.defaultConjunction || conjs[0];
};
var defaultConjunction = exports.defaultConjunction = function defaultConjunction(config) {
  return config.settings.defaultConjunction || Object.keys(config.conjunctions)[0];
};
var defaultGroupProperties = exports.defaultGroupProperties = function defaultGroupProperties(config) {
  var fieldConfig = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
  return new _immutable["default"].Map({
    conjunction: defaultGroupConjunction(config, fieldConfig),
    not: false
  });
};
var defaultItemProperties = exports.defaultItemProperties = function defaultItemProperties(config, item) {
  var _item$properties4;
  return item && item.type == "group" ? defaultGroupProperties(config, item === null || item === void 0 || (_item$properties4 = item.properties) === null || _item$properties4 === void 0 ? void 0 : _item$properties4.field) : defaultRuleProperties(config, null, item);
};
var defaultRule = exports.defaultRule = function defaultRule(id, config) {
  return (0, _defineProperty2["default"])({}, id, new _immutable["default"].Map({
    type: "rule",
    id: id,
    properties: defaultRuleProperties(config)
  }));
};
var defaultRoot = exports.defaultRoot = function defaultRoot(config) {
  var canAddDefaultRule = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
  return new _immutable["default"].Map({
    type: "group",
    id: (0, _uuid["default"])(),
    children1: new _immutable["default"].OrderedMap(canAddDefaultRule ? _objectSpread({}, defaultRule((0, _uuid["default"])(), config)) : {}),
    properties: defaultGroupProperties(config)
  });
};
var createListFromArray = exports.createListFromArray = function createListFromArray(ids) {
  return new _immutable["default"].List(ids);
};
var emptyProperies = exports.emptyProperies = function emptyProperies() {
  return new _immutable["default"].Map();
};