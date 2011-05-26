/*jslint onevar: true, undef: true, newcap: true, regexp: true, plusplus: true, bitwise: true, devel: true, maxerr: 50, indent: 2 */
/*global module: true, exports: true, provide: true */
var global = global || (function () { return this; }()),
  __dirname = __dirname || '';
(function () {
  "use strict";

  var thrownAlready = false;

  function ssjsProvide(exports) {
    //module.exports = exports || module.exports;
  }

  function resetModule() {
    global.module = {};
    global.exports = {};
    global.module.exports = exports;
  }

  function normalize(name) {
    if ('./' === name.substr(0,2)) {
      name = name.substr(2);
    }
    return name;
  }

  function browserRequire(name) {
    var mod,
      msg = "One of the included scripts requires '" + 
        name + "', which is not loaded. " +
        "\nTry including '<script src=\"" + name + ".js\"></script>'.\n";

    name = normalize(name);
    mod = global.__REQUIRE_KISS_EXPORTS[name] || global[name];

    if ('undefined' === typeof mod && !thrownAlready) {
      thrownAlready = true;
      alert(msg);
      throw new Error(msg);
    }

    return mod;
  }

  function browserProvide(name, new_exports) {
    name = normalize(name);
    global.__REQUIRE_KISS_EXPORTS[name] = new_exports || module.exports;
    resetModule();
  }

  if (global.require) {
    if (global.provide) {
      return;
    }
    global.provide = ssjsProvide;
    return;
  }

  global.__REQUIRE_KISS_EXPORTS = global.__REQUIRE_KISS_EXPORTS || {};
  global.require = global.require || browserRequire;
  global.provide = global.provide || browserProvide;
  resetModule();

  provide('require-kiss');
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
  "use strict";

  window.process = window.process || function () {};
  window.process.nextTick = function (fn) {
    setTimeout(fn, 0);
  };
}());
var process = process || {};
(function () {
  "use strict";

  require('require-kiss');

  process.EventEmitter = process.EventEmitter || function () {};

// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var EventEmitter = exports.EventEmitter = process.EventEmitter;
var isArray = Array.isArray;

// By default EventEmitters will print a warning if more than
// 10 listeners are added to it. This is a useful default which
// helps finding memory leaks.
//
// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
var defaultMaxListeners = 10;
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!this._events) this._events = {};
  this._events.maxListeners = n;
};


EventEmitter.prototype.emit = function(type) {
  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events || !this._events.error ||
        (isArray(this._events.error) && !this._events.error.length))
    {
      if (arguments[1] instanceof Error) {
        throw arguments[1]; // Unhandled 'error' event
      } else {
        throw new Error("Uncaught, unspecified 'error' event.");
      }
      return false;
    }
  }

  if (!this._events) return false;
  var handler = this._events[type];
  if (!handler) return false;

  if (typeof handler == 'function') {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        var args = Array.prototype.slice.call(arguments, 1);
        handler.apply(this, args);
    }
    return true;

  } else if (isArray(handler)) {
    var args = Array.prototype.slice.call(arguments, 1);

    var listeners = handler.slice();
    for (var i = 0, l = listeners.length; i < l; i++) {
      listeners[i].apply(this, args);
    }
    return true;

  } else {
    return false;
  }
};

// EventEmitter is defined in src/node_events.cc
// EventEmitter.prototype.emit() is also defined there.
EventEmitter.prototype.addListener = function(type, listener) {
  if ('function' !== typeof listener) {
    throw new Error('addListener only takes instances of Function');
  }

  if (!this._events) this._events = {};

  // To avoid recursion in the case that type == "newListeners"! Before
  // adding it to the listeners, first emit "newListeners".
  this.emit('newListener', type, listener);

  if (!this._events[type]) {
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  } else if (isArray(this._events[type])) {

    // Check for listener leak
    if (!this._events[type].warned) {
      var m;
      if (this._events.maxListeners !== undefined) {
        m = this._events.maxListeners;
      } else {
        m = defaultMaxListeners;
      }

      if (m && m > 0 && this._events[type].length > m) {
        this._events[type].warned = true;
        console.error('(node) warning: possible EventEmitter memory ' +
                      'leak detected. %d listeners added. ' +
                      'Use emitter.setMaxListeners() to increase limit.',
                      this._events[type].length);
        console.trace();
      }
    }

    // If we've already got an array, just append.
    this._events[type].push(listener);
  } else {
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  var self = this;
  function g() {
    self.removeListener(type, g);
    listener.apply(this, arguments);
  };

  g.listener = listener;
  self.on(type, g);

  return this;
};

EventEmitter.prototype.removeListener = function(type, listener) {
  if ('function' !== typeof listener) {
    throw new Error('removeListener only takes instances of Function');
  }

  // does not use listeners(), so no side effect of creating _events[type]
  if (!this._events || !this._events[type]) return this;

  var list = this._events[type];

  if (isArray(list)) {
    var position = -1;
    for (var i = 0, length = list.length; i < length; i++) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener))
      {
        position = i;
        break;
      }
    }

    if (position < 0) return this;
    list.splice(position, 1);
    if (list.length == 0)
      delete this._events[type];
  } else if (list === listener ||
             (list.listener && list.listener === listener))
  {
    delete this._events[type];
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  // does not use listeners(), so no side effect of creating _events[type]
  if (type && this._events && this._events[type]) this._events[type] = null;
  return this;
};

