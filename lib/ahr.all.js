/*jslint browser: true, devel: true, debug: true, es5: true, onevar: true, undef: true, eqeqeq: true, plusplus: true, bitwise: true, regexp: true, newcap: true, immed: true, strict: true */
/*
  var window = {}, exports = {}, module = {}, global = {};
*/
// Implementation of require(), modules, exports, and provide to the browser
"use strict";
(function () {
    if ('undefined' !== typeof window && 'undefined' !== typeof alert) {
      (function () {
        var global = window;
        function resetModule() {
          global.module = {};
          global.exports = {};
          global.module.exports = exports;
        }
        global._PLUGIN_EXPORTS = global._PLUGIN_EXPORTS || {};
        global.require = function (name) {
          var plugin = global._PLUGIN_EXPORTS[name] || global[name],
            msg = "One of the included scripts requires '" + 
              name + "', which is not loaded. " +
              "\nTry including '<script src=\"" + name + ".js\"></script>'.\n";
          if ('undefined' === typeof plugin) {
            alert(msg);
            throw new Error(msg);
          }
          return plugin;
        };
        global.provide = function (name) {
          global._PLUGIN_EXPORTS[name] = module.exports;
          resetModule();
        };
        resetModule();
      }());
    } else {
      global.provide = function () {};
    }
}());

/*!
    Copyright (c) 2009, 280 North Inc. http://280north.com/
    MIT License. http://github.com/280north/narwhal/blob/master/README.md
*/

// Brings an environment as close to ECMAScript 5 compliance
// as is possible with the facilities of erstwhile engines.

// ES5 Draft
// http://www.ecma-international.org/publications/files/drafts/tc39-2009-050.pdf

// NOTE: this is a draft, and as such, the URL is subject to change.  If the
// link is broken, check in the parent directory for the latest TC39 PDF.
// http://www.ecma-international.org/publications/files/drafts/

// Previous ES5 Draft
// http://www.ecma-international.org/publications/files/drafts/tc39-2009-025.pdf
// This is a broken link to the previous draft of ES5 on which most of the
// numbered specification references and quotes herein were taken.  Updating
// these references and quotes to reflect the new document would be a welcome
// volunteer project.

//
// Array
// =====
//

// ES5 15.4.3.2 
if (!Array.isArray) {
    Array.isArray = function(obj) {
        return Object.prototype.toString.call(obj) == "[object Array]";
    };
}

// ES5 15.4.4.18
if (!Array.prototype.forEach) {
    Array.prototype.forEach =  function(block, thisObject) {
        var len = this.length >>> 0;
        for (var i = 0; i < len; i++) {
            if (i in this) {
                block.call(thisObject, this[i], i, this);
            }
        }
    };
}

// ES5 15.4.4.19
// https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/map
if (!Array.prototype.map) {
    Array.prototype.map = function(fun /*, thisp*/) {
        var len = this.length >>> 0;
        if (typeof fun != "function")
          throw new TypeError();

        var res = new Array(len);
        var thisp = arguments[1];
        for (var i = 0; i < len; i++) {
            if (i in this)
                res[i] = fun.call(thisp, this[i], i, this);
        }

        return res;
    };
}

// ES5 15.4.4.20
if (!Array.prototype.filter) {
    Array.prototype.filter = function (block /*, thisp */) {
        var values = [];
        var thisp = arguments[1];
        for (var i = 0; i < this.length; i++)
            if (block.call(thisp, this[i]))
                values.push(this[i]);
        return values;
    };
}

// ES5 15.4.4.16
if (!Array.prototype.every) {
    Array.prototype.every = function (block /*, thisp */) {
        var thisp = arguments[1];
        for (var i = 0; i < this.length; i++)
            if (!block.call(thisp, this[i]))
                return false;
        return true;
    };
}

// ES5 15.4.4.17
if (!Array.prototype.some) {
    Array.prototype.some = function (block /*, thisp */) {
        var thisp = arguments[1];
        for (var i = 0; i < this.length; i++)
            if (block.call(thisp, this[i]))
                return true;
        return false;
    };
}

// ES5 15.4.4.21
// https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/reduce
if (!Array.prototype.reduce) {
    Array.prototype.reduce = function(fun /*, initial*/) {
        var len = this.length >>> 0;
        if (typeof fun != "function")
            throw new TypeError();

        // no value to return if no initial value and an empty array
        if (len == 0 && arguments.length == 1)
            throw new TypeError();

        var i = 0;
        if (arguments.length >= 2) {
            var rv = arguments[1];
        } else {
            do {
                if (i in this) {
                    rv = this[i++];
                    break;
                }

                // if array contains no values, no initial value to return
                if (++i >= len)
                    throw new TypeError();
            } while (true);
        }

        for (; i < len; i++) {
            if (i in this)
                rv = fun.call(null, rv, this[i], i, this);
        }

        return rv;
    };
}

// ES5 15.4.4.22
// https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/reduceRight
if (!Array.prototype.reduceRight) {
    Array.prototype.reduceRight = function(fun /*, initial*/) {
        var len = this.length >>> 0;
        if (typeof fun != "function")
            throw new TypeError();

        // no value to return if no initial value, empty array
        if (len == 0 && arguments.length == 1)
            throw new TypeError();

        var i = len - 1;
        if (arguments.length >= 2) {
            var rv = arguments[1];
        } else {
            do {
                if (i in this) {
                    rv = this[i--];
                    break;
                }

                // if array contains no values, no initial value to return
                if (--i < 0)
                    throw new TypeError();
            } while (true);
        }

        for (; i >= 0; i--) {
            if (i in this)
                rv = fun.call(null, rv, this[i], i, this);
        }

        return rv;
    };
}

