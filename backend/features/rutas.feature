# language: es
Característica: Generación de Rutas Optimizadas
  El sistema debe generar rutas óptimas que minimicen
  distancia y tiempo de recolección

  Antecedentes:
    Dado que existen incidencias pendientes en el sistema
    Y el servicio OSRM está disponible

  Escenario: Generar ruta para zona oriental
    Cuando se solicita generar ruta para zona "oriental"
    Y hay 5 incidencias pendientes en esa zona
    Entonces el sistema consulta OSRM para calcular distancias
    Y ordena las incidencias por gravedad descendente
    Y genera una ruta optimizada
    Y calcula el costo total y duración estimada

  Escenario: Calcular camiones necesarios
    Dado incidencias con gravedad total de 45 puntos
    Y cada camión tiene capacidad de 15 puntos
    Cuando se genera la ruta
    Entonces el sistema calcula que necesita 3 camiones
    Y asigna incidencias a cada camión proporcionalmente

  Escenario: TSP - Orden óptimo de visitación
    Dado 3 incidencias en coordenadas:
      | lat     | lon       | gravedad |
      | -0.9322 | -78.6170  | 8        |
      | -0.9350 | -78.6150  | 6        |
      | -0.9300 | -78.6180  | 9        |
    Cuando se calcula el orden óptimo
    Entonces OSRM retorna el waypoint_order: [2, 0, 1]
    Y el algoritmo TSP minimiza distancia total
    Y se genera ruta con esos puntos ordenados

  Escenario: Cambiar estado de ruta a en_progreso
    Dado una ruta generada en estado "planeada"
    Cuando un conductor inicia la ruta
    Entonces el estado cambia a "en_progreso"
    Y se inicia el seguimiento en tiempo real
    Y se notifica a los operadores

  Escenario: Completar ruta exitosamente
    Dado una ruta en estado "en_progreso"
    Cuando el conductor resuelve todas las incidencias
    Entonces la ruta cambia a estado "completada"
    Y se registra hora de finalización
    Y se calculan estadísticas de desempeño
    Y todas las incidencias asociadas están resueltas

  Escenario: Recuperarse de fallo de OSRM
    Dado que OSRM no está disponible
    Cuando se intenta generar una ruta
    Entonces se retorna error descriptivo
    Y se registra el evento en logs
    Y se sugiere reintentar en X segundos

  Escenario: Listar rutas por zona
    Cuando se solicita obtener rutas de zona "occidental"
    Entonces retorna solo las rutas de esa zona
    Y incluye información de camiones utilizados
    Y muestra estado actual de cada ruta
