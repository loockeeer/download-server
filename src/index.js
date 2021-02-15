require('dotenv').config()
const express = require('express')
const app = express()

const path = require('path')
const hasha = require('hasha')
const chalk = require('chalk')
const bodyParser = require('body-parser')
const helmet = require('helmet')
const fs = require('fs/promises')

const walk = require('./utils/walk')

// Define constants
const HOST = process.env.HOST || '127.0.0.1'
const PORT = process.env.PORT || 8080
const DEBUG = process.env.NODE_ENV !== "production"
const HASH = process.env.HASH || 'md5'

// Import routes
const compareRoute = require('./routes/compare')
const infoRoute = require('./routes/info')

// Configure middlewares
app.use(helmet())
app.use(bodyParser.json({ limit: '1gb' }))
app.use((req, res, next) => {
  if (!DEBUG) return next()
  const opt = {
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric'
  }
  const time = new Intl.DateTimeFormat('default', opt).format(new Date())
  console.log(
    chalk`{bold.blue [LOG]} {gray ${time}} {bold ${req.method}} {green ${req.originalUrl}}`
  )
  next()
})

app.use(
  '/download',
  express.static(path.join(process.cwd(), 'public'), { dotfiles: 'allow' })
)

// Configure routes
app.post('/compare', compareRoute)
app.get('/info', infoRoute)
// App main
async function main () {
  const publicPath = path.join(process.cwd(), 'public')
  const stat = await fs.stat(publicPath).catch(() => {
    throw Error('Public folder does not exist')
  })
  if (stat && !stat.isDirectory()) {
    throw Error('"public" is a file and not a folder')
  }
  const files = []

  console.log(chalk`{bold.blue [LOAD][LOG]} Start computing hash of files`)
  const hashStartTime = Date.now()

  for await (const file of walk(publicPath)) {
    const hash = await hasha.fromFile(file, { algorithm: HASH })
    const normalized = path.normalize(file)

    files.push({
      fullPath: file,
      relativePath: normalized.replace(path.normalize(`${publicPath}/`), ''),
      hash
    })
  }

  const fileHashTime = Date.now() - hashStartTime
  console.log(
    chalk`{bold.blue [LOAD][LOG]} Files hash computed in {gray ${
      fileHashTime / 1000
    }} seconds`
  )

  app.set('APP_files', files)
  app.set('APP_hash', HASH)
  console.log(chalk`{bold.blue [STARTING][LOG]} Ready to start server`)
  app.listen(PORT, HOST, () => {
    console.log(chalk`{bold.blue [INFO]} {green Server started !}`)
    console.log(chalk`{bold.blue [INFO]} {green Listening on ${HOST}:${PORT}}`)
    console.log(chalk`{bold.blue [INFO]} {green You can stop it with Ctrl+C}`)
  })
}

main().catch((err) => {
  throw err
})
