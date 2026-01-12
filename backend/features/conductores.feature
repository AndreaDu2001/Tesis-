# language: es
Característica: Gestión de Conductores
  El sistema debe gestionar conductores, asignaciones y
  disponibilidad para operaciones de recolección

  Antecedentes:
    Dado que el sistema de conductores está operativo
    Y la base de datos de conductores está actualizada

  Escenario: Registrar nuevo conductor
    Cuando un administrador registra conductor con:
      | campo           | valor              |
      | nombre          | Juan García        |
      | cédula          | 1750123456         |
      | tipo_licencia   | C                  |
      | teléfono        | 0987654321         |
      | zona_asignada   | oriental           |
    Entonces el conductor se crea exitosamente
    Y el estado inicial es "disponible"
    Y se registra en el sistema sin rutas activas

  Escenario: Validar licencia tipo C
    Cuando se intenta registrar conductor sin licencia C
    Entonces el sistema rechaza el registro
    Y retorna error: "Licencia tipo C requerida"

  Escenario: Asignar conductor a ruta generada
    Dado una ruta generada que requiere 2 conductores
    Cuando el sistema selecciona conductores disponibles
    Entonces asigna el conductor más cercano
    Y cambia su estado a "en_ruta"
    Y registra hora de asignación

  Escenario: Cambiar disponibilidad del conductor
    Dado un conductor en estado "disponible"
    Cuando inicia una ruta asignada
    Entonces su estado cambia a "en_ruta"
    Y cuando completa la ruta
    Entonces su estado vuelve a "disponible"

  Escenario: Consultar rutas activas de conductor
    Dado un conductor "Juan García" en estado "en_ruta"
    Cuando se solicita GET /conductores/{id}/rutas-activas
    Entonces retorna lista de rutas asignadas
    Y cada ruta contiene incidencias pendientes
    Y muestra orden de visitación

  Escenario: Historial de rutas completadas
    Dado un conductor con 10 rutas completadas
    Cuando se solicita historial del conductor
    Entonces retorna lista ordenada por fecha descendente
    Y incluye tiempo total y distancia recorrida
    Y muestra incidencias resueltas

  Escenario: Validar conductor con descanso obligatorio
    Dado un conductor que trabaja > 8 horas
    Cuando solicita continuar operando
    Entonces el sistema marca estado como "descanso"
    Y no permite nuevas asignaciones
    Y registra tiempo de descanso requerido

  Escenario: Filtrar conductores por disponibilidad
    Cuando se solicita listar conductores disponibles
    Entonces retorna solo los en estado "disponible"
    Y ordenados por zona
    Y incluye información de licencia
