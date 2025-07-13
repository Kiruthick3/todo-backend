const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    firstName: {
        required: true,
        type: String
    },
    lastName: {
        required: true,
        type: String
    },
    email: {
        required: true,
        type: String
    },
    password: {
        required: true,
        type: String
    },
    resetPasswordToken:{
        type: String
    },
    resetPasswordExpires:{
        type: Date
    }
})

userSchema.methods.generateAuthToken =  function () {
    try {
        const token = jwt.sign({ _id: this._id, firstName: this.firstName, lastName: this.lastName }, process.env.JWTPRIVATEKEY, {
          expiresIn: "7d",
        });
        return token
        
      } catch (err) {
        // console.error("Error generating token:", err.message);
        throw new Error("Token generation failed.");
      }
      
};

const User = mongoose.model('User', userSchema);

module.exports = {User };