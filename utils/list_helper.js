const _ = require('lodash');

const dummy = (blogs) => 1;

const totalLikes = (blogs) => blogs.reduce((sum, blog) => sum + blog.likes, 0);

const favoriteBlog = (blogs) => {
  const favorite = {
    title: String,
    author: String,
    likes: 0,
  };

  blogs.map((blog) => {
    if (blog.likes > favorite.likes) {
      favorite.title = blog.title;
      favorite.author = blog.author;
      favorite.likes = blog.likes;
    }
  });

  return favorite;
};

const mostBlogs = (blogs) => {
  const authorWithMostBlogs = _.max(Object.entries(_.countBy(blogs.map((blog) => blog.author))));
  return ({
    author: authorWithMostBlogs[0],
    blogs: authorWithMostBlogs[1],
  });
};

module.exports = {
  dummy, totalLikes, favoriteBlog, mostBlogs,
};
