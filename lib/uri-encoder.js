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
