"""
Serializers para la API REST de incidencias.
"""

from rest_framework import serializers
from django.contrib.gis.geos import Point
from .models import Incident, IncidentAttachment, IncidentEvent


class IncidentAttachmentSerializer(serializers.ModelSerializer):
    """Serializer para adjuntos de incidentes"""
    
    class Meta:
        model = IncidentAttachment
        fields = ['id', 'file_url', 'mime_type', 'size_bytes', 'created_at']
        read_only_fields = ['id', 'created_at']


class IncidentEventSerializer(serializers.ModelSerializer):
    """Serializer para eventos/historial de incidentes"""
    
    class Meta:
        model = IncidentEvent
        fields = ['id', 'event_type', 'payload', 'created_at']
        read_only_fields = ['id', 'created_at']


class IncidentSerializer(serializers.ModelSerializer):
    """Serializer principal para incidentes"""
    
    latitude = serializers.FloatField(write_only=True)
    longitude = serializers.FloatField(write_only=True)
    
    # Campos calculados para lectura
    lat = serializers.SerializerMethodField()
    lon = serializers.SerializerMethodField()
    
    attachments = IncidentAttachmentSerializer(many=True, read_only=True)
    events = IncidentEventSerializer(many=True, read_only=True)
    
    class Meta:
        model = Incident
        fields = [
            'id', 'reporter_kind', 'reporter_id', 
            'type', 'title', 'description',
            'latitude', 'longitude', 'lat', 'lon',
            'address', 'status', 'incident_day', 'photos_count',
            'idempotency_key', 
            'attachments', 'events',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'reporter_id', 'created_at', 'updated_at']
    
    def get_lat(self, obj):
        """Retorna latitud del punto"""
        return obj.latitude
    
    def get_lon(self, obj):
        """Retorna longitud del punto"""
        return obj.longitude
    
    def create(self, validated_data):
        """Crea un incidente con ubicación geográfica"""
        latitude = validated_data.pop('latitude')
        longitude = validated_data.pop('longitude')
        
        # Crear Point de PostGIS
        validated_data['location'] = Point(longitude, latitude)
        
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        """Actualiza un incidente"""
        if 'latitude' in validated_data and 'longitude' in validated_data:
            latitude = validated_data.pop('latitude')
            longitude = validated_data.pop('longitude')
            validated_data['location'] = Point(longitude, latitude)
        
        return super().update(instance, validated_data)


class IncidentCreateSerializer(serializers.ModelSerializer):
    """
    Serializer para crear incidentes desde app móvil.
    Compatible con el formato del incident-service de Go.
    """
    
    latitude = serializers.FloatField(required=True)
    longitude = serializers.FloatField(required=True)
    idempotency_key = serializers.CharField(
        required=False, 
        allow_blank=True,
        help_text='Clave para prevenir duplicados (offline-first)'
    )
    photo_url = serializers.URLField(
        required=False,
        allow_blank=True,
        help_text='URL de foto/evidencia inicial'
    )
    
    class Meta:
        model = Incident
        fields = [
            'idempotency_key',
            'type', 'title', 'description',
            'latitude', 'longitude', 'address',
            'photo_url'
        ]
    
    def validate(self, data):
        """Validaciones adicionales"""
        # Validar rango de coordenadas
        if not (-90 <= data['latitude'] <= 90):
            raise serializers.ValidationError({
                'latitude': 'Debe estar entre -90 y 90'
            })
        if not (-180 <= data['longitude'] <= 180):
            raise serializers.ValidationError({
                'longitude': 'Debe estar entre -180 y 180'
            })
        
        # Si hay idempotency_key, verificar que no exista
        idempotency_key = data.get('idempotency_key')
        if idempotency_key:
            if Incident.objects.filter(idempotency_key=idempotency_key).exists():
                raise serializers.ValidationError({
                    'idempotency_key': 'Ya existe un incidente con esta clave'
                })
        
        return data
    
    def create(self, validated_data):
        """Crea incidente con ubicación y foto inicial"""
        latitude = validated_data.pop('latitude')
        longitude = validated_data.pop('longitude')
        photo_url = validated_data.pop('photo_url', None)
        
        # Crear punto geográfico
        validated_data['location'] = Point(longitude, latitude)
        
        # Configurar valores por defecto
        validated_data['reporter_kind'] = 'ciudadano'
        validated_data['status'] = 'incidente_pendiente'
        
        # Obtener reporter_id del usuario actual (si está autenticado)
        request = self.context.get('request')
        if request and hasattr(request, 'user') and request.user.is_authenticated:
            validated_data['reporter_id'] = request.user.id
        
        # Crear incidente
        incident = Incident.objects.create(**validated_data)
        
        # Si hay foto inicial, crear adjunto
        if photo_url:
            IncidentAttachment.objects.create(
                incident=incident,
                file_url=photo_url,
                mime_type='image/jpeg'
            )
            incident.photos_count = 1
            incident.save()
        
        return incident


class IncidentUpdateStatusSerializer(serializers.Serializer):
    """Serializer para actualizar el estado de un incidente"""
    
    status = serializers.ChoiceField(
        choices=Incident._meta.get_field('status').choices,
        help_text='Nuevo estado del incidente'
    )
    notes = serializers.CharField(
        required=False,
        allow_blank=True,
        help_text='Notas adicionales sobre el cambio'
    )


class IncidentValidationSerializer(serializers.Serializer):
    """Serializer para validar/rechazar incidentes por administradores"""
    
    action = serializers.ChoiceField(
        choices=['validate', 'reject'],
        help_text='Acción a realizar: validate o reject'
    )
    notes = serializers.CharField(
        required=False,
        allow_blank=True,
        help_text='Notas/razón de la decisión'
    )