EventEmitter.prototype.listeners = function(type) {
  if (!this._events) this._events = {};
  if (!this._events[type]) this._events[type] = [];
  if (!isArray(this._events[type])) {
    this._events[type] = [this._events[type]];
  }
  return this._events[type];
};

  provide('events', module.exports);
}());
(function () {
  "use strict";

  require('require-kiss');
  function Buffer() {
  }
  Buffer.prototype = Array.prototype;

// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// Query String Utilities

var QueryString = exports;
//var urlDecode = process.binding('http_parser').urlDecode;


function charCode(c) {
  return c.charCodeAt(0);
}


// a safe fast alternative to decodeURIComponent
QueryString.unescapeBuffer = function(s, decodeSpaces) {
  var out = new Buffer(s.length);
  var state = 'CHAR'; // states: CHAR, HEX0, HEX1
  var n, m, hexchar;

  for (var inIndex = 0, outIndex = 0; inIndex <= s.length; inIndex++) {
    var c = s.charCodeAt(inIndex);
    switch (state) {
      case 'CHAR':
        switch (c) {
          case charCode('%'):
            n = 0;
            m = 0;
            state = 'HEX0';
            break;
          case charCode('+'):
            if (decodeSpaces) c = charCode(' ');
            // pass thru
          default:
            out[outIndex++] = c;
            break;
        }
        break;

      case 'HEX0':
        state = 'HEX1';
        hexchar = c;
        if (charCode('0') <= c && c <= charCode('9')) {
          n = c - charCode('0');
        } else if (charCode('a') <= c && c <= charCode('f')) {
          n = c - charCode('a') + 10;
        } else if (charCode('A') <= c && c <= charCode('F')) {
          n = c - charCode('A') + 10;
        } else {
          out[outIndex++] = charCode('%');
          out[outIndex++] = c;
          state = 'CHAR';
          break;
        }
        break;

      case 'HEX1':
        state = 'CHAR';
        if (charCode('0') <= c && c <= charCode('9')) {
          m = c - charCode('0');
        } else if (charCode('a') <= c && c <= charCode('f')) {
          m = c - charCode('a') + 10;
        } else if (charCode('A') <= c && c <= charCode('F')) {
          m = c - charCode('A') + 10;
        } else {
          out[outIndex++] = charCode('%');
          out[outIndex++] = hexchar;
          out[outIndex++] = c;
          break;
        }
        out[outIndex++] = 16 * n + m;
        break;
    }
  }

  // TODO support returning arbitrary buffers.

  return out.slice(0, outIndex - 1);
};


QueryString.unescape = function(s, decodeSpaces) {
  return QueryString.unescapeBuffer(s, decodeSpaces).toString();
};


QueryString.escape = function(str) {
  return encodeURIComponent(str);
};

var stringifyPrimitive = function(v) {
  switch (typeof v) {
    case 'string':
      return v;

    case 'boolean':
      return v ? 'true' : 'false';

    case 'number':
      return isFinite(v) ? v : '';

    default:
      return '';
  }
};


QueryString.stringify = QueryString.encode = function(obj, sep, eq, name) {
  sep = sep || '&';
  eq = eq || '=';
  obj = (obj === null) ? undefined : obj;

  switch (typeof obj) {
    case 'object':
      return Object.keys(obj).map(function(k) {
        if (Array.isArray(obj[k])) {
          return obj[k].map(function(v) {
            return QueryString.escape(stringifyPrimitive(k)) +
                   eq +
                   QueryString.escape(stringifyPrimitive(v));
          }).join(sep);
        } else {
          return QueryString.escape(stringifyPrimitive(k)) +
                 eq +
                 QueryString.escape(stringifyPrimitive(obj[k]));
        }
      }).join(sep);

    default:
      if (!name) return '';
      return QueryString.escape(stringifyPrimitive(name)) + eq +
             QueryString.escape(stringifyPrimitive(obj));
  }
};

// Parse a key=val string.
QueryString.parse = QueryString.decode = function(qs, sep, eq) {
  sep = sep || '&';
  eq = eq || '=';
  var obj = {};

  if (typeof qs !== 'string' || qs.length === 0) {
    return obj;
  }

  qs.split(sep).forEach(function(kvp) {
    var x = kvp.split(eq);
    var k = QueryString.unescape(x[0], true);
    var v = QueryString.unescape(x.slice(1).join(eq), true);

    if (!(k in obj)) {
      obj[k] = v;
    } else if (!Array.isArray(obj[k])) {
      obj[k] = [obj[k], v];
    } else {
      obj[k].push(v);
    }
  });

  return obj;
};

  provide('querystring', module.exports);
}());
(function () {
  "use strict";

  require('require-kiss');

// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

exports.parse = urlParse;
exports.resolve = urlResolve;
exports.resolveObject = urlResolveObject;
exports.format = urlFormat;

// define these here so at least they only have to be
// compiled once on the first module load.
var protocolPattern = /^([a-z0-9]+:)/,
    portPattern = /:[0-9]+$/,
    delims = ['<', '>', '"', '\'', '`', /\s/],
    unwise = ['{', '}', '|', '\\', '^', '~', '[', ']', '`'].concat(delims),
    nonHostChars = ['/', '?', ';', '#'].concat(unwise),
    hostnameMaxLen = 255,
    hostnamePartPattern = /^[a-z0-9][a-z0-9A-Z-]{0,62}$/,
    unsafeProtocol = {
      'javascript': true,
      'javascript:': true
    },
    hostlessProtocol = {
      'javascript': true,
      'javascript:': true,
      'file': true,
      'file:': true
    },
    pathedProtocol = {
      'http': true,
      'https': true,
      'ftp': true,
      'gopher': true,
      'file': true,
      'http:': true,
      'ftp:': true,
      'gopher:': true,
      'file:': true
    },
    slashedProtocol = {
      'http': true,
      'https': true,
      'ftp': true,
      'gopher': true,
      'file': true,
      'http:': true,
      'https:': true,
      'ftp:': true,
      'gopher:': true,
      'file:': true
    },
    querystring = require('querystring');

function urlParse(url, parseQueryString, slashesDenoteHost) {
  if (url && typeof(url) === 'object' && url.href) return url;

  var out = {},
      rest = url;

  var proto = protocolPattern.exec(rest);
  if (proto) {
    proto = proto[0];
    out.protocol = proto;
    rest = rest.substr(proto.length);
  }

  // figure out if it's got a host
  // user@server is *always* interpreted as a hostname, and url
  // resolution will treat //foo/bar as host=foo,path=bar because that's
  // how the browser resolves relative URLs.
  if (slashesDenoteHost || proto || rest.match(/^\/\/[^@\/]+@[^@\/]+/)) {
    var slashes = rest.substr(0, 2) === '//';
    if (slashes && !(proto && hostlessProtocol[proto])) {
      rest = rest.substr(2);
      out.slashes = true;
    }
  }

  if (!hostlessProtocol[proto] &&
      (slashes || (proto && !slashedProtocol[proto]))) {
    // there's a hostname.
    // the first instance of /, ?, ;, or # ends the host.
    // don't enforce full RFC correctness, just be unstupid about it.
    var firstNonHost = -1;
    for (var i = 0, l = nonHostChars.length; i < l; i++) {
      var index = rest.indexOf(nonHostChars[i]);
      if (index !== -1 &&
          (firstNonHost < 0 || index < firstNonHost)) firstNonHost = index;
    }
    if (firstNonHost !== -1) {
      out.host = rest.substr(0, firstNonHost);
      rest = rest.substr(firstNonHost);
    } else {
      out.host = rest;
      rest = '';
    }

    // pull out the auth and port.
    var p = parseHost(out.host);
    var keys = Object.keys(p);
    for (var i = 0, l = keys.length; i < l; i++) {
      var key = keys[i];
      out[key] = p[key];
    }
    // we've indicated that there is a hostname,
    // so even if it's empty, it has to be present.
    out.hostname = out.hostname || '';

    // validate a little.
    if (out.hostname.length > hostnameMaxLen) {
      out.hostname = '';
    } else {
      var hostparts = out.hostname.split(/\./);
      for (var i = 0, l = hostparts.length; i < l; i++) {
        var part = hostparts[i];
        if (!part.match(hostnamePartPattern)) {
          out.hostname = '';
          break;
        }
      }
    }
  }

  // now rest is set to the post-host stuff.
  // chop off any delim chars.
  if (!unsafeProtocol[proto]) {
    var chop = rest.length;
    for (var i = 0, l = delims.length; i < l; i++) {
      var c = rest.indexOf(delims[i]);
      if (c !== -1) {
        chop = Math.min(c, chop);
      }
    }
    rest = rest.substr(0, chop);
  }


  // chop off from the tail first.
  var hash = rest.indexOf('#');
  if (hash !== -1) {
    // got a fragment string.
    out.hash = rest.substr(hash);
    rest = rest.slice(0, hash);
  }
  var qm = rest.indexOf('?');
  if (qm !== -1) {
    out.search = rest.substr(qm);
    out.query = rest.substr(qm + 1);
    if (parseQueryString) {
      out.query = querystring.parse(out.query);
    }
    rest = rest.slice(0, qm);
  } else if (parseQueryString) {
    // no query string, but parseQueryString still requested
    out.search = '';
    out.query = {};
  }
  if (rest) out.pathname = rest;
  if (slashedProtocol[proto] &&
      out.hostname && !out.pathname) {
    out.pathname = '/';
  }

  // finally, reconstruct the href based on what has been validated.
  out.href = urlFormat(out);

  return out;
}

// format a parsed object into a url string
function urlFormat(obj) {
  // ensure it's an object, and not a string url.
  // If it's an obj, this is a no-op.
  // this way, you can call url_format() on strings
  // to clean up potentially wonky urls.
  if (typeof(obj) === 'string') obj = urlParse(obj);

  var protocol = obj.protocol || '',
      host = (obj.host !== undefined) ? obj.host :
          obj.hostname !== undefined ? (
              (obj.auth ? obj.auth + '@' : '') +
              obj.hostname +
              (obj.port ? ':' + obj.port : '')
          ) :
          false,
      pathname = obj.pathname || '',
      query = obj.query &&
              ((typeof obj.query === 'object' &&
                Object.keys(obj.query).length) ?
                 querystring.stringify(obj.query) :
                 '') || '',
      search = obj.search || (query && ('?' + query)) || '',
      hash = obj.hash || '';

  if (protocol && protocol.substr(-1) !== ':') protocol += ':';

  // only the slashedProtocols get the //.  Not mailto:, xmpp:, etc.
  // unless they had them to begin with.
  if (obj.slashes ||
      (!protocol || slashedProtocol[protocol]) && host !== false) {
    host = '//' + (host || '');
    if (pathname && pathname.charAt(0) !== '/') pathname = '/' + pathname;
  } else if (!host) {
    host = '';
  }

  if (hash && hash.charAt(0) !== '#') hash = '#' + hash;
  if (search && search.charAt(0) !== '?') search = '?' + search;

  return protocol + host + pathname + search + hash;
}

function urlResolve(source, relative) {
  return urlFormat(urlResolveObject(source, relative));
}

function urlResolveObject(source, relative) {
  if (!source) return relative;

  source = urlParse(urlFormat(source), false, true);
  relative = urlParse(urlFormat(relative), false, true);

  // hash is always overridden, no matter what.
  source.hash = relative.hash;

  if (relative.href === '') return source;

  // hrefs like //foo/bar always cut to the protocol.
  if (relative.slashes && !relative.protocol) {
    relative.protocol = source.protocol;
    return relative;
  }

  if (relative.protocol && relative.protocol !== source.protocol) {
    // if it's a known url protocol, then changing
    // the protocol does weird things
    // first, if it's not file:, then we MUST have a host,
    // and if there was a path
    // to begin with, then we MUST have a path.
    // if it is file:, then the host is dropped,
    // because that's known to be hostless.
    // anything else is assumed to be absolute.

    if (!slashedProtocol[relative.protocol]) return relative;

    source.protocol = relative.protocol;
    if (!relative.host && !hostlessProtocol[relative.protocol]) {
      var relPath = (relative.pathname || '').split('/');
      while (relPath.length && !(relative.host = relPath.shift()));
      if (!relative.host) relative.host = '';
      if (relPath[0] !== '') relPath.unshift('');
      if (relPath.length < 2) relPath.unshift('');
      relative.pathname = relPath.join('/');
    }
    source.pathname = relative.pathname;
    source.search = relative.search;
    source.query = relative.query;
    source.host = relative.host || '';
    delete source.auth;
    delete source.hostname;
    source.port = relative.port;
    return source;
  }

  var isSourceAbs = (source.pathname && source.pathname.charAt(0) === '/'),
      isRelAbs = (
          relative.host !== undefined ||
          relative.pathname && relative.pathname.charAt(0) === '/'
      ),
      mustEndAbs = (isRelAbs || isSourceAbs ||
                    (source.host && relative.pathname)),
      removeAllDots = mustEndAbs,
      srcPath = source.pathname && source.pathname.split('/') || [],
      relPath = relative.pathname && relative.pathname.split('/') || [],
      psychotic = source.protocol &&
          !slashedProtocol[source.protocol] &&
          source.host !== undefined;

  // if the url is a non-slashed url, then relative
  // links like ../.. should be able
  // to crawl up to the hostname, as well.  This is strange.
  // source.protocol has already been set by now.
  // Later on, put the first path part into the host field.
  if (psychotic) {

    delete source.hostname;
    delete source.auth;
    delete source.port;
    if (source.host) {
      if (srcPath[0] === '') srcPath[0] = source.host;
      else srcPath.unshift(source.host);
    }
    delete source.host;

    if (relative.protocol) {
      delete relative.hostname;
      delete relative.auth;
      delete relative.port;
      if (relative.host) {
        if (relPath[0] === '') relPath[0] = relative.host;
        else relPath.unshift(relative.host);
      }
      delete relative.host;
    }
    mustEndAbs = mustEndAbs && (relPath[0] === '' || srcPath[0] === '');
  }

  if (isRelAbs) {
    // it's absolute.
    source.host = (relative.host || relative.host === '') ?
                      relative.host : source.host;
    source.search = relative.search;
    source.query = relative.query;
    srcPath = relPath;
    // fall through to the dot-handling below.
  } else if (relPath.length) {
    // it's relative
    // throw away the existing file, and take the new path instead.
    if (!srcPath) srcPath = [];
    srcPath.pop();
    srcPath = srcPath.concat(relPath);
    source.search = relative.search;
    source.query = relative.query;
  } else if ('search' in relative) {
    // just pull out the search.
    // like href='?foo'.
    // Put this after the other two cases because it simplifies the booleans
    if (psychotic) {
      source.host = srcPath.shift();
    }
    source.search = relative.search;
    source.query = relative.query;
    return source;
  }
  if (!srcPath.length) {
    // no path at all.  easy.
    // we've already handled the other stuff above.
    delete source.pathname;
    return source;
  }

  // if a url ENDs in . or .., then it must get a trailing slash.
  // however, if it ends in anything else non-slashy,
  // then it must NOT get a trailing slash.
  var last = srcPath.slice(-1)[0];
  var hasTrailingSlash = (
      (source.host || relative.host) && (last === '.' || last === '..') ||
      last === '');

  // strip single dots, resolve double dots to parent dir
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = srcPath.length; i >= 0; i--) {
    last = srcPath[i];
    if (last == '.') {
      srcPath.splice(i, 1);
    } else if (last === '..') {
      srcPath.splice(i, 1);
      up++;
    } else if (up) {
      srcPath.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (!mustEndAbs && !removeAllDots) {
    for (; up--; up) {
      srcPath.unshift('..');
    }
  }

  if (mustEndAbs && srcPath[0] !== '' &&
      (!srcPath[0] || srcPath[0].charAt(0) !== '/')) {
    srcPath.unshift('');
  }

  if (hasTrailingSlash && (srcPath.join('/').substr(-1) !== '/')) {
    srcPath.push('');
  }

  var isAbsolute = srcPath[0] === '' ||
      (srcPath[0] && srcPath[0].charAt(0) === '/');

  // put the host back
  if (psychotic) {
    source.host = isAbsolute ? '' : srcPath.shift();
  }

  mustEndAbs = mustEndAbs || (source.host && srcPath.length);

  if (mustEndAbs && !isAbsolute) {
    srcPath.unshift('');
  }

  source.pathname = srcPath.join('/');


  return source;
}

function parseHost(host) {
  var out = {};
  var at = host.indexOf('@');
  if (at !== -1) {
    out.auth = host.substr(0, at);
    host = host.substr(at + 1); // drop the @
  }
  var port = portPattern.exec(host);
  if (port) {
    port = port[0];
    out.port = port.substr(1);
    host = host.substr(0, host.length - port.length);
  }
  if (host) out.hostname = host;
  return out;
}

  provide('url', module.exports);
}());
/*jslint onevar: true, undef: true, newcap: true, regexp: true, plusplus: true, bitwise: true, devel: true, maxerr: 50, indent: 2 */
/*global module: true, exports: true, provide: true */
var global = global || (function () { return this; }()),
  __dirname = __dirname || '';
(function () {
  "use strict";

  var thrownAlready = false;

  function ssjsProvide(exports) {
    module.exports = exports || module.exports;
  }

  function resetModule() {
    global.module = {};
    global.exports = {};
    global.module.exports = exports;
  }

  function normalize(name) {
    if ('./' === name.substr(0,2)) {
      name = name.substr(2);
    }
    return name;
  }

  function browserRequire(name) {
    var module,
      msg = "One of the included scripts requires '" + 
        name + "', which is not loaded. " +
        "\nTry including '<script src=\"" + name + ".js\"></script>'.\n";

    name = normalize(name);
    module = global.__REQUIRE_KISS_EXPORTS[name] || global[name];

    if ('undefined' === typeof module && !thrownAlready) {
      thrownAlready = true;
      alert(msg);
      throw new Error(msg);
    }

    return module;
  }

  function browserProvide(name, new_exports) {
    name = normalize(name);
    global.__REQUIRE_KISS_EXPORTS[name] = new_exports || module.exports;
    resetModule();
  }

  if (global.require) {
    if (global.provide) {
      return;
    }
    global.provide = ssjsProvide;
    return;
  }

  global.__REQUIRE_KISS_EXPORTS = global.__REQUIRE_KISS_EXPORTS || {};
  global.require = global.require || browserRequire;
  global.provide = global.provide || browserProvide;
  resetModule();

  provide('require-kiss');
}());
var process = process || {};
(function () {
  "use strict";

  require('require-kiss');

  process.EventEmitter = process.EventEmitter || function () {};

// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var EventEmitter = exports.EventEmitter = process.EventEmitter;
var isArray = Array.isArray;

// By default EventEmitters will print a warning if more than
// 10 listeners are added to it. This is a useful default which
// helps finding memory leaks.
//
// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
var defaultMaxListeners = 10;
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!this._events) this._events = {};
  this._events.maxListeners = n;
};


EventEmitter.prototype.emit = function(type) {
  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events || !this._events.error ||
        (isArray(this._events.error) && !this._events.error.length))
    {
      if (arguments[1] instanceof Error) {
        throw arguments[1]; // Unhandled 'error' event
      } else {
        throw new Error("Uncaught, unspecified 'error' event.");
      }
      return false;
    }
  }

  if (!this._events) return false;
  var handler = this._events[type];
  if (!handler) return false;

  if (typeof handler == 'function') {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        var args = Array.prototype.slice.call(arguments, 1);
        handler.apply(this, args);
    }
    return true;

  } else if (isArray(handler)) {
    var args = Array.prototype.slice.call(arguments, 1);

    var listeners = handler.slice();
    for (var i = 0, l = listeners.length; i < l; i++) {
      listeners[i].apply(this, args);
    }
    return true;

  } else {
    return false;
  }
};

