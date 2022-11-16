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
                expect(res.body.msg).toBe('That article does not exist')
            })
        });
        test('Error 400: responds with error message when article Id is not a number', () => {
            return request(app)
            .get('/api/articles/article')
            .expect(400)
            .then( (res) => {
                expect(res.body.msg).toBe('Invalid input syntax')
            })
        });
    });  
});

describe('/api/articles/:article_id/comments', () => {
    describe('Functionality', () => {
        test('GET 200: responds with an array of comment objects, with date sorted in descending order', () => {
            return request(app)
            .get('/api/articles/1/comments')
            .expect(200)
            .then( (res) => {
                expect(res.body.comments).toEqual(expect.any(Array))
                expect(res.body.comments).toBeSortedBy('created_at', {descending: true})
                res.body.comments.forEach( (comment) => {
                    expect(comment).toMatchObject({
                        comment_id: expect.any(Number),
                        votes: expect.any(Number),
                        created_at: expect.any(String),
                        author: expect.any(String),
                        body: expect.any(String),
                    });
                });
            });
        });
    });

    describe('Error handling', () => {
        test('Error 404: responds with error message when article Id doesnt exist', () => {
            return request(app)
            .get('/api/articles/12345/comments')
            //.expect(404)
            .then( (res) => {
                expect(res.body.msg).toBe('That article does not exist')
            })
        });
        test('Error 400: responds with error message when article Id is not a number', () => {
            return request(app)
            .get('/api/articles/article/comments')
            .expect(400)
            .then( (res) => {
                expect(res.body.msg).toBe('Invalid input syntax')
            })
        });
        test('responds with empty array when no comments exist', () => {
            return request(app)
            .get('/api/articles/2/comments')
            .expect(200)
            .then( (res) => {
                expect(res.body).toEqual({comments: []})
            })
        });
    });  

    
});

describe('/api/articles/:article_id/comments', () => {
    describe('Functionality', () => {
        test('POST 201: post a new comment', () => {
            const newReview = {
                username: "butter_bridge",
                body: "this is a review for article 1"
            }
            return request(app)
            .post('/api/articles/1/comments')
            .send(newReview)
            .expect(201)
            .then( (result) => {
                expect(result.body.comment).toMatchObject({
                    comment_id: expect.any(Number),
                    votes: 0,
                    created_at: expect.any(String),
                    author: "butter_bridge",
                    body: "this is a review for article 1",
                    article_id: 1
                })
            })
        });  
    });
    describe('Error handling', () => {
        test('Error 401: responds with error message when user doesnt exist', () => {
            const newReview = {
                username: "user1",
                body: "this is a review for article 1"
            }
            return request(app)
            .post('/api/articles/1/comments')
            .send(newReview)
            .expect(401)
            .then( (res) => {
                expect(res.body.msg).toBe('User does not exist')
            })
        });
        test('Error 404: responds with error message when article Id doesnt exist', () => {
            const newReview = {
                username: "butter_bridge",
                body: "this is a review for article 12345"
            }
            return request(app)
            .post('/api/articles/12345/comments')
            .send(newReview)
            .expect(404)
            .then( (res) => {
                expect(res.body.msg).toBe('That article does not exist')
            })
        });
        test('Error 400: responds with error message when article Id is not a number', () => {
            const newReview = {
                username: "butter_bridge",
                body: "this is a review for article 'string'"
            }
            return request(app)
            .post('/api/articles/string/comments')
            .send(newReview)
            .expect(400)
            .then( (res) => {
                expect(res.body.msg).toBe('Invalid input syntax')
            })
        });
        test('Error 400: responds with error message when body has undefinded and null fields', () => {
            const newReview = {
                username: undefined,
                body: null
            }
            return request(app)
            .post('/api/articles/1/comments')
            .send(newReview)
            .expect(400)
            .then( (res) => {
                expect(res.body.msg).toBe('Invalid input syntax')
            })
        });
    });  
});

