const request = require('supertest');
const app = require('../app.js');
const db = require('../db/connection.js');
const seed = require('../db/seeds/seed.js');
const testData = require('../db/data/test-data')

afterAll(() => {
    return db.end()
})

beforeAll(() => {
    return seed(testData);
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
                    votes: 100,
                    comment_count: 11
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
        test('Error 404: responds with error message when user doesnt exist', () => {
            const newReview = {
                username: "user1",
                body: "this is a review for article 1"
            }
            return request(app)
            .post('/api/articles/1/comments')
            .send(newReview)
            .expect(404)
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

describe('/api/articles/:articleId', () => {
    describe('Functionality', () => {
        test('PATCH - 202: respond with updated vote count - positive increase', () => {
            const voteIncrease = {inc_votes: 100}
            return request(app)
            .patch('/api/articles/1')
            .send(voteIncrease)
            .expect(202)
            .then ((res) => {
                expect(res.body.article).toMatchObject({
                    article_id: 1,
                    title: 'Living in the shadow of a great man',
                    topic: 'mitch',
                    author: 'butter_bridge',
                    body: 'I find this existence challenging',
                    created_at: '2020-07-09T20:11:00.000Z',
                    votes: 200
                })
            })
        });
        test('PATCH - 202: respond with updated vote count - negative increase', () => {
            const voteIncrease = {inc_votes: -250}
            return request(app)
            .patch('/api/articles/1')
            .send(voteIncrease)
            .expect(202)
            .then ((res) => {
                expect(res.body.article).toMatchObject({
                    article_id: 1,
                    title: 'Living in the shadow of a great man',
                    topic: 'mitch',
                    author: 'butter_bridge',
                    body: 'I find this existence challenging',
                    created_at: '2020-07-09T20:11:00.000Z',
                    votes: -50
                })
            })
        });
        test('Error 404: responds with error message when article Id doesnt exist', () => {
            const voteIncrease = {inc_votes: -250}
            return request(app)
            .patch('/api/articles/1234')
            .send(voteIncrease)
            .expect(404)
            .then( (res) => {
                expect(res.body.msg).toBe('That article does not exist')
            })
        });
        test('Error 400: responds with error message when article Id is not a number', () => {
            const voteIncrease = {inc_votes: -250}
            return request(app)
            .patch('/api/articles/qwerty')
            .send(voteIncrease)
            .expect(400)
            .then( (res) => {
                expect(res.body.msg).toBe('Invalid input syntax')
            })
        });
        test('Error 400: responds with error message when vote increase body is not a number', () => {
            const voteIncrease = {inc_votes: 'string'}
            return request(app)
            .patch('/api/articles/1')
            .send(voteIncrease)
            .expect(400)
            .then( (res) => {
                expect(res.body.msg).toBe('Invalid input syntax')
            })
        });
        test('Error 400: responds with error message when vote increase body is empty', () => {
            const voteIncrease = {}
            return request(app)
            .patch('/api/articles/qwerty')
            .send(voteIncrease)
            .expect(400)
            .then( (res) => {
                expect(res.body.msg).toBe('Invalid input syntax')
            })
        });
    });
});

describe('/api/users', () => {
    describe('Functionality', () => {
        test('GET 200: responds with an array of user objects', () => {
            return request(app)
            .get('/api/users')
            .expect(200)
            .then( (res) => {
                expect(res.body.users).toEqual(expect.any(Array))
                res.body.users.forEach( (user) => {
                    expect(user).toMatchObject({
                        username: expect.any(String),
                        name: expect.any(String),
                        avatar_url: expect.any(String),
                    });
                });
            });
        });
    }); 
});

describe('/api/articles', () => {

    test('should filter by a topic', () => {
        return request(app)
        .get('/api/articles?topic=cats')
        .expect(200)
            .then( (res) => {
                res.body.articles.forEach( (article) => {
                    expect(article).toMatchObject({
                        author: expect.any(String),
                        title: expect.any(String),
                        article_id: expect.any(Number),
                        topic: 'cats',
                        created_at: expect.any(String),
                        votes: expect.any(Number),
                        comment_count: expect.any(Number),
                    });
                });
            });
        })
    
    test('should sort by a numerical topic, order by default descending', () => {
        return request(app)
        .get('/api/articles?topic=cats&sort_by=votes')
        .expect(200)
            .then( (res) => {
                expect(res.body.articles).toBeSortedBy('votes', {descending: true})
                res.body.articles.forEach( (article) => {
                    expect(article).toMatchObject({
                    author: expect.any(String),
                        title: expect.any(String),
                        article_id: expect.any(Number),
                        topic: 'cats',
                        created_at: expect.any(String),
                        votes: expect.any(Number),
                        comment_count: expect.any(Number),
                    });
                });
            });
        })

        test('should sort by a alphabetical topic, order by default descending', () => {
            return request(app)
            .get('/api/articles?sort_by=title')
            .expect(200)
                .then( (res) => {
                    expect(res.body.articles).toEqual(expect.any(Array))
                    expect(res.body.articles).toBeSortedBy('title', {descending: true})
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
            })
            
    test('should sort by a topic, and order ascending', () => {
        return request(app)
        .get('/api/articles?topic=cats&sort_by=votes&order=ASC')
        .expect(200)
            .then( (res) => {
                expect(res.body.articles).toEqual(expect.any(Array))
                expect(res.body.articles).toBeSortedBy('votes', {ascending: true})
                res.body.articles.forEach( (article) => {
                    expect(article).toMatchObject({
                    author: expect.any(String),
                        title: expect.any(String),
                        article_id: expect.any(Number),
                        topic: 'cats',
                        created_at: expect.any(String),
                        votes: expect.any(Number),
                        comment_count: expect.any(Number),
                    });
                });
            });
        })
    
    
    test('should sort by a topic, and order ascending', () => {
        return request(app)
        .get('/api/articles?topic=cats&sort_by=votes&order=ASC')
        .expect(200)
            .then( (res) => {
                expect(res.body.articles).toEqual(expect.any(Array))
                expect(res.body.articles).toBeSortedBy('votes', {ascending: true})
                res.body.articles.forEach( (article) => {
                    expect(article).toMatchObject({
                    author: expect.any(String),
                        title: expect.any(String),
                        article_id: expect.any(Number),
                        topic: 'cats',
                        created_at: expect.any(String),
                        votes: expect.any(Number),
                        comment_count: expect.any(Number),
                    });
                });
            });
        })
    
        test('should be safe from SQL injections', () => {
            return request(app)
            .get('/api/articles?sort_by=votes&order=ASC;something_bad')
            .expect(400)
            .then( (res) => {
                expect(res.body.msg).toBe('Invalid input syntax')
            })
        })

        test('should return error message when given invalid sort_by', () => {
            return request(app)
            .get('/api/articles?sort_by=voteZzz')
            .expect(400)
            .then( (res) => {
                expect(res.body.msg).toBe('Invalid input syntax')
            })
        })

        test('should return error message when given invalid order', () => {
            return request(app)
            .get('/api/articles?sort_by=votes&order=ascnddd')
            .expect(400)
            .then( (res) => {
                expect(res.body.msg).toBe('Invalid input syntax')
            })
        })

        test('should return [] given invalid topic', () => {
            return request(app)
            .get('/api/articles?topic=somethingBad')
            .expect(404)
            .then( (res) => {
                expect(res.body.msg).toBe('Article does not exist')
            })
        })

});

describe('/api/comments/comment_id', () => {
    test('DELETE 204: responds with empty response body', () => {
        return request(app)
        .delete('/api/comments/1')
        .expect(204)
    });
    test('DELETE 400: Responds with error message when wrong data type', () => {
        return request(app)
        .delete('/api/comments/jibberish')
        .expect(400)
        .then( (result) => {
            expect(result.body.msg).toBe('Invalid input syntax')
        })
    })
    test('DELETE 404: Responds with error message when non existant ID', () => {
        return request(app)
        .delete('/api/comments/1234')
        .expect(404)
        .then( (result) => {
            expect(result.body.msg).toBe("That comment does not exist")
        })
    })
});

describe('/api', () => {
    test('GET 200 - returns an object of endpoints ', () => {
        return request(app)
        .get('/api')
        .expect(200)
        .then( (result) => {
            expect(Object.keys(result.body.endPoints)).toEqual(
                [
                    'GET /api',
                    'GET /api/topics',
                    'GET /api/articles',
                    'GET api/users',
                    'GET /api/articles/article_id',
                    'GET /api/articles/article_id/comments',
                    'POST /api/articles/article_id/comments',
                    'PATCH /api/articles/article_id',
                    'DELETE /api/comments/comment_id'
                  ]
            )

              })
        })
    });

