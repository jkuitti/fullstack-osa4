const { dummy } = require('../utils/list_helper');

describe('Dummy', () => {
  test('returns one', () => {
    const blogs = [];

    const result = dummy(blogs);
    expect(result).toBe(1);
  });
});
