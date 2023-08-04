const blogsRouter = require('express').Router();
const Blog = require('../models/blog');
const User = require('../models/user');

blogsRouter.get('/', async (request, response, next) => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 });
  response.json(blogs);
});

blogsRouter.post('/', async (request, response, next) => {
  const { body } = request;

  const users = await User.find({});

  const blog = new Blog({
    title: body.title,
    author: body.author,
    user: users[0]._id,
    url: body.url,
    likes: body.likes || 0,
  });

  const savedBlog = await blog.save();
  users[0].blogs = users[0].blogs.concat(savedBlog._id)
  await users[0].save()
  response.status(201).json(savedBlog);
});

blogsRouter.delete('/:id', async (request, response, next) => {
  await Blog.findByIdAndRemove(request.params.id);
  response.status(204).end();
});

blogsRouter.put('/:id', async (request, response, next) => {
  const { body } = request;

  const blog = {
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
  };

  await Blog.findByIdAndUpdate(request.params.id, blog, { new: true });
  response.json(blog);
});

module.exports = blogsRouter;
