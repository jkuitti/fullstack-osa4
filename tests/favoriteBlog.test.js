const { favoriteBlog } = require('../utils/list_helper');
const helper = require('./test_helper');

describe('Favorite blog', () => {
  test('of list with many blogs', () => {
    const result = favoriteBlog(helper.initialBlogs);
    expect(result).toEqual({
      title: 'Canonical string reduction',
      author: 'Edsger W. Dijkstra',
      likes: 12,
    });
  });
});
