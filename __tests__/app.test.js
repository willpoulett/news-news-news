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