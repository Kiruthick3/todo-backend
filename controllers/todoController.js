const todoModel = require('../models/todoModel');

exports.createTodo = async (req, res) => {
    // console.log("Incoming Request Body:", req.body);
    const { title, description } = req.body;
    try {
        const newTodo = new todoModel({ title, description, user: req.user._id});
        await newTodo.save();
        res.status(201).json(newTodo);
    } catch (error) {
        // console.log(error);
        // console.error("Error in todos:", error.message);
        res.status(500).json({ message: error.message });
    }
};

exports.getTodos = async (req, res) => {
    try {
        const todos = await todoModel.find({user: req.user._id});
        // console.log(todos);
        res.json(todos);
    } catch (error) {
        // console.log(error);
        // console.error("Error in todos:", error.message);
        res.status(500).json({ message: error.message });
    }
};

exports.updateTodo = async (req, res) => {
    try {
        const { title, description } = req.body;
        const { _id } = req.params;
        const updatedTodo = await todoModel.findOneAndUpdate({_id, user: req.user._id}, { title, description }, { new: true });

        if (!updatedTodo) {
            return res.status(404).json({ message: "Todo not found" });
        }
        res.json(updatedTodo);
    } catch (error) {
        // console.log(error);
        // console.error("Error in todos:", error.message);
        res.status(500).json({ message: error.message });
    }
};

exports.deleteTodo = async (req, res) => {
    try {
        const { _id } = req.params;
        await todoModel.findOneAndDelete({_id, user: req.user._id});
        res.status(204).end();
    } catch (error) {
        // console.log(error);
        // console.error("Error in todos:", error.message);
        res.status(500).json({ message: error.message });
    }
};

exports.deleteAllTodos = async (req, res) => {
    try {
        await todoModel.deleteMany({user: req.user._id});
        res.status(204).end();
    } catch (error) {
        // console.log(error);
        // console.error("Error in todos:", error.message);
        res.status(500).json({ message: error.message });
    }
};
