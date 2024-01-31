import { getWidgetForFieldOp } from "../utils/ruleUtils";
import { defaultConjunction } from "../utils/defaultUtils";
import { Utils, CoreConfig } from "..";

const operatorsMap = {
  "==": "==",
  "!=": "!=",
  ">=": ">=",
  "<=": "<=",
  ">": ">",
  "<": "<",
  REGEX: "regex",
  NOTCONTAINS: "#regex",
  ISNULL: "IsNull",
  ISNOTNULL: "IsNotNull",
  DOESNOTEXIST: "IsNull",
  EXISTS: "IsNotNull",
  WILDCARD: "wildcard",
  EQUALS: "regex",
  NOTEQUALS: "regex",
  CONTAINS: "wildcard",
  STARTSWITH: "regex",
  DOESNOTSTARTWITH: "regex",
  DOESNOTENDWITH: "regex",
  ENDSWITH: "regex",
};
const QueryTypeEnum = {
  FILTER: "filter",
  EXISTS: "exists",
  MATCH: "match",
  TERM: "term",
  GEO_BOUNDING_BOX: "geo_bounding_box",
  RANGE: "range",
  WILDCRAD: "wildcard",
  REGEXP: "regexp",
};
const ParamTypeEnum = { JSONPATH: "json_path", MULTILEVEL: "multi_level" };
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

  const coordsNumberArray = geoPointString.split(",").map(Number);
  return {
    top_left: {
      lat: coordsNumberArray[0],
      lon: coordsNumberArray[1],
    },
    bottom_right: {
      lat: coordsNumberArray[2],
      lon: coordsNumberArray[3],
    },
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
      lte: "".concat(value[1]),
    };
  } // -- if value is only one we assume this is a date time query for a specific day

  const dateTime = value[0]; //TODO: Rethink about this part, what if someone adds a new type of opperator

  //todo: move this logic into config
  switch (operator) {
    case "on_date": //todo: not used
    case "not_on_date":
    case "equal":
    case "select_equals":
    case "not_equal":
      return {
        gte: "".concat(dateTime, "||/d"),
        lte: "".concat(dateTime, "||+1d"),
      };

    case "less_or_equal":
      return {
        lte: "".concat(dateTime),
      };

    case "greater_or_equal":
      return {
        gte: "".concat(dateTime),
      };

    case "less":
      return {
        lt: "".concat(dateTime),
      };

    case "greater":
      return {
        gt: "".concat(dateTime),
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
    value: "*" + value + "*",
    boost: 1.0,
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
    value: value,
  };
}

