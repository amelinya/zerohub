import express from 'express'
import path from 'path'

const webserver = express()

webserver.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, './webclient/index.html'))
})

webserver.listen(80)
