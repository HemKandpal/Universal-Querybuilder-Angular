"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true,
});
exports["default"] = exports.ConfigMixins = void 0;
var _defineProperty2 = _interopRequireDefault(
  require("@babel/runtime/helpers/defineProperty")
);
var _default2 = require("./default");
var _ctx = _interopRequireDefault(require("./ctx"));
function _createForOfIteratorHelper(o, allowArrayLike) {
  var it =
    (typeof Symbol !== "undefined" && o[Symbol.iterator]) || o["@@iterator"];
  if (!it) {
    if (
      Array.isArray(o) ||
      (it = _unsupportedIterableToArray(o)) ||
      (allowArrayLike && o && typeof o.length === "number")
    ) {
      if (it) o = it;
      var i = 0;
      var F = function F() {};
      return {
        s: F,
        n: function n() {
          if (i >= o.length) return { done: true };
          return { done: false, value: o[i++] };
        },
        e: function e(_e) {
          throw _e;
        },
        f: F,
      };
    }
    throw new TypeError(
      "Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."
    );
  }
  var normalCompletion = true,
    didErr = false,
    err;
  return {
    s: function s() {
      it = it.call(o);
    },
    n: function n() {
      var step = it.next();
      normalCompletion = step.done;
      return step;
    },
    e: function e(_e2) {
      didErr = true;
      err = _e2;
    },
    f: function f() {
      try {
        if (!normalCompletion && it["return"] != null) it["return"]();
      } finally {
        if (didErr) throw err;
      }
    },
  };
}
function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))
    return _arrayLikeToArray(o, minLen);
}
function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;
  for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
  return arr2;
}
function ownKeys(e, r) {
  var t = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    r &&
      (o = o.filter(function (r) {
        return Object.getOwnPropertyDescriptor(e, r).enumerable;
      })),
      t.push.apply(t, o);
  }
  return t;
}
function _objectSpread(e) {
  for (var r = 1; r < arguments.length; r++) {
    var t = null != arguments[r] ? arguments[r] : {};
    r % 2
      ? ownKeys(Object(t), !0).forEach(function (r) {
          (0, _defineProperty2["default"])(e, r, t[r]);
        })
      : Object.getOwnPropertyDescriptors
      ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t))
      : ownKeys(Object(t)).forEach(function (r) {
          Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r));
        });
  }
  return e;
}
//----------------------------  conjunctions

var conjunctions = {
  AND: {
    label: "And",
    mongoConj: "$and",
    jsonLogicConj: "and",
    sqlConj: "AND",
    spelConj: "and",
    spelConjs: ["and", "&&"],
    reversedConj: "OR",
    formatConj: function formatConj(children, conj, not, isForDisplay) {
      return children.size > 1
        ? (not ? "NOT " : "") +
            "(" +
            children.join(" " + (isForDisplay ? "AND" : "&&") + " ") +
            ")"
        : (not ? "NOT (" : "") + children.first() + (not ? ")" : "");
    },
    sqlFormatConj: function sqlFormatConj(children, conj, not) {
      return children.size > 1
        ? (not ? "NOT " : "") + "(" + children.join(" " + "AND" + " ") + ")"
        : (not ? "NOT (" : "") + children.first() + (not ? ")" : "");
    },
    spelFormatConj: function spelFormatConj(children, conj, not, omitBrackets) {
      if (not) omitBrackets = false;
      return children.size > 1
        ? (not ? "!" : "") +
            (omitBrackets ? "" : "(") +
            children.join(" " + "&&" + " ") +
            (omitBrackets ? "" : ")")
        : (not ? "!(" : "") + children.first() + (not ? ")" : "");
    },
  },
  OR: {
    label: "Or",
    mongoConj: "$or",
    jsonLogicConj: "or",
    sqlConj: "OR",
    spelConj: "or",
    spelConjs: ["or", "||"],
    reversedConj: "AND",
    formatConj: function formatConj(children, conj, not, isForDisplay) {
      return children.size > 1
        ? (not ? "NOT " : "") +
            "(" +
            children.join(" " + (isForDisplay ? "OR" : "||") + " ") +
            ")"
        : (not ? "NOT (" : "") + children.first() + (not ? ")" : "");
    },
    sqlFormatConj: function sqlFormatConj(children, conj, not) {
      return children.size > 1
        ? (not ? "NOT " : "") + "(" + children.join(" " + "OR" + " ") + ")"
        : (not ? "NOT (" : "") + children.first() + (not ? ")" : "");
    },
    spelFormatConj: function spelFormatConj(children, conj, not, omitBrackets) {
      if (not) omitBrackets = false;
      return children.size > 1
        ? (not ? "!" : "") +
            (omitBrackets ? "" : "(") +
            children.join(" " + "||" + " ") +
            (omitBrackets ? "" : ")")
        : (not ? "!(" : "") + children.first() + (not ? ")" : "");
    },
  },
};

//----------------------------  operators

