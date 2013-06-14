/*
 * Copyright (c) 2011-2013 Chris McCormick, Sébastien Piquemal <sebpiq@gmail.com>
 *
 *  This file is part of WebPd. See https://github.com/sebpiq/WebPd for documentation
 *
 *  WebPd is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  WebPd is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with WebPd.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

var _ = require('underscore')
  , utils = require('./utils')
  , BaseNode = require('./BaseNode')

var Patch = module.exports = function() {
  BaseNode.apply(this, arguments)
  this.objects = []

  // The patch registers to Pd
  require('../index').register(this)
}

_.extend(Patch.prototype, BaseNode.prototype, utils.UniqueIdsMixin, {

  type: 'patch',

  init: function() {},

  start: function() {
    this.objects.forEach(function(obj) { obj.start() })
  },

  stop: function() {
    this.objects.forEach(function(obj) { obj.stop() })
  },

  // Send a message to a named receiver inside the graph
  send: function(name) {
    this.emit.apply(this, ['msg:' + name]
      .concat(Array.prototype.slice.call(arguments, 1)))
  },

  // Receive a message from a named sender inside the graph
  receive: function(name, callback) {
    this.on('msg:' + name, callback)
  },

  // Adds an object to the patch.
  // Also causes the patch to automatically assign an id to that object.
  // This id can be used to uniquely identify the object in the patch.
  // Also, if the patch is playing, the `load` method of the object will be called.
  register: function(obj) {
    if (this.objects.indexOf(obj) === -1) {
      var Pd = require('../index')
        , id = this._generateId()
      obj.id = id
      obj.patch = this
      this.objects[id] = obj
      if (Pd.isStarted()) obj.start()
    }
  }

})