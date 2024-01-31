"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.loadFromSpel = exports._loadFromSpel = void 0;
var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));
var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));
var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));
var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));
var _spel2js = require("spel2js");
var _uuid = _interopRequireDefault(require("../utils/uuid"));
var _configUtils = require("../utils/configUtils");
var _ruleUtils = require("../utils/ruleUtils");
var _tree = require("./tree");
var _defaultUtils = require("../utils/defaultUtils");
var _stuff = require("../utils/stuff");
var _moment = _interopRequireDefault(require("moment"));
var _spel = require("../export/spel");
function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e2) { throw _e2; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e3) { didErr = true; err = _e3; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { (0, _defineProperty2["default"])(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
// https://docs.spring.io/spring-framework/docs/3.2.x/spring-framework-reference/html/expressions.html#expressions
// spel type => raqb type
var SpelPrimitiveTypes = {
  number: "number",
  string: "text",
  "boolean": "boolean",
  "null": "null" // should not be
};
// spel class => raqb type
var SpelPrimitiveClasses = {
  String: "text"
};
var ListValueType = "multiselect";
var isFuncableProperty = function isFuncableProperty(p) {
  return ["length"].includes(p);
};
var isObject = function isObject(v) {
  return (0, _typeof2["default"])(v) == "object" && v !== null && !Array.isArray(v);
};
var loadFromSpel = exports.loadFromSpel = function loadFromSpel(logicTree, config) {
  return _loadFromSpel(logicTree, config, true);
};
var _loadFromSpel = exports._loadFromSpel = function _loadFromSpel(spelStr, config) {
  var returnErrors = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
  //meta is mutable
  var meta = {
    errors: []
  };
  var extendedConfig = (0, _configUtils.extendConfig)(config, undefined, false);
  var conv = buildConv(extendedConfig);
  var compiledExpression;
  var convertedObj;
  var jsTree = undefined;
  try {
    var compileRes = _spel2js.SpelExpressionEvaluator.compile(spelStr);
    compiledExpression = compileRes._compiledExpression;
  } catch (e) {
    meta.errors.push(e);
  }
  if (compiledExpression) {
    //logger.debug("compiledExpression:", compiledExpression);
    convertedObj = postprocessCompiled(compiledExpression, meta);
    _stuff.logger.debug("convertedObj:", convertedObj, meta);
    jsTree = convertToTree(convertedObj, conv, extendedConfig, meta);
    if (jsTree && jsTree.type != "group" && jsTree.type != "switch_group") {
      jsTree = wrapInDefaultConj(jsTree, extendedConfig, convertedObj["not"]);
    }
    _stuff.logger.debug("jsTree:", jsTree);
  }
  var immTree = jsTree ? (0, _tree.loadTree)(jsTree) : undefined;
  if (returnErrors) {
    return [immTree, meta.errors];
  } else {
    if (meta.errors.length) console.warn("Errors while importing from SpEL:", meta.errors);
    return immTree;
  }
};
var postprocessCompiled = function postprocessCompiled(expr, meta) {
  var parentExpr = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
  var type = expr.getType();
  var children = expr.getChildren().map(function (child) {
    return postprocessCompiled(child, meta, expr);
  });

  // flatize OR/AND
  if (type == "op-or" || type == "op-and") {
    children = children.reduce(function (acc, child) {
      var canFlatize = child.type == type && !child.not;
      var flat = canFlatize ? child.children : [child];
      return [].concat((0, _toConsumableArray2["default"])(acc), (0, _toConsumableArray2["default"])(flat));
    }, []);
  }

  // unwrap NOT
  if (type == "op-not") {
    if (children.length != 1) {
      meta.errors.push("Operator NOT should have 1 child, but got ".concat(children.length, "}"));
    }
    return _objectSpread(_objectSpread({}, children[0]), {}, {
      not: !(children[0].not || false)
    });
  }
  if (type == "compound") {
    // remove `.?[true]`
    children = children.filter(function (child) {
      var isListFix = child.type == "selection" && child.children.length == 1 && child.children[0].type == "boolean" && child.children[0].val == true;
      return !isListFix;
    });
    // aggregation
    // eg. `results.?[product == 'abc'].length`
    var selection = children.find(function (child) {
      return child.type == "selection";
    });
    if (selection && selection.children.length != 1) {
      meta.errors.push("Selection should have 1 child, but got ".concat(selection.children.length));
    }
    var filter = selection ? selection.children[0] : null;
    var lastChild = children[children.length - 1];
    var isSize = lastChild.type == "method" && lastChild.val.methodName == "size" || lastChild.type == "!func" && lastChild.methodName == "size";
    var isLength = lastChild.type == "property" && lastChild.val == "length";
    var sourceParts = children.filter(function (child) {
      return child !== selection && child !== lastChild;
    });
    var source = {
      type: "compound",
      children: sourceParts
    };
    var isAggr = (isSize || isLength) && convertPath(sourceParts) != null;
    if (isAggr) {
      return {
        type: "!aggr",
        filter: filter,
        source: source
      };
    }
    // remove `#this`, `#root`
    children = children.filter(function (child) {
      var isThis = child.type == "variable" && child.val == "this";
      var isRoot = child.type == "variable" && child.val == "root";
      return !(isThis || isRoot);
    });
    // indexer
    children = children.map(function (child) {
      if (child.type == "indexer" && child.children.length == 1) {
        return {
          type: "indexer",
          val: child.children[0].val,
          itype: child.children[0].type
        };
      } else {
        return child;
      }
    });
    // method
    // if (lastChild.type == "method") {
    //   // seems like obsolete code!
    //   debugger
    //   const obj = children.filter(child => 
    //     child !== lastChild
    //   );
    //   return {
    //     type: "!func",
    //     obj,
    //     methodName: lastChild.val.methodName,
    //     args: lastChild.val.args
    //   };
    // }
    // !func
    if (lastChild.type == "!func") {
      var ret = {};
      var curr = ret;
      do {
        var _lastChild, _lastChild2;
        Object.assign(curr, lastChild);
        children = children.filter(function (child) {
          return child !== lastChild;
        });
        lastChild = children[children.length - 1];
        if (((_lastChild2 = lastChild) === null || _lastChild2 === void 0 ? void 0 : _lastChild2.type) == "!func") {
          curr.obj = {};
          curr = curr.obj;
        } else {
          if (children.length > 1) {
            curr.obj = {
              type: "compound",
              children: children
            };
          } else {
            curr.obj = lastChild;
          }
        }
      } while (((_lastChild = lastChild) === null || _lastChild === void 0 ? void 0 : _lastChild.type) == "!func");
      return ret;
    }
  }

  // getRaw || getValue
  var val;
  try {
    if (expr.getRaw) {
      // use my fork
      val = expr.getRaw();
    } else if (expr.getValue.length == 0) {
      // getValue not requires context arg -> can use
      val = expr.getValue();
    }
  } catch (e) {
    _stuff.logger.error("[spel2js] Error in getValue()", e);
  }

  // ternary
  if (type == "ternary") {
    val = flatizeTernary(children);
  }

  // convert method/function args
  if ((0, _typeof2["default"])(val) === "object" && val !== null) {
    if (val.methodName || val.functionName) {
      val.args = val.args.map(function (child) {
        return postprocessCompiled(child, meta, expr);
      });
    }
  }
  // convert list
  if (type == "list") {
    val = val.map(function (item) {
      return postprocessCompiled(item, meta, expr);
    });

    // fix whole expression wrapped in `{}`
    if (!parentExpr && val.length == 1) {
      return val[0];
    }
  }
  // convert constructor
  if (type == "constructorref") {
    var qid = children.find(function (child) {
      return child.type == "qualifiedidentifier";
    });
    var cls = qid === null || qid === void 0 ? void 0 : qid.val;
    if (!cls) {
      meta.errors.push("Can't find qualifiedidentifier in constructorref children: ".concat(JSON.stringify(children)));
      return undefined;
    }
    var args = children.filter(function (child) {
      return child.type != "qualifiedidentifier";
    });
    return {
      type: "!new",
      cls: cls,
      args: args
    };
  }
  // convert type
  if (type == "typeref") {
    var _qid = children.find(function (child) {
      return child.type == "qualifiedidentifier";
    });
    var _cls = _qid === null || _qid === void 0 ? void 0 : _qid.val;
    if (!_cls) {
      meta.errors.push("Can't find qualifiedidentifier in typeref children: ".concat(JSON.stringify(children)));
      return undefined;
    }
    var _args = children.filter(function (child) {
      return child.type != "qualifiedidentifier";
    });
    return {
      type: "!type",
      cls: _cls
    };
  }
  // convert function/method
  if (type == "function" || type == "method") {
    // `foo()` is method, `#foo()` is function
    // let's use common property `methodName` and just add `isVar` for function
    var _val = val,
      functionName = _val.functionName,
      methodName = _val.methodName,
      _args2 = _val.args;
    return {
      type: "!func",
      methodName: functionName || methodName,
      isVar: type == "function",
      args: _args2
    };
  }
  return {
    type: type,
    children: children,
    val: val
  };
};
var flatizeTernary = function flatizeTernary(children) {
  var flat = [];
  function _processTernaryChildren(tern) {
    var _tern = (0, _slicedToArray2["default"])(tern, 3),
      cond = _tern[0],
      if_val = _tern[1],
      else_val = _tern[2];
    flat.push([cond, if_val]);
    if ((else_val === null || else_val === void 0 ? void 0 : else_val.type) == "ternary") {
      _processTernaryChildren(else_val.children);
    } else {
      flat.push([undefined, else_val]);
    }
  }
  _processTernaryChildren(children);
  return flat;
};
var buildConv = function buildConv(config) {
  var operators = {};
  var _loop = function _loop(opKey) {
    var opConfig = config.operators[opKey];
    if (opConfig.spelOps) {
      // examples: "==", "eq", ".contains", "matches" (can be used for starts_with, ends_with)
      opConfig.spelOps.forEach(function (spelOp) {
        var opk = spelOp; // + "/" + defaultValue(opConfig.cardinality, 1);
        if (!operators[opk]) operators[opk] = [];
        operators[opk].push(opKey);
      });
    } else if (opConfig.spelOp) {
      var opk = opConfig.spelOp; // + "/" + defaultValue(opConfig.cardinality, 1);
      if (!operators[opk]) operators[opk] = [];
      operators[opk].push(opKey);
    } else {
      _stuff.logger.log("[spel] No spelOp for operator ".concat(opKey));
    }
  };
  for (var opKey in config.operators) {
    _loop(opKey);
  }
  var conjunctions = {};
  for (var conjKey in config.conjunctions) {
    var conjunctionDefinition = config.conjunctions[conjKey];
    var ck = conjunctionDefinition.spelConj || conjKey.toLowerCase();
    conjunctions[ck] = conjKey;
  }
  var funcs = {};
  var _iterator = _createForOfIteratorHelper((0, _configUtils.iterateFuncs)(config)),
    _step;
  try {
    var _loop2 = function _loop2() {
      var _step$value = (0, _slicedToArray2["default"])(_step.value, 2),
        funcPath = _step$value[0],
        funcConfig = _step$value[1];
      var fks = [];
      var spelFunc = funcConfig.spelFunc;
      if (typeof spelFunc === "string") {
        var optionalArgs = Object.keys(funcConfig.args || {}).reverse().filter(function (argKey) {
          return !!funcConfig.args[argKey].isOptional || funcConfig.args[argKey].defaultValue != undefined;
        });
        var funcSignMain = spelFunc.replace(/\${(\w+)}/g, function (_, _k) {
          return "?";
        });
        var funcSignsOptional = optionalArgs.reduce(function (acc, argKey) {
          return [].concat((0, _toConsumableArray2["default"])(acc), [[argKey].concat((0, _toConsumableArray2["default"])(acc[acc.length - 1] || []))]);
        }, []).map(function (optionalArgKeys) {
          return spelFunc.replace(/(?:, )?\${(\w+)}/g, function (found, a) {
            return optionalArgKeys.includes(a) ? "" : found;
          }).replace(/\${(\w+)}/g, function (_, _k) {
            return "?";
          });
        });
        fks = [funcSignMain].concat((0, _toConsumableArray2["default"])(funcSignsOptional));
      }
      var _iterator3 = _createForOfIteratorHelper(fks),
        _step3;
      try {
        for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
          var _fk = _step3.value;
          if (!funcs[_fk]) funcs[_fk] = [];
          funcs[_fk].push(funcPath);
        }
      } catch (err) {
        _iterator3.e(err);
      } finally {
        _iterator3.f();
      }
    };
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      _loop2();
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
  var valueFuncs = {};
  for (var w in config.widgets) {
    var widgetDef = config.widgets[w];
    var spelImportFuncs = widgetDef.spelImportFuncs,
      type = widgetDef.type;
    if (spelImportFuncs) {
      var _iterator2 = _createForOfIteratorHelper(spelImportFuncs),
        _step2;
      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var fk = _step2.value;
          if (typeof fk === "string") {
            var fs = fk.replace(/\${(\w+)}/g, function (_, k) {
              return "?";
            });
            var argsOrder = (0, _toConsumableArray2["default"])(fk.matchAll(/\${(\w+)}/g)).map(function (_ref) {
              var _ref2 = (0, _slicedToArray2["default"])(_ref, 2),
                _ = _ref2[0],
                k = _ref2[1];
              return k;
            });
            if (!valueFuncs[fs]) valueFuncs[fs] = [];
            valueFuncs[fs].push({
              w: w,
              argsOrder: argsOrder
            });
          }
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
    }
  }
  var opFuncs = {};
  for (var op in config.operators) {
    var opDef = config.operators[op];
    var spelOp = opDef.spelOp;
    if (spelOp !== null && spelOp !== void 0 && spelOp.includes("${0}")) {
      var _fs = spelOp.replace(/\${(\w+)}/g, function (_, k) {
        return "?";
      });
      var _argsOrder = (0, _toConsumableArray2["default"])(spelOp.matchAll(/\${(\w+)}/g)).map(function (_ref3) {
        var _ref4 = (0, _slicedToArray2["default"])(_ref3, 2),
          _ = _ref4[0],
          k = _ref4[1];
        return k;
      });
      if (!opFuncs[_fs]) opFuncs[_fs] = [];
      opFuncs[_fs].push({
        op: op,
        argsOrder: _argsOrder
      });
    }
  }
  // Special .compareTo()
  var compareToSS = _spel.compareToSign.replace(/\${(\w+)}/g, function (_, k) {
    return "?";
  });
  opFuncs[compareToSS] = [{
    op: "!compare",
    argsOrder: ["0", "1"]
  }];
  return {
    operators: operators,
    conjunctions: conjunctions,
    funcs: funcs,
    valueFuncs: valueFuncs,
    opFuncs: opFuncs
  };
};
var convertToTree = function convertToTree(spel, conv, config, meta) {
  var parentSpel = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : null;
  if (!spel) return undefined;
  var res,
    canParseAsArg = true;
  if (spel.type.indexOf("op-") === 0 || spel.type === "matches") {
    res = convertOp(spel, conv, config, meta, parentSpel);
  } else if (spel.type == "!aggr") {
    var _groupFilter;
    var groupFieldValue = convertToTree(spel.source, conv, config, meta, _objectSpread(_objectSpread({}, spel), {}, {
      _groupField: parentSpel === null || parentSpel === void 0 ? void 0 : parentSpel._groupField
    }));
    var groupFilter = convertToTree(spel.filter, conv, config, meta, _objectSpread(_objectSpread({}, spel), {}, {
      _groupField: groupFieldValue === null || groupFieldValue === void 0 ? void 0 : groupFieldValue.value
    }));
    if (((_groupFilter = groupFilter) === null || _groupFilter === void 0 ? void 0 : _groupFilter.type) == "rule") {
      groupFilter = wrapInDefaultConj(groupFilter, config, spel.filter.not);
    }
    res = {
      groupFilter: groupFilter,
      groupFieldValue: groupFieldValue
    };
    if (!parentSpel) {
      // !aggr can't be in root, it should be compared with something
      res = undefined;
      meta.errors.push("Unexpected !aggr in root");
      canParseAsArg = false;
    }
  } else if (spel.type == "ternary") {
    var children1 = {};
    spel.val.forEach(function (v) {
      var _v = (0, _slicedToArray2["default"])(v, 2),
        cond = _v[0],
        val = _v[1];
      var caseI = buildCase(cond, val, conv, config, meta, spel);
      if (caseI) {
        children1[caseI.id] = caseI;
      }
    });
    res = {
      type: "switch_group",
      id: (0, _uuid["default"])(),
      children1: children1,
      properties: {}
    };
  }
  if (!res && canParseAsArg) {
    res = convertArg(spel, conv, config, meta, parentSpel);
  }
  if (res && !res.type && !parentSpel) {
    // res is not a rule, it's value at root
    // try to parse whole `"1"` as ternary
    var sw = buildSimpleSwitch(spel, conv, config, meta);
    if (sw) {
      res = sw;
    } else {
      res = undefined;
      meta.errors.push("Can't convert rule of type ".concat(spel.type, ", it looks like var/literal"));
    }
  }
  return res;
};
var convertOp = function convertOp(spel, conv, config, meta) {
  var parentSpel = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : null;
  var res;
  var op = spel.type.startsWith("op-") ? spel.type.slice("op-".length) : spel.type;

  // unary
  var isUnary = (op == "minus" || op == "plus") && spel.children.length == 1;
  if (isUnary) {
    spel.isUnary = true;
    return convertOp(spel.children[0], conv, config, meta, spel);
  }

  // between
  var isBetweenNormal = op == "and" && spel.children.length == 2 && spel.children[0].type == "op-ge" && spel.children[1].type == "op-le";
  var isBetweenRev = op == "or" && spel.children.length == 2 && spel.children[0].type == "op-lt" && spel.children[1].type == "op-gt";
  var isBetween = isBetweenNormal || isBetweenRev;
  if (isBetween) {
    var _spel$children$0$chil = (0, _slicedToArray2["default"])(spel.children[0].children, 2),
      left = _spel$children$0$chil[0],
      from = _spel$children$0$chil[1];
    var _spel$children$1$chil = (0, _slicedToArray2["default"])(spel.children[1].children, 2),
      right = _spel$children$1$chil[0],
      to = _spel$children$1$chil[1];
    var isSameSource = compareArgs(left, right, spel, conv, config, meta, parentSpel);
    if (isSameSource) {
      var _fromValue = from.val;
      var _toValue = to.val;
      var oneSpel = {
        type: "op-between",
        children: [left, from, to]
      };
      return convertOp(oneSpel, conv, config, meta, parentSpel);
    }
  }

  // find op
  var opKeys = conv.operators[op];
  if (op == "eq" && spel.children[1].type == "null") {
    opKeys = ["is_null"];
  } else if (op == "ne" && spel.children[1].type == "null") {
    opKeys = ["is_not_null"];
  } else if (op == "le" && spel.children[1].type == "string" && spel.children[1].val == "") {
    opKeys = ["is_empty"];
  } else if (op == "gt" && spel.children[1].type == "string" && spel.children[1].val == "") {
    opKeys = ["is_not_empty"];
  } else if (op == "between") {
    opKeys = ["between"];
  }

  // convert children
  var convertChildren = function convertChildren() {
    var _newChildren;
    var newChildren = spel.children.map(function (child) {
      return convertToTree(child, conv, config, meta, _objectSpread(_objectSpread({}, spel), {}, {
        _groupField: parentSpel === null || parentSpel === void 0 ? void 0 : parentSpel._groupField
      }));
    });
    if (newChildren.length >= 2 && ((_newChildren = newChildren) === null || _newChildren === void 0 || (_newChildren = _newChildren[0]) === null || _newChildren === void 0 ? void 0 : _newChildren.type) == "!compare") {
      newChildren = newChildren[0].children;
    }
    return newChildren;
  };
  if (op == "and" || op == "or") {
    var children1 = {};
    var vals = convertChildren();
    vals.forEach(function (v) {
      if (v) {
        var id = (0, _uuid["default"])();
        v.id = id;
        if (v.type != undefined) {
          children1[id] = v;
        } else {
          meta.errors.push("Bad item in AND/OR: ".concat(JSON.stringify(v)));
        }
      }
    });
    res = {
      type: "group",
      id: (0, _uuid["default"])(),
      children1: children1,
      properties: {
        conjunction: conv.conjunctions[op],
        not: spel.not
      }
    };
  } else if (opKeys) {
    var _fieldObj$groupFieldV, _convertedArgs;
    var _vals = convertChildren();
    var fieldObj = _vals[0];
    var convertedArgs = _vals.slice(1);
    var groupField = fieldObj === null || fieldObj === void 0 || (_fieldObj$groupFieldV = fieldObj.groupFieldValue) === null || _fieldObj$groupFieldV === void 0 ? void 0 : _fieldObj$groupFieldV.value;
    var opArg = (_convertedArgs = convertedArgs) === null || _convertedArgs === void 0 ? void 0 : _convertedArgs[0];
    var opKey = opKeys[0];
    if (opKeys.length > 1) {
      var _vals$, _vals$2;
      var valueType = ((_vals$ = _vals[0]) === null || _vals$ === void 0 ? void 0 : _vals$.valueType) || ((_vals$2 = _vals[1]) === null || _vals$2 === void 0 ? void 0 : _vals$2.valueType);
      //todo: it's naive, use valueType
      var field = fieldObj === null || fieldObj === void 0 ? void 0 : fieldObj.value;
      var widgets = opKeys.map(function (op) {
        return {
          op: op,
          widget: (0, _ruleUtils.getWidgetForFieldOp)(config, field, op)
        };
      });
      _stuff.logger.warn("[spel] Spel operator ".concat(op, " can be mapped to ").concat(opKeys, "."), "widgets:", widgets, "vals:", _vals, "valueType=", valueType);
      if (op == "eq" || op == "ne") {
        var ws = widgets.find(function (_ref5) {
          var op = _ref5.op,
            widget = _ref5.widget;
          return widget && widget != "field";
        });
        if (ws) {
          opKey = ws.op;
        }
      }
    }

    // some/all/none
    if (fieldObj !== null && fieldObj !== void 0 && fieldObj.groupFieldValue) {
      if (opArg && opArg.groupFieldValue && opArg.groupFieldValue.valueSrc == "field" && opArg.groupFieldValue.value == groupField) {
        // group.?[...].size() == group.size()
        opKey = "all";
        convertedArgs = [];
      } else if (opKey == "equal" && opArg.valueSrc == "value" && opArg.valueType == "number" && opArg.value == 0) {
        opKey = "none";
        convertedArgs = [];
      } else if (opKey == "greater" && opArg.valueSrc == "value" && opArg.valueType == "number" && opArg.value == 0) {
        opKey = "some";
        convertedArgs = [];
      }
    }
    var canRev = true;
    var needWrapReverse = false;
    if (spel.not && canRev) {
      var opConfig = config.operators[opKey];
      if (opConfig.reversedOp) {
        opKey = opConfig.reversedOp;
        spel.not = false;
      } else {
        needWrapReverse = true;
      }
    }
    if (!fieldObj) {
      // LHS can't be parsed
    } else if (fieldObj.groupFieldValue) {
      // 1. group
      if (fieldObj.groupFieldValue.valueSrc != "field") {
        meta.errors.push("Expected group field ".concat(JSON.stringify(fieldObj)));
      }
      res = buildRuleGroup(fieldObj, opKey, convertedArgs, config, meta);
    } else {
      // 2. not group
      if (fieldObj.valueSrc != "field" && fieldObj.valueSrc != "func") {
        meta.errors.push("Expected field/func at LHS, but got ".concat(JSON.stringify(fieldObj)));
      }
      var _field = fieldObj.value;
      res = buildRule(config, meta, _field, opKey, convertedArgs);
    }
    if (needWrapReverse) {
      if (res.type !== "group") {
        res = wrapInDefaultConj(res, config, spel.not);
      } else {
        res.properties.not = !res.properties.not;
      }
    }
  } else {
    if (!parentSpel) {
      // try to parse whole `"str" + prop + #var` as ternary
      res = buildSimpleSwitch(spel, conv, config, meta);
    }
    // if (!res) {
    //   meta.errors.push(`Can't convert op ${op}`);
    // }
  }

  return res;
};
var convertPath = function convertPath(parts) {
  var meta = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var expectingField = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
  var isError = false;
  var res = parts.map(function (c) {
    if (c.type == "variable" || c.type == "property" || c.type == "indexer" && c.itype == "string") {
      return c.val;
    } else {
      var _meta$errors, _meta$errors$push;
      isError = true;
      expectingField && (meta === null || meta === void 0 || (_meta$errors = meta.errors) === null || _meta$errors === void 0 || (_meta$errors$push = _meta$errors.push) === null || _meta$errors$push === void 0 ? void 0 : _meta$errors$push.call(_meta$errors, "Unexpected item in field path compound: ".concat(JSON.stringify(c))));
    }
  });
  return !isError ? res : undefined;
};
var convertArg = function convertArg(spel, conv, config, meta, parentSpel) {
  if (spel == undefined) return undefined;
  var fieldSeparator = config.settings.fieldSeparator;
  if (spel.type == "variable" || spel.type == "property") {
    // normal field
    var field = (0, _configUtils.normalizeField)(config, spel.val, parentSpel === null || parentSpel === void 0 ? void 0 : parentSpel._groupField);
    var fieldConfig = (0, _configUtils.getFieldConfig)(config, field);
    var isVariable = spel.type == "variable";
    return {
      valueSrc: "field",
      valueType: fieldConfig === null || fieldConfig === void 0 ? void 0 : fieldConfig.type,
      isVariable: isVariable,
      value: field
    };
  } else if (spel.type == "compound") {
    // complex field
    var parts = convertPath(spel.children, meta);
    if (parts) {
      var _spel$children;
      var _field2 = (0, _configUtils.normalizeField)(config, parts.join(fieldSeparator), parentSpel === null || parentSpel === void 0 ? void 0 : parentSpel._groupField);
      var _fieldConfig = (0, _configUtils.getFieldConfig)(config, _field2);
      var _isVariable = ((_spel$children = spel.children) === null || _spel$children === void 0 || (_spel$children = _spel$children[0]) === null || _spel$children === void 0 ? void 0 : _spel$children.type) == "variable";
      return {
        valueSrc: "field",
        valueType: _fieldConfig === null || _fieldConfig === void 0 ? void 0 : _fieldConfig.type,
        isVariable: _isVariable,
        value: _field2
      };
    } else {
      // it's not complex field
    }
  } else if (SpelPrimitiveTypes[spel.type]) {
    var value = spel.val;
    var valueType = SpelPrimitiveTypes[spel.type];
    if (parentSpel !== null && parentSpel !== void 0 && parentSpel.isUnary) {
      value = -value;
    }
    return {
      valueSrc: "value",
      valueType: valueType,
      value: value
    };
  } else if (spel.type == "!new" && SpelPrimitiveClasses[spel.cls.at(-1)]) {
    var args = spel.args.map(function (v) {
      return convertArg(v, conv, config, meta, spel);
    });
    var _value = args === null || args === void 0 ? void 0 : args[0];
    var _valueType = SpelPrimitiveClasses[spel.cls.at(-1)];
    return _objectSpread(_objectSpread({}, _value), {}, {
      valueType: _valueType
    });
  } else if (spel.type == "list") {
    var _values$;
    var values = spel.val.map(function (v) {
      return convertArg(v, conv, config, meta, spel);
    });
    var _itemType = values.length ? (_values$ = values[0]) === null || _values$ === void 0 ? void 0 : _values$.valueType : null;
    var _value2 = values.map(function (v) {
      return v === null || v === void 0 ? void 0 : v.value;
    });
    var _valueType2 = ListValueType;
    return {
      valueSrc: "value",
      valueType: _valueType2,
      value: _value2
    };
  } else if (spel.type == "op-plus" && (parentSpel === null || parentSpel === void 0 ? void 0 : parentSpel.type) == "ternary") {
    return buildCaseValueConcat(spel, conv, config, meta);
  }
  var maybe = convertFunc(spel, conv, config, meta, parentSpel);
  if (maybe !== undefined) {
    return maybe;
  }
  meta.errors.push("Can't convert arg of type ".concat(spel.type));
  return undefined;
};
var buildFuncSignatures = function buildFuncSignatures(spel) {
  // branches
  var brns = [{
    s: "",
    params: [],
    objs: []
  }];
  _buildFuncSignatures(spel, brns);
  return brns.map(function (_ref6) {
    var s = _ref6.s,
      params = _ref6.params;
    return {
      s: s,
      params: params
    };
  }).reverse().filter(function (_ref7) {
    var s = _ref7.s;
    return s !== "" && s !== "?";
  });
};

// a.toLower().toUpper()
// ->
// ?.toLower().toUpper()
// ?.toUpper()
var _buildFuncSignatures = function _buildFuncSignatures(spel, brns) {
  var params = [],
    s = "";
  var type = spel.type,
    methodName = spel.methodName,
    val = spel.val,
    obj = spel.obj,
    args = spel.args,
    isVar = spel.isVar,
    cls = spel.cls,
    children = spel.children;
  var lastChild = children === null || children === void 0 ? void 0 : children[children.length - 1];
  var currBrn = brns[brns.length - 1];
  if (type === "!func") {
    // T(DateTimeFormat).forPattern(?).parseDateTime(?)  --  ok
    // T(LocalDateTime).parse(?, T(DateTimeFormatter).ofPattern(?))  --  will not work
    var o = obj;
    while (o) {
      var _currBrn$params;
      var _buildFuncSignatures2 = _buildFuncSignatures(_objectSpread(_objectSpread({}, o), {}, {
          obj: null
        }), [{}]),
        _buildFuncSignatures3 = (0, _slicedToArray2["default"])(_buildFuncSignatures2, 2),
        s1 = _buildFuncSignatures3[0],
        params1 = _buildFuncSignatures3[1];
      if (s1 !== "?") {
        // start new branch
        var newBrn = {
          s: currBrn.s,
          params: (0, _toConsumableArray2["default"])(currBrn.params),
          objs: (0, _toConsumableArray2["default"])(currBrn.objs)
        };
        // finish old branch
        currBrn.objs.unshift("?");
        currBrn.params.unshift(o);
        // switch
        brns.push(newBrn);
        currBrn = brns[brns.length - 1];
      }
      // step
      currBrn.objs.unshift(s1);
      (_currBrn$params = currBrn.params).unshift.apply(_currBrn$params, (0, _toConsumableArray2["default"])(params1));
      o = o.type === "!func" ? o.obj : null;
    }
    var _iterator4 = _createForOfIteratorHelper(brns),
      _step4;
    try {
      for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
        var _brn$objs;
        var brn = _step4.value;
        params = [].concat((0, _toConsumableArray2["default"])((brn === null || brn === void 0 ? void 0 : brn.params) || []), (0, _toConsumableArray2["default"])(args || []));
        s = "";
        if (brn !== null && brn !== void 0 && (_brn$objs = brn.objs) !== null && _brn$objs !== void 0 && _brn$objs.length) s += brn.objs.join(".") + ".";
        s += (isVar ? "#" : "") + methodName;
        s += "(" + (args || []).map(function (_) {
          return "?";
        }).join(", ") + ")";
        brn.s = s;
        brn.params = params;
      }
    } catch (err) {
      _iterator4.e(err);
    } finally {
      _iterator4.f();
    }
  } else if (type === "!new") {
    // new java.text.SimpleDateFormat('HH:mm:ss').parse('...')
    params = args || [];
    s = "new ".concat(cls.join("."), "(").concat(params.map(function (_) {
      return "?";
    }).join(", "), ")");
  } else if (type === "!type") {
    // T(java.time.LocalTime).parse('...')
    s = "T(".concat(cls.join("."), ")");
  } else if (type === "compound" && lastChild.type === "property" && isFuncableProperty(lastChild.val)) {
    // {1,2}.length  --  ok
    // 'Hello World'.bytes.length  --  will not work
    s = children.map(function (c) {
      var _params;
      if (c === lastChild) return c.val;
      var _buildFuncSignatures4 = _buildFuncSignatures(_objectSpread(_objectSpread({}, c), {}, {
          obj: null
        }), [{}]),
        _buildFuncSignatures5 = (0, _slicedToArray2["default"])(_buildFuncSignatures4, 2),
        s1 = _buildFuncSignatures5[0],
        params1 = _buildFuncSignatures5[1];
      (_params = params).push.apply(_params, (0, _toConsumableArray2["default"])(params1));
      return s1;
    }).join(".");
  } else {
    params = [spel];
    s = "?";
  }
  if (currBrn) {
    currBrn.s = s;
    currBrn.params = params;
  }
  return [s, params];
};
var convertFunc = function convertFunc(spel, conv, config, meta, parentSpel) {
  var _fsigns$;
  // Build signatures
  var convertFuncArg = function convertFuncArg(v) {
    return convertArg(v, conv, config, meta, _objectSpread(_objectSpread({}, spel), {}, {
      _groupField: parentSpel === null || parentSpel === void 0 ? void 0 : parentSpel._groupField
    }));
  };
  var fsigns = buildFuncSignatures(spel);
  var firstSign = fsigns === null || fsigns === void 0 || (_fsigns$ = fsigns[0]) === null || _fsigns$ === void 0 ? void 0 : _fsigns$.s;
  if (fsigns.length) _stuff.logger.debug("Signatures for ", spel, ":", firstSign, fsigns);

  // 1. Try to parse as value
  var maybeValue = convertFuncToValue(spel, conv, config, meta, parentSpel, fsigns, convertFuncArg);
  if (maybeValue !== undefined) return maybeValue;

  // 2. Try to parse as op
  var maybeOp = convertFuncToOp(spel, conv, config, meta, parentSpel, fsigns, convertFuncArg);
  if (maybeOp !== undefined) return maybeOp;

  // 3. Try to parse as func
  var funcKey, funcConfig, argsObj;
  // try func signature matching
  var _iterator5 = _createForOfIteratorHelper(fsigns),
    _step5;
  try {
    var _loop3 = function _loop3() {
      var _step5$value = _step5.value,
        s = _step5$value.s,
        params = _step5$value.params;
      var funcKeys = conv.funcs[s];
      if (funcKeys) {
        // todo: here we can check arg types, if we have function overloading
        funcKey = funcKeys[0];
        funcConfig = (0, _configUtils.getFuncConfig)(config, funcKey);
        var _funcConfig = funcConfig,
          spelFunc = _funcConfig.spelFunc;
        var argsArr = params.map(convertFuncArg);
        var argsOrder = (0, _toConsumableArray2["default"])(spelFunc.matchAll(/\${(\w+)}/g)).map(function (_ref8) {
          var _ref9 = (0, _slicedToArray2["default"])(_ref8, 2),
            _ = _ref9[0],
            k = _ref9[1];
          return k;
        });
        argsObj = Object.fromEntries(argsOrder.map(function (argKey, i) {
          return [argKey, argsArr[i]];
        }));
        return 1; // break
      }
    };
    for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
      if (_loop3()) break;
    }
    // try `spelImport`
  } catch (err) {
    _iterator5.e(err);
  } finally {
    _iterator5.f();
  }
  if (!funcKey) {
    var _iterator6 = _createForOfIteratorHelper((0, _configUtils.iterateFuncs)(config)),
      _step6;
    try {
      for (_iterator6.s(); !(_step6 = _iterator6.n()).done;) {
        var _step6$value = (0, _slicedToArray2["default"])(_step6.value, 2),
          f = _step6$value[0],
          fc = _step6$value[1];
        if (fc.spelImport) {
          var parsed = void 0;
          try {
            parsed = fc.spelImport(spel);
          } catch (_e) {
            // can't be parsed
          }
          if (parsed) {
            funcKey = f;
            funcConfig = (0, _configUtils.getFuncConfig)(config, funcKey);
            argsObj = {};
            for (var argKey in parsed) {
              argsObj[argKey] = convertFuncArg(parsed[argKey]);
            }
          }
        }
      }
    } catch (err) {
      _iterator6.e(err);
    } finally {
      _iterator6.f();
    }
  }

  // convert
  if (funcKey) {
    var funcArgs = {};
    for (var _argKey in funcConfig.args) {
      var argConfig = funcConfig.args[_argKey];
      var argVal = argsObj[_argKey];
      if (argVal === undefined) {
        argVal = argConfig === null || argConfig === void 0 ? void 0 : argConfig.defaultValue;
        if (argVal === undefined) {
          if (argConfig !== null && argConfig !== void 0 && argConfig.isOptional) {
            //ignore
          } else {
            meta.errors.push("No value for arg ".concat(_argKey, " of func ").concat(funcKey));
            return undefined;
          }
        } else {
          var _argVal;
          argVal = {
            value: argVal,
            valueSrc: (_argVal = argVal) !== null && _argVal !== void 0 && _argVal.func ? "func" : "value",
            valueType: argConfig.type
          };
        }
      }
      if (argVal) funcArgs[_argKey] = argVal;
    }
    return {
      valueSrc: "func",
      value: {
        func: funcKey,
        args: funcArgs
      },
      valueType: funcConfig.returnType
    };
  }
  var methodName = spel.methodName;
  if (methodName) meta.errors.push("Signature ".concat(firstSign, " - failed to convert"));
  return undefined;
};
var convertFuncToValue = function convertFuncToValue(spel, conv, config, meta, parentSpel, fsigns, convertFuncArg) {
  var errs, foundSign, foundWidget;
  var candidates = [];
  for (var w in config.widgets) {
    var widgetDef = config.widgets[w];
    var spelImportFuncs = widgetDef.spelImportFuncs;
    if (spelImportFuncs) {
      for (var i = 0; i < spelImportFuncs.length; i++) {
        var fj = spelImportFuncs[i];
        if (isObject(fj)) {
          var bag = {};
          if ((0, _stuff.isJsonCompatible)(fj, spel, bag)) {
            for (var k in bag) {
              bag[k] = convertFuncArg(bag[k]);
            }
            candidates.push({
              s: "widgets.".concat(w, ".spelImportFuncs[").concat(i, "]"),
              w: w,
              argsObj: bag
            });
          }
        }
      }
    }
  }
  var _iterator7 = _createForOfIteratorHelper(fsigns),
    _step7;
  try {
    for (_iterator7.s(); !(_step7 = _iterator7.n()).done;) {
      var _step7$value = _step7.value,
        _s = _step7$value.s,
        params = _step7$value.params;
      var found = conv.valueFuncs[_s] || [];
      var _iterator8 = _createForOfIteratorHelper(found),
        _step8;
      try {
        var _loop4 = function _loop4() {
          var _step8$value = _step8.value,
            w = _step8$value.w,
            argsOrder = _step8$value.argsOrder;
          var argsArr = params.map(convertFuncArg);
          var argsObj = Object.fromEntries(argsOrder.map(function (argKey, i) {
            return [argKey, argsArr[i]];
          }));
          candidates.push({
            s: _s,
            w: w,
            argsObj: argsObj
          });
        };
        for (_iterator8.s(); !(_step8 = _iterator8.n()).done;) {
          _loop4();
        }
      } catch (err) {
        _iterator8.e(err);
      } finally {
        _iterator8.f();
      }
    }
  } catch (err) {
    _iterator7.e(err);
  } finally {
    _iterator7.f();
  }
  for (var _i = 0, _candidates = candidates; _i < _candidates.length; _i++) {
    var _candidates$_i = _candidates[_i],
      s = _candidates$_i.s,
      _w = _candidates$_i.w,
      argsObj = _candidates$_i.argsObj;
    var _widgetDef = config.widgets[_w];
    var spelImportValue = _widgetDef.spelImportValue,
      type = _widgetDef.type;
    foundWidget = _w;
    foundSign = s;
    errs = [];
    for (var _k2 in argsObj) {
      if (!["value"].includes(argsObj[_k2].valueSrc)) {
        errs.push("".concat(_k2, " has unsupported value src ").concat(argsObj[_k2].valueSrc));
      }
    }
    var value = argsObj.v.value;
    if (spelImportValue && !errs.length) {
      var _spelImportValue$call = spelImportValue.call(config.ctx, argsObj.v, _widgetDef, argsObj);
      var _spelImportValue$call2 = (0, _slicedToArray2["default"])(_spelImportValue$call, 2);
      value = _spelImportValue$call2[0];
      errs = _spelImportValue$call2[1];
      if (errs && !Array.isArray(errs)) errs = [errs];
    }
    if (!errs.length) {
      return {
        valueSrc: "value",
        valueType: type,
        value: value
      };
    }
  }
  if (foundWidget && errs.length) {
    meta.errors.push("Signature ".concat(foundSign, " - looks like convertable to ").concat(foundWidget, ", but: ").concat(errs.join("; ")));
  }
  return undefined;
};
var convertFuncToOp = function convertFuncToOp(spel, conv, config, meta, parentSpel, fsigns, convertFuncArg) {
  var errs, opKey, foundSign;
  var _iterator9 = _createForOfIteratorHelper(fsigns),
    _step9;
  try {
    for (_iterator9.s(); !(_step9 = _iterator9.n()).done;) {
      var _step9$value = _step9.value,
        s = _step9$value.s,
        params = _step9$value.params;
      var found = conv.opFuncs[s] || [];
      var _iterator10 = _createForOfIteratorHelper(found),
        _step10;
      try {
        var _loop5 = function _loop5() {
            var _argsArr$filter$find;
            var _step10$value = _step10.value,
              op = _step10$value.op,
              argsOrder = _step10$value.argsOrder;
            var argsArr = params.map(convertFuncArg);
            opKey = op;
            if (op === "!compare") {
              if (parentSpel.type.startsWith("op-") && parentSpel.children.length == 2 && parentSpel.children[1].type == "number" && parentSpel.children[1].val === 0) {
                return {
                  v: {
                    type: "!compare",
                    children: argsArr
                  }
                };
              } else {
                errs.push("Result of compareTo() should be compared to 0");
              }
            }
            foundSign = s;
            errs = [];
            var opDef = config.operators[opKey];
            var spelOp = opDef.spelOp,
              valueTypes = opDef.valueTypes;
            var argsObj = Object.fromEntries(argsOrder.map(function (argKey, i) {
              return [argKey, argsArr[i]];
            }));
            var field = argsObj["0"];
            var convertedArgs = Object.keys(argsObj).filter(function (k) {
              return parseInt(k) > 0;
            }).map(function (k) {
              return argsObj[k];
            });
            var valueType = (_argsArr$filter$find = argsArr.filter(function (a) {
              return !!a;
            }).find(function (_ref10) {
              var valueSrc = _ref10.valueSrc;
              return valueSrc === "value";
            })) === null || _argsArr$filter$find === void 0 ? void 0 : _argsArr$filter$find.valueType;
            if (valueTypes && valueType && !valueTypes.includes(valueType)) {
              errs.push("Op supports types ".concat(valueTypes, ", but got ").concat(valueType));
            }
            if (!errs.length) {
              return {
                v: buildRule(config, meta, field, opKey, convertedArgs, spel)
              };
            }
          },
          _ret;
        for (_iterator10.s(); !(_step10 = _iterator10.n()).done;) {
          _ret = _loop5();
          if (_ret) return _ret.v;
        }
      } catch (err) {
        _iterator10.e(err);
      } finally {
        _iterator10.f();
      }
    }
  } catch (err) {
    _iterator9.e(err);
  } finally {
    _iterator9.f();
  }
  if (opKey && errs.length) {
    meta.errors.push("Signature ".concat(foundSign, " - looks like convertable to ").concat(opKey, ", but: ").concat(errs.join("; ")));
  }
  return undefined;
};
var buildRule = function buildRule(config, meta, field, opKey, convertedArgs, spel) {
  var _field3;
  if (convertedArgs.filter(function (v) {
    return v === undefined;
  }).length) {
    return undefined;
  }
  var fieldSrc = (_field3 = field) !== null && _field3 !== void 0 && _field3.func ? "func" : "field";
  if (isObject(field) && field.valueSrc) {
    // if comed from convertFuncToOp()
    fieldSrc = field.valueSrc;
    field = field.value;
  }
  var fieldConfig = (0, _configUtils.getFieldConfig)(config, field);
  if (!fieldConfig) {
    meta.errors.push("No config for field ".concat(field));
    return undefined;
  }
  var canRev = true;
  var needWrapReverse = false;
  if (spel !== null && spel !== void 0 && spel.not && canRev) {
    var opConfig = config.operators[opKey];
    if (opConfig.reversedOp) {
      opKey = opConfig.reversedOp;
      spel.not = false;
    } else {
      needWrapReverse = true;
    }
  }
  var widget = (0, _ruleUtils.getWidgetForFieldOp)(config, field, opKey);
  var widgetConfig = config.widgets[widget || fieldConfig.mainWidget];
  var asyncListValuesArr = convertedArgs.map(function (v) {
    return v.asyncListValues;
  }).filter(function (v) {
    return v != undefined;
  });
  var asyncListValues = asyncListValuesArr.length ? asyncListValuesArr[0] : undefined;
  var res = {
    type: "rule",
    id: (0, _uuid["default"])(),
    properties: _objectSpread({
      field: field,
      fieldSrc: fieldSrc,
      operator: opKey,
      value: convertedArgs.map(function (v) {
        return v.value;
      }),
      valueSrc: convertedArgs.map(function (v) {
        return v.valueSrc;
      }),
      valueType: convertedArgs.map(function (v) {
        if (v.valueSrc == "value") {
          return (widgetConfig === null || widgetConfig === void 0 ? void 0 : widgetConfig.type) || (fieldConfig === null || fieldConfig === void 0 ? void 0 : fieldConfig.type) || v.valueType;
        }
        return v.valueType;
      })
    }, asyncListValues ? {
      asyncListValues: asyncListValues
    } : {})
  };
  if (needWrapReverse) {
    res = wrapInDefaultConj(res, config, spel === null || spel === void 0 ? void 0 : spel.not);
    if (spel !== null && spel !== void 0 && spel.not) {
      spel.not = false;
    }
  }
  return res;
};
var buildRuleGroup = function buildRuleGroup(_ref11, opKey, convertedArgs, config, meta) {
  var groupFilter = _ref11.groupFilter,
    groupFieldValue = _ref11.groupFieldValue;
  if (groupFieldValue.valueSrc != "field") throw "Bad groupFieldValue: ".concat(JSON.stringify(groupFieldValue));
  var groupField = groupFieldValue.value;
  var groupOpRule = buildRule(config, meta, groupField, opKey, convertedArgs);
  if (!groupOpRule) return undefined;
  var fieldConfig = (0, _configUtils.getFieldConfig)(config, groupField);
  var mode = fieldConfig === null || fieldConfig === void 0 ? void 0 : fieldConfig.mode;
  var res;
  if ((groupFilter === null || groupFilter === void 0 ? void 0 : groupFilter.type) === "group") {
    res = _objectSpread(_objectSpread({}, groupFilter || {}), {}, {
      type: "rule_group",
      properties: _objectSpread(_objectSpread(_objectSpread({}, groupOpRule.properties), (groupFilter === null || groupFilter === void 0 ? void 0 : groupFilter.properties) || {}), {}, {
        mode: mode
      })
    });
  } else if (groupFilter) {
    // rule_group in rule_group
    res = _objectSpread(_objectSpread({}, groupOpRule || {}), {}, {
      type: "rule_group",
      children1: [groupFilter],
      properties: _objectSpread(_objectSpread({}, groupOpRule.properties), {}, {
        mode: mode
      })
    });
  } else {
    res = _objectSpread(_objectSpread({}, groupOpRule || {}), {}, {
      type: "rule_group",
      properties: _objectSpread(_objectSpread({}, groupOpRule.properties), {}, {
        mode: mode
      })
    });
  }
  if (!res.id) res.id = (0, _uuid["default"])();
  return res;
};
var compareArgs = function compareArgs(left, right, spel, conv, config, meta) {
  var parentSpel = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : null;
  if (left.type == right.type) {
    if (left.type == "!aggr") {
      var _map = [left.source, right.source].map(function (v) {
          return convertArg(v, conv, config, meta, _objectSpread(_objectSpread({}, spel), {}, {
            _groupField: parentSpel === null || parentSpel === void 0 ? void 0 : parentSpel._groupField
          }));
        }),
        _map2 = (0, _slicedToArray2["default"])(_map, 2),
        leftSource = _map2[0],
        rightSource = _map2[1];
      //todo: check same filter
      return leftSource.value == rightSource.value;
    } else {
      var _map3 = [left, right].map(function (v) {
          return convertArg(v, conv, config, meta, _objectSpread(_objectSpread({}, spel), {}, {
            _groupField: parentSpel === null || parentSpel === void 0 ? void 0 : parentSpel._groupField
          }));
        }),
        _map4 = (0, _slicedToArray2["default"])(_map3, 2),
        leftVal = _map4[0],
        rightVal = _map4[1];
      return leftVal.value == rightVal.value;
    }
  }
  return false;
};
var buildSimpleSwitch = function buildSimpleSwitch(val, conv, config, meta) {
  var children1 = {};
  var cond = null;
  var caseI = buildCase(cond, val, conv, config, meta);
  if (caseI) {
    children1[caseI.id] = caseI;
  }
  var res = {
    type: "switch_group",
    id: (0, _uuid["default"])(),
    children1: children1,
    properties: {}
  };
  return res;
};
var buildCase = function buildCase(cond, val, conv, config, meta) {
  var spel = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : null;
  var valProperties = buildCaseValProperties(config, meta, conv, val, spel);
  var caseI;
  if (cond) {
    caseI = convertToTree(cond, conv, config, meta, spel);
    if (caseI && caseI.type) {
      if (caseI.type != "group") {
        caseI = wrapInDefaultConj(caseI, config);
      }
      caseI.type = "case_group";
    } else {
      meta.errors.push("Unexpected case: ".concat(JSON.stringify(caseI)));
      caseI = undefined;
    }
  } else {
    caseI = {
      id: (0, _uuid["default"])(),
      type: "case_group",
      properties: {}
    };
  }
  if (caseI) {
    caseI.properties = _objectSpread(_objectSpread({}, caseI.properties), valProperties);
  }
  return caseI;
};
var buildCaseValueConcat = function buildCaseValueConcat(spel, conv, config, meta) {
  var flat = [];
  function _processConcatChildren(children) {
    children.map(function (child) {
      if (child.type == "op-plus") {
        _processConcatChildren(child.children);
      } else {
        var convertedChild = convertArg(child, conv, config, meta, spel);
        if (convertedChild) {
          flat.push(convertedChild);
        } else {
          meta.errors.push("Can't convert ".concat(child.type, " in concatenation"));
        }
      }
    });
  }
  _processConcatChildren(spel.children);
  return {
    valueSrc: "value",
    valueType: "case_value",
    value: flat
  };
};
var buildCaseValProperties = function buildCaseValProperties(config, meta, conv, val) {
  var spel = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : null;
  var valProperties = {};
  var convVal;
  if ((val === null || val === void 0 ? void 0 : val.type) == "op-plus") {
    convVal = buildCaseValueConcat(val, conv, config, meta);
  } else {
    convVal = convertArg(val, conv, config, meta, spel);
  }
  var widgetDef = config.widgets["case_value"];
  var importCaseValue = widgetDef === null || widgetDef === void 0 ? void 0 : widgetDef.spelImportValue;
  if (importCaseValue) {
    var _importCaseValue = importCaseValue(convVal),
      _importCaseValue2 = (0, _slicedToArray2["default"])(_importCaseValue, 2),
      normVal = _importCaseValue2[0],
      normErrors = _importCaseValue2[1];
    normErrors.map(function (e) {
      return meta.errors.push(e);
    });
    if (normVal) {
      valProperties = {
        value: [normVal],
        valueSrc: ["value"],
        valueType: ["case_value"]
      };
    }
  } else {
    meta.errors.push("No fucntion to import case value");
  }
  return valProperties;
};
var wrapInDefaultConjRuleGroup = function wrapInDefaultConjRuleGroup(rule, parentField, parentFieldConfig, config, conj) {
  if (!rule) return undefined;
  return {
    type: "rule_group",
    id: (0, _uuid["default"])(),
    children1: (0, _defineProperty2["default"])({}, rule.id, rule),
    properties: {
      conjunction: conj || (0, _defaultUtils.defaultGroupConjunction)(config, parentFieldConfig),
      not: false,
      field: parentField
    }
  };
};
var wrapInDefaultConj = function wrapInDefaultConj(rule, config) {
  var not = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
  return {
    type: "group",
    id: (0, _uuid["default"])(),
    children1: (0, _defineProperty2["default"])({}, rule.id, rule),
    properties: {
      conjunction: (0, _defaultUtils.defaultConjunction)(config),
      not: not || false
    }
  };
};