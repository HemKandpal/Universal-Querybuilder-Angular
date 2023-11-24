"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
var _typeof3 = require("@babel/runtime/helpers/typeof");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.applyToJS = applyToJS;
exports.logger = exports.isJsonLogic = exports.isJsonCompatible = exports.isJSX = exports.isImmutable = exports.isDirtyJSX = exports.getLogger = exports.getFirstDefined = exports.escapeRegExp = exports.defaultValue = exports.deepFreeze = exports.deepEqual = exports.cleanJSX = void 0;
exports.mergeArraysSmart = mergeArraysSmart;
exports.shallowEqual = exports.opDefKeysToOmit = void 0;
exports.sleep = sleep;
exports.toImmutableList = toImmutableList;
Object.defineProperty(exports, "uuid", {
  enumerable: true,
  get: function get() {
    return _uuid["default"];
  }
});
exports.widgetDefKeysToOmit = void 0;
var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));
var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));
var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));
var _immutable = _interopRequireWildcard(require("immutable"));
var _omit = _interopRequireDefault(require("lodash/omit"));
var _uuid = _interopRequireDefault(require("./uuid"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != _typeof3(e) && "function" != typeof e) return { "default": e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n["default"] = e, t && t.set(e, n), n; }
var isObject = function isObject(v) {
  return (0, _typeof2["default"])(v) == "object" && v !== null && !Array.isArray(v);
};
var widgetDefKeysToOmit = exports.widgetDefKeysToOmit = ["formatValue", "mongoFormatValue", "sqlFormatValue", "jsonLogic", "elasticSearchFormatValue", "spelFormatValue", "spelImportFuncs", "spelImportValue"];
var opDefKeysToOmit = exports.opDefKeysToOmit = ["formatOp", "mongoFormatOp", "sqlFormatOp", "jsonLogic", "spelFormatOp"];

// RegExp.quote = function (str) {
//     return str.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
// };

var defaultValue = exports.defaultValue = function defaultValue(value, _default) {
  return typeof value === "undefined" ? _default : value;
};

// const immutableEqual = function(v1, v2) {
//   if (v1 === v2) {
//     return true;
//   } else {
//     return v1.equals(v2);
//   }
// };

var deepEqual = exports.deepEqual = function deepEqual(v1, v2) {
  if (v1 === v2) {
    return true;
  } else if (_immutable.Map.isMap(v1)) {
    return v1.equals(v2);
  } else {
    return JSON.stringify(v1) == JSON.stringify(v2);
  }
};

// //Do sets have same values?
// const eqSet = function (as, bs) {
//   if (as.size !== bs.size) return false;
//   for (var a of as) if (!bs.has(a)) return false;
//   return true;
// };

// //Do arrays have same values?
// const eqArrSet = function (arr1, arr2) {
//   return eqSet(new Set(arr1), new Set(arr2));
// };

var shallowEqual = exports.shallowEqual = function shallowEqual(a, b) {
  var deep = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
  if (a === b) {
    return true;
  } else if (Array.isArray(a)) return shallowEqualArrays(a, b, deep);else if (_immutable.Map.isMap(a)) return a.equals(b);else if ((0, _typeof2["default"])(a) == "object") return shallowEqualObjects(a, b, deep);else return a === b;
};
function shallowEqualArrays(arrA, arrB) {
  var deep = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
  if (arrA === arrB) {
    return true;
  }
  if (!arrA || !arrB) {
    return false;
  }
  var len = arrA.length;
  if (arrB.length !== len) {
    return false;
  }
  for (var i = 0; i < len; i++) {
    var isEqual = deep ? shallowEqual(arrA[i], arrB[i], deep) : arrA[i] === arrB[i];
    if (!isEqual) {
      return false;
    }
  }
  return true;
}
function shallowEqualObjects(objA, objB) {
  var deep = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
  if (objA === objB) {
    return true;
  }
  if (!objA || !objB) {
    return false;
  }
  var aKeys = Object.keys(objA);
  var bKeys = Object.keys(objB);
  var len = aKeys.length;
  if (bKeys.length !== len) {
    return false;
  }
  for (var i = 0; i < len; i++) {
    var key = aKeys[i];
    var isEqual = deep ? shallowEqual(objA[key], objB[key], deep) : objA[key] === objB[key];
    if (!isEqual) {
      return false;
    }
  }
  return true;
}
var isImmutable = exports.isImmutable = function isImmutable(v) {
  return (0, _typeof2["default"])(v) === "object" && v !== null && typeof v.toJS === "function";
};
function toImmutableList(v) {
  return isImmutable(v) ? v : new _immutable["default"].List(v);
}
function applyToJS(v) {
  return isImmutable(v) ? v.toJS() : v;
}
var escapeRegExp = exports.escapeRegExp = function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&"); // $& means the whole matched string
};

