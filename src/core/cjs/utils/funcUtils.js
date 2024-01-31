"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setFunc = exports.setArgValueSrc = exports.setArgValue = exports.getCompatibleArgsOnFuncChange = exports.completeFuncValue = void 0;
var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));
var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));
var _configUtils = require("../utils/configUtils");
var _ruleUtils = require("../utils/ruleUtils");
var _validation = require("../utils/validation");
var _immutable = _interopRequireDefault(require("immutable"));
// helpers
var isObject = function isObject(v) {
  return (0, _typeof2["default"])(v) == "object" && v !== null && !Array.isArray(v);
};

/**
 * @param {Immutable.Map} value
 * @param {object} config
 * @return {Immutable.Map | undefined} - undefined if func value is not complete (missing required arg vals); can return completed value != value
 */
var completeFuncValue = exports.completeFuncValue = function completeFuncValue(value, config) {
  if (!value) return undefined;
  var funcKey = value.get("func");
  var funcConfig = funcKey && (0, _configUtils.getFuncConfig)(config, funcKey);
  if (!funcConfig) return undefined;
  var complValue = value;
  var tmpHasOptional = false;
  for (var argKey in funcConfig.args) {
    var argConfig = funcConfig.args[argKey];
    var valueSources = argConfig.valueSources,
      isOptional = argConfig.isOptional,
      defaultValue = argConfig.defaultValue;
    var filteredValueSources = (0, _ruleUtils.filterValueSourcesForField)(config, valueSources, argConfig);
    var args = complValue.get("args");
    var argDefaultValueSrc = filteredValueSources.length == 1 ? filteredValueSources[0] : undefined;
    var argVal = args ? args.get(argKey) : undefined;
    var argValue = argVal ? argVal.get("value") : undefined;
    var argValueSrc = (argVal ? argVal.get("valueSrc") : undefined) || argDefaultValueSrc;
    if (argValue !== undefined) {
      var completeArgValue = (0, _ruleUtils.completeValue)(argValue, argValueSrc, config);
      if (completeArgValue === undefined) {
        return undefined;
      } else if (completeArgValue !== argValue) {
        complValue = complValue.setIn(["args", argKey, "value"], completeArgValue);
      }
      if (tmpHasOptional) {
        // has gap
        return undefined;
      }
    } else if (defaultValue !== undefined && !isObject(defaultValue)) {
      complValue = complValue.setIn(["args", argKey, "value"], getDefaultArgValue(argConfig));
      complValue = complValue.setIn(["args", argKey, "valueSrc"], "value");
    } else if (isOptional) {
      // optional
      tmpHasOptional = true;
    } else {
      // missing value
      return undefined;
    }
  }
  return complValue;
};

/**
 * @param {Immutable.Map} value 
 * @return {array} - [usedFields, badFields]
 */
// const getUsedFieldsInFuncValue = (value, config) => {
//   let usedFields = [];
//   let badFields = [];

//   const _traverse = (value) => {
//     const args = value && value.get("args");
//     if (!args) return;
//     for (const arg of args.values()) {
//       if (arg.get("valueSrc") == "field") {
//         const rightField = arg.get("value");
//         if (rightField) {
//           const rightFieldDefinition = config ? getFieldConfig(config, rightField) : undefined;
//           if (config && !rightFieldDefinition)
//             badFields.push(rightField);
//           else
//             usedFields.push(rightField);
//         }
//       } else if (arg.get("valueSrc") == "func") {
//         _traverse(arg.get("value"));
//       }
//     }
//   };

//   _traverse(value);

//   return [usedFields, badFields];
// };

/**
 * Used @ FuncWidget
 * @param {Immutable.Map} value 
 * @param {string} funcKey 
 * @param {object} config 
 */
