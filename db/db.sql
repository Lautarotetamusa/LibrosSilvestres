CREATE DATABASE IF NOT EXISTS librossilvestres;

CREATE TABLE libros(
    isbn VARCHAR(13) NOT NULL,
    titulo VARCHAR(60) NOT NULL,
    fecha_edicion DATE NOT NULL,
    precio FLOAT NOT NULL,
    stock INT DEFAULT 0,

    is_deleted BOOLEAN DEFAULT false,

    PRIMARY KEY(isbn)
);

CREATE TABLE personas(
    id INT(11) NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(60) NOT NULL,
    email  VARCHAR(60) DEFAULT "",
    tipo TINYINT DEFAULT 0, 

    is_deleted BOOLEAN DEFAULT false,

    PRIMARY KEY (id)
);

CREATE TABLE libros_personas(
    isbn VARCHAR(13) NOT NULL,
    id_persona INT(11) NOT NULL,
    porcentaje FLOAT DEFAULT 0,

    FOREIGN KEY (isbn) REFERENCES libros(isbn),
    FOREIGN KEY (id_persona) REFERENCES personas(id)
);

CREATE TABLE clientes(
    id INT(11) NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(60) NOT NULL, 
    email VARCHAR(60) DEFAULT "",

    cuit INT(11) DEFAULT NULL,
    cond_fiscal TINYINT DEFAULT NULL,

    tipo TINYINT DEFAULT 0,

    PRIMARY KEY(id)
);

CREATE TABLE ventas(
    id INT(11) NOT NULL AUTO_INCREMENT,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    descuento FLOAT DEFAULT 0,
    medio_pago TINYINT DEFAULT 0,
    id_cliente INT(11) NOT NULL,
    total FLOAT NOT NULL,

    PRIMARY KEY (id),
    FOREIGN KEY (id_cliente) REFERENCES clientes(id)
);

CREATE TABLE libros_ventas(
    isbn VARCHAR(13) NOT NULL,
    id_venta INT(11) NOT NULL,
    cantidad INT NOT NULL,

    FOREIGN KEY (isbn) REFERENCES libros(isbn),
    FOREIGN KEY (id_venta) REFERENCES ventas(id)
);
    