// ES5 15.4.4.14
if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function (value /*, fromIndex */ ) {
        var length = this.length;
        if (!length)
            return -1;
        var i = arguments[1] || 0;
        if (i >= length)
            return -1;
        if (i < 0)
            i += length;
        for (; i < length; i++) {
            if (!Object.prototype.hasOwnProperty.call(this, i))
                continue;
            if (value === this[i])
                return i;
        }
        return -1;
    };
}

// ES5 15.4.4.15
if (!Array.prototype.lastIndexOf) {
    Array.prototype.lastIndexOf = function (value /*, fromIndex */) {
        var length = this.length;
        if (!length)
            return -1;
        var i = arguments[1] || length;
        if (i < 0)
            i += length;
        i = Math.min(i, length - 1);
        for (; i >= 0; i--) {
            if (!Object.prototype.hasOwnProperty.call(this, i))
                continue;
            if (value === this[i])
                return i;
        }
        return -1;
    };
}

//
// Object
// ======
// 

// ES5 15.2.3.2
if (!Object.getPrototypeOf) {
    Object.getPrototypeOf = function (object) {
        return object.__proto__;
        // or undefined if not available in this engine
    };
}

// ES5 15.2.3.3
if (!Object.getOwnPropertyDescriptor) {
    Object.getOwnPropertyDescriptor = function (object) {
        return {}; // XXX
    };
}

// ES5 15.2.3.4
if (!Object.getOwnPropertyNames) {
    Object.getOwnPropertyNames = function (object) {
        return Object.keys(object);
    };
}

// ES5 15.2.3.5 
if (!Object.create) {
    Object.create = function(prototype, properties) {
        if (typeof prototype != "object" || prototype === null)
            throw new TypeError("typeof prototype["+(typeof prototype)+"] != 'object'");
        function Type() {};
        Type.prototype = prototype;
        var object = new Type();
        if (typeof properties !== "undefined")
            Object.defineProperties(object, properties);
        return object;
    };
}

// ES5 15.2.3.6
if (!Object.defineProperty) {
    Object.defineProperty = function(object, property, descriptor) {
        var has = Object.prototype.hasOwnProperty;
        if (typeof descriptor == "object" && object.__defineGetter__) {
            if (has.call(descriptor, "value")) {
                if (!object.__lookupGetter__(property) && !object.__lookupSetter__(property))
                    // data property defined and no pre-existing accessors
                    object[property] = descriptor.value;
                if (has.call(descriptor, "get") || has.call(descriptor, "set"))
                    // descriptor has a value property but accessor already exists
                    throw new TypeError("Object doesn't support this action");
            }
            // fail silently if "writable", "enumerable", or "configurable"
            // are requested but not supported
            /*
            // alternate approach:
            if ( // can't implement these features; allow false but not true
                !(has.call(descriptor, "writable") ? descriptor.writable : true) ||
                !(has.call(descriptor, "enumerable") ? descriptor.enumerable : true) ||
                !(has.call(descriptor, "configurable") ? descriptor.configurable : true)
            )
                throw new RangeError(
                    "This implementation of Object.defineProperty does not " +
                    "support configurable, enumerable, or writable."
                );
            */
            else if (typeof descriptor.get == "function")
                object.__defineGetter__(property, descriptor.get);
            if (typeof descriptor.set == "function")
                object.__defineSetter__(property, descriptor.set);
        }
        return object;
    };
}

// ES5 15.2.3.7
if (!Object.defineProperties) {
    Object.defineProperties = function(object, properties) {
        for (var property in properties) {
            if (Object.prototype.hasOwnProperty.call(properties, property))
                Object.defineProperty(object, property, properties[property]);
        }
        return object;
    };
}

// ES5 15.2.3.8
if (!Object.seal) {
    Object.seal = function (object) {
        return object;
    };
}

// ES5 15.2.3.9
if (!Object.freeze) {
    Object.freeze = function (object) {
        return object;
    };
}

// ES5 15.2.3.10
if (!Object.preventExtensions) {
    Object.preventExtensions = function (object) {
        return object;
    };
}

// ES5 15.2.3.11
if (!Object.isSealed) {
    Object.isSealed = function (object) {
        return false;
    };
}

// ES5 15.2.3.12
if (!Object.isFrozen) {
    Object.isFrozen = function (object) {
        return false;
    };
}

// ES5 15.2.3.13
if (!Object.isExtensible) {
    Object.isExtensible = function (object) {
        return true;
    };
}

// ES5 15.2.3.14
if (!Object.keys) {
    Object.keys = function (object) {
        var keys = [];
        for (var name in object) {
            if (Object.prototype.hasOwnProperty.call(object, name)) {
                keys.push(name);
            }
        }
        return keys;
    };
}

//
// Date
// ====
//

// ES5 15.9.5.43
// Format a Date object as a string according to a subset of the ISO-8601 standard.
// Useful in Atom, among other things.
if (!Date.prototype.toISOString) {
    Date.prototype.toISOString = function() {
        return (
            this.getFullYear() + "-" +
            (this.getMonth() + 1) + "-" +
            this.getDate() + "T" +
            this.getHours() + ":" +
            this.getMinutes() + ":" +
            this.getSeconds() + "Z"
        ); 
    }
}

// ES5 15.9.4.4
if (!Date.now) {
    Date.now = function () {
        return new Date().getTime();
    };
}

// ES5 15.9.5.44
if (!Date.prototype.toJSON) {
    Date.prototype.toJSON = function (key) {
        // This function provides a String representation of a Date object for
        // use by JSON.stringify (15.12.3). When the toJSON method is called
        // with argument key, the following steps are taken:

        // 1.  Let O be the result of calling ToObject, giving it the this
        // value as its argument.
        // 2. Let tv be ToPrimitive(O, hint Number).
        // 3. If tv is a Number and is not finite, return null.
        // XXX
        // 4. Let toISO be the result of calling the [[Get]] internal method of
        // O with argument "toISOString".
        // 5. If IsCallable(toISO) is false, throw a TypeError exception.
        if (typeof this.toISOString != "function")
            throw new TypeError();
        // 6. Return the result of calling the [[Call]] internal method of
        // toISO with O as the this value and an empty argument list.
        return this.toISOString();

        // NOTE 1 The argument is ignored.

        // NOTE 2 The toJSON function is intentionally generic; it does not
        // require that its this value be a Date object. Therefore, it can be
        // transferred to other kinds of objects for use as a method. However,
        // it does require that any such object have a toISOString method. An
        // object is free to use the argument key to filter its
        // stringification.
    };
}

