import React, { useState, useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import Quill from 'quill'
import { io } from 'socket.io-client'
import 'quill/dist/quill.snow.css'
import '../css/style.css'

const toolbarProps = [
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    [{ font: [] }],
    [{ list: "ordered" }, { list: "bullet" }],
    ["bold", "italic", "underline"],
    [{ color: [] }, { background: [] }],
    [{ script: "sub" }, { script: "super" }],
    [{ align: [] }],
    ["image", "blockquote", "code-block"],
    ["clean"]
]

export default function Editor() {
    const { id: documentId } = useParams()
    const [socket, setSocket] = useState()
    const [text, setText] = useState()
    
    useEffect(() => {
        const conn = io('http://localhost:60')
        setSocket(conn)

        return () => {
            conn.disconnect()
        }
    }, [])

    useEffect(() => {
        if(socket == null || text == null) return

        const interval = setInterval(() => {
            socket.emit('save-document', text.getContents())
        }, 2000)

        return () => {
            clearInterval(interval)
        }
    }, [socket, text])

    useEffect(() => {
        if(socket == null || text == null) return

        socket.once('load-document', (document) => {
            text.setContents(document)
            text.enable()
        })
        socket.emit('get-document', documentId)
    }, [socket, text, documentId])

    useEffect(() => {
        if(socket == null || text == null) return
        
        const textHandler = (delta, oldDelta, source) => {
            if(source !== 'user') return
            socket.emit('send-change', delta)
        }
        text.on('text-change', textHandler)

        return () => {
            text.off('text-change', textHandler)
        }
    }, [socket, text])
    
    useEffect(() => {
        if(socket == null || text == null) return
        
        const returnHandler = (delta) => {
            text.updateContents(delta)
        }
        socket.on('receive-change', returnHandler)

        return () => {
            socket.off('receive-change', returnHandler)
        }
    }, [socket, text])

    const editorCall = useCallback((wrapper) => {
        if(wrapper == null) return

        wrapper.innerHTML = ''
        const editor = document.createElement('div')
        wrapper.append(editor)
        const quillPage = new Quill(editor, { theme: 'snow', modules: { toolbar: toolbarProps } })
        quillPage.disable()
        quillPage.setText('Loading your document . .')
        setText(quillPage)
    }, [])
    
    return (
        <div className = "container" ref = { editorCall }></div>
    )
}