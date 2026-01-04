import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormGroup,
  FormControlLabel,
  Chip,
  Alert,
  IconButton,
  Grid
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';

const API_BASE_URL = process.env.REACT_APP_API_BASE || 'https://epagal-backend-routing-latest.onrender.com/api';

interface Sector {
  id: number;
  nombre: string;
  zona: string;
  descripcion?: string;
}

interface Horario {
  id: number;
  sector_id: number;
  sector_nombre?: string;
  dias_semana: string[];
  hora_inicio: string;
  hora_fin: string;
  frecuencia_recoleccion: string;
  tipo_residuo: string;
  conductor_id: number | null;
  camion_placa: string | null;
  estado: string;
}

const DIAS_SEMANA = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
const TIPO_RESIDUO = ['organico', 'reciclable', 'comun', 'peligroso'];
const FRECUENCIA = ['diaria', 'semanal', 'quincenal', 'mensual'];

const HorariosPage: React.FC = () => {
  const [sectores, setSectores] = useState<Sector[]>([]);
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editando, setEditando] = useState<Horario | null>(null);

  const [formData, setFormData] = useState<Partial<Horario>>({
    sector_id: 0,
    dias_semana: [],
    hora_inicio: '08:00',
    hora_fin: '12:00',
    frecuencia_recoleccion: 'semanal',
    tipo_residuo: 'comun',
    estado: 'activo'
  });

  // Cargar sectores
  const cargarSectores = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/horarios/sectores`);
      if (!response.ok) throw new Error('Error al cargar sectores');
      const data = await response.json();
      setSectores(data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Cargar horarios
  const cargarHorarios = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/horarios`);
      if (!response.ok) throw new Error('Error al cargar horarios');
      const data = await response.json();
      setHorarios(data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Crear/actualizar horario
  const guardarHorario = async () => {
    try {
      const method = editando ? 'PUT' : 'POST';
      const url = editando 
        ? `${API_BASE_URL}/horarios/${editando.id}`
        : `${API_BASE_URL}/horarios`;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al guardar horario');
      }

      setSuccess(editando ? 'Horario actualizado' : 'Horario creado');
      setDialogOpen(false);
      setEditando(null);
      setFormData({
        sector_id: 0,
        dias_semana: [],
        hora_inicio: '08:00',
        hora_fin: '12:00',
        frecuencia_recoleccion: 'semanal',
        tipo_residuo: 'comun',
        estado: 'activo'
      });
      cargarHorarios();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Eliminar horario
  const eliminarHorario = async (id: number) => {
    if (!window.confirm('¿Está seguro de eliminar este horario?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/horarios/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Error al eliminar horario');
      
      setSuccess('Horario eliminado');
      cargarHorarios();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Abrir diálogo de edición
  const abrirEdicion = (horario: Horario) => {
    setEditando(horario);
    setFormData({
      sector_id: horario.sector_id,
      dias_semana: horario.dias_semana,
      hora_inicio: horario.hora_inicio,
      hora_fin: horario.hora_fin,
      frecuencia_recoleccion: horario.frecuencia_recoleccion,
      tipo_residuo: horario.tipo_residuo,
      conductor_id: horario.conductor_id,
      camion_placa: horario.camion_placa,
      estado: horario.estado
    });
    setDialogOpen(true);
  };

  // Manejar cambio de días de semana
  const toggleDia = (dia: string) => {
    const dias = formData.dias_semana || [];
    if (dias.includes(dia)) {
      setFormData({ ...formData, dias_semana: dias.filter(d => d !== dia) });
    } else {
      setFormData({ ...formData, dias_semana: [...dias, dia] });
    }
  };

  useEffect(() => {
    cargarSectores();
    cargarHorarios();
  }, []);

  const getSectorNombre = (sectorId: number) => {
    const sector = sectores.find(s => s.id === sectorId);
    return sector ? sector.nombre : 'Desconocido';
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          <ScheduleIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Horarios de Recolección
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setEditando(null);
            setFormData({
              sector_id: 0,
              dias_semana: [],
              hora_inicio: '08:00',
              hora_fin: '12:00',
              frecuencia_recoleccion: 'semanal',
              tipo_residuo: 'comun',
              estado: 'activo'
            });
            setDialogOpen(true);
          }}
        >
          Nuevo Horario
        </Button>
      </Box>

      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Sector</TableCell>
              <TableCell>Días</TableCell>
              <TableCell>Horario</TableCell>
              <TableCell>Frecuencia</TableCell>
              <TableCell>Tipo Residuo</TableCell>
              <TableCell>Camión</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {horarios.map((horario) => (
              <TableRow key={horario.id}>
                <TableCell>{getSectorNombre(horario.sector_id)}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {horario.dias_semana.map((dia) => (
                      <Chip key={dia} label={dia.substring(0, 3).toUpperCase()} size="small" />
                    ))}
                  </Box>
                </TableCell>
                <TableCell>{horario.hora_inicio} - {horario.hora_fin}</TableCell>
                <TableCell>{horario.frecuencia_recoleccion}</TableCell>
                <TableCell>
                  <Chip label={horario.tipo_residuo} size="small" color="primary" />
                </TableCell>
                <TableCell>{horario.camion_placa || 'Sin asignar'}</TableCell>
                <TableCell>
                  <Chip
                    label={horario.estado}
                    size="small"
                    color={horario.estado === 'activo' ? 'success' : 'default'}
                  />
                </TableCell>
                <TableCell>
                  <IconButton size="small" onClick={() => abrirEdicion(horario)} color="primary">
                    <EditIcon />
                  </IconButton>
                  <IconButton size="small" onClick={() => eliminarHorario(horario.id)} color="error">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Diálogo de crear/editar */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editando ? 'Editar Horario' : 'Nuevo Horario'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Sector</InputLabel>
                <Select
                  value={formData.sector_id || 0}
                  onChange={(e) => setFormData({ ...formData, sector_id: Number(e.target.value) })}
                >
                  <MenuItem value={0}>Seleccione un sector</MenuItem>
                  {sectores.map((sector) => (
                    <MenuItem key={sector.id} value={sector.id}>
                      {sector.nombre} - {sector.zona}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Días de la Semana
              </Typography>
              <FormGroup row>
                {DIAS_SEMANA.map((dia) => (
                  <FormControlLabel
                    key={dia}
                    control={
                      <Checkbox
                        checked={(formData.dias_semana || []).includes(dia)}
                        onChange={() => toggleDia(dia)}
                      />
                    }
                    label={dia}
                  />
                ))}
              </FormGroup>
            </Grid>

            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Hora Inicio"
                type="time"
                value={formData.hora_inicio}
                onChange={(e) => setFormData({ ...formData, hora_inicio: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Hora Fin"
                type="time"
                value={formData.hora_fin}
                onChange={(e) => setFormData({ ...formData, hora_fin: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Frecuencia</InputLabel>
                <Select
                  value={formData.frecuencia_recoleccion}
                  onChange={(e) => setFormData({ ...formData, frecuencia_recoleccion: e.target.value })}
                >
                  {FRECUENCIA.map((freq) => (
                    <MenuItem key={freq} value={freq}>
                      {freq}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Tipo de Residuo</InputLabel>
                <Select
                  value={formData.tipo_residuo}
                  onChange={(e) => setFormData({ ...formData, tipo_residuo: e.target.value })}
                >
                  {TIPO_RESIDUO.map((tipo) => (
                    <MenuItem key={tipo} value={tipo}>
                      {tipo}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Placa del Camión (opcional)"
                value={formData.camion_placa || ''}
                onChange={(e) => setFormData({ ...formData, camion_placa: e.target.value })}
                placeholder="Ej: ABC-123"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button onClick={guardarHorario} variant="contained">
            {editando ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HorariosPage;