var operators = {
  equal: {
    label: "==",
    labelForFormat: "==",
    sqlOp: "=",
    spelOp: "==",
    spelOps: ["==", "eq"],
    reversedOp: "not_equal",
    formatOp: function formatOp(
      field,
      op,
      value,
      valueSrcs,
      valueTypes,
      opDef,
      operatorOptions,
      isForDisplay,
      fieldDef
    ) {
      var opStr = isForDisplay ? "=" : opDef.label;
      if (valueTypes == "boolean" && isForDisplay)
        return value == "No" ? "NOT ".concat(field) : "".concat(field);
      else return "".concat(field, " ").concat(opStr, " ").concat(value);
    },
    mongoFormatOp: function mongoFormatOp() {
      var _this$utils;
      for (
        var _len = arguments.length, args = new Array(_len), _key = 0;
        _key < _len;
        _key++
      ) {
        args[_key] = arguments[_key];
      }
      return (_this$utils = this.utils).mongoFormatOp1.apply(
        _this$utils,
        [
          "$eq",
          function (v) {
            return v;
          },
          false,
        ].concat(args)
      );
    },
    jsonLogic: "==",
    elasticSearchQueryType: "term",
  },
  not_equal: {
    isNotOp: true,
    label: "!=",
    labelForFormat: "!=",
    sqlOp: "<>",
    spelOp: "!=",
    spelOps: ["!=", "ne"],
    reversedOp: "equal",
    formatOp: function formatOp(
      field,
      op,
      value,
      valueSrcs,
      valueTypes,
      opDef,
      operatorOptions,
      isForDisplay,
      fieldDef
    ) {
      if (valueTypes == "boolean" && isForDisplay)
        return value == "No" ? "".concat(field) : "NOT ".concat(field);
      else return "".concat(field, " ").concat(opDef.label, " ").concat(value);
    },
    mongoFormatOp: function mongoFormatOp() {
      var _this$utils2;
      for (
        var _len2 = arguments.length, args = new Array(_len2), _key2 = 0;
        _key2 < _len2;
        _key2++
      ) {
        args[_key2] = arguments[_key2];
      }
      return (_this$utils2 = this.utils).mongoFormatOp1.apply(
        _this$utils2,
        [
          "$ne",
          function (v) {
            return v;
          },
          false,
        ].concat(args)
      );
    },
    jsonLogic: "!=",
  },
  less: {
    label: "<",
    labelForFormat: "<",
    sqlOp: "<",
    spelOp: "<",
    spelOps: ["<", "lt"],
    reversedOp: "greater_or_equal",
    mongoFormatOp: function mongoFormatOp() {
      var _this$utils3;
      for (
        var _len3 = arguments.length, args = new Array(_len3), _key3 = 0;
        _key3 < _len3;
        _key3++
      ) {
        args[_key3] = arguments[_key3];
      }
      return (_this$utils3 = this.utils).mongoFormatOp1.apply(
        _this$utils3,
        [
          "$lt",
          function (v) {
            return v;
          },
          false,
        ].concat(args)
      );
    },
    jsonLogic: "<",
    elasticSearchQueryType: "range",
  },
  less_or_equal: {
    label: "<=",
    labelForFormat: "<=",
    sqlOp: "<=",
    spelOp: "<=",
    spelOps: ["<=", "le"],
    reversedOp: "greater",
    mongoFormatOp: function mongoFormatOp() {
      var _this$utils4;
      for (
        var _len4 = arguments.length, args = new Array(_len4), _key4 = 0;
        _key4 < _len4;
        _key4++
      ) {
        args[_key4] = arguments[_key4];
      }
      return (_this$utils4 = this.utils).mongoFormatOp1.apply(
        _this$utils4,
        [
          "$lte",
          function (v) {
            return v;
          },
          false,
        ].concat(args)
      );
    },
    jsonLogic: "<=",
    elasticSearchQueryType: "range",
  },
  greater: {
    label: ">",
    labelForFormat: ">",
    sqlOp: ">",
    spelOp: ">",
    spelOps: [">", "gt"],
    reversedOp: "less_or_equal",
    mongoFormatOp: function mongoFormatOp() {
      var _this$utils5;
      for (
        var _len5 = arguments.length, args = new Array(_len5), _key5 = 0;
        _key5 < _len5;
        _key5++
      ) {
        args[_key5] = arguments[_key5];
      }
      return (_this$utils5 = this.utils).mongoFormatOp1.apply(
        _this$utils5,
        [
          "$gt",
          function (v) {
            return v;
          },
          false,
        ].concat(args)
      );
    },
    jsonLogic: ">",
    elasticSearchQueryType: "range",
  },
  greater_or_equal: {
    label: ">=",
    labelForFormat: ">=",
    sqlOp: ">=",
    spelOp: ">=",
    spelOps: [">=", "ge"],
    reversedOp: "less",
    mongoFormatOp: function mongoFormatOp() {
      var _this$utils6;
      for (
        var _len6 = arguments.length, args = new Array(_len6), _key6 = 0;
        _key6 < _len6;
        _key6++
      ) {
        args[_key6] = arguments[_key6];
      }
      return (_this$utils6 = this.utils).mongoFormatOp1.apply(
        _this$utils6,
        [
          "$gte",
          function (v) {
            return v;
          },
          false,
        ].concat(args)
      );
    },
    jsonLogic: ">=",
    elasticSearchQueryType: "range",
  },
  like: {
    label: "Contains",
    labelForFormat: "Contains",
    reversedOp: "not_like",
    sqlOp: "LIKE",
    spelOp: "${0}.contains(${1})",
    valueTypes: ["text"],
    mongoFormatOp: function mongoFormatOp() {
      var _this$utils7,
        _this = this;
      for (
        var _len7 = arguments.length, args = new Array(_len7), _key7 = 0;
        _key7 < _len7;
        _key7++
      ) {
        args[_key7] = arguments[_key7];
      }
      return (_this$utils7 = this.utils).mongoFormatOp1.apply(
        _this$utils7,
        [
          "$regex",
          function (v) {
            return typeof v == "string"
              ? _this.utils.escapeRegExp(v)
              : undefined;
          },
          false,
        ].concat(args)
      );
    },
    //jsonLogic: (field, op, val) => ({ "in": [val, field] }),
    jsonLogic: "in",
    _jsonLogicIsRevArgs: true,
    valueSources: ["value"],
    elasticSearchQueryType: "regexp",
  },
  not_like: {
    isNotOp: true,
    label: "Not contains",
    reversedOp: "like",
    labelForFormat: "Not Contains",
    sqlOp: "NOT LIKE",
    mongoFormatOp: function mongoFormatOp() {
      var _this$utils8,
        _this2 = this;
      for (
        var _len8 = arguments.length, args = new Array(_len8), _key8 = 0;
        _key8 < _len8;
        _key8++
      ) {
        args[_key8] = arguments[_key8];
      }
      return (_this$utils8 = this.utils).mongoFormatOp1.apply(
        _this$utils8,
        [
          "$regex",
          function (v) {
            return typeof v == "string"
              ? _this2.utils.escapeRegExp(v)
              : undefined;
          },
          true,
        ].concat(args)
      );
    },
    valueSources: ["value"],
  },
  starts_with: {
    label: "Starts with",
    labelForFormat: "Starts with",
    sqlOp: "LIKE",
    spelOp: "${0}.startsWith(${1})",
    mongoFormatOp: function mongoFormatOp() {
      var _this$utils9,
        _this3 = this;
      for (
        var _len9 = arguments.length, args = new Array(_len9), _key9 = 0;
        _key9 < _len9;
        _key9++
      ) {
        args[_key9] = arguments[_key9];
      }
      return (_this$utils9 = this.utils).mongoFormatOp1.apply(
        _this$utils9,
        [
          "$regex",
          function (v) {
            return typeof v == "string"
              ? "^" + _this3.utils.escapeRegExp(v)
              : undefined;
          },
          false,
        ].concat(args)
      );
    },
    jsonLogic: undefined,
    // not supported
    valueSources: ["value"],
  },
  ends_with: {
    label: "Ends with",
    labelForFormat: "Ends with",
    sqlOp: "LIKE",
    spelOp: "${0}.endsWith(${1})",
    mongoFormatOp: function mongoFormatOp() {
      var _this$utils10,
        _this4 = this;
      for (
        var _len10 = arguments.length, args = new Array(_len10), _key10 = 0;
        _key10 < _len10;
        _key10++
      ) {
        args[_key10] = arguments[_key10];
      }
      return (_this$utils10 = this.utils).mongoFormatOp1.apply(
        _this$utils10,
        [
          "$regex",
          function (v) {
            return typeof v == "string"
              ? _this4.utils.escapeRegExp(v) + "$"
              : undefined;
          },
          false,
        ].concat(args)
      );
    },
    jsonLogic: undefined,
    // not supported
    valueSources: ["value"],
  },
  between: {
    label: "Between",
    labelForFormat: "BETWEEN",
    sqlOp: "BETWEEN",
    cardinality: 2,
    formatOp: function formatOp(
      field,
      op,
      values,
      valueSrcs,
      valueTypes,
      opDef,
      operatorOptions,
      isForDisplay
    ) {
      var valFrom = values.first();
      var valTo = values.get(1);
      if (isForDisplay)
        return ""
          .concat(field, " BETWEEN ")
          .concat(valFrom, " AND ")
          .concat(valTo);
      else
        return ""
          .concat(field, " >= ")
          .concat(valFrom, " && ")
          .concat(field, " <= ")
          .concat(valTo);
    },
    spelFormatOp: function spelFormatOp(
      field,
      op,
      values,
      valueSrc,
      valueTypes,
      opDef,
      operatorOptions,
      fieldDef
    ) {
      var valFrom = values[0];
      var valTo = values[1];
      return ""
        .concat(field, " >= ")
        .concat(valFrom, " && ")
        .concat(field, " <= ")
        .concat(valTo);
    },
    mongoFormatOp: function mongoFormatOp() {
      var _this$utils11;
      for (
        var _len11 = arguments.length, args = new Array(_len11), _key11 = 0;
        _key11 < _len11;
        _key11++
      ) {
        args[_key11] = arguments[_key11];
      }
      return (_this$utils11 = this.utils).mongoFormatOp2.apply(
        _this$utils11,
        [["$gte", "$lte"], false].concat(args)
      );
    },
    valueLabels: ["Value from", "Value to"],
    textSeparators: [null, "and"],
    reversedOp: "not_between",
    jsonLogic: "<=",
    validateValues: function validateValues(values) {
      if (values[0] != undefined && values[1] != undefined) {
        return values[0] <= values[1] ? null : "Invalid range";
      }
      return null;
    },
    elasticSearchQueryType: function elasticSearchQueryType(type) {
      return type === "time" ? "filter" : "range";
    },
  },
  not_between: {
    isNotOp: true,
    label: "Not between",
    labelForFormat: "NOT BETWEEN",
    sqlOp: "NOT BETWEEN",
    cardinality: 2,
    formatOp: function formatOp(
      field,
      op,
      values,
      valueSrcs,
      valueTypes,
      opDef,
      operatorOptions,
      isForDisplay
    ) {
      var valFrom = values.first();
      var valTo = values.get(1);
      if (isForDisplay)
        return ""
          .concat(field, " NOT BETWEEN ")
          .concat(valFrom, " AND ")
          .concat(valTo);
      else
        return "("
          .concat(field, " < ")
          .concat(valFrom, " || ")
          .concat(field, " > ")
          .concat(valTo, ")");
    },
    spelFormatOp: function spelFormatOp(
      field,
      op,
      values,
      valueSrc,
      valueTypes,
      opDef,
      operatorOptions,
      fieldDef
    ) {
      var valFrom = values[0];
      var valTo = values[1];
      return "("
        .concat(field, " < ")
        .concat(valFrom, " || ")
        .concat(field, " > ")
        .concat(valTo, ")");
    },
    mongoFormatOp: function mongoFormatOp() {
      var _this$utils12;
      for (
        var _len12 = arguments.length, args = new Array(_len12), _key12 = 0;
        _key12 < _len12;
        _key12++
      ) {
        args[_key12] = arguments[_key12];
      }
      return (_this$utils12 = this.utils).mongoFormatOp2.apply(
        _this$utils12,
        [["$gte", "$lte"], true].concat(args)
      );
    },
    valueLabels: ["Value from", "Value to"],
    textSeparators: [null, "and"],
    reversedOp: "between",
    validateValues: function validateValues(values) {
      if (values[0] != undefined && values[1] != undefined) {
        return values[0] <= values[1] ? null : "Invalid range";
      }
      return null;
    },
  },
  is_empty: {
    label: "Is empty",
    labelForFormat: "IS EMPTY",
    cardinality: 0,
    reversedOp: "is_not_empty",
    formatOp: function formatOp(
      field,
      op,
      value,
      valueSrc,
      valueType,
      opDef,
      operatorOptions,
      isForDisplay
    ) {
      return isForDisplay ? "".concat(field, " IS EMPTY") : "!".concat(field);
    },
    sqlFormatOp: function sqlFormatOp(
      field,
      op,
      values,
      valueSrc,
      valueType,
      opDef,
      operatorOptions,
      fieldDef
    ) {
      var empty = this.utils.sqlEmptyValue(fieldDef);
      return "COALESCE("
        .concat(field, ", ")
        .concat(empty, ") = ")
        .concat(empty);
    },
    spelFormatOp: function spelFormatOp(
      field,
      op,
      values,
      valueSrc,
      valueTypes,
      opDef,
      operatorOptions,
      fieldDef
    ) {
      //tip: is empty or null
      return "".concat(field, " <= ''");
    },
    mongoFormatOp: function mongoFormatOp() {
      var _this$utils13,
        _this5 = this;
      for (
        var _len13 = arguments.length, args = new Array(_len13), _key13 = 0;
        _key13 < _len13;
        _key13++
      ) {
        args[_key13] = arguments[_key13];
      }
      return (_this$utils13 = this.utils).mongoFormatOp1.apply(
        _this$utils13,
        [
          "$in",
          function (v, fieldDef) {
            return [_this5.utils.mongoEmptyValue(fieldDef), null];
          },
          false,
        ].concat(args)
      );
    },
    jsonLogic: "!",
  },
  is_not_empty: {
    isNotOp: true,
    label: "Is not empty",
    labelForFormat: "IS NOT EMPTY",
    cardinality: 0,
    reversedOp: "is_empty",
    formatOp: function formatOp(
      field,
      op,
      value,
      valueSrc,
      valueType,
      opDef,
      operatorOptions,
      isForDisplay
    ) {
      return isForDisplay
        ? "".concat(field, " IS NOT EMPTY")
        : "!!".concat(field);
    },
    sqlFormatOp: function sqlFormatOp(
      field,
      op,
      values,
      valueSrc,
      valueType,
      opDef,
      operatorOptions,
      fieldDef
    ) {
      var empty = this.utils.sqlEmptyValue(fieldDef);
      return "COALESCE("
        .concat(field, ", ")
        .concat(empty, ") <> ")
        .concat(empty);
    },
    spelFormatOp: function spelFormatOp(
      field,
      op,
      values,
      valueSrc,
      valueTypes,
      opDef,
      operatorOptions,
      fieldDef
    ) {
      //tip: is not empty and not null
      return "".concat(field, " > ''");
    },
    mongoFormatOp: function mongoFormatOp() {
      var _this$utils14,
        _this6 = this;
      for (
        var _len14 = arguments.length, args = new Array(_len14), _key14 = 0;
        _key14 < _len14;
        _key14++
      ) {
        args[_key14] = arguments[_key14];
      }
      return (_this$utils14 = this.utils).mongoFormatOp1.apply(
        _this$utils14,
        [
          "$nin",
          function (v, fieldDef) {
            return [_this6.utils.mongoEmptyValue(fieldDef), null];
          },
          false,
        ].concat(args)
      );
    },
    jsonLogic: "!!",
    elasticSearchQueryType: "exists",
  },
  is_null: {
    label: "Is null",
    labelForFormat: "IS NULL",
    sqlOp: "IS NULL",
    cardinality: 0,
    reversedOp: "is_not_null",
    formatOp: function formatOp(
      field,
      op,
      value,
      valueSrc,
      valueType,
      opDef,
      operatorOptions,
      isForDisplay
    ) {
      return isForDisplay ? "".concat(field, " IS NULL") : "!".concat(field);
    },
    spelFormatOp: function spelFormatOp(
      field,
      op,
      values,
      valueSrc,
      valueTypes,
      opDef,
      operatorOptions,
      fieldDef
    ) {
      return "".concat(field, " == null");
    },
    // check if value is null OR not exists
    mongoFormatOp: function mongoFormatOp() {
      var _this$utils15;
      for (
        var _len15 = arguments.length, args = new Array(_len15), _key15 = 0;
        _key15 < _len15;
        _key15++
      ) {
        args[_key15] = arguments[_key15];
      }
      return (_this$utils15 = this.utils).mongoFormatOp1.apply(
        _this$utils15,
        [
          "$eq",
          function (v) {
            return null;
          },
          false,
        ].concat(args)
      );
    },
    jsonLogic: "==",
  },
  is_not_null: {
    label: "Is not null",
    labelForFormat: "IS NOT NULL",
    sqlOp: "IS NOT NULL",
    cardinality: 0,
    reversedOp: "is_null",
    formatOp: function formatOp(
      field,
      op,
      value,
      valueSrc,
      valueType,
      opDef,
      operatorOptions,
      isForDisplay
    ) {
      return isForDisplay
        ? "".concat(field, " IS NOT NULL")
        : "!!".concat(field);
    },
    spelFormatOp: function spelFormatOp(
      field,
      op,
      values,
      valueSrc,
      valueTypes,
      opDef,
      operatorOptions,
      fieldDef
    ) {
      return "".concat(field, " != null");
    },
    // check if value exists and is not null
    mongoFormatOp: function mongoFormatOp() {
      var _this$utils16;
      for (
        var _len16 = arguments.length, args = new Array(_len16), _key16 = 0;
        _key16 < _len16;
        _key16++
      ) {
        args[_key16] = arguments[_key16];
      }
      return (_this$utils16 = this.utils).mongoFormatOp1.apply(
        _this$utils16,
        [
          "$ne",
          function (v) {
            return null;
          },
          false,
        ].concat(args)
      );
    },
    jsonLogic: "!=",
    elasticSearchQueryType: "exists",
  },
  select_equals: {
    label: "==",
    labelForFormat: "==",
    sqlOp: "=",
    // enum/set
    formatOp: function formatOp(
      field,
      op,
      value,
      valueSrc,
      valueType,
      opDef,
      operatorOptions,
      isForDisplay
    ) {
      var opStr = isForDisplay ? "=" : "==";
      return "".concat(field, " ").concat(opStr, " ").concat(value);
    },
    spelOp: "==",
    spelOps: ["==", "eq"],
    mongoFormatOp: function mongoFormatOp() {
      var _this$utils17;
      for (
        var _len17 = arguments.length, args = new Array(_len17), _key17 = 0;
        _key17 < _len17;
        _key17++
      ) {
        args[_key17] = arguments[_key17];
      }
      return (_this$utils17 = this.utils).mongoFormatOp1.apply(
        _this$utils17,
        [
          "$eq",
          function (v) {
            return v;
          },
          false,
        ].concat(args)
      );
    },
    reversedOp: "select_not_equals",
    jsonLogic: "==",
    elasticSearchQueryType: "term",
  },
  select_not_equals: {
    isNotOp: true,
    label: "!=",
    labelForFormat: "!=",
    sqlOp: "<>",
    // enum/set
    formatOp: function formatOp(
      field,
      op,
      value,
      valueSrc,
      valueType,
      opDef,
      operatorOptions,
      isForDisplay
    ) {
      return "".concat(field, " != ").concat(value);
    },
    spelOp: "!=",
    spelOps: ["!=", "ne"],
    mongoFormatOp: function mongoFormatOp() {
      var _this$utils18;
      for (
        var _len18 = arguments.length, args = new Array(_len18), _key18 = 0;
        _key18 < _len18;
        _key18++
      ) {
        args[_key18] = arguments[_key18];
      }
      return (_this$utils18 = this.utils).mongoFormatOp1.apply(
        _this$utils18,
        [
          "$ne",
          function (v) {
            return v;
          },
          false,
        ].concat(args)
      );
    },
    reversedOp: "select_equals",
    jsonLogic: "!=",
  },
  select_any_in: {
    label: "Any in",
    labelForFormat: "IN",
    sqlOp: "IN",
    formatOp: function formatOp(
      field,
      op,
      values,
      valueSrc,
      valueType,
      opDef,
      operatorOptions,
      isForDisplay
    ) {
      if (valueSrc == "value")
        return "".concat(field, " IN (").concat(values.join(", "), ")");
      else return "".concat(field, " IN (").concat(values, ")");
    },
    sqlFormatOp: function sqlFormatOp(
      field,
      op,
      values,
      valueSrc,
      valueType,
      opDef,
      operatorOptions,
      fieldDef
    ) {
      if (valueSrc == "value") {
        return "".concat(field, " IN (").concat(values.join(", "), ")");
      } else return undefined; // not supported
    },

    valueTypes: ["multiselect"],
    spelOp: "${1}.contains(${0})",
    mongoFormatOp: function mongoFormatOp() {
      var _this$utils19;
      for (
        var _len19 = arguments.length, args = new Array(_len19), _key19 = 0;
        _key19 < _len19;
        _key19++
      ) {
        args[_key19] = arguments[_key19];
      }
      return (_this$utils19 = this.utils).mongoFormatOp1.apply(
        _this$utils19,
        [
          "$in",
          function (v) {
            return v;
          },
          false,
        ].concat(args)
      );
    },
    reversedOp: "select_not_any_in",
    jsonLogic: "in",
    elasticSearchQueryType: "term",
  },
  select_not_any_in: {
    isNotOp: true,
    label: "Not in",
    labelForFormat: "NOT IN",
    sqlOp: "NOT IN",
    formatOp: function formatOp(
      field,
      op,
      values,
      valueSrc,
      valueType,
      opDef,
      operatorOptions,
      isForDisplay
    ) {
      if (valueSrc == "value")
        return "".concat(field, " NOT IN (").concat(values.join(", "), ")");
      else return "".concat(field, " NOT IN (").concat(values, ")");
    },
    sqlFormatOp: function sqlFormatOp(
      field,
      op,
      values,
      valueSrc,
      valueType,
      opDef,
      operatorOptions,
      fieldDef
    ) {
      if (valueSrc == "value") {
        return "".concat(field, " NOT IN (").concat(values.join(", "), ")");
      } else return undefined; // not supported
    },

    mongoFormatOp: function mongoFormatOp() {
      var _this$utils20;
      for (
        var _len20 = arguments.length, args = new Array(_len20), _key20 = 0;
        _key20 < _len20;
        _key20++
      ) {
        args[_key20] = arguments[_key20];
      }
      return (_this$utils20 = this.utils).mongoFormatOp1.apply(
        _this$utils20,
        [
          "$nin",
          function (v) {
            return v;
          },
          false,
        ].concat(args)
      );
    },
    reversedOp: "select_any_in",
  },
  // it's not "contains all", but "contains any" operator
  multiselect_contains: {
    label: "Contains",
    labelForFormat: "CONTAINS",
    formatOp: function formatOp(
      field,
      op,
      values,
      valueSrc,
      valueType,
      opDef,
      operatorOptions,
      isForDisplay
    ) {
      if (valueSrc == "value")
        return "".concat(field, " CONTAINS [").concat(values.join(", "), "]");
      else return "".concat(field, " CONTAINS ").concat(values);
    },
    reversedOp: "multiselect_not_contains",
    jsonLogic2: "some-in",
    jsonLogic: function jsonLogic(field, op, vals) {
      return {
        some: [
          field,
          {
            in: [
              {
                var: "",
              },
              vals,
            ],
          },
        ],
      };
    },
    //spelOp: "${0}.containsAll(${1})",
    spelOp: "T(CollectionUtils).containsAny(${0}, ${1})",
    elasticSearchQueryType: "term",
    mongoFormatOp: function mongoFormatOp() {
      var _this$utils21;
      for (
        var _len21 = arguments.length, args = new Array(_len21), _key21 = 0;
        _key21 < _len21;
        _key21++
      ) {
        args[_key21] = arguments[_key21];
      }
      return (_this$utils21 = this.utils).mongoFormatOp1.apply(
        _this$utils21,
        [
          "$in",
          function (v) {
            return v;
          },
          false,
        ].concat(args)
      );
    },
  },
  multiselect_not_contains: {
    isNotOp: true,
    label: "Not contains",
    labelForFormat: "NOT CONTAINS",
    formatOp: function formatOp(
      field,
      op,
      values,
      valueSrc,
      valueType,
      opDef,
      operatorOptions,
      isForDisplay
    ) {
      if (valueSrc == "value")
        return ""
          .concat(field, " NOT CONTAINS [")
          .concat(values.join(", "), "]");
      else return "".concat(field, " NOT CONTAINS ").concat(values);
    },
    reversedOp: "multiselect_contains",
  },
  multiselect_equals: {
    label: "Equals",
    labelForFormat: "==",
    sqlOp: "=",
    formatOp: function formatOp(
      field,
      op,
      values,
      valueSrc,
      valueType,
      opDef,
      operatorOptions,
      isForDisplay
    ) {
      var opStr = isForDisplay ? "=" : "==";
      if (valueSrc == "value")
        return ""
          .concat(field, " ")
          .concat(opStr, " [")
          .concat(values.join(", "), "]");
      else return "".concat(field, " ").concat(opStr, " ").concat(values);
    },
    sqlFormatOp: function sqlFormatOp(
      field,
      op,
      values,
      valueSrc,
      valueType,
      opDef,
      operatorOptions,
      fieldDef
    ) {
      var _this7 = this;
      if (valueSrc == "value")
        // set
        return "".concat(field, " = '").concat(
          values
            .map(function (v) {
              return _this7.utils.SqlString.trim(v);
            })
            .join(","),
          "'"
        );
      else return undefined; //not supported
    },

    spelOp: "${0}.equals(${1})",
    mongoFormatOp: function mongoFormatOp() {
      var _this$utils22;
      for (
        var _len22 = arguments.length, args = new Array(_len22), _key22 = 0;
        _key22 < _len22;
        _key22++
      ) {
        args[_key22] = arguments[_key22];
      }
      return (_this$utils22 = this.utils).mongoFormatOp1.apply(
        _this$utils22,
        [
          "$eq",
          function (v) {
            return v;
          },
          false,
        ].concat(args)
      );
    },
    reversedOp: "multiselect_not_equals",
    jsonLogic2: "all-in",
    jsonLogic: function jsonLogic(field, op, vals) {
      return {
        // it's not "equals", but "includes" operator - just for example
        all: [
          field,
          {
            in: [
              {
                var: "",
              },
              vals,
            ],
          },
        ],
      };
    },
    elasticSearchQueryType: "term",
  },
  multiselect_not_equals: {
    isNotOp: true,
    label: "Not equals",
    labelForFormat: "!=",
    sqlOp: "<>",
    formatOp: function formatOp(
      field,
      op,
      values,
      valueSrc,
      valueType,
      opDef,
      operatorOptions,
      isForDisplay
    ) {
      if (valueSrc == "value")
        return "".concat(field, " != [").concat(values.join(", "), "]");
      else return "".concat(field, " != ").concat(values);
    },
    sqlFormatOp: function sqlFormatOp(
      field,
      op,
      values,
      valueSrc,
      valueType,
      opDef,
      operatorOptions,
      fieldDef
    ) {
      var _this8 = this;
      if (valueSrc == "value")
        // set
        return "".concat(field, " != '").concat(
          values
            .map(function (v) {
              return _this8.utils.SqlString.trim(v);
            })
            .join(","),
          "'"
        );
      else return undefined; //not supported
    },

    mongoFormatOp: function mongoFormatOp() {
      var _this$utils23;
      for (
        var _len23 = arguments.length, args = new Array(_len23), _key23 = 0;
        _key23 < _len23;
        _key23++
      ) {
        args[_key23] = arguments[_key23];
      }
      return (_this$utils23 = this.utils).mongoFormatOp1.apply(
        _this$utils23,
        [
          "$ne",
          function (v) {
            return v;
          },
          false,
        ].concat(args)
      );
    },
    reversedOp: "multiselect_equals",
  },
  proximity: {
    label: "Proximity search",
    cardinality: 2,
    valueLabels: [
      {
        label: "Word 1",
        placeholder: "Enter first word",
      },
      {
        label: "Word 2",
        placeholder: "Enter second word",
      },
    ],
    textSeparators: [
      //'Word 1',
      //'Word 2'
    ],
    formatOp: function formatOp(
      field,
      op,
      values,
      valueSrc,
      valueType,
      opDef,
      operatorOptions,
      isForDisplay
    ) {
      var val1 = values.first();
      var val2 = values.get(1);
      var prox = operatorOptions.get("proximity");
      return ""
        .concat(field, " ")
        .concat(val1, " NEAR/")
        .concat(prox, " ")
        .concat(val2);
    },
    sqlFormatOp: function sqlFormatOp(
      field,
      op,
      values,
      valueSrc,
      valueType,
      opDef,
      operatorOptions,
      fieldDef
    ) {
      // https://learn.microsoft.com/en-us/sql/relational-databases/search/search-for-words-close-to-another-word-with-near?view=sql-server-ver16#example-1
      var val1 = values.first();
      var val2 = values.get(1);
      var aVal1 = this.utils.SqlString.trim(val1);
      var aVal2 = this.utils.SqlString.trim(val2);
      var prox = operatorOptions.get("proximity");
      return "CONTAINS("
        .concat(field, ", 'NEAR((")
        .concat(aVal1, ", ")
        .concat(aVal2, "), ")
        .concat(prox, ")')");
    },
    mongoFormatOp: undefined,
    // not supported
    jsonLogic: undefined,
    // not supported
    options: {
      optionLabel: "Near",
      // label on top of "near" selectbox (for config.settings.showLabels==true)
      optionTextBefore: "Near",
      // label before "near" selectbox (for config.settings.showLabels==false)
      optionPlaceholder: "Select words between",
      // placeholder for "near" selectbox
      minProximity: 2,
      maxProximity: 10,
      defaults: {
        proximity: 2,
      },
    },
  },
  some: {
    label: "Some",
    labelForFormat: "SOME",
    cardinality: 0,
    jsonLogic: "some",
    spelFormatOp: function spelFormatOp(filteredSize) {
      return "".concat(filteredSize, " > 0");
    },
    mongoFormatOp: function mongoFormatOp() {
      var _this$utils24;
      for (
        var _len24 = arguments.length, args = new Array(_len24), _key24 = 0;
        _key24 < _len24;
        _key24++
      ) {
        args[_key24] = arguments[_key24];
      }
      return (_this$utils24 = this.utils).mongoFormatOp1.apply(
        _this$utils24,
        [
          "$gt",
          function (v) {
            return 0;
          },
          false,
        ].concat(args)
      );
    },
  },
  all: {
    label: "All",
    labelForFormat: "ALL",
    cardinality: 0,
    jsonLogic: "all",
    spelFormatOp: function spelFormatOp(filteredSize, op, fullSize) {
      return "".concat(filteredSize, " == ").concat(fullSize);
    },
    mongoFormatOp: function mongoFormatOp() {
      var _this$utils25;
      for (
        var _len25 = arguments.length, args = new Array(_len25), _key25 = 0;
        _key25 < _len25;
        _key25++
      ) {
        args[_key25] = arguments[_key25];
      }
      return (_this$utils25 = this.utils).mongoFormatOp1.apply(
        _this$utils25,
        [
          "$eq",
          function (v) {
            return v;
          },
          false,
        ].concat(args)
      );
    },
  },
  none: {
    label: "None",
    labelForFormat: "NONE",
    cardinality: 0,
    jsonLogic: "none",
    spelFormatOp: function spelFormatOp(filteredSize) {
      return "".concat(filteredSize, " == 0");
    },
    mongoFormatOp: function mongoFormatOp() {
      var _this$utils26;
      for (
        var _len26 = arguments.length, args = new Array(_len26), _key26 = 0;
        _key26 < _len26;
        _key26++
      ) {
        args[_key26] = arguments[_key26];
      }
      return (_this$utils26 = this.utils).mongoFormatOp1.apply(
        _this$utils26,
        [
          "$eq",
          function (v) {
            return 0;
          },
          false,
        ].concat(args)
      );
    },
  },
};

