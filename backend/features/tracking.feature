# language: es
Característica: Tracking en Tiempo Real
  El sistema debe proporcionar seguimiento en tiempo real
  de conductores y vehículos en operación

  Antecedentes:
    Dado que WebSocket está configurado
    Y existen conductores en ruta

  Escenario: Conectar cliente a WebSocket de tracking
    Cuando un operador abre el panel de LiveTracking
    Y establece conexión WebSocket a /ws/tracking/{conductor_id}
    Entonces la conexión se establece exitosamente
    Y se inicia recepción de eventos en tiempo real
    Y se registra la sesión del operador

  Escenario: Broadcast de posición actual
    Dado un conductor en ruta con GPS activo
    Cuando envía actualización de posición:
      | campo        | valor          |
      | lat          | -0.9322        |
      | lon          | -78.6170       |
      | velocidad    | 25 km/h        |
      | timestamp    | 2026-01-12T... |
    Entonces la posición se almacena en caché
    Y se envía evento a todos los operadores conectados
    Y el mapa se actualiza en tiempo real

  Escenario: Mostrar vehículos activos en mapa
    Cuando el operador accede a LiveTracking
    Entonces se visualizan todos los vehículos en ruta
    Y cada marcador muestra nombre del conductor
    Y línea de ruta con waypoints pendientes
    Y posición se actualiza cada 5 segundos

  Escenario: Calcular ETA (Tiempo de Llegada Estimado)
    Dado un conductor en ruta hacia incidencia
    Cuando el sistema consulta OSRM con posición actual
    Entonces calcula distancia al próximo waypoint
    Y estima tiempo de llegada (ETA)
    Y notifica al operador
    Y actualiza ETA cada minuto

  Escenario: Pausar y reanudar tracking
    Dado un conductor con tracking activo
    Cuando se pausa manualmente el tracking
    Entonces la posición no se actualiza
    Y se registra evento de pausa con timestamp
    Y cuando se reanuda
    Entonces se continúa con actualización normal

  Escenario: Detener tracking al completar ruta
    Dado un conductor en ruta
    Cuando marca todas las incidencias como resueltas
    Entonces el sistema detiene el tracking
    Y almacena historial completo de posiciones
    Y genera reporte de recorrido total

  Escenario: Reconectar con datos acumulados
    Dado conexión WebSocket perdida
    Cuando se restablece la conexión
    Entonces el sistema sincroniza posiciones acumuladas
    Y actualiza el mapa con toda la trayectoria
    Y continúa con tiempo real desde reconexión

  Escenario: Generar reporte de trayectoria
    Dado un conductor que completó ruta
    Cuando se solicita reporte de tracking
    Entonces retorna lista de posiciones con timestamps
    Y calcula distancia total recorrida
    Y genera archivo KML o GeoJSON
    Y permite descargar reporte en PDF