var cleanJSX = exports.cleanJSX = function cleanJSX(jsx) {
  var jsxKeys = ["$$typeof", "_owner", "_store", "ref", "key"];
  var getName = function getName(val) {
    if (typeof val === "string") {
      return val;
    } else if (typeof val === "function") {
      return val.name;
    }
    return val;
  };
  if (jsx instanceof Array) {
    return jsx.map(function (el, _i) {
      return cleanJSX(el);
    });
  } else if ((0, _typeof2["default"])(jsx) === "object" && jsx !== null) {
    if (isDirtyJSX(jsx)) {
      var _cleaned$props;
      var cleaned = (0, _omit["default"])(jsx, jsxKeys);
      if (cleaned.type) {
        cleaned.type = getName(cleaned.type);
      }
      if (cleaned !== null && cleaned !== void 0 && (_cleaned$props = cleaned.props) !== null && _cleaned$props !== void 0 && _cleaned$props.children) {
        cleaned.props.children = cleanJSX(cleaned.props.children);
      }
      return cleaned;
    }
  }
  return jsx;
};
var isDirtyJSX = exports.isDirtyJSX = function isDirtyJSX(jsx) {
  return (0, _typeof2["default"])(jsx) === "object" && jsx !== null && !Array.isArray(jsx) && Object.keys(jsx).includes("type") && Object.keys(jsx).includes("props") // even if {}
  && Object.keys(jsx).includes("key") // even if null
  && Object.keys(jsx).includes("ref") // even if null
  && Object.keys(jsx).includes("$$typeof"); // Symbol(react.element)
};

var isJSX = exports.isJSX = function isJSX(jsx) {
  return (0, _typeof2["default"])(jsx) === "object" && jsx !== null && !Array.isArray(jsx) && typeof jsx["type"] === "string" && Object.keys(jsx).includes("props");
};
var isJsonLogic = exports.isJsonLogic = function isJsonLogic(logic) {
  var isJL = (0, _typeof2["default"])(logic) === "object" // An object
  && logic !== null // but not null
  && !Array.isArray(logic) // and not an array
  && Object.keys(logic).length === 1; // with exactly one key
  if (isJL) {
    // additional checks ?
  }
  return isJL;
};
function sleep(delay) {
  return new Promise(function (resolve) {
    setTimeout(resolve, delay);
  });
}

// [1, 4, 9] + [1, 5, 9] => [1, 4, 5, 9]
// Used for merging arrays of operators for different widgets of 1 type
function mergeArraysSmart(arr1, arr2) {
  if (!arr1) arr1 = [];
  if (!arr2) arr2 = [];
  return arr2.map(function (op) {
    return [op, arr1.indexOf(op)];
  }).map(function (_ref, i, orig) {
    var _ref2 = (0, _slicedToArray2["default"])(_ref, 2),
      op = _ref2[0],
      ind = _ref2[1];
    if (ind == -1) {
      var next = orig.slice(i + 1);
      var prev = orig.slice(0, i);
      var after = prev.reverse().find(function (_ref3) {
        var _ref4 = (0, _slicedToArray2["default"])(_ref3, 2),
          _cop = _ref4[0],
          ci = _ref4[1];
        return ci != -1;
      });
      var before = next.find(function (_ref5) {
        var _ref6 = (0, _slicedToArray2["default"])(_ref5, 2),
          _cop = _ref6[0],
          ci = _ref6[1];
        return ci != -1;
      });
      if (before) return [op, "before", before[0]];else if (after) return [op, "after", after[0]];else return [op, "append", null];
    } else {
      // already exists
      return null;
    }
  }).filter(function (x) {
    return x !== null;
  }).reduce(function (acc, _ref7) {
    var _ref8 = (0, _slicedToArray2["default"])(_ref7, 3),
      newOp = _ref8[0],
      rel = _ref8[1],
      relOp = _ref8[2];
    var ind = acc.indexOf(relOp);
    if (acc.indexOf(newOp) == -1) {
      if (ind > -1) {
        // insert after or before
        acc.splice(ind + (rel == "after" ? 1 : 0), 0, newOp);
      } else {
        // insert to end or start
        acc.splice(rel == "append" ? Infinity : 0, 0, newOp);
      }
    }
    return acc;
  }, arr1.slice());
}
var deepFreeze = exports.deepFreeze = function deepFreeze(obj) {
  if ((0, _typeof2["default"])(obj) === "object" && obj !== null) {
    Object.keys(obj).forEach(function (prop) {
      deepFreeze(obj[prop]);
    });
    Object.freeze(obj);
  }
};
var isJsonCompatible = exports.isJsonCompatible = function isJsonCompatible(tpl, obj) {
  var bag = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var path = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : [];
  if (isObject(tpl)) {
    if (tpl["var"]) {
      bag[tpl["var"]] = obj;
      return true;
    }
    if (!isObject(obj)) return false;
    for (var k in tpl) {
      var tv = tpl[k];
      var ov = obj[k];
      if (!isJsonCompatible(tv, ov, bag, [].concat((0, _toConsumableArray2["default"])(path), [k]))) return false;
    }
    return true;
  } else if (Array.isArray(tpl)) {
    if (!Array.isArray(obj)) return false;
    for (var i = 0; i < tpl.length; i++) {
      var _tv = tpl[i];
      var _ov = obj[i];
      if (!isJsonCompatible(_tv, _ov, bag, [].concat((0, _toConsumableArray2["default"])(path), [i]))) return false;
    }
    return true;
  } else {
    return tpl === obj;
  }
};
var isDev = function isDev() {
  return typeof process !== "undefined" && process.env && process.env.NODE_ENV == "development";
};
var getLogger = exports.getLogger = function getLogger() {
  var devMode = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
  var verbose = devMode != undefined ? devMode : isDev();
  return verbose ? console : {
    error: function error() {},
    log: function log() {},
    warn: function warn() {},
    debug: function debug() {},
    info: function info() {}
  };
};
var getFirstDefined = exports.getFirstDefined = function getFirstDefined() {
  var arr = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  var ret;
  for (var i = 0; i < arr.length; i++) {
    var v = arr[i];
    if (v !== undefined) {
      ret = v;
      break;
    }
  }
  return ret;
};
var logger = exports.logger = getLogger();