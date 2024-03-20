const { validationResult } = require('express-validator');
const { User } = require('../models/user');
const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const { Token } = require('../models/token');
// const mailSender = require('../helpers/email_sender');

exports.register = async function (req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error) => ({
      field: error.path,
      message: error.msg,
    }));
    return res.status(400).json({ errors: errorMessages });
  }
  try {
    let user = new User({
      ...req.body,
      passwordHash: bcrypt.hashSync(req.body.password, 8),
    });

    user = await user.save();
    if (!user) {
      return res.status(500).json({
        type: 'Internal Server Error',
        message: 'Could not create a new user',
      });
    }

    return res.status(201).json(user);
  } catch (error) {
    console.error(error);
    if (error.message.includes('email_1 dup key')) {
      return res.status(409).json({
        type: 'AuthError',
        message: 'User with that email already exists.',
      });
    }
    return res.status(500).json({ type: error.name, message: error.message });
  }
};

