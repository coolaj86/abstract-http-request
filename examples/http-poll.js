(function () {
  var request = require('../lib/ahr'),
    Futures = require('futures');

  function create(uri, func) {
    var subscription = Futures.subscription();

    if (func) {
      subscription.subscribe(func);
    }

    function makeRequest() {
      request(uri, function (err, ahr, data) {
        subscription.deliver(err, data);
        makeRequest();
      });
    }
    makeRequest();
  }

  module.exports = create;
}());
