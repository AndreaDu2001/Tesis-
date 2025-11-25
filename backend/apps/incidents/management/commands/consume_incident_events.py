"""
Comando Django para iniciar el consumer de eventos de incidencias.

Uso:
    python manage.py consume_incident_events
"""

from django.core.management.base import BaseCommand
from apps.incidents.incident_consumer import start_dashboard_consumer


class Command(BaseCommand):
    help = 'Inicia el consumer de eventos RabbitMQ para el dashboard de incidencias'
    
    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('='*60))
        self.stdout.write(self.style.SUCCESS('🚀 INCIDENT EVENTS CONSUMER'))
        self.stdout.write(self.style.SUCCESS('='*60))
        self.stdout.write('')
        self.stdout.write('Iniciando consumer para el dashboard de administración...')
        self.stdout.write('Exchange: city.cleaning.incidents')
        self.stdout.write('Queue: dashboard.incidents.queue')
        self.stdout.write('')
        self.stdout.write(self.style.WARNING('Presiona Ctrl+C para detener'))
        self.stdout.write('')
        
        try:
            start_dashboard_consumer()
        except KeyboardInterrupt:
            self.stdout.write('')
            self.stdout.write(self.style.SUCCESS('✅ Consumer detenido correctamente'))
        except Exception as e:
            self.stdout.write('')
            self.stdout.write(self.style.ERROR(f'❌ Error: {e}'))
            raise
