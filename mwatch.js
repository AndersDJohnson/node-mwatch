/*
 * mwatch
 * 
 * A version of Node.js fs.watch that works over mounted file systems.
 * Supports a subset of fs.watch funcationality for Node 6.x (http://nodejs.org/api/fs.html#fs_fs_watch_filename_options_listener)
 *
 * Tested with `sshfs -o cache=no` for ext3 drives on Linux 2.6.32-5-amd64 Debian 6.0.4 
 * 
 * By Anders D. Johnson
 * http://github.com/AndersDJohnson
 * (c) 2012, MIT/X11 License
 */
(function(){
  var fs, events;
  fs = require('fs');
  events = require('events');
  module.exports = function(poll){
    var mtimes, timers, o, mwatch, _stat, _poller;
    poll == null && (poll = 1000);
    mtimes = {};
    timers = {};
    o = function(filename, listener){
      var _this = this;
      this.filename = filename;
      this.listener = listener;
      this.on('change', function(){
        return _this.listener('change', _this.filename);
      });
    };
    o.prototype = new events.EventEmitter();
    o.prototype.close = function(){
      return clearInterval(timers[filename]);
    };
    _stat = function(){
      var _this = this;
      return fs.stat(this.filename, function(err, stats){
        if (err) {
          throw err;
        }
        if (mtimes[_this.filename] == null) {
          mtimes[_this.filename] = stats.mtime;
        }
        if (mtimes[_this.filename].toString() !== stats.mtime.toString()) {
          mtimes[_this.filename] = stats.mtime;
          return _this.emit('change', 'change', _this.filename);
        }
      });
    };
    _poller = function(object){
      return _stat.apply(object);
    };
    mwatch = function(filename, listener){
      var i;
      i = new o(filename, listener);
      timers[filename] = setInterval(_poller, poll, i);
      return i;
    };
    return mwatch;
  };
}).call(this);