// EventEmitter is defined in src/node_events.cc
// EventEmitter.prototype.emit() is also defined there.
EventEmitter.prototype.addListener = function(type, listener) {
  if ('function' !== typeof listener) {
    throw new Error('addListener only takes instances of Function');
  }

  if (!this._events) this._events = {};

  // To avoid recursion in the case that type == "newListeners"! Before
  // adding it to the listeners, first emit "newListeners".
  this.emit('newListener', type, listener);

  if (!this._events[type]) {
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  } else if (isArray(this._events[type])) {

    // Check for listener leak
    if (!this._events[type].warned) {
      var m;
      if (this._events.maxListeners !== undefined) {
        m = this._events.maxListeners;
      } else {
        m = defaultMaxListeners;
      }

      if (m && m > 0 && this._events[type].length > m) {
        this._events[type].warned = true;
        console.error('(node) warning: possible EventEmitter memory ' +
                      'leak detected. %d listeners added. ' +
                      'Use emitter.setMaxListeners() to increase limit.',
                      this._events[type].length);
        console.trace();
      }
    }

    // If we've already got an array, just append.
    this._events[type].push(listener);
  } else {
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  var self = this;
  function g() {
    self.removeListener(type, g);
    listener.apply(this, arguments);
  };

  g.listener = listener;
  self.on(type, g);

  return this;
};

EventEmitter.prototype.removeListener = function(type, listener) {
  if ('function' !== typeof listener) {
    throw new Error('removeListener only takes instances of Function');
  }

  // does not use listeners(), so no side effect of creating _events[type]
  if (!this._events || !this._events[type]) return this;

  var list = this._events[type];

  if (isArray(list)) {
    var position = -1;
    for (var i = 0, length = list.length; i < length; i++) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener))
      {
        position = i;
        break;
      }
    }

    if (position < 0) return this;
    list.splice(position, 1);
    if (list.length == 0)
      delete this._events[type];
  } else if (list === listener ||
             (list.listener && list.listener === listener))
  {
    delete this._events[type];
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  // does not use listeners(), so no side effect of creating _events[type]
  if (type && this._events && this._events[type]) this._events[type] = null;
  return this;
};

