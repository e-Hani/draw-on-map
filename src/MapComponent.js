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
  const [currentLocation, setCurrentLocation] = useState(null); // Default to null
  const [savedPolygons, setSavedPolygons] = useState([]); // Simulated database

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation([latitude, longitude]);
        },
        error => {
          console.error("Error obtaining location:", error);
          // Default location if geolocation fails
          setCurrentLocation([51.505, -0.09]);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
      // Default location if geolocation is not supported
      setCurrentLocation([51.505, -0.09]);
    }
  }, []);

  const savePolygon = () => {
    if (polygon.length > 2) {
      setSavedPolygons(prevPolygons => [...prevPolygons, polygon]);
      setPolygon([]);
      setMarkers([]);
      alert('Polygon saved!');
    } else {
      alert('A polygon requires at least 3 points.');
    }
  };

  const checkPoint = () => {
    if (pointCoords.lat !== null && pointCoords.lng !== null) {
      const pt = point([pointCoords.lng, pointCoords.lat]);
      const insideAnyPolygon = savedPolygons.some(poly => {
        const polyCoords = poly.map(coord => [coord[1], coord[0]]);
        const polyFeature = {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [polyCoords]
          }
        };
        return booleanPointInPolygon(pt, polyFeature);
      });

      setIsInside(insideAnyPolygon);
    }
  };

  if (!currentLocation) {
    return <div>Loading...</div>; // Show loading state until location is determined
  }

  return (
    <div>
      <MapContainer center={currentLocation} zoom={13} style={{ height: '400px', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {savedPolygons.map((poly, index) => (
          <Polygon key={index} positions={poly.map(coord => [coord[1], coord[0]])} />
        ))}
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
        <button onClick={savePolygon}>Save Polygon</button>
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
      <div>
        <h3>Saved Polygons</h3>
        <ul>
          {savedPolygons.map((poly, index) => (
            <li key={index}>
              Polygon {index + 1}: {JSON.stringify(poly)}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default MapComponent;