//----------------------------  widgets

var widgets = {
  text: {
    type: "text",
    jsType: "string",
    valueSrc: "value",
    valueLabel: "String",
    valuePlaceholder: "Enter string",
    formatValue: function formatValue(val, fieldDef, wgtDef, isForDisplay) {
      return isForDisplay
        ? this.utils.stringifyForDisplay(val)
        : JSON.stringify(val);
    },
    spelFormatValue: function spelFormatValue(
      val,
      fieldDef,
      wgtDef,
      op,
      opDef
    ) {
      return this.utils.spelEscape(val);
    },
    sqlFormatValue: function sqlFormatValue(val, fieldDef, wgtDef, op, opDef) {
      if (opDef.sqlOp == "LIKE" || opDef.sqlOp == "NOT LIKE") {
        return this.utils.SqlString.escapeLike(
          val,
          op != "starts_with",
          op != "ends_with"
        );
      } else {
        return this.utils.SqlString.escape(val);
      }
    },
    toJS: function toJS(val, fieldSettings) {
      return val;
    },
    mongoFormatValue: function mongoFormatValue(val, fieldDef, wgtDef) {
      return val;
    },
  },
  textarea: {
    type: "text",
    jsType: "string",
    valueSrc: "value",
    valueLabel: "Text",
    valuePlaceholder: "Enter text",
    formatValue: function formatValue(val, fieldDef, wgtDef, isForDisplay) {
      return isForDisplay
        ? this.utils.stringifyForDisplay(val)
        : JSON.stringify(val);
    },
    sqlFormatValue: function sqlFormatValue(val, fieldDef, wgtDef, op, opDef) {
      if (opDef.sqlOp == "LIKE" || opDef.sqlOp == "NOT LIKE") {
        return this.utils.SqlString.escapeLike(
          val,
          op != "starts_with",
          op != "ends_with"
        );
      } else {
        return this.utils.SqlString.escape(val);
      }
    },
    spelFormatValue: function spelFormatValue(val) {
      return this.utils.spelEscape(val);
    },
    toJS: function toJS(val, fieldSettings) {
      return val;
    },
    mongoFormatValue: function mongoFormatValue(val, fieldDef, wgtDef) {
      return val;
    },
    fullWidth: true,
  },
  number: {
    type: "number",
    jsType: "number",
    valueSrc: "value",
    valueLabel: "Number",
    valuePlaceholder: "Enter number",
    valueLabels: [
      {
        label: "Number from",
        placeholder: "Enter number from",
      },
      {
        label: "Number to",
        placeholder: "Enter number to",
      },
    ],
    formatValue: function formatValue(val, fieldDef, wgtDef, isForDisplay) {
      return isForDisplay
        ? this.utils.stringifyForDisplay(val)
        : JSON.stringify(val);
    },
    sqlFormatValue: function sqlFormatValue(val, fieldDef, wgtDef, op, opDef) {
      return this.utils.SqlString.escape(val);
    },
    spelFormatValue: function spelFormatValue(val, fieldDef, wgtDef) {
      var isFloat = wgtDef.step && !Number.isInteger(wgtDef.step);
      return this.utils.spelEscape(val, isFloat);
    },
    toJS: function toJS(val, fieldSettings) {
      return val;
    },
    mongoFormatValue: function mongoFormatValue(val, fieldDef, wgtDef) {
      return val;
    },
  },
  slider: {
    type: "number",
    jsType: "number",
    valueSrc: "value",
    valueLabel: "Number",
    valuePlaceholder: "Enter number or move slider",
    formatValue: function formatValue(val, fieldDef, wgtDef, isForDisplay) {
      return isForDisplay
        ? this.utils.stringifyForDisplay(val)
        : JSON.stringify(val);
    },
    sqlFormatValue: function sqlFormatValue(val, fieldDef, wgtDef, op, opDef) {
      return this.utils.SqlString.escape(val);
    },
    spelFormatValue: function spelFormatValue(val) {
      return this.utils.spelEscape(val);
    },
    toJS: function toJS(val, fieldSettings) {
      return val;
    },
    mongoFormatValue: function mongoFormatValue(val, fieldDef, wgtDef) {
      return val;
    },
  },
  select: {
    type: "select",
    jsType: "string",
    valueSrc: "value",
    valueLabel: "Value",
    valuePlaceholder: "Select value",
    formatValue: function formatValue(val, fieldDef, wgtDef, isForDisplay) {
      var valLabel = this.utils.getTitleInListValues(
        fieldDef.fieldSettings.listValues || fieldDef.asyncListValues,
        val
      );
      return isForDisplay
        ? this.utils.stringifyForDisplay(valLabel)
        : JSON.stringify(val);
    },
    sqlFormatValue: function sqlFormatValue(val, fieldDef, wgtDef, op, opDef) {
      return this.utils.SqlString.escape(val);
    },
    spelFormatValue: function spelFormatValue(val) {
      return this.utils.spelEscape(val);
    },
    toJS: function toJS(val, fieldSettings) {
      return val;
    },
    mongoFormatValue: function mongoFormatValue(val, fieldDef, wgtDef) {
      return val;
    },
  },
  multiselect: {
    type: "multiselect",
    jsType: "array",
    valueSrc: "value",
    valueLabel: "Values",
    valuePlaceholder: "Select values",
    formatValue: function formatValue(vals, fieldDef, wgtDef, isForDisplay) {
      var _this9 = this;
      var valsLabels = vals.map(function (v) {
        return _this9.utils.getTitleInListValues(
          fieldDef.fieldSettings.listValues || fieldDef.asyncListValues,
          v
        );
      });
      return isForDisplay
        ? valsLabels.map(this.utils.stringifyForDisplay)
        : vals.map(JSON.stringify);
    },
    sqlFormatValue: function sqlFormatValue(vals, fieldDef, wgtDef, op, opDef) {
      var _this10 = this;
      return vals.map(function (v) {
        return _this10.utils.SqlString.escape(v);
      });
    },
    spelFormatValue: function spelFormatValue(
      vals,
      fieldDef,
      wgtDef,
      op,
      opDef
    ) {
      var isCallable = opDef.spelOp && opDef.spelOp.startsWith("${1}");
      var res = this.utils.spelEscape(vals); // inline list
      if (isCallable) {
        // `{1,2}.contains(1)` NOT works
        // `{1,2}.?[true].contains(1)` works
        res = this.utils.spelFixList(res);
      }
      return res;
    },
    toJS: function toJS(val, fieldSettings) {
      return val;
    },
    mongoFormatValue: function mongoFormatValue(val, fieldDef, wgtDef) {
      return val;
    },
  },
  date: {
    type: "date",
    jsType: "string",
    valueSrc: "value",
    dateFormat: "DD.MM.YYYY",
    valueFormat: "YYYY-MM-DD",
    valueLabel: "Date",
    valuePlaceholder: "Enter date",
    valueLabels: [
      {
        label: "Date from",
        placeholder: "Enter date from",
      },
      {
        label: "Date to",
        placeholder: "Enter date to",
      },
    ],
    formatValue: function formatValue(val, fieldDef, wgtDef, isForDisplay) {
      var dateVal = this.utils.moment(val, wgtDef.valueFormat);
      return isForDisplay
        ? dateVal.format(wgtDef.dateFormat)
        : JSON.stringify(val);
    },
    sqlFormatValue: function sqlFormatValue(val, fieldDef, wgtDef, op, opDef) {
      var dateVal = this.utils.moment(val, wgtDef.valueFormat);
      return this.utils.SqlString.escape(dateVal.format("YYYY-MM-DD"));
    },
    spelFormatValue: function spelFormatValue(
      val,
      fieldDef,
      wgtDef,
      op,
      opDef
    ) {
      var dateVal = this.utils.moment(val, wgtDef.valueFormat);
      var v = dateVal.format("YYYY-MM-DD");
      var fmt = "yyyy-MM-dd";
      //return `new java.text.SimpleDateFormat('${fmt}').parse('${v}')`;
      return "T(java.time.LocalDate).parse('"
        .concat(v, "', T(java.time.format.DateTimeFormatter).ofPattern('")
        .concat(fmt, "'))");
    },
    spelImportFuncs: [
      //"new java.text.SimpleDateFormat(${fmt}).parse(${v})",
      {
        obj: {
          cls: ["java", "time", "LocalDate"],
        },
        methodName: "parse",
        args: [
          {
            var: "v",
          },
          {
            obj: {
              cls: ["java", "time", "format", "DateTimeFormatter"],
            },
            methodName: "ofPattern",
            args: [
              {
                var: "fmt",
              },
            ],
          },
        ],
      },
    ],
    spelImportValue: function spelImportValue(val, wgtDef, args) {
      var _args$fmt, _args$fmt$includes, _args$fmt2, _args$fmt2$toLowerCas;
      if (!wgtDef) return [undefined, "No widget def to get value format"];
      if (
        (args !== null &&
          args !== void 0 &&
          (_args$fmt = args.fmt) !== null &&
          _args$fmt !== void 0 &&
          (_args$fmt = _args$fmt.value) !== null &&
          _args$fmt !== void 0 &&
          (_args$fmt$includes = _args$fmt.includes) !== null &&
          _args$fmt$includes !== void 0 &&
          _args$fmt$includes.call(_args$fmt, " ")) ||
        ((_args$fmt2 = args.fmt) !== null &&
          _args$fmt2 !== void 0 &&
          (_args$fmt2 = _args$fmt2.value) !== null &&
          _args$fmt2 !== void 0 &&
          (_args$fmt2$toLowerCas = _args$fmt2.toLowerCase) !== null &&
          _args$fmt2$toLowerCas !== void 0 &&
          _args$fmt2$toLowerCas.call(_args$fmt2).includes("hh:mm"))
      )
        return [
          undefined,
          "Invalid date format ".concat(JSON.stringify(args.fmt)),
        ];
      var dateVal = this.utils.moment(val.value, this.utils.moment.ISO_8601);
      if (dateVal.isValid()) {
        return [
          dateVal.format(
            wgtDef === null || wgtDef === void 0 ? void 0 : wgtDef.valueFormat
          ),
          [],
        ];
      } else {
        return [undefined, "Invalid date"];
      }
    },
    jsonLogic: function jsonLogic(val, fieldDef, wgtDef) {
      return this.utils.moment(val, wgtDef.valueFormat).toDate();
    },
    toJS: function toJS(val, fieldSettings) {
      var dateVal = this.utils.moment(val, fieldSettings.valueFormat);
      return dateVal.isValid() ? dateVal.toDate() : undefined;
    },
    mongoFormatValue: function mongoFormatValue(val, fieldDef, wgtDef) {
      var dateVal = this.utils.moment(val, wgtDef.valueFormat);
      return dateVal.isValid() ? dateVal.toDate() : undefined;
    },
  },
  time: {
    type: "time",
    jsType: "string",
    valueSrc: "value",
    timeFormat: "HH:mm",
    valueFormat: "HH:mm:ss",
    use12Hours: false,
    valueLabel: "Time",
    valuePlaceholder: "Enter time",
    valueLabels: [
      {
        label: "Time from",
        placeholder: "Enter time from",
      },
      {
        label: "Time to",
        placeholder: "Enter time to",
      },
    ],
    formatValue: function formatValue(val, fieldDef, wgtDef, isForDisplay) {
      var dateVal = this.utils.moment(val, wgtDef.valueFormat);
      return isForDisplay
        ? dateVal.format(wgtDef.timeFormat)
        : JSON.stringify(val);
    },
    sqlFormatValue: function sqlFormatValue(val, fieldDef, wgtDef, op, opDef) {
      var dateVal = this.utils.moment(val, wgtDef.valueFormat);
      return this.utils.SqlString.escape(dateVal.format("HH:mm:ss"));
    },
    spelFormatValue: function spelFormatValue(
      val,
      fieldDef,
      wgtDef,
      op,
      opDef
    ) {
      var dateVal = this.utils.moment(val, wgtDef.valueFormat);
      var fmt = "HH:mm:ss";
      var v = dateVal.format("HH:mm:ss");
      return "T(java.time.LocalTime).parse('".concat(v, "')");
      //return `new java.text.SimpleDateFormat('${fmt}').parse('${v}')`;
    },

    spelImportFuncs: [
      "T(java.time.LocalTime).parse(${v})",
      //"new java.text.SimpleDateFormat(${fmt}).parse(${v})"
    ],

    spelImportValue: function spelImportValue(val, wgtDef, args) {
      var _args$fmt3, _args$fmt3$toLowerCas, _args$fmt4;
      if (!wgtDef) return [undefined, "No widget def to get value format"];
      if (
        args !== null &&
        args !== void 0 &&
        args.fmt &&
        (!(
          (_args$fmt3 = args.fmt) !== null &&
          _args$fmt3 !== void 0 &&
          (_args$fmt3 = _args$fmt3.value) !== null &&
          _args$fmt3 !== void 0 &&
          (_args$fmt3$toLowerCas = _args$fmt3.toLowerCase) !== null &&
          _args$fmt3$toLowerCas !== void 0 &&
          _args$fmt3$toLowerCas.call(_args$fmt3).includes("hh:mm")
        ) ||
          ((_args$fmt4 = args.fmt) !== null &&
            _args$fmt4 !== void 0 &&
            (_args$fmt4 = _args$fmt4.value) !== null &&
            _args$fmt4 !== void 0 &&
            _args$fmt4.includes(" ")))
      )
        return [
          undefined,
          "Invalid time format ".concat(JSON.stringify(args.fmt)),
        ];
      var dateVal = this.utils.moment(val.value, "HH:mm:ss");
      if (dateVal.isValid()) {
        return [
          dateVal.format(
            wgtDef === null || wgtDef === void 0 ? void 0 : wgtDef.valueFormat
          ),
          [],
        ];
      } else {
        return [undefined, "Invalid date"];
      }
    },
    jsonLogic: function jsonLogic(val, fieldDef, wgtDef) {
      // return seconds of day
      var dateVal = this.utils.moment(val, wgtDef.valueFormat);
      return (
        dateVal.get("hour") * 60 * 60 +
        dateVal.get("minute") * 60 +
        dateVal.get("second")
      );
    },
    toJS: function toJS(val, fieldSettings) {
      // return seconds of day
      var dateVal = this.utils.moment(val, fieldSettings.valueFormat);
      return dateVal.isValid()
        ? dateVal.get("hour") * 60 * 60 +
            dateVal.get("minute") * 60 +
            dateVal.get("second")
        : undefined;
    },
    mongoFormatValue: function mongoFormatValue(val, fieldDef, wgtDef) {
      // return seconds of day
      var dateVal = this.utils.moment(val, wgtDef.valueFormat);
      return (
        dateVal.get("hour") * 60 * 60 +
        dateVal.get("minute") * 60 +
        dateVal.get("second")
      );
    },
    elasticSearchFormatValue: function elasticSearchFormatValue(
      queryType,
      value,
      operator,
      fieldName
    ) {
      return {
        script: {
          script: {
            source: "doc["
              .concat(fieldName, "][0].getHour() >== params.min && doc[")
              .concat(fieldName, "][0].getHour() <== params.max"),
            params: {
              min: value[0],
              max: value[1],
            },
          },
        },
      };
    },
  },
  datetime: {
    type: "datetime",
    jsType: "string",
    valueSrc: "value",
    timeFormat: "HH:mm",
    dateFormat: "DD.MM.YYYY",
    valueFormat: "YYYY-MM-DD HH:mm:ss",
    use12Hours: false,
    valueLabel: "Datetime",
    valuePlaceholder: "Enter datetime",
    valueLabels: [
      {
        label: "Datetime from",
        placeholder: "Enter datetime from",
      },
      {
        label: "Datetime to",
        placeholder: "Enter datetime to",
      },
    ],
    formatValue: function formatValue(val, fieldDef, wgtDef, isForDisplay) {
      var dateVal = this.utils.moment(val, wgtDef.valueFormat);
      return isForDisplay
        ? dateVal.format(wgtDef.dateFormat + " " + wgtDef.timeFormat)
        : JSON.stringify(val);
    },
    sqlFormatValue: function sqlFormatValue(val, fieldDef, wgtDef, op, opDef) {
      var dateVal = this.utils.moment(val, wgtDef.valueFormat);
      return this.utils.SqlString.escape(dateVal.toDate());
    },
    spelFormatValue: function spelFormatValue(
      val,
      fieldDef,
      wgtDef,
      op,
      opDef
    ) {
      var dateVal = this.utils.moment(val, wgtDef.valueFormat);
      var v = dateVal.format("YYYY-MM-DD HH:mm:ss");
      var fmt = "yyyy-MM-dd HH:mm:ss";
      //return `new java.text.SimpleDateFormat('${fmt}').parse('${v}')`;
      return "T(java.time.LocalDateTime).parse('"
        .concat(v, "', T(java.time.format.DateTimeFormatter).ofPattern('")
        .concat(fmt, "'))");
    },
    spelImportFuncs: [
      //"new java.text.SimpleDateFormat(${fmt}).parse(${v})",
      {
        obj: {
          cls: ["java", "time", "LocalDateTime"],
        },
        methodName: "parse",
        args: [
          {
            var: "v",
          },
          {
            obj: {
              cls: ["java", "time", "format", "DateTimeFormatter"],
            },
            methodName: "ofPattern",
            args: [
              {
                var: "fmt",
              },
            ],
          },
        ],
      },
    ],
    spelImportValue: function spelImportValue(val, wgtDef, args) {
      var _args$fmt5, _args$fmt5$includes;
      if (!wgtDef) return [undefined, "No widget def to get value format"];
      if (
        !(
          args !== null &&
          args !== void 0 &&
          (_args$fmt5 = args.fmt) !== null &&
          _args$fmt5 !== void 0 &&
          (_args$fmt5 = _args$fmt5.value) !== null &&
          _args$fmt5 !== void 0 &&
          (_args$fmt5$includes = _args$fmt5.includes) !== null &&
          _args$fmt5$includes !== void 0 &&
          _args$fmt5$includes.call(_args$fmt5, " ")
        )
      )
        return [
          undefined,
          "Invalid datetime format ".concat(JSON.stringify(args.fmt)),
        ];
      var dateVal = this.utils.moment(val.value, this.utils.moment.ISO_8601);
      if (dateVal.isValid()) {
        return [
          dateVal.format(
            wgtDef === null || wgtDef === void 0 ? void 0 : wgtDef.valueFormat
          ),
          [],
        ];
      } else {
        return [undefined, "Invalid date"];
      }
    },
    jsonLogic: function jsonLogic(val, fieldDef, wgtDef) {
      return this.utils.moment(val, wgtDef.valueFormat).toDate();
    },
    toJS: function toJS(val, fieldSettings) {
      var dateVal = this.utils.moment(val, fieldSettings.valueFormat);
      return dateVal.isValid() ? dateVal.toDate() : undefined;
    },
    mongoFormatValue: function mongoFormatValue(val, fieldDef, wgtDef) {
      var dateVal = this.utils.moment(val, wgtDef.valueFormat);
      return dateVal.isValid() ? dateVal.toDate() : undefined;
    },
  },
  boolean: {
    type: "boolean",
    jsType: "boolean",
    valueSrc: "value",
    labelYes: "Yes",
    labelNo: "No",
    formatValue: function formatValue(val, fieldDef, wgtDef, isForDisplay) {
      return isForDisplay ? (val ? "Yes" : "No") : JSON.stringify(!!val);
    },
    sqlFormatValue: function sqlFormatValue(val, fieldDef, wgtDef, op, opDef) {
      return this.utils.SqlString.escape(val);
    },
    spelFormatValue: function spelFormatValue(
      val,
      fieldDef,
      wgtDef,
      op,
      opDef
    ) {
      return this.utils.spelEscape(val);
    },
    defaultValue: false,
    toJS: function toJS(val, fieldSettings) {
      return val;
    },
    mongoFormatValue: function mongoFormatValue(val, fieldDef, wgtDef) {
      return val;
    },
  },
  field: {
    valueSrc: "field",
    formatValue: function formatValue(
      val,
      fieldDef,
      wgtDef,
      isForDisplay,
      op,
      opDef,
      rightFieldDef
    ) {
      return isForDisplay ? rightFieldDef.label || val : val;
    },
    sqlFormatValue: function sqlFormatValue(
      val,
      fieldDef,
      wgtDef,
      op,
      opDef,
      rightFieldDef
    ) {
      return val;
    },
    spelFormatValue: function spelFormatValue(
      val,
      fieldDef,
      wgtDef,
      op,
      opDef
    ) {
      return val;
    },
    valueLabel: "Field to compare",
    valuePlaceholder: "Select field to compare",
  },
  func: {
    valueSrc: "func",
    valueLabel: "Function",
    valuePlaceholder: "Select function",
  },
  case_value: {
    valueSrc: "value",
    type: "case_value",
    spelFormatValue: function spelFormatValue(val) {
      return this.utils.spelEscape(val === "" ? null : val);
    },
    spelImportValue: function spelImportValue(val) {
      return [val.value, []];
    },
  },
};

