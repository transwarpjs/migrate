'use strict'

const Emitter = require('events')

module.exports = class Migration extends Emitter {

  constructor(name, up, down) {
    super()

    this.name = name
    this.up = up
    this.down = down
  }

  toJSON() {
    return this.name
  }

}
