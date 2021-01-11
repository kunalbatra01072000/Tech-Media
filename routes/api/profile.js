const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const Profile = require('../../model/Profile');
const User = require('../../model/User');
const { check, validationResult } = require('express-validator');
const request = require('request');
const config = require('config');

// @route GET api/profile/me
// @desc  Get current user's profile
// @access Private

router.get('/me', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.user.id,
    }).populate('user', ['name', 'avatar']);
    if (!profile) {
      return res.status(400).json({
        errors: [{ msg: 'There is no profile for the user' }],
      });
    }
    return res.json(profile);
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      errors: [{ msg: 'server error' }],
    });
  }
});

// @route POST api/profile/
// @desc  Create/Update user's profile
// @access Private
router.post(
  '/',
  [
    auth,
    [
      check('status', 'Status is required').not().isEmpty(),
      check('skills', 'Skills is required').not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      company,
      website,
      location,
      bio,
      status,
      githubusername,
      skills,
      youtube,
      instagram,
      linkedin,
      twitter,
      facebook,
    } = req.body;

    const profileFields = {};
    profileFields.user = req.user.id;
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (status) profileFields.status = status;
    if (githubusername) profileFields.githubusername = githubusername;

    if (skills) {
      console.log(skills);
      profileFields.skills = skills.split(',').map((skill) => skill.trim());
    }

    profileFields.social = {};
    if (twitter) profileFields.social.twitter = twitter;
    if (youtube) profileFields.social.youtube = youtube;
    if (facebook) profileFields.social.facebook = facebook;
    if (linkedin) profileFields.social.linkedin = linkedin;
    if (instagram) profileFields.social.instagram = instagram;

    try {
      let profile = await Profile.findOne({ user: req.user.id });
      if (profile) {
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        );
        return res.json(profile);
      }

      profile = new Profile(profileFields);
      await profile.save();
      return res.json(profile);
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        errors: [{ msg: 'server error' }],
      });
    }
  }
);

// @route GET api/profile/
// @desc  Get users profile
// @access Public

router.get('/', async (req, res) => {
  try {
    const profiles = await Profile.find().populate('user', ['name', 'avatar']);
    res.json(profiles);
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      errors: [{ msg: 'server error' }],
    });
  }
});

// @route GET api/profile/:userId
// @desc  Get a user profile
// @access Public

router.get('/:userId', async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.userId,
    }).populate('user', ['name', 'avatar']);

    if (!profile) {
      return res.status(400).json({
        errors: [{ msg: 'No such user exists' }],
      });
    }
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(400).json({
        errors: [{ msg: 'No such user exists' }],
      });
    }
    return res.status(500).json({
      errors: [{ msg: 'server error' }],
    });
  }
});

// @route DELETE api/profile/
// @desc  DELETE user, profile &posts
// @access Private

router.delete('/', auth, async (req, res) => {
  try {
    await Profile.findOneAndRemove({ user: req.user.id });
    await User.findOneAndRemove({ _id: req.user.id });

    res.json({ msg: 'User deleted' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      errors: [{ msg: 'server error' }],
    });
  }
});

module.exports = router;

// @route PUT api/profile/experience
// @desc  update experience
// @access Private

router.put(
  '/experience',
  [
    auth,
    [
      check('title', 'Please enter a title').exists(),
      check('company', 'Please enter the company name').exists(),
      check('from', 'Please enter the from date').exists(),
    ],
  ],
  async (req, res) => {
    const {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const profile = await Profile.findOne({ user: req.user.id });
      if (!profile) {
        return res.status(400).json({
          errors: [{ msg: 'No profile exists!' }],
        });
      }

      const newExp = {
        title,
        company,
        location,
        from,
        to,
        current,
        description,
      };
      if (!profile.experience) {
        profile.experience = [];
      }
      profile.experience.unshift(newExp);

      await profile.save();
      res.json(profile);
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        errors: [{ msg: 'server error' }],
      });
    }
  }
);

// @route DELETE api/profile/experience/:expId
// @desc  delete an experience
// @access Private

router.delete('/experience/:expId', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    profile.experience = profile.experience.filter(
      (exp) => exp._id.toString() !== req.params.expId
    );
    await profile.save();
    res.json(profile);
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      errors: [{ msg: 'server error' }],
    });
  }
});

// @route PUT api/profile/education
// @desc  update education
// @access Private

router.put(
  '/education',
  [
    auth,
    [
      check('school', 'Please enter the school name').exists(),
      check('degree', 'Please enter the degree').exists(),
      check('field', 'Please enter the field of study').exists(),
      check('from', 'Please enter the from date').exists(),
    ],
  ],
  async (req, res) => {
    const { school, degree, field, from, to, current, description } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const profile = await Profile.findOne({ user: req.user.id });
      if (!profile) {
        return res.status(400).json({
          errors: [{ msg: 'No profile exists!' }],
        });
      }
      const newEd = {
        school,
        degree,
        field,
        from,
        to,
        current,
        description,
      };
      profile.education.unshift(newEd);
      await profile.save();
      res.json(profile);
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        errors: [{ msg: 'server error' }],
      });
    }
  }
);

// @route DELETE api/profile/education/:edId
// @desc  delete an education
// @access Private

router.delete('/education/:edId', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    profile.education = profile.education.filter(
      (ed) => ed._id.toString() !== req.params.edId
    );
    await profile.save();
    res.json(profile);
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      errors: [{ msg: 'server error' }],
    });
  }
});

// @route GET api/profile/github/:username
// @desc  get user repos from Github
// @access Public

router.get('/github/:username', async (req, res) => {
  try {
    const options = {
      uri: `https://api.github.com/users/${
        req.params.username
      }/repos?per_page=5&sort=created:asc&client_id=${config.get(
        'GITHUB_CLIENT_ID'
      )}&client_secret=${config.get('GITHUB_CLIENT_SECRET')}`,
      method: 'GET',
      headers: { 'user-agent': 'node.js' },
    };

    request(options, (err, response, body) => {
      if (err) console.error(err);
      if (response.statusCode != 200) {
        return res.status(404).json({
          errors: [{ msg: 'No github profile with the username' }],
        });
      }
      res.json(JSON.parse(body));
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      errors: [{ msg: 'server error' }],
    });
  }
});

module.exports = router;
