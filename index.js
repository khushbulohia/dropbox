require('./helper')

let fs = require('fs').promise
let express = require('express')
let morgan = require('morgan')
let trycatch = require('trycatch')
let wrap = require('co-express')
let bodyParser = require('simple-bodyparser')
let path = require('path')

function* main() {
	let app = express()
// 	app.all('*', (req, res) => res.end('hello\n'))
	let port = 8000
   	app.listen(port)
   	
   	app.get('*', wrap(read))
   	app.put('*', wrap(create))
	app.post('*', bodyParser(), wrap(update))
	app.delete('*', wrap(remove))
   	
	console.log(`LISTENING @ http://127.0.0.1:${port}`)
	
}

function* read(req, res) {
	console.log('calling read()...')
	let filePath = path.join(__dirname, 'file', req.url)
	console.log('filePath: '+filePath)
	
	let data = yield fs.readFile(filePath)
	
	console.log('data: '+data)
	
	res.end(data)
}

function* create(req, res) {
	console.log('calling create()...')
	
	//console.log('body: '+req.body)
	let filePath = path.join(__dirname, 'file', req.url)
	
	let data = yield fs.open(filePath, "wx")
	
	//let data = yield fs.writeFile(filePath, req.body)
	res.end()
}

function* update(req, res) {
	console.log('calling update()...')
	
	console.log('body: '+req.body)
	let filePath = path.join(__dirname, 'file', req.url)
	let data = yield fs.writeFile(filePath, req.body)
	
	res.end()
}

function* remove(req, res) {
	console.log('calling remove()...')
	
	let filePath = path.join(__dirname, 'file', req.url)
	let data = yield fs.unlink(filePath)
	res.end()
}

module.exports = main

