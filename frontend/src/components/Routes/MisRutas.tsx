import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Chip,
  CircularProgress,
  Box,
  Alert,
  Grid,
  List,
  ListItem,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Map as MapIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import * as conductoresService from '../../services/conductoresService';
import * as routesService from '../../services/routesService';

interface Ruta {
  id: number;
  zona: string;
  estado: string;
  suma_gravedad: number;
  camiones_usados: number;
  duracion_estimada: string;
  asignaciones: any[];
}

interface MisRutasResponse {
  total: number;
  asignado: number;
  iniciado: number;
  completado: number;
  rutas: Ruta[];
}

export default function MisRutas() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<MisRutasResponse | null>(null);
  const [finalizandoRutaId, setFinalizandoRutaId] = useState<number | null>(null);
  const [notasRuta, setNotasRuta] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    cargarRutas();
  }, []);

  const cargarRutas = async () => {
    try {
      setLoading(true);
      setError(null);
      // En el backend Go, las órdenes de trabajo se obtienen del Operations Service
      setData({ total: 0, asignado: 0, iniciado: 0, completado: 0, rutas: [] });
    } catch (err: any) {
      setError('Las rutas se generan automáticamente cuando hay incidentes acumulados');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleIniciarRuta = async (rutaId: number) => {
    console.log('Las rutas se inician automáticamente en el backend Go cuando inicia un turno');
    alert('Las rutas se generan y controlan automáticamente en el sistema');
  };

  const handleFinalizarRuta = (rutaId: number) => {
    console.log('Las rutas se finalizan automáticamente en el backend Go');
    alert('El sistema controla el ciclo de vida de las rutas automáticamente');
  };

  const confirmarFinalizarRuta = async () => {
    setDialogOpen(false);
    setNotasRuta('');
    setFinalizandoRutaId(null);
  };

  const handleVerMapa = (rutaId: number) => {
    navigate(`/rutas/${rutaId}`);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">📍 Mis Rutas Asignadas</Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={cargarRutas}
        >
          Recargar
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Resumen de estados */}
      {data && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h6">{data.asignado}</Typography>
              <Typography variant="body2" color="textSecondary">Asignadas</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#fff3e0' }}>
              <Typography variant="h6">{data.iniciado}</Typography>
              <Typography variant="body2" color="textSecondary">En progreso</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#e8f5e9' }}>
              <Typography variant="h6">{data.completado}</Typography>
              <Typography variant="body2" color="textSecondary">Completadas</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h6">{data.total}</Typography>
              <Typography variant="body2" color="textSecondary">Total</Typography>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Lista de rutas */}
      {data && data.rutas.length > 0 ? (
        <Grid container spacing={2}>
          {data.rutas.map((ruta) => (
            <Grid item xs={12} sm={6} md={4} key={ruta.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                    <Typography variant="h6">Ruta #{ruta.id}</Typography>
                    <Chip
                      label={ruta.estado}
                      color={ruta.estado === 'iniciado' ? 'warning' : ruta.estado === 'completado' ? 'success' : 'default'}
                      size="small"
                    />
                  </Box>

                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Zona:</strong> {ruta.zona}
                  </Typography>

                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Gravedad:</strong> {ruta.suma_gravedad} pts
                  </Typography>

                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Camiones:</strong> {ruta.camiones_usados}
                  </Typography>

                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Duración:</strong> {ruta.duracion_estimada}
                  </Typography>

                  {ruta.asignaciones && ruta.asignaciones.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                        Asignaciones:
                      </Typography>
                      <List dense>
                        {ruta.asignaciones.map((asig, idx) => (
                          <ListItem key={idx} dense>
                            <ListItemText
                              primary={asig.camion_id}
                              secondary={`Tipo: ${asig.camion_tipo} | Estado: ${asig.estado}`}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}
                </CardContent>

                <CardActions sx={{ justifyContent: 'space-between' }}>
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    startIcon={<MapIcon />}
                    onClick={() => handleVerMapa(ruta.id)}
                  >
                    Mapa
                  </Button>

                  {ruta.estado === 'asignado' && (
                    <Button
                      variant="contained"
                      color="success"
                      size="small"
                      startIcon={<PlayIcon />}
                      onClick={() => handleIniciarRuta(ruta.id)}
                    >
                      Iniciar
                    </Button>
                  )}

                  {ruta.estado === 'iniciado' && (
                    <Button
                      variant="contained"
                      color="error"
                      size="small"
                      startIcon={<StopIcon />}
                      onClick={() => handleFinalizarRuta(ruta.id)}
                    >
                      Finalizar
                    </Button>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1" color="textSecondary">
            No tienes rutas asignadas actualmente.
          </Typography>
        </Paper>
      )}

      {/* Diálogo para finalizar ruta */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Finalizar Ruta</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            ¿Estás seguro de que deseas finalizar esta ruta? Puedes agregar notas sobre su ejecución.
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder="Notas sobre la ruta (opcional)..."
            value={notasRuta}
            onChange={(e) => setNotasRuta(e.target.value)}
            variant="outlined"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button onClick={confirmarFinalizarRuta} variant="contained" color="primary">
            Finalizar Ruta
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
