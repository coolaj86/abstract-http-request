(function () {
  "use strict";

  var addParamsToUri = require('./uri-encoder').addParamsToUri;

  function test() {
    return ('' === addParamsToUri("", {}) &&
      'http://example.com' === addParamsToUri("http://example.com", {}) &&
      // some sites use this notation for boolean values
      // should undefind be counted as a user-mistake? and null do the 'right thing' ?
      'http://example.com' === addParamsToUri("http://example.com", {foo: undefined}) &&
      'http://example.com?foo' === addParamsToUri("http://example.com", {foo: null}) &&
      'http://example.com?foo' === addParamsToUri("http://example.com#anchor", {foo: null}) &&
      'http://example.com?foo=bar' === addParamsToUri("http://example.com", {foo: 'bar'}) &&
      'http://example.com?foo=bar&bar=baz' === addParamsToUri("http://example.com?foo=bar", {bar: 'baz'}) &&
      'http://example.com?fo%26%25o=ba%3Fr' === addParamsToUri("http://example.com", {'fo&%o': 'ba?r'})
    );
  };

  test();
}());
