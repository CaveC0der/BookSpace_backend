CREATE OR REPLACE FUNCTION after_create_user_tg()
    RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO users_roles VALUES (NEW.id, 'User');

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_create_user
AFTER INSERT
ON users
FOR EACH ROW
EXECUTE FUNCTION after_create_user_tg();


CREATE OR REPLACE FUNCTION after_create_book_tg()
    RETURNS TRIGGER AS $$
DECLARE
    _author_rating NUMERIC(5,3);
    _books_count INTEGER;
    _new_books_count INTEGER;
BEGIN
    SELECT u.rating, u."booksCount", u."booksCount" + 1
    INTO _author_rating, _books_count, _new_books_count
    FROM users u
    WHERE u.id = NEW."authorId";

    UPDATE users
    SET
        rating = ((_author_rating * _books_count) + NEW.rating) / _new_books_count,
        "booksCount" = _new_books_count
    WHERE id = NEW."authorId";

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_create_book
AFTER INSERT
ON books
FOR EACH ROW
EXECUTE FUNCTION after_create_book_tg();


CREATE OR REPLACE FUNCTION after_update_book_tg()
    RETURNS TRIGGER AS $$
DECLARE
    _author_rating NUMERIC(5,3);
    _books_count INTEGER;
BEGIN
    SELECT u.rating, u."booksCount"
    INTO _author_rating, _books_count
    FROM users u
    WHERE u.id = NEW."authorId";

    UPDATE users
    SET rating = ((_author_rating * _books_count) - OLD.rating + NEW.rating) / _books_count
    WHERE id = NEW."authorId";

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_update_book
AFTER UPDATE
ON books
FOR EACH ROW
WHEN (OLD.rating IS DISTINCT FROM NEW.rating)
EXECUTE FUNCTION after_update_book_tg();


CREATE OR REPLACE FUNCTION after_destroy_book_tg()
    RETURNS TRIGGER AS $$
BEGIN
    UPDATE users
    SET "booksCount" = "booksCount" - 1
    WHERE id = OLD."authorId";

    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_destroy_book
AFTER DELETE
ON books
FOR EACH ROW
EXECUTE FUNCTION after_destroy_book_tg();


CREATE OR REPLACE FUNCTION after_create_review_tg()
    RETURNS TRIGGER AS $$
DECLARE
    _book_rating NUMERIC(5,3);
    _reviews_count INTEGER;
    _new_reviews_count INTEGER;
BEGIN
    SELECT b.rating, b."reviewsCount", b."reviewsCount" + 1
    INTO _book_rating, _reviews_count, _new_reviews_count
    FROM books b
    WHERE b.id = NEW."bookId";

    UPDATE books
    SET
        rating = ((_book_rating * _reviews_count) + NEW.rate) / _new_reviews_count,
        "reviewsCount" = _new_reviews_count
    WHERE id = NEW."bookId";

    UPDATE users
    SET "reviewsCount" = "reviewsCount" + 1
    WHERE id = NEW."userId";

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_create_review
AFTER INSERT
ON reviews
FOR EACH ROW
EXECUTE FUNCTION after_create_review_tg();


CREATE OR REPLACE FUNCTION after_update_review_tg()
    RETURNS TRIGGER AS $$
DECLARE
    _book_rating NUMERIC(5,3);
    _reviews_count INTEGER;
BEGIN
    SELECT b.rating, b."reviewsCount"
    INTO _book_rating, _reviews_count
    FROM books b
    WHERE b.id = NEW."bookId";

    UPDATE books
    SET rating = ((_book_rating * _reviews_count) - OLD.rate + NEW.rate) / _reviews_count
    WHERE id = NEW."bookId";

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_update_review
AFTER UPDATE
ON reviews
FOR EACH ROW
WHEN (OLD.rate IS DISTINCT FROM NEW.rate)
EXECUTE FUNCTION after_update_review_tg();


CREATE OR REPLACE FUNCTION after_destroy_review_tg()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE users
  SET "reviewsCount" = "reviewsCount" - 1
  WHERE id = OLD."userId";

  UPDATE books
  SET "reviewsCount" = "reviewsCount" - 1
  WHERE id = OLD."bookId";

  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_destroy_review
AFTER DELETE
ON reviews
FOR EACH ROW
EXECUTE FUNCTION after_destroy_review_tg();


CREATE OR REPLACE FUNCTION after_create_comment_tg()
    RETURNS TRIGGER AS $$
BEGIN
    UPDATE books
    SET "commentsCount" = "commentsCount" + 1
    WHERE id = NEW."bookId";

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_create_comment
AFTER INSERT
ON comments
FOR EACH ROW
EXECUTE FUNCTION after_create_comment_tg();


CREATE OR REPLACE FUNCTION after_destroy_comment_tg()
    RETURNS TRIGGER AS $$
BEGIN
    UPDATE books
    SET "commentsCount" = "commentsCount" - 1
    WHERE id = OLD."bookId";

    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_destroy_comment
AFTER DELETE
ON comments
FOR EACH ROW
EXECUTE FUNCTION after_destroy_comment_tg();


CREATE OR REPLACE FUNCTION after_create_view_tg()
    RETURNS TRIGGER AS $$
BEGIN
    UPDATE users
    SET "viewsCount" = "viewsCount" + 1
    WHERE id = NEW."userId";

    UPDATE books
    SET "viewsCount" = "viewsCount" + 1
    WHERE id = NEW."bookId";

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_create_view
AFTER INSERT
ON views
FOR EACH ROW
EXECUTE FUNCTION after_create_view_tg();


CREATE OR REPLACE FUNCTION related_popularity(INTEGER, SMALLINT, SMALLINT)
    RETURNS FLOAT AS $$
DECLARE
	_views_weight FLOAT DEFAULT 0.4;
	_reviews_weight FLOAT DEFAULT 0.4;
	_comments_weight FLOAT DEFAULT 0.2;
	_scaling_factor_views FLOAT;
	_scaling_factor_reviews FLOAT;
	_scaling_factor_comments FLOAT;
	_scaled_views FLOAT;
	_scaled_reviews FLOAT;
	_scaled_comments FLOAT;
	_popularity_score FLOAT;
BEGIN
	_scaling_factor_views := 1.0 / ($1 + 1);
	_scaling_factor_reviews := 1.0 / ($2 + 1);
	_scaling_factor_comments := 1.0 / ($3 + 1);

	_scaled_views := $1 * _scaling_factor_views;
	_scaled_reviews := $2 * _scaling_factor_reviews;
	_scaled_comments := $3 * _scaling_factor_comments;

	_popularity_score := _views_weight * _scaled_views +
						_reviews_weight * _scaled_reviews +
						_comments_weight * _scaled_comments;
	RETURN _popularity_score;
END;
$$ LANGUAGE plpgsql;

INSERT INTO roles
VALUES
    ('User', NULL, NOW()),
    ('Author', NULL, NOW()),
    ('Admin', NULL, NOW()),
    ('Restricted', NULL, NOW());
