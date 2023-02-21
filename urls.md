# API backend

## Indice

* [Personas](#Personas)
* [Libros](#Libros)
* [Clientes](#Clientes)
* [Ventas](#Ventas)

## Personas

#### Lista de autores
`GET /persona/autor`

#### Lista de ilustradores
`GET /persona/ilustrador`

#### Dar de alta persona
`POST /persona`
```json
{  
  "nombre": "agustin1",
  "email": "agus@gmail.com",
  "tipo": 0 //tiene que ser 0(autor) o 1(ilustrador)
}
```

#### Obtener persona con id
Autor
`GET /persona/autor/{id}`

Ilustrador
`GET /persona/ilustrador/{id}`

#### Actualizar persona con id
`PUT /persona/{id}`
```json
{
  "nombre": "agustin1",
  "tipo": 1
}
```
#### borrar persona con id {id}
`DELETE /persona/{id}`

## Libros

#### Lista de libros
`GET /libro?page=1`

Devuelve 10 libros, si página es 1 entonces nos trae los primeros 10 libros y asi

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
      "email": "carlos@gmail.com"
    }
  ],
  "ilustradores": [
    {
      "nombre": "Juana",
      "email": "juana@gmail.com"
    },
    {
      "id": 3 //id de un ilustrador existente
    }  
  ]
}
```

#### Obtener libro por isbn
`GET /libro/{isbn}`

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
stock
precio
titulo
fecha_edicion

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
`DELETE /libro{isbn}`

Borra todas las relaciones con las personas

## Clientes

#### Obtener todos los clientes
`GET /cliente`

#### Obtener cliente por id
`GET /cliente/{id}`

#### Crear cliente
`POST /cliente`

Clientes del tipo 0 (particular)
```json
{
    "nombre": "jose",
    "email": "jose@gmail.com",
}
```

Clientes del tipo 1 (inscripto)
```json
{
    "nombre": "Libreria 3",
    "email": "libreria3@gmail.com",
    "tipo": 1,
    "cuit": 434919798,
    "cond_fiscal": 1
}
```

#### Actualizar cliente
`PUT /cliente/{id}`

Actualizar cliente del tipo 0 al tipo 1
```json
{
    "nombre": "Libreria 3",
    "email": "libreria3@gmail.com",
    "tipo": 1,
    "cuit": 434919798,
    "cond_fiscal": 1
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
`DELETE cliente/12`

## Ventas

#### Nueva venta
`POST /venta`


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
