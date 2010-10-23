(function () {
  var ahr = require('./ahr.js');
  ahr.http({
    url: 'http://google.com',
    type: 'GET'
  }).when(function (err, data, rawClient) {
    console.log('Error: ' + err);
    console.log('Data: ' + data.substring(0,255) + '...');
  });
}());
(function () {
  var ahr = require('./ahr.js');
  ahr.http({
    url: 'http://coolaj86.github.com',
    type: 'GET'
  }).when(function (err, data, rawClient) {
    console.log('Error: ' + err);
    console.log('Data: ' + data.substring(0,255) + '...');
  });
}());
