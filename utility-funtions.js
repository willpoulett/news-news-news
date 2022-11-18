
const db = require("./db/connection");
  
exports.articleIsReal = (article_id) => {
    return db
      .query(`SELECT * FROM articles WHERE article_id = $1`, [article_id])
      .then((queryOutput) => {
        if (queryOutput.rows.length === 0) {
          return Promise.reject({ status: 404, msg: "That article does not exist" });
        }
      });
  };

exports.userExists = (username) => {
    return db
      .query(`SELECT * FROM users WHERE username = $1`, [username])
      .then((queryOutput) => {
        if (queryOutput.rows.length === 0) {
          return Promise.reject({ status: 404, msg: "User does not exist" });
        }
      });
  };

  exports.commentExists = (comment_id) => {
    return db
      .query(`SELECT * FROM comments WHERE comment_id = $1`, [comment_id])
      .then((queryOutput) => {
        if (queryOutput.rows.length === 0) {
          return Promise.reject({ status: 404, msg: "That comment does not exist" });
        }
      });
  };

 