"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.mongoFormatOp2 = exports.mongoFormatOp1 = exports["default"] = void 0;
var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));
var _moment = _interopRequireDefault(require("moment"));
var _export = require("../utils/export");
var _stuff = require("../utils/stuff");
var _listValues = require("../utils/listValues");
// helpers for mongo format
var mongoFormatOp1 = exports.mongoFormatOp1 = function mongoFormatOp1(mop, mc, not, field, _op, value, useExpr, valueSrc, valueType, opDef, operatorOptions, fieldDef) {
  var $field = typeof field == "string" && !field.startsWith("$") ? "$" + field : field;
  var mv = mc(value, fieldDef);
  if (mv === undefined) return undefined;
  if (not) {
    if (!useExpr && (!mop || mop == "$eq")) return (0, _defineProperty2["default"])({}, field, {
      "$ne": mv
    }); // short form
    return !useExpr ? (0, _defineProperty2["default"])({}, field, {
      "$not": (0, _defineProperty2["default"])({}, mop, mv)
    }) : {
      "$not": (0, _defineProperty2["default"])({}, mop, [$field, mv])
    };
  } else {
    if (!useExpr && (!mop || mop == "$eq")) return (0, _defineProperty2["default"])({}, field, mv); // short form
    return !useExpr ? (0, _defineProperty2["default"])({}, field, (0, _defineProperty2["default"])({}, mop, mv)) : (0, _defineProperty2["default"])({}, mop, [$field, mv]);
  }
};
var mongoFormatOp2 = exports.mongoFormatOp2 = function mongoFormatOp2(mops, not, field, _op, values, useExpr, valueSrcs, valueTypes, opDef, operatorOptions, fieldDef) {
  var $field = typeof field == "string" && !field.startsWith("$") ? "$" + field : field;
  if (not) {
    var _$not3;
    return !useExpr ? (0, _defineProperty2["default"])({}, field, {
      "$not": (_$not3 = {}, (0, _defineProperty2["default"])(_$not3, mops[0], values[0]), (0, _defineProperty2["default"])(_$not3, mops[1], values[1]), _$not3)
    }) : {
      "$not": {
        "$and": [(0, _defineProperty2["default"])({}, mops[0], [$field, values[0]]), (0, _defineProperty2["default"])({}, mops[1], [$field, values[1]])]
      }
    };
  } else {
    var _field2;
    return !useExpr ? (0, _defineProperty2["default"])({}, field, (_field2 = {}, (0, _defineProperty2["default"])(_field2, mops[0], values[0]), (0, _defineProperty2["default"])(_field2, mops[1], values[1]), _field2)) : {
      "$and": [(0, _defineProperty2["default"])({}, mops[0], [$field, values[0]]), (0, _defineProperty2["default"])({}, mops[1], [$field, values[1]])]
    };
  }
};
var ctx = {
  utils: {
    SqlString: _export.SqlString,
    moment: _moment["default"],
    mongoFormatOp1: mongoFormatOp1,
    mongoFormatOp2: mongoFormatOp2,
    mongoEmptyValue: _export.mongoEmptyValue,
    escapeRegExp: _stuff.escapeRegExp,
    sqlEmptyValue: _export.sqlEmptyValue,
    stringifyForDisplay: _export.stringifyForDisplay,
    getTitleInListValues: _listValues.getTitleInListValues,
    spelEscape: _export.spelEscape,
    spelFixList: _export.spelFixList
  }
};
var _default = exports["default"] = ctx;