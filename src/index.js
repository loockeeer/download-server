const express = require('express')
const app = express()

const path = require('path')
const hasha = require('hasha')
const chalk = require('chalk')

const walk = require('./utils/walk')

// Import routes
const compareRoute = require('./routes/compare')
const downloadRoute = require('./routes/download')

// Configure routes
app.post('/compare', compareRoute)
app.get('/download', downloadRoute)

// App main
async function main () {
  const publicPath = path.join(__dirname, 'public' || process.env.DATA_FOLDER)
  const files = []

  console.log(chalk`{bold.blue [LOAD][LOG]} Start computing hash of files`)
  const hashStartTime = Date.now()

  for await (const file of walk(publicPath)) {
    const hash = await hasha.fromFile(file, { algorithm: 'sha1' })
    files.push({
      fullPath: file,
      relativePath: file.replace(publicPath + '/', ''),
      hash
    })
  }

  const fileHashTime = Date.now() - hashStartTime
  console.log(
    chalk`{bold.blue [LOAD][LOG]} Files hash computed in {gray ${
      fileHashTime / 1000
    }} seconds`
  )

  app.configure(() => {
    app.set('files', files)
  })

  console.log(chalk`{bold.blue [STARTING][LOG]} Ready to start server`)
  app.listen(process.env.PORT, () => {
    console.log(chalk`{bold.blue [STARTING][INFO]} {green Server started !}`)
    console.log(chalk`{bold.blue [INFO]} {green You can stop it with Ctrl+C}`)
  })
}

main().catch((err) => {
  throw err
})
