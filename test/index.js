const axios = require('axios')
const http = require('http')
const fs = require('fs')
const path = require('path')
const hasha = require('hasha')

const walk = require('./walk')

const folder = path.join(__dirname, 'public')

async function main () {
  const files = []
  for await (const file of walk(folder)) {
    const hash = await hasha.fromFile(file, { algorithm: 'sha1' })
    files.push({
      relativePath: file.replace(folder + '/', ''),
      hash
    })
  }
  const toDownloadFiles = await axios({
    url: 'http://localhost:8080/compare',
    method: 'POST',
    data: { files }
  }).then(res => res.data).catch(res => res.data)
  console.log(toDownloadFiles)
  for (const toDownload of toDownloadFiles) {
    await fs.promises.mkdir(path.dirname(path.join(folder, toDownload.relativePath)), { recursive: true })
    const file = fs.createWriteStream(path.join(folder, toDownload.relativePath))

    http.get('http://localhost:8080/download?relativePath=' + encodeURIComponent(toDownload.relativePath), res => {
      res.pipe(file)
      console.log('Starting fetch ' + toDownload.relativePath)
      res.on('end', () => console.log('End fetching ' + toDownload.relativePath))
    })
  }
}

main()