//----------------------------  types

var types = {
  text: {
    defaultOperator: "equal",
    mainWidget: "text",
    widgets: {
      text: {
        operators: [
          "equal",
          "not_equal",
          "in",
          "like",
          "not_like",
          "starts_with",
          "ends_with",
          "proximity",
          "is_empty",
          "is_not_empty",
          "is_null",
          "is_not_null",
        ],
        widgetProps: {},
        opProps: {},
      },
      textarea: {
        operators: [
          "equal",
          "not_equal",
          "like",
          "not_like",
          "starts_with",
          "ends_with",
          "is_empty",
          "is_not_empty",
          "is_null",
          "is_not_null",
        ],
        widgetProps: {},
        opProps: {},
      },
      field: {
        operators: [
          //unary ops (like `is_empty`) will be excluded anyway, see getWidgetsForFieldOp()
          "equal",
          "not_equal",
          "proximity", //can exclude if you want
        ],
      },
    },
  },

  number: {
    defaultOperator: "equal",
    mainWidget: "number",
    widgets: {
      number: {
        operators: [
          "equal",
          "not_equal",
          "less",
          "less_or_equal",
          "greater",
          "greater_or_equal",
          "between",
          "not_between",
          // "is_empty",
          // "is_not_empty",
          "is_null",
          "is_not_null",
        ],
      },
      slider: {
        operators: [
          "equal",
          "not_equal",
          "less",
          "less_or_equal",
          "greater",
          "greater_or_equal",
          // "is_empty",
          // "is_not_empty",
          "is_null",
          "is_not_null",
        ],
      },
    },
  },
  date: {
    defaultOperator: "equal",
    widgets: {
      date: {
        operators: [
          "equal",
          "not_equal",
          "less",
          "less_or_equal",
          "greater",
          "greater_or_equal",
          "between",
          "not_between",
          // "is_empty",
          // "is_not_empty",
          "is_null",
          "is_not_null",
        ],
      },
    },
  },
  time: {
    defaultOperator: "equal",
    widgets: {
      time: {
        operators: [
          "equal",
          "not_equal",
          "less",
          "less_or_equal",
          "greater",
          "greater_or_equal",
          "between",
          "not_between",
          // "is_empty",
          // "is_not_empty",
          "is_null",
          "is_not_null",
        ],
      },
    },
  },
  datetime: {
    defaultOperator: "equal",
    widgets: {
      datetime: {
        operators: [
          "equal",
          "not_equal",
          "less",
          "less_or_equal",
          "greater",
          "greater_or_equal",
          "between",
          "not_between",
          // "is_empty",
          // "is_not_empty",
          "is_null",
          "is_not_null",
        ],
      },
    },
  },
  select: {
    mainWidget: "select",
    defaultOperator: "select_equals",
    widgets: {
      select: {
        operators: [
          "select_equals",
          "select_not_equals",
          // "is_empty",
          // "is_not_empty",
          "is_null",
          "is_not_null",
        ],
      },
      multiselect: {
        operators: [
          "select_any_in",
          "select_not_any_in",
          // "is_empty",
          // "is_not_empty",
          "is_null",
          "is_not_null",
        ],
      },
    },
  },
  multiselect: {
    defaultOperator: "multiselect_equals",
    widgets: {
      multiselect: {
        operators: [
          "multiselect_contains",
          "multiselect_not_contains",
          "multiselect_equals",
          "multiselect_not_equals",
          // "is_empty",
          // "is_not_empty",
          "is_null",
          "is_not_null",
        ],
      },
    },
  },
  boolean: {
    defaultOperator: "equal",
    widgets: {
      boolean: {
        operators: ["equal", "not_equal", "is_null", "is_not_null"],
        widgetProps: {
          //you can enable this if you don't use fields as value sources
          // hideOperator: true,
          // operatorInlineLabel: "is",
        },
      },
      field: {
        operators: ["equal", "not_equal"],
      },
    },
  },
  "!group": {
    defaultOperator: "some",
    mainWidget: "number",
    widgets: {
      number: {
        widgetProps: {
          min: 0,
        },
        operators: [
          // w/o operand
          "some",
          "all",
          "none",
          // w/ operand - count
          "equal",
          "not_equal",
          "less",
          "less_or_equal",
          "greater",
          "greater_or_equal",
          "between",
          "not_between",
        ],
        opProps: {
          equal: {
            label: "Count ==",
          },
          not_equal: {
            label: "Count !=",
          },
          less: {
            label: "Count <",
          },
          less_or_equal: {
            label: "Count <=",
          },
          greater: {
            label: "Count >",
          },
          greater_or_equal: {
            label: "Count >=",
          },
          between: {
            label: "Count between",
          },
          not_between: {
            label: "Count not between",
          },
        },
      },
    },
  },
  case_value: {
    mainWidget: "case_value",
    widgets: {
      case_value: {},
    },
  },
};

