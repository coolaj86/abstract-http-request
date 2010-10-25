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
