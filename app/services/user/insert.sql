INSERT INTO users (
        id,
        password,
        email,
        joined_at
    )
VALUES (
        @id,
        @password,
        @email,
        @joinedAt
    )