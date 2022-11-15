const db = require('../db/connection.js');

exports.fetchTopics = () => {
    return db.query(`
    SELECT * FROM topics;`
    )
    .then((res) => {
      return res.rows;
      });
}

exports.fetchArticles = () => {
  return db.query(`
  SELECT articles.author,
  articles.title,
  articles.article_id,
  articles.topic,
  articles.created_at,
  articles.votes,
  COUNT(comments.article_id) AS comment_count
  FROM articles
  JOIN comments
  ON articles.article_id = comments.article_id
  GROUP By articles.author,
  articles.title,
  articles.article_id,
  articles.topic,
  articles.created_at,
  articles.votes
  ORDER BY articles.created_at DESC
  ;
`
  )
  .then((res) => {
    return res.rows;
    });
}