//----------------------------  settings

var settings = _objectSpread(
  _objectSpread({}, _default2.settings),
  {},
  {
    convertableWidgets: {
      number: ["slider", "rangeslider"],
      slider: ["number", "rangeslider"],
      rangeslider: ["number", "slider"],
      text: ["textarea"],
      textarea: ["text"],
    },
    formatSpelField: function formatSpelField(
      field,
      parentField,
      parts,
      partsExt,
      fieldDefinition,
      config
    ) {
      var _this11 = this;
      var fieldName = partsExt
        .map(function (_ref, ind) {
          var key = _ref.key,
            parent = _ref.parent,
            sep = _ref.fieldSeparator;
          if (ind == 0) {
            if (parent == "[map]")
              return "#this[".concat(_this11.utils.spelEscape(key), "]");
            else if (parent == "[class]") return key;
            else return key;
          } else {
            if (parent == "map" || parent == "[map]")
              return "[".concat(_this11.utils.spelEscape(key), "]");
            else if (parent == "class" || parent == "[class]")
              return "".concat(sep).concat(key);
            else return "".concat(sep).concat(key);
          }
        })
        .join("");
      if (fieldDefinition.fieldName) {
        fieldName = field;
      }
      if (fieldDefinition.isSpelVariable) {
        fieldName = "#" + fieldName;
      }
      return fieldName;
    },
    sqlFormatReverse: function sqlFormatReverse(q) {
      if (q == undefined) return undefined;
      return "NOT(" + q + ")";
    },
    spelFormatReverse: function spelFormatReverse(q) {
      if (q == undefined) return undefined;
      return "!(" + q + ")";
    },
    formatReverse: function formatReverse(
      q,
      operator,
      reversedOp,
      operatorDefinition,
      revOperatorDefinition,
      isForDisplay
    ) {
      if (q == undefined) return undefined;
      if (isForDisplay) return "NOT (" + q + ")";
      else return "!(" + q + ")";
    },
    formatAggr: function formatAggr(
      whereStr,
      aggrField,
      operator,
      value,
      valueSrc,
      valueType,
      opDef,
      operatorOptions,
      isForDisplay,
      aggrFieldDef
    ) {
      var labelForFormat = opDef.labelForFormat,
        cardinality = opDef.cardinality;
      if (cardinality == 0) {
        var cond = whereStr ? " HAVE ".concat(whereStr) : "";
        return "".concat(labelForFormat, " OF ").concat(aggrField).concat(cond);
      } else if (cardinality == undefined || cardinality == 1) {
        var _cond = whereStr ? " WHERE ".concat(whereStr) : "";
        return "COUNT OF "
          .concat(aggrField)
          .concat(_cond, " ")
          .concat(labelForFormat, " ")
          .concat(value);
      } else if (cardinality == 2) {
        var _cond2 = whereStr ? " WHERE ".concat(whereStr) : "";
        var valFrom = value.first();
        var valTo = value.get(1);
        return "COUNT OF "
          .concat(aggrField)
          .concat(_cond2, " ")
          .concat(labelForFormat, " ")
          .concat(valFrom, " AND ")
          .concat(valTo);
      }
    },
    jsonLogic: {
      groupVarKey: "var",
      altVarKey: "var",
      lockedOp: "locked",
    },
    canCompareFieldWithField: function canCompareFieldWithField(
      leftField,
      leftFieldConfig,
      rightField,
      rightFieldConfig
    ) {
      //for type == 'select'/'multiselect' you can check listValues
      return true;
    },
    // enable compare fields
    valueSourcesInfo: {
      value: {
        label: "Value",
      },
      field: {
        label: "Field",
        widget: "field",
      },
      func: {
        label: "Function",
        widget: "func",
      },
    },
  }
);

