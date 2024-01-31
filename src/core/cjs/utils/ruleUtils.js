"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.selectTypes = exports.isEmptyRuleProperties = exports.isEmptyRuleGroupExtPropertiesAndChildren = exports.isEmptyItem = exports.isEmptyGroupChildren = exports.isCompletedValue = exports.getWidgetsForFieldOp = exports.getWidgetForFieldOp = exports.getValueSourcesForFieldOp = exports.getValueLabel = exports.getOperatorsForType = exports.getOperatorsForField = exports.getNewValueForFieldOp = exports.getFuncPathLabels = exports.getFirstOperator = exports.getFirstField = exports.getFieldPathLabels = exports.getFieldPartsConfigs = exports.formatFieldName = exports.filterValueSourcesForField = exports.completeValue = void 0;
var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));
var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));
var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));
var _configUtils = require("./configUtils");
var _stuff = require("../utils/stuff");
var _immutable = _interopRequireDefault(require("immutable"));
var _validation = require("../utils/validation");
var _last = _interopRequireDefault(require("lodash/last"));
var _funcUtils = require("./funcUtils");
var selectTypes = exports.selectTypes = ["select", "multiselect", "treeselect", "treemultiselect"];

/**
 * @param {object} config
 * @param {object} oldConfig
 * @param {Immutable.Map} current
 * @param {string} newField
 * @param {string} newOperator
 * @param {string} changedProp
 * @return {object} - {canReuseValue, newValue, newValueSrc, newValueType, newValueError}
 */
