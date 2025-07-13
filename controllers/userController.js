const {User} = require('../models/userModel');
const bcrypt = require('bcrypt');
const joi = require('joi');
const passwordComplexity = require('joi-password-complexity');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

exports.signUp = async(req,res) =>{
    try {
        const{error} = signUpValidate(req.body);
        if(error){
            return res.status(400).send({message: error.details[0].message});
        }

        const user = await User.findOne({email: req.body.email});
        if(user){
            return res.status(409).send({message: "User with given Email already exists!"});
        }
        const salt = await bcrypt.genSalt(Number(process.env.SALT));
        const hashPassword = await bcrypt.hash(req.body.password, salt);
        
        await new User({...req.body, password: hashPassword}).save();
        res.status(201).send({message: "User created succesfully"});
    } catch (error) {
        // console.error("Error in sign up:", error.message);
        res.status(500).send({message: "Internal server error"})
    }
};

const signUpValidate = (data) =>{
    const schema = joi.object({
        firstName: joi.string().required().label("First Name"),
        lastName: joi.string().required().label("Last Name"),
        email: joi.string().email().required().label("Email"),
        password: passwordComplexity().required().label("password")
    });
    return schema.validate(data);
};

exports.SignIn = async(req,res) => {
    try {
        const {error} = signInValidate(req.body);

        if(error){
            res.status(400).send({message: error.details[0].message});
        }

        const user = await User.findOne({email: req.body.email});
        if(!user){
            return res.status(401).send({message: "Invalid email or password"});
        }

        const validPassword = await bcrypt.compare(req.body.password, user.password);
        if(!validPassword){
            return res.status(401).send({message: "Invalid email or password"});
        }

        const token = user.generateAuthToken();
        res.status(200).send({ token, message: "logged in successfully!"});

    } catch (error) {
        // console.error("Error in signin:", error.message);
        res.status(500).send({message: "Internal server error"});
    }
};

const signInValidate = (data) =>{
    const schema = joi.object({
        email: joi.string().email().required().label("Email"),
        password: joi.string().required().label("Password")
    })
    return schema.validate(data);
};

exports.forgotPassword = async (req,res) =>{
    try{
        const { email, redirectUrl } = req.body;
        const user = await User.findOne({email});
        if(!user){
            res.status(404).send({message: "User not found!"});
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetPasswordExpires = Date.now() + 15*60*1000;

        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = resetPasswordExpires;
        await user.save();

        const resetUrl = `${redirectUrl}/reset-password/${resetToken}`;

        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465, 
            secure: true,
            auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAIL_PASSWORD
            },
            requireTLS: true,
        })
        
        // console.log(`Using email: ${process.env.EMAIL}`);

        const mailOptions = {
            from: 'todomailer784@gmail.com',
            to: user.email,
            subject: 'Password Reset',
            text: `You requested a password reset. Please click on th e link to reset your password: \n\n ${resetUrl}`,
        }

        // console.log('Reset URL:', resetUrl);

        await transporter.sendMail(mailOptions);

        res.status(200).send({message: "Password reset link sent!"});

    }catch(error){
        // console.error("Error in forgot password:", error.message);
        // console.log("Error in forgot password:", error.message);
        res.status(500).send({message: "Internal server error"});
    }
};

exports.validateResetToken = async (req, res) => {
    try {
        const user = await User.findOne({
            resetPasswordToken: req.params.token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).send({ message: "Invalid or expired token!" });
        }
        // console.log("User:",user);

        res.status(200).send({ message: "Token is valid, proceed to reset password." });
    } catch (error) {
        // console.error("Error in validate reset token:", error.message);
        // console.log("Error in validate reset token:", error.message);
        res.status(500).send({ message: "Internal server error" });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const user =  await User.findOne({
            resetPasswordToken: req.params.token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        // console.log("Token in request:", req.params.token);
        // console.log("User found:", user);
        // console.log("Reset token in DB:", user?.resetPasswordToken);
        // console.log("Reset expiration in DB:", user?.resetPasswordExpires);

        if(!user){
            return res.status(400).send({message: "Invald or Expired token!"});
        }
        // console.log("Users",user);
        
        const salt = await bcrypt.genSalt(Number(process.env.SALT));
        const hashPassword = await bcrypt.hash(req.body.password, salt);

        user.password = hashPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        res.status(200).send({message: "Password reset Successfully!"});
    } catch (error) {
        // console.error("Error in reset password:", error.message);
        // console.log("Error in reset password:", error.message);
        res.status(500).send({message: "Internal server error"});
    }
};