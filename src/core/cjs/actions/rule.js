"use strict";

var _typeof = require("@babel/runtime/helpers/typeof");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setValueSrc = exports.setValue = exports.setOperatorOption = exports.setOperator = exports.setFieldSrc = exports.setField = void 0;
var constants = _interopRequireWildcard(require("../stores/constants"));
var _stuff = require("../utils/stuff");
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != _typeof(e) && "function" != typeof e) return { "default": e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n["default"] = e, t && t.set(e, n), n; }
/**
 * @param {object} config
 * @param {Immutable.List} path
 * @param {string} field
 */
var setField = exports.setField = function setField(config, path, field, asyncListValues, __isInternal) {
  return {
    type: constants.SET_FIELD,
    path: (0, _stuff.toImmutableList)(path),
    field: field,
    config: config,
    asyncListValues: asyncListValues,
    __isInternal: __isInternal
  };
};

/**
 * @param {object} config
 * @param {Immutable.List} path
 * @param {*} srcKey
 */
var setFieldSrc = exports.setFieldSrc = function setFieldSrc(config, path, srcKey) {
  return {
    type: constants.SET_FIELD_SRC,
    path: (0, _stuff.toImmutableList)(path),
    srcKey: srcKey,
    config: config
  };
};

/**
 * @param {object} config
 * @param {Immutable.List} path
 * @param {string} operator
 */
var setOperator = exports.setOperator = function setOperator(config, path, operator) {
  return {
    type: constants.SET_OPERATOR,
    path: (0, _stuff.toImmutableList)(path),
    operator: operator,
    config: config
  };
};

/**
 * @param {object} config
 * @param {Immutable.List} path
 * @param {integer} delta
 * @param {*} value
 * @param {string} valueType
 * @param {*} asyncListValues
 * @param {boolean} __isInternal
 */
var setValue = exports.setValue = function setValue(config, path, delta, value, valueType, asyncListValues, __isInternal) {
  return {
    type: constants.SET_VALUE,
    path: (0, _stuff.toImmutableList)(path),
    delta: delta,
    value: value,
    valueType: valueType,
    asyncListValues: asyncListValues,
    config: config,
    __isInternal: __isInternal
  };
};

/**
 * @param {object} config
 * @param {Immutable.List} path
 * @param {integer} delta
 * @param {*} srcKey
 */
var setValueSrc = exports.setValueSrc = function setValueSrc(config, path, delta, srcKey) {
  return {
    type: constants.SET_VALUE_SRC,
    path: (0, _stuff.toImmutableList)(path),
    delta: delta,
    srcKey: srcKey,
    config: config
  };
};

/**
 * @param {object} config
 * @param {Immutable.List} path
 * @param {string} name
 * @param {*} value
 */
var setOperatorOption = exports.setOperatorOption = function setOperatorOption(config, path, name, value) {
  return {
    type: constants.SET_OPERATOR_OPTION,
    path: (0, _stuff.toImmutableList)(path),
    name: name,
    value: value,
    config: config
  };
};