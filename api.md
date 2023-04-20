# API backend

## Indice

* [Personas](#Personas)
* [Libros](#Libros)
* [Clientes](#Clientes)
* [Ventas](#Ventas)
* [Consignaciones](#Consignaciones)

## Personas

#### Lista de autores

`GET /persona/?tipo=autor`

#### Lista de ilustradores

`GET /persona/?tipo=ilustrador`

#### Dar de alta persona

`POST /persona`

```json
{  
  "nombre": "agustin1",
  "email": "agus@gmail.com",
  "dni": 43491979
}
```

Si el dni ya se encuentra cargado nos devuelve un error del tipo 404
Nombre e dni son campos obligatorios

#### Obtener persona con id

`GET /persona/{id}`
Si no se encuentra devuelve un error 404 NotFound

#### Actualizar persona con id

`PUT /persona/{id}`

```json
{
  "nombre": "agustin1"
}
```

Si no se encuentra devuelve un error 404 NotFound

#### borrar persona con id

`DELETE /persona/{id}`

## Libros

#### Lista de libros

`GET /libro`
Devuelve todos los libros

`GET /libro?page=1`

Devuelve 10 libros, si page es 1 entonces nos trae los primeros 10 libros y asi

#### Crear libro

`POST /libro`

Cargar los datos

```json
{
  "titulo": "Breviario",
  "isbn": "9876543212",
  "precio": 4500, 
  "fecha_edicion": "2023-01-02",
}
```

Pasar las personas directamente cuando lo creamos

```json
{
  "titulo": "Breviario",
  "isbn": "9876543212",
  "precio": 4500,
  "fecha_edicion": "2023-01-02",
  "autores": [
    {
      "nombre": "Carlos",
      "email": "carlos@gmail.com",
      "dni": 43491979
    }
  ],
  "ilustradores": [
    {
      "nombre": "Juana",
      "email": "juana@gmail.com",
      "dni": 11111111
    },
    {
      "id": 3 //id de un ilustrador existente
    }  
  ]
}
```

* Valida campos obligatorios de las personas y del libro
* Si el dni de alguna persona ya esta cargado devuelve un error 404 NotFound
* Si algun id de una persona no existe devuelve un error 404 NotFound

#### Obtener libro por isbn

`GET /libro/{isbn}`
Devuelve la data del libro y las personas relacionadas con este

#### Obtener ventas de un libro

`GET /libro/{isbn}/ventas`

Response:

```json
[
  {
    "id_venta": 12,
    "fecha": "2023-01-20T17:13:07.000Z",
    "medio_pago": 0,
    "total": 7501,
    "file_path":"MARIACAROLINAMUSA_2023_03_07_185436.pdf",
    "id_cliente": 4
  }
]
```

Devuelve una lista de todas las ventas de ese libro

#### Actualizar libro por isbn

`PUT /libro{isbn}`

```json
{
  "titulo": "Breviario",
  "precio": 4500,
  "stock": 10
}
```

Los campos que se pueden actualizar son

- stock
- precio
- titulo
- fecha_edicion

#### Agregar personas a un libro

`POST /libro/{isbn}/personas`

Lista

```json
[
  {
    "id": 500,
    "tipo": 0,
    "porcentaje": 25, //si no se pasa es 0 por default
  },
  {
    "id": 500,
    "tipo": 0,
  }
]
```

* Si la persona no existe devuelve error 404 NotFound
* Si el libro no existe devuelve error 404 NotFound
* Si intentamos agregar una persona que ya esta en ese libro, no devolverá ningun error pero no hará nada

#### Borrar una persona de un libro

`DELETE /libro/{isbn}/personas`

```json
[
  {
    "id": 500,
    "tipo": 0,
  },
  {
    "id": 499,
    "tipo": 1,
  }
]
```

Borra la persona de tipo 0(autor) e id 500 y la persona de id 499 y tipo 1(ilustrador)

* Si ninguna persona trabaja en el libro con el tipo pasado devuelve un error 404
* Si encuentra al menos una borra solo la/s encontrada/s y devuelve codigo 200

#### Actualizar una persona de un libro

`PUT /libro/{isbn}/personas`

```json
[
  {
    "id": 500,
    "porcentaje": 25,
    "tipo": 0
  },
  {
    "id": 499,
    "tipo": 1,
    "porcentaje": 20
  }
]
```

Solo se puede actualizar el porcentaje
Si alguna persona no se encuentra simplemente actualiza las otras
Nunca devuelve un error

#### Borrar un libro

`DELETE /libro/{isbn}`

Borra todas las relaciones con las personas

## Clientes

#### Obtener todos los clientes

`GET /cliente`

#### Obtener cliente

`GET /cliente/{id}`

Response:

```json
{
  "id": 76,
  "nombre": "Libreria pepito",
  "email": null,
  "cuit": "20434919798",
  "razon_social": "LAUTARO TETA MUSA",
  "domicilio": "URQUIZA 1159 Piso:4 Dpto:4 - ROSARIO NORTE SANTA FE",
  "cond_fiscal": "IVA EXENTO"
}
```

Para consumidor final

`GET /cliente/consumidor_final`

* Si el cliente no existe devuelve un error 404 NotFound

#### Obtener ventas de un cliente

`GET /cliente/{id}/ventas`

Response:

```json
[
  {
    "id": 57,
    "fecha": "2023-03-07T22:24:49.000Z",
    "total": 4274.31,
    "file_path": "Lautaroteta_2023_03_07_222449.pdf"
  },
  {
    "id": 58,
    "fecha": "2023-03-07T22:25:49.000Z",
    "total": 4274.31,
    "file_path": "Lautaroteta_2023_03_07_222549.pdf"
  }
]
```

Para consumidor final

`GET /cliente/consumidor_final/ventas`

* Cada vez que se realice una nueva venta para el cliente, aparecera en la lista
* Si el cliente no existe devuelve un error 404 NotFound
* Si el cliente no tiene ventas devuelve una lista vacia []
* las facturas se guardan en /facturas/{file_path}

#### Obtener el stock de un cliente

`GET cliente/{id}/stock`
Response:

```json
[
  {
    "titulo": "Dama de corazones",
    "isbn": "97898712345",
    "stock": 8
  },
  {
    "titulo": "Breviario",
    "isbn": "98765432100",
    "stock": 3
  }
]
```

* Si el cliente no existe devuelve un error 404 NotFound
* Si el cliente no tiene stock devuelve una lista vacia []

#### Crear cliente

Existen dos tipos de clientes, los clientes inscriptos y el CONSUMIDOR FINAL, de este último solo podrá haber uno en todo el sistema. Todas las ventas que se facturen como consumidor final estarán relacionadas con este único cliente.

### Consumidor final
Este cliente es único en el sistema, no se puede crear, actualizar ni eliminar.

`POST /cliente`

Request:
```json
{
  "nombre": "bancoSantaCruz",
  "email": "bancoStaCruz@gmail.com",
  "cuit": "30500098801"
}
```
Response:
```json
{
  "success": true,
  "message": "Cliente creado correctamente",
  "data": {
    "nombre": "banco",
    "email": "bancoStaCruz@gmail.com",
    "cuit": "30500098801",
    "razon_social": "BANCO DE SANTA CRUZ SOCIEDAD ANONIMA",
    "domicilio": "AV. PTE. DR. N. C. KIRCHNER 812 - RIO GALLEGOS SANTA CRUZ",
    "cond_fiscal": "",
    "tipo": 1,
    "id": 18
  }
}
```
* Si el cuit no existe en afip devuelve un error 400
* Carga desde afip datos relacionados a ese cuit

#### Actualizar cliente

`PUT /cliente/{id}`

### Si no se actualiza el cuit
Request:
```json
{
  "email": "bancoStaCruzCambiado@gmail.com",
}
```
Response:
```json
{
  "success": true,
  "message": "Cliente creado correctamente",
  "data": {
    "nombre": "banco",
    "email": "bancoStaCruz@gmail.com",
    "cuit": "30500098801",
    "razon_social": "BANCO DE SANTA CRUZ SOCIEDAD ANONIMA",
    "domicilio": "AV. PTE. DR. N. C. KIRCHNER 812 - RIO GALLEGOS SANTA CRUZ",
    "cond_fiscal": "",
    "tipo": 1,
    "id": 18
  }
}
```

* Si no cambia ningun valor devuelve 
```json
{
  "success": false,
  "error": "Ningun valor es distinto a lo que ya existia en la base de datos"
}
```

* Si el cliente no existe devuelve un error 404 NotFound

### Si se actualiza el cuit
Request:
```json
{
  "cuit": "33999181819"
}
```
Response:
```json
{
  "success": true,
  "message": "Cliente actualizado correctamente",
  "data": {
    "id": 18,
    "nombre": "banco",
    "email": "email2",
    "cuit": "33999181819",
    "razon_social": "BANCO MUNICIPAL DE ROSARIO",
    "domicilio": "SAN MARTIN 730 - ROSARIO NORTE SANTA FE",
    "cond_fiscal": "",
    "tipo": 1
  }
}
```
* Si el nuevo cuit no existe en afip devuelve un error 400
* Carga los datos de afip relacionados con el nuevo cuit pasado


#### Borrar un cliente

`DELETE cliente/{id}`

Por ahora solo borra los clientes que no tienen ninguna venta ni consignacion asignada.
TODO: baja lógica.

## Ventas

#### Obtener los medios de pago

`GET /venta/medios_pago`

#### Nueva venta

`POST /venta`
Peticion:

```json
{
    "medio_pago": 0,
    "descuento": 5.5,
    "cliente": 4, //id del cliente
    "libros": [
        {
            "isbn": 1234567891012,
            "cantidad": 2
        },
        {
            "isbn": 1234567891013,
            "cantidad": 1
        }   
    ]
}
```

* Si el id del cliente no existe devuelve un error 404 NotFound
* Si algun isbn no existe devuelve un error 404 NotFound
* Si el stock de algun libro no es suficiente devuelve un error 400

* Emite una factura nueva en afip, el pdf se guarda en facturas/${path}
* Agrega una venta a la lista de ventas del cliente en cliente/{id_cliente}/ventas

## Consignaciones

#### Nueva consignacion

`POST consignacion/`

```json
{
  "cliente": 78,
  "libros": [
    {
      "isbn": "98765432100",
      "cantidad": 3
    }
  ]
}
```

* Si el id del cliente no existe devuelve un error 404 NotFound
* Si algun isbn no existe devuelve un error 404 NotFound
* Si el stock de algun libro no es suficiente devuelve un error 400

* Si tiene exito la consulta devuelve 200 y:

- Inserta una fila a consignacion.
- Inserta una fila a `libro_consignacion` por cada libro.
- Si existe una fila en `stock_cliente` para ese cliente y ese isbn la actualiza con el nuevo stock, sino inserta una nueva fila en `stock_cliente`.
