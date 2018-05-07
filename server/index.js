import express from 'express'

const webserver = express()

webserver.get('*', (req, res) => {
  res.sendFile('./home/index.htm')
})

webserver.listen(80)
