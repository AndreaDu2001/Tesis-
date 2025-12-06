"""
Servicio de eventos para publicar incidencias a RabbitMQ.
Compatible con el incident-service de Go (latacunga_clean_app).

Exchange: city.cleaning.incidents (tipo: topic)
Routing Keys:
  - incidents.submitted.v1 (nuevo incidente desde app móvil)
  - incidents.validated.v1 (incidente validado por admin)
  - incidents.rejected.v1 (incidente rechazado)
  - incidents.status_updated.v1 (cambio de estado)
  - incidents.attachment_added.v1 (nueva foto/evidencia)
"""

import json
import logging
from datetime import datetime
from typing import Dict, Any, Optional
from django.conf import settings

try:
    import pika
    from pika.exceptions import AMQPConnectionError, AMQPChannelError
    PIKA_AVAILABLE = True
except Exception:  # pragma: no cover - optional in dev
    pika = None
    AMQPConnectionError = Exception
    AMQPChannelError = Exception
    PIKA_AVAILABLE = False

logger = logging.getLogger(__name__)


class IncidentEventService:
    """
    Servicio para publicar eventos de incidentes a RabbitMQ.
    Implementa el mismo patrón que el incident-service de Go.
    """
    
    EXCHANGE_NAME = 'city.cleaning.incidents'
    EXCHANGE_TYPE = 'topic'
    
    # Routing keys según el sistema de Go
    ROUTING_KEY_SUBMITTED = 'incidents.submitted.v1'
    ROUTING_KEY_VALIDATED = 'incidents.validated.v1'
    ROUTING_KEY_REJECTED = 'incidents.rejected.v1'
    ROUTING_KEY_STATUS_UPDATED = 'incidents.status_updated.v1'
    ROUTING_KEY_ATTACHMENT_ADDED = 'incidents.attachment_added.v1'
    
    def __init__(self):
        self.connection = None
        self.channel = None
        if PIKA_AVAILABLE:
            self._connect()
        else:
            logging.getLogger(__name__).info("pika no está disponible; Incident events deshabilitados en este entorno")
    
    def _connect(self):
        """Establece conexión con RabbitMQ"""
        try:
            rabbitmq_url = getattr(settings, 'RABBITMQ_URL', 'amqp://tesis:tesis@rabbitmq:5672/')
            
            parameters = pika.URLParameters(rabbitmq_url)
            self.connection = pika.BlockingConnection(parameters)
            self.channel = self.connection.channel()
            
            # Declarar exchange (idempotente)
            self.channel.exchange_declare(
                exchange=self.EXCHANGE_NAME,
                exchange_type=self.EXCHANGE_TYPE,
                durable=True
            )
            
            logger.info(f"✅ Connected to RabbitMQ. Exchange '{self.EXCHANGE_NAME}' ready.")
            
        except AMQPConnectionError as e:
            logger.warning(f"⚠️ RabbitMQ not available: {e}. Events will not be published.")
            self.connection = None
            self.channel = None
        except Exception as e:
            logger.error(f"❌ Error connecting to RabbitMQ: {e}")
            self.connection = None
            self.channel = None
    
    def _ensure_connection(self):
        """Verifica y restablece la conexión si es necesario"""
        if self.connection is None or self.connection.is_closed:
            logger.info("Reconnecting to RabbitMQ...")
            self._connect()
    
    def publish_event(self, routing_key: str, payload: Dict[str, Any]) -> bool:
        """
        Publica un evento a RabbitMQ.
        
        Args:
            routing_key: Routing key para el mensaje
            payload: Datos del evento
            
        Returns:
            True si se publicó exitosamente, False en caso contrario
        """
        self._ensure_connection()
        
        if self.channel is None:
            logger.warning("⚠️ RabbitMQ not connected, skipping event publication")
            return False
        
        try:
            # Añadir timestamp del evento
            payload['event_timestamp'] = datetime.utcnow().isoformat() + 'Z'
            
            # Convertir a JSON
            body = json.dumps(payload, default=str)
            
            # Publicar mensaje
            self.channel.basic_publish(
                exchange=self.EXCHANGE_NAME,
                routing_key=routing_key,
                body=body,
                properties=pika.BasicProperties(
                    content_type='application/json',
                    delivery_mode=2,  # Persistent
                    timestamp=int(datetime.utcnow().timestamp())
                )
            )
            
            logger.info(f"📤 Event published -> Exchange: {self.EXCHANGE_NAME} | Key: {routing_key}")
            return True
            
        except AMQPChannelError as e:
            logger.error(f"❌ Channel error publishing event: {e}")
            self.channel = None
            return False
        except Exception as e:
            logger.error(f"❌ Failed to publish event: {e}")
            return False
    
    def publish_incident_submitted(self, incident) -> bool:
        """
        Publica evento cuando se crea un nuevo incidente desde la app móvil.
        Este evento será consumido por el validation-service.
        """
        payload = incident.to_event_payload()
        payload['event_type'] = 'incidente_pendiente'
        
        return self.publish_event(self.ROUTING_KEY_SUBMITTED, payload)
    
    def publish_incident_validated(self, incident, validator_id: str, notes: Optional[str] = None) -> bool:
        """
        Publica evento cuando un administrador valida un incidente.
        """
        payload = incident.to_event_payload()
        payload.update({
            'event_type': 'incidente_validado',
            'validator_id': validator_id,
            'validated_at': datetime.utcnow().isoformat() + 'Z',
            'notes': notes,
        })
        
        return self.publish_event(self.ROUTING_KEY_VALIDATED, payload)
    
    def publish_incident_rejected(self, incident, validator_id: str, reason: str) -> bool:
        """
        Publica evento cuando un administrador rechaza un incidente.
        """
        payload = incident.to_event_payload()
        payload.update({
            'event_type': 'incidente_rechazado',
            'validator_id': validator_id,
            'rejected_at': datetime.utcnow().isoformat() + 'Z',
            'reason': reason,
        })
        
        return self.publish_event(self.ROUTING_KEY_REJECTED, payload)
    
    def publish_status_updated(self, incident, old_status: str, new_status: str) -> bool:
        """
        Publica evento cuando cambia el estado de un incidente.
        """
        payload = incident.to_event_payload()
        payload.update({
            'event_type': 'estado_actualizado',
            'old_status': old_status,
            'new_status': new_status,
        })
        
        return self.publish_event(self.ROUTING_KEY_STATUS_UPDATED, payload)
    
    def publish_attachment_added(self, incident, attachment) -> bool:
        """
        Publica evento cuando se agrega una foto/evidencia.
        """
        payload = incident.to_event_payload()
        payload.update({
            'event_type': 'attachment_added',
            'attachment': {
                'id': str(attachment.id),
                'file_url': attachment.file_url,
                'mime_type': attachment.mime_type,
                'size_bytes': attachment.size_bytes,
            }
        })
        
        return self.publish_event(self.ROUTING_KEY_ATTACHMENT_ADDED, payload)
    
    def close(self):
        """Cierra la conexión con RabbitMQ"""
        if self.connection and not self.connection.is_closed:
            self.connection.close()
            logger.info("🔌 RabbitMQ connection closed")


# Instancia global del servicio
_incident_event_service = None


def get_incident_event_service() -> IncidentEventService:
    """Retorna una instancia singleton del servicio de eventos"""
    global _incident_event_service
    if _incident_event_service is None:
        _incident_event_service = IncidentEventService()
    return _incident_event_service
