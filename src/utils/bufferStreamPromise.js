// Code taken from https://github.com/NodeGuy/concat-stream-p/blob/master/lib/index.js and modified for native promises
const concat = require('concat-stream');

export default function (options) {
  let prom, stream, streamResolve;
  
  prom = new Promise(function(resolve) {
    streamResolve = resolve;
  });
  
  stream = concat(options, function(val) {
    streamResolve(val);
  });
  
  stream.then = prom.then.bind(prom);
  return stream;
}