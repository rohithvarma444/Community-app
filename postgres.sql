CREATE TABLE "User" (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    bio TEXT,
    mobileNumber VARCHAR(255) UNIQUE,
    profilePic TEXT
);

CREATE TABLE "Category" (
    category_id SERIAL PRIMARY KEY,
    category_name VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE "Post" (
    post_id SERIAL PRIMARY KEY,
    description TEXT NOT NULL,
    user_id INT NOT NULL,
    category_id INT NOT NULL,
    upload_file TEXT,
    like_count INT DEFAULT 0,
    comment_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES "User"(user_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES "Category"(category_id) ON DELETE CASCADE
);

CREATE TABLE "Comment" (
    comment_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    post_id INT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES "User"(user_id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES "Post"(post_id) ON DELETE CASCADE,
    UNIQUE (user_id, post_id)
);

CREATE TABLE "Like" (
    like_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    post_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES "User"(user_id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES "Post"(post_id) ON DELETE CASCADE,
    UNIQUE (user_id, post_id)
);

CREATE TABLE "Poll" (
    poll_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    poll_title VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES "User"(user_id) ON DELETE CASCADE
);

CREATE TABLE "PollOption" (
    option_id SERIAL PRIMARY KEY,
    poll_id INT NOT NULL,
    option_text VARCHAR(255) NOT NULL,
    FOREIGN KEY (poll_id) REFERENCES "Poll"(poll_id) ON DELETE CASCADE,
    UNIQUE (poll_id, option_text)
);

CREATE TABLE "PollVote" (
    vote_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    poll_id INT NOT NULL,
    option_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES "User"(user_id) ON DELETE CASCADE,
    FOREIGN KEY (poll_id) REFERENCES "Poll"(poll_id) ON DELETE CASCADE,
    FOREIGN KEY (option_id) REFERENCES "PollOption"(option_id) ON DELETE CASCADE,
    UNIQUE (user_id, poll_id, option_id)
);

CREATE TABLE "Session" (
    session_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    browser VARCHAR(255),
    os VARCHAR(255),
    device VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES "User"(user_id) ON DELETE CASCADE
);