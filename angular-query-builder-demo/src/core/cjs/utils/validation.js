"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.validateValue = exports.validateTree = exports.validateAndFixTree = void 0;
var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));
var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));
var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));
var _configUtils = require("./configUtils");
var _ruleUtils = require("../utils/ruleUtils");
var _stuff = require("../utils/stuff");
var _listValues = require("../utils/listValues");
var _defaultUtils = require("../utils/defaultUtils");
var _treeUtils = require("../utils/treeUtils");
var _omit = _interopRequireDefault(require("lodash/omit"));
var _immutable = require("immutable");
var typeOf = function typeOf(v) {
  if ((0, _typeof2["default"])(v) == "object" && v !== null && Array.isArray(v)) return "array";else return (0, _typeof2["default"])(v);
};
var isTypeOf = function isTypeOf(v, type) {
  if (typeOf(v) == type) return true;
  if (type == "number" && !isNaN(v)) return true; //can be casted
  return false;
};
var validateAndFixTree = exports.validateAndFixTree = function validateAndFixTree(newTree, _oldTree, newConfig, oldConfig, removeEmptyGroups, removeIncompleteRules) {
  var tree = validateTree(newTree, _oldTree, newConfig, oldConfig, removeEmptyGroups, removeIncompleteRules);
  tree = (0, _treeUtils.fixPathsInTree)(tree);
  return tree;
};
var validateTree = exports.validateTree = function validateTree(tree, _oldTree, config, oldConfig, removeEmptyGroups, removeIncompleteRules) {
  if (removeEmptyGroups === undefined) {
    removeEmptyGroups = config.settings.removeEmptyGroupsOnLoad;
  }
  if (removeIncompleteRules === undefined) {
    removeIncompleteRules = config.settings.removeIncompleteRulesOnLoad;
  }
  var c = {
    config: config,
    oldConfig: oldConfig,
    removeEmptyGroups: removeEmptyGroups,
    removeIncompleteRules: removeIncompleteRules
  };
  return validateItem(tree, [], null, {}, c);
};
function validateItem(item, path, itemId, meta, c) {
  var type = item.get("type");
  var children = item.get("children1");
  if ((type === "group" || type === "rule_group" || type == "case_group" || type == "switch_group") && children && children.size) {
    return validateGroup(item, path, itemId, meta, c);
  } else if (type === "rule") {
    return validateRule(item, path, itemId, meta, c);
  } else {
    return item;
  }
}
function validateGroup(item, path, itemId, meta, c) {
  var removeEmptyGroups = c.removeEmptyGroups;
  var id = item.get("id");
  var children = item.get("children1");
  var oldChildren = children;
  if (!id && itemId) {
    id = itemId;
    item = item.set("id", id);
    meta.sanitized = true;
  }

  //validate children
  var submeta = {};
  children = children.map(function (currentChild, childId) {
    return validateItem(currentChild, path.concat(id), childId, submeta, c);
  });
  if (removeEmptyGroups) children = children.filter(function (currentChild) {
    return currentChild != undefined;
  });
  var sanitized = submeta.sanitized || oldChildren.size != children.size;
  if (!children.size && removeEmptyGroups && path.length) {
    sanitized = true;
    item = undefined;
  }
  if (sanitized) meta.sanitized = true;
  if (sanitized && item) item = item.set("children1", children);
  return item;
}
function validateRule(item, path, itemId, meta, c) {
  var _field, _field$toJS, _field2, _field2$toJS;
  var removeIncompleteRules = c.removeIncompleteRules,
    config = c.config,
    oldConfig = c.oldConfig;
  var showErrorMessage = config.settings.showErrorMessage;
  var id = item.get("id");
  var properties = item.get("properties");
  var field = properties.get("field") || null;
  var fieldSrc = properties.get("fieldSrc") || null;
  var operator = properties.get("operator") || null;
  var operatorOptions = properties.get("operatorOptions");
  var valueSrc = properties.get("valueSrc");
  var value = properties.get("value");
  var valueError = properties.get("valueError");
  var oldSerialized = {
    field: ((_field = field) === null || _field === void 0 || (_field$toJS = _field.toJS) === null || _field$toJS === void 0 ? void 0 : _field$toJS.call(_field)) || field,
    fieldSrc: fieldSrc,
    operator: operator,
    operatorOptions: operatorOptions ? operatorOptions.toJS() : {},
    valueSrc: valueSrc ? valueSrc.toJS() : null,
    value: value ? value.toJS() : null,
    valueError: valueError ? valueError.toJS() : null
  };
  var _wasValid = field && operator && value && !value.includes(undefined);
  if (!id && itemId) {
    id = itemId;
    item = item.set("id", id);
    meta.sanitized = true;
  }

  //validate field
  var fieldDefinition = field ? (0, _configUtils.getFieldConfig)(config, field) : null;
  if (field && !fieldDefinition) {
    _stuff.logger.warn("No config for field ".concat(field));
    field = null;
  }
  if (field == null) {
    properties = ["operator", "operatorOptions", "valueSrc", "value", "valueError"].reduce(function (map, key) {
      return map["delete"](key);
    }, properties);
    operator = null;
  }
  if (!fieldSrc) {
    fieldSrc = (0, _configUtils.getFieldSrc)(field);
    properties = properties.set("fieldSrc", fieldSrc);
  }

  //validate operator
  // Backward compatibility: obsolete operator range_between
  if (operator == "range_between" || operator == "range_not_between") {
    operator = operator == "range_between" ? "between" : "not_between";
    console.info("Fixed operator ".concat(properties.get("operator"), " to ").concat(operator));
    properties = properties.set("operator", operator);
  }
  var operatorDefinition = operator ? (0, _configUtils.getOperatorConfig)(config, operator, field) : null;
  if (operator && !operatorDefinition) {
    console.warn("No config for operator ".concat(operator));
    operator = null;
  }
  var availOps = field ? (0, _ruleUtils.getOperatorsForField)(config, field) : [];
  if (field) {
    if (!(availOps !== null && availOps !== void 0 && availOps.length)) {
      console.warn("Type of field ".concat(field, " is not supported"));
      operator = null;
    } else if (operator && availOps.indexOf(operator) == -1) {
      if (operator == "is_empty" || operator == "is_not_empty") {
        // Backward compatibility: is_empty #494
        operator = operator == "is_empty" ? "is_null" : "is_not_null";
        console.info("Fixed operator ".concat(properties.get("operator"), " to ").concat(operator, " for ").concat(field));
        properties = properties.set("operator", operator);
      } else {
        console.warn("Operator ".concat(operator, " is not supported for field ").concat(field));
        operator = null;
      }
    }
  }
  if (operator == null) {
    // do not unset operator ?
    properties = properties["delete"]("operatorOptions");
    properties = properties["delete"]("valueSrc");
    properties = properties["delete"]("value");
    properties = properties["delete"]("valueError");
  }

  //validate operator options
  operatorOptions = properties.get("operatorOptions");
  var _operatorCardinality = operator ? (0, _stuff.defaultValue)(operatorDefinition.cardinality, 1) : null;
  if (!operator || operatorOptions && !operatorDefinition.options) {
    operatorOptions = null;
    properties = properties["delete"]("operatorOptions");
  } else if (operator && !operatorOptions && operatorDefinition.options) {
    operatorOptions = (0, _defaultUtils.defaultOperatorOptions)(config, operator, field);
    properties = properties.set("operatorOptions", operatorOptions);
  }

  //validate values
  valueSrc = properties.get("valueSrc");
  value = properties.get("value");
  var canFix = !showErrorMessage;
  var isEndValue = true;
  var _getNewValueForFieldO = (0, _ruleUtils.getNewValueForFieldOp)(config, oldConfig, properties, field, operator, null, canFix, isEndValue),
    newValue = _getNewValueForFieldO.newValue,
    newValueSrc = _getNewValueForFieldO.newValueSrc,
    newValueError = _getNewValueForFieldO.newValueError;
  value = newValue;
  valueSrc = newValueSrc;
  valueError = newValueError;
  properties = properties.set("value", value);
  properties = properties.set("valueSrc", valueSrc);
  if (showErrorMessage) {
    properties = properties.set("valueError", valueError);
  } else {
    properties = properties["delete"]("valueError");
  }
  var newSerialized = {
    field: ((_field2 = field) === null || _field2 === void 0 || (_field2$toJS = _field2.toJS) === null || _field2$toJS === void 0 ? void 0 : _field2$toJS.call(_field2)) || field,
    fieldSrc: fieldSrc,
    operator: operator,
    operatorOptions: operatorOptions ? operatorOptions.toJS() : {},
    valueSrc: valueSrc ? valueSrc.toJS() : null,
    value: value ? value.toJS() : null,
    valueError: valueError ? valueError.toJS() : null
  };
  var sanitized = !(0, _stuff.deepEqual)(oldSerialized, newSerialized);
  //const isCompleted = !!operator && !isEmptyRuleProperties(properties.toObject(), config, false);
  var isValueCompleted = value && value.filter(function (v, delta) {
    return !(0, _ruleUtils.isCompletedValue)(v, valueSrc.get(delta), config);
  }).size == 0;
  var isFieldCompleted = (0, _ruleUtils.isCompletedValue)(field, fieldSrc, config);
  var isCompleted = isFieldCompleted && operator && isValueCompleted;
  if (sanitized) meta.sanitized = true;
  if (!isCompleted && removeIncompleteRules) {
    var reason = "Uncomplete rule";
    if (!isFieldCompleted) {
      reason = "Uncomplete LHS";
    } else {
      var _newSerialized$valueS, _newSerialized$valueS2, _oldSerialized$valueS;
      reason = "Uncomplete RHS";
      if ((_newSerialized$valueS = newSerialized.valueSrc) !== null && _newSerialized$valueS !== void 0 && _newSerialized$valueS[0] && ((_newSerialized$valueS2 = newSerialized.valueSrc) === null || _newSerialized$valueS2 === void 0 ? void 0 : _newSerialized$valueS2[0]) != ((_oldSerialized$valueS = oldSerialized.valueSrc) === null || _oldSerialized$valueS === void 0 ? void 0 : _oldSerialized$valueS[0])) {
        // eg. operator `starts_with` supports only valueSrc "value"
        reason = "Bad value src ".concat(newSerialized.valueSrc);
      }
    }
    console.warn("[RAQB validate]", "Removing rule: ", oldSerialized, "Reason: ".concat(reason));
    item = undefined;
  } else if (sanitized) item = item.set("properties", properties);
  return item;
}

