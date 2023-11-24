"use strict";

var _typeof = require("@babel/runtime/helpers/typeof");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setNot = exports.setLock = exports.setConjunction = void 0;
var constants = _interopRequireWildcard(require("../stores/constants"));
var _stuff = require("../utils/stuff");
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != _typeof(e) && "function" != typeof e) return { "default": e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n["default"] = e, t && t.set(e, n), n; }
/**
 * @param {object} config
 * @param {Immutable.List} path
 * @param {string} conjunction
 */
var setConjunction = exports.setConjunction = function setConjunction(config, path, conjunction) {
  return {
    type: constants.SET_CONJUNCTION,
    path: (0, _stuff.toImmutableList)(path),
    conjunction: conjunction
  };
};

/**
 * @param {object} config
 * @param {Immutable.List} path
 * @param {bool} not
 */
var setNot = exports.setNot = function setNot(config, path, not) {
  return {
    type: constants.SET_NOT,
    path: (0, _stuff.toImmutableList)(path),
    not: not
  };
};

/**
 * @param {object} config
 * @param {Immutable.List} path
 * @param {bool} lock
 */
var setLock = exports.setLock = function setLock(config, path, lock) {
  return {
    type: constants.SET_LOCK,
    path: (0, _stuff.toImmutableList)(path),
    lock: lock
  };
};