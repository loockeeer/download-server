module.exports = async (req, res) => {
  const localFiles = req.app.get('APP_files')
  const distantFiles = req.body
  if (!distantFiles) {
    return res.status(400).send({ message: 'Missing files array' })
  }
  const toDownloadFiles = localFiles
    .filter((file) => {
      return !distantFiles.find(
        (dFile) =>
          dFile.relativePath === file.relativePath && dFile.hash === file.hash
      )
    })
    .map((file) => ({ relativePath: file.relativePath, hash: file.hash }))

  return res.send(toDownloadFiles)
}
