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
  const toDownloadFiles = localFiles
    .filter((file) => {
      const exists = distantFiles.findIndex(
        (dFile) => 
          path.normalize(dFile.relativePath) === file.relativePath && dFile.hash === file.hash
      )
      if(exists) {
        distantFiles.splice(exists, 1)
      }
      return !exists
    })
    .map((file) => ({ relativePath: file.relativePath, hash: file.hash, op: 'download' }))

  return res.send(toDownloadFiles)
}
