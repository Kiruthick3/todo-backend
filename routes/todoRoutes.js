const express = require('express');
const router = express.Router();
const todoController = require('../controllers/todoController');
const auth = require('../middleware/authMiddleware')

router.post('/todos', auth, todoController.createTodo);
router.get('/todos', auth, todoController.getTodos);
router.put('/todos/:_id', auth, todoController.updateTodo);
router.delete('/todos/:_id', auth, todoController.deleteTodo);
router.delete('/todos', auth, todoController.deleteAllTodos);

module.exports = router;
