import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  DirectionsCar,
  ReportProblem,
  CheckCircle,
  Schedule,
} from '@mui/icons-material';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import incidenciasService from '../../services/incidenciasService';
import conductoresService from '../../services/conductoresService';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

interface Stats {
  total_incidencias: number;
  pendientes: number;
  asignadas: number;
  resueltas: number;
  por_tipo?: Record<string, number>;
  por_zona?: Record<string, number>;
}

interface MisRutasResponse {
  total: number;
  asignado: number;
  iniciado: number;
  completado: number;
}

const StatCard: React.FC<{ title: string; value: number; icon: React.ReactNode; color: string; }> = ({ title, value, icon, color }) => (
  <Card sx={{ height: '100%', background: `linear-gradient(135deg, ${color}22 0%, ${color}11 100%)`, border: `1px solid ${color}44` }}>
    <CardContent>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography color="textSecondary" gutterBottom variant="body2">
            {title}
          </Typography>
          <Typography variant="h4" component="div" sx={{ color, fontWeight: 'bold' }}>
            {value}
          </Typography>
        </Box>
        <Box sx={{ color, opacity: 0.7, fontSize: '3rem' }}>
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [rutasStats, setRutasStats] = useState<MisRutasResponse | null>(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [incidenciasData, rutasData] = await Promise.all([
        incidenciasService.estadisticasIncidencias(),
        conductoresService.misRutasTodas().catch(() => ({ total: 0, asignado: 0, iniciado: 0, completado: 0 })),
      ]);
      
      setStats(incidenciasData);
      setRutasStats(rutasData);
    } catch (err: any) {
      console.error('Error cargando dashboard:', err);
      setError('Error al cargar estadísticas. Verifica la conexión con el backend.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error || !stats) {
    return (
      <Box p={3}>
        <Alert severity="error">{error || 'No se pudieron cargar las estadísticas'}</Alert>
      </Box>
    );
  }

  const dataPorTipo = stats.por_tipo ? Object.entries(stats.por_tipo).map(([name, value]) => ({ name, value })) : [];
  const dataPorZona = stats.por_zona ? Object.entries(stats.por_zona).map(([name, value]) => ({ name, value })) : [];

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        Dashboard - Sistema EPAGAL Latacunga
      </Typography>

      {/* KPI Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Incidencias"
            value={stats.total_incidencias || 0}
            icon={<ReportProblem />}
            color="#f44336"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Pendientes"
            value={stats.pendientes || 0}
            icon={<Schedule />}
            color="#ff9800"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="En Ruta"
            value={rutasStats?.iniciado || 0}
            icon={<DirectionsCar />}
            color="#2196f3"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Completadas"
            value={rutasStats?.completado || 0}
            icon={<CheckCircle />}
            color="#4caf50"
          />
        </Grid>
      </Grid>

      {/* Gráficos */}
      <Grid container spacing={3}>
        {/* Incidencias por Tipo */}
        {dataPorTipo.length > 0 && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Incidencias por Tipo
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={dataPorTipo}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {dataPorTipo.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Incidencias por Zona */}
        {dataPorZona.length > 0 && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Incidencias por Zona
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dataPorZona}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Estado de Rutas */}
        {rutasStats && rutasStats.total > 0 && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Estado de Rutas Asignadas
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={[
                      { estado: 'Asignadas', cantidad: rutasStats.asignado },
                      { estado: 'En Progreso', cantidad: rutasStats.iniciado },
                      { estado: 'Completadas', cantidad: rutasStats.completado },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="estado" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="cantidad" fill="#4caf50" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Resumen General */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Resumen General
              </Typography>
              <Box mt={2}>
                <Typography variant="body1">
                  <strong>Total de Rutas:</strong> {rutasStats?.total || 0}
                </Typography>
                <Typography variant="body1" mt={1}>
                  <strong>Incidencias Asignadas:</strong> {stats.asignadas || 0}
                </Typography>
                <Typography variant="body1" mt={1}>
                  <strong>Incidencias Resueltas:</strong> {stats.resueltas || 0}
                </Typography>
                <Typography variant="body2" color="textSecondary" mt={2}>
                  Última actualización: {new Date().toLocaleString('es-EC')}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
