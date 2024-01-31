"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.fixListValuesGroupOrder = void 0;
Object.defineProperty(exports, "getListValue", {
  enumerable: true,
  get: function get() {
    return _listValues.getListValue;
  }
});
exports.simulateAsyncFetch = exports.optionsToListValues = exports.optionToListValue = exports.mergeListValues = exports.listValueToOption = void 0;
var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));
var _stuff = require("./stuff");
var _listValues = require("./listValues");
var _excluded = ["title", "value", "disabled", "groupTitle", "grouplabel", "renderTitle", "children", "label", "isCustom", "isHidden"];
function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { (0, _defineProperty2["default"])(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
// simple polyfill for Next
var findLastIndex = function findLastIndex(arr, fn) {
  if (arr.findLastIndex) {
    return arr.findLastIndex(fn);
  } else {
    var ind = (0, _toConsumableArray2["default"])(arr).reverse().findIndex(fn);
    return ind == -1 ? -1 : arr.length - 1 - ind;
  }
};
var simulateAsyncFetch = exports.simulateAsyncFetch = function simulateAsyncFetch(all) {
  var cPageSize = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  var delay = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1000;
  return /*#__PURE__*/function () {
    var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(search, offset, meta) {
      var pageSize, filtered, pages, currentOffset, currentPage, values, newOffset, hasMore;
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) switch (_context.prev = _context.next) {
          case 0:
            pageSize = (meta === null || meta === void 0 ? void 0 : meta.pageSize) != undefined ? meta.pageSize : cPageSize;
            filtered = (0, _listValues.listValuesToArray)(all).filter(function (_ref2) {
              var title = _ref2.title,
                value = _ref2.value;
              return search == null ? true : title.toUpperCase().indexOf(search.toUpperCase()) != -1 || "".concat(value).toUpperCase().indexOf(search.toUpperCase()) != -1;
            });
            pages = pageSize ? Math.ceil(filtered.length / pageSize) : 0;
            currentOffset = offset || 0;
            currentPage = pageSize ? Math.ceil(currentOffset / pageSize) : null;
            values = pageSize ? filtered.slice(currentOffset, currentOffset + pageSize) : filtered;
            newOffset = pageSize ? currentOffset + values.length : null;
            hasMore = pageSize ? newOffset < filtered.length : false;
            if (!delay) {
              _context.next = 11;
              break;
            }
            _context.next = 11;
            return (0, _stuff.sleep)(delay);
          case 11:
            return _context.abrupt("return", {
              values: values,
              hasMore: hasMore
            });
          case 12:
          case "end":
            return _context.stop();
        }
      }, _callee);
    }));
    return function (_x, _x2, _x3) {
      return _ref.apply(this, arguments);
    };
  }();
};
var mergeListValues = exports.mergeListValues = function mergeListValues(values, newValues) {
  var toStart = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
  var hideNewValues = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
  if (!newValues) return values;
  var old = values || [];
  var newFiltered = newValues.filter(function (v) {
    return old.find(function (av) {
      return "" + av.value == "" + v.value;
    }) == undefined;
  }).map(function (v) {
    return hideNewValues ? _objectSpread(_objectSpread({}, v), {}, {
      isHidden: true
    }) : v;
  });
  var merged = toStart ? [].concat((0, _toConsumableArray2["default"])(newFiltered), (0, _toConsumableArray2["default"])(old)) : [].concat((0, _toConsumableArray2["default"])(old), (0, _toConsumableArray2["default"])(newFiltered));
  return merged;
};
var optionToListValue = exports.optionToListValue = function optionToListValue(val, listValues, allowCustomValues) {
  var _val$value;
  var v = val == null || val == "" ? undefined : (_val$value = val === null || val === void 0 ? void 0 : val.value) !== null && _val$value !== void 0 ? _val$value : val;
  var item = (0, _listValues.getListValue)(v, listValues);
  var customItem = allowCustomValues && !item ? (0, _listValues.makeCustomListValue)(v) : undefined;
  var listValue = item || customItem;
  var lvs = listValue ? [listValue] : undefined; //not allow []
  return [v, lvs];
};
var optionsToListValues = exports.optionsToListValues = function optionsToListValues(vals, listValues, allowCustomValues) {
  var newSelectedListValues = vals.map(function (val, _i) {
    var _val$value2;
    var v = val == null || val == "" ? undefined : (_val$value2 = val === null || val === void 0 ? void 0 : val.value) !== null && _val$value2 !== void 0 ? _val$value2 : val;
    var item = (0, _listValues.getListValue)(v, listValues);
    var customItem = allowCustomValues && !item ? (0, _listValues.makeCustomListValue)(v) : undefined;
    var listValue = item || customItem;
    return listValue;
  }).filter(function (o) {
    return o != undefined;
  });
  var newSelectedValues = newSelectedListValues.map(function (o) {
    var _o$value;
    return (_o$value = o === null || o === void 0 ? void 0 : o.value) !== null && _o$value !== void 0 ? _o$value : o;
  });
  if (!newSelectedValues.length) newSelectedValues = undefined; //not allow []
  return [newSelectedValues, newSelectedListValues];
};
var listValueToOption = exports.listValueToOption = function listValueToOption(lv) {
  if (lv == null) return null;
  var title = lv.title,
    value = lv.value,
    disabled = lv.disabled,
    groupTitle = lv.groupTitle,
    grouplabel = lv.grouplabel,
    renderTitle = lv.renderTitle,
    children = lv.children,
    label = lv.label,
    isCustom = lv.isCustom,
    isHidden = lv.isHidden,
    rest = (0, _objectWithoutProperties2["default"])(lv, _excluded);
  var option = {
    value: value,
    title: title || label || children // fix issue #930 for AntD
  };

  if (disabled) option.disabled = disabled;
  if (isCustom) option.isCustom = isCustom;
  if (isHidden) option.isHidden = isHidden;
  // group
  if (groupTitle || grouplabel) option.groupTitle = groupTitle || grouplabel;
  // used only for MUI field autocomplete (if matchesType, render as bold)
  if (renderTitle) option.renderTitle = renderTitle;
  option = _objectSpread(_objectSpread({}, option), rest);
  return option;
};
var fixListValuesGroupOrder = exports.fixListValuesGroupOrder = function fixListValuesGroupOrder(listValues) {
  var newValues = [];
  var groupTitles = [];
  var _iterator = _createForOfIteratorHelper(listValues),
    _step;
  try {
    var _loop = function _loop() {
      var lv = _step.value;
      var i = findLastIndex(newValues, function (lv1) {
        var _lv1$groupTitle, _lv$groupTitle;
        return ((_lv1$groupTitle = lv1.groupTitle) !== null && _lv1$groupTitle !== void 0 ? _lv1$groupTitle : "") == ((_lv$groupTitle = lv.groupTitle) !== null && _lv$groupTitle !== void 0 ? _lv$groupTitle : "");
      });
      if (lv.groupTitle != undefined && !groupTitles.includes(lv.groupTitle)) {
        groupTitles.push(lv.groupTitle);
        if (groupTitles.length === 1) {
          // fix empty groupTitles
          newValues = newValues.map(function (nv) {
            return _objectSpread(_objectSpread({}, nv), {}, {
              groupTitle: ""
            });
          });
        }
      }
      if (lv.groupTitle == undefined && groupTitles.length) {
        // fix empty groupTitle
        lv = _objectSpread(_objectSpread({}, lv), {}, {
          groupTitle: ""
        });
      }
      if (i != -1) {
        newValues.splice(i + 1, 0, lv);
      } else {
        newValues.push(lv);
      }
    };
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      _loop();
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
  return newValues;
};