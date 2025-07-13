const mongoose = require('mongoose');
const {User} = require('./userModel');

const todoSchema = new mongoose.Schema({
    title: {
        required: true,
        type: String
    },
    description: {
        required: true,
        type: String
    },
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});

const todoModel = mongoose.model('Todo', todoSchema);

module.exports = todoModel;
