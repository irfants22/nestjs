# User API Spec

## Register User

Endpoint : POST /api/users

Request Body :

```json
{
  "username": "jhon",
  "password": "secret",
  "name": "Jhon Doe"
}
```

Response Body (Success) :

```json
{
  "data": {
    "username": "jhon",
    "name": "Jhon Doe"
  }
}
```

Response Body (Failed) :

```json
{
  "errors": "Username already registered"
}
```

## Login User

Endpoint : POST /api/users/login

Request Body :

```json
{
  "username": "jhon",
  "password": "secret"
}
```

Response Body (Success) :

```json
{
  "data": {
    "username": "jhon",
    "name": "Jhon Doe",
    "token": "session_id_generated"
  }
}
```

Response Body (Failed) :

```json
{
  "errors": "Username or password is wrong"
}
```

## Get User

Endpoint : GET /api/users/current

Headers :

- Authorization: token

Response Body (Success) :

```json
{
  "data": {
    "username": "jhon",
    "name": "Jhon Doe"
  }
}
```

Response Body (Failed) :

```json
{
  "errors": "Unauthorized"
}
```

## Update User

Endpoint : PATCH /api/users/current

Headers :

- Authorization: token

Request Body :

```json
{
  "password": "secret", // optional, if want to change password
  "name": "Jhon Doe" // optional, if want to change name
}
```

Response Body (Success) :

```json
{
  "data": {
    "username": "jhon",
    "name": "Jhon Doe"
  }
}
```

## Logout User

Endpoint : DELETE /api/users/current

Headers :

- Authorization: token

Response Body (Success) :

```json
{
  "data": true
}
```
