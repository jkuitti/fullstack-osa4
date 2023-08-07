const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const helper = require('./test_helper');
const Blog = require('../models/blog');
const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')

const api = supertest(app);

beforeEach(async () => {
  await Blog.deleteMany({});

  await Blog.insertMany(helper.initialBlogs);
});
describe('When there initially some blogs saved', () => {
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
});

describe('Adding a new blog', () => {
  test('a valid blog can be added', async () => {
    const loginResponse = await api.post('/api/login').send({ username: 'root', password: 'sekret' });
    const { token } = loginResponse._body

    const newBLog = {
      title: 'Async/Await',
      author: 'Michael Mayers',
      url: 'https://Await.com/',
      likes: 22,
    };

    await api
      .post('/api/blogs')
      .auth(token, { type: 'bearer' })
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

  test('blog likes is set to 0 if undefined', async () => {
    const loginResponse = await api.post('/api/login').send({ username: 'root', password: 'sekret' });
    const { token } = loginResponse._body

    const newBLog = {
      title: 'Async/Await',
      author: 'Michael Mayers',
      url: 'https://Await.com/',
    };

    await api
      .post('/api/blogs')
      .auth(token, { type: 'bearer' })
      .send(newBLog)
      .expect(201)
      .expect('Content-Type', /application\/json/);

    const blogsAtEnd = await helper.blogsInDb();

    const addedBlog = blogsAtEnd.find((b) => b.title === 'Async/Await');
    expect(addedBlog.likes).toBe(0);
  });

  test('blog without title or url is not added', async () => {
    const loginResponse = await api.post('/api/login').send({ username: 'root', password: 'sekret' });
    const { token } = loginResponse._body

    const newBLog = {
      title: 'Async/Await',
      author: 'Michael Mayers',
    };

    await api
      .post('/api/blogs')
      .auth(token, { type: 'bearer' })
      .send(newBLog)
      .expect(400);

    const blogsAtEnd = await helper.blogsInDb();
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length);
  });

  test('without token fails with statuscode 401: Unauthorized', async () => {
    const newBLog = {
      title: 'Async/Await',
      author: 'Michael Mayers',
      url: 'https://Await.com/',
      likes: 22,
    };

    await api
      .post('/api/blogs')
      .send(newBLog)
      .expect(401)
      .expect('Content-Type', /application\/json/);

    const blogsAtEnd = await helper.blogsInDb();
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length);

    const titles = blogsAtEnd.map((b) => b.title);
    expect(titles).not.toContain(
      'Async/Await',
    );
  });
});

describe('Deleting or updating a blog', () => {
  test('Deletion of a blog succeeds if deleted by user who posted blog', async () => {
    const loginResponse = await api.post('/api/login').send({ username: 'root', password: 'sekret' });
    const { token } = loginResponse._body;

    await Blog.deleteMany({});

    const newBLog = {
      title: 'Async/Await',
      author: 'Michael Mayers',
      url: 'https://Await.com/',
      likes: 22,
    };

    await api
      .post('/api/blogs')
      .auth(token, { type: 'bearer' })
      .send(newBLog)
      .expect(201)
      .expect('Content-Type', /application\/json/);

    const blogsAtStart = await helper.blogsInDb();
    const blogToDelete = blogsAtStart[0];

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .auth(token, { type: 'bearer' })
      .expect(204);

    const blogsAtEnd = await helper.blogsInDb();
    expect(blogsAtEnd).toHaveLength(
      blogsAtStart.length - 1
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
});

describe('when there is initially one user at db', () => {
  beforeEach(async () => {
    await User.deleteMany({});

    const passwordHash = await bcrypt.hash('sekret', 10);
    const user = new User({ username: 'root', passwordHash });

    await user.save();
  });

  test('creation succeeds with a fresh username', async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: 'käyttäjä',
      name: 'uusi käyttäjä',
      password: 'salainen',
    };

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/);

    const usersAtEnd = await helper.usersInDb();
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1);

    const usernames = usersAtEnd.map((u) => u.username);
    expect(usernames).toContain(newUser.username);
  });

  test('user without valid data cannot be added to db', async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      name: 'uusi käyttäjä',
      password: 'salainen',
    };

    await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/);

    const usersAtEnd = await helper.usersInDb();
    expect(usersAtEnd).toHaveLength(usersAtStart.length);
  });

  test('passwords less than 3 characters fails with statuscode 400', async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: 'käyttäjä',
      name: 'uusi käyttäjä',
      password: 'ss',
    };

    await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/);

    const usersAtEnd = await helper.usersInDb();
    expect(usersAtEnd).toHaveLength(usersAtStart.length);
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});
