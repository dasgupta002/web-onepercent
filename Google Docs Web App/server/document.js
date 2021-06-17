const { Schema, model } = require('mongoose')

const docSchema = new Schema({
    _id: { type: String, required: true },
    data: { type: Object, default: '' }
})

module.exports = model('Document', docSchema)