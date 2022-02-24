/*
  Does the equivalent of mysql_secure_installation, but doesn't prompt
  the user each time. This lets us run the script as part of vagrant setup.
*/

UPDATE mysql.user SET Password=PASSWORD('BA/458cR-5p.') WHERE User='root';
DELETE FROM mysql.user WHERE User='';
DELETE FROM mysql.user WHERE User='root' AND Host NOT IN ('localhost', '127.0.0.1', '::1');
DROP DATABASE IF EXISTS test;
DELETE FROM mysql.db WHERE Db='test' OR Db='test\\_%';
FLUSH PRIVILEGES;
