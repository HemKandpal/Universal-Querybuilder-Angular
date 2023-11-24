"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ES_7_SYNTAX = exports.ES_6_SYNTAX = void 0;
exports.elasticSearchFormat = elasticSearchFormat;
var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));
var _ruleUtils = require("../utils/ruleUtils");
var _defaultUtils = require("../utils/defaultUtils");
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { (0, _defineProperty2["default"])(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
/**
 * Converts a string representation of top_left and bottom_right cords to
 * a ES geo_point required for query
 *
 * @param {string} geoPointString - comma separated string of lat/lon coods
 * @returns {{top_left: {lon: number, lat: number}, bottom_right: {lon: number, lat: number}}} - ES geoPoint formatted object
 * @private
 */
function buildEsGeoPoint(geoPointString) {
  if (geoPointString == null) {
    return null;
  }
  var coordsNumberArray = geoPointString.split(",").map(Number);
  return {
    top_left: {
      lat: coordsNumberArray[0],
      lon: coordsNumberArray[1]
    },
    bottom_right: {
      lat: coordsNumberArray[2],
      lon: coordsNumberArray[3]
    }
  };
}

/**
 * Converts a dateTime string from the query builder to a ES range formatted object
 *
 * @param {string} dateTime - dateTime formatted string
 * @param {string} operator - query builder operator type, see constants.js and query builder docs
 * @returns {{lt: string}|{lte: string}|{gte: string}|{gte: string, lte: string}|undefined} - ES range query parameter
 *
 * @private
 */
function buildEsRangeParameters(value, operator) {
  // -- if value is greater than 1 then we assume this is a between operator : BUG this is wrong, a selectable list can have multiple values
  if (value.length > 1) {
    return {
      gte: "".concat(value[0]),
      lte: "".concat(value[1])
    };
  } // -- if value is only one we assume this is a date time query for a specific day

  var dateTime = value[0]; //TODO: Rethink about this part, what if someone adds a new type of opperator

  //todo: move this logic into config
  switch (operator) {
    case "on_date": //todo: not used
    case "not_on_date":
    case "equal":
    case "select_equals":
    case "not_equal":
      return {
        gte: "".concat(dateTime, "||/d"),
        lte: "".concat(dateTime, "||+1d")
      };
    case "less_or_equal":
      return {
        lte: "".concat(dateTime)
      };
    case "greater_or_equal":
      return {
        gte: "".concat(dateTime)
      };
    case "less":
      return {
        lt: "".concat(dateTime)
      };
    case "greater":
      return {
        gt: "".concat(dateTime)
      };
    default:
      return undefined;
  }
}

/**
 * Builds the DSL parameters for a Wildcard query
 *
 * @param {string} value - The match value
 * @returns {{value: string}} - The value = value parameter surrounded with * on each end
 * @private
 */
function buildEsWildcardParameters(value) {
  return {
    value: "*" + value + "*"
  };
}

/**
 * Takes the match type string from awesome query builder like 'greater_or_equal' and
 * returns the ES occurrence required for bool queries
 *
 * @param {string} combinator - query group type or rule condition
 * @param {bool} not
 * @returns {string} - ES occurrence type. See constants.js
 * @private
 */
function determineOccurrence(combinator, not) {
  //todo: move into config, like mongoConj
  switch (combinator) {
    case "AND":
      return not ? "must_not" : "must";
    // -- AND

    case "OR":
      return not ? "should_not" : "should";
    // -- OR

    case "NOT":
      return not ? "must" : "must_not";
    // -- NOT AND

    default:
      return undefined;
  }
}

/**
 * Determines what field to query off of given the operator type
 *
 * @param {string} fieldDataType - The type of data
 * @param {string} fullFieldName - A '.' separated string containing the property lineage (including self)
 * @param {string} queryType - The query type
 * @returns {string|*} - will be either the fullFieldName or fullFieldName.keyword
 * @private
 */
//todo: not used
// function determineQueryField(fieldDataType, fullFieldName, queryType) {
//   if (fieldDataType === "boolean") {
//     return fullFieldName;
//   }

//   switch (queryType) {
//   case "term":
//   case "wildcard":
//     return "".concat(fullFieldName, ".keyword");

//   case "geo_bounding_box":
//   case "range":
//   case "match":
//     return fullFieldName;

//   default:
//     console.error("Can't determine query field for query type ".concat(queryType));
//     return null;
//   }
// }

function buildRegexpParameters(value) {
  return {
    value: value
  };
}
function determineField(fieldName, config) {
  //todo: ElasticSearchTextField - not used
  //return config.fields[fieldName].ElasticSearchTextField || fieldName;
  return fieldName;
}
function buildParameters(queryType, value, operator, fieldName, config, syntax) {
  var textField = determineField(fieldName, config);
  switch (queryType) {
    case "filter":
      //todo: elasticSearchScript - not used
      return {
        script: config.operators[operator].elasticSearchScript(fieldName, value)
      };
    case "exists":
      return {
        field: fieldName
      };
    case "match":
      return (0, _defineProperty2["default"])({}, textField, value[0]);
    case "term":
      return syntax === ES_7_SYNTAX ? (0, _defineProperty2["default"])({}, fieldName, {
        value: value[0]
      }) : (0, _defineProperty2["default"])({}, fieldName, value[0]);

    //todo: not used
    // need to add geo type into RAQB or remove this code
    case "geo_bounding_box":
      return (0, _defineProperty2["default"])({}, fieldName, buildEsGeoPoint(value[0]));
    case "range":
      return (0, _defineProperty2["default"])({}, fieldName, buildEsRangeParameters(value, operator));
    case "wildcard":
      return (0, _defineProperty2["default"])({}, fieldName, buildEsWildcardParameters(value[0]));
    case "regexp":
      return (0, _defineProperty2["default"])({}, fieldName, buildRegexpParameters(value[0]));
    default:
      return undefined;
  }
}
/**
 * Handles the building of the group portion of the DSL
 *
 * @param {string} fieldName - The name of the field you are building a rule for
 * @param {string} fieldDataType - The type of data this field holds
 * @param {string} value - The value of this rule
 * @param {string} operator - The condition on how the value is matched
 * @param {string} syntax - The version of ElasticSearch syntax to generate
 * @returns {object} - The ES rule
 * @private
 */
function buildEsRule(fieldName, value, operator, config, valueSrc, syntax) {
  if (!fieldName || !operator || value == undefined) return undefined; // rule is not fully entered
  var op = operator;
  var opConfig = config.operators[op];
  if (!opConfig) return undefined; // unknown operator
  var _opConfig = opConfig,
    elasticSearchQueryType = _opConfig.elasticSearchQueryType;

  // not
  var not = false;
  if (!elasticSearchQueryType && opConfig.reversedOp) {
    not = true;
    op = opConfig.reversedOp;
    opConfig = config.operators[op];
    var _opConfig2 = opConfig;
    elasticSearchQueryType = _opConfig2.elasticSearchQueryType;
  }

  // handle if value 0 has multiple values like a select in a array
  var widget = (0, _ruleUtils.getWidgetForFieldOp)(config, fieldName, op, valueSrc);
  var widgetConfig = config.widgets[widget];
  if (!widgetConfig) return undefined; // unknown widget
  var elasticSearchFormatValue = widgetConfig.elasticSearchFormatValue;

  /** In most cases the queryType will be static however in some casese (like between) the query type will change
   * based on the data type. i.e. a between time will be different than between number, date, letters etc... */
  var queryType;
  if (typeof elasticSearchQueryType === "function") {
    queryType = elasticSearchQueryType(widget);
  } else {
    queryType = elasticSearchQueryType;
  }
  if (!queryType) {
    // Not supported
    return undefined;
  }

  /** If a widget has a rule on how to format that data then use that otherwise use default way of determineing search parameters
   * */
  var parameters;
  if (typeof elasticSearchFormatValue === "function") {
    parameters = elasticSearchFormatValue(queryType, value, op, fieldName, config);
  } else {
    parameters = buildParameters(queryType, value, op, fieldName, config, syntax);
  }
  if (not) {
    return {
      bool: {
        must_not: (0, _defineProperty2["default"])({}, queryType, _objectSpread({}, parameters))
      }
    };
  } else {
    return (0, _defineProperty2["default"])({}, queryType, _objectSpread({}, parameters));
  }
}

/**
 * Handles the building of the group portion of the DSL
 *
 * @param {object} children - The contents of the group
 * @param {string} conjunction - The way the contents of the group are joined together i.e. AND OR
 * @param {bool} not
 * @param {Function} recursiveFxn - The recursive fxn to build the contents of the groups children
 * @private
 * @returns {object} - The ES group
 */
function buildEsGroup(children, conjunction, not, recursiveFxn, config, syntax) {
  if (!children || !children.size) return undefined;
  var childrenArray = children.valueSeq().toArray();
  var occurrence = determineOccurrence(conjunction, not);
  var result = childrenArray.map(function (c) {
    return recursiveFxn(c, config, syntax);
  }).filter(function (v) {
    return v !== undefined;
  });
  if (!result.length) return undefined;
  var resultFlat = result.flat(Infinity);
  return {
    bool: (0, _defineProperty2["default"])({}, occurrence, resultFlat)
  };
}
var ES_7_SYNTAX = exports.ES_7_SYNTAX = "ES_7_SYNTAX";
var ES_6_SYNTAX = exports.ES_6_SYNTAX = "ES_6_SYNTAX";
function elasticSearchFormat(tree, config) {
  var syntax = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : ES_6_SYNTAX;
  // -- format the es dsl here
  if (!tree) return undefined;
  var type = tree.get("type");
  var properties = tree.get("properties") || new Map();
  if (type === "rule" && properties.get("field")) {
    var _properties$get, _properties$get2;
    // -- field is null when a new blank rule is added
    var operator = properties.get("operator");
    var field = properties.get("field");
    var fieldSrc = properties.get("fieldSrc");
    var value = properties.get("value").toJS();
    var _valueType = (_properties$get = properties.get("valueType")) === null || _properties$get === void 0 ? void 0 : _properties$get.get(0);
    var valueSrc = (_properties$get2 = properties.get("valueSrc")) === null || _properties$get2 === void 0 ? void 0 : _properties$get2.get(0);
    if (valueSrc === "func" || fieldSrc == "func") {
      // -- elastic search doesn't support functions (that is post processing)
      return;
    }
    if (value && Array.isArray(value[0])) {
      //TODO : Handle case where the value has multiple values such as in the case of a list
      return value[0].map(function (val) {
        return buildEsRule(field, [val], operator, config, valueSrc, syntax);
      });
    } else {
      return buildEsRule(field, value, operator, config, valueSrc, syntax);
    }
  }
  if (type === "group" || type === "rule_group") {
    var not = properties.get("not");
    var conjunction = properties.get("conjunction");
    if (!conjunction) conjunction = (0, _defaultUtils.defaultConjunction)(config);
    var children = tree.get("children1");
    return buildEsGroup(children, conjunction, not, elasticSearchFormat, config, syntax);
  }
}