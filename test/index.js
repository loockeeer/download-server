const axios = require('axios')
const http = require('http')
const fs = require('fs')
const path = require('path')
const hasha = require('hasha')

const walk = require('./walk')

const publicPath = path.join(__dirname, 'public')

const PORT = process.env.PORT || 8080

async function main () {
  const files = []

  for await (const file of walk(publicPath)) {
    const hash = await hasha.fromFile(file, { algorithm: 'sha1' })
    files.push({
      relativePath: file.replace(path.normalize(publicPath.endsWith('/') ? publicPath : `${publicPath}/`), ''),
      hash
    })
  }
  console.log('done uh ')
  const toDownloadFiles = await axios({
    url: `http://localhost:${PORT}/compare`,
    method: 'POST',
    data: { files }
  }).then(res => res.data).catch(res => res.data)

  for (const toDownload of toDownloadFiles) {
    if(toDownload.op === "download") {
      await fs.promises.mkdir(path.dirname(path.join(publicPath, toDownload.relativePath)), { recursive: true })
      const file = fs.createWriteStream(path.join(publicPath, toDownload.relativePath))
      http.get(`http://localhost:${PORT}/download/${encodeURIComponent(toDownload.relativePath)}`, res => {
        res.pipe(file)

      })
    } else if (toDownload.op === "remove") {
      console.log(toDownload.relativePath)
      await fs.promises.unlink(path.join(publicPath, toDownload.relativePath))
    }
  }
}

main()