EventEmitter.prototype.listeners = function(type) {
  if (!this._events) this._events = {};
  if (!this._events[type]) this._events[type] = [];
  if (!isArray(this._events[type])) {
    this._events[type] = [this._events[type]];
  }
  return this._events[type];
};

  provide('events', module.exports);
}());
// promise, future, deliver, fulfill
var provide = provide || function () {};
(function () {
  "use strict";

  var MAX_INT = Math.pow(2,52);

  function isFuture(obj) {
    return obj instanceof future;
  }

  function futureTimeout(time) {
    this.name = "FutureTimeout";
    this.message = "timeout " + time + "ms";
  }



  function future(global_context) {
    var everytimers = {},
      onetimers = {},
      index = 0,
      deliveries = 0,
      time = 0,
      fulfilled,
      data,
      timeout_id,
      //asap = false,
      asap =  true,
      passenger,
      self = this;

    // TODO change `null` to `this`
    global_context = ('undefined' === typeof global_context ? null : global_context);


    function resetTimeout() {
      if (timeout_id) {
        clearTimeout(timeout_id);
        timeout_id = undefined;
      }

      if (time > 0) {
        timeout_id = setTimeout(function () {
          self.deliver(new futureTimeout(time));
          timeout_id = undefined;
        }, time);
      }
    }



    self.isFuture = isFuture;

    self.setContext = function (context) {
      global_context = context;
    };

    self.setTimeout = function (new_time) {
      time = new_time;
      resetTimeout();
    };



    self.errback = function () {
      if (arguments.length < 2) {
        self.deliver.call(self, arguments[0] || new Error("`errback` called without Error"));
      } else {
        self.deliver.apply(self, arguments);
      }
    };



    self.callback = function () {
      var args = Array.prototype.slice.call(arguments);

      args.unshift(undefined);
      self.deliver.apply(self, args);
    };



    self.callbackCount = function() {
      return Object.keys(everytimers).length;
    };



    self.deliveryCount = function() {
      return deliveries;
    };



    self.setAsap = function(new_asap) {
      if (undefined === new_asap) {
        new_asap = true;
      }
      if (true !== new_asap && false !== new_asap) {
        throw new Error("Future.setAsap(asap) accepts literal true or false, not " + new_asap);
      }
      asap = new_asap;
    };



    // this will probably never get called and, hence, is not yet well tested
    function cleanup() {
      var new_everytimers = {},
        new_onetimers = {};

      index = 0;
      Object.keys(everytimers).forEach(function (id) {
        var newtimer = new_everytimers[index] = everytimers[id];

        if (onetimers[id]) {
          new_onetimers[index] = true;
        }

        newtimer.id = index;
        index += 1;
      });

      onetimers = new_onetimers;
      everytimers = new_everytimers;
    }



    function findCallback(callback, context) {
      var result;
      Object.keys(everytimers).forEach(function (id) {
        var everytimer = everytimers[id];
        if (callback === everytimer.callback) {
          if (context === everytimer.context || everytimer.context === global_context) {
            result = everytimer;
          }
        }
      });
      return result;
    }



    self.hasCallback = function () {
      return !!findCallback.apply(self, arguments);
    };



    self.removeCallback = function(callback, context) {
      var everytimer = findCallback(callback, context);
      if (everytimer) {
        delete everytimers[everytimer.id];
        onetimers[everytimer.id] = undefined;
        delete onetimers[everytimer.id];
      }

      return self;
    };



    self.deliver = function() {
      if (fulfilled) {
        throw new Error("`Future().fulfill(err, data, ...)` renders future deliveries useless");
      }
      var args = Array.prototype.slice.call(arguments);
      data = args;

      deliveries += 1; // Eventually reaches `Infinity`...

      Object.keys(everytimers).forEach(function (id) {
        var everytimer = everytimers[id],
          callback = everytimer.callback,
          context = everytimer.context;

        if (onetimers[id]) {
          delete everytimers[id];
          delete onetimers[id];
        }

        // TODO
        callback.apply(context, args);
        /*
        callback.apply(('undefined' !== context ? context : newme), args);
        context = newme;
        context = ('undefined' !== global_context ? global_context : context)
        context = ('undefined' !== local_context ? local_context : context)
        */
      });

      if (args[0] && "FutureTimeout" !== args[0].name) {
        resetTimeout();
      }

      return self;
    };



    self.fulfill = function () {
      if (arguments.length) {
        self.deliver.apply(self, arguments);
      } else {
        self.deliver();
      }
      fulfilled = true;
    };



    self.whenever = function (callback, local_context) {
      var id = index,
        everytimer;

      if ('function' !== typeof callback) {
        throw new Error("Future().whenever(callback, [context]): callback must be a function.");
      }

      if (findCallback(callback, local_context)) {
        // TODO log
        throw new Error("Future().everytimers is a strict set. Cannot add already subscribed `callback, [context]`.");
        return;
      }

      everytimer = everytimers[id] = {
        id: id,
        callback: callback,
        context: (null === local_context) ? null : (local_context || global_context)
      };

      if (asap && deliveries > 0) {
        // doesn't raise deliver count on purpose
        everytimer.callback.apply(everytimer.context, data);
        if (onetimers[id]) {
          delete onetimers[id];
          delete everytimers[id];
        }
      }

      index += 1;
      if (index >= MAX_INT) {
        cleanup(); // Works even for long-running processes
      }

      return self;
    };



    self.when = function (callback, local_context) {
      // this index will be the id of the everytimer
      onetimers[index] = true;
      self.whenever(callback, local_context);

      return self;
    };


    //
    function privatize(obj, pubs) {
      var result = {};
      pubs.forEach(function (pub) {
        result[pub] = function () {
          obj[pub].apply(obj, arguments);
          return result;
        };
      });
      return result;
    }

    passenger = privatize(self, [
      "when",
      "whenever"
    ]);

    self.passable = function () {
      return passenger;
    };

  }

  function Future(context) {
    // TODO use prototype instead of new
    return (new future(context));
  }
  Future.isFuture = isFuture;
  module.exports = Future;

  provide('futures/future');
}());
var provide = provide || function () {},
  __dirname = __dirname || '';
(function () {
  "use strict";

  var Future = require((__dirname ? __dirname + '/' : 'futures') + '/future');

  function isJoin(obj) {
    return obj instanceof join;
  }

  function join(global_context) {
    var self = this,
      data = [],
      ready = [],
      subs = [],
      promise_only = false,
      begun = false,
      updated = 0,
      join_future = Future(global_context);

    global_context = global_context || null;

    function relay() {
      var i;
      if (!begun || updated !== data.length) {
        return;
      }
      updated = 0;
      join_future.deliver.apply(join_future, data);
      data = Array(data.length);
      ready = Array(ready.length);
      //for (i = 0; i < data.length; i += 1) {
      //  data[i] = undefined;
      //}
    }

    function init() {
      var type = (promise_only ? "when" : "whenever");

      begun = true;
      data = Array(subs.length);
      ready = Array(subs.length);

      subs.forEach(function (sub, id) {
        sub.whenever(function () {
          var args = Array.prototype.slice.call(arguments);
          data[id] = args;
          if (!ready[id]) {
            ready[id] = true;
            updated += 1;
          }
          relay();
        });
      });
    }

    self.deliverer = function () {
      var future = Future();
      self.add(future);
      return future.deliver;
    };

    self.when = function () {
      if (!begun) {
        init();
      }
      join_future.when.apply(join_future, arguments);
    };

    self.whenever = function () {
      if (!begun) {
        init();
      }
      join_future.whenever.apply(join_future, arguments);
    };

    self.add = function () {
      if (begun) {
        throw new Error("`Join().add(Array<future> | subs1, [subs2, ...])` requires that all additions be completed before the first `when()` or `whenever()`");
      }
      var args = Array.prototype.slice.call(arguments);
      args = Array.isArray(args[0]) ? args[0] : args;
      args.forEach(function (sub) {
        if (!sub.whenever) {
          promise_only = true;
        }
        if (!sub.when) {
          throw new Error("`Join().add(future)` requires either a promise or future");
        }
        subs.push(sub);
      });
    };
  }

  function Join(context) {
    // TODO use prototype instead of new
    return (new join(context));
  }
  Join.isJoin = isJoin;
  module.exports = Join;

  provide('futures/join');
}());var provide = provide || function () {};
(function () {
  "use strict";

  function isSequence(obj) {
    return obj instanceof sequence;
  }

  function sequence(global_context) {
    var self = this,
      waiting = true,
      data,
      stack = [];

    global_context = global_context || null;

    function next() {
      var args = Array.prototype.slice.call(arguments),
        seq = stack.shift(); // BUG this will eventually leak

      data = arguments;

      if (!seq) {
        // the chain has ended (for now)
        waiting = true;
        return;
      }

      args.unshift(next);
      seq.callback.apply(seq.context, args);
    }

    self.then = function (callback, context) {
      if ('function' !== typeof callback) {
        throw new Error("`Sequence().then(callback [context])` requires that `callback` be a function and that `context` be `null`, an object, or a function");
      }
      stack.push({
        callback: callback,
        context: (null === context ? null : context || global_context),
        index: stack.length
      });

      // if the chain has stopped, start it back up
      if (waiting) {
        waiting = false;
        next.apply(null, data);
      }

      return self;
    };
  }

  function Sequence(context) {
    // TODO use prototype instead of new
    return (new sequence(context));
  }
  Sequence.isSequence = isSequence;
  module.exports = Sequence;

  provide('futures/sequence');
}());
var __dirname = __dirname || '',
    provide = provide || function () {};
