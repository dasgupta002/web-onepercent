const mongoose = require('mongoose')
const Doc = require('./document')
mongoose.connect('mongodb+srv://dg:100@cluster0.mfaid.mongodb.net/gdocs?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })

const io = require('socket.io')(60, {
    cors: {
        origin: "http://localhost:3000",
        methods: ['GET', 'POST']
    }
})

io.on('connection', (socket) => {
    socket.on('get-document', async (documentId) => {
        const doc = await findOrCreateDoc(documentId)
        socket.join(documentId)
  
        socket.emit('load-document', doc.data)

        socket.on('send-change', (delta) => {
            socket.broadcast.to(documentId).emit('receive-change', delta)
        })

        socket.on('save-document', async (data) => {
            await Doc.findByIdAndUpdate(documentId, { data })
        })
    })
})

async function findOrCreateDoc(id) {
    if(id == null) return

    const document = await Doc.findById(id)
    if(document) return document
    return await Doc.create({ _id: id })
}