const Post = require('../models/Post');
const User = require('../models/User');
const sendNotification = require('../utils/sendNotification');

async function createPost(req, res) {
  try {
    const { text } = req.body;
    const post = await Post.create({ author: req.user._id, text });
    await post.populate('author', 'username');

    return res.status(201).json({ post: post.toFeedJSON(req.user._id) });
  } catch (err) {
    console.error('[posts] createPost error:', err);
    return res.status(500).json({ message: 'Failed to create post' });
  }
}

// GET /posts?page=1&limit=10&username=alice
async function getPosts(req, res) {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 50);
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.username) {
      const author = await User.findOne({ username: req.query.username.trim() });
      if (!author) {
        return res.json({ posts: [], page, limit, total: 0, totalPages: 0 });
      }
      filter.author = author._id;
    }

    const [posts, total] = await Promise.all([
      Post.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('author', 'username')
        .populate('comments.author', 'username'),
      Post.countDocuments(filter),
    ]);

    return res.json({
      posts: posts.map((p) => p.toFeedJSON(req.user._id)),
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error('[posts] getPosts error:', err);
    return res.status(500).json({ message: 'Failed to fetch posts' });
  }
}

// POST /posts/:id/like  -> toggles like/unlike
async function toggleLike(req, res) {
  try {
    const post = await Post.findById(req.params.id).populate('author', 'username fcmToken');
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const userId = req.user._id.toString();
    const alreadyLiked = post.likes.some((id) => id.toString() === userId);

    if (alreadyLiked) {
      post.likes = post.likes.filter((id) => id.toString() !== userId);
    } else {
      post.likes.push(req.user._id);
    }
    await post.save();

    if (!alreadyLiked && post.author._id.toString() !== userId) {
      sendNotification({
        token: post.author.fcmToken,
        title: 'New like',
        body: `${req.user.username} liked your post`,
        data: { type: 'like', postId: post._id.toString() },
      });
    }

    return res.json({
      liked: !alreadyLiked,
      likeCount: post.likes.length,
    });
  } catch (err) {
    console.error('[posts] toggleLike error:', err);
    return res.status(500).json({ message: 'Failed to toggle like' });
  }
}

// POST /posts/:id/comment
async function addComment(req, res) {
  try {
    const { text } = req.body;
    const post = await Post.findById(req.params.id).populate('author', 'username fcmToken');
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    post.comments.push({ author: req.user._id, text });
    await post.save();
    await post.populate('comments.author', 'username');

    const newComment = post.comments[post.comments.length - 1];

    if (post.author._id.toString() !== req.user._id.toString()) {
      sendNotification({
        token: post.author.fcmToken,
        title: 'New comment',
        body: `${req.user.username} commented: ${text.slice(0, 80)}`,
        data: { type: 'comment', postId: post._id.toString() },
      });
    }

    return res.status(201).json({
      comment: {
        id: newComment._id,
        text: newComment.text,
        author: { id: newComment.author._id, username: newComment.author.username },
        createdAt: newComment.createdAt,
      },
      commentCount: post.comments.length,
    });
  } catch (err) {
    console.error('[posts] addComment error:', err);
    return res.status(500).json({ message: 'Failed to add comment' });
  }
}

module.exports = { createPost, getPosts, toggleLike, addComment };
