#!/usr/bin/env python
"""
Script para cargar datos de prueba en el sistema.
Útil para validar la UI con datos en todos los servicios.
"""
import os
import sys
import django
from datetime import datetime, timedelta
from django.contrib.gis.geos import Point

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
django.setup()

from django.contrib.auth import get_user_model
from apps.incidents.models import Incident, IncidentType, IncidentStatus
from apps.tasks.models import Task
from apps.notifications.models import Notification
from apps.routes.models import Route, CleaningZone
from apps.reports.models import Report
import uuid

User = get_user_model()


def create_sample_data():
    """Crear datos de prueba en la BD."""
    
    print("🚀 Iniciando carga de datos de prueba...")
    
    # Obtener o crear usuarios
    try:
        admin = User.objects.get(username='admin')
    except User.DoesNotExist:
        admin = User.objects.create_superuser(
            username='admin',
            email='admin@latacunga.ec',
            password='admin123'
        )
        print("✅ Usuario admin creado")
    
    # Crear algunas zonas si no existen
    if CleaningZone.objects.count() == 0:
        zones = [
            CleaningZone.objects.create(
                zone_name='Centro Histórico',
                description='Zona del centro de la ciudad',
                zone_polygon=Point([-0.9315, -0.9369]).buffer(0.01),
                priority=5,
                frequency='daily',
                estimated_duration_minutes=120,
                assigned_team_size=4,
                status='active'
            ),
            CleaningZone.objects.create(
                zone_name='Parque Industrial',
                description='Zona industrial',
                zone_polygon=Point([-0.9400, -0.9400]).buffer(0.02),
                priority=4,
                frequency='weekly',
                estimated_duration_minutes=180,
                assigned_team_size=6,
                status='active'
            ),
        ]
        print(f"✅ {len(zones)} zonas de limpieza creadas")
    
    # Crear tareas de ejemplo
    if Task.objects.count() < 5:
        now = datetime.now().date()
        for i in range(5):
            Task.objects.create(
                task_id=f"TASK-{i+1:04d}",
                title=f"Limpieza de zona {i+1}",
                description=f"Limpieza programada de la zona {i+1}",
                status=['pending', 'assigned', 'in_progress', 'completed', 'pending'][i],
                priority=i % 5 + 1,
                location=Point(-0.9315 + i*0.001, -0.9369 + i*0.001),
                address=f"Calle Principal {i+1}, Latacunga",
                scheduled_date=now + timedelta(days=i),
                scheduled_start_time=None,
                estimated_duration=120 + i*30,
                team_size=3 + i,
                completion_percentage=i*20 if i < 5 else 100,
                created_by=admin
            )
        print("✅ 5 tareas de prueba creadas")
    
    # Crear notificaciones de ejemplo
    if Notification.objects.count() < 5:
        notification_types = ['TASK', 'INCIDENT', 'ROUTE', 'SYSTEM']
        for i in range(5):
            Notification.objects.create(
                notification_id=str(uuid.uuid4()),
                user=admin,
                notification_type=notification_types[i % len(notification_types)],
                title=f"Notificación {i+1}",
                message=f"Mensaje de notificación de prueba número {i+1}",
                priority=['LOW', 'MEDIUM', 'HIGH', 'URGENT', 'LOW'][i],
                is_read=i > 2,
                is_sent=True,
                is_delivered=True,
                created_by=admin
            )
        print("✅ 5 notificaciones de prueba creadas")
    
    # Crear reportes de ejemplo
    if Report.objects.count() < 3:
        now = datetime.now()
        for i in range(3):
            Report.objects.create(
                report_id=f"RPT-{i+1:04d}",
                title=f"Reporte {['Diario', 'Semanal', 'Mensual'][i]}",
                description=f"Reporte {['diario', 'semanal', 'mensual'][i]} del sistema",
                report_type=['daily', 'weekly', 'monthly'][i],
                format='pdf',
                generated_by=admin,
                start_date=now.date() - timedelta(days=30),
                end_date=now.date(),
                is_generated=True,
                generated_at=now,
                data={}
            )
        print("✅ 3 reportes de prueba creados")
    
    print("\n✨ Carga de datos completada exitosamente!")
    print(f"📊 Resumen:")
    print(f"  - Tareas: {Task.objects.count()}")
    print(f"  - Notificaciones: {Notification.objects.count()}")
    print(f"  - Reportes: {Report.objects.count()}")
    print(f"  - Incidentes: {Incident.objects.count()}")
    print(f"  - Zonas: {CleaningZone.objects.count()}")


if __name__ == '__main__':
    create_sample_data()
