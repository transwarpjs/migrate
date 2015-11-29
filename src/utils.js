'use strict'

const fs = require('fs')
const debug = require('debug')('transwarp:migrate')

exports.stat = (path) => {
  return new Promise((resolve, reject) => {
    fs.stat(path, (err, stats) => {
      err ? reject(err) : resolve(stats)
    })
  })
}

exports.mkdir = (path, mode) => {
  return new Promise((resolve, reject) => {
    debug(`Mkdir ${path}`)
    fs.mkdir(path, mode, (err) => {
      err ? reject(err) : resolve()
    })
  })
}

exports.writeFile = (path, data) => {
  return new Promise((resolve, reject) => {
    debug(`Write ${path}`)
    fs.writeFile(path, data, (err) => {
      err ? reject(err) : resolve()
    })
  })
}

exports.readFile= (path, options) => {
  return new Promise((resolve, reject) => {
    debug(`Read ${path}`)
    var data = fs.readFileSync(path, options)
    fs.readFile(path, options, (err, data) => {
      err ? reject(err) : resolve(data)
    })
  })
}

exports.readdir = (path) => {
  return new Promise((resolve, reject) => {
    debug(`Readdir ${path}`)
    fs.readdir(path, (err, files) => {
      err ? reject(err) : resolve(files)
    })
  })
}
