const fs = require('fs').promises

module.exports = async function fetchAssets (assetsPath) {
  return fs.readdir(assetsPath, { withFileTypes: true }).then((files) => {
    const folders = files.filter((file) => file.isDirectory())
    return folders.map((folder) => folder.name)
  })
}
