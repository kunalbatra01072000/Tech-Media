const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');
const User = require('../../model/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');

// @route GET api/auth
// @desc  Test route
// @access Public
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    return res.json(user);
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      errors: [{ msg: 'Server error' }],
    });
  }
});

// @route POST api/auth
// @desc  Authenticate user and get token
// @access Public
router.post(
  '/',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password').exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }

    const { email, password } = req.body;

    try {
      let user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({
          errors: [{ msg: 'Invalid Credentials' }],
        });
      }

      const doesMatch = await bcrypt.compare(password, user.password);

      if (!doesMatch) {
        return res.status(400).json({
          errors: [{ msg: 'Invalid Credentials' }],
        });
      }

      const payload = {
        user: {
          id: user._id,
        },
      };

      jwt.sign(
        payload,
        config.get('JWT_SECRET'),
        {
          expiresIn: 360000,
        },
        (err, token) => {
          if (err) {
            throw errors;
          }
          res.json({ token });
        }
      );
    } catch (err) {
      res.status(500).json({
        errors: [{ msg: 'Server error' }],
      });
    }
  }
);

module.exports = router;
