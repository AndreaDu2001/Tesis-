from rest_framework import serializers
from .models import Report, Statistics


class ReportSerializer(serializers.ModelSerializer):
    report_type_display = serializers.CharField(source='get_report_type_display', read_only=True)
    format_display = serializers.CharField(source='get_format_display', read_only=True)
    generated_by_name = serializers.CharField(source='generated_by.get_full_name', read_only=True)
    
    # Alias en español para frontend
    titulo = serializers.CharField(source='title', read_only=True)
    descripcion = serializers.CharField(source='description', read_only=True)
    tipo_reporte = serializers.CharField(source='report_type', read_only=True)
    formato = serializers.CharField(source='format', read_only=True)
    fecha_inicio = serializers.DateField(source='start_date', read_only=True)
    fecha_fin = serializers.DateField(source='end_date', read_only=True)
    generado_por = serializers.CharField(source='generated_by_name', read_only=True)
    generado = serializers.BooleanField(source='is_generated', read_only=True)
    fecha_generacion = serializers.DateTimeField(source='generated_at', read_only=True)

    class Meta:
        model = Report
        fields = [
            'id', 'report_id', 'title', 'description', 'titulo', 'descripcion',
            'report_type', 'get_report_type_display', 'tipo_reporte',
            'format', 'formato', 'get_format_display',
            'generated_by', 'generated_by_name', 'generado_por',
            'start_date', 'fecha_inicio', 'end_date', 'fecha_fin',
            'filters', 'file_path', 'file_url', 'file_size',
            'is_generated', 'generado', 'generated_at', 'fecha_generacion',
            'data', 'created_at', 'updated_at'
        ]
        read_only_fields = ['report_id', 'generated_by', 'is_generated', 'generated_at', 'file_size']


class StatisticsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Statistics
        fields = '__all__'
