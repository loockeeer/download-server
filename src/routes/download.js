module.exports = async (req, res) => {
  const relativePath = req.query.relativePath
  if (!relativePath) {
    return res
      .status(400)
      .send({ message: 'Missing relativePath in query parameters' })
  }

  const localFiles = req.app.get('APP_files')

  const file = localFiles.find((file) => file.relativePath === relativePath)
  if (!file) {
    return res.status(404).send({ message: 'This file does not exists' })
  }

  return res.sendFile(file.fullPath)
}
