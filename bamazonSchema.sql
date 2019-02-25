DROP DATABASE IF EXISTS bamazon;
CREATE DATABASE bamazon;
USE bamazon;

CREATE TABLE products (
    item_id INT NOT NULL auto_increment,
    product_name VARCHAR(255) NOT NULL,
    department_name VARCHAR(255) NOT NULL,
    price DECIMAL(6,2) NOT NULL,
    stock_quantity INT(40) NOT NULL,
    PRIMARY KEY(item_id)
);

INSERT INTO products(product_name,department_name,price,stock_quantity)
VALUES
("Iphone x","electronics",900.99,120),
("PH monitor","electronics",240.95,65),
("oranges","grocery",3.89,600),
("SQL book","education",18.99,9),
("Men's polo shirt","Men's wear",29.99,25),
("sugar","grocery",5.99,35),
("Understanding Javascript","education",28.95,12),
("Beats Solo3 Wireless","electronics",280.99,35),
("Butter cookes","grocery",2.99,450),
("Women's yoga leggings","women's wear",19.99,450);


CREATE TABLE departments(
   department_id INT  AUTO_INCREMENT,
   department_name VARCHAR(200) NOT NULL,
   over_head_cost INT(40) NOT NULL,
   PRIMARY KEY(department_id)
)
ALTER TABLE products
ADD COLUMN product_sales DECIMAL(6,2) AFTER stock_quantity;