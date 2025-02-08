const { test, describe } = require('node:test')
const assert = require('node:assert')
const listHelper = require('./list_helper')


//Global value to be used in all the tests below
const blogs = [
    {
      _id: '5a422aa71b54a676234d17f8',
      title: 'Go To Statement Considered Harmful',
      author: 'Edsger W. Dijkstra',
      url: 'https://homepages.cwi.nl/~storm/teaching/reader/Dijkstra68.pdf',
      likes: 5,
      __v: 0
    },
    {
        _id: '13103adkladkad',
        title: 'Silksong is the eternal promise',
        author: 'all gamers in the world',
        url: 'https://homepages.cwi.nl/~storm/teaching/reader/Dijkstra68.pdf',
        likes: 30,
        __v: 0
    },
    {
        _id: '13103adkladkadadd2',
        title: 'Silksong is the eternal promise 2',
        author: 'all gamers in the world 2',
        url: 'https://homepages.cwi.nl/~storm/teaching/reader/Dijkstra68.pdf',
        likes: 10,
        __v: 0
    }

]

//-----------------TESTS-------------------
test('dummy returns one', () => {
  const blogs = []
  const result = listHelper.dummy(blogs)
  assert.strictEqual(result, 1)
})

//Total likes tests
describe('total likes', () => {
    const listWithOneBlog = [
      {
        _id: '5a422aa71b54a676234d17f8',
        title: 'Go To Statement Considered Harmful',
        author: 'Edsger W. Dijkstra',
        url: 'https://homepages.cwi.nl/~storm/teaching/reader/Dijkstra68.pdf',
        likes: 5,
        __v: 0
      }
    ]
    test('when list has only one blog, equals the likes of that', () => {
      const result = listHelper.totalLikes(listWithOneBlog)
      assert.strictEqual(result, 5)
    })
    test('of a bigger list is calculated right', () => {
        const result = listHelper.totalLikes(blogs)
        assert.strictEqual(result, 45)
    })
    test('empty list', () => {
        const result = listHelper.totalLikes([])
        assert.strictEqual(result, 0)
    })
})

//favorite blogs tests
describe('Favorite blog', () => {
    test('3 blogs array with exclusived maximum likes', () => {
        const winningBlog = {
            _id: '13103adkladkad',
            title: 'Silksong is the eternal promise',
            author: 'all gamers in the world',
            url: 'https://homepages.cwi.nl/~storm/teaching/reader/Dijkstra68.pdf',
            likes: 30,
            __v: 0
        }
        const result = listHelper.favoriteBlog(blogs)
        assert.deepStrictEqual(result, winningBlog)
    })
    test('2 blogs array with the same likes', () => {
        const blogs = [
            {
                _id: '13103adkladkad',
                title: 'Silksong is the eternal promise',
                author: 'all gamers in the world',
                url: 'https://homepages.cwi.nl/~storm/teaching/reader/Dijkstra68.pdf',
                likes: 30,
                __v: 0
            },
            {
                _id: '13103adkladkad2',
                title: 'Silksong is the eternal promise 2',
                author: 'all gamers in the world 2',
                url: 'https://homepages.cwi.nl/~storm/teaching/reader/Dijkstra68.pdf',
                likes: 30,
                __v: 0
            }
        ]
        const winningBlog = {
            _id: '13103adkladkad2',
            title: 'Silksong is the eternal promise 2',
            author: 'all gamers in the world 2',
            url: 'https://homepages.cwi.nl/~storm/teaching/reader/Dijkstra68.pdf',
            likes: 30,
            __v: 0
        }
        const result = listHelper.favoriteBlog(blogs)
        assert.deepStrictEqual(result, winningBlog)
    })
    test('empty blogs array', () => {
        assert.throws(() => {
            listHelper.favoriteBlog([]);
        }, Error);   
    })
})

//most popular author
describe('author which appears most', () => {
    //bring the data from github with axios
    test('5 blogs array', async () => {
        const blogs = listHelper.initialBlogs
        const result = listHelper.mostOftenAuthor(blogs)
        assert.deepStrictEqual(result, {
                                        author: "Robert C. Martin",
                                        blogs: 3
                                        })
    });
    test('empty blogs array', () => {
        assert.throws(() => {
            listHelper.mostOftenAuthor([])
        }, Error);   
    })
})

describe('most popular author', () => {
    test('5 blogs array', () => {
        const blogs = listHelper.initialBlogs
        const result = listHelper.mostPopularAuthor(blogs)
        assert.deepStrictEqual(result,{author: "Edsger W. Dijkstra", likes: 17})
    })
    test('empty blogs array', () => {
        assert.throws(() => {
            listHelper.mostPopularAuthor([])
        }, Error);   
    })
})