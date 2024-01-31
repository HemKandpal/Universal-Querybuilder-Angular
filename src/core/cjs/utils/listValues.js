"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.toListValue = exports.searchListValue = exports.mapListValues = exports.makeCustomListValue = exports.listValuesToArray = exports.getValueInListValues = exports.getTitleInListValues = exports.getListValue = exports.getItemInListValues = void 0;
var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));
var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));
function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { (0, _defineProperty2["default"])(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
var isObject = function isObject(v) {
  return (0, _typeof2["default"])(v) == "object" && v !== null && !Array.isArray(v);
};
var toListValue = exports.toListValue = function toListValue(v, title) {
  if (v == null || v == "") {
    return undefined;
  } else if (isObject(v)) {
    return v;
  } else {
    return {
      value: v,
      title: title !== undefined ? title : "" + v
    };
  }
};
var makeCustomListValue = exports.makeCustomListValue = function makeCustomListValue(v) {
  var lv = toListValue(v);
  if (isObject(lv)) {
    return _objectSpread(_objectSpread({}, toListValue(v)), {}, {
      isCustom: true
    });
  } else {
    // only if undefined
    return lv;
  }
};

// convert {<value>: <title>, ..} or [value, ..] to normal [{value, title}, ..]
var listValuesToArray = exports.listValuesToArray = function listValuesToArray(listValuesObj) {
  if (Array.isArray(listValuesObj)) return listValuesObj.map(function (v) {
    return toListValue(v);
  });
  if (!isObject(listValuesObj)) return listValuesObj;
  var listValuesArr = [];
  for (var v in listValuesObj) {
    var title = listValuesObj[v];
    listValuesArr.push(toListValue(v, title));
  }
  return listValuesArr;
};

// listValues can be {<value>: <title>, ..} or [{value, title}, ..] or [value, ..]
// todo: same as getListValue() (but args are switched)
var getItemInListValues = exports.getItemInListValues = function getItemInListValues(listValues, value) {
  if (Array.isArray(listValues)) {
    var values = listValues.map(function (v) {
      return toListValue(v);
    });
    return values.find(function (v) {
      return "" + v.value === "" + value;
    });
  } else {
    return listValues[value] !== undefined ? toListValue(value, listValues[value]) : undefined;
  }
};
var getTitleInListValues = exports.getTitleInListValues = function getTitleInListValues(listValues, value) {
  if (listValues == undefined) return value;
  var it = getItemInListValues(listValues, value);
  return it !== undefined ? it.title : value;
};
var getValueInListValues = exports.getValueInListValues = function getValueInListValues(listValues, value) {
  if (listValues == undefined) return value;
  var it = getItemInListValues(listValues, value);
  return it !== undefined ? it.value : value;
};
var mapListValues = exports.mapListValues = function mapListValues(listValues, mapFn) {
  var ret = [];
  if (Array.isArray(listValues)) {
    var _iterator = _createForOfIteratorHelper(listValues),
      _step;
    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        var v = _step.value;
        var lv = mapFn(toListValue(v));
        if (lv != null) ret.push(lv);
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }
  } else {
    for (var value in listValues) {
      var _lv = mapFn(toListValue(value, listValues[value]));
      if (_lv != null) ret.push(_lv);
    }
  }
  return ret;
};
var searchListValue = exports.searchListValue = function searchListValue(search, listValues) {
  return mapListValues(listValues, function (lv) {
    return "".concat(lv.value).indexOf(search) != -1 || lv.title.indexOf(search) != -1 ? lv : null;
  }).filter(function (v) {
    return v !== null;
  }).shift();
};
var getListValue = exports.getListValue = function getListValue(selectedValue, listValues) {
  return mapListValues(listValues, function (lv) {
    return "" + lv.value === "" + selectedValue ? lv : null;
  }).filter(function (v) {
    return v !== null;
  }).shift();
};