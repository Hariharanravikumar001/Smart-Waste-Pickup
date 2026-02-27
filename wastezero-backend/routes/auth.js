const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const Pickup = require('../models/Pickup');
const authMiddleware = require('../middleware/auth');

const JWT_SECRET = 'wastezero_secret_key_123!';

// --- NODEMAILER CONFIGURATION ---
// IMPORTANT: Replace the auth details below with your actual Gmail and App Password
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'YOUR_GMAIL_ADDRESS@gmail.com', // Replace this!
    pass: 'YOUR_GMAIL_APP_PASSWORD'       // Replace this! (Use a 16-character App Password, not your normal password)
  }
});
// --------------------------------

// POST /api/register
router.post('/register', async (req, res) => {
  try {
    const { name, username, email, password, role, location } = req.body;

    let user = await User.findOne({ email });
    if (user) {
      console.log('Registration failed: User already exists with email', email);
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    if (username) {
      let existingUsername = await User.findOne({ username });
      if (existingUsername) {
        console.log('Registration failed: Username already taken', username);
        return res.status(400).json({ message: 'Username already taken' });
      }
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      id: uuidv4(),
      name,
      username,
      email,
      password: hashedPassword,
      role: role || 'user',
      location
    });

    await user.save();
    
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Registration error:', err.message, err);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

// POST /api/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({
      $or: [
        { email: email },
        { username: email }
      ]
    });
    if (!user) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    jwt.sign(
      payload,
      JWT_SECRET,
      { expiresIn: '1h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token, role: user.role });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// POST /api/forgot-password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Email ID is not registered' });
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // In a real app, hash the OTP before saving. For simulation, storing plain text.
    user.resetOtp = otp;
    user.resetPasswordExpires = Date.now() + 600000; // 10 minutes

    await user.save();

    // Send the actual email
    const mailOptions = {
      from: '"WasteZero Support" <YOUR_GMAIL_ADDRESS@gmail.com>', // Replace with your email!
      to: user.email,
      subject: 'WasteZero - Your Password Reset OTP',
      text: `Hello,\n\nYou requested to reset your password. Here is your One-Time Password (OTP):\n\n${otp}\n\nThis OTP is valid for 10 minutes. If you did not request this, please ignore this email.\n\nThanks,\nThe WasteZero Team`,
      html: `
        <h3>Password Reset Request</h3>
        <p>Hello,</p>
        <p>You requested to reset your password. Here is your One-Time Password (OTP):</p>
        <h2 style="color: #4CAF50;">${otp}</h2>
        <p>This OTP is valid for <strong>10 minutes</strong>. If you did not request this, please ignore this email.</p>
        <br>
        <p>Thanks,<br>The WasteZero Team</p>
      `
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
        return res.status(500).json({ message: 'Error sending email. Please check server terminal.' });
      }
      console.log('OTP Email successfully sent: %s', info.messageId);
      res.json({ message: 'OTP sent successfully to your email' });
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// POST /api/verify-otp
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({
      email: email,
      resetOtp: otp,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired OTP.' });
    }

    // OTP is valid. Generate a temporary string token to securely allow password change.
    const tempResetToken = uuidv4();
    user.resetOtp = undefined; 
    // Store the temporary token in the resetOtp field temporarily to verify the next step
    user.resetOtp = tempResetToken; 
    user.resetPasswordExpires = Date.now() + 900000; // 15 mins to change password
    await user.save();

    res.json({ message: 'OTP verified successfully.', resetToken: tempResetToken });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// POST /api/reset-password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const user = await User.findOne({
      resetOtp: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Session expired or invalid. Please try resetting your password again.' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    user.resetOtp = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.json({ message: 'Password has been successfully reset' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// GET /api/admin/stats
router.get('/admin/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const activeVolunteers = await User.countDocuments({ role: 'volunteer' });
    
    // Total Recycled setup via Pickup model aggregation (sum of weight of completed pickups)
    const recycledResult = await Pickup.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, totalWeight: { $sum: '$weight' } } }
    ]);
    
    const totalWeight = recycledResult.length > 0 ? recycledResult[0].totalWeight : 0;
    const totalRecycled = `${totalWeight} kg`; 

    res.json({
      totalUsers,
      activeVolunteers,
      totalRecycled
    });
  } catch (err) {
    console.error('Error fetching admin stats:', err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// TEMPORARY SEED ROUTE: POST /api/pickups/seed
// Used to inject dummy aggregated pickup data for the Admin Dashboard to read
router.post('/pickups/seed', async (req, res) => {
  try {
    const mockPickups = [
      { userId: uuidv4(), volunteerId: 'volunteer_123', wasteType: 'Plastic', weight: 15, status: 'completed', scheduledDate: new Date() },
      { userId: uuidv4(), volunteerId: 'volunteer_123', wasteType: 'Organic', weight: 30, status: 'completed', scheduledDate: new Date() },
      { userId: uuidv4(), volunteerId: 'volunteer_123', wasteType: 'E-Waste', weight: 5, status: 'pending', scheduledDate: new Date() },
      { userId: uuidv4(), volunteerId: 'volunteer_123', wasteType: 'Paper', weight: 12, status: 'pending', scheduledDate: new Date() },
    ];
    await Pickup.insertMany(mockPickups);
    res.json({ message: 'Seed data added for Pickups. Volunteer should have 2 completed (45kg) and 2 pending.', data: mockPickups });
  } catch (err) {
    console.error('Seed error:', err);
    res.status(500).json({ message: 'Error seeding data' });
  }
});

// GET /api/user/stats
router.get('/user/stats', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const totalPickups = await Pickup.countDocuments({ userId });
    const pendingRequests = await Pickup.countDocuments({ userId, status: 'pending' });

    const recycledResult = await Pickup.aggregate([
      { $match: { userId, status: 'completed' } },
      { $group: { _id: null, totalWeight: { $sum: '$weight' } } }
    ]);

    const totalWeight = recycledResult.length > 0 ? recycledResult[0].totalWeight : 0;
    const wasteRecycled = `${totalWeight} kg`;

    res.json({
      totalPickups,
      pendingRequests,
      wasteRecycled
    });
  } catch (err) {
    console.error('Error fetching user stats:', err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// GET /api/volunteer/stats
router.get('/volunteer/stats', authMiddleware, async (req, res) => {
  try {
    const volunteerId = req.user.id; // From JWT

    const pickupsCompleted = await Pickup.countDocuments({ volunteerId, status: 'completed' });
    const activeTasks = await Pickup.countDocuments({ volunteerId, status: 'pending' });

    const recycledResult = await Pickup.aggregate([
      { $match: { volunteerId, status: 'completed' } },
      { $group: { _id: null, totalWeight: { $sum: '$weight' } } }
    ]);

    const totalWeight = recycledResult.length > 0 ? recycledResult[0].totalWeight : 0;
    const weightCollected = `${totalWeight} kg`;

    res.json({
      pickupsCompleted,
      activeTasks,
      weightCollected
    });
  } catch (err) {
    console.error('Error fetching volunteer stats:', err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// GET /api/user/profile
router.get('/user/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findOne({ id: req.user.id }).select('-password -resetOtp -resetPasswordExpires -_id -__v');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error('Error fetching profile:', err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// POST /api/user/profile (Update)
router.post('/user/profile', authMiddleware, async (req, res) => {
  try {
    const { name, username, email, location, avatar } = req.body;
    const userId = req.user.id;

    // Check if updating to an existing email (other than their own)
    if (email) {
      const emailExists = await User.findOne({ email, id: { $ne: userId } });
      if (emailExists) {
        return res.status(400).json({ message: 'Email is already in use by another account' });
      }
    }

    // Check if updating to an existing username (other than their own)
    if (username) {
      const usernameExists = await User.findOne({ username, id: { $ne: userId } });
      if (usernameExists) {
        return res.status(400).json({ message: 'Username is already taken' });
      }
    }

    const updatedUser = await User.findOneAndUpdate(
      { id: userId },
      { $set: { name, username, email, location, avatar } },
      { new: true, runValidators: true }
    ).select('-password -resetOtp -resetPasswordExpires -_id -__v');

    res.json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// POST /api/user/change-password-internal
router.post('/user/change-password-internal', authMiddleware, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.id;

    const user = await User.findOne({ id: userId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify old password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect old password' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error('Error changing password internally:', err);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
