const express = require("express")
const {getTopics, getArticles, getArticleById, getCommentsByArticleId, postComment, patchArticleById, getUsers, deleteComment, getAPI} = require('./controllers/news_site.js')
const app = express()

app.use(express.json());

app.get('/api/topics',getTopics)//
app.get('/api/users',getUsers)//
app.get('/api/articles',getArticles)//
app.get('/api/articles/:articleId', getArticleById)//
app.get('/api/articles/:articleId/comments', getCommentsByArticleId)//
app.get('/api',getAPI)//

app.post('/api/articles/:articleId/comments', postComment)//

app.patch('/api/articles/:articleId', patchArticleById)//

app.delete('/api/comments/:comment_id', deleteComment)

app.get('/api/seed', (req,res) => {
  const seed = require('./db/seeds/seed.js')
  const data = require('./db/data/development-data/index.js')
  seed(data).then(()=>{
    res.send({msg: 'Hi! Welcome to my server!'})
  })
  
})

app.use((err,req,res,next) => {
    if (err.status === 404){
      res.status(404).send({msg:err.msg})
    } else {
        next(err)
    }
  })

  app.use((err,req,res,next) => {
    if (err.status === 401){
      res.status(401).send({msg:err.msg})
    } else {
        next(err)
    }
  })

  app.use((err,req,res,next) => {
    if (err.code === '22P02' || err.status === 400){
      res.status(400).send({msg:'Invalid input syntax'})
    } else {
        next(err)
    }
  })

  app.use((err,req,res,next) => {
    if (err.code === '42703' || err.status === 404){
      res.status(400).send({msg:'Topic does not exist'})
    } else {
        next(err)
    }
  })

app.all('/*', (req,res) => {
    res.status(404).send({msg:'Not Found'})
})
  
app.use((err, req, res, next) => {
    console.log(err)
    res.sendStatus(500).send({msg:err})
})

module.exports = app