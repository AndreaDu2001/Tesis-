# language: es
Característica: Gestión de Incidencias del Sistema EPAGAL
  El sistema debe permitir reportar, gestionar y resolver incidencias
  de recolección de residuos sólidos en Latacunga

  Antecedentes:
    Dado que el sistema está disponible
    Y la base de datos está limpia

  Escenario: Reportar una nueva incidencia de acopio lleno
    Cuando un usuario reporta una incidencia de tipo "acopio_lleno"
    Y proporciona coordenadas válidas (-0.9322, -78.6170)
    Y establece la gravedad en 8
    Y agrega descripción "Acopio lleno en zona oriental"
    Entonces la incidencia se crea exitosamente
    Y el sistema asigna automáticamente la zona "oriental"
    Y el estado de la incidencia es "pendiente"
    Y se genera una notificación a los operadores

  Escenario: Validar cálculo automático de zona
    Cuando se reporta incidencia en coordenadas (-0.9350, -78.6150)
    Entonces el sistema determina que pertenece a zona "oriental"
    Y cuando se reporta incidencia en coordenadas (-0.9300, -78.6000)
    Entonces el sistema determina que pertenece a zona "occidental"

  Escenario: Ajustar gravedad según palabras clave
    Cuando se reporta incidencia con gravedad base 5
    Y la descripción contiene "urgente"
    Entonces la gravedad se incrementa a 7 (+2 bonificación)
    Y cuando la descripción contiene "crítico"
    Entonces la gravedad final es 10 (máximo permitido)

  Escenario: Cambiar estado de incidencia a asignada
    Dado una incidencia pendiente en zona oriental
    Cuando el sistema genera una ruta que incluye esta incidencia
    Entonces el estado de la incidencia cambia a "asignada"
    Y se asigna un conductor responsable

  Escenario: Marcar incidencia como resuelta
    Dado una incidencia asignada a un conductor
    Cuando el conductor marca la incidencia como completada
    Y confirma la hora de resolución
    Entonces el estado cambia a "resuelta"
    Y se registra el tiempo de resolución en el sistema
    Y se actualiza el historial del conductor

  Escenario: Filtrar incidencias por zona
    Dado el sistema tiene 10 incidencias registradas
    Cuando se solicita listar incidencias de zona "oriental"
    Entonces se retorna solo las incidencias de esa zona
    Y cada incidencia contiene coordenadas válidas

  Escenario: Subir imagen de evidencia
    Cuando un usuario reporta incidencia
    Y adjunta una imagen (JPG/PNG máx 5MB)
    Entonces la imagen se almacena correctamente
    Y se vincula a la incidencia reportada
    Y es accesible desde el dashboard operador
