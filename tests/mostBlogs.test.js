const { mostBlogs } = require('../utils/list_helper');
const helper = require('./test_helper');

describe('Most blogs', () => (
  test('written by author', () => {
    const result = mostBlogs(helper.initialBlogs);
    expect(result).toEqual({
      author: 'Robert C. Martin',
      blogs: 3,
    });
  })
));
