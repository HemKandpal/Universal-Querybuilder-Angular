"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
var _typeof = require("@babel/runtime/helpers/typeof");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setTree = exports.removeRule = exports.removeGroup = exports.moveItem = exports.addRule = exports.addGroup = exports.addDefaultCaseGroup = exports.addCaseGroup = void 0;
var _immutable = _interopRequireDefault(require("immutable"));
var _stuff = require("../utils/stuff");
var constants = _interopRequireWildcard(require("../stores/constants"));
var _defaultUtils = require("../utils/defaultUtils");
var _uuid = _interopRequireDefault(require("../utils/uuid"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != _typeof(e) && "function" != typeof e) return { "default": e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n["default"] = e, t && t.set(e, n), n; }
/**
 * @param {object} config
 * @param {Immutable.Map} tree
 */
var setTree = exports.setTree = function setTree(config, tree) {
  return {
    type: constants.SET_TREE,
    tree: tree,
    config: config
  };
};

/**
 * @param {object} config
 * @param {Immutable.List} path
 * @param {Immutable.Map} properties
 */
var addRule = exports.addRule = function addRule(config, path, properties) {
  var ruleType = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : "rule";
  var children = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : null;
  var parentRuleGroupPath = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : null;
  return {
    type: constants.ADD_RULE,
    ruleType: ruleType,
    children: children,
    path: (0, _stuff.toImmutableList)(path),
    id: (0, _uuid["default"])(),
    properties: (0, _defaultUtils.defaultRuleProperties)(config, parentRuleGroupPath).merge(properties || {}),
    config: config
  };
};

/**
 * @param {object} config
 * @param {Immutable.List} path
 */
var removeRule = exports.removeRule = function removeRule(config, path) {
  return {
    type: constants.REMOVE_RULE,
    path: (0, _stuff.toImmutableList)(path),
    config: config
  };
};

/**
 * @param {object} config
 * @param {Immutable.List} path
 * @param {Immutable.Map} properties
 */
var addDefaultCaseGroup = exports.addDefaultCaseGroup = function addDefaultCaseGroup(config, path, properties) {
  var children = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
  return {
    type: constants.ADD_CASE_GROUP,
    path: (0, _stuff.toImmutableList)(path),
    children: children,
    id: (0, _uuid["default"])(),
    properties: (0, _defaultUtils.defaultGroupProperties)(config).merge(properties || {}),
    config: config,
    meta: {
      isDefaultCase: true
    }
  };
};

/**
 * @param {object} config
 * @param {Immutable.List} path
 * @param {Immutable.Map} properties
 */
var addCaseGroup = exports.addCaseGroup = function addCaseGroup(config, path, properties) {
  var children = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
  return {
    type: constants.ADD_CASE_GROUP,
    path: (0, _stuff.toImmutableList)(path),
    children: children,
    id: (0, _uuid["default"])(),
    properties: (0, _defaultUtils.defaultGroupProperties)(config).merge(properties || {}),
    config: config
  };
};

/**
 * @param {object} config
 * @param {Immutable.List} path
 * @param {Immutable.Map} properties
 */
var addGroup = exports.addGroup = function addGroup(config, path, properties) {
  var children = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
  return {
    type: constants.ADD_GROUP,
    path: (0, _stuff.toImmutableList)(path),
    children: children,
    id: (0, _uuid["default"])(),
    properties: (0, _defaultUtils.defaultGroupProperties)(config).merge(properties || {}),
    config: config
  };
};

/**
 * @param {object} config
 * @param {Immutable.List} path
 */
var removeGroup = exports.removeGroup = function removeGroup(config, path) {
  return {
    type: constants.REMOVE_GROUP,
    path: (0, _stuff.toImmutableList)(path),
    config: config
  };
};

/**
 * @param {object} config
 * @param {Array} fromPath
 * @param {Array} toPath
 * @param {String} placement, see constants PLACEMENT_*
 */
var moveItem = exports.moveItem = function moveItem(config, fromPath, toPath, placement) {
  return {
    type: constants.MOVE_ITEM,
    fromPath: (0, _stuff.toImmutableList)(fromPath),
    toPath: (0, _stuff.toImmutableList)(toPath),
    placement: placement,
    config: config
  };
};