"use strict";
let fs = require('fs')
let express = require('express')
var wrap = require('co-express');
let morgan = require('morgan')
let nodeify = require('bluebird-nodeify')
let mime = require('mime-types')
let rimraf = require('rimraf')
let mkdirp = require('mkdirp')
let path = require('path')
let argv = require('yargs')
  .default('dir', process.cwd())
  .argv

require('songbird')

const NODE_ENV = process.env.NODE_ENV
const PORT = process.env.PORT || 8000
const ROOT_DIR = path.resolve(argv.dir)

let app = express()

if (NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

app.listen(PORT, ()=> console.log(`Listening @ http://127.0.0.1:${PORT}`))

app.get('*', setFileMeta, wrap(sendHeaders), (req, res, next) => {
  console.log("calling get()....")
  if (res.body) {
    res.json(res.body)
    return
  }

  fs.createReadStream(req.filePath).pipe(res)
})

app.put('*', setFileMeta, setDirMeta, wrap(createContent), (req, res, next) => {
    if(req.stat) return res.status(405).send('files exists')
    res.end()
})


app.post('*', setFileMeta, setDirMeta, wrap(updateContent), (req, res, next) => {
    if(!req.stat) return res.status(405).send('files exists')
    if(req.isDir) return res.status(405).send('this is a dir')

    res.end()
})

app.head('*', setFileMeta, wrap(sendHeaders), (req, res, next) => res.end())

app.delete('*', setFileMeta, wrap(deleteResources), (req, res, next) => res.end())

function setFileMeta(req, res, next) {
  console.log("calling setFileMeta()....")
  req.filePath = path.resolve(path.join(ROOT_DIR, req.url))
  if (req.filePath.indexOf(ROOT_DIR) !== 0) {
    res.send(400, 'Invalid path')
    return
  }

  fs.promise.stat(req.filePath)
    .then(stat => req.stat = stat, ()=> req.stat = null)
    .nodeify(next)
}

function* sendHeaders(req, res, next) {
    console.log("calling sendHeaders()....")
    if (req.stat.isDirectory()) {
      let files = yield fs.promise.readdir(req.filePath)
      res.body = JSON.stringify(files)
      res.setHeader('Content-Length', res.body.length)
      res.setHeader('Content-Type', 'application/json')
      return
    }

    res.setHeader('Content-Length', req.stat.size)
    let contentType = mime.contentType(path.extname(req.filePath))
    res.setHeader('Content-Type', contentType)
    next()
}

function* deleteResources(req, res, next) {
  console.log("calling deleteResources()....")
  if (req.stat.isDirectory()) {
    yield rimraf.promise(req.filePath)
    return
  }
  yield fs.promise.unlink(req.filePath)
  next()
}

function setDirMeta(req, res, next) {
  console.log("calling setDirMeta()....")


  let filepath = req.filePath
  let endsWithSlash = filepath.charAt(filepath.length-1) === path.sep
  let hasExt = path.extname(filepath) !== ''
  req.isDir = endsWithSlash || !hasExt
  req.dirPath = req.isDir ? filepath : path.dirname(filepath)
  next()
}

function* createContent(req, res, next) {
  console.log("calling createContent()....")
  yield mkdirp.promise(req.dirPath)

  if(!req.isDir) req.pipe(fs.createWriteStream(req.filePath))
  next()
}

function* updateContent(req, res, next) {
  console.log("calling updateContent()....")
  yield fs.promise.truncate(req.filePath, 0)
  req.pipe(fs.createWriteStream(req.filePath))
  next()
}
