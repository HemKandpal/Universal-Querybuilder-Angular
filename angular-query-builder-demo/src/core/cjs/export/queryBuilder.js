"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.queryBuilderFormat = void 0;
var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));
var _stuff = require("../utils/stuff");
var _configUtils = require("../utils/configUtils");
var _defaultUtils = require("../utils/defaultUtils");
var _ruleUtils = require("../utils/ruleUtils");
var _immutable = require("immutable");
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { (0, _defineProperty2["default"])(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
/*
 Build tree to http://querybuilder.js.org/ like format

 Example:
 {
    "condition": "AND",
    "rules": [
        {
            "id": "price",
            "field": "price",
            "type": "double",
            "input": "text",
            "operator": "less",
            "value": "10.25"
        },
        {
            "condition": "OR",
            "rules": [
                {
                    "id": "category",
                    "field": "category",
                    "type": "integer",
                    "input": "select",
                    "operator": "equal",
                    "value": "2"
                },
                {
                    "id": "category",
                    "field": "category",
                    "type": "integer",
                    "input": "select",
                    "operator": "equal",
                    "value": "1"
                }
            ]
        }
    ]
 }
 */

var queryBuilderFormat = exports.queryBuilderFormat = function queryBuilderFormat(item, config) {
  //meta is mutable
  var meta = {
    usedFields: []
  };
  var res = formatItem(item, config, meta);
  if (!res) return undefined;
  return _objectSpread(_objectSpread({}, res), meta);
};
var formatItem = function formatItem(item, config, meta) {
  if (!item) return undefined;
  var type = item.get("type");
  var children = item.get("children1");
  if ((type === "group" || type === "rule_group") && children && children.size) {
    return formatGroup(item, config, meta);
  } else if (type === "rule") {
    return formatRule(item, config, meta);
  }
  return undefined;
};
var formatGroup = function formatGroup(item, config, meta) {
  var properties = item.get("properties") || new _immutable.Map();
  var children = item.get("children1");
  var id = item.get("id");
  var list = children.map(function (currentChild) {
    return formatItem(currentChild, config, meta);
  }).filter(function (currentChild) {
    return typeof currentChild !== "undefined";
  });
  if (!list.size) return undefined;
  var conjunction = properties.get("conjunction");
  if (!conjunction) conjunction = (0, _defaultUtils.defaultConjunction)(config);
  var not = properties.get("not");
  var resultQuery = {
    id: id,
    rules: list.toList(),
    condition: conjunction.toUpperCase(),
    not: not
  };
  return resultQuery;
};
var formatRule = function formatRule(item, config, meta) {
  var _valueType;
  var properties = item.get("properties") || new _immutable.Map();
  var id = item.get("id");
  var operator = properties.get("operator");
  var options = properties.get("operatorOptions");
  var field = properties.get("field");
  var value = properties.get("value");
  var valueSrc = properties.get("valueSrc");
  var valueType = properties.get("valueType");
  var hasUndefinedValues = value.filter(function (v) {
    return v === undefined;
  }).size > 0;
  if (field == null || operator == null || hasUndefinedValues) return undefined;
  var fieldDefinition = (0, _configUtils.getFieldConfig)(config, field) || {};
  var operatorDefinition = (0, _configUtils.getOperatorConfig)(config, operator, field) || {};
  var fieldType = fieldDefinition.type || "undefined";
  var cardinality = (0, _stuff.defaultValue)(operatorDefinition.cardinality, 1);
  var typeConfig = config.types[fieldDefinition.type] || {};
  var fieldName = (0, _ruleUtils.formatFieldName)(field, config, meta);
  if (value.size < cardinality) return undefined;
  if (meta.usedFields.indexOf(field) == -1) meta.usedFields.push(field);
  value = value.toArray();
  valueSrc = valueSrc.toArray();
  valueType = ((_valueType = valueType) === null || _valueType === void 0 ? void 0 : _valueType.toArray()) || [];
  var values = [];
  for (var i = 0; i < value.length; i++) {
    var val = {
      type: valueType[i],
      value: value[i]
    };
    values.push(val);
    if (valueSrc[i] == "field") {
      var secondField = value[i];
      if (meta.usedFields.indexOf(secondField) == -1) meta.usedFields.push(secondField);
    }
  }
  var operatorOptions = options ? options.toJS() : null;
  if (operatorOptions && !Object.keys(operatorOptions).length) operatorOptions = null;
  var ruleQuery = {
    id: id,
    fieldName: fieldName,
    type: fieldType,
    input: typeConfig.mainWidget,
    operator: operator
  };
  if (operatorOptions) ruleQuery.operatorOptions = operatorOptions;
  ruleQuery.values = values;
  return ruleQuery;
};