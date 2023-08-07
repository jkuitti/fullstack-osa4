const { totalLikes } = require('../utils/list_helper');
const helper = require('./test_helper');

describe('Total likes', () => {
  test('when list has only one blog equals the likes of that', () => {
    const result = totalLikes(helper.listWithOneBlog);
    expect(result).toBe(5);
  });

  test('of empty list is zero', () => {
    const result = totalLikes([]);
    expect(result).toBe(0);
  });

  test('of a bigger list is calculated right', () => {
    const result = totalLikes(helper.initialBlogs);
    expect(result).toBe(36);
  });
});
