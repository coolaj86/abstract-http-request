// Implementation of require(), modules, exports, and provide to the browser
(function () {
    if ('undefined' !== typeof window && 'undefined' !== typeof alert) {
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
    } else {
      global.provide = function () {};
    }
}());
