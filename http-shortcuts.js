/*jshint strict:true node:true es5:true onevar:true laxcomma:true laxbreak:true eqeqeq:true immed:true latedef:true*/
(function () {
  "use strict";

  function addShortcuts(Anr) {
    Anr.prototype._abstractHttp = function (method, urlStr, query, body) {
      console.log('abstractHttp');
      return this.http(urlStr, { method: method, query: query, body: body });
    };
    Anr.prototype.https = function (options) {
      console.log('https');
      options.secure = true;
      return this.http(options);
    };
    Anr.prototype.get = function (url, query) {
      console.log('get');
      return this._abstractHttp('get', url, query);
    };
    Anr.prototype.post = function (url, query, body) {
      console.log('post');
      return this._abstractHttp('post', url, query, body);
    };
    Anr.prototype.patch = function (url, query, body) {
      console.log('patch');
      return this._abstractHttp('patch', url, query, body);
    };
    Anr.prototype.put = function (url, query, body) {
      console.log('put');
      return this._abstractHttp('put', url, query, body);
    };
    // bracket notation for ES3 backwards compat
    Anr.prototype['delete'] = function (url, query, body) {
      console.log('delete');
      return this._abstractHttp('delete', url, query, body);
    };
    // alternate method for ES3 backwards compat
    Anr.prototype.del = Anr.prototype['delete'];
  }

  module.exports = function () {
    return addShortcuts;
  };
}());