/**
 * 
 * @param {bool} canFix true is useful for func values to remove bad args
 * @param {bool} isEndValue false if value is in process of editing by user
 * @param {bool} isRawValue false is used only internally from validateFuncValue
 * @return {array} [validError, fixedValue] - if validError === null and canFix == true, fixedValue can differ from value if was fixed
 */
var validateValue = exports.validateValue = function validateValue(config, leftField, field, operator, value, valueType, valueSrc, asyncListValues) {
  var canFix = arguments.length > 8 && arguments[8] !== undefined ? arguments[8] : false;
  var isEndValue = arguments.length > 9 && arguments[9] !== undefined ? arguments[9] : false;
  var isRawValue = arguments.length > 10 && arguments[10] !== undefined ? arguments[10] : true;
  var validError = null;
  var fixedValue = value;
  if (value != null) {
    if (valueSrc == "field") {
      var _validateFieldValue = validateFieldValue(leftField, field, value, valueSrc, valueType, asyncListValues, config, operator, isEndValue, canFix);
      var _validateFieldValue2 = (0, _slicedToArray2["default"])(_validateFieldValue, 2);
      validError = _validateFieldValue2[0];
      fixedValue = _validateFieldValue2[1];
    } else if (valueSrc == "func") {
      var _validateFuncValue = validateFuncValue(leftField, field, value, valueSrc, valueType, asyncListValues, config, operator, isEndValue, canFix);
      var _validateFuncValue2 = (0, _slicedToArray2["default"])(_validateFuncValue, 2);
      validError = _validateFuncValue2[0];
      fixedValue = _validateFuncValue2[1];
    } else if (valueSrc == "value" || !valueSrc) {
      var _validateNormalValue = validateNormalValue(leftField, field, value, valueSrc, valueType, asyncListValues, config, operator, isEndValue, canFix);
      var _validateNormalValue2 = (0, _slicedToArray2["default"])(_validateNormalValue, 2);
      validError = _validateNormalValue2[0];
      fixedValue = _validateNormalValue2[1];
    }
    if (!validError) {
      var fieldConfig = (0, _configUtils.getFieldConfig)(config, field);
      var w = (0, _ruleUtils.getWidgetForFieldOp)(config, field, operator, valueSrc);
      var operatorDefinition = operator ? (0, _configUtils.getOperatorConfig)(config, operator, field) : null;
      var fieldWidgetDefinition = (0, _omit["default"])((0, _configUtils.getFieldWidgetConfig)(config, field, operator, w, valueSrc), ["factory"]);
      var rightFieldDefinition = valueSrc == "field" ? (0, _configUtils.getFieldConfig)(config, value) : null;
      var fieldSettings = fieldWidgetDefinition; // widget definition merged with fieldSettings

      var fn = fieldWidgetDefinition.validateValue;
      if (typeof fn == "function") {
        var args = [fixedValue, fieldSettings, operator, operatorDefinition];
        if (valueSrc == "field") args.push(rightFieldDefinition);
        var validResult = fn.call.apply(fn, [config.ctx].concat(args));
        if (typeof validResult == "boolean") {
          if (validResult == false) validError = "Invalid value";
        } else {
          validError = validResult;
        }
      }
    }
  }
  if (isRawValue && validError) {
    console.warn("[RAQB validate]", "Field ".concat(field, ": ").concat(validError));
  }
  return [validError, fixedValue];
};
var validateValueInList = function validateValueInList(value, listValues, canFix, isEndValue, removeInvalidMultiSelectValuesOnLoad) {
  var values = _immutable.List.isList(value) ? value.toJS() : value instanceof Array ? (0, _toConsumableArray2["default"])(value) : undefined;
  if (values) {
    var _values$reduce = values.reduce(function (_ref, val) {
        var _ref2 = (0, _slicedToArray2["default"])(_ref, 2),
          goodVals = _ref2[0],
          badVals = _ref2[1];
        var vv = (0, _listValues.getItemInListValues)(listValues, val);
        if (vv == undefined) {
          return [goodVals, [].concat((0, _toConsumableArray2["default"])(badVals), [val])];
        } else {
          return [[].concat((0, _toConsumableArray2["default"])(goodVals), [vv.value]), badVals];
        }
      }, [[], []]),
      _values$reduce2 = (0, _slicedToArray2["default"])(_values$reduce, 2),
      goodValues = _values$reduce2[0],
      badValues = _values$reduce2[1];
    var plural = badValues.length > 1;
    var err = badValues.length ? "".concat(plural ? "Values" : "Value", " ").concat(badValues.join(", "), " ").concat(plural ? "are" : "is", " not in list of values") : null;
    // always remove bad values at tree validation as user can't unselect them (except AntDesign widget)
    if (removeInvalidMultiSelectValuesOnLoad !== undefined) {
      canFix = removeInvalidMultiSelectValuesOnLoad;
    } else {
      canFix = canFix || isEndValue;
    }
    return [err, canFix ? goodValues : value];
  } else {
    var vv = (0, _listValues.getItemInListValues)(listValues, value);
    if (vv == undefined) {
      return ["Value ".concat(value, " is not in list of values"), value];
    } else {
      value = vv.value;
    }
    return [null, value];
  }
};

