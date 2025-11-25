from django.contrib import admin
from django.contrib.gis.admin import OSMGeoAdmin
from .models import Incident, IncidentAttachment, IncidentEvent, OutboxEvent


@admin.register(Incident)
class IncidentAdmin(OSMGeoAdmin):
    """Admin para incidentes con soporte de mapas"""
    
    list_display = ['id', 'title', 'type', 'status', 'reporter_kind', 'incident_day', 'created_at']
    list_filter = ['status', 'type', 'reporter_kind', 'created_at']
    search_fields = ['title', 'description', 'address']
    readonly_fields = ['id', 'created_at', 'updated_at', 'photos_count']
    
    fieldsets = (
        ('Información Principal', {
            'fields': ('id', 'type', 'title', 'description', 'status')
        }),
        ('Reportante', {
            'fields': ('reporter_kind', 'reporter_id')
        }),
        ('Ubicación', {
            'fields': ('location', 'address')
        }),
        ('Detalles', {
            'fields': ('incident_day', 'photos_count', 'idempotency_key')
        }),
        ('Metadatos', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(IncidentAttachment)
class IncidentAttachmentAdmin(admin.ModelAdmin):
    """Admin para adjuntos"""
    
    list_display = ['id', 'incident', 'file_url', 'mime_type', 'created_at']
    list_filter = ['created_at', 'mime_type']
    search_fields = ['incident__title', 'file_url']
    readonly_fields = ['id', 'created_at']


@admin.register(IncidentEvent)
class IncidentEventAdmin(admin.ModelAdmin):
    """Admin para eventos/historial"""
    
    list_display = ['id', 'incident', 'event_type', 'created_at']
    list_filter = ['event_type', 'created_at']
    search_fields = ['incident__title', 'event_type']
    readonly_fields = ['id', 'created_at', 'payload']


@admin.register(OutboxEvent)
class OutboxEventAdmin(admin.ModelAdmin):
    """Admin para eventos outbox (monitoreo)"""
    
    list_display = ['id', 'aggregate_type', 'event_type', 'status', 'attempts', 'created_at']
    list_filter = ['status', 'aggregate_type', 'event_type', 'created_at']
    readonly_fields = ['id', 'created_at', 'published_at']
    
    actions = ['retry_failed_events']
    
    def retry_failed_events(self, request, queryset):
        """Acción para reintentar eventos fallidos"""
        # TODO: Implementar retry logic
        self.message_user(request, "Reintentar eventos no implementado aún")
    retry_failed_events.short_description = "Reintentar eventos fallidos"
