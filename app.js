const express = require("express")
const {getTopics, getArticles, getArticleById} = require('./controllers/news_site.js')
const app = express()
app.get('/api/topics',getTopics)

app.get('/api/articles',getArticles)
app.get('/api/articles/:articleId', getArticleById)

app.use((err,req,res,next) => {
    if (err.status === 404){
      res.status(404).send({msg:err.msg})
    } else {
        next(err)
    }
  })

  app.use((err,req,res,next) => {
    if (err.code === '22P02'){
        console.log(err.error)
      res.status(404).send({msg:'Invalid input syntax'})
    } else {
        next(err)
    }
  })

app.all('/*', (req,res) => {
    res.status(404).send({msg:'Not Found'})
})
  
app.use((err, req, res, next) => {
    console.log(err)
    res.sendStatus(500)
})
module.exports = app