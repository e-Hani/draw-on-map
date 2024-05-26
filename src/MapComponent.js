import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polygon, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
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

const CurrentLocationSetter = ({ currentLocation }) => {
  const map = useMap();
  useEffect(() => {
    if (currentLocation) {
      map.setView(currentLocation);
    }
  }, [currentLocation, map]);
  return null;
};

const MapComponent = () => {
  const [polygon, setPolygon] = useState([]);
  const [markers, setMarkers] = useState([]);
  const [pointCoords, setPointCoords] = useState({ lat: null, lng: null });
  const [isInside, setIsInside] = useState(null);
  const [currentLocation, setCurrentLocation] = useState([51.505, -0.09]); // Default to London

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          const { latitude, longitude } = position.coords;
          console.log("Current position:", latitude, longitude); // Logging for debugging
          setCurrentLocation([latitude, longitude]);
        },
        error => {
          console.error("Error obtaining location:", error);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  }, []);

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
      <MapContainer center={currentLocation} zoom={13} style={{ height: '400px', width: '100%' }}>
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
        <CurrentLocationSetter currentLocation={currentLocation} />
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
