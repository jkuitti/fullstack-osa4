const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const helper = require('./test_helper');
const Blog = require('../models/blog');

const api = supertest(app);

beforeEach(async () => {
  await Blog.deleteMany({});

  await Blog.insertMany(helper.initialBlogs);
});

test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/);
});

test('all blogs are returned', async () => {
  const response = await api.get('/api/blogs');

  expect(response.body).toHaveLength(helper.initialBlogs.length);
});

test('blog indetification field is called id', async () => {
  const response = await api.get('/api/blogs');
  const blogs = response.body.map((r) => r);

  expect(blogs[0].id).toBeDefined();
});

test('a valid blog can be added ', async () => {
  const newBLog = {
    title: 'Async/Await',
    author: 'Michael Mayers',
    url: 'https://Await.com/',
    likes: 22,
  };

  await api
    .post('/api/blogs')
    .send(newBLog)
    .expect(201)
    .expect('Content-Type', /application\/json/);

  const blogsAtEnd = await helper.blogsInDb();
  expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1);

  const titles = blogsAtEnd.map((b) => b.title);
  expect(titles).toContain(
    'Async/Await',
  );
});

test('blog likes set to 0 if undefined', async () => {
  const newBLog = {
    title: 'Async/Await',
    author: 'Michael Mayers',
    url: 'https://Await.com/',
  };

  await api
    .post('/api/blogs')
    .send(newBLog)
    .expect(201)
    .expect('Content-Type', /application\/json/);

  const blogsAtEnd = await helper.blogsInDb();

  const addedBlog = blogsAtEnd.find((b) => b.title === 'Async/Await');
  expect(addedBlog.likes).toBe(0);
});