var setFunc = exports.setFunc = function setFunc(value, funcKey, config) {
  var fieldSeparator = config.settings.fieldSeparator;
  value = value || new _immutable["default"].Map();
  if (Array.isArray(funcKey)) {
    // fix for cascader
    funcKey = funcKey.join(fieldSeparator);
  }
  var oldFuncKey = value.get("func");
  var oldArgs = value.get("args");
  value = value.set("func", funcKey);
  var funcConfig = funcKey && (0, _configUtils.getFuncConfig)(config, funcKey);
  var newFuncSignature = funcKey && (0, _configUtils.getFuncSignature)(config, funcKey);
  var oldFuncSignature = oldFuncKey && (0, _configUtils.getFuncSignature)(config, oldFuncKey);
  var keepArgsKeys = getCompatibleArgsOnFuncChange(oldFuncSignature, newFuncSignature, oldArgs, config);
  if (keepArgsKeys.length) {
    var argsKeys = Object.keys(newFuncSignature.args);
    var deleteArgsKeys = argsKeys.filter(function (k) {
      return !keepArgsKeys.includes(k);
    });
    value = deleteArgsKeys.reduce(function (value, k) {
      return value.deleteIn(["args", k]);
    }, value);
  } else {
    value = value.set("args", new _immutable["default"].Map());
  }

  // defaults
  if (funcConfig) {
    for (var argKey in funcConfig.args) {
      var argConfig = funcConfig.args[argKey];
      var valueSources = argConfig.valueSources,
        defaultValue = argConfig.defaultValue;
      var filteredValueSources = (0, _ruleUtils.filterValueSourcesForField)(config, valueSources, argConfig);
      var firstValueSrc = filteredValueSources.length ? filteredValueSources[0] : undefined;
      var defaultValueSrc = defaultValue ? isObject(defaultValue) && !!defaultValue.func ? "func" : "value" : undefined;
      var argDefaultValueSrc = defaultValueSrc || firstValueSrc;
      var hasValue = value.getIn(["args", argKey]);
      if (!hasValue) {
        if (defaultValue !== undefined) {
          value = value.setIn(["args", argKey, "value"], getDefaultArgValue(argConfig));
        }
        if (argDefaultValueSrc) {
          value = value.setIn(["args", argKey, "valueSrc"], argDefaultValueSrc);
        }
      }
    }
  }
  return value;
};
var getDefaultArgValue = function getDefaultArgValue(_ref) {
  var value = _ref.defaultValue;
  if (isObject(value) && !_immutable["default"].Map.isMap(value) && value.func) {
    return _immutable["default"].fromJS(value, function (k, v) {
      return _immutable["default"].Iterable.isIndexed(v) ? v.toList() : v.toOrderedMap();
    });
  }
  return value;
};

/**
* Used @ FuncWidget
* @param {Immutable.Map} value 
* @param {string} argKey 
* @param {*} argVal 
* @param {object} argConfig 
*/
var setArgValue = exports.setArgValue = function setArgValue(value, argKey, argVal, argConfig, config) {
  if (value && value.get("func")) {
    value = value.setIn(["args", argKey, "value"], argVal);

    // set default arg value source
    var valueSrc = value.getIn(["args", argKey, "valueSrc"]);
    var valueSources = argConfig.valueSources;
    var filteredValueSources = (0, _ruleUtils.filterValueSourcesForField)(config, valueSources, argConfig);
    var argDefaultValueSrc = filteredValueSources.length == 1 ? filteredValueSources[0] : undefined;
    if (!argDefaultValueSrc && filteredValueSources.includes("value")) {
      argDefaultValueSrc = "value";
    }
    if (!valueSrc && argDefaultValueSrc) {
      value = value.setIn(["args", argKey, "valueSrc"], argDefaultValueSrc);
    }
  }
  return value;
};

/**
* Used @ FuncWidget
* @param {Immutable.Map} value 
* @param {string} argKey 
* @param {string} argValSrc 
* @param {object} argConfig 
*/
var setArgValueSrc = exports.setArgValueSrc = function setArgValueSrc(value, argKey, argValSrc, _argConfig, _config) {
  if (value && value.get("func")) {
    value = value.setIn(["args", argKey], new _immutable["default"].Map({
      valueSrc: argValSrc
    }));
  }
  return value;
};

// see getFuncSignature in configUtils
var getCompatibleArgsOnFuncChange = exports.getCompatibleArgsOnFuncChange = function getCompatibleArgsOnFuncChange(s1, s2, argVals, config) {
  if ((s1 === null || s1 === void 0 ? void 0 : s1.returnType) != (s2 === null || s2 === void 0 ? void 0 : s2.returnType)) return [];
  var checkIndexes = false;
  var keys = Object.keys(s2.args);
  var compatibleKeys = keys.filter(function (k, i) {
    var arg2 = s2.args[k];
    var arg1 = s1.args[k];
    var oldInd = Object.keys(s1.args).indexOf(k);
    if (!arg1 && (arg2.defaultValue !== undefined || arg2.isOptional)) {
      return true;
    }
    if (checkIndexes && i !== oldInd) {
      return false;
    }
    if ((arg1 === null || arg1 === void 0 ? void 0 : arg1.type) != arg2.type) return false;
    if (_ruleUtils.selectTypes.includes(arg2.type)) {
      if (!arg1.listValuesType || arg1.listValuesType !== arg2.listValuesType) return false;
    }
    if (argVals) {
      var argVal = argVals.get(k);
      var argValue = argVal === null || argVal === void 0 ? void 0 : argVal.get("value");
      var argValueSrc = argVal === null || argVal === void 0 ? void 0 : argVal.get("valueSrc");
      if (arg2.valueSources && !arg2.valueSources.includes(argValueSrc)) return false;
      var leftField = null,
        operator = null,
        argDef = arg2,
        asyncListValues = null,
        canFix = false,
        isEndValue = true;
      var _validateValue = (0, _validation.validateValue)(config, leftField, argDef, operator, argValue, argDef.type, argValueSrc, asyncListValues, canFix, isEndValue, false),
        _validateValue2 = (0, _slicedToArray2["default"])(_validateValue, 2),
        argValidError = _validateValue2[0],
        _fixedArgVal = _validateValue2[1];
      if (argValidError) return false;
    }
    return true;
  });
  return compatibleKeys;
};