//----------------------------

var _addMixins = function _addMixins(config, mixins) {
  var doAdd =
    arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
  var mixinFuncs = {
    rangeslider: mixinWidgetRangeslider,
    treeselect: mixinWidgetTreeselect,
    treemultiselect: mixinWidgetTreemultiselect,
    rangeable__date: mixinRangeableWidget("date", "date"),
  };
  var _iterator = _createForOfIteratorHelper(mixins),
    _step;
  try {
    for (_iterator.s(); !(_step = _iterator.n()).done; ) {
      var mixName = _step.value;
      var mixinFunc = mixinFuncs[mixName];
      if (mixinFunc) {
        config = mixinFunc(config, doAdd);
      } else {
        throw new Error(
          "Can't ".concat(doAdd ? "add" : "remove", " mixin ").concat(mixName)
        );
      }
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
  return config;
};
var addMixins = function addMixins(config, mixins) {
  return _addMixins(config, mixins, true);
};
var removeMixins = function removeMixins(config, mixins) {
  return _addMixins(config, mixins, false);
};
var mixinRangeableWidget = function mixinRangeableWidget(type, widget) {
  return function (config) {
    var addMixin =
      arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
    var types = config.types;
    types = _objectSpread(
      _objectSpread({}, types),
      {},
      (0, _defineProperty2["default"])(
        {},
        type,
        _objectSpread(
          _objectSpread({}, types[type]),
          {},
          {
            widgets: _objectSpread({}, types[type].widgets),
          }
        )
      )
    );
    if (addMixin) {
      types[type].widgets[widget] = _objectSpread(
        {
          opProps: {
            between: {
              isSpecialRange: true,
              textSeparators: [null, null],
            },
            not_between: {
              isSpecialRange: true,
              textSeparators: [null, null],
            },
          },
        },
        types[type].widgets[widget]
      );
    } else {
      delete types[type].widgets[widget];
    }
    return _objectSpread(
      _objectSpread({}, config),
      {},
      {
        types: types,
      }
    );
  };
};
var mixinWidgetRangeslider = function mixinWidgetRangeslider(config) {
  var addMixin =
    arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
  var widgets = config.widgets,
    types = config.types;
  widgets = _objectSpread({}, widgets);
  if (addMixin) {
    widgets.rangeslider = _objectSpread(
      {
        type: "number",
        jsType: "number",
        valueSrc: "value",
        valueLabel: "Range",
        valuePlaceholder: "Select range",
        valueLabels: [
          {
            label: "Number from",
            placeholder: "Enter number from",
          },
          {
            label: "Number to",
            placeholder: "Enter number to",
          },
        ],
        formatValue: function formatValue(val, fieldDef, wgtDef, isForDisplay) {
          return isForDisplay
            ? this.utils.stringifyForDisplay(val)
            : JSON.stringify(val);
        },
        sqlFormatValue: function sqlFormatValue(
          val,
          fieldDef,
          wgtDef,
          op,
          opDef
        ) {
          return this.utils.SqlString.escape(val);
        },
        spelFormatValue: function spelFormatValue(val) {
          return this.utils.spelEscape(val);
        },
        singleWidget: "slider",
        toJS: function toJS(val, fieldSettings) {
          return val;
        },
      },
      widgets.rangeslider
    );
  } else {
    delete widgets.rangeslider;
  }
  types = _objectSpread(
    _objectSpread({}, types),
    {},
    {
      number: _objectSpread(
        _objectSpread({}, types.number),
        {},
        {
          widgets: _objectSpread({}, types.number.widgets),
        }
      ),
    }
  );
  if (addMixin) {
    types.number.widgets.rangeslider = _objectSpread(
      {
        opProps: {
          between: {
            isSpecialRange: true,
          },
          not_between: {
            isSpecialRange: true,
          },
        },
        operators: [
          "between",
          "not_between",
          // "is_empty",
          // "is_not_empty",
          "is_null",
          "is_not_null",
        ],
      },
      types.number.widgets.rangeslider
    );
  } else {
    delete types.number.widgets.rangeslider;
  }
  return _objectSpread(
    _objectSpread({}, config),
    {},
    {
      widgets: widgets,
      types: types,
    }
  );
};
var mixinWidgetTreeselect = function mixinWidgetTreeselect(config) {
  var addMixin =
    arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
  var widgets = config.widgets,
    types = config.types;
  widgets = _objectSpread({}, widgets);
  if (addMixin) {
    widgets.treeselect = _objectSpread(
      {
        type: "treeselect",
        jsType: "string",
        valueSrc: "value",
        valueLabel: "Value",
        valuePlaceholder: "Select value",
        formatValue: function formatValue(val, fieldDef, wgtDef, isForDisplay) {
          var treeData =
            fieldDef.fieldSettings.treeValues ||
            fieldDef.fieldSettings.listValues ||
            fieldDef.asyncListValues;
          var valLabel = this.utils.getTitleInListValues(treeData, val);
          return isForDisplay
            ? this.utils.stringifyForDisplay(valLabel)
            : JSON.stringify(val);
        },
        sqlFormatValue: function sqlFormatValue(
          val,
          fieldDef,
          wgtDef,
          op,
          opDef
        ) {
          return this.utils.SqlString.escape(val);
        },
        spelFormatValue: function spelFormatValue(val) {
          return this.utils.spelEscape(val);
        },
        toJS: function toJS(val, fieldSettings) {
          return val;
        },
      },
      widgets.treeselect
    );
  } else {
    delete widgets.treeselect;
  }
  types = _objectSpread({}, types);
  if (addMixin) {
    types.treeselect = _objectSpread(
      {
        mainWidget: "treeselect",
        defaultOperator: "select_equals",
        widgets: {
          treeselect: {
            operators: ["select_equals", "select_not_equals"],
          },
          treemultiselect: {
            operators: ["select_any_in", "select_not_any_in"],
          },
        },
      },
      types.treeselect
    );
  } else {
    delete types.treeselect;
  }
  return _objectSpread(
    _objectSpread({}, config),
    {},
    {
      widgets: widgets,
      types: types,
    }
  );
};
var mixinWidgetTreemultiselect = function mixinWidgetTreemultiselect(config) {
  var addMixin =
    arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
  var widgets = config.widgets,
    types = config.types;
  widgets = _objectSpread({}, widgets);
  if (addMixin) {
    widgets.treemultiselect = _objectSpread(
      {
        type: "treemultiselect",
        jsType: "array",
        valueSrc: "value",
        valueLabel: "Values",
        valuePlaceholder: "Select values",
        formatValue: function formatValue(
          vals,
          fieldDef,
          wgtDef,
          isForDisplay
        ) {
          var _this12 = this;
          var treeData =
            fieldDef.fieldSettings.treeValues ||
            fieldDef.fieldSettings.listValues ||
            fieldDef.asyncListValues;
          var valsLabels = vals.map(function (v) {
            return _this12.utils.getTitleInListValues(treeData, v);
          });
          return isForDisplay
            ? valsLabels.map(this.utils.stringifyForDisplay)
            : vals.map(JSON.stringify);
        },
        sqlFormatValue: function sqlFormatValue(
          vals,
          fieldDef,
          wgtDef,
          op,
          opDef
        ) {
          var _this13 = this;
          return vals.map(function (v) {
            return _this13.utils.SqlString.escape(v);
          });
        },
        spelFormatValue: function spelFormatValue(val) {
          return this.utils.spelEscape(val);
        },
        toJS: function toJS(val, fieldSettings) {
          return val;
        },
      },
      widgets.treemultiselect
    );
  } else {
    delete widgets.treemultiselect;
  }
  types = _objectSpread({}, types);
  if (addMixin) {
    types.treemultiselect = _objectSpread(
      {
        defaultOperator: "multiselect_equals",
        widgets: {
          treemultiselect: {
            operators: ["multiselect_equals", "multiselect_not_equals"],
          },
        },
      },
      types.treemultiselect
    );
  } else {
    delete types.treemultiselect;
  }
  return _objectSpread(
    _objectSpread({}, config),
    {},
    {
      widgets: widgets,
      types: types,
    }
  );
};
var ConfigMixins = (exports.ConfigMixins = {
  addMixins: addMixins,
  removeMixins: removeMixins,
});

//----------------------------

var config = {
  conjunctions: conjunctions,
  operators: operators,
  widgets: widgets,
  types: types,
  settings: settings,
  ctx: _ctx["default"],
};
// Mixin advanced widgets just to allow using it on server-side eg. for export routines
config = addMixins(config, ["rangeslider", "treeselect", "treemultiselect"]);
var _default = (exports["default"] = config);
