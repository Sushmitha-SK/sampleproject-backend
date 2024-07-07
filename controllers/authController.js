// backend/controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

require('dotenv').config();

const authController = {

    register: async (req, res) => {
        const { username, email, password, contactNo, firstName, lastName } = req.body;
        try {
            let user = await User.findOne({ email });

            if (user) {
                return res.status(400).json({ msg: 'User already exists' });
            }
            user = new User({
                username,
                email,
                password,
                contactNo,
                firstName,
                lastName,
            });
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
            await user.save();
            const payload = {
                user: {
                    id: user.id,
                },
            };

            jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 3600 }, (err, token) => {
                if (err) throw err;
                res.json({
                    userId: user.id,
                    username: user.username,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    token,
                });
            });
        } catch (error) {
            console.error(`Error: ${error.message}`);
            res.status(500).send('Server Error');
        }
    },

    login: async (req, res) => {
        const { email, password } = req.body;
        try {
            let user = await User.findOne({ email });
            if (!user) {
                return res.status(400).json({ msg: 'Invalid credentials' });
            }
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ msg: 'Invalid credentials' });
            }
            const payload = {
                user: {
                    id: user.id,
                },
            };

            jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 3600 }, (err, token) => {
                if (err) throw err;
                res.json({
                    userId: user.id,
                    username: user.username,
                    email: user.email,
                    token,
                });
            });
        } catch (error) {
            console.error(`Error: ${error.message}`);
            res.status(500).send('Server Error');
        }
    },

    getUserDetails: async (req, res) => {
        const userId = req.params.userId;

        try {
            console.log(`Fetching details for userId: ${userId}`);
            const user = await User.findById(userId);

            if (!user) {
                return res.status(404).json({ msg: 'User not found' });
            }
            const userDetails = {
                userId: user.id,
                username: user.username,
                email: user.email,
                contactNo: user.contactNo,

            };
            console.log(`User details found: ${JSON.stringify(userDetails)}`);
            res.json(userDetails);
        } catch (error) {
            console.error(`Error fetching user details: ${error.message}`);
            res.status(500).send('Server Error');
        }
    },


    forgotPassword: async (req, res) => {
        const { email } = req.body;
        try {
            const user = await User.findOne({ email });

            if (!user) {
                return res.status(404).json({ msg: 'User not found' });
            }
            const resetToken = crypto.randomBytes(20).toString('hex');
            user.resetPasswordToken = resetToken;
            user.resetPasswordExpires = Date.now() + (1 * 60 * 60 * 1000); // 1 hour validity
            await user.save();

            
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USERNAME,
                    pass: process.env.EMAIL_PASSWORD,
                },
            });

            const mailOptions = {
                from: process.env.EMAIL_USERNAME,
                to: user.email,
                subject: 'Password Reset Link',
                text: `You are receiving this email because you (or someone else) has requested the reset of the password for your account.\n\n`
                    + `Please click on the following link, or paste this into your browser to complete the process:\n\n`
                    + `http://localhost:3000/changepassword/${resetToken}\n\n`
                    + `If you did not request this, please ignore this email and your password will remain unchanged.\n`,
            };

            await transporter.sendMail(mailOptions);

            res.json({ msg: 'Password reset link sent to your email' });
        } catch (error) {
            console.error(`Error: ${error.message}`);
            res.status(500).send('Server Error');
        }
    },

    resetPassword: async (req, res) => {
        const resetToken = req.params.resetToken;
        const { newPassword } = req.body;
        try {
            const user = await User.findOne({
                resetPasswordToken: resetToken,
                resetPasswordExpires: { $gt: Date.now() },
            });

            if (!user) {
                return res.status(400).json({ msg: 'Invalid or expired reset token' });
            }
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            await user.save();
            res.json({ msg: 'Password reset successful' });
        } catch (error) {
            console.error(`Error: ${error.message}`);
            res.status(500).send('Server Error');
        }
    },

};

module.exports = authController;
