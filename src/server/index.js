import express from 'express'

const app = express()
app.get('/', (req, res) => res.file('./server.js'))
app.listen(80)
