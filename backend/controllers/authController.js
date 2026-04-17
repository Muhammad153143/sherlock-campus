const jwt = require('jsonwebtoken');
const User = require('../models/User');
const crypto = require('crypto');
const sendEmail = require('../utils/emailService');

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

// @desc    Register new user
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = async (req, res) => {
    const { name, email, username, password } = req.body;

    try {
        const userExists = await User.findOne({
            $or: [{ email }, { username }]
        });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({
            name,
            email,
            username,   // ✅ ADD THIS
            password
        });

        // Send Welcome Email
            await sendEmail({
        email: user.email,
        subject: ' Welcome to SherLock - Your Smart Lost & Found Partner',
        htmlContent: `
        <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 20px;">
            <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 10px; padding: 20px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
                
                <h2 style="color: #2c3e50; text-align: center;">Welcome to SherLock 🔍</h2>
                
                <p style="font-size: 16px; color: #333;">
                    Hi <strong>${user.name}</strong>,
                </p>

                <p style="font-size: 15px; color: #555;">
                    We're excited to have you onboard! Your account has been successfully created.
                </p>

                <p style="font-size: 15px; color: #555;">
                    With SherLock, you can:
                </p>

                <ul style="color: #555; font-size: 14px;">
                    <li>📌 Report lost or found items easily</li>
                    <li>🤖 Get AI-powered match suggestions</li>
                    <li>💬 Chat with users in real-time</li>
                    <li>🔔 Receive instant notifications</li>
                </ul>

                

                

                <p style="font-size: 14px; color: #333;">
                    Best regards,<br>
                    <strong>SherLock Team</strong>
                </p>

                <hr style="margin: 25px 0; border: none; border-top: 1px solid #ddd;" />

                  <p style="text-align: center; font-size: 12px; color: #888;">
                    This is an automated message. Please do not reply.<br>
                    © 2026 SherLock. All rights reserved.
                </p>
            </div>
        </div>
        `
    });
        } catch (emailError) {
            console.error('Error sending welcome email:', emailError);
            // Don't fail registration if email fails
        }

        res.status(201).json({
            _id: user._id,
            name: user.name,
            username: user.username,
            email: user.email,
            role: user.role,
            token: generateToken(user._id)
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Authenticate a user
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = async (req, res) => {
    const { email, username, password } = req.body;

    // Allow login with either email or username
    const loginIdentity = email || username;

    if (!loginIdentity || !password) {
        return res.status(400).json({ message: 'Please provide email/username and password' });
    }

    try {
        // Check for user by email OR username
        const user = await User.findOne({
            $or: [{ email: loginIdentity }, { username: loginIdentity }]
        }).select('+password');

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                username: user.username,
                email: user.email,
                role: user.role,
                token: generateToken(user._id)
            });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user data
// @route   GET /api/v1/auth/me
// @access  Private
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Forgot Password
// @route   POST /api/v1/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User not found with this email" });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');

        // Hash and set to resetPasswordToken field
        user.resetPasswordToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');

        // Set expire
        user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minutes

        await user.save({ validateBeforeSave: false });

        // Create reset url
        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5000'}/reset-password.html?token=${resetToken}`;

        const htmlContent = `
            <h1>You have requested a password reset</h1>
            <p>Please click the link below to reset your password:</p>
            <a href="${resetUrl}" clicktracking=off>${resetUrl}</a>
            <p>This link will expire in 15 minutes.</p>
            <p>If you did not request this, please ignore this email.</p>
        `;

        try {
            await sendEmail({
                email: user.email,
                subject: 'Reset Your Password',
                htmlContent
            });

            res.status(200).json({ success: true, message: 'Email sent' });
        } catch (err) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;

            await user.save({ validateBeforeSave: false });

            return res.status(500).json({ message: "Email could not be sent" });
        }

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Reset Password
// @route   POST /api/v1/auth/reset-password/:token
// @access  Public
exports.resetPassword = async (req, res) => {
    try {
        const hashedToken = crypto
            .createHash("sha256")
            .update(req.params.token)
            .digest("hex");

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                message: "Invalid or expired token"
            });
        }

        // Set new password
        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        res.status(200).json({
            success: true,
            message: "Password reset successful"
        });

    } catch (error) {
        console.error("Reset Password Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};
