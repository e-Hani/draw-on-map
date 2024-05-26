import React, { useState } from 'react';
import { MapContainer, TileLayer, Polygon, Marker, Popup, useMapEvents } from 'react-leaflet';
import { point } from '@turf/helpers';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';

const MapEventHandler = ({ setPolygon, setMarkers }) => {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPolygon(prevPolygon => [...prevPolygon, [lng, lat]]);
      setMarkers(prevMarkers => [...prevMarkers, { lat, lng }]);
    }
  });

  return null;
};

const MapComponent = () => {
  const [polygon, setPolygon] = useState([]);
  const [markers, setMarkers] = useState([]);
  const [pointCoords, setPointCoords] = useState({ lat: null, lng: null });
  const [isInside, setIsInside] = useState(null);

  const checkPoint = () => {
    if (pointCoords.lat !== null && pointCoords.lng !== null && polygon.length > 2) {
      const pt = point([pointCoords.lng, pointCoords.lat]);
      const poly = {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [polygon]
        }
      };
      const inside = booleanPointInPolygon(pt, poly);
      setIsInside(inside);
    }
  };

  return (
    <div>
      <MapContainer center={[51.505, -0.09]} zoom={13} style={{ height: '400px', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {polygon.length > 0 && (
          <Polygon positions={polygon.map(coord => [coord[1], coord[0]])} />
        )}
        {markers.map((marker, index) => (
          <Marker key={index} position={[marker.lat, marker.lng]}>
            <Popup>
              Latitude: {marker.lat.toFixed(5)}, Longitude: {marker.lng.toFixed(5)}
            </Popup>
          </Marker>
        ))}
        <MapEventHandler setPolygon={setPolygon} setMarkers={setMarkers} />
      </MapContainer>
      <div>
        <h3>Check Point</h3>
        <input
          type="number"
          placeholder="Latitude"
          onChange={e => setPointCoords({ ...pointCoords, lat: parseFloat(e.target.value) })}
        />
        <input
          type="number"
          placeholder="Longitude"
          onChange={e => setPointCoords({ ...pointCoords, lng: parseFloat(e.target.value) })}
        />
        <button onClick={checkPoint}>Check</button>
        {isInside !== null && (
          <p>The point is {isInside ? 'inside' : 'outside'} the polygon.</p>
        )}
      </div>
    </div>
  );
};

export default MapComponent;
