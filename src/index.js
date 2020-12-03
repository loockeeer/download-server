const express = require('express')
const app = express()

const path = require('path')
const fs = require('fs').promises
const tar = require('tar')
const hasha = require('hasha')
const fetchAssets = require('./utils/fetchAssets')
const fetchTars = require('./utils/fetchTars')

const global = {}

app.get('/assets', (req, res) => {
  return res.send(
    global.assets.map((asset) => ({
      name: asset.name,
      hash: asset.hash
    }))
  )
})

async function main () {
  const assetsPath = path.join(__dirname, 'assets')

  console.log('[PRELOAD][LOG] Removing old tar(s)')
  const oldTars = await fetchTars(assetsPath)
  await Promise.all(
    oldTars.map((oldTar) => fs.unlink(path.join(assetsPath, oldTar)))
  )

  console.log('[LOAD][LOG] Start fetch assets')
  const assets = await fetchAssets(assetsPath)

  console.log('[LOAD][LOG] Start making tar(s) of assets')
  let startTime = Date.now()
  const tars = await Promise.all(
    assets.map((asset) =>
      tar
        .c(
          {
            gzip: true,
            file: path.join(assetsPath, asset + '.tgz')
          },
          [path.join(assetsPath, asset)]
        )
        .then((tar) => asset)
    )
  )
  const tarTime = Date.now() - startTime
  console.log('[LOAD][LOG] Tars builded in ' + tarTime + ' ms')

  console.log('[LOAD][LOG] Start compute hash of assets')
  startTime = Date.now()
  global.assets = await Promise.all(
    tars.map((assetName) => {
      return hasha
        .fromFile(path.join(assetsPath, assetName + '.tgz'), {
          algorithm: 'md5'
        })
        .then(hash => ({
          name: assetName,
          folderPath: path.join(assetsPath, assetName),
          tarPath: path.join(assetsPath, assetName + '.tgz'),
          hash
        }))
    })
  )
  const hashTime = Date.now() - startTime
  console.log('[LOAD][LOG] Assets hash computed in ' + hashTime + ' ms')

  console.log('[STARTING][LOG] Ready to start server')
  app.listen(8080).then(() => {
    console.log('[STARTING][INFO] Server started !')
    console.log('[STARTED][INFO] You can stop it with Ctrl+C')
  })
}

main().catch((err) => {
  throw err
})
