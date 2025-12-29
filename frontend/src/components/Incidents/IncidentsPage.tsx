import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  Box,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
  LocationOn as LocationIcon,
  Delete as DeleteIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import IncidenciasService from '../../services/incidenciasService';
import { toErrorMessage } from '../../services/errorUtils';

// Fix para íconos de Leaflet en React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

interface Incident {
  id: number;
  tipo: string;
  descripcion: string;
  gravedad: number;
  estado: string;
  lat?: number;
  lon?: number;
  zona: string;
  usuario_id?: number;
  reportado_en?: string;
  created_at?: string;
}

const INCIDENT_TYPES = [
  { value: 'ACUMULACION', label: 'Acumulación de Residuos' },
  { value: 'CONTENEDOR', label: 'Contenedor Dañado' },
  { value: 'DERRAME', label: 'Derrame' },
  { value: 'OTRO', label: 'Otro' },
];

const GRAVEDAD_LEVELS = [
  { value: 1, label: 'Baja', color: '#4caf50' },
  { value: 2, label: 'Media', color: '#ff9800' },
  { value: 3, label: 'Alta', color: '#f44336' },
  { value: 4, label: 'Crítica', color: '#d32f2f' },
];

const STATUS_OPTIONS = [
  { value: 'abierta', label: 'Abierta', color: '#757575' },
  { value: 'en_proceso', label: 'En Proceso', color: '#2196f3' },
  { value: 'resuelta', label: 'Resuelta', color: '#4caf50' },
  { value: 'cancelada', label: 'Cancelada', color: '#f44336' },
];

