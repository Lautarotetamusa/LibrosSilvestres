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
`GET /libro`

#### Crear libro
`POST /libro`
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
  "precio": 4500
}
```
No se pueden actualizar las personas de los libros todavia lo tengo que agregar.

#### Borrar un libro
No está hecho todavía

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
