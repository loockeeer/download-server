const { version } = require('../../package.json')

module.exports = async (req, res) => {
  return res.send({
    version,
    hash: req.app.get('APP_hash')
  })
}
