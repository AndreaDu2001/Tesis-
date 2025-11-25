"""
Consumer de eventos RabbitMQ para el dashboard del administrador.
Escucha eventos de incidencias desde la app móvil y actualiza en tiempo real.

Este consumer se ejecuta como un proceso separado o como tarea de Celery.
"""

import json
import logging
from typing import Callable, Dict, Any
import pika
from pika.exceptions import AMQPConnectionError
from django.conf import settings

logger = logging.getLogger(__name__)


class IncidentDashboardConsumer:
    """
    Consumer que escucha eventos de incidencias para actualizar el dashboard.
    Consume eventos del exchange 'city.cleaning.incidents'.
    """
    
    EXCHANGE_NAME = 'city.cleaning.incidents'
    QUEUE_NAME = 'dashboard.incidents.queue'
    
    # Routing keys que nos interesan para el dashboard
    ROUTING_KEYS = [
        'incidents.submitted.v1',      # Nuevos incidentes desde app móvil
        'incidents.validated.v1',      # Incidentes validados
        'incidents.rejected.v1',       # Incidentes rechazados
        'incidents.status_updated.v1', # Cambios de estado
        'incidents.attachment_added.v1' # Nuevas evidencias
    ]
    
    def __init__(self):
        self.connection = None
        self.channel = None
        self.event_handlers: Dict[str, Callable] = {}
    
    def connect(self):
        """Establece conexión con RabbitMQ"""
        try:
            rabbitmq_url = getattr(settings, 'RABBITMQ_URL', 'amqp://tesis:tesis@rabbitmq:5672/')
            
            parameters = pika.URLParameters(rabbitmq_url)
            self.connection = pika.BlockingConnection(parameters)
            self.channel = self.connection.channel()
            
            # Declarar exchange
            self.channel.exchange_declare(
                exchange=self.EXCHANGE_NAME,
                exchange_type='topic',
                durable=True
            )
            
            # Declarar cola duradera para el dashboard
            self.channel.queue_declare(
                queue=self.QUEUE_NAME,
                durable=True,
                exclusive=False,
                auto_delete=False
            )
            
            # Vincular cola a todos los routing keys que nos interesan
            for routing_key in self.ROUTING_KEYS:
                self.channel.queue_bind(
                    exchange=self.EXCHANGE_NAME,
                    queue=self.QUEUE_NAME,
                    routing_key=routing_key
                )
            
            # Configurar QoS (prefetch)
            self.channel.basic_qos(prefetch_count=1)
            
            logger.info(f"✅ Dashboard consumer connected to RabbitMQ")
            logger.info(f"📥 Listening on exchange: {self.EXCHANGE_NAME}")
            logger.info(f"📋 Queue: {self.QUEUE_NAME}")
            
        except AMQPConnectionError as e:
            logger.error(f"❌ Failed to connect to RabbitMQ: {e}")
            raise
    
    def register_handler(self, event_type: str, handler: Callable):
        """
        Registra un handler para un tipo de evento específico.
        
        Args:
            event_type: Tipo de evento (ej: 'incidente_pendiente')
            handler: Función que procesa el evento
        """
        self.event_handlers[event_type] = handler
        logger.info(f"✅ Registered handler for event type: {event_type}")
    
    def _process_message(self, ch, method, properties, body):
        """Procesa un mensaje recibido de RabbitMQ"""
        try:
            # Parsear JSON
            event_data = json.loads(body)
            event_type = event_data.get('event_type', 'unknown')
            routing_key = method.routing_key
            
            logger.info(f"📨 Received event: {event_type} | Routing key: {routing_key}")
            
            # Buscar handler apropiado
            handler = self.event_handlers.get(event_type)
            
            if handler:
                try:
                    handler(event_data)
                    logger.info(f"✅ Event processed successfully: {event_type}")
                    ch.basic_ack(delivery_tag=method.delivery_tag)
                except Exception as e:
                    logger.error(f"❌ Error processing event {event_type}: {e}")
                    # Rechazar y reencolar para reintentar
                    ch.basic_nack(delivery_tag=method.delivery_tag, requeue=True)
            else:
                # No hay handler, pero confirmamos el mensaje
                logger.warning(f"⚠️ No handler for event type: {event_type}")
                ch.basic_ack(delivery_tag=method.delivery_tag)
                
        except json.JSONDecodeError as e:
            logger.error(f"❌ Invalid JSON in message: {e}")
            # Mensaje malformado, no reencolar
            ch.basic_ack(delivery_tag=method.delivery_tag)
        except Exception as e:
            logger.error(f"❌ Unexpected error processing message: {e}")
            ch.basic_nack(delivery_tag=method.delivery_tag, requeue=True)
    
    def start_consuming(self):
        """Inicia el consumo de mensajes (bloquea el thread)"""
        if not self.channel:
            raise RuntimeError("Not connected to RabbitMQ. Call connect() first.")
        
        logger.info("🎧 Starting to consume incidents events...")
        
        self.channel.basic_consume(
            queue=self.QUEUE_NAME,
            on_message_callback=self._process_message,
            auto_ack=False
        )
        
        try:
            self.channel.start_consuming()
        except KeyboardInterrupt:
            logger.info("⛔ Consumer stopped by user")
            self.stop_consuming()
    
    def stop_consuming(self):
        """Detiene el consumo de mensajes"""
        if self.channel:
            self.channel.stop_consuming()
        if self.connection and not self.connection.is_closed:
            self.connection.close()
        logger.info("🔌 Consumer disconnected from RabbitMQ")