const IncidentsPage: React.FC = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    tipo: 'ACUMULACION',
    descripcion: '',
    gravedad: 2,
    zona: 'Latacunga',
    latitud: -0.9346,
    longitud: -78.6156,
  });

  useEffect(() => {
    loadIncidents();
  }, []);

  const loadIncidents = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await IncidenciasService.listarIncidencias();
      setIncidents(Array.isArray(data) ? data : (data.results || data));
    } catch (err: any) {
      setError(toErrorMessage(err) || 'Error al cargar incidencias');
      console.error('Error loading incidents:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateIncident = async () => {
    try {
      const payload = {
        tipo: formData.tipo,
        descripcion: formData.descripcion,
        gravedad: Number(formData.gravedad),
        lat: formData.latitud,
        lon: formData.longitud,
        zona: formData.zona,
      };
      
      await IncidenciasService.crearIncidencia(payload);
      setOpenDialog(false);
      resetForm();
      loadIncidents();
    } catch (err: any) {
      setError(toErrorMessage(err) || 'Error al crear incidencia');
    }
  };

  const handleUpdateStatus = async (id: number, estado: string) => {
    try {
      await IncidenciasService.actualizarIncidencia(id, { estado });
      loadIncidents();
    } catch (err: any) {
      setError(toErrorMessage(err) || 'Error al actualizar estado');
    }
  };

  const handleDeleteIncident = async (id: number) => {
    if (!window.confirm('¿Está seguro de eliminar esta incidencia?')) return;
    
    try {
      await IncidenciasService.eliminarIncidencia(id);
      loadIncidents();
    } catch (err: any) {
      setError(toErrorMessage(err) || 'Error al eliminar incidencia');
    }
  };

  const resetForm = () => {
    setFormData({
      tipo: 'ACUMULACION',
      descripcion: '',
      gravedad: 2,
      zona: 'Latacunga',
      latitud: -0.9346,
      longitud: -78.6156,
    });
  };

  const getGravedadColor = (gravedad: number) => {
    return GRAVEDAD_LEVELS.find(p => p.value === gravedad)?.color || '#757575';
  };

  const getStatusColor = (estado: string) => {
    return STATUS_OPTIONS.find(s => s.value === estado)?.color || '#757575';
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          <WarningIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Gestión de Incidencias
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadIncidents}
            sx={{ mr: 2 }}
          >
            Actualizar
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenDialog(true)}
          >
            Nueva Incidencia
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Mapa */}
          <Paper sx={{ p: 2, mb: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Mapa de Incidencias
            </Typography>
            <MapContainer
              center={[-0.9346, -78.6156]}
              zoom={13}
              style={{ height: '350px', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              />
              {incidents
                .map((incident) => {
                  const lat = incident.lat;
                  const lon = incident.lon;
                  if (lat === undefined || lon === undefined) return null;
                  return (
                    <Marker
                      key={incident.id}
                      position={[lat, lon]}
                    >
                      <Popup>
                        <strong>{INCIDENT_TYPES.find(t => t.value === incident.tipo)?.label || incident.tipo}</strong>
                        <br />
                        {incident.descripcion}
                        <br />
                        <Chip
                          label={`Gravedad ${incident.gravedad ?? 1}`}
                          size="small"
                          sx={{
                            mt: 1,
                            bgcolor: getGravedadColor(incident.gravedad ?? 1),
                            color: 'white',
                          }}
                        />
                      </Popup>
                    </Marker>
                  );
                })
                .filter(Boolean)}
            </MapContainer>
          </Paper>

          {/* Lista de Incidencias */}
          <Grid container spacing={3}>
            {incidents.map((incident) => (
              <Grid item xs={12} sm={6} md={4} key={incident.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Chip
                        label={INCIDENT_TYPES.find(t => t.value === incident.tipo)?.label}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                      <Chip
                        label={`Gravedad ${incident.gravedad}`}
                        size="small"
                        sx={{
                          bgcolor: getGravedadColor(incident.gravedad),
                          color: 'white',
                        }}
                      />
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {incident.descripcion}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <LocationIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                      <Typography variant="caption" color="text.secondary">
                        Zona: {incident.zona}
                      </Typography>
                    </Box>

                    <Chip
                      label={STATUS_OPTIONS.find(s => s.value === incident.estado)?.label || 'Reportada'}
                      size="small"
                      sx={{
                        bgcolor: getStatusColor(incident.estado || 'REPORTADA'),
                        color: 'white',
                      }}
                    />

                    <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 1 }}>
                      Creado: {incident.created_at ? new Date(incident.created_at).toLocaleDateString() : 'N/D'}
                    </Typography>
                  </CardContent>
                  
                  <CardActions>
                    <TextField
                      select
                      size="small"
                      value={incident.estado}
                      onChange={(e) => handleUpdateStatus(incident.id, e.target.value)}
                      sx={{ flexGrow: 1 }}
                    >
                      {STATUS_OPTIONS.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </TextField>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteIncident(incident.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>

          {incidents.length === 0 && (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary">
                No hay incidencias registradas
              </Typography>
            </Paper>
          )}
        </>
      )}

      {/* Dialog para crear incidencia */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Nueva Incidencia</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="Tipo de Incidencia"
                value={formData.tipo}
                onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
              >
                {INCIDENT_TYPES.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Descripción"
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Gravedad"
                value={formData.gravedad}
                onChange={(e) => setFormData({ ...formData, gravedad: Number(e.target.value) })}
              >
                {GRAVEDAD_LEVELS.map((level) => (
                  <MenuItem key={level.value} value={level.value}>
                    {level.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Zona"
                value={formData.zona}
                onChange={(e) => setFormData({ ...formData, zona: e.target.value })}
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                fullWidth
                type="number"
                label="Latitud"
                value={formData.latitud}
                onChange={(e) => setFormData({ ...formData, latitud: parseFloat(e.target.value) })}
                inputProps={{ step: 0.0001 }}
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                fullWidth
                type="number"
                label="Longitud"
                value={formData.longitud}
                onChange={(e) => setFormData({ ...formData, longitud: parseFloat(e.target.value) })}
                inputProps={{ step: 0.0001 }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setOpenDialog(false); resetForm(); }}>
            Cancelar
          </Button>
          <Button variant="contained" onClick={handleCreateIncident}>
            Crear Incidencia
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default IncidentsPage;
