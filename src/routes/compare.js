const isObject = require('../utils/isObject')

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
  const toDownloadFiles = distantFiles
    .map((dFile) => {
      
      const localFile = localFiles.find(
        (lFile) =>
          dFile.relativePath === lFile.relativePath
      )
      
      if(localFile) {
        if(localFile.hash !== dFile.hash) {
          return { mode: 'download', relativePath: localFile.relativePath, hash: localFile.hash }
        }
      } else {
        return { mode: 'delete', relativePath: dFile.relativePath, hash: dFile.hash } 
      }
      
      return {}
    })
    .concat(
      localFiles.filter((lFile) => !distantFiles.find((dFile) => dFile.relativePath === lFile.relativePath))
        .map((lFile) => ({ mode: 'download', relativePath: lFile.relativePath, hash: lFile.relativePath }))
    )
  return res.send(toDownloadFiles)
}
