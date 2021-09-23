console.log(process.env.NODE_ENV)
if (process.env.NODE_ENV != 'production') {
    // neu dev thi import cai dotenv de dung env tu .env ; neu da len production thi dung env trong config vars
    require('dotenv').config({ path: './configs/.env' })
    console.log('ok in local env')
} else {
    console.log('ok in production env')
}
const express = require('express')
const app = express()
app.use(express.static('publics'))

const server = require('http').createServer(app)
const io = require('socket.io')(server)
function removeObject(arr, userId) {
    for (let i = 0; i < arr.length; i++) {
        if (arr[i].userId == userId) {
            arr.splice(i, 1)
            break
        }
    }
}
io.on('connection', (socket) => {
    console.log('Co nguoi truy cap', socket.id)
    socket.on('connection', (data) => {
        console.log('connection: ' + socket.id + ' join ' + data.roomId)
    })
    socket.on('disconnect', () => {
        console.log('user: ' + socket.id + ' disconnected')
    })
    socket.on('client-status', (data) => {
        if (data.status == 'ready') {
            socket.join(data.roomId) // When user connect --> push user to room
        }
        if (data.status == 'unready') {
            socket.leave(data.roomId)
        }
        const clients = io.sockets.adapter.rooms.get(data.roomId)
        const numClients = clients ? clients.size : 0
        console.log('clients' + clients)
        console.log(socket.adapter.rooms1)
        if (numClients == 2) {
            let i = 0
            for (const client of clients) {
                // clients la set
                console.log(JSON.stringify(client))
                io.to(client).emit('set-flag', {
                    flag: i == 0 ? 'X' : 'O',
                    socketId: socket.id,
                })
                i++
            }
            io.sockets.emit('start-game')
        }
    })
    socket.on('click', (data) => {
        console.log(data)
        io.sockets.emit('click', data)
    })
})

const handlebars = require('express-handlebars')
app.engine(
    'hbs',
    handlebars({
        extname: '.hbs',
    })
)
app.set('view engine', 'hbs')

app.set('views', './views')

app.get('/', function (req, res) {
    res.render('home')
})
app.get('/room/:id', function (req, res) {
    res.render('room', { layout: 'room' })
})

server.listen(process.env.PORT, () => {
    console.log('listening on port 3000')
})
