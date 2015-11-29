'use strict'

const debug = require('debug')('transwarp:migrate')
const compose = require('koa-compose')
const path = require('path')
const chalk = require('chalk')
const Emitter = require('events')
const Context = require('./Context')
const Migration = require('./Migration')
const utils = require('./utils')

module.exports = class Migrator extends Emitter {

  constructor(root) {
    super()

    this.pos = 0
    this.migrations = []
    this.root = root
    this.middleware = []
    this.context = new Context()
    this.defaultMiddleware()
  }

  get migrationsPath() {
    return `${this.root}/migrations`
  }

  get dotFile() {
    return `${this.migrationsPath}/.migrate`
  }

  createContext() {
    const context = Object.create(this.context)
    context.app = this
    return context
  }

  use(fn) {
    if (typeof fn !== 'function')
      throw new TypeError('middleware must be a function!')
    debug('use %s', fn._name || fn.name || '-')
    this.middleware.push(fn)
    return this
  }

  defaultMiddleware() {
    this.use((ctx, next) => {
      const dir = this.root
      return utils.stat(dir).catch(() => utils.mkdir(dir)).then(next)
    })
    this.use((ctx, next) => {
      const dir = this.migrationsPath
      return utils.stat(dir).catch(() => utils.mkdir(dir)).then(next)
    })
  }

  add(name, up, down) {
    this.migrations.push(new Migration(name, up, down))
  }

  load() {
    return utils.readFile(this.dotFile, 'utf8')
      .catch(() => '{}')
      .then(data => JSON.parse(data))
  }

  save() {
    return utils.writeFile(this.dotFile, JSON.stringify(this, null, 2))
  }

  readdir(path) {
    if (!path) path = this.migrationsPath
    return utils.readdir(path)
    .then(files => {
      return files.filter(file => file.match(/^\d+.*\.js$/))
        .sort()
        .map(file => {
          const mod = Migrator.require(`${path}/${file}`)
          this.add(file, mod.up, mod.down)
          return file
        })
    })
  }

  findIndex(name) {
    for (var i = 0, len = this.migrations.length; i < len; ++i) {
      if (this.migrations[i].name === name) return i
    }
    return -1
  }

  up(name) {
    return this.migrate('up', name)
  }

  down(name) {
    return this.migrate('down', name)
  }

  create(name, tmpl) {
    const curr = utils.now()
    if (!name) name = curr
    else name = `${curr}-${utils.slugify(name)}`
    return utils.writeFile(`${this.migrationsPath}/${name}.js`, tmpl)
  }

  migrate(direction, name) {
    return this.load().then((json) => this.pos = json.pos)
      .then(() => this._migrate(direction, name))
  }

  _migrate(direction, name) {
    var migrations
    var pos
    if (!name) {
      pos = direction === 'up' ? this.migrations.length : 0
    } else {
      pos = this.findIndex(name)
      if (pos === -1) throw new Error(`Could not find migration: ${name}`)
    }

    switch (direction) {
      case 'up':
        migrations = this.migrations.slice(this.pos, pos + 1)
        break
      case 'down':
        migrations = this.migrations.slice(pos, this.pos).reverse()
        break
    }

    const num = direction === 'up' ? 1 : -1
    return compose(migrations.map(m => {
      return (ctx, next) => {
        this.pos += num
        debug(`Position is ${this.pos}`)
        console.log(chalk.green(direction), m.name)
        return this.save().then(() => m[direction](ctx, next))
      }
    }))
  }

  run() {
    debug('run')
    var setup = Migrator.require(`${this.root}/setup`) ||
      ((ctx) => Promise.resolve(ctx))
    const fn = compose(this.middleware)
    const ctx = this.createContext()
    return fn(ctx).then(() => setup(ctx))
  }

  toJSON() {
    return {
      pos: this.pos,
      migrations: this.migrations,
      path: this.migrationsPath
    }
  }

  static require(module) {
    try {
      const m = require(module)
      return m.default || m
    } catch (e) {
      debug(`Not found module: ${e}`)
      return
    }
  }
}
