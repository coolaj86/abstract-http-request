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
      this._abstractHttp('get', url, query);
      //return this._response;
      return this;
    };
    Anr.prototype.post = function (url, query, body) {
      console.log('post');
      this._abstractHttp('post', url, query, body);
      return this;
    };
    Anr.prototype.patch = function (url, query, body) {
      console.log('patch');
      this._abstractHttp('patch', url, query, body);
      return this;
    };
    Anr.prototype.put = function (url, query, body) {
      console.log('put');
      this._abstractHttp('put', url, query, body);
      return this;
    };
    Anr.prototype['delete'] = function (url, query, body) {
      console.log('delete');
      this._abstractHttp('delete', url, query, body);
      return this;
    };
    Anr.prototype.del = Anr.prototype['delete'];
  }

  module.exports = function () {
    return addShortcuts;
  };
}());
