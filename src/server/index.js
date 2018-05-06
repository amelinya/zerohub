import http from 'http'
import fs from 'fs'
import path from 'path'

http.createServer((req, res) => {
  console.log('Connection')
  fs.readFile(path.join(__dirname, '../client/index.html'), (err, content) => {
    if (err) {
      res.writeHead(500)
      res.end('Sorry, check with the site admin for error: ' + err.code + ' ..\n')
      res.end()
    } else {
      res.writeHead(200, {'Content-Type': 'text/html'})
      res.end(content, 'utf-8')
    }
  })
}).listen(80)
console.log('Server running...')
