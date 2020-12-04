module.exports = async (req, res) => {
    const localFiles = req.app.get('files')
    const distantFiles = req.body.files
    const toDownloadFiles = localFiles.filter(file => {
        return !distantFiles.find(dFile => dFile.relativePath === file.relativePath && dFile.hash === file.hash)
    }).map(file => ({relativePath: file.relativePath, hash: file.hash}))

    return res.send(toDownloadFiles)
}