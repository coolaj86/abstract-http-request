(function () {
  var request = require('../lib/ahr'),
    Futures = require('futures');

  function create(uri, func) {
    var future = Futures.future();

    if (func) {
      future.whenever(func);
    }

    function makeRequest() {
      request(uri, function (err, ahr, data) {
        future.deliver(err, data);
        makeRequest();
      });
    }
    makeRequest();
  }

  module.exports = create;
}());
