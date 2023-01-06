SELECT id,
    case
        when users.password is null then null
        else 'redacted'
    end as password,
    email,
    joined_at as joinedAt
FROM users
WHERE id = ?