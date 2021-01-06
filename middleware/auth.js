const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = (req, res, next) => {
  const token = req.header('x-auth-token');

  if (!token) {
    res.status(401).json({
      errors: [{ msg: 'No auth token in headers!' }],
    });
  }

  try {
    const decoded = jwt.verify(token, config.get('JWT_SECRET'));

    req.user = decoded.user;

    next();
  } catch (err) {
    res.status(401).json({
      errors: [{ msg: 'Invalid auth token' }],
    });
  }
};
