process.nextTick(() => {
  require('safeguards').noSynchronousIO(require.main)
})

require('trycatch').configure({'long-stack-traces': true})
require('songbird')
require('safeguards')

let co = require('co')

process.on('uncaughtException', logError)

process.on('uncaughtApplicationException', logError)

process.on('unhandledRejection', logError)

function logError(err) {
  console.log(err.stack)
}

process.nextTick(() => co(module.parent.exports()))

// TODO: Delete all core non-promise APIs
