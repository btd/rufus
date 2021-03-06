/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

require('bluebird').onPossiblyUnhandledRejection();

var Logger = require('./logger');
var Handler = require('./handlers/handler');
var handlers = require('./handlers');
var Formatter = require('./formatter');

var root = new Logger();

root.setLevel(Logger.DEBUG);
var oldHandle = root.handle;
root.handle = function handle() {
  if (this._handlers.length === 0) {
    root.basicConfig();
  }
  return oldHandle.apply(this, arguments);
};

root.basicConfig = function basicConfig(options) {
  if (root._handlers.length) {
    return;
  }

  // available options:
  //  level, format, filename, stream
  options = options || {};

  var hdlr;
  if (options.file) {
    hdlr = new handlers.File({ file: options.file });
  } else if (options.stream) {
    hdlr = new handlers.Stream({ stream: options.stream });
  } else {
    hdlr = new handlers.Console();
  }
  hdlr.setFormatter(new Formatter(options.format));
  root.addHandler(hdlr);

  if (options.level) {
    root.setLevel(options.level);
  }
};

root.Logger = Logger;
root.Handler = Handler;
root.handlers = handlers;
root.Formatter = Formatter;
root.makeFilter = require('./filter');

root.getLogger = function getLogger(name) {
  return new Logger(name);
};

// lazy load it, since console depends on this module
Object.defineProperty(root, 'config', {
  get: function() {
    return require('./config');
  }
});
Object.defineProperty(root, 'console', {
  get: function() {
    return require('./console');
  }
});


module.exports = root;
