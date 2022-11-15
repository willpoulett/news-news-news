const request = require('supertest');
const app = require('../app.js');
const db = require('../db/connection.js');
const seed = require('../db/seeds/seed.js');
const testData = require('../db/data/test-data')


beforeAll(() => {
    return seed(testData);
})

afterAll(() => {
    return db.end()
})

describe('/api/topics', () => {
    describe('Functionality', () => {
        test('GET 200: responds with an array of topic objects', () => {
            return request(app)
            .get('/api/topics')
            .expect(200)
            .then( (res) => {
                expect(res.body.topics).toEqual(expect.any(Array))
                res.body.topics.forEach( (topic) => {
                    expect(topic).toMatchObject({
                        slug: expect.any(String),
                        description: expect.any(String)
                    });
                });
            });
        });
    });
    describe('Error handling', () => {
        test('Error 404: responds with error message', () => {
            return request(app)
            .get('/api/topicff')
            .expect(404)
            .then( (res) => {
                expect(res.body.msg).toBe('Not Found')
            })
        });
    });  
});

//-----------------------

describe('/api/articles', () => {
    describe('Functionality', () => {
        test('GET 200: responds with an array of article objects, with date sorted in descending order', () => {
            return request(app)
            .get('/api/articles')
            .expect(200)
            .then( (res) => {
                expect(res.body.articles).toEqual(expect.any(Array))
                expect(res.body.articles).toBeSortedBy('created_at', {descending: true})
                res.body.articles.forEach( (article) => {
                    expect(article).toMatchObject({
                        author: expect.any(String),
                        title: expect.any(String),
                        article_id: expect.any(Number),
                        topic: expect.any(String),
                        created_at: expect.any(String),
                        votes: expect.any(Number),
                        comment_count: expect.any(Number),
                    });
                });
            });
        });
    });

    describe('Error handling', () => {
        test('Error 404: responds with error message', () => {
            return request(app)
            .get('/api/articlesddss')
            .expect(404)
            .then( (res) => {
                expect(res.body.msg).toBe('Not Found')
            })
        });
    });  
});


describe('/api/articles/:article_Id', () => {
    describe('Functionality', () => {
        test('GET 200: returns the article with a given ID', () => {
            return request(app)
            .get('/api/articles/1')
            .expect(200)
            .then( (res) => {
                expect(res.body.article).toMatchObject({
                    article_id: 1,
                    title: 'Living in the shadow of a great man',
                    topic: 'mitch',
                    author: 'butter_bridge',
                    body: 'I find this existence challenging',
                    created_at: '2020-07-09T20:11:00.000Z',
                    votes: 100
                })
            })
        });
    });

    describe('Error handling', () => {
        test('Error 404: responds with error message when article Id doesnt exist', () => {
            return request(app)
            .get('/api/articles/12345')
            .expect(404)
            .then( (res) => {
                //console.log(res.body)
                expect(res.body.msg).toBe('That article does not exist')
            })
        });
        test('Error 404: responds with error message when article Id is not a number', () => {
            return request(app)
            .get('/api/articles/article')
            .expect(404)
            .then( (res) => {
                expect(res.body.msg).toBe('Invalid input syntax')
            })
        });
    });  
});