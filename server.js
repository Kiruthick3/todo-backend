require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const todoRoutes = require('./routes/todoRoutes');
const authRoutes = require('./routes/authRoutes');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors({
  origin: process.env.CLIENT_URL
}));
app.use(todoRoutes);
app.use(authRoutes);

mongoose.connect(process.env.DB)
.then(()=>{
    console.log("Database connected");
})
.catch((err)=>{
    console.log("connection error",err);
});

const port = process.env.PORT || 3003;

app.listen(port, () => {
    console.log("server is listening to the port: " +port);
});