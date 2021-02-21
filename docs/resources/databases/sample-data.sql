-- to be run as root

-- create the default user 'vagrant' so 'mysql' on its own works
CREATE USER 'vagrant'@'localhost';
-- database for people to play around with
CREATE DATABASE data;
GRANT ALL ON data.* to 'vagrant'@'localhost';
-- sample data, these are read-only by default to prevent accidents
CREATE DATABASE census;
GRANT SELECT ON census.* to 'vagrant'@'localhost';
CREATE DATABASE elections;
GRANT SELECT ON elections.* to 'vagrant'@'localhost';

FLUSH PRIVILEGES;

-- load the data
USE census;
source /vagrant/sampledata/census/setup.sql;
source /vagrant/sampledata/census/import.sql;
USE elections;
source /vagrant/sampledata/elections/setup.sql;
source /vagrant/sampledata/elections/import.sql;

