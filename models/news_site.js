const db = require('../db/connection.js');
const {articleIsReal, userExists, commentExists} = require('../utility-funtions.js')

exports.fetchTopics = () => {
    return db.query(`
    SELECT * FROM topics;`
    )
    .then((res) => {
      return res.rows;
      });
}

exports.fetchArticles = (sort_by = 'created_at', order = 'DESC', topic) => {
  
  const validColumns= ['title','votes','topic','author','body','created_at']
  const validOrders = ['ASC','DESC']
  const queryValues = []

  if (!validColumns.includes(sort_by)){
      return Promise.reject({status: 400, msg: 'Invalid input syntax'})
  } else if (!validOrders.includes(order)) {
      return Promise.reject({status: 400, msg: 'Invalid input syntax'})
  }


  let query = `SELECT articles.author,
  articles.title,
  articles.article_id,
  articles.topic,
  articles.created_at,
  articles.votes,
  COUNT(comments.article_id)::INT AS comment_count
  FROM articles
  JOIN comments
  ON articles.article_id = comments.article_id
  `

  if (topic){
      query += ` WHERE topic = $1`
      queryValues.push(topic)
  }
  query += `GROUP By articles.author,
  articles.title,
  articles.article_id,
  articles.topic,
  articles.created_at,
  articles.votes
  ORDER BY articles.${sort_by} ${order};`

  return db.query(query, queryValues)
  .then((res) => {
    if (res.rows.length === 0){
      return Promise.reject({status: 404, msg: 'Article does not exist'})
    }
    return res.rows;
    });
}

exports.fetchArticleById = (article_id) => {
  return db
      .query(`SELECT
      articles.article_id,
      articles.title,
      articles.topic,
      articles.author,
      articles.body,
      articles.created_at,
      articles.votes,
      COUNT(comments.article_id)::INT AS comment_count
      FROM articles 
      JOIN comments
      ON comments.article_id = articles.article_id
      WHERE articles.article_id = $1
      GROUP By articles.author,
      articles.title,
      articles.article_id,
      articles.topic,
      articles.created_at,
      articles.votes;`, [article_id])
      .then((result) => {
        if (result.rows.length === 0){
          return Promise.reject({status:404,msg:'That article does not exist'})
        }
          return result.rows[0]})
};

exports.fetchCommentsByArticleId = (article_id) => {
  return articleIsReal(article_id)
  .then( () => {
    return db
      .query(`SELECT * FROM comments WHERE article_id = $1 ORDER BY created_at DESC;`, [article_id])
      .then((result) => {
        if (result.rows.length === 0){
          return ([])
        }
          return result.rows})
    });
  }

  exports.insertComment = (newComment, article_id) => {
    const { username, body} = newComment;
    if ( typeof username !== 'string' || typeof body !== 'string' ){
      return Promise.reject({status:400,msg:'Invalid input syntax'})
    }
    return userExists(username)
    .then( () => {
      return articleIsReal(article_id)
      .then( () => {
        return db
      .query(
        `
      INSERT INTO comments
      (votes, author, body, article_id)
      VALUES
      ($1,$2,$3,$4)
      RETURNING *;
      `,
        [0, username, body, article_id]
      )
      .then((result) => {
        return result.rows[0];
      });
      })
      
    })
  };

exports.changeArticleById = (article_id, body) => {
  return articleIsReal(article_id).then( () => {
    return db.query(`
    UPDATE articles
    SET votes = votes + $1
    WHERE
    article_id = $2
    RETURNING *
  `, [body.inc_votes, article_id]).then( (result) => {
    return result.rows[0]
    })
  })
  
}

exports.fetchUsers= () => {
  return db.query(`
  SELECT * FROM users;`
  )
  .then((res) => {
    return res.rows;
    });
}

exports.removeComment = (commentId) => {
  return commentExists(commentId).then( () => {
    return db
    .query(
      `
    DELETE FROM comments
    WHERE comment_id = $1;
    `,
      [commentId]
    )
    .then((result) => {
      return result.rows[0];
    });
  })
  
};
