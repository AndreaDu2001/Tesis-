import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  Chip,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Alert
} from '@mui/material';
import {
  MyLocation as MyLocationIcon,
  DirectionsCar as TruckIcon,
  LocationOn as MarkerIcon,
  Speed as SpeedIcon
} from '@mui/icons-material';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE || 'https://epagal-backend-routing-latest.onrender.com/api';

interface TrackingData {
  ejecucion_id: number;
  conductor_nombre: string;
  camion_placa: string;
  sector: string;
  lat: number;
  lon: number;
  velocidad: number | null;
  timestamp: string;
  estado: string;
}

interface RoutePoint {
  lat: number;
  lon: number;
  velocidad?: number;
  timestamp: string;
}

const TrackingPage: React.FC = () => {
  const [camionesActivos, setCamionesActivos] = useState<TrackingData[]>([]);
  const [selectedCamion, setSelectedCamion] = useState<TrackingData | null>(null);
  const [rutaRecorrida, setRutaRecorrida] = useState<RoutePoint[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: number]: L.Marker }>({});
  const routeLayerRef = useRef<L.Polyline | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // Inicializar mapa
  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map('tracking-map').setView([-0.933, -78.617], 13);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapRef.current);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Cargar camiones activos
  const cargarCamionesActivos = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/tracking/activos`);
      if (!response.ok) throw new Error('Error al cargar tracking activo');
      const data: TrackingData[] = await response.json();
      setCamionesActivos(data);
      
      // Actualizar marcadores en mapa
      actualizarMarcadores(data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Actualizar marcadores de camiones en mapa
  const actualizarMarcadores = (camiones: TrackingData[]) => {
    if (!mapRef.current) return;

    // Limpiar marcadores viejos
    Object.values(markersRef.current).forEach(marker => marker.remove());
    markersRef.current = {};

    // Crear iconos personalizados
    const truckIcon = L.divIcon({
      html: '<div style="background: red; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(255,0,0,0.5);"></div>',
      className: 'truck-marker',
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });

    camiones.forEach(camion => {
      const marker = L.marker([camion.lat, camion.lon], { icon: truckIcon })
        .addTo(mapRef.current!)
        .bindPopup(`
          <b>${camion.camion_placa}</b><br/>
          Conductor: ${camion.conductor_nombre}<br/>
          Sector: ${camion.sector}<br/>
          Velocidad: ${camion.velocidad || 0} km/h
        `);
      
      markersRef.current[camion.ejecucion_id] = marker;
    });
  };

  // Cargar ruta recorrida
  const cargarRutaRecorrida = async (ejecucionId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tracking/ruta/${ejecucionId}`);
      if (!response.ok) throw new Error('Error al cargar ruta');
      const data = await response.json();
      setRutaRecorrida(data.puntos || []);
      
      // Dibujar línea roja en el mapa
      if (mapRef.current && data.puntos.length > 0) {
        // Remover línea anterior
        if (routeLayerRef.current) {
          routeLayerRef.current.remove();
        }
        
        const coordinates: L.LatLngExpression[] = data.puntos.map((p: RoutePoint) => [p.lat, p.lon]);
        routeLayerRef.current = L.polyline(coordinates, {
          color: 'red',
          weight: 4,
          opacity: 0.7,
          smoothFactor: 1
        }).addTo(mapRef.current);
        
        // Centrar mapa en la ruta
        mapRef.current.fitBounds(routeLayerRef.current.getBounds());
      }
    } catch (err: any) {
      console.error('Error cargando ruta:', err);
    }
  };

  // Conectar WebSocket para tracking en tiempo real
  const conectarWebSocket = (ejecucionId: number) => {
    if (wsRef.current) {
      wsRef.current.close();
    }

    const wsUrl = API_BASE_URL.replace('http', 'ws').replace('https', 'wss');
    wsRef.current = new WebSocket(`${wsUrl}/tracking/ws/${ejecucionId}`);

    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'position_update') {
        // Actualizar marcador del camión
        const marker = markersRef.current[data.ejecucion_id];
        if (marker) {
          marker.setLatLng([data.lat, data.lon]);
          marker.setPopupContent(`
            <b>Posición en vivo</b><br/>
            Velocidad: ${data.velocidad || 0} km/h<br/>
            ${new Date(data.timestamp).toLocaleTimeString()}
          `);
        }
        
        // Agregar punto a la ruta recorrida
        setRutaRecorrida(prev => [...prev, {
          lat: data.lat,
          lon: data.lon,
          velocidad: data.velocidad,
          timestamp: data.timestamp
        }]);
        
        // Actualizar polyline
        if (routeLayerRef.current && mapRef.current) {
          const currentPoints = routeLayerRef.current.getLatLngs() as L.LatLng[];
          currentPoints.push(L.latLng(data.lat, data.lon));
          routeLayerRef.current.setLatLngs(currentPoints);
        }
      }
    };

    wsRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      setError('Error en conexión de tracking en tiempo real');
    };

    wsRef.current.onclose = () => {
      console.log('WebSocket cerrado');
    };

    // Ping periódico para mantener conexión viva
    const pingInterval = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send('ping');
      }
    }, 30000);

    return () => {
      clearInterval(pingInterval);
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  };

  // Seleccionar camión para tracking
  const seleccionarCamion = (camion: TrackingData) => {
    setSelectedCamion(camion);
    cargarRutaRecorrida(camion.ejecucion_id);
    conectarWebSocket(camion.ejecucion_id);
    
    // Centrar mapa en el camión
    if (mapRef.current) {
      mapRef.current.setView([camion.lat, camion.lon], 15);
    }
  };

  // Cargar camiones al montar
  useEffect(() => {
    cargarCamionesActivos();
    const interval = setInterval(cargarCamionesActivos, 10000); // Cada 10 segundos
    return () => clearInterval(interval);
  }, []);

  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 100px)', gap: 2 }}>
      {/* Panel lateral de camiones */}
      <Paper sx={{ width: 300, p: 2, overflow: 'auto' }}>
        <Typography variant="h6" gutterBottom>
          <TruckIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Camiones en Operación
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {camionesActivos.length === 0 && (
          <Typography color="text.secondary" sx={{ mt: 2 }}>
            No hay camiones en operación actualmente
          </Typography>
        )}

        <List>
          {camionesActivos.map((camion) => (
            <ListItem
              key={camion.ejecucion_id}
              button
              selected={selectedCamion?.ejecucion_id === camion.ejecucion_id}
              onClick={() => seleccionarCamion(camion)}
              sx={{
                mb: 1,
                border: '1px solid',
                borderColor: selectedCamion?.ejecucion_id === camion.ejecucion_id ? 'primary.main' : 'divider',
                borderRadius: 1
              }}
            >
              <ListItemText
                primary={camion.camion_placa}
                secondary={
                  <>
                    <Typography variant="body2" component="span" display="block">
                      {camion.conductor_nombre}
                    </Typography>
                    <Typography variant="body2" component="span" display="block" color="text.secondary">
                      {camion.sector}
                    </Typography>
                    <Chip
                      label={`${camion.velocidad || 0} km/h`}
                      size="small"
                      icon={<SpeedIcon />}
                      sx={{ mt: 0.5 }}
                    />
                  </>
                }
              />
            </ListItem>
          ))}
        </List>
      </Paper>

      {/* Mapa */}
      <Box sx={{ flex: 1, position: 'relative' }}>
        <div id="tracking-map" style={{ width: '100%', height: '100%', borderRadius: '8px' }} />
        
        {selectedCamion && (
          <Card sx={{ position: 'absolute', top: 16, right: 16, minWidth: 250, zIndex: 1000 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {selectedCamion.camion_placa}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Conductor: {selectedCamion.conductor_nombre}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Sector: {selectedCamion.sector}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Velocidad: {selectedCamion.velocidad || 0} km/h
              </Typography>
              <Chip
                label={selectedCamion.estado.toUpperCase()}
                color="success"
                size="small"
                sx={{ mt: 1 }}
              />
              <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                Puntos registrados: {rutaRecorrida.length}
              </Typography>
            </CardContent>
          </Card>
        )}
      </Box>
    </Box>
  );
};

export default TrackingPage;