# ===== HANDLERS DE EVENTOS =====

def handle_incident_submitted(event_data: Dict[str, Any]):
    """
    Maneja nuevos incidentes reportados desde la app móvil.
    Actualiza el dashboard en tiempo real.
    """
    from apps.incidents.models import Incident, IncidentEvent
    from django.contrib.gis.geos import Point
    from django.utils.dateutil import parser
    
    try:
        incident_id = event_data.get('incident_id')
        
        # Verificar si ya existe (idempotencia)
        if Incident.objects.filter(id=incident_id).exists():
            logger.info(f"⚠️ Incident {incident_id} already exists, skipping")
            return
        
        # Extraer ubicación
        location_data = event_data.get('location', {})
        latitude = location_data.get('latitude')
        longitude = location_data.get('longitude')
        
        if not latitude or not longitude:
            logger.error(f"❌ Missing location data for incident {incident_id}")
            return
        
        # Crear incidente
        incident = Incident(
            id=incident_id,
            reporter_kind=event_data.get('reporter_kind', 'ciudadano'),
            reporter_id=event_data.get('reporter_id'),
            type=event_data.get('type'),
            title=event_data.get('title', 'Incidente reportado'),
            description=event_data.get('description'),
            location=Point(float(longitude), float(latitude)),
            address=event_data.get('address'),
            status=event_data.get('status', 'incidente_pendiente'),
            incident_day=parser.parse(event_data.get('incident_day')) if event_data.get('incident_day') else None,
            photos_count=event_data.get('photos_count', 0),
        )
        incident.save()
        
        # Registrar evento
        IncidentEvent.objects.create(
            incident=incident,
            event_type='incidente_creado',
            payload=event_data
        )
        
        logger.info(f"✅ Created incident {incident_id} from event")
        
        # TODO: Enviar notificación WebSocket al dashboard
        # TODO: Enviar notificación push a administradores
        
    except Exception as e:
        logger.error(f"❌ Error handling incident_submitted event: {e}")
        raise


def handle_incident_validated(event_data: Dict[str, Any]):
    """Maneja incidentes validados por el administrador"""
    from apps.incidents.models import Incident, IncidentEvent
    
    try:
        incident_id = event_data.get('incident_id')
        incident = Incident.objects.get(id=incident_id)
        
        old_status = incident.status
        incident.status = 'incidente_valido'
        incident.save()
        
        # Registrar evento
        IncidentEvent.objects.create(
            incident=incident,
            event_type='incidente_validado',
            payload=event_data
        )
        
        logger.info(f"✅ Incident {incident_id} validated: {old_status} -> incidente_valido")
        
    except Incident.DoesNotExist:
        logger.warning(f"⚠️ Incident {incident_id} not found for validation")
    except Exception as e:
        logger.error(f"❌ Error handling incident_validated event: {e}")
        raise


def handle_status_updated(event_data: Dict[str, Any]):
    """Maneja cambios de estado de incidentes"""
    from apps.incidents.models import Incident, IncidentEvent
    
    try:
        incident_id = event_data.get('incident_id')
        new_status = event_data.get('new_status')
        
        incident = Incident.objects.get(id=incident_id)
        incident.status = new_status
        incident.save()
        
        # Registrar evento
        IncidentEvent.objects.create(
            incident=incident,
            event_type='estado_actualizado',
            payload=event_data
        )
        
        logger.info(f"✅ Incident {incident_id} status updated to {new_status}")
        
    except Incident.DoesNotExist:
        logger.warning(f"⚠️ Incident {incident_id} not found for status update")
    except Exception as e:
        logger.error(f"❌ Error handling status_updated event: {e}")
        raise


# ===== FUNCIÓN PRINCIPAL =====

def start_dashboard_consumer():
    """
    Inicia el consumer para el dashboard.
    Esta función se debe llamar desde un comando de Django o proceso separado.
    """
    consumer = IncidentDashboardConsumer()
    
    # Registrar handlers
    consumer.register_handler('incidente_pendiente', handle_incident_submitted)
    consumer.register_handler('incidente_validado', handle_incident_validated)
    consumer.register_handler('estado_actualizado', handle_status_updated)
    
    # Conectar y comenzar a consumir
    consumer.connect()
    consumer.start_consuming()
