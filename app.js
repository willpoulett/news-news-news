const express = require("express")
const {getTopics, getArticles} = require('./controllers/news_site.js')
const app = express()
app.get('/api/topics',getTopics)

app.get('/api/articles',getArticles)



app.all('/*', (req,res) => {
    res.status(404).send({msg:'Not Found'})
})
  
app.use((err, req, res, next) => {
    res.sendStatus(500)
})
module.exports = app