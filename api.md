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

Valida campos obligatorios de las personas y del libro
Si el dni de alguna persona ya esta cargado devuelve un error 404 NotFound
Si algun id de una persona pasado no existe devuelve un error 404 NotFound

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

Devuelve error en caso de no encontrar a la persona o que no exista el libro
Si intentamos agregar una persona que ya esta en ese libro, no devolverá ningun error pero no hará nada

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

Si ninguna persona trabaja en el libro con el tipo pasado devuelve un error 404
Si encuentra al menos una borra solo la/s encontradas y devuelve codigo 200

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
  "tipo": 1,
  "cuit": "20434919798",
  "razon_social": "LAUTARO TETA MUSA",
  "domicilio": "URQUIZA 1159 Piso:4 Dpto:4 - ROSARIO NORTE SANTA FE",
  "cond_fiscal": "IVA EXENTO"
}
```

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

#### Crear cliente

`POST /cliente`

Clientes del tipo 0 (particular)

```json
{
    "nombre": "jose", 
    "email": "jose@gmail.com", //No olbigatorio, se hace null si no existe
}
```

Clientes del tipo 1 (inscripto)

```json
{
    "nombre": "Libreria 3",
    "email": "libreria3@gmail.com", //No olbigatorio, se hace null si no existe
    "tipo": 1,
    "cuit": 434919798
}
```

Si el cuit no esta cargado en afip devolver un error 400
Si se encuentra el cuit carga desde afip datos relacionados a esa persona

#### Actualizar cliente

`PUT /cliente/{id}`

Actualizar cliente del tipo 0 al tipo 1

```json
{
    "nombre": "Libreria 3",
    "email": "libreria3@gmail.com",
    "tipo": 1,
    "cuit": 434919798
}
```

Actualizar cliente del tipo 0

```json
{
    "nombre": "jose",
    "email": "jose@gmail.com",
}
```

#### Borrar un cliente

`DELETE cliente/{id}`

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

Si el id del cliente no existe devuelve un error 404 NotFound
Si algun isbn no existe devuelve un error 404 NotFound
Si el stock de algun libro no es suficiente devuelve un error 400

Emite una factura nueva en afip, el pdf se guarda en facturas/${path}

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

Si el id del cliente no existe devuelve un error 404 NotFound
Si algun isbn no existe devuelve un error 404 NotFound
Si el stock de algun libro no es suficiente devuelve un error 400

Si tiene exito la consulta devuelve 200 y:

- Inserta una fila a consignacion.
- Inserta una fila a `libro_consignacion` por cada libro.
- Si existe una fila en `stock_cliente` para ese cliente y ese isbn la actualiza con el nuevo stock, sino inserta una nueva fila en `stock_cliente`.
