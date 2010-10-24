(function () {
  var ahr = require('./ahr.js');
  ahr.http({
    url: 'http://google.com',
    method: 'GET'
  }).when(function (err, data, response) {
    console.log('Status: ' + response.statusCode);
    console.log('Headers: ' + JSON.stringify(response.headers));
    console.log('Error: ' + err);
    console.log('Data: ' + data.substring(0,100) + '...');
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
/*
(function () {
  var ahr = require('./ahr.js');
  ahr.http({
    url: 'http://golem.ivwbox.de/2004/01/survey.js',
    type: 'GET'
  }).when(function (err, data, rawClient) {
    console.log('Error: ' + err);
    console.log('Data: ' + data.substring(0,255) + '...');
  });
}());
*/
