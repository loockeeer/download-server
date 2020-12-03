const fs = require('fs').promises

module.exports = async function fetchTars (assetsPath) {
  return fs.readdir(assetsPath, { withFileTypes: true }).then((files) => {
    const tars = files.filter(
      (file) => file.isFile() && file.name.endsWith('.tgz')
    )
    return tars.map((tar) => tar.name)
  })
}
