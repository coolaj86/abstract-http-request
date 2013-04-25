/*jshint strict:true node:true es5:true onevar:true laxcomma:true laxbreak:true eqeqeq:true immed:true latedef:true*/
(function () {
  "use strict";

  function log() {
    if (false) {
      console.log.apply(console, arguments);
    }
  }

  function addShortcuts(Anr) {
    Anr.prototype._abstractHttp = function (method, urlStr, query, body) {
      log('[SHORT] abstractHttp');
      return this.http(urlStr, { method: method, query: query, body: body });
    };
    Anr.prototype.https = function (options) {
      log('[SHORT] https');
      options.secure = true;
      return this.http(options);
    };
    Anr.prototype.get = function (url, query) {
      log('[SHORT] get');
      return this._abstractHttp('get', url, query);
    };
    Anr.prototype.post = function (url, query, body) {
      log('[SHORT] post');
      return this._abstractHttp('post', url, query, body);
    };
    Anr.prototype.patch = function (url, query, body) {
      log('[SHORT] patch');
      return this._abstractHttp('patch', url, query, body);
    };
    Anr.prototype.put = function (url, query, body) {
      log('[SHORT] put');
      return this._abstractHttp('put', url, query, body);
    };
    // bracket notation for ES3 backwards compat
    Anr.prototype['delete'] = function (url, query, body) {
      log('[SHORT] delete');
      return this._abstractHttp('delete', url, query, body);
    };
    // alternate method for ES3 backwards compat
    Anr.prototype.del = Anr.prototype['delete'];
  }

  module.exports = function () {
    return addShortcuts;
  };
}());