// 
// Function
// ========
// 

// ES-5 15.3.4.5
// http://www.ecma-international.org/publications/files/drafts/tc39-2009-025.pdf
var slice = Array.prototype.slice;
if (!Function.prototype.bind) {
    Function.prototype.bind = function (that) { // .length is 1
        // 1. Let Target be the this value.
        var target = this;
        // 2. If IsCallable(Target) is false, throw a TypeError exception.
        // XXX this gets pretty close, for all intents and purposes, letting 
        // some duck-types slide
        if (typeof target.apply != "function" || typeof target.call != "function")
            return new TypeError();
        // 3. Let A be a new (possibly empty) internal list of all of the
        //   argument values provided after thisArg (arg1, arg2 etc), in order.
        var args = slice.call(arguments);
        // 4. Let F be a new native ECMAScript object.
        // 9. Set the [[Prototype]] internal property of F to the standard
        //   built-in Function prototype object as specified in 15.3.3.1.
        // 10. Set the [[Call]] internal property of F as described in
        //   15.3.4.5.1.
        // 11. Set the [[Construct]] internal property of F as described in
        //   15.3.4.5.2.
        // 12. Set the [[HasInstance]] internal property of F as described in
        //   15.3.4.5.3.
        // 13. The [[Scope]] internal property of F is unused and need not
        //   exist.
        var bound = function () {

            if (this instanceof bound) {
                // 15.3.4.5.2 [[Construct]]
                // When the [[Construct]] internal method of a function object,
                // F that was created using the bind function is called with a
                // list of arguments ExtraArgs the following steps are taken:
                // 1. Let target be the value of F's [[TargetFunction]]
                //   internal property.
                // 2. If target has no [[Construct]] internal method, a
                //   TypeError exception is thrown.
                // 3. Let boundArgs be the value of F's [[BoundArgs]] internal
                //   property.
                // 4. Let args be a new list containing the same values as the
                //   list boundArgs in the same order followed by the same
                //   values as the list ExtraArgs in the same order.

                var self = Object.create(target.prototype);
                target.apply(self, args.concat(slice.call(arguments)));
                return self;

            } else {
                // 15.3.4.5.1 [[Call]]
                // When the [[Call]] internal method of a function object, F,
                // which was created using the bind function is called with a
                // this value and a list of arguments ExtraArgs the following
                // steps are taken:
                // 1. Let boundArgs be the value of F's [[BoundArgs]] internal
                //   property.
                // 2. Let boundThis be the value of F's [[BoundThis]] internal
                //   property.
                // 3. Let target be the value of F's [[TargetFunction]] internal
                //   property.
                // 4. Let args be a new list containing the same values as the list
                //   boundArgs in the same order followed by the same values as
                //   the list ExtraArgs in the same order. 5.  Return the
                //   result of calling the [[Call]] internal method of target
                //   providing boundThis as the this value and providing args
                //   as the arguments.

                // equiv: target.call(this, ...boundArgs, ...args)
                return target.call.apply(
                    target,
                    args.concat(slice.call(arguments))
                );

            }

        };
        // 5. Set the [[TargetFunction]] internal property of F to Target.
        // extra:
        bound.bound = target;
        // 6. Set the [[BoundThis]] internal property of F to the value of
        // thisArg.
        // extra:
        bound.boundTo = that;
        // 7. Set the [[BoundArgs]] internal property of F to A.
        // extra:
        bound.boundArgs = args;
        bound.length = (
            // 14. If the [[Class]] internal property of Target is "Function", then
            typeof target == "function" ?
            // a. Let L be the length property of Target minus the length of A.
            // b. Set the length own property of F to either 0 or L, whichever is larger.
            Math.max(target.length - args.length, 0) :
            // 15. Else set the length own property of F to 0.
            0
        )
        // 16. The length own property of F is given attributes as specified in
        //   15.3.5.1.
        // TODO
        // 17. Set the [[Extensible]] internal property of F to true.
        // TODO
        // 18. Call the [[DefineOwnProperty]] internal method of F with
        //   arguments "caller", PropertyDescriptor {[[Value]]: null,
        //   [[Writable]]: false, [[Enumerable]]: false, [[Configurable]]:
        //   false}, and false.
        // TODO
        // 19. Call the [[DefineOwnProperty]] internal method of F with
        //   arguments "arguments", PropertyDescriptor {[[Value]]: null,
        //   [[Writable]]: false, [[Enumerable]]: false, [[Configurable]]:
        //   false}, and false.
        // TODO
        // NOTE Function objects created using Function.prototype.bind do not
        // have a prototype property.
        // XXX can't delete it in pure-js.
        return bound;
    };
}

//
// String
// ======
//