(function () {
  "use strict";

  var Sequence = require((__dirname ? __dirname + '/' : 'futures') + '/sequence');

  function forEachAsync(arr, callback) {
    var sequence = Sequence();

    function handleItem(item, i, arr) {
      sequence.then(function (next) {
        callback(next, item, i, arr);
      });
    }

    arr.forEach(handleItem);

    return sequence;
  }

  module.exports = forEachAsync;

  provide('futures/forEachAsync-standalone', module.exports);
}());
(function () {
  "use strict";

  require('require-kiss');

  var Future = require((__dirname ? __dirname + '/' : 'futures') + '/future');

  function asyncify(doStuffSync, context) {
    var future = Future(),
      passenger = future.passable();

    future.setAsap(false);

    function doStuff() {
      var self = ('undefined' !== typeof context ? context : this),
        err,
        data;

      future.setContext(self);

      try {
        data = doStuffSync.apply(self, arguments);
      } catch(e) {
        err = e;
      }

      future.deliver(err, data);

      return passenger;
    }

    doStuff.when = passenger.when;
    doStuff.whenever = passenger.whenever;

    return doStuff;
  }

  module.exports = asyncify;
  provide('futures/asyncify', module.exports);
}());
var provide = provide || function () {},
  __dirname = __dirname || '';
(function () {
  "use strict";

  var Future = require((__dirname ? __dirname + '/' : 'futures') + '/future'),
    Sequence = require((__dirname ? __dirname + '/' : 'futures') + '/sequence');


  // This is being saved in case I later decide to require future-functions
  // rather than always passing `next`
  function handleResult(next, result) {
    // Do wait up; assume that any return value has a callback
    if ('undefined' !== typeof result) {
      if ('function' === typeof result.when) {
        result.when(next);
      } else if ('function' === typeof result) {
        result(next);
      } else {
        next(result);
      }
    }
  }

  /**
   * Async Method Queing
   */
  function Chainify(providers, modifiers, consumers, context, params) {
    var Model = {};

    if ('undefined' === typeof context) {
      context = null;
    }

    /**
     * Create a method from a consumer
     * These may be promisable (validate e-mail addresses by sending an e-mail)
     * or return synchronously (selecting a random number of friends from contacts)
     */
    function methodify(provider, sequence) {
      var methods = {};

      function chainify_one(callback, is_consumer) {
        return function () {
          var params = Array.prototype.slice.call(arguments);

          sequence.then(function() {
            var args = Array.prototype.slice.call(arguments)
              , args_params = []
              , next = args.shift();

            args.forEach(function (arg) {
              args_params.push(arg);
            });
            params.forEach(function (param) {
              args_params.push(param);
            });
            params = undefined;

            if (is_consumer) {
              // Don't wait up, just keep on truckin'
              callback.apply(context, args_params);
              next.apply(null, args);
            } else {
              // Do wait up
              args_params.unshift(next);
              callback.apply(context, args_params);
            }

            // or
            // handleResult(next, result)
          });
          return methods;
        };
      }

      Object.keys(modifiers).forEach(function (key) {
        methods[key] = chainify_one(modifiers[key]);
      });

      Object.keys(consumers).forEach(function (key) {
        methods[key] = chainify_one(consumers[key], true);
      });

      return methods;
    }

    /**
     * A model might be something such as Contacts
     * The providers might be methods such as:
     * all(), one(id), some(ids), search(key, params), search(func), scrape(template)
     */
    function chainify(provider, key) {
      return function () {
        var args = Array.prototype.slice.call(arguments),
          future = Future(),
          sequence = Sequence();

        // provide a `next`
        args.unshift(future.deliver);
        provider.apply(context, args);

        sequence.then(future.when);

        return methodify(providers[key], sequence);
      };
    }

    Object.keys(providers).forEach(function (key) {
      Model[key] = chainify(providers[key], key);
    });

    return Model;
  }

  module.exports = Chainify;

  provide('futures/chainify');
}());
var provide = provide || function () {},
  __dirname = __dirname || '';
(function () {
  "use strict";

  var Future = require((__dirname ? __dirname + '/' : 'futures') + '/future');



  function BreakAsyncLoop() {
      this.name = "BreakAsyncLoop";
      this.message = "Normal";
  }



  function MaxCountReached(max_loops) {
      this.name = "MaxCountReached";
      this.message = "Loop looped " + max_loops + " times";
  }



  function timestamp() {
    return (new Date()).valueOf();
  }





  function loop(context) {
    var self = this,
      future = Future(),
      min_wait = 0,
      count = 0,
      max_loops = 0,
      latest,
      time,
      timed_out,
      timeout_id,
      data,
      callback;

    self.setMaxLoop = function (new_max) {
      max_loops = new_max;
      return self;
    };



    self.setWait = function (new_wait) {
      min_wait = new_wait;
      return self;
    };



    self.setTimeout = function (new_time) {
      if (time) {
        throw new Error("Can't set timeout, the loop has already begun!");
      }
      time = new_time;
      var timeout_id = setTimeout(function () {
        timed_out = true;
        future.deliver(new Error("LoopTimeout"));
      }, time);

      future.when(function () {
        clearTimeout(timeout_id);
      });
      return self;
    };



    function runAgain() {
      var wait = Math.max(min_wait - (timestamp() - latest), 0);
      if (isNaN(wait)) {
        wait = min_wait;
      }

      if (timed_out) {
        return;
      }
      if (max_loops && count >= max_loops) {
        future.deliver(new MaxCountReached(max_loops));
        return;
      }

      data.unshift(next);
      setTimeout(function () {
        latest = timestamp();
        try {
          callback.apply(context, data);
          count += 1;
        } catch(e) {
          if (e instanceof BreakAsyncLoop) {
            future.deliver.apply(future, data);
            return;
          }
          throw e;
        }
      }, wait);
    }



    function next() {
      data = Array.prototype.slice.call(arguments);
      if ("break" === data[0]) {
        data.shift();
        throw new BreakAsyncLoop();
      }
      runAgain();
    }



    self.run = function (doStuff) {
      data = Array.prototype.slice.call(arguments);
      callback = doStuff;
      data[0] = undefined;
      next.apply(self, data);
      return self;
    };



    self.when = future.when;
    self.whenever = future.whenever;

  }




  function Loop(context) {
    // TODO use prototype instead of new
    return (new loop(context));
  }
  module.exports = Loop;

  provide('futures/loop');
}());
/*jslint browser: true, devel: true, debug: true, es5: true, onevar: true, undef: true, nomen: true, eqeqeq: true, plusplus: true, bitwise: true, regexp: true, newcap: true, immed: true, strict: true */
var provide = provide || function () {},
   __dirname = __dirname || '';