/**
* 
*/
var validateNormalValue = function validateNormalValue(leftField, field, value, valueSrc, valueType, asyncListValues, config) {
  var operator = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : null;
  var isEndValue = arguments.length > 8 && arguments[8] !== undefined ? arguments[8] : false;
  var canFix = arguments.length > 9 && arguments[9] !== undefined ? arguments[9] : false;
  if (field) {
    var fieldConfig = (0, _configUtils.getFieldConfig)(config, field);
    var w = (0, _ruleUtils.getWidgetForFieldOp)(config, field, operator, valueSrc);
    var wConfig = config.widgets[w];
    var wType = wConfig === null || wConfig === void 0 ? void 0 : wConfig.type;
    var jsType = wConfig === null || wConfig === void 0 ? void 0 : wConfig.jsType;
    var fieldSettings = fieldConfig.fieldSettings;
    var listValues = (fieldSettings === null || fieldSettings === void 0 ? void 0 : fieldSettings.treeValues) || (fieldSettings === null || fieldSettings === void 0 ? void 0 : fieldSettings.listValues);
    var isAsyncListValues = !!(fieldSettings !== null && fieldSettings !== void 0 && fieldSettings.asyncFetch);
    // todo: for select/multiselect value can be string or number
    var canSkipCheck = listValues || isAsyncListValues;
    if (valueType && wType && valueType != wType) return ["Value should have type ".concat(wType, ", but got value of type ").concat(valueType), value];
    if (jsType && !isTypeOf(value, jsType) && !canSkipCheck) {
      return ["Value should have JS type ".concat(jsType, ", but got value of type ").concat((0, _typeof2["default"])(value)), value];
    }
    if (fieldSettings) {
      var realListValues = asyncListValues || listValues;
      if (realListValues && !fieldSettings.allowCustomValues) {
        return validateValueInList(value, realListValues, canFix, isEndValue, config.settings.removeInvalidMultiSelectValuesOnLoad);
      }
      if (fieldSettings.min != null && value < fieldSettings.min) {
        return ["Value ".concat(value, " < min ").concat(fieldSettings.min), canFix ? fieldSettings.min : value];
      }
      if (fieldSettings.max != null && value > fieldSettings.max) {
        return ["Value ".concat(value, " > max ").concat(fieldSettings.max), canFix ? fieldSettings.max : value];
      }
    }
  }
  return [null, value];
};

