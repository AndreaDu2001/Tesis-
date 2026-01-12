# language: es
Característica: Autenticación y Autorización
  El sistema debe autenticar usuarios y autorizar
  acceso a recursos según roles

  Antecedentes:
    Dado que el servicio de autenticación está operativo
    Y la base de datos de usuarios está inicializada

  Escenario: Login exitoso con credenciales válidas
    Cuando un usuario inicia sesión con:
      | campo    | valor          |
      | usuario  | admin@epagal   |
      | password | Password123!   |
    Entonces se validan las credenciales
    Y se genera token JWT válido
    Y el token tiene expiración de 30 minutos
    Y se retorna token y datos del usuario

  Escenario: Rechazar login con credenciales inválidas
    Cuando se intenta login con:
      | usuario  | admin@epagal      |
      | password | PasswordIncorrect  |
    Entonces se rechaza el acceso
    Y se retorna error 401 Unauthorized
    Y se registra intento fallido en logs

  Escenario: Proteger ruta con autenticación JWT
    Dado un cliente sin token JWT
    Cuando intenta acceder a GET /api/incidencias
    Entonces se retorna error 401 Unauthorized
    Y se solicita autenticación

  Escenario: Validar token expirado
    Dado un token JWT con expiración hace 5 minutos
    Cuando se intenta usar en solicitud API
    Entonces el middleware rechaza la solicitud
    Y se retorna error 401 Token expirado
    Y se solicita nuevo login

  Escenario: Refresh token automático
    Dado usuario con sesión activa
    Cuando falta menos de 5 minutos para expirar token
    Entonces se genera automáticamente nuevo token
    Y se retorna en response header
    Y la sesión continúa sin interrupción

  Escenario: Logout y revocación de token
    Dado usuario autenticado con token activo
    Cuando solicita logout
    Entonces el token se añade a lista negra
    Y se termina la sesión
    Y solicitudes con ese token son rechazadas

  Escenario: Validar roles y permisos
    Dado un usuario con rol "operador"
    Cuando intenta crear nuevo usuario (requerimiento Admin)
    Entonces se rechaza la solicitud
    Y se retorna error 403 Forbidden
    Y se registra intento no autorizado

  Escenario: Cambiar contraseña
    Dado usuario autenticado
    Cuando solicita cambiar contraseña:
      | campo              | valor      |
      | contraseña_actual  | Old123!    |
      | contraseña_nueva   | New456!    |
    Entonces se valida contraseña actual
    Y se actualiza a nueva contraseña (hash bcrypt)
    Y sesiones activas requieren re-autenticación
