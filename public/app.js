const socket = io()
let username = ''

function joinChat() {
  const input = document.getElementById('username-input')
  if (input.value.trim() === '') return
  username = input.value.trim()
  socket.emit('set username', username)
  document.getElementById('username-screen').style.display = 'none'
  document.getElementById('chat-screen').classList.add('active')
}

function sendMessage() {
  const input = document.getElementById('message-input')
  const msg = input.value.trim()
  if (msg === '' || username === '') return
  socket.emit('chat message', { username, msg })
  input.value = ''
}

document.getElementById('message-input').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') sendMessage()
})

document.getElementById('username-input').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') joinChat()
})

socket.on('chat message', (data) => {
  const messages = document.getElementById('messages')
  const div = document.createElement('div')
  div.classList.add('message')
  div.innerHTML = `
    <div class="message-header">
      <span class="message-username">${data.username}</span>
      <span class="message-time">${data.time}</span>
    </div>
    <div class="message-text">${data.msg}</div>
  `
  messages.appendChild(div)
  messages.scrollTop = messages.scrollHeight
})

document.getElementById('message-input').addEventListener('input', () => {
  socket.emit('typing', username)
})

socket.on('typing', (name) => {
  const typing = document.getElementById('typing')
  typing.textContent = `${name} is typing...`
  setTimeout(() => typing.textContent = '', 2000)
})

socket.on('update users', (users) => {
  const list = document.getElementById('user-list')
  const count = document.getElementById('user-count')
  count.textContent = users.length
  list.innerHTML = ''
  users.forEach(name => {
    const li = document.createElement('li')
    li.innerHTML = `<span class="dot"></span>${name}`
    list.appendChild(li)
  })
})

socket.on('alert', (msg) => {
  const messages = document.getElementById('messages')
  const div = document.createElement('div')
  div.classList.add('alert-msg')
  div.textContent = msg
  messages.appendChild(div)
  messages.scrollTop = messages.scrollHeight
})