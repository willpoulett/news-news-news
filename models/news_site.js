const db = require('../db/connection.js');
const {articleIsReal, userExists} = require('../utility-funtions.js')

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
  COUNT(comments.article_id)::INT AS comment_count
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

exports.fetchArticleById = (article_id) => {
  return db
      .query(`SELECT * FROM articles WHERE article_id = $1;`, [article_id])
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



  // ______________________________________________________
  

  // const articleIsReal = async (article_id) => {
  //   return db
  //     .query(`SELECT * FROM articles WHERE article_id = $1`, [article_id])
  //     .then((queryOutput) => {
  //       if (queryOutput.rows.length === 0) {
  //         return Promise.reject({ status: 404, msg: "That article does not exist" });
  //       }
  //     });
  // };

  // const userExists = async (username) => {
  //   return db
  //     .query(`SELECT * FROM users WHERE username = $1`, [username])
  //     .then((queryOutput) => {
  //       if (queryOutput.rows.length === 0) {
  //         return Promise.reject({ status: 401, msg: "User does not exist" });
  //       }
  //     });
  // };