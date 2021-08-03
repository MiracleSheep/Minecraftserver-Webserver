USE authentication;
CREATE TABLE IF NOT EXISTS credentials ( name VARCHAR(20) NOT NULL UNIQUE, username VARCHAR(20) NOT NULL UNIQUE, password VARCHAR(20) NOT NULL, PRIMARY KEY(username));
CREATE TABLE IF NOT EXISTS voting (username VARCHAR(20) NOT NULL, time TIME NOT NULL, date DATE NOT NULL, vote int NOT NULL, FOREIGN KEY(username) REFERENCES credentials(username));
ALTER TABLE voting ADD UNIQUE diffdate (username,date);