/**
* 
*/
var validateFieldValue = function validateFieldValue(leftField, field, value, _valueSrc, valueType, asyncListValues, config) {
  var operator = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : null;
  var isEndValue = arguments.length > 8 && arguments[8] !== undefined ? arguments[8] : false;
  var canFix = arguments.length > 9 && arguments[9] !== undefined ? arguments[9] : false;
  var fieldSeparator = config.settings.fieldSeparator;
  var isFuncArg = (0, _typeof2["default"])(field) == "object" && (field === null || field === void 0 ? void 0 : field._isFuncArg);
  var leftFieldStr = Array.isArray(leftField) ? leftField.join(fieldSeparator) : leftField;
  var rightFieldStr = Array.isArray(value) ? value.join(fieldSeparator) : value;
  var rightFieldDefinition = (0, _configUtils.getFieldConfig)(config, value);
  if (!rightFieldDefinition) return ["Unknown field ".concat(value), value];
  if (rightFieldStr == leftFieldStr && !isFuncArg) return ["Can't compare field ".concat(leftField, " with itself"), value];
  if (valueType && valueType != rightFieldDefinition.type) return ["Field ".concat(value, " is of type ").concat(rightFieldDefinition.type, ", but expected ").concat(valueType), value];
  return [null, value];
};