var getNewValueForFieldOp = exports.getNewValueForFieldOp = function getNewValueForFieldOp(config) {
  var oldConfig = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
  var current = arguments.length > 2 ? arguments[2] : undefined;
  var newField = arguments.length > 3 ? arguments[3] : undefined;
  var newOperator = arguments.length > 4 ? arguments[4] : undefined;
  var changedProp = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : null;
  var canFix = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : true;
  var isEndValue = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : false;
  if (!oldConfig) oldConfig = config;
  var keepInputOnChangeFieldSrc = config.settings.keepInputOnChangeFieldSrc;
  var currentField = current.get("field");
  var currentFieldType = current.get("fieldType");
  //const currentFieldSrc = current.get("fieldSrc");
  var currentOperator = current.get("operator");
  var currentValue = current.get("value");
  var currentValueSrc = current.get("valueSrc", new _immutable["default"].List());
  var currentValueType = current.get("valueType", new _immutable["default"].List());
  var currentAsyncListValues = current.get("asyncListValues");

  //const isValidatingTree = (changedProp === null);
  var _config$settings = config.settings,
    convertableWidgets = _config$settings.convertableWidgets,
    clearValueOnChangeField = _config$settings.clearValueOnChangeField,
    clearValueOnChangeOp = _config$settings.clearValueOnChangeOp,
    showErrorMessage = _config$settings.showErrorMessage;

  //const currentOperatorConfig = getOperatorConfig(oldConfig, currentOperator);
  var newOperatorConfig = (0, _configUtils.getOperatorConfig)(config, newOperator, newField);
  //const currentOperatorCardinality = currentOperator ? defaultValue(currentOperatorConfig.cardinality, 1) : null;
  var operatorCardinality = newOperator ? (0, _stuff.defaultValue)(newOperatorConfig.cardinality, 1) : null;
  var currentFieldConfig = (0, _configUtils.getFieldConfig)(oldConfig, currentField);
  var newFieldConfig = (0, _configUtils.getFieldConfig)(config, newField);
  var isOkWithoutField = !currentField && currentFieldType && keepInputOnChangeFieldSrc;
  var currentType = (currentFieldConfig === null || currentFieldConfig === void 0 ? void 0 : currentFieldConfig.type) || currentFieldType;
  var newType = (newFieldConfig === null || newFieldConfig === void 0 ? void 0 : newFieldConfig.type) || !newField && isOkWithoutField && currentType;
  var canReuseValue = (currentField || isOkWithoutField) && currentOperator && newOperator && currentValue != undefined;
  canReuseValue = canReuseValue && (!changedProp || changedProp == "field" && !clearValueOnChangeField || changedProp == "operator" && !clearValueOnChangeOp);
  canReuseValue = canReuseValue && currentType && newType && currentType == newType;
  if (canReuseValue && selectTypes.includes(newType) && changedProp == "field") {
    var newListValuesType = newFieldConfig === null || newFieldConfig === void 0 ? void 0 : newFieldConfig.listValuesType;
    var currentListValuesType = currentFieldConfig === null || currentFieldConfig === void 0 ? void 0 : currentFieldConfig.listValuesType;
    if (newListValuesType && newListValuesType === currentListValuesType) {
      // ok
    } else {
      // different fields of select types has different listValues
      canReuseValue = false;
    }
  }

  // compare old & new widgets
  for (var i = 0; i < operatorCardinality; i++) {
    var vs = currentValueSrc.get(i) || null;
    var currentWidget = getWidgetForFieldOp(oldConfig, currentField, currentOperator, vs);
    var newWidget = getWidgetForFieldOp(config, newField, newOperator, vs);
    // need to also check value widgets if we changed operator and current value source was 'field'
    // cause for select type op '=' requires single value and op 'in' requires array value
    var currentValueWidget = vs == "value" ? currentWidget : getWidgetForFieldOp(oldConfig, currentField, currentOperator, "value");
    var newValueWidget = vs == "value" ? newWidget : getWidgetForFieldOp(config, newField, newOperator, "value");
    var canReuseWidget = newValueWidget == currentValueWidget || (convertableWidgets[currentValueWidget] || []).includes(newValueWidget) || !currentValueWidget && isOkWithoutField;
    if (!canReuseWidget) {
      canReuseValue = false;
    }
  }
  if (currentOperator != newOperator && [currentOperator, newOperator].includes("proximity")) canReuseValue = false;
  var firstWidgetConfig = (0, _configUtils.getFieldWidgetConfig)(config, newField, newOperator, null, currentValueSrc.first());
  var valueSources = getValueSourcesForFieldOp(config, newField, newOperator, null);
  if (!newField && isOkWithoutField) {
    valueSources = Object.keys(config.settings.valueSourcesInfo);
  }
  var valueFixes = {};
  var valueErrors = Array.from({
    length: operatorCardinality
  }, function () {
    return null;
  });
  if (canReuseValue) {
    var _loop = function _loop() {
      var v = currentValue.get(_i);
      var vType = currentValueType.get(_i) || null;
      var vSrc = currentValueSrc.get(_i) || null;
      var isValidSrc = valueSources.find(function (v) {
        return v == vSrc;
      }) != null;
      if (!isValidSrc && _i > 0 && vSrc == null) isValidSrc = true; // make exception for range widgets (when changing op from '==' to 'between')
      var asyncListValues = currentAsyncListValues;
      var _validateValue = (0, _validation.validateValue)(config, newField, newField, newOperator, v, vType, vSrc, asyncListValues, canFix, isEndValue, true),
        _validateValue2 = (0, _slicedToArray2["default"])(_validateValue, 2),
        validateError = _validateValue2[0],
        fixedValue = _validateValue2[1];
      var isValid = !validateError;
      // Allow bad value with error message
      // But not on field change - in that case just drop bad value that can't be reused
      // ? Maybe we should also drop bad value on op change?
      // For bad multiselect value we have both error message + fixed value.
      //  If we show error message, it will gone on next tree validation
      var fixValue = fixedValue !== v;
      var dropValue = !isValidSrc || !isValid && (changedProp == "field" || !showErrorMessage && !fixValue);
      var showValueError = !!validateError && showErrorMessage && !dropValue && !fixValue;
      if (showValueError) {
        valueErrors[_i] = validateError;
      }
      if (fixValue) {
        valueFixes[_i] = fixedValue;
      }
      if (dropValue) {
        canReuseValue = false;
        return 1; // break
      }
    };
    for (var _i = 0; _i < operatorCardinality; _i++) {
      if (_loop()) break;
    }
  }

  // reuse value OR get defaultValue for cardinality 1 (it means default range values is not supported yet, todo)
  var newValue = null,
    newValueSrc = null,
    newValueType = null,
    newValueError = null;
  newValue = new _immutable["default"].List(Array.from({
    length: operatorCardinality
  }, function (_ignore, i) {
    var v = undefined;
    if (canReuseValue) {
      if (i < currentValue.size) {
        v = currentValue.get(i);
        if (valueFixes[i] !== undefined) {
          v = valueFixes[i];
        }
      }
    } else if (operatorCardinality == 1) {
      var _newFieldConfig$field;
      v = (0, _stuff.getFirstDefined)([newFieldConfig === null || newFieldConfig === void 0 ? void 0 : newFieldConfig.defaultValue, newFieldConfig === null || newFieldConfig === void 0 || (_newFieldConfig$field = newFieldConfig.fieldSettings) === null || _newFieldConfig$field === void 0 ? void 0 : _newFieldConfig$field.defaultValue, firstWidgetConfig === null || firstWidgetConfig === void 0 ? void 0 : firstWidgetConfig.defaultValue]);
    }
    return v;
  }));
  newValueSrc = new _immutable["default"].List(Array.from({
    length: operatorCardinality
  }, function (_ignore, i) {
    var vs = null;
    if (canReuseValue) {
      if (i < currentValueSrc.size) vs = currentValueSrc.get(i);
    } else if (valueSources.length == 1) {
      vs = valueSources[0];
    } else if (valueSources.length > 1) {
      vs = valueSources[0];
    }
    return vs;
  }));
  if (showErrorMessage) {
    if (newOperatorConfig && newOperatorConfig.validateValues && newValueSrc.toJS().filter(function (vs) {
      return vs == "value" || vs == null;
    }).length == operatorCardinality) {
      // last element in `valueError` list is for range validation error
      var jsValues = firstWidgetConfig && firstWidgetConfig.toJS ? newValue.toJS().map(function (v) {
        return firstWidgetConfig.toJS.call(config.ctx, v, firstWidgetConfig);
      }) : newValue.toJS();
      var rangeValidateError = newOperatorConfig.validateValues(jsValues);
      if (showErrorMessage) {
        valueErrors.push(rangeValidateError);
      }
    }
    newValueError = new _immutable["default"].List(valueErrors);
  }
  newValueType = new _immutable["default"].List(Array.from({
    length: operatorCardinality
  }, function (_ignore, i) {
    var vt = null;
    if (canReuseValue) {
      if (i < currentValueType.size) vt = currentValueType.get(i);
    } else if (operatorCardinality == 1 && firstWidgetConfig && firstWidgetConfig.type !== undefined) {
      vt = firstWidgetConfig.type;
    } else if (operatorCardinality == 1 && newFieldConfig && newFieldConfig.type !== undefined) {
      vt = newFieldConfig.type == "!group" ? "number" : newFieldConfig.type;
    }
    return vt;
  }));
  return {
    canReuseValue: canReuseValue,
    newValue: newValue,
    newValueSrc: newValueSrc,
    newValueType: newValueType,
    newValueError: newValueError,
    operatorCardinality: operatorCardinality
  };
};
var getFirstField = exports.getFirstField = function getFirstField(config) {
  var parentRuleGroupPath = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
  var fieldSeparator = config.settings.fieldSeparator;
  var parentPathArr = (0, _configUtils.getFieldParts)(parentRuleGroupPath, config);
  var parentField = parentRuleGroupPath ? (0, _configUtils.getFieldRawConfig)(config, parentRuleGroupPath) : config;
  var firstField = parentField,
    key = null,
    keysPath = [];
  do {
    var _firstField;
    var subfields = firstField === config ? config.fields : (_firstField = firstField) === null || _firstField === void 0 ? void 0 : _firstField.subfields;
    if (!subfields || !Object.keys(subfields).length) {
      firstField = key = null;
      break;
    }
    key = Object.keys(subfields)[0];
    keysPath.push(key);
    firstField = subfields[key];
  } while (firstField.type == "!struct" || firstField.type == "!group");
  return (parentPathArr || []).concat(keysPath).join(fieldSeparator);
};
var getOperatorsForType = exports.getOperatorsForType = function getOperatorsForType(config, fieldType) {
  var _config$types$fieldTy;
  return ((_config$types$fieldTy = config.types[fieldType]) === null || _config$types$fieldTy === void 0 ? void 0 : _config$types$fieldTy.operators) || null;
};
var getOperatorsForField = exports.getOperatorsForField = function getOperatorsForField(config, field) {
  var fieldConfig = (0, _configUtils.getFieldConfig)(config, field);
  var fieldOps = fieldConfig ? fieldConfig.operators : [];
  return fieldOps;
};
var getFirstOperator = exports.getFirstOperator = function getFirstOperator(config, field) {
  var _fieldOps$;
  var fieldOps = getOperatorsForField(config, field);
  return (_fieldOps$ = fieldOps === null || fieldOps === void 0 ? void 0 : fieldOps[0]) !== null && _fieldOps$ !== void 0 ? _fieldOps$ : null;
};
var getFuncPathLabels = exports.getFuncPathLabels = function getFuncPathLabels(field, config) {
  var parentField = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
  return getFieldPathLabels(field, config, parentField, "funcs", "subfields");
};
var getFieldPathLabels = exports.getFieldPathLabels = function getFieldPathLabels(field, config) {
  var parentField = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
  var fieldsKey = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : "fields";
  var subfieldsKey = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : "subfields";
  if (!field) return null;
  var fieldSeparator = config.settings.fieldSeparator;
  var parts = (0, _configUtils.getFieldParts)(field, config);
  var parentParts = (0, _configUtils.getFieldParts)(parentField, config);
  var res = parts.slice(parentParts.length).map(function (_curr, ind, arr) {
    return arr.slice(0, ind + 1);
  }).map(function (parts) {
    return [].concat((0, _toConsumableArray2["default"])(parentParts), (0, _toConsumableArray2["default"])(parts)).join(fieldSeparator);
  }).map(function (part) {
    var cnf = (0, _configUtils.getFieldRawConfig)(config, part, fieldsKey, subfieldsKey);
    return cnf && cnf.label || (0, _last["default"])(part.split(fieldSeparator));
  }).filter(function (label) {
    return label != null;
  });
  return res;
};
var getFieldPartsConfigs = exports.getFieldPartsConfigs = function getFieldPartsConfigs(field, config) {
  var parentField = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
  if (!field) return null;
  var parentFieldDef = parentField && (0, _configUtils.getFieldRawConfig)(config, parentField) || null;
  var fieldSeparator = config.settings.fieldSeparator;
  var parts = (0, _configUtils.getFieldParts)(field, config);
  var isDescendant = (0, _configUtils.isFieldDescendantOfField)(field, parentField, config);
  var parentParts = !isDescendant ? [] : (0, _configUtils.getFieldParts)(parentField, config);
  return parts.slice(parentParts.length).map(function (_curr, ind, arr) {
    return arr.slice(0, ind + 1);
  }).map(function (parts) {
    return {
      part: [].concat((0, _toConsumableArray2["default"])(parentParts), (0, _toConsumableArray2["default"])(parts)).join(fieldSeparator),
      key: parts[parts.length - 1]
    };
  }).map(function (_ref) {
    var part = _ref.part,
      key = _ref.key;
    var cnf = (0, _configUtils.getFieldRawConfig)(config, part);
    return {
      key: key,
      cnf: cnf
    };
  }).map(function (_ref2, ind, arr) {
    var key = _ref2.key,
      cnf = _ref2.cnf;
    var parentCnf = ind > 0 ? arr[ind - 1].cnf : parentFieldDef;
    return [key, cnf, parentCnf];
  });
};
var getValueLabel = exports.getValueLabel = function getValueLabel(config, field, operator, delta) {
  var valueSrc = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : null;
  var isSpecialRange = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : false;
  var isFuncArg = field && (0, _typeof2["default"])(field) == "object" && !!field.func && !!field.arg;
  var showLabels = config.settings.showLabels;
  var fieldConfig = (0, _configUtils.getFieldConfig)(config, field);
  var fieldWidgetConfig = (0, _configUtils.getFieldWidgetConfig)(config, field, operator, null, valueSrc) || {};
  var mergedOpConfig = (0, _configUtils.getOperatorConfig)(config, operator, field) || {};
  var cardinality = isSpecialRange ? 1 : mergedOpConfig.cardinality;
  var ret = null;
  if (cardinality > 1) {
    var valueLabels = fieldWidgetConfig.valueLabels || mergedOpConfig.valueLabels;
    if (valueLabels) ret = valueLabels[delta];
    if (ret && (0, _typeof2["default"])(ret) != "object") {
      ret = {
        label: ret,
        placeholder: ret
      };
    }
    if (!ret) {
      ret = {
        label: config.settings.valueLabel + " " + (delta + 1),
        placeholder: config.settings.valuePlaceholder + " " + (delta + 1)
      };
    }
  } else {
    var label = fieldWidgetConfig.valueLabel;
    var placeholder = fieldWidgetConfig.valuePlaceholder;
    if (isFuncArg) {
      if (!label) label = fieldConfig.label || field.arg;
      if (!placeholder && !showLabels) placeholder = fieldConfig.label || field.arg;
    }
    ret = {
      label: label || config.settings.valueLabel,
      placeholder: placeholder || config.settings.valuePlaceholder
    };
  }
  return ret;
};
function _getWidgetsAndSrcsForFieldOp(config, field) {
  var operator = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
  var valueSrc = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
  var widgets = [];
  var valueSrcs = [];
  if (!field) return {
    widgets: widgets,
    valueSrcs: valueSrcs
  };
  var isFuncArg = (0, _typeof2["default"])(field) == "object" && (!!field.func && !!field.arg || field._isFuncArg);
  var fieldConfig = (0, _configUtils.getFieldConfig)(config, field);
  var opConfig = operator ? config.operators[operator] : null;
  if (fieldConfig !== null && fieldConfig !== void 0 && fieldConfig.widgets) {
    var _loop2 = function _loop2() {
      var widgetConfig = fieldConfig.widgets[widget];
      if (!config.widgets[widget]) {
        return 1; // continue
      }
      var widgetValueSrc = config.widgets[widget].valueSrc || "value";
      var canAdd = true;
      if (widget == "field") {
        canAdd = canAdd && filterValueSourcesForField(config, ["field"], fieldConfig).length > 0;
      }
      if (widget == "func") {
        canAdd = canAdd && filterValueSourcesForField(config, ["func"], fieldConfig).length > 0;
      }
      // If can't check operators, don't add
      // Func args don't have operators
      if (valueSrc == "value" && !widgetConfig.operators && !isFuncArg && field != "!case_value") canAdd = false;
      if (widgetConfig.operators && operator) canAdd = canAdd && widgetConfig.operators.indexOf(operator) != -1;
      if (valueSrc && valueSrc != widgetValueSrc && valueSrc != "const") canAdd = false;
      if (opConfig && opConfig.cardinality == 0 && widgetValueSrc != "value") canAdd = false;
      if (canAdd) {
        var _fieldConfig$valueSou, _opConfig$valueSource;
        widgets.push(widget);
        var canAddValueSrc = ((_fieldConfig$valueSou = fieldConfig.valueSources) === null || _fieldConfig$valueSou === void 0 ? void 0 : _fieldConfig$valueSou.indexOf(widgetValueSrc)) != -1;
        if ((opConfig === null || opConfig === void 0 || (_opConfig$valueSource = opConfig.valueSources) === null || _opConfig$valueSource === void 0 ? void 0 : _opConfig$valueSource.indexOf(widgetValueSrc)) == -1) canAddValueSrc = false;
        if (canAddValueSrc && !valueSrcs.find(function (v) {
          return v == widgetValueSrc;
        })) valueSrcs.push(widgetValueSrc);
      }
    };
    for (var widget in fieldConfig.widgets) {
      if (_loop2()) continue;
    }
  }
  var widgetWeight = function widgetWeight(w) {
    var wg = 0;
    if (fieldConfig.preferWidgets) {
      if (fieldConfig.preferWidgets.includes(w)) wg += 10 - fieldConfig.preferWidgets.indexOf(w);
    } else if (w == fieldConfig.mainWidget) {
      wg += 100;
    }
    if (w == "field") {
      wg -= 1;
    }
    if (w == "func") {
      wg -= 2;
    }
    return wg;
  };
  widgets.sort(function (w1, w2) {
    return widgetWeight(w2) - widgetWeight(w1);
  });
  return {
    widgets: widgets,
    valueSrcs: valueSrcs
  };
}
var getWidgetsForFieldOp = exports.getWidgetsForFieldOp = function getWidgetsForFieldOp(config, field, operator) {
  var valueSrc = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
  var _getWidgetsAndSrcsFor = _getWidgetsAndSrcsForFieldOp(config, field, operator, valueSrc),
    widgets = _getWidgetsAndSrcsFor.widgets;
  return widgets;
};
var filterValueSourcesForField = exports.filterValueSourcesForField = function filterValueSourcesForField(config, valueSrcs, fieldDefinition) {
  var _fieldDefinition$type;
  if (!fieldDefinition) return valueSrcs;
  var fieldType = (_fieldDefinition$type = fieldDefinition.type) !== null && _fieldDefinition$type !== void 0 ? _fieldDefinition$type : fieldDefinition.returnType;
  if (!valueSrcs) valueSrcs = Object.keys(config.settings.valueSourcesInfo);
  return valueSrcs.filter(function (vs) {
    var canAdd = true;
    if (vs == "field") {
      if (config.__fieldsCntByType) {
        // tip: LHS field can be used as arg in RHS function
        var minCnt = fieldDefinition._isFuncArg ? 0 : 1;
        canAdd = canAdd && config.__fieldsCntByType[fieldType] > minCnt;
      }
    }
    if (vs == "func") {
      if (config.__funcsCntByType) canAdd = canAdd && !!config.__funcsCntByType[fieldType];
      if (fieldDefinition.funcs) canAdd = canAdd && fieldDefinition.funcs.length > 0;
    }
    return canAdd;
  });
};
var getValueSourcesForFieldOp = exports.getValueSourcesForFieldOp = function getValueSourcesForFieldOp(config, field, operator) {
  var fieldDefinition = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
  var _getWidgetsAndSrcsFor2 = _getWidgetsAndSrcsForFieldOp(config, field, operator, null),
    valueSrcs = _getWidgetsAndSrcsFor2.valueSrcs;
  var filteredValueSrcs = filterValueSourcesForField(config, valueSrcs, fieldDefinition);
  return filteredValueSrcs;
};
var getWidgetForFieldOp = exports.getWidgetForFieldOp = function getWidgetForFieldOp(config, field, operator) {
  var valueSrc = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
  var _getWidgetsAndSrcsFor3 = _getWidgetsAndSrcsForFieldOp(config, field, operator, valueSrc),
    widgets = _getWidgetsAndSrcsFor3.widgets;
  var widget = null;
  if (widgets.length) widget = widgets[0];
  return widget;
};

