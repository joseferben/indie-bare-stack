SELECT id,
    user_id as userId,
    title,
    body
FROM notes
WHERE user_id = ?