#!/usr/bin/env node

const program = require('commander')

const cwd = process.cwd()

function migrate() {
  const Migrator = require('../src/Migrator.js')
  return new Migrator(`${cwd}/db`)
}

program
.version('0.0.0')
.description('Database migration for Transwarp.')
.option('--config [path]', 'Location of the database.json file.')
.option('-e,--env <env>',    'The environment to run the migrations under.', 'dev')

program
.command('up [name]')
.alias('u')
.description('migrate up')
.action((name, options) => {
  const m = migrate()
  m
  .run()
  .then((ctx, next) => {
    return m.readdir().then(files => {
      return ctx
    })
  })
  .then((ctx, next) => {
    return m.up(name).then(fn => fn(ctx)).then(() => ctx)
  })
  .then(() => {
    process.exit(0)
  })
  .catch(err => {
    console.log(err)
    process.exit(1)
  })
})

program
.command('down [name]')
.alias('d')
.description('migrate down')
.action((name) => {
  const m = migrate()
  m
  .run()
  .then((ctx, next) => {
    return m.readdir().then(files => {
      return ctx
    })
  })
  .then((ctx, next) => {
    return m.down(name).then(fn => fn(ctx)).then(() => ctx)
  })
  .then(() => {
    process.exit(0)
  })
  .catch(err => {
    console.log(err)
    process.exit(1)
  })
})

program
.command('create [name]')
.description('create a new migration file with optional [name]')
.action((name) => {

  const tmpl = `'use strict'

exports.up = (ctx, next) => {
  // do something
  return next()
}

exports.down = (ctx, next) => {
  // do something
  return next()
}
`
  const m = migrate()
  m
  .create(name, tmpl)
  .then(() => {
    process.exit(0)
  })
  .catch(err => {
    console.log(err)
    process.exit(1)
  })
})

program.parse(process.argv)
