// Install

# Install mysql #

# Config mysql #

Enter in mysql
`
sudo mysql -u root
`

Create new user
`
GRANT ALL PRIVILEGES ON *.* TO 'user'@'localhost' IDENTIFIED BY 'newpassword';
`

# Create new database #
`
mysql -u user -p
`
`
CREATE DATABASE db_name;
`

# Create the tables #
Copy /db/db.sql in console and press enter


# Create .env file #

`
touch .env
`

env file:
`
DB_HOST: localhost
DB_USER: user
DB_PASS: newpassowrd
DB_PORT: port
DB_NAME: db_name
`