// can use alias (fieldName)
// even if `parentField` is provided, `field` is still a full path
var formatFieldName = exports.formatFieldName = function formatFieldName(field, config, meta) {
  var parentField = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
  var options = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};
  if (!field) return;
  var fieldDef = (0, _configUtils.getFieldConfig)(config, field) || {};
  var fieldSeparator = config.settings.fieldSeparator;
  var fieldParts = (0, _configUtils.getFieldParts)(field, config);
  var fieldName = Array.isArray(field) ? field.join(fieldSeparator) : field;
  if (options !== null && options !== void 0 && options.useTableName && fieldDef.tableName) {
    // legacy
    var fieldPartsCopy = (0, _toConsumableArray2["default"])(fieldParts);
    fieldPartsCopy[0] = fieldDef.tableName;
    fieldName = fieldPartsCopy.join(fieldSeparator);
  }
  if (fieldDef.fieldName) {
    fieldName = fieldDef.fieldName;
  }
  if (parentField) {
    var parentFieldDef = (0, _configUtils.getFieldConfig)(config, parentField) || {};
    var parentFieldName = parentField;
    if (fieldName.indexOf(parentFieldName + fieldSeparator) == 0) {
      fieldName = fieldName.slice((parentFieldName + fieldSeparator).length);
      // fieldName = "#this." + fieldName; // ? for spel
    } else {
      if (fieldDef.fieldName) {
        // ignore
      } else {
        meta.errors.push("Can't cut group ".concat(parentFieldName, " from field ").concat(fieldName));
      }
    }
  }
  return fieldName;
};
var isEmptyItem = exports.isEmptyItem = function isEmptyItem(item, config) {
  var liteCheck = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
  var type = item.get("type");
  var mode = item.getIn(["properties", "mode"]);
  if (type == "rule_group" && mode == "array") {
    return isEmptyRuleGroupExt(item, config, liteCheck);
  } else if (type == "group" || type == "rule_group") {
    return isEmptyGroup(item, config, liteCheck);
  } else {
    return isEmptyRule(item, config, liteCheck);
  }
};
var isEmptyRuleGroupExt = function isEmptyRuleGroupExt(item, config) {
  var liteCheck = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
  var children = item.get("children1");
  var properties = item.get("properties");
  return isEmptyRuleGroupExtPropertiesAndChildren(properties.toObject(), children, config, liteCheck);
};
var isEmptyRuleGroupExtPropertiesAndChildren = exports.isEmptyRuleGroupExtPropertiesAndChildren = function isEmptyRuleGroupExtPropertiesAndChildren(properties, children, config) {
  var _config$operators$ope, _config$operators$ope2;
  var liteCheck = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
  var operator = properties.operator;
  var cardinality = (_config$operators$ope = (_config$operators$ope2 = config.operators[operator]) === null || _config$operators$ope2 === void 0 ? void 0 : _config$operators$ope2.cardinality) !== null && _config$operators$ope !== void 0 ? _config$operators$ope : 1;
  var filledParts = [!isEmptyRuleProperties(properties, config, false), cardinality > 0 ? true : !isEmptyGroupChildren(children, config, liteCheck)];
  var filledCnt = filledParts.filter(function (f) {
    return !!f;
  }).length;
  var isFilled = filledCnt == 2;
  return !isFilled;
};
var isEmptyGroup = function isEmptyGroup(group, config) {
  var liteCheck = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
  var children = group.get("children1");
  return isEmptyGroupChildren(children, config, liteCheck);
};
var isEmptyGroupChildren = exports.isEmptyGroupChildren = function isEmptyGroupChildren(children, config) {
  var liteCheck = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
  return !children || children.size == 0 || children.size > 0 && children.filter(function (ch) {
    return !isEmptyItem(ch, config, liteCheck);
  }).size == 0;
};
var isEmptyRuleProperties = exports.isEmptyRuleProperties = function isEmptyRuleProperties(_ref3, config) {
  var _config$operators$ope3, _config$operators$ope4;
  var field = _ref3.field,
    fieldSrc = _ref3.fieldSrc,
    fieldType = _ref3.fieldType,
    operator = _ref3.operator,
    value = _ref3.value,
    valueSrc = _ref3.valueSrc,
    valueType = _ref3.valueType;
  var liteCheck = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
  var cardinality = (_config$operators$ope3 = (_config$operators$ope4 = config.operators[operator]) === null || _config$operators$ope4 === void 0 ? void 0 : _config$operators$ope4.cardinality) !== null && _config$operators$ope3 !== void 0 ? _config$operators$ope3 : 1;
  var filledParts = [liteCheck ? field !== null || fieldType != null : isCompletedValue(field, fieldSrc, config, liteCheck), !!operator, value.filter(function (val, delta) {
    var _valueSrc$get;
    return isCompletedValue(val, (valueSrc === null || valueSrc === void 0 || (_valueSrc$get = valueSrc.get) === null || _valueSrc$get === void 0 ? void 0 : _valueSrc$get.call(valueSrc, delta)) || (valueSrc === null || valueSrc === void 0 ? void 0 : valueSrc[delta]), config, liteCheck);
  }).size >= cardinality];
  var filledCnt = filledParts.filter(function (f) {
    return !!f;
  }).length;
  var isFilled = filledCnt == 3;
  return !isFilled;
};
var isEmptyRule = function isEmptyRule(rule, config) {
  var liteCheck = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
  var properties = rule.get("properties");
  return isEmptyRuleProperties(properties.toObject(), config, liteCheck);
};
var isCompletedValue = exports.isCompletedValue = function isCompletedValue(value, valueSrc, config) {
  var liteCheck = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
  if (!liteCheck && valueSrc == "func" && value) {
    var funcKey = value.get("func");
    var funcConfig = (0, _configUtils.getFuncConfig)(config, funcKey);
    if (funcConfig) {
      var args = value.get("args");
      for (var argKey in funcConfig.args) {
        var argConfig = funcConfig.args[argKey];
        var argVal = args ? args.get(argKey) : undefined;
        // const argDef = getFieldConfig(config, argConfig);
        var argValue = argVal ? argVal.get("value") : undefined;
        var argValueSrc = argVal ? argVal.get("valueSrc") : undefined;
        if (argValue == undefined && (argConfig === null || argConfig === void 0 ? void 0 : argConfig.defaultValue) === undefined && !(argConfig !== null && argConfig !== void 0 && argConfig.isOptional)) {
          // arg is not completed
          return false;
        }
        if (argValue != undefined) {
          if (!isCompletedValue(argValue, argValueSrc, config, liteCheck)) {
            // arg is complex and is not completed
            return false;
          }
        }
      }
      // all args are completed
      return true;
    }
  }
  return value != undefined;
};

/**
 * @param {*} value
 * @param {string} valueSrc - 'value' | 'field' | 'func'
 * @param {object} config
 * @return {* | undefined} - undefined if func value is not complete (missing required arg vals); can return completed value != value
 */
var completeValue = exports.completeValue = function completeValue(value, valueSrc, config) {
  if (valueSrc == "func") return (0, _funcUtils.completeFuncValue)(value, config);else return value;
};