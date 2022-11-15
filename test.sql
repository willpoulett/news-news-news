\c nc_news_test

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
