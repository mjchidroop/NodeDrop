const express = require('express')
const app = express()
const http = require('http')
const server = http.createServer(app)
const { Server } = require('socket.io')
const io = new Server(server)

app.use(express.static('public'))

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html')
})

const users = {}

io.on('connection', (socket) => {
  console.log('a user connected')

  socket.on('set username', (username) => {
    users[socket.id] = username
    io.emit('update users', Object.values(users))
    socket.broadcast.emit('alert', `${username} joined the chat`)
  })

  socket.on('chat message', (data) => {
    const messageWithTime = {
      username: data.username,
      msg: data.msg,
      time: new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      })
    }
    io.emit('chat message', messageWithTime)
  })

  socket.on('typing', (username) => {
    socket.broadcast.emit('typing', username)
  })

  socket.on('disconnect', () => {
    const username = users[socket.id]
    delete users[socket.id]
    io.emit('update users', Object.values(users))
    if (username) socket.broadcast.emit('alert', `${username} left the chat`)
    console.log('a user disconnected')
  })
})
const PORT = process.env.PORT || 3000
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})