(function () {
  "use strict";

  var modulepath;

  if (!__dirname) {
    modulepath = 'futures';
  } else {
    modulepath = __dirname;
  }

  function upgradeMessage() {
    var msg = "You have upgraded to Futures 2.x. See http://github.com/coolaj86/futures for details.";
    console.log(msg);
    throw new Error(msg);
  }

  module.exports = {
    promise: upgradeMessage,
    subscription: upgradeMessage,
    synchronize: upgradeMessage,
    whilst: upgradeMessage,
    future: require(modulepath + '/future'),
    forEachAsync: require(modulepath + '/forEachAsync-standalone'),
    sequence: require(modulepath + '/sequence'),
    join: require(modulepath + '/join'),
    asyncify: require(modulepath + '/asyncify'),
    loop: require(modulepath + '/loop'),
    chainify: require(modulepath + '/chainify')
  };

  provide('futures');
}());
(function () {
  "use strict";

  function uriEncodeObject(json) {
    var query = '';

    try {
      JSON.parse(JSON.stringify(json));
    } catch(e) {
      return 'ERR_CYCLIC_DATA_STRUCTURE';
    }

    if ('object' !== typeof json) {
      return 'ERR_NOT_AN_OBJECT';
    }

    Object.keys(json).forEach(function (key) {
      var param, value;

      // assume that the user meant to delete this element
      if ('undefined' === typeof json[key]) {
        return;
      }

      param = encodeURIComponent(key);
      value = encodeURIComponent(json[key]);
      query += '&' + param;

      // assume that the user wants just the param name sent
      if (null !== json[key]) {
        query += '=' + value;
      }
    });

    // remove first '&'
    return query.substring(1);
  }

  function addParamsToUri(uri, params) {
    var query
      , anchor = ''
      , anchorpos;

    uri = uri || "";
    anchor = '';
    params = params || {};

    // just in case this gets used client-side
    if (-1 !== (anchorpos = uri.indexOf('#'))) {
      anchor = uri.substr(anchorpos);
      uri = uri.substr(0, anchorpos);
    }

    query = uriEncodeObject(params);

    // cut the leading '&' if no other params have been written
    if (query.length > 0) {
      if (!uri.match(/\?/)) {
        uri += '?' + query;
      } else {
        uri += '&' + query;
      }
    }

    return uri + anchor;
  }

  module.exports.uriEncodeObject = uriEncodeObject;
  module.exports.addParamsToUri = addParamsToUri;

  provide('uri-encoder', module.exports);
}());
/*jslint white: false, onevar: true, undef: true, node: true, nomen: true, regexp: false, plusplus: true, bitwise: true, es5: true, newcap: true, maxerr: 5 */
(function () {
  "use strict";

  var utils = exports
    , jsonpRegEx = /\s*([\$\w]+)\s*\(\s*(.*)\s*\)\s*/;

  utils.clone = function (obj) {
    return JSON.parse(JSON.stringify(obj));
  };

  // useful for extending global options onto a local variable
  utils.extend = function (global, local) {
    //global = utils.clone(global);
    Object.keys(local).forEach(function (key) {
      global[key] = local[key] || global[key];
    });
    return global;
  };

  // useful for extending global options onto a local variable
  utils.preset = function (local, global) {
    // TODO copy functions
    // TODO recurse / deep copy
    global = utils.clone(global);
    Object.keys(global).forEach(function (key) {
      if ('undefined' === typeof local[key]) {
        local[key] = global[key];
      }
    });
    return local;
  };

  utils.objectToLowerCase = function (obj, recurse) {
    // Make headers all lower-case
    Object.keys(obj).forEach(function (key) {
      var value;

      value = obj[key];
      delete obj[key];
      if ('string' === typeof value) {
        obj[key.toLowerCase()] = value.toLowerCase();
      }
    });
    return obj;
  };

  utils.parseJsonp = function (jsonpCallback, jsonp) {
    var match = jsonp.match(jsonpRegEx)
      , data
      , json;

    if (!match || !match[1] || !match[2]) {
      throw new Error('No JSONP matched');
    }
    if (jsonpCallback !== match[1]) {
      throw new Error('JSONP callback doesn\'t match');
    }
    json = match[2];

    data = JSON.parse(json);
    return data;
  };

  // exports done via util
  provide('utils', utils);
}());
(function () {
  "use strict";

  // http://www.html5rocks.com/tutorials/#file
  // http://www.html5rocks.com/tutorials/#filereader
  // http://www.html5rocks.com/tutorials/#filewriter
  // http://www.html5rocks.com/tutorials/#filesystem

  var FileApi = {
    // FormData
    // http://www.w3.org/TR/XMLHttpRequest2/
    "FormData": window.FormData,
    // File API
    // http://www.w3.org/TR/FileAPI/
    // http://www.w3.org/TR/file-upload/
    "FileList": window.FileList,
    "Blob": window.Blob,
    "File": window.File,
    "FileReader": window.FileReader,
    "FileError": window.FileError,
    // File API: Writer
    // http://www.w3.org/TR/file-writer-api/
    "BlobBuilder": window.BlobBuilder,
    "FileSaver": window.FileSaver,
    "FileSaverSync": window.FileSaverSync,
    "FileWriter": window.FileWriter,
    "FileWriterSync": window.FileWriterSync,
    // File API: Directories and System
    // http://www.w3.org/TR/file-system-api/
    // implemented by Window and WorkerGlobalScope
    "LocalFileSystem": window.LocalFileSystem,
      // requestFileSystem(type, size, successCallback, opt_errorCallback)
      "requestFileSystem": window.requestFileSystem || window.webkitRequestFileSystem,
      // resolveLocalFileSystemURL
    "LocalFileSystemSync": window.LocalFileSystemSync,
      // Asychronous FileSystem API
    "Metadata": window.Metadata,
    "Flags": window.Flags,
    "FileSystem": window.FileSystem,
    "Entry": window.Entry,
    "DirectoryEntry": window.DirectoryEntry,
    "DirectoryReader": window.DirectoryReader,
    "FileEntry": window.FileEntry,
      // Synchronous FileSystem API
    "FileSystemSync": window.FileSystemSync,
    "EntrySync": window.EntrySync,
    "DirectoryEntrySync": window.DirectoryEntrySync,
    "DirectoryReaderSync": window.DirectoryReaderSync,
    "FileEntrySync": window.FileEntrySync,
    //"FileError": window.FileError,
  };

  module.exports = FileApi;
  provide('file-api', module.exports);
}());
/*
   loadstart;
   progress;
   abort;
   error;
   load;
   timeout;
   loadend;
*/
(function () {
  "use strict";

  function browserJsonpClient(req, res) {
    // TODO check for Same-domain / XHR2/CORS support
    // before attempting to insert script tag
    // Those support headers and such, which are good
    var options = req.userOptions
      , cbkey = options.jsonpCallback
      , script = document.createElement("script")
      , head = document.getElementsByTagName("head")[0] || document.documentElement
      , addParamsToUri = require('uri-encoder').addParamsToUri
      , timeout
      , fulfilled; // TODO move this logic elsewhere into the emitter

    // cleanup: cleanup window and dom
    function cleanup() {
      fulfilled = true;
      window[cbkey] = undefined;
      try {
        delete window[cbkey];
        // may have already been removed
        head.removeChild(script);
      } catch(e) {}
    }

    function abortRequest() {
      req.emit('abort');
      cleanup();
    }

    function abortResponse() {
      res.emit('abort');
      cleanup();
    }

    function prepareResponse() {
      // Sanatize data, Send, Cleanup
      function onSuccess(data) {
        var ev = {
          lengthComputable: false,
          loaded: 1,
          total: 1
        };
        if (fulfilled) {
          return;
        }

        clearTimeout(timeout);
        res.emit('loadstart', ev);
        // sanitize
        data = JSON.parse(JSON.stringify(data));
        res.emit('progress', ev);
        ev.target = { result: data };
        res.emit('load', ev);
        cleanup();
      }

      function onTimeout() {
        res.emit('timeout', {});
        res.emit('error', new Error('timeout'));
        cleanup();
      }

      window[cbkey] = onSuccess;
      // onError: Set timeout if script tag fails to load
      if (options.timeout) {
        timeout = setTimeout(onTimeout, options.timeout);
      }
    }

    function makeRequest() {
      var ev = {}
        , jsonp = {};

      function onError(ev) {
        res.emit('error', ev);
      }

      // ?search=kittens&jsonp=jsonp123456
      jsonp[options.jsonp] = options.jsonpCallback;
      options.href = addParamsToUri(options.href, jsonp);

      // Insert JSONP script into the DOM
      // set script source to the service that responds with thepadded JSON data
      req.emit('loadstart', ev);
      try {
        script.setAttribute("type", "text/javascript");
        script.setAttribute("async", "async");
        script.setAttribute("src", options.href);
        // Note that this only works in some browsers,
        // but it's better than nothing
        script.onerror = onError;
        head.insertBefore(script, head.firstChild);
      } catch(e) {
        req.emit('error', e);
      }

      // failsafe cleanup
      setTimeout(cleanup, 2 * 60 * 1000);
      // a moot point since the "load" occurs so quickly
      req.emit('progress', ev);
      req.emit('load', ev);
    }

    setTimeout(makeRequest, 0);
    req.abort = abortRequest;
    res.abort = abortResponse;
    prepareResponse();

    return res;
  }

  module.exports = browserJsonpClient;

  provide('browser-jsonp', module.exports);
}());
/*jslint devel: true, debug: true, es5: true, onevar: true, undef: true, nomen: true, eqeqeq: true, plusplus: true, bitwise: true, regexp: true, newcap: true, immed: true, strict: true */
// This module is meant for modern browsers. Not much abstraction or 1337 majic
var window;
(function (undefined) {
  "use strict";

  var url = require('url')
    , browserJsonpClient = require('./browser-jsonp')
    , nativeHttpClient
    , globalOptions
    , restricted
    , debug = false
    ; // TODO underExtend localOptions

  // Restricted Headers
  // http://www.w3.org/TR/XMLHttpRequest/#the-setrequestheader-method
  restricted = [
      "Accept-Charset"
    , "Accept-Encoding"
    , "Connection"
    , "Content-Length"
    , "Cookie"
    , "Cookie2"
    , "Content-Transfer-Encoding"
    , "Date"
    , "Expect"
    , "Host"
    , "Keep-Alive"
    , "Referer"
    , "TE"
    , "Trailer"
    , "Transfer-Encoding"
    , "Upgrade"
    , "User-Agent"
    , "Via"
  ];
  restricted.forEach(function (val, i, arr) {
    arr[i] = val.toLowerCase();
  });

  if (!window.XMLHttpRequest) {
    window.XMLHttpRequest = function() {
      return new ActiveXObject('Microsoft.XMLHTTP');
    };
  }
  if (window.XDomainRequest) {
    // TODO fix IE's XHR/XDR to act as normal XHR2
    // check if the location.host is the same (name, port, not protocol) as origin
  }


  function encodeData(options, xhr2) {
    var data
      , ct = options.overrideResponseType || xhr2.getResponseHeader("content-type") || ""
      , text = xhr2.responseText
      , len = text.length
      ;

    ct = ct.toLowerCase();

    if ('binary' === ct) {
      // TODO only Chrome 13 currently handles ArrayBuffers well
      // imageData could work too
      // http://synth.bitsnbites.eu/
      // http://synth.bitsnbites.eu/play.html
      // var ui8a = new Uint8Array(data, 0);
      var i
        , ui8a = Array(len)
        ;

      for (i = 0; i < text.length; i += 1) {
        ui8a[i] = (text.charCodeAt(i) & 0xff);
      }

      return ui8a;
    }

    if (ct.indexOf("xml") >= 0) {
      return xhr2.responseXML;
    }

    if (ct.indexOf("jsonp") >= 0 || ct.indexOf("javascript") >= 0) {
      console.log("forcing of jsonp not yet supported");
      return text;
    }

    if (ct.indexOf("json") >= 0) {
      try {
        data = JSON.parse(txt);
      } catch(e) {
        data = undefined;
      }
      return text;
    }

    return xhr2.responseText;
  }

  function browserHttpClient(req, res) {
    var options = req.userOptions
      , xhr2
      , xhr2Request
      , timeoutToken
      ;

    function onTimeout() {
        ahr.log('timeout-log browserHttpClient-2');
        req.emit("timeout", {});
    }

    function resetTimeout() {
      clearTimeout(timeoutToken);
      timeoutToken = setTimeout(onTimeout, options.timeout);
    }

    function sanatizeHeaders(header) {
      var value = options.headers[header];

      if (-1 !== restricted.indexOf(header.toLowerCase())) {
        console.log('Cannot set header ' + header + ' because it is restricted (http://www.w3.org/TR/XMLHttpRequest/#the-setrequestheader-method)');
        return;
      }

      try {
        // throws INVALID_STATE_ERROR if called before `open()`
        xhr2.setRequestHeader(header, value);
      } catch(e) {
        console.log('error setting header: ' + header);
        console.log(e);
      }
    }

    // A little confusing that the request object gives you
    // the response handlers and that the upload gives you
    // the request handlers, but oh well
    xhr2 = new XMLHttpRequest();
    xhr2Request = xhr2.upload;

    /* Proper States */
    xhr2.addEventListener('loadstart', function (ev) {
        // this fires when the request starts,
        // but shouldn't fire until the request has loaded
        // and the response starts
        req.emit('loadstart', ev);
        resetTimeout();
    });
    xhr2.addEventListener('progress', function (ev) {
        if (!req.loaded) {
          req.loaded = true;
          req.emit('progress', {});
          req.emit('load', {});
        }
        if (!res.loadstart) {
          res.headers = xhr2.getAllResponseHeaders();
          res.loadstart = true;
          res.emit('loadstart', ev);
        }
        res.emit('progress', ev);
        resetTimeout();
    });
    xhr2.addEventListener('load', function (ev) {
      if (xhr2.status >= 400) {
        ev.error = new Error(xhr2.status);
      }
      ev.target.result = encodeData(options, xhr2);
      res.emit('load', ev);
    });
    /*
    xhr2Request.addEventListener('loadstart', function (ev) {
      req.emit('loadstart', ev);
      resetTimeout();
    });
    */
    xhr2Request.addEventListener('load', function (ev) {
      resetTimeout();
      req.emit('load', ev);
      res.loadstart = true;
      res.emit('loadstart', {});
    });
    xhr2Request.addEventListener('progress', function (ev) {
      resetTimeout();
      req.emit('progress', ev);
    });


    /* Error States */
    xhr2.addEventListener('abort', function (ev) {
      res.emit('abort', ev);
    });
    xhr2Request.addEventListener('abort', function (ev) {
      req.emit('abort', ev);
    });
    xhr2.addEventListener('error', function (ev) {
      res.emit('error', ev);
    });
    xhr2Request.addEventListener('error', function (ev) {
      req.emit('error', ev);
    });
    // the "Request" is what timeouts
    // the "Response" will timeout as well
    xhr2.addEventListener('timeout', function (ev) {
      req.emit('timeout', ev);
    });
    xhr2Request.addEventListener('timeout', function (ev) {
      req.emit('timeout', ev);
    });

    /* Cleanup */
    res.on('loadend', function () {
      // loadend is managed by AHR
      clearTimeout(timeoutToken);
    });

    if (options.username) {
      xhr2.open(options.method, options.href, true, options.username, options.password);
    } else {
      xhr2.open(options.method, options.href, true);
    }

    Object.keys(options.headers).forEach(sanatizeHeaders);

    setTimeout(function () {
      if ('binary' === options.overrideResponseType) {
        xhr2.overrideMimeType("text/plain; charset=x-user-defined");
      }
      try {
        xhr2.send(options.encodedBody);
      } catch(e) {
        req.emit('error', e);
      }
    }, 1);
    

    req.abort = function () {
      xhr2.abort();
    };
    res.abort = function () {
      xhr2.abort();
    };

    res.browserRequest = xhr2;
    return res;
  }

  function send(req, res) {
    var options = req.userOptions;
    console.log('options', options);
    if (options.jsonp && options.jsonpCallback) {
      return browserJsonpClient(req, res);
    }
    return browserHttpClient(req, res);
  }

  module.exports = send;

  provide('browser-request', module.exports);
}());
/*jslint devel: true, debug: true, es5: true, onevar: true, undef: true, nomen: true, eqeqeq: true, plusplus: true, bitwise: true, regexp: true, newcap: true, immed: true, strict: true */
(function () {
  "use strict";

  var globalOptions
    , exports = module.exports
    , location = require('./location')
    , FileApi = require('file-api')
    , File = FileApi.File
    , FileList = FileApi.FileList
    , FormData = FileApi.FormData
    , url = require('url')
    , uriEncoder = require('./uri-encoder')
    , uriEncodeObject = uriEncoder.uriEncodeObject
    , utils = require('./utils')
    , clone = utils.clone
    , preset = utils.preset
    , objectToLowerCase = utils.objectToLowerCase;

  globalOptions = {
    port: 80,
    host: 'localhost',
    ssl: false,
    protocol: 'file:',
    method: 'GET',
    headers: {
      //'accept': "application/json; charset=utf-8, */*; q=0.5"
    },
    pathname: '/',
    search: '',
    redirectCount: 0,
    redirectCountMax: 5,
    query: {},
    // contentType: 'json',
    // accept: 'json',
    followRedirect: true,
    timeout: 20000
  };


  //
  // Manage global options while keeping state safe
  //
  exports.globalOptionKeys = function () {
    return Object.keys(globalOptions);
  };

  exports.globalOption = function (key, val) {
    if ('undefined' === typeof val) {
      return globalOptions[key];
    }
    if (null === val) {
      val = undefined;
    }
    globalOptions[key] = val;
  };

  exports.setGlobalOptions = function (bag) {
    Object.keys(bag).forEach(function (key) {
      globalOptions[key] = bag[key];
    });
  };


  /*
   * About the HTTP spec and which methods allow bodies, etc:
   * http://stackoverflow.com/questions/299628/is-an-entity-body-allowed-for-an-http-delete-request
   */
  function checkBodyAllowed(options) {
    var method = options.method.toUpperCase();
    if ('HEAD' !== method && 'GET' !== method && 'DELETE' !== method && 'OPTIONS' !== method) {
      return true;
    }
    if (options.body && !options.forceAllowBody) {
      throw new Error("The de facto standard is that '" + method + "' should not have a body.\n" +
        "Most web servers just ignore it. Please use 'query' rather than 'body'.\n" +
        "Also, you may consider filing this as a bug - please give an explanation.\n" +
        "Finally, you may allow this by passing { forceAllowBody: 'true' } ");
    }
  }


  /*
    Node.js

    > var url = require('url');
    > var urlstring = 'http://user:pass@host.com:8080/p/a/t/h?query=string#hash';
    > url.parse(urlstring, true);
    { href: 'http://user:pass@host.com:8080/p/a/t/h?query=string#hash',
      protocol: 'http:',
      host: 'user:pass@host.com:8080',
      auth: 'user:pass',
      hostname: 'host.com',
      port: '8080',
      pathname: '/p/a/t/h',
      search: '?query=string',
      hash: '#hash',

      slashes: true,
      query: {'query':'string'} } // 'query=string'
  */

  /*
    Browser

      href: "http://user:pass@host.com:8080/p/a/t/h?query=string#hash"
      protocol: "http:" 
      host: "host.com:8080"
      hostname: "host.com"
      port: "8080"
      pathname: "/p/a/t/h"
      search: '?query=string',
      hash: "#hash"

      origin: "http://host.com:8080"
   */

  function parseAuth(options) {
    var auth = options.auth
      , username
      , password;

    if (auth) {
      username = auth.split(':')[0] || "";
      password = auth.split(':')[1] || "";
    }

    preset(options, {
      username: username,
      password: password
    });

    return options;
  }

  function parseHost(options) {
    var auth
      , host = options.host
      , port
      , hostname
      , username
      , password;

    if (!host) {
      return options;
    }
    if (/@/.test(host)) {
      auth = host.substr(0, '@');
      host = host.substr('@' + 1);
      if (auth) {
        username = auth.split(':')[0] || "";
        password = auth.split(':')[1] || "";
      }
    }
    if (/:/.test(host)) {
      port = host.substr(0, ':');
      hostname = host.substr(':' + 1);
    }

    preset(options, {
      username: username,
      password: password,
      hostname: hostname,
      port: port
    });

    return options;
  }

  // href should be parsed if present
  function parseHref(options) {
    var urlObj;

    if (!options.href) {
      return options;
    }
    if (-1 === options.href.indexOf('://')) {
      options.href = url.resolve(location.href, options.href);
    }
    urlObj = url.parse(options.href || "", true);

    preset(options, urlObj);

    return options;
  }

  function handleUri(options) {
    var presets;

    presets = clone(globalOptions);

    if (!options) {
      throw new Error('ARe yOu kiddiNg me? You have to provide some sort of options');
    }

    if (options.uri || options.url) {
      console.log('Use `options.href`. `options.url` and `options.uri` are obsolete');
    }
    if (options.params) {
      console.log('Use `options.query`. `options.params` is obsolete');
    }

    if ('string' === typeof options) {
      options = {
        href: options
      };
    }

    options.syncback = options.syncback || function () {};

    // Use SSL if desired
    if ('https:' === options.protocol || '443' === options.port || true === options.ssl) {
      presets.ssl = true;
      presets.port = '443';
      presets.protocol = 'https:';
      // hopefully no one would set prt 443 to standard http
      options.protocol = 'https:';
    }

    options.href = options.href || options.uri || options.url;
    options.query = options.query || options.params || {};

    if (options.jsonp) {
      // i.e. /path/to/res?x=y&jsoncallback=jsonp8765
      // i.e. /path/to/res?x=y&json=jsonp_ae75f
      options.jsonpCallback = 'jsonp_' + (new Date()).valueOf();
      options.dataType = 'jsonp';
      options.query[options.jsonp] = options.jsonpCallback;
    }

    // TODO auth or username and password
    parseAuth(options);
    // TODO host or auth, hostname, and port
    parseHost(options);
    // TODO href and query; or host
    parseHref(options);
    options.href = url.format(options);

    preset(options, presets);

    return options;
  }

  function handleHeaders(options) {
    var presets;

    presets = clone(globalOptions);

    options.headers = options.headers || {};
    if (options.jsonp) {
      options.headers.accept = "text/javascript";
    }
    // TODO user-agent should retain case
    options.headers = objectToLowerCase(options.headers || {});
    options.headers = preset(options.headers, presets.headers);
    options.headers.host = options.hostname;
    options.headers = objectToLowerCase(options.headers);

    return options;
  }

  function hasFiles(body, formData) {
    var hasFile = false;
    if ('object' !== typeof body) {
      return false;
    }
    Object.keys(body).forEach(function (key) {
      var item = body[key];
      if (item instanceof File) {
        hasFile = true;
      } else if (item instanceof FileList) {
        hasFile = true;
      }
    });
    return hasFile;
  }
  function addFiles(body, formData) {

    Object.keys(body).forEach(function (key) {
      var item = body[key];

      if (item instanceof File) {
        formData.append(key, item);
      } else if (item instanceof FileList) {
        item.forEach(function (file) {
          formData.append(key, file);
        });
      } else {
        formData.append(key, item);
      }
    });
  }

  // TODO convert object/map body into array body
  // { "a": 1, "b": 2 } --> [ "name": "a", "value": 1, "name": "b", "value": 2 ]
  // this would be more appropriate and in better accordance with the http spec
  // as it allows for a value such as "a" to have multiple values rather than
  // having to do "a1", "a2" etc
  function handleBody(options) {
    function bodyEncoder() {
      checkBodyAllowed(options);

      //
      // Check for HTML5 FileApi files
      //
      if (hasFiles(options.body)) {
        options.encodedBody = new FormData(); 
        addFiles(options.body, options.encodedBody);
      }
      if (options.body instanceof FormData) {
        options.encodedBody = options.body;
      }
      if (options.encodedBody instanceof FormData) {
        options.headers["content-type"] = "multipart/form-data";
        return;
      }

      if ('string' === typeof options.body) {
        options.encodedBody = options.body;
      }

      if (!options.encodedBody) {
        if (options.headers["content-type"].match(/application\/json/) || 
            options.headers["content-type"].match(/text\/javascript/)) {
          options.encodedBody = JSON.stringify(options.body);
        } else if (options.headers["content-type"].match(/application\/x-www-form-urlencoded/)) {
          options.encodedBody = uriEncodeObject(options.body);
        } else if (!options.encodedBody) {
          throw new Error("'" + options.headers["content-type"] + "'" + "is not yet supported and you have not specified 'encodedBody'");
        }
        options.headers["content-length"] = options.encodedBody.length;
      }

      if (!options.headers["content-type"]) {
        options.headers["content-type"] = "application/x-www-form-urlencoded";
      }
    }

    function removeContentBodyAndHeaders() {
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

    if ('file:' === options.protocol) {
      options.header = undefined;
      delete options.header;
      return;
    }

    // Create & Send body
    // TODO support streaming uploads
    options.headers["transfer-encoding"] = undefined;
    delete options.headers["transfer-encoding"];

    if (options.body) {
      bodyEncoder(options);
    } else { // no body || body not allowed
      removeContentBodyAndHeaders(options);
    }
  }

  exports.handleOptions = function (options) {
    handleUri(options);
    handleHeaders(options);
    handleBody(options);

    return options;
  };

  module.exports = exports;

  provide('ahr-options', module.exports);
}());
var window;
/*jslint devel: true, debug: true, es5: true, onevar: true, undef: true, nomen: true, eqeqeq: true, plusplus: true, bitwise: true, regexp: true, newcap: true, immed: true, strict: true */
(function () {
  "use strict";

  var ahrOptions = require('./ahr-options')
    , utils = require('./utils')
    , EventEmitter = require('events').EventEmitter
    , Futures = require('futures')
    , preset = utils.preset
    , ahr;

  //
  // Emulate `request`
  //
  ahr = function (options, callback) {
    return ahr.http(options).when(callback || function () {});
  };
  ahr.join = Futures.join;

  ahr.globalOptionKeys = ahrOptions.globalOptionKeys;
  ahr.globalOption = ahrOptions.globalOption;
  ahr.setGlobalOptions = ahrOptions.setGlobalOptions;

  function allRequests(method, href, query, body, options, callback) {
    if (callback) {
      return allRequests(method, href, query, body, options).when(callback);
    }

    options = options || {};

    options.method = method;
    options.href = href || "";

    options.query = preset((query || {}), (options.query || {}));
    options.body = body;

    return ahr.http(options);
  }

  // HTTP jQuery-like body-less methods
  ['HEAD', 'GET', 'DELETE', 'OPTIONS'].forEach(function (verb) {
    verb = verb.toLowerCase();
    ahr[verb] = function (href, query, options, callback) {
      return allRequests(verb, href, query, undefined, options, callback);
    };
  });

  // Correcting an oversight of jQuery.
  // POST and PUT can have both query (in the URL) and data (in the body)
  ['POST', 'PUT'].forEach(function (verb) {
    verb = verb.toLowerCase();
    ahr[verb] = function (href, query, body, options, callback) {
      return allRequests(verb, href, query, body, options, callback);
    };
  });


  // JSONP
  ahr.jsonp = function (href, jsonp, query, options, callback) {
    if (callback) {
      return ahr.jsonp(href, jsonp, query, options).when(callback);
    }
    options = options || {};

    if (!jsonp || 'string' !== typeof jsonp) {
      throw new Error("'jsonp' is not an optional parameter.\n" +
        "If you believe that this should default to 'callback' rather" +
        "than throwing an error, please file a bug");
    }

    options.href = href || "";
    options.query = preset(query || {}, options.query || {});
    options.jsonp = jsonp;

    // TODO move
    if (options.body) {
      throw new Error("The de facto standard is that 'jsonp' should not have a body.\n" +
        "If you consider filing this as a bug please give an explanation.");
    }

    return ahr.http(options);
  };


  // HTTPS
  ahr.https = function (options, callback) {
    if (callback) {
      return ahr.https(options).when(callback);
    }
    options.ssl = true;
    options.protocol = "https:";
    return ahr.http(options);
  };


  function NewEmitter() {
    var emitter = new EventEmitter()
      , promise = Futures.future()
      , ev = {
            lengthComputable: false
          , loaded: 0
          , total: undefined
        };

    function loadend(ev, errmsg) {
      process.nextTick(function () {
        ev.error = errmsg && new Error(errmsg);
        emitter.emit('loadend', ev);
      });
    }

    // any error in the quest causes the response also to fail
    emitter.on('loadend', function (ev) {
      emitter.done = true;
      ev.target = ev.target || {};
      promise.fulfill(ev.error, emitter, ev.target.result, ev.err ? false : true);
    });
    emitter.on('timeout', function (ev) {
      loadend(ev, 'timeout');
    });
    emitter.on('abort', function (ev) {
      loadend(ev, 'abort');
    });
    emitter.on('error', function (err, evn) {
      // TODO rethrow the error if there are no listeners (incl. promises)
      //if (respEmitter.listeners.loadend) {}
      if (emitter.cancelled) {
        // return;
      }
      emitter.error = err;
      ev.error = err;
      if (evn) {
        ev.lengthComputable = evn.lengthComputable || true;
        ev.loaded = evn.loaded || 0;
        ev.total = evn.total;
      }
      loadend(ev);
    });
    emitter.on('load', function (evn) {
      // ensure that `loadend` is after `load` for all interested parties
      if (emitter.cancelled) {
        return;
      }
      loadend(evn);
    });

    emitter.when = promise.when;

    return emitter;
  }

  function isBrowser() {
    if ('undefined' !== typeof window) {
      return true;
    }
  }
  function isNode() {
    try {
      return global.process && global.process.nextTick && true;
    } catch (e) {
      return false;
    }
  }

  // HTTP and, well, EVERYTHING!
  ahr.http = function (options, callback) {
    var NativeHttpClient
      , req = NewEmitter()
      , res = NewEmitter()
      ;

    if (callback) {
      return ahr.http(options).when(callback);
    }

    ahrOptions.handleOptions(options);

    // todo throw all the important properties in the request
    req.userOptions = options;
    // in the browser tradition
    res.upload = req;

    // if the request fails, then the response must also fail
    req.on('error', function (err, ev) {
      res.emit('error', err, ev);
    });
    req.on('timeout', function (ev) {
      res.emit('timeout', ev);
    });
    req.on('abort', function (ev) {
      res.emit('abort', ev);
    });

    if (isBrowser()) {
      NativeHttpClient = require('./browser-request');
    } else if (isNode()) {
      global.provide = global.provide || function () {};
      NativeHttpClient = require('./node-request');
    } else {
      throw new Error('Not sure whether this is NodeJS or the Browser. Please report this bug and the modules you\'re using');
    }
    return NativeHttpClient(req, res);
  };

  module.exports = ahr;

  provide('ahr2', module.exports);
}());