// ES5 15.5.4.20
if (!String.prototype.trim) {
    // http://blog.stevenlevithan.com/archives/faster-trim-javascript
    var trimBeginRegexp = /^\s\s*/;
    var trimEndRegexp = /\s\s*$/;
    String.prototype.trim = function () {
        return String(this).replace(trimBeginRegexp, '').replace(trimEndRegexp, '');
    };
}
(function () {
  // parseUri 1.2.2
  // (c) Steven Levithan <stevenlevithan.com>
  // MIT License
  // wrapped by AJ ONeal to be more like node.js's

  function parseUri(str) {
    var o = parseUri.options,
      m   = o.parser[o.strictMode ? "strict" : "loose"].exec(str),
      uri = {},
      i   = 14;

    while (i > 0) {
      i -= 1;
      uri[o.key[i]] = m[i] || "";
    }

    uri[o.q.name] = {};
    uri[o.key[12]].replace(o.q.parser, function ($0, $1, $2) {
      if ($1) uri[o.q.name][$1] = $2;
    });

    return uri;
  };

  parseUri.options = {
    strictMode: false,
    key: ["href","protocol","host","auth","user","password","hostname","port","relative","pathname","directory","file","querystring","hash"],
    q:   {
      name:   "queryhash",
      parser: /(?:^|&)([^&=]*)=?([^&]*)/g
    },
    parser: {
      strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
      loose:  /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
    }
  };

  function parse(urlStr, parseQueryString) {
    var url = parseUri(urlStr);
    url.search = (0 !== url.querystring) ? (url.search = '?' + url.querystring) : '';
    url.query = (true === parseQueryString) ? url.queryhash : url.querystring;
    return url;
  }

  function format(urlObj) {
    throw new Error("'format' not supported yet");
  }

  function resolve(from, to) {
    throw new Error("'format' not supported yet");
  }

  parse("http://user:pass@host.com:8080/p/a/t/h?query=string#hash", false);
  module.exports = { parse: parse, format: format };
  provide("url");
}());
/*jslint browser: true, debug: true, evil: true, laxbreak: true, forin: true, sub: true, css: true, cap: true, on: true, fragment: true, es5: true, onevar: true, undef: true, nomen: true, eqeqeq: true, plusplus: true, bitwise: true, regexp: true, newcap: true, immed: true, strict: true */
/*
  module = {},
  provide = {},
*/
"use strict";
(function (undefined) {
  // logger utility
  function log(e) {
    var args = Array.prototype.slice.call(arguments);
    if ('undefined' !== typeof console && 'undefined' !== console.log) {
      try { // Firefox
        console.log.apply(console.log, args);
      }
      catch (ignore) {
        try { // WebKit Quirk/BUG fix
          console.log.apply(console, args);
        }
        catch (ignore_again) {
          console.log(e);
        }
      }
    }
  }

  // Exception Class
  function exception(msg) {
    this.name = "FuturesException";
    this.message = msg;
  }

  // error utility
  function error(e) {
    /* TODO if browser *** alert(e); *** */
    log(e);
    if (typeof console !== 'undefined') {
      debugger;
    }
    throw new exception(e);
  }
  module.exports = {
    log: log,
    error: error,
    exception: exception,
    extend: function (over, from) {
      Object.keys(from).forEach(function (key) {
        over[key] = from[key];
      });
      return over;
    }
  };
  provide = ('undefined' !== typeof provide) ? provide : function () {};
  provide('futures/private');
}());
/*jslint browser: true, debug: true, evil: true, laxbreak: true, forin: true, sub: true, css: true, cap: true, on: true, fragment: true, es5: true, onevar: true, undef: true, nomen: true, eqeqeq: true, plusplus: true, bitwise: true, regexp: true, newcap: true, immed: true, strict: true */
/*
  require = {},
  module = {},
  provide = {},
*/
"use strict";
(function (undefined) {
  var Futures = require('futures/private');
  /**
   * Create a chainable promise
   */
  function promise(guarantee) {
    var status = 'unresolved',
      outcome, waiting = [],
      dreading = [],
      passable, result;

    function vouch(deed, callback) {
      switch (status) {
      case 'unresolved':
        (deed === 'fulfilled' ? waiting : dreading).push(callback);
        break;
      case deed:
        callback.apply(callback, outcome);
        break;
      }
    }

    function resolve(deed, value) {
      if (status !== 'unresolved') {
        throw new Futures.exception('The promise has already been resolved:' + status);
      }
      status = deed;
      outcome = value;
      (deed === 'fulfilled' ? waiting : dreading).forEach(function (func) {
        try {
          func.apply(func, outcome);
        } catch (e) {
          // TODO do we really want 3rd parties ruining it for everyone?
          if (!(e instanceof Futures.exception)) {
            throw e;
          }
        }
      });
      waiting = null;
      dreading = null;
    }
    passable = {
      when: function (f) {
        result.when(f);

        return this;
      },
      fail: function (f) {
        result.fail(f);
        return this;
      }
    };
    result = {
      when: function (func) {
        vouch('fulfilled', func);

        return this;
      },
      fail: function (func) {
        vouch('smashed', func);

        Futures.log("'fail' is deprecated, please use `when(err, data)` instead");
        return this;
      },
      fulfill: function () {
        var args = Array.prototype.slice.call(arguments);
        resolve('fulfilled', args);

        return passable;
      },
      smash: function () {
        var args = Array.prototype.slice.call(arguments);
        resolve('smashed', args);

        Futures.log("'smash' is deprecated, please use `fulfill(err, data)` instead");
        return passable;
      },
      status: function () {
        return status;
      },
      passable: function () {
        return passable;
      }
    };
    if (undefined !== guarantee) {
      return result.fulfill(guarantee);
    }
    return result;
  }

  function subscription2promise(s) {
    if (!s || !s.subscribe) {
      throw new Futures.exception("Not a subscription");
    }
    if (s.when) {
      return s;
    }
    var p = promise(),
      unsubscribe, unmisscribe;

    unsubscribe = s.subscribe(p.fulfill);
    unmisscribe = s.miss(p.smash);
    p.when(function () {
      unsubscribe();
      unmisscribe();
    });
    p.fail(function () {
      unsubscribe();
      unmisscribe();
    });
    return p; // check unmisscribe because I'm not sure it's there at all
    // increase the array to the appropriate size
  }

  /**
   * Join any number of promises and return the results in the order they were passed in.
   *
   * p_all = join_promises([p1, p2, p3], params);
   * // or
   * // p_all = join_promises(p1, p2, p3, ..., params);
   * p_all.when(function(d_arr){
   *   var d1 = d_arr[0],
   *     d2 = d_arr[1],
   *     d3 = d_arr[2];
   * });
   *
   * TODO add options, such as timeout 
   * TODO notify the user which promise failed when smashed?
   *
   * @param promises - an Array of Promises
   * @param params - an Object hash
   * @param args - any number of Promises, and perhaps an object hash
   * @return A promise which is fulfilled only if and when all other parameter promises are fulfilled.
   */
  function pjoin(promises, params) {
    var p = promise(),
    num = 0,
    ps = [],
    success = true,
    last_arg,
    timeout,
    use_array,
    notify_all;

    notify_all = function(success) {
      var cb = (success) ? p.fulfill : p.smash;
      if (use_array) {
        cb.call(null, ps);
      } else {
        cb.apply(null, ps);
      }
    };

    if (Array.isArray(promises)) {
      use_array = true;
    } else { // or the user may pass in arguments
      promises = Array.prototype.slice.call(arguments); // TODO what if the last argument is params? 
      last_arg = promises.pop();
      if (promises.length && !last_arg.when && !last_arg.subscribe) {
        params = last_arg;
      } else {
        promises.push(last_arg);
      }
    }
    params = params || {};
    num = promises.length;

    if (0 <= params.timeout) {
      timeout = setTimeout(notify_all, params.timeout, false);
    }

    function partial(args, i, status) {
      success = success && status;
      ps[i] = args;
      num -= 1;
      // only execute this when all have return, or timed out
      if (0 === num) {
        clearTimeout(timeout);
        notify_all(success);
      }
    }
    promises.forEach(function (p, i, arr) { // handle subscriptions
      if (p && p.subscribe && !p.when) { // Do I even need to pass this back?
        // How mutable are objects?
        p = subscription2promise(p);
      }
      // increase the array to the appropriate size
      ps.push(['join_error_or_timeout']);
      p.when(function () {
        partial(Array.prototype.slice.call(arguments), i, true);
      });
      p.fail(function () {
        partial(Array.prototype.slice.call(arguments), i, false);
      });
    });
    return p;
  }

  module.exports = {
    promise: promise,
    join: pjoin,
    subscription2promise: subscription2promise
  };
  provide = ('undefined' !== typeof provide) ? provide : function () {};
  provide('futures/promise');
}());
/*jslint devel: true, debug: true, es5: true, onevar: true, undef: true, nomen: true, eqeqeq: true, plusplus: true, bitwise: true, regexp: true, newcap: true, immed: true, strict: true */
/*
    Purposeful JSLint exceptions
    require = function () {}, 
    module = {},
    provide = function () {},
    Buffer,
    global,
    window,
    jQuery,
    console = {},
    XMLHttpRequest,
    ActiveXObject,
*/
"use strict";
(function (undefined) {
  var url = require('url'),
    Futures = require('futures/promise'),
    ahr, ahr_doc,
    nativeHttpClient,
    globalOptions,
    debug = false; // TODO underExtend localOptions

  // Emulate `request`
  ahr = function (options, callback) {
    return ahr.http(options).when(callback || function () {});
  };
  ahr.join = Futures.join;

  if ('undefined' !== typeof console) {
    ahr.log = console.log || function () {};
  }
  ahr.log = (!debug) ? function () {} : (ahr.log || function () {});
  
  if (!Object.keys) {
    require('es5');
  }

  function cloneJson(obj) {
    // Loses functions, but oh well
    return JSON.parse(JSON.stringify(obj));
  }


  globalOptions = {
    port: 80,
    host: 'localhost',
    ssl: false,
    protocol: 'http',
    method: 'GET',
    headers: {
      //'accept': "application/json; charset=utf-8, */*; q=0.5"
    },
    pathname: '/',
    search: '',
    redirectCount: 0,
    redirectCountMax: 5,
    params: {},
    // contentType: 'json',
    // accept: 'json',
    followRedirect: true,
    timeout: 20000
  };

  ahr_doc = [
    {
      keyname: 'ssl',
      type: 'boolean',
      oneOf: [true, false],
      validation: function (item) {
        // TODO move to default validator
        return true === item || false === item;
      }
    },
    {
      keyname: 'type',
      type: 'string',
      oneOf: ['HEAD', 'GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      validation: function (item) {
        var result = false;
        ahr_doc.oneOf.forEach(function (verb) {
          // TODO move to default validator
          if (verb === item) {
            result = true;
          }
        });
        return result;
      }
    }
  ];

  function jsonUriEncode(json) {
    if ('object' !== typeof json) {
      return json;
    }
    var query = '';
    Object.keys(json).forEach(function (key) {
      // assume that the user meant to delete this element
      if ('undefined' === typeof json[key]) {
        return;
      }

      var param, value;
      param = encodeURIComponent(key);
      value = encodeURIComponent(json[key]);
      query += '&' + param;
      // assume that the user wants just the param name sent
      if (null !== json[key]) {
        query += '=' + value;
      }
    });
    return query.substring(1);
  }

  function extendUrl(uri, params) {
    var query;

    uri = uri || "";
    params = params || {};
    query = jsonUriEncode(params);

    // cut the leading '&' if no other params have been written
    if (query.length > 0) {
      if (!uri.match(/\?/)) {
        uri += '?' + query;
      } else {
        uri += '&' + query;
      }
    }
    return uri;
  }
  extendUrl.test = function () {
    return ('' === extendUrl("",{}) &&
      'http://example.com' === extendUrl("http://example.com", {}) &&
      // some sites use this notation for boolean values
      // should undefind be counted as a user-mistake? and null do the 'right thing' ?
      'http://example.com' === extendUrl("http://example.com", {foo: undefined}) &&
      'http://example.com?foo' === extendUrl("http://example.com", {foo: null}) &&
      'http://example.com?foo=bar' === extendUrl("http://example.com", {foo: 'bar'}) &&
      'http://example.com?foo=bar&bar=baz' === extendUrl("http://example.com?foo=bar", {bar: 'baz'}) &&
      'http://example.com?fo%26%25o=ba%3Fr' === extendUrl("http://example.com", {'fo&%o': 'ba?r'})
    );
  };

  // useful for extending global options onto a local variable
  function overExtend(global, local) {
    //global = cloneJson(global);
    Object.keys(local).forEach(function (key) {
      global[key] = local[key];
    });
    return global;
  }

  // useful for extending global options onto a local variable
  function underExtend(local, global) {
    // TODO copy functions
    // TODO recurse / deep copy
    global = cloneJson(global);
    Object.keys(global).forEach(function (key) {
      if ('undefined' === typeof local[key]) {
        local[key] = global[key];
      }
    });
    return local;
  }

  // Allow access without screwing up internal state
  ahr.globalOptionKeys = function () {
    return Object.keys(globalOptions);
  };
  ahr.globalOption = function (key, val) {
    if ('undefined' === typeof val) {
      return globalOptions[key];
    }
    if (null === val) {
      val = undefined;
    }
    globalOptions[key] = val;
  };
  ahr.setGlobalOptions = function (bag) {
    Object.keys(bag).forEach(function (key) {
      globalOptions[key] = bag[key];
    });
  };

  /*
   * About the HTTP spec and which methods allow bodies, etc:
   * http://stackoverflow.com/questions/299628/is-an-entity-body-allowed-for-an-http-delete-request
   */
  ['HEAD', 'GET', 'DELETE', 'OPTIONS'].forEach(function (verb) {
    ahr[verb.toLowerCase()] = function (uri, params, options, callback) {
      if (callback) {
        return ahr[verb.toLowerCase()](uri, params, options).when(callback);
      }
      options = options || {};

      options.method = verb;
      options.uri = uri || "";
      // TODO global params
      options.params = underExtend(params || {}, options.params || {});

      if (options.body) {
        throw new Error("The de facto standard is that '" + verb + "' should not have a body.\n" +
          "Most web servers just ignore it. Please use 'params' rather than 'body'.\n" +
          "Also, you may consider filing this as a bug - please give an explanation.");
      }

      return ahr.http(options);
    };
  });

  // Correcting an oversight of jQuery.
  // POST and PUT can have both params (in the URL) and data (in the body)
  ['POST', 'PUT'].forEach(function (verb) {
    ahr[verb.toLowerCase()] = function (uri, params, body, options, callback) {
      if (callback) {
        return ahr[verb.toLowerCase()](uri, params, body, options).when(callback);
      }
      options = options || {};

      options.method = verb;
      options.uri = uri || "";
      // TODO global params
      options.params = underExtend(params || {}, options.params || {});
      options.body = body;

      return ahr.http(options);
    };
  });

  // HTTPS
  ahr.https = function (options, callback) {
    if (callback) {
      return ahr.https(options).when(callback);
    }
    options.ssl = true;
    options.protocol = "https";
    return ahr.http(options);
  };

  // JSONP
  ahr.jsonp = function (uri, jsonp, params, options, callback) {
    if (callback) {
      return ahr.jsonp(uri, jsonp, params, options).when(callback);
    }
    options = options || {};

    ahr.log("hello from jsonp");

    if (!jsonp) {
      throw new Error("'jsonp' is not an optional parameter.\n" +
        "If you believe that this should default to 'callback' rather" +
        "than throwing an error, please file a bug");
    }

    options.uri = uri || "";
    options.params = underExtend(params || {}, options.params || {});
    options.jsonp = jsonp;

    if (options.body) {
      throw new Error("The de facto standard is that 'jsonp' should not have a body.\n" +
        "If you consider filing this as a bug please give an explanation.");
    }

    // TODO determine same-domain XHR or XHR2/CORS or SSJS
    return ahr.http(options);
  };

  function nodeHttpClient(options) {
    ahr.log("nodeHttpClient");
    var http = require('http'),
      promise = Futures.promise(),
      request,
      timeoutToken,
      response,
      cancelled = false;
    
    underExtend(options.headers, {'user-agent': 'Node.js (AbstractHttpRequest)'});

    // Set timeout for initial contact of server
    timeoutToken = setTimeout(function () {
      promise.fulfill('timeout', response, undefined);
      cancelled = true;
    }, options.timeout);

    // create Connection, Request
    //console.log(options.port, options.hostname, options.ssl);
    options.client = http.createClient(options.port, options.hostname, options.ssl);
    if (options.auth) {
      options.headers['authorization'] = 'Basic ' + (new Buffer(options.auth, 'utf8')).toString('base64');
    }
    //console.log(options.method, options.requestPath, JSON.stringify(options.headers), options.encodedBody);
    request = options.client.request(options.method, options.requestPath, options.headers);
    request.end(options.encodedBody);

    options.syncback(request);

    //console.dir(request);
    request.on('response', function (p_response) {
      var data = '', err = '';
      response = p_response;
      //console.dir(p_response);

      if (cancelled) {
        return;
      }

      // Set timeout for request
      clearTimeout(timeoutToken); // Clear connection timeout
      timeoutToken = setTimeout(function () {
        promise.fulfill('timeout');
        cancelled = true;
      }, options.timeout);

      response.on('data', function (chunk) {
        data += chunk;
      });
      response.on('error', function (chunk) {
        err = chunk;
      });
      response.on('end', function (chunk) {
        if (cancelled) {
          return;
        }

        clearTimeout(timeoutToken); // Clear request timeout
        if (response.statusCode && response.statusCode >= 400) {
          // Error on Error
          err = err || response.statusCode;
        } else if (response.statusCode && 
                    response.statusCode >= 300 && 
                    response.statusCode !== 304 && 
                    response.headers.location &&
                    options.followRedirect && 
                    options.redirectCount < options.redirectCountMax) {
          ahr.log("Redirect");
          // Redirect when requested
          // TODO set max redirect
          options.uri = response.headers.location;
          options.redirectCount += 1;
          delete options.client;
          if (options.headers) {
            delete options.headers.host;
          }
          ahr.log(options);
          ahr.http(options).when(promise.fulfill);
          return;
        }
        if ('undefined' === typeof err && options.jsonp && data) {
          // TODO remove func exp
          global[options.jsonpCallback] = function (data) {
            JSON.parse(JSON.stringify(data));
            promise.fulfill(err, response, data);
            global[options.jsonpCallback] = undefined;
            try {
              delete global[options.jsonpCallback];
            } catch(e) {}
          };
          // this will be a wrapped object
          eval(data);
          return;
        }
        promise.fulfill(err, response, data);
      });
    });

    return promise.passable();
  }

  function browserJsonpClient(options) {
    // TODO check for Same-domain / XHR2/CORS support
    // before attempting to insert script tag
    // Those support headers and such, which are good
    var cbkey = options.jsonpCallback,
      script = document.createElement("script"),
      head = document.getElementsByTagName("head")[0] || document.documentElement,
      promise = Futures.promise(),
      timeout,
      jsonp = {},
      fulfilled; // TODO add status to Futures

    jsonp[options.jsonp] = options.jsonpCallback;
    options.uri = extendUrl(options.uri, jsonp);

    // cleanup: cleanup window and dom
    function cleanup() {
      ahr.log('cleanup');
      window[cbkey] = undefined;
      try {
        delete window[cbkey];
        // may have already been removed
        head.removeChild(script);
      } catch(e) {}
    }

    // onError: Set timeout if script tag fails to load
    if (options.timeout) {
      timeout = setTimeout(function () {
        ahr.log("timeout-log-1");
        fulfilled = true;
        promise.fulfill.apply(null, arguments);
        cleanup();
      }, 
        options.timeout,
      [
        "timeout", 
        {readyState: 1, script: true, error: timeout},
        undefined
      ]);
    }

    // onSuccess: Sanatize data, Send, Cleanup
    window[cbkey] = function (data) {
      ahr.log('success');
      if (fulfilled) {
        return;
      }
      ahr.log(data);

      clearTimeout(timeout);
      // sanitize
      JSON.parse(JSON.stringify(data));
      promise.fulfill(undefined, {readyState: 4}, data);

      cleanup();
    };

    // Insert JSONP script into the DOM
    // set script source to the service that responds with thepadded JSON data
    script.setAttribute("type", "text/javascript");
    script.setAttribute("async", "async");
    script.setAttribute("src", options.uri);
    head.insertBefore(script, head.firstChild);
    setTimeout(function() {
      ahr.log('post-jsonp window and dom cleanup');
      // happens whether or not the user has set a timeout
      cleanup();
    }, 60000);

    options.syncback({
      readyState: 1,
      abort: function () { 
        cleanup();
      }
    });

    return promise.passable();
  }

  function browserHttpClient(options) {
    ahr.log("hello from browserHttp");
    ahr.log(options);
    if (options.jsonpCallback) {
      return browserJsonpClient(options);
    }
    // So far, these quirks are accounted for:
    // http://www.quirksmode.org/blog/archives/2005/09/xmlhttp_notes_r_2.html
    // jQuery is still better
    var xhr,
      timeout,
      fulfilled,
      twocalled,
      promise = Futures.promise();

    if (!window.XMLHttpRequest) {
      window.XMLHttpRequest = function() {
        return new ActiveXObject('Microsoft.XMLHTTP');
      };
    }

    function onReadyStateChange() {
      var err, ct, xml, data;
      // Some browsers don't fire state 2
      if (1 !== xhr.readyState && !twocalled) {
        twocalled = true;
        // Todo when headers are ready
        // options.headers(xhr)
      } else if (4 === xhr.readyState) {
        if (fulfilled) { return; }
        clearTimeout(timeout);
        ct = xhr.getResponseHeader("content-type") || "";
        xml = /* type === "xml" || !type && */ ct.indexOf("xml") >= 0;
        data = xml ? xhr.responseXML : xhr.responseText;
        if (xhr.status >= 400) {
          err = xhr.status;
        }
        promise.fulfill(err, xhr, data);
      }
    }

    timeout = setTimeout(function () {
        ahr.log('timeout-log browserHttpClient-2');
        promise.fulfill("timeout", xhr, undefined);
        fulfilled = true;
    }, options.timeout);

    xhr = new XMLHttpRequest();

    options.syncback(xhr);
    if (options.username) {
      xhr.open(options.method, options.uri, true, options.username, options.password);
    } else {
      xhr.open(options.method, options.uri, true);
    }
    // throws INVALID_STATE_ERROR if called before open
    Object.keys(options.headers).forEach(function (label) {
      try {
        xhr.setRequestHeader(label, options.headers[label]);
      } catch(e) {
        ahr.log('error setting unsafe header: ' + label);
        ahr.log(e);
      }
    });
    xhr.onreadystatechange = onReadyStateChange;
    xhr.send(options.encodedBody);

    return promise.passable();
  }

  function jQueryHttpClient(options) {
    ahr.log("hello from jQuery");
    var $ = require('jQuery'),
      promise = Futures.promise(),
      jqOpts,
      xhr,
      timeoutToken;

    // For cross-site and other invalid requests, the
    // default error handler is never triggered, so it
    // will look like a timeout
    timeoutToken = setTimeout(function () {
      // rumor has it that sometimes jQuery's timeout doesn't fire (jsonp, for example)
      try {
        promise.fulfill('timeout', xhr, undefined);
      } catch(e) {}
    }, options.timeout + 100);

    jqOpts = {
      async: true,
      beforeSend: function (xhr) {
        // TODO options.beforeSend
        // Add Headers
        Object.keys(options.headers).forEach(function (label) {
          try {
            xhr.setRequestHeader(label, options.headers[label]);
          } catch(e) {
            ahr.log('error setting unsafe header: ' + label);
            ahr.log(e);
          }
        });
      },
      // cache: false, // default true
      complete: function (xhr, data) {
        clearTimeout(timeoutToken);
      },
      contentType: options.headers["content-type"],
      // context: this,
      data: options.body,
      // dataFilter : function (data, type) {},
      // dataType: 'xml', 'html', 'script', 'json', 'jsonp', 'text'
      error: function (xhr, textStatus, errorThrown) {
        promise.fulfill(errorThrown, xhr, textStatus);
      },
      // global: true,
      // ifModified: false,
      jsonp: options.jsonp,
      // jsonpCallback: options.jsonp ? options.params[options.jsonp] : undefined,
      password: options.password,
      // processData: true, // -> x-www-form
      // scriptCharset: "utf-8", //?
      success: function (data, textStatus, xhr) {
        promise.fulfill(undefined, xhr, data);
      },
      timeout: options.timeout,
      // traditional: false,
      type: options.method,
      url: options.uri,
      username: options.username,
      // xhr: function () {}
    };
    overExtend(jqOpts, options.jQopts);

    xhr = $.ajax(jqOpts);

    options.syncback(xhr);
    // TODO throw new Error("'syncback' must be a function which accepts the immediate return value of Browser.XHR or Node.HCR");

    return promise.passable();
  }

  if ('undefined' === typeof XMLHttpRequest && 'undefined' === typeof ActiveXObject) {
      if ('undefined' === typeof require) {
        throw new Error("This doesn't appear to be a browser, nor Node.js.\n" +
          "Please write a wrapper and submit a patch or issue to github.com/coolaj86/ahr");
    }
    nativeHttpClient = nodeHttpClient;
  } else if ('undefined' !== typeof jQuery){
    nativeHttpClient = jQueryHttpClient;
  } else {
    ahr.log('selecting browser client');
    nativeHttpClient = browserHttpClient;
  }

  function objectToLowerCase(obj, recurse) {
    // Make headers all lower-case
    Object.keys(obj).forEach(function (key) {
      var key, value;
      value = obj[key];
      delete obj[key];
      if ('string' == typeof value) {
        obj[key.toLowerCase()] = value.toLowerCase();
      }
    });
    return obj;
  }


  function allowsBody(method) {
    return 'HEAD' !== method && 'GET' !== method && 'DELETE' !== method && 'OPTIONS' !== method;
  }

  ahr.http = function (options, callback) {
    if (callback) {
      return ahr.jsonp(options).when(callback);
    }
    var presets = cloneJson(globalOptions);

    if ('string' === typeof options) {
      options = {
        uri: options
      };
    }
    options = options || {};
    options.syncback = options.syncback || function () {};
    options.headers = options.headers || {};

    // Authorization
    if (options.username && options.password) {
      options.auth = options.username + ':' + options.password;
    } else if (options.auth) {
      options.username = options.auth.split(':')[0];
      options.password = options.auth.split(':')[1];
    }

    // Parse URL
    options.uri = extendUrl(options.uri, options.params);
    options = overExtend(options, url.parse(options.uri));
    ahr.log("Blah: ");
    ahr.log(options);
    options.uri = options.url || options.uri;
    if ('https' === options.protocol || '443' === options.port || true === options.ssl) {
      presets.ssl = true;
      presets.port = '443';
      presets.protocol = 'https';
      options.protocol = 'https';
    }

    // Set options according to URL
    options.headers = objectToLowerCase(options.headers || {});
    options.headers = underExtend(options.headers, presets.headers);
    options.headers['host'] = options.hostname;
    options = underExtend(options, presets);
    options.requestPath = extendUrl(options.pathname + options.search, options.params);
    // TODO user-agent should retain case
    options.headers = objectToLowerCase(options.headers);
    

    // Create & Send body
    options.headers["transfer-encoding"] = undefined; // TODO support streaming
    delete options.headers["transfer-encoding"];
    if (options.body && allowsBody(options.method)) {
      if ('string' === typeof options.body) {
        options.encodedBody = options.body;
      }
      if (!options.headers["content-type"]) {
        options.headers["content-type"] = "application/x-www-form-urlencoded";
      }
      if (!options.encodedBody) {
        if (options.headers["content-type"].match(/application\/json/) || 
            options.headers["content-type"].match(/text\/javascript/)) {
          options.encodedBody = JSON.stringify(options.body);
        } else if (options.headers["content-type"].match(/application\/x-www-form-urlencoded/)) {
          options.encodedBody = jsonUriEncode(options.body);
        } else if (!options.encodedBody) {
          throw new Error("'" + options.headers["content-type"] + "'" + "is not yet supported and you have not specified 'encodedBody'");
        }
        options.headers["content-length"] = options.encodedBody.length;
      }
    } else {
      if (options.body) {
        throw new Error('You gave a body for one of HEAD, GET, DELETE, or OPTIONS');
      }
      options.encodedBody = "";
      options.headers["content-type"] = undefined;
      options.headers["content-length"] = undefined;
      options.headers["transfer-encoding"] = undefined;
      delete options.headers["content-type"];
      delete options.headers["content-length"];
      delete options.headers["transfer-encoding"];
    }

    // JSONP
    if (options.jsonp) {
      options.jsonpCallback = 'jsonp_' + (new Date()).valueOf();
      options.headers["accept"] = "text/javascript";
      options.dataType = 'jsonp';
      options.jQopts = options.jQopts || {};
      options.jQopts.dataType = options.dataType;
    }

    ahr.log(options);

    return nativeHttpClient(options);
  };

  module.exports = ahr;
  if ('undefined' === typeof provide) { provide = function () {}; }
  provide('ahr');
}());
