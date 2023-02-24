ALTER TABLE ventas ADD COLUMN file_path VARCHAR(80) NOT NULL;

ALTER TABLE clientes MODIFY COLUMN cuit VARCHAR(15) DEFAULT NULL;

CREATE TABLE consignaciones(
    id INT(11) NOT NULL AUTO_INCREMENT,
    id_cliente INT(11) NOT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    remito_path VARCHAR(80) NOT NULL,

    PRIMARY KEY(id),
    FOREIGN KEY(id_cliente) REFERENCES clientes(id)
);

CREATE TABLE libros_consignaciones(
    isbn VARCHAR(13) NOT NULL,
    id_consignacion INT(11) NOT NULL,
    cantidad INT NOT NULL,

    PRIMARY KEY (isbn, id_consignacion),
    FOREIGN KEY (isbn) REFERENCES libros(isbn),
    FOREIGN KEY (id_consignacion) REFERENCES consignaciones(id)
);

