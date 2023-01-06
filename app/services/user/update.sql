UPDATE users
SET password = @password,
    email = @email
WHERE id = @id