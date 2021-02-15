const isObject = require('../utils/isObject')
const path = require('path')

module.exports = async (req, res) => {
  const localFiles = req.app.get('APP_files')
  const distantFiles = req?.body?.files

  if (!distantFiles) {
    return res.status(400).send({ message: 'Missing files array' })
  }
  if (!Array.isArray(distantFiles)) {
    return res
      .status(400)
      .send({ message: 'Sent body does not match the requirements' })
  }
  const goodPattern = distantFiles.every(
    (file) =>
      isObject(file) &&
      Object.prototype.hasOwnProperty.call(file, 'relativePath') &&
      Object.prototype.hasOwnProperty.call(file, 'hash')
  )

  if (!goodPattern) {
    return res
      .status(400)
      .send({ message: 'Sent array does not match required pattern' })
  }

  const toDownloadFiles = []

  for (const localFile of localFiles) {
    const distantFile = distantFiles.find((df) => {
      return (
        path.normalize(df.relativePath) === localFile.relativePath &&
        df.hash === localFile.hash
      )
    })

    if (!distantFile) {
      toDownloadFiles.push({
        hash: localFile.hash,
        relativePath: localFile.relativePath,
        op: 'download'
      })
    }
  }

  const toRemoveFiles = []
  for (const distantFile of distantFiles) {
    const localFile = localFiles.find((lf) => {
      return (
        path.normalize(lf.relativePath) ===
        path.normalize(distantFile.relativePath)
      )
    })

    if (!localFile) {
      toRemoveFiles.push({ ...distantFile, op: 'remove' })
    }
  }

  return res.send([...toDownloadFiles, ...toRemoveFiles])
}
