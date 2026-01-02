import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  Stack,
  SelectChangeEvent,
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  Map as MapIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { API_BASE_URL } from '../config/api';

interface Reporte {
  id: string;
  description: string;
  type: string;
  priority_score: number;
  address: string | null;
  state: string;
  location_lat: number | null;
  location_lon: number | null;
  created_at: string;
  updated_at: string;
}

interface Operador {
  id: string;
  email: string;
  username: string;
  display_name: string;
  phone: string | null;
}

const ReportesPage: React.FC = () => {
  const [reportes, setReportes] = useState<Reporte[]>([]);
  const [operadores, setOperadores] = useState<Operador[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedReporte, setSelectedReporte] = useState<Reporte | null>(null);
  const [selectedOperador, setSelectedOperador] = useState<string>('');

  const normalizeReporte = (raw: any): Reporte => {
    const status = raw.state || raw.status || 'ENVIADO';
    const type = (raw.type || '').toUpperCase();

    return {
      id: raw.id,
      description: raw.description || 'Sin descripción',
      type: type === 'CRITICO' ? 'ZONA_CRITICA' : type === 'ACOPIO' ? 'PUNTO_ACOPIO_LLENO' : raw.type || 'SIN_TIPO',
      priority_score: raw.priority_score ?? (type === 'CRITICO' ? 8 : 5),
      address: raw.address ?? null,
      state: status,
      location_lat: raw.location_lat ?? raw.lat ?? null,
      location_lon: raw.location_lon ?? raw.lon ?? null,
      created_at: raw.created_at,
      updated_at: raw.updated_at,
    };
  };

  const fetchReportes = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/reportes/`);
      if (!response.ok) throw new Error('Error al cargar reportes');
      const data = await response.json();
      setReportes(Array.isArray(data) ? data.map(normalizeReporte) : []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const fetchOperadores = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/operadores/`);
      if (!response.ok) throw new Error('Error al cargar operadores');
      const data = await response.json();
      setOperadores(data);
    } catch (err) {
      console.error('Error al cargar operadores:', err);
    }
  };

  useEffect(() => {
    fetchReportes();
    fetchOperadores();
  }, []);

  const handleAssignClick = (reporte: Reporte) => {
    setSelectedReporte(reporte);
    setAssignDialogOpen(true);
  };

  const handleAssignOperador = async () => {
    if (!selectedReporte || !selectedOperador) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/reportes/${selectedReporte.id}/asignar-operador?operador_id=${selectedOperador}`,
        { method: 'POST' }
      );
      
      if (!response.ok) throw new Error('Error al asignar operador');
      
      setAssignDialogOpen(false);
      setSelectedOperador('');
      fetchReportes(); // Recargar lista
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al asignar');
    }
  };

  const getStateColor = (state: string) => {
    switch (state) {
      case 'ENVIADO': return 'warning';
      case 'EN_PROCESO': return 'info';
      case 'COMPLETADO': return 'success';
      case 'CERRADO': return 'default';
      default: return 'default';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'ZONA_CRITICA': return 'Zona Crítica';
      case 'PUNTO_ACOPIO_LLENO': return 'Punto de Acopio Lleno';
      default: return type;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          📋 Reportes de Incidencias
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchReportes}
        >
          Actualizar
        </Button>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Tipo</TableCell>
                <TableCell>Descripción</TableCell>
                <TableCell>Dirección</TableCell>
                <TableCell align="center">Prioridad</TableCell>
                <TableCell align="center">Estado</TableCell>
                <TableCell>Fecha Creación</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reportes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography variant="body2" color="text.secondary" py={3}>
                      No hay reportes disponibles. Los reportes de la APK aparecerán aquí.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                reportes.map((reporte) => (
                  <TableRow key={reporte.id} hover>
                    <TableCell>
                      <Chip
                        label={getTypeLabel(reporte.type)}
                        size="small"
                        color={reporte.type === 'ZONA_CRITICA' ? 'error' : 'warning'}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" noWrap maxWidth={300}>
                        {reporte.description}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" noWrap maxWidth={200}>
                        {reporte.address || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={reporte.priority_score.toFixed(1)}
                        size="small"
                        color={reporte.priority_score > 7 ? 'error' : reporte.priority_score > 4 ? 'warning' : 'default'}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={reporte.state}
                        size="small"
                        color={getStateColor(reporte.state)}
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(reporte.created_at).toLocaleDateString('es-ES')}
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<AssignmentIcon />}
                          onClick={() => handleAssignClick(reporte)}
                          disabled={reporte.state === 'COMPLETADO' || reporte.state === 'CERRADO'}
                        >
                          Asignar
                        </Button>
                        {reporte.location_lat && reporte.location_lon && (
                          <Button
                            size="small"
                            variant="text"
                            startIcon={<MapIcon />}
                            onClick={() => {
                              window.open(
                                `https://www.google.com/maps?q=${reporte.location_lat},${reporte.location_lon}`,
                                '_blank'
                              );
                            }}
                          >
                            Ver
                          </Button>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Dialog para asignar operador */}
      <Dialog open={assignDialogOpen} onClose={() => setAssignDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Asignar Operador</DialogTitle>
        <DialogContent>
          {selectedReporte && (
            <Box mb={2}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Reporte: {selectedReporte.description}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tipo: {getTypeLabel(selectedReporte.type)}
              </Typography>
            </Box>
          )}

          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Seleccionar Operador</InputLabel>
            <Select
              value={selectedOperador}
              onChange={(e: SelectChangeEvent) => setSelectedOperador(e.target.value)}
              label="Seleccionar Operador"
            >
              {operadores.length === 0 ? (
                <MenuItem disabled>No hay operadores disponibles</MenuItem>
              ) : (
                operadores.map((op) => (
                  <MenuItem key={op.id} value={op.id}>
                    {op.display_name} ({op.email})
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignDialogOpen(false)}>Cancelar</Button>
          <Button
            onClick={handleAssignOperador}
            variant="contained"
            disabled={!selectedOperador}
          >
            Asignar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ReportesPage;
