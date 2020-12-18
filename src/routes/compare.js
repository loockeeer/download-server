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
  const toDownloadFiles = localFiles
    .filter((file) => {
      return !distantFiles.find(
        (dFile) =>
          dFile.relativePath === file.relativePath && dFile.hash === file.hash
      )
    })
    .concat(distantFiles.filter((dFile) => !localFiles.find((lFile) => lFile.relativePath === dFile.relativePath)))
    .map((file) => {
         const fileExists = localFiles.find((f) => f.relativePath === file.relativePath)
         let o;
         if (fileExists) o = { mode: 'download', relativePath: file.relativePath, hash: file.hash }
         else o = { mode: 'delete', relativePath: file.relativePath }
         return o
    })

  return res.send(toDownloadFiles)
}