function sanitizeRegexpParameters(value) {
  return value
    .replace(/\#/g, "\\#")
    .replace(/\|/g, "\\|")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    .replace(/\]/g, "\\]")
    .replace(/\[/g, "\\[")
    .replace(/\+/g, "\\+")
    .replace(/\^/g, "\\^")
    .replace(/\*/g, "\\*")
    .replace(/\./g, "\\.");
}

function determineField(fieldName, config) {
  //todo: ElasticSearchTextField - not used
  //return config.fields[fieldName].ElasticSearchTextField || fieldName;
  return fieldName;
}

function buildParameters(
  queryType,
  value,
  operator,
  fieldName,
  config,
  syntax
) {
  const textField = determineField(fieldName, config);
  switch (queryType) {
    case QueryTypeEnum.FILTER:
      //todo: elasticSearchScript - not used
      return {
        script: config.operators[operator].elasticSearchScript(
          fieldName,
          value
        ),
      };

    case QueryTypeEnum.EXISTS:
      return { field: fieldName };

    case QueryTypeEnum.MATCH:
      return { [textField]: value[0] };

    case QueryTypeEnum.TERM:
      return syntax === ES_7_SYNTAX
        ? {
            [fieldName]: {
              value: value[0],
            },
          }
        : { [fieldName]: value[0] };

    //todo: not used
    // need to add geo type into RAQB or remove this code
    case QueryTypeEnum.GEO_BOUNDING_BOX:
      return { [fieldName]: buildEsGeoPoint(value[0]) };

    case QueryTypeEnum.RANGE:
      return { [fieldName]: buildEsRangeParameters(value, operator) };

    case QueryTypeEnum.WILDCRAD:
      return { [fieldName]: buildEsWildcardParameters(value[0]) };

    case QueryTypeEnum.REGEXP:
      return { [fieldName]: buildRegexpParameters(value[0]) };

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
function buildEsRule(
  fieldName,
  value,
  operator,
  config,
  valueSrc,
  syntax,
  fieldSrc,
  fieldTypeMap
) {
  if (!fieldName || !operator || value == undefined) return undefined; // rule is not fully entered
  let op = operator;
  let opConfig = config.operators[op];
  if (!opConfig) return undefined; // unknown operator
  let { elasticSearchQueryType } = opConfig;

  // not
  let not = false;
  if (!elasticSearchQueryType && opConfig.reversedOp) {
    not = true;
    op = opConfig.reversedOp;
    opConfig = config.operators[op];
    ({ elasticSearchQueryType } = opConfig);
  }

  // handle if value 0 has multiple values like a select in a array
  const widget = getWidgetForFieldOp(config, fieldName, op, valueSrc);
  const widgetConfig = config.widgets[widget];
  if (!widgetConfig) return undefined; // unknown widget
  const { elasticSearchFormatValue } = widgetConfig;

  /** In most cases the queryType will be static however in some casese (like between) the query type will change
   * based on the data type. i.e. a between time will be different than between number, date, letters etc... */
  let queryType;
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
  let parameters;
  fieldName =
    fieldSrc && fieldSrc.toLowerCase() != "field" ? fieldSrc : fieldName; //DoneBy:hem
  if (typeof elasticSearchFormatValue === "function") {
    parameters = elasticSearchFormatValue(
      queryType,
      value,
      op,
      fieldName,
      config
    );
  } else {
    parameters = buildParameters(
      queryType,
      value,
      op,
      fieldName,
      config,
      syntax
    );
  }
  let nestedFiled = getNestedQueryField(parameters, queryType);
  let paramType = fieldTypeMap[nestedFiled];
  if (not) {
    if (paramType === ParamTypeEnum.JSONPATH) {
      return getNestedRuleForNot(queryType, nestedFiled, parameters);
    } else {
      return getNotRule(queryType, parameters);
    }
  } else {
    if (paramType === ParamTypeEnum.JSONPATH) {
      return getNestedRule(queryType, nestedFiled, parameters);
    } else {
      return getVanillaRule(queryType, parameters);
    }
  }
}
function getNotRule(queryType, parameters) {
  return {
    bool: {
      must_not: {
        [queryType]: { ...parameters },
      },
    },
  };
}
function getVanillaRule(queryType, parameters) {
  return {
    [queryType]: { ...parameters },
  };
}
function getNestedRule(queryType, fieldName, parameters) {
  let splitedPath = fieldName.split(".");
  if (splitedPath && splitedPath.length > 0) {
    return {
      nested: {
        path: splitedPath[0],
        query: {
          [queryType]: { ...parameters },
        },
      },
    };
  } else {
    getVanilaRule(queryType, parameters);
  }
}
function getNestedRuleForNot(queryType, fieldName, parameters) {
  let splitedPath = fieldName.split(".");
  if (splitedPath && splitedPath.length > 0) {
    return {
      nested: {
        path: splitedPath[0],
        query: {
          bool: {
            must_not: {
              [queryType]: { ...parameters },
            },
          },
        },
      },
    };
  } else {
    getNotRule(queryType, parameters);
  }
}
function getNestedQueryField(parameters, queryType) {
  let fieldName =
    queryType != QueryTypeEnum.EXISTS
      ? Object.keys(parameters)[0]
      : parameters[Object.keys(parameters)[0]];
  return fieldName;
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
function buildEsGroup(
  children,
  conjunction,
  not,
  recursiveFxn,
  config,
  syntax,
  fieldTypeMap
) {
  if (!children || !children.size) return undefined;
  const childrenArray = children.valueSeq().toArray();
  const occurrence = determineOccurrence(conjunction, not);
  const result = childrenArray
    .map((c) => recursiveFxn(c, config, syntax, fieldTypeMap))
    .filter((v) => v !== undefined);
  if (!result.length) return undefined;
  const resultFlat = result.flat(Infinity);
  const modifiedResultFlat = getOptimizedNestedQuery(resultFlat, occurrence);
  return {
    bool: {
      [occurrence]: modifiedResultFlat,
    },
  };
}

function getOptimizedNestedQuery(resultFlat, occurrence) {
  let pathMap = {};
  let newResultFlat = [];
  resultFlat.forEach((item) => {
    if (item["nested"]) {
      let nestedParams = pathMap[item["nested"].path];
      if (nestedParams) {
        nestedParams.push(item["nested"].query);
      } else {
        pathMap[item["nested"].path] = [item["nested"].query];
      }
    } else {
      newResultFlat.push(item);
    }
  });
  for (let key in pathMap) {
    if (pathMap[key].length > 1) {
      newResultFlat.push({
        nested: {
          path: key,
          query: { bool: { [occurrence]: pathMap[key] } },
        },
      });
    } else {
      newResultFlat.push({
        nested: {
          path: key,
          query: pathMap[key][0],
        },
      });
    }
  }
  return newResultFlat;
}

function createJsonLogic(query, jsonLogic) {
  if (query["condition"]) {
    let emptyRules = [];
    jsonLogic[query["condition"]] = emptyRules;
    addRulesSet(query["rules"], emptyRules);
  }
  if (query["operator"]) {
    let operatirAlias = query["operator"].replace(/\s/g, "").toUpperCase();
    let operator = operatorsMap[operatirAlias];
    let field = query["field"];
    let lhs = { var: field };
    if (
      query.fieldInfo.type === ParamTypeEnum.MULTILEVEL ||
      query.fieldInfo.type === ParamTypeEnum.JSONPATH
    ) {
      lhs = { dynamic: query.path };
    }
    if (field && (query["value"] || query["value"] === 0)) {
      if (operator == "IsNull") {
        jsonLogic["=="] = [lhs, null];
      } else if (operator == "IsNotNull") {
        jsonLogic["!="] = [lhs, null];
      } else if (operator == "#regex") {
        jsonLogic["!"] = {
          regex: [lhs, query["value"]],
        };
      } else if (operatirAlias === "NOTEQUALS") {
        jsonLogic["!"] = {
          regex: [lhs, sanitizeRegexpParameters(query["value"])],
        };
      } else if (operatirAlias === "EQUALS") {
        jsonLogic[operator] = [lhs, sanitizeRegexpParameters(query["value"])];
      } else if (operatirAlias === "STARTSWITH") {
        jsonLogic[operator] = [
          lhs,
          sanitizeRegexpParameters(query["value"]) + ".*",
        ];
      } else if (operatirAlias === "ENDSWITH") {
        jsonLogic[operator] = [
          lhs,
          ".*" + sanitizeRegexpParameters(query["value"]),
        ];
      } else if (operatirAlias === "DOESNOTSTARTWITH") {
        jsonLogic["!"] = {
          regex: [lhs, sanitizeRegexpParameters(query["value"]) + ".*"],
        };
      } else if (operatirAlias === "DOESNOTENDWITH") {
        jsonLogic["!"] = {
          regex: [lhs, ".*" + sanitizeRegexpParameters(query["value"])],
        };
      } else {
        jsonLogic[operator] = [lhs, query["value"]];
      }
    }
  }
  return jsonLogic;
}

function addRulesSet(rules, jsonLogic) {
  if (rules && rules.length > 0) {
    for (let index = 0; index < rules.length; index++) {
      let emptyRule = {};
      jsonLogic.push(emptyRule);
      createJsonLogic(rules[index], emptyRule);
    }
  }
}

export const ES_7_SYNTAX = "ES_7_SYNTAX";

export const ES_6_SYNTAX = "ES_6_SYNTAX";

export function elasticSearchFormat(
  tree,
  config,
  syntax = ES_6_SYNTAX,
  fieldTypeMap
) {
  if (!fieldTypeMap) {
    fieldTypeMap = {};
  }
  // -- format the es dsl here
  if (!tree) return undefined;
  const type = tree.get("type");
  const properties = tree.get("properties") || new Map();

  if (type === "rule" && properties.get("field")) {
    // -- field is null when a new blank rule is added
    const operator = properties.get("operator");
    const field = properties.get("field");
    const fieldSrc = properties.get("fieldSrc");
    const value = properties.get("value").toJS();
    const _valueType = properties.get("valueType")?.get(0);
    const valueSrc = properties.get("valueSrc")?.get(0);
    fieldTypeMap[fieldSrc] = _valueType ? _valueType : field;

    if (valueSrc === "func" || fieldSrc == "func") {
      // -- elastic search doesn't support functions (that is post processing)
      return;
    }

    if (value && Array.isArray(value[0])) {
      //TODO : Handle case where the value has multiple values such as in the case of a list
      return value[0].map((val) =>
        buildEsRule(
          field,
          [val],
          operator,
          config,
          valueSrc,
          syntax,
          fieldSrc,
          fieldTypeMap
        )
      );
    } else {
      return buildEsRule(
        field,
        value,
        operator,
        config,
        valueSrc,
        syntax,
        fieldSrc,
        fieldTypeMap
      );
    }
  }

  if (type === "group" || type === "rule_group") {
    const not = properties.get("not");
    let conjunction = properties.get("conjunction");
    if (!conjunction) conjunction = defaultConjunction(config);
    const children = tree.get("children1");
    return buildEsGroup(
      children,
      conjunction,
      not,
      elasticSearchFormat,
      config,
      syntax,
      fieldTypeMap
    );
  }
}
export function getDSLQuery(expression, fields, varJsonLogic = {}) {
  let settings = {
    conjunctions: {
      AND: {
        label: "And",
        mongoConj: "$and",
        jsonLogicConj: "and",
        sqlConj: "AND",
        spelConj: "and",
        spelConjs: ["and", "&&"],
        reversedConj: "OR",
        formatConj: "",
        sqlFormatConj: "",
        spelFormatConj: "",
      },
      OR: {
        label: "Or",
        mongoConj: "$or",
        jsonLogicConj: "or",
        sqlConj: "OR",
        spelConj: "or",
        spelConjs: ["or", "||"],
        reversedConj: "AND",
        formatConj: "",
        sqlFormatConj: "",
        spelFormatConj: "",
      },
    },
    operators: CoreConfig.operators,
    widgets: CoreConfig.widgets,
    types: CoreConfig.types,
    settings: CoreConfig.settings,
    fields: fields,
    ctx: CoreConfig.ctx,
  };
  const { loadFromJsonLogic } = Utils;
  let tree = {};
  createJsonLogic(expression, varJsonLogic);
  tree = loadFromJsonLogic(varJsonLogic, settings);
  if (tree != undefined) {
    return elasticSearchFormat(tree, settings, "ES_7_SYNTAX");
  }
  return {};
}
