const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');
const User = require('../../model/User');
const Profile = require('../../model/Profile');
const Post = require('../../model/Post');

// @route POST api/posts
// @desc  Create route
// @access Private
router.post(
  '/',
  [auth, [check('text', 'Text is required').not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user.id).select('-password');
      const newPost = {
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
        likes: [],
        comments: [],
      };

      const post = new Post(newPost);
      await post.save();
      res.json(post);
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        errors: [{ msg: 'server error' }],
      });
    }
  }
);

// @route GET api/posts
// @desc  Get all posts
// @access Private
router.get('/', auth, async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1 });
    res.json(posts);
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      errors: [{ msg: 'server error' }],
    });
  }
});

// @route GET api/posts/:postId
// @desc  Get one posts
// @access Private

router.get('/:postId', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({
        errors: [{ msg: 'No post found' }],
      });
    }
    res.json(post);
  } catch (err) {
    console.error(err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({
        errors: [{ msg: 'No post found' }],
      });
    }
    return res.status(500).json({
      errors: [{ msg: 'server error' }],
    });
  }
});

// @route DELETE api/posts/:postId
// @desc  Delete one posts
// @access Private

router.delete('/:postId', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({
        errors: [{ msg: 'No post found' }],
      });
    }
    if (post.user.toString() !== req.user.id.toString()) {
      return res.status(401).json({ errors: [{ msg: 'User not authorized' }] });
    }
    await post.remove();
    return res.json({
      msg: 'Post removed ',
    });
  } catch (err) {
    console.error(err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({
        errors: [{ msg: 'No post found' }],
      });
    }
    return res.status(500).json({
      errors: [{ msg: 'server error' }],
    });
  }
});

// @route PUT api/posts/like/:postId
// @desc Like a posts
// @access Private

router.put('/like/:postId', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({
        errors: [{ msg: 'No post found' }],
      });
    }
    if (
      post.likes.filter((like) => like.user.toString() === req.user.id).length >
      0
    ) {
      return res.status(400).json({
        errors: [{ msg: 'Post already liked' }],
      });
    }
    post.likes.unshift({ user: req.user.id });
    await post.save();
    res.json(post.likes);
  } catch (err) {
    console.error(err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({
        errors: [{ msg: 'No post found' }],
      });
    }
    return res.status(500).json({
      errors: [{ msg: 'server error' }],
    });
  }
});

// @route PUT api/posts/unlike/:postId
// @desc Unlike a posts
// @access Private

router.put('/unlike/:postId', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({
        errors: [{ msg: 'No post found' }],
      });
    }
    if (
      post.likes.filter((like) => like.user.toString() === req.user.id)
        .length === 0
    ) {
      return res.status(400).json({
        errors: [{ msg: 'Post is not liked' }],
      });
    }
    post.likes = post.likes.filter(
      (like) => like.user.toString() !== req.user.id
    );
    await post.save();
    res.json(post.likes);
  } catch (err) {
    console.error(err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({
        errors: [{ msg: 'No post found' }],
      });
    }
    return res.status(500).json({
      errors: [{ msg: 'server error' }],
    });
  }
});

// @route PUT api/posts/comment/:postId
// @desc  Create comment under a post
// @access Private
router.put(
  '/comment/:postId',
  [auth, [check('text', 'Text is required').not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user.id).select('-password');
      const post = await Post.findById(req.params.postId);
      const newComment = {
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      };

      post.comments.unshift(newComment);

      await post.save();
      res.json(post.comments);
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        errors: [{ msg: 'server error' }],
      });
    }
  }
);

// @route PUT api/posts/comment/:postId/:commentId
// @desc  Delete a comment under a post
// @access Private
router.put('/comment/:postId/:commentId', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res
        .status(400)
        .json({ errors: [{ msg: 'Post does not exists' }] });
    }

    comment = post.comments.find(
      (comm) => comm._id.toString() === req.params.commentId.toString()
    );

    if (!comment) {
      return res
        .status(400)
        .json({ errors: [{ msg: 'Comment does not exists' }] });
    } else if (comment.user.toString() !== req.user.id) {
      return res.status(401).json({ errors: [{ msg: 'User unauthorized' }] });
    }

    post.comments = post.comments.filter(
      (comm) => comm._id.toString() !== req.params.commentId
    );

    await post.save();
    res.json(post.comments);
  } catch (err) {
    console.error(err);
    if (err.kind === 'ObjectId') {
      return res.status(500).json({
        errors: [{ msg: 'Invalid post/comment id' }],
      });
    }
    return res.status(500).json({
      errors: [{ msg: 'server error' }],
    });
  }
});

module.exports = router;
