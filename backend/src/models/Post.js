const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
  },
  { timestamps: true }
);

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    comments: [commentSchema],
  },
  { timestamps: true }
);

postSchema.index({ createdAt: -1 });

postSchema.methods.toFeedJSON = function toFeedJSON(currentUserId) {
  return {
    id: this._id,
    text: this.text,
    author: this.author && this.author.username
      ? { id: this.author._id, username: this.author.username }
      : this.author,
    likeCount: this.likes.length,
    likedByMe: currentUserId
      ? this.likes.some((id) => id.toString() === currentUserId.toString())
      : false,
    commentCount: this.comments.length,
    comments: this.comments
      .slice(-3)
      .map((c) => ({
        id: c._id,
        text: c.text,
        author:
          c.author && c.author.username
            ? { id: c.author._id, username: c.author.username }
            : c.author,
        createdAt: c.createdAt,
      })),
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model('Post', postSchema);
