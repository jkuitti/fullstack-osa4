const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const helper = require('./test_helper');
const Blog = require('../models/blog');
const { after } = require('lodash');

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

test('blog without title or url is not added', async () => {
  const newBLog = {
    title: 'Async/Await',
    author: 'Michael Mayers',
  };

  await api
    .post('/api/blogs')
    .send(newBLog)
    .expect(400);

  const blogsAtEnd = await helper.blogsInDb();
  expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length);
});

test('Deletion of a blog succeeds with status code 204 if id is valid', async () => {
  const blogsAtStart = await helper.blogsInDb();
  const blogToDelete = blogsAtStart[0];

  await api
    .delete(`/api/blogs/${blogToDelete.id}`)
    .expect(204);

  const blogsAtEnd = await helper.blogsInDb();

  expect(blogsAtEnd).toHaveLength(
    helper.initialBlogs.length - 1
  );

  const titles = blogsAtEnd.map((r) => r.title);

  expect(titles).not.toContain(blogToDelete.title);
});

test('blog can be updated if id is valid', async () => {
  const blogs = await helper.blogsInDb();
  const blogToUpdate = blogs[0];

  const newBlog = {
    title: 'React patterns',
    author: 'Michael Chan',
    url: 'https://reactpatterns.com/',
    likes: 88,
  };

  await api
    .put(`/api/blogs/${blogToUpdate.id}`)
    .send(newBlog)
    .expect(200);

  const updatedBlogs = await helper.blogsInDb();
  const updatedBlog = updatedBlogs[0];

  expect(updatedBlog.likes).toBe(88);
});

afterAll(async () => {
  await mongoose.connection.close();
});
