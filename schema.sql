DROP TABLE IF EXISTS locations;

CREATE TABLE locations (
id SERIAL PRIMARY KEY,
search_query VARCHAR(255),
formatted_query VARCHAR(255),
latitude VARCHAR(255),
longitude VARCHAR(255)
);

-- CREATE TABLE weather (
-- id SERIAL PRIMARY KEY,
-- forcast VARCHAR(255),
-- time VARCHAR(255),
-- );

-- CREATE TABLE trails (
-- id SERIAL PRIMARY KEY,
-- name VARCHAR(255),
-- length VARCHAR(255),
-- summary INTEGER,
-- );