/**
* 
*/
var validateFuncValue = function validateFuncValue(leftField, field, value, _valueSrc, valueType, asyncListValues, config) {
  var operator = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : null;
  var isEndValue = arguments.length > 8 && arguments[8] !== undefined ? arguments[8] : false;
  var canFix = arguments.length > 9 && arguments[9] !== undefined ? arguments[9] : false;
  var fixedValue = value;
  if (value) {
    var funcKey = value.get("func");
    if (funcKey) {
      var funcConfig = (0, _configUtils.getFuncConfig)(config, funcKey);
      if (funcConfig) {
        if (valueType && funcConfig.returnType != valueType) return ["Function ".concat(funcKey, " should return value of type ").concat(funcConfig.returnType, ", but got ").concat(valueType), value];
        for (var argKey in funcConfig.args) {
          var argConfig = funcConfig.args[argKey];
          var args = fixedValue.get("args");
          var argVal = args ? args.get(argKey) : undefined;
          var argDef = (0, _configUtils.getFieldConfig)(config, argConfig);
          var argValue = argVal ? argVal.get("value") : undefined;
          var argValueSrc = argVal ? argVal.get("valueSrc") : undefined;
          if (argValue !== undefined) {
            var _validateValue = validateValue(config, leftField, argDef, operator, argValue, argConfig.type, argValueSrc, asyncListValues, canFix, isEndValue, false),
              _validateValue2 = (0, _slicedToArray2["default"])(_validateValue, 2),
              argValidError = _validateValue2[0],
              fixedArgVal = _validateValue2[1];
            if (argValidError !== null) {
              if (canFix) {
                fixedValue = fixedValue.deleteIn(["args", argKey]);
                if (argConfig.defaultValue !== undefined) {
                  fixedValue = fixedValue.setIn(["args", argKey, "value"], argConfig.defaultValue);
                  fixedValue = fixedValue.setIn(["args", argKey, "valueSrc"], "value");
                }
              } else {
                return ["Invalid value of arg ".concat(argKey, " for func ").concat(funcKey, ": ").concat(argValidError), value];
              }
            } else if (fixedArgVal !== argValue) {
              fixedValue = fixedValue.setIn(["args", argKey, "value"], fixedArgVal);
            }
          } else if (isEndValue && argConfig.defaultValue === undefined && !canFix && !argConfig.isOptional) {
            return ["Value of arg ".concat(argKey, " for func ").concat(funcKey, " is required"), value];
          }
        }
      } else return ["Unknown function ".concat(funcKey), value];
    } // else it's not function value
  } // empty value

  return [null, fixedValue];
};