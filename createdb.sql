CREATE DATABASE authentication;
USE authentication;
CREATE TABLE credentials ( name VARCHAR(20) NOT NULL, username VARCHAR(20) NOT NULL UNIQUE, password VARCHAR(20) NOT NULL UNIQUE, PRIMARY KEY(username));
CREATE TABLE voting (username VARCHAR(20) NOT NULL, time TIME NOT NULL, date DATE NOT NULL, vote int NOT NULL, PRIMARY KEY(username), FOREIGN KEY(username) REFERENCES credentials(username));
ALTER TABLE voting ADD UNIQUE diffdate (username,date);



