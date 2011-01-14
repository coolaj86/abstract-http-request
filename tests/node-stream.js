var request = require("../lib/ahr.js"),
  result = true,
  count = 0;

request({ uri:"file:256kb.dat", stream: true }).whenever(function (err, fs, data, end) {
  if (err) {
    console.log(err);
  }
  if (data) {
    if (!/[0-9,A-F]/.test(data)) {
      result = false;
      console.log("Unexpected Error: regex doesn't match contents")
    } else {
      count += 1;
    }
  } else if (!end) {
    console.log("Unexpected Error: no data");
  }
  if (end && result && count > 2) {
    console.log('File Test Passes');
  }
});
