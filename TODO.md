Good test coverage using foobar3000.

  * Test and Simplify URL string and object parsing / creation

  * contentType - json, application/json, jsonp
  * responseType
    * xhr2.overrideMimeType("text/plain; charset=x-user-defined");
    * xhr2.responseType = 'arraybuffer';
  * create upload test for the browser
    * File
    * FileList
    * FormData
    * BlobBuilder

  * Better support for binary uploads in browser
  * Blob, BlobBuilder, etc (not yet implemented in most browsers)