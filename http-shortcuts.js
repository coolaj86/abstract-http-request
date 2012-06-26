/*jshint strict:true node:true es5:true onevar:true laxcomma:true laxbreak:true eqeqeq:true immed:true latedef:true*/
(function () {
  "use strict";

  function addShortcuts(Anr) {
    Anr.prototype._abstractHttp = function () {
      console.log('abstractHttp');
      this.http();
      return this;
    };
    Anr.prototype.https = function () {
      console.log('https');
      this._abstractHttp();
      return this;
    };
    Anr.prototype.get = function () {
      console.log('get');
      this._abstractHttp();
      return this;
    };
    Anr.prototype.post = function () {
      console.log('post');
      this._abstractHttp();
      return this;
    };
    Anr.prototype.patch = function () {
      console.log('patch');
      this._abstractHttp();
      return this;
    };
    Anr.prototype.put = function () {
      console.log('put');
      this._abstractHttp();
      return this;
    };
    Anr.prototype.delete = function () {
      console.log('delete');
      this._abstractHttp();
      return this;
    };
  }

  module.exports = function () {
    return addShortcuts;
  };
}());
