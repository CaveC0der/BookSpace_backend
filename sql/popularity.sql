CREATE OR REPLACE FUNCTION related_popularity(INTEGER, SMALLINT, SMALLINT) RETURNS FLOAT AS $$
DECLARE
	views_weight FLOAT DEFAULT 0.4;
	reviews_weight FLOAT DEFAULT 0.4;
	comments_weight FLOAT DEFAULT 0.2;
	scaling_factor_views FLOAT;
	scaling_factor_reviews FLOAT;
	scaling_factor_comments FLOAT;
	scaled_views FLOAT;
	scaled_reviews FLOAT;
	scaled_comments FLOAT;
	popularity_score FLOAT;
BEGIN
	scaling_factor_views := 1.0 / ($1 + 1);
	scaling_factor_reviews := 1.0 / ($2 + 1);
	scaling_factor_comments := 1.0 / ($3 + 1);

	scaled_views := $1 * scaling_factor_views;
	scaled_reviews := $2 * scaling_factor_reviews;
	scaled_comments := $3 * scaling_factor_comments;

	popularity_score := views_weight * scaled_views +
						reviews_weight * scaled_reviews +
						comments_weight * scaled_comments;
	RETURN popularity_score;
END;
$$ LANGUAGE plpgsql;
