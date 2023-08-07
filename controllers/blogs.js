const blogsRouter = require('express').Router();
const Blog = require('../models/blog');
const { userExtractor, tokenExtractor } = require('../utils/middleware');

blogsRouter.get('/', async (request, response, next) => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 });
  response.json(blogs);
});

blogsRouter.post('/', tokenExtractor, userExtractor, async (request, response, next) => {
  const { body, user } = request;

  const blog = new Blog({
    title: body.title,
    author: body.author,
    user: user._id,
    url: body.url,
    likes: body.likes || 0,
  });

  const savedBlog = await blog.save();
  user.blogs = user.blogs.concat(savedBlog._id);
  await user.save();
  response.status(201).json(savedBlog);
});

blogsRouter.delete('/:id', tokenExtractor, userExtractor, async (request, response, next) => {
  const { user } = request;

  const blog = await Blog.findById(request.params.id);

  if (user._id.toString() === blog.user.toString()) {
    await Blog.findByIdAndRemove(request.params.id);
    response.status(204).end();
  } else {
    response.status(401).json({ error: 'unauthorised delete attempt' });
  }
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
