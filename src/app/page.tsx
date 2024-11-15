"use client";

import React, { useState, useEffect, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { MapPin, Navigation, DollarSign } from "lucide-react";

type Location = {
  lat: number;
  lng: number;
};

const RideFareCalculator: React.FC = () => {
  const [sourceLocation, setSourceLocation] = useState<Location | null>(null);
  const [destination, setDestination] = useState("");
  const [fare, setFare] = useState<number | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const mapRef = useRef<google.maps.Map | null>(null);

  // Constants
  const FARE_PER_KM = 2.5; // Example rate in dollars per kilometer

  useEffect(() => {
    if (typeof window !== "undefined" && window.google && window.google.maps) {
      const map = new window.google.maps.Map(
        document.getElementById("map") as HTMLElement,
        {
          center: { lat: 40.7128, lng: -74.006 }, // New York City
          zoom: 12,
        },
      );
      mapRef.current = map;
    }
  }, []);

  const handleSetSourceLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setSourceLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setError(null);
          updateMap();
        },
        () => {
          setError("Unable to retrieve your location");
        },
      );
    } else {
      setError("Geolocation is not supported by your browser");
    }
  };

  const handleSearchWithCustomSource = async () => {
    if (!sourceLocation) {
      setError("Please set your source location");
      return;
    }
    if (!destination) {
      setError("Please enter a destination");
      return;
    }
    setIsLoading(true);

    try {
      // Use the Google Maps API to calculate the distance and route
      const directionsService = new window.google.maps.DirectionsService();
      const directionsRequest = {
        origin: new window.google.maps.LatLng(
          sourceLocation.lat,
          sourceLocation.lng,
        ),
        destination,
        travelMode: window.google.maps.TravelMode.DRIVING,
      };
      const response = await directionsService.route(directionsRequest);
      const distance = response.routes[0].legs[0].distance.value / 1000; // Distance in km
      setDistance(distance);
      const calculatedFare = distance * FARE_PER_KM;
      setFare(calculatedFare);
      setError(null);

      // Update the map with the route
      const directionsRenderer = new window.google.maps.DirectionsRenderer();
      directionsRenderer.setDirections(response);
      directionsRenderer.setMap(mapRef.current);
    } catch (err) {
      setError("Error calculating route");
    } finally {
      setIsLoading(false);
    }
  };

  const updateMap = () => {
    if (mapRef.current && sourceLocation) {
      mapRef.current.setCenter(
        new window.google.maps.LatLng(sourceLocation.lat, sourceLocation.lng),
      );
      mapRef.current.setZoom(14);
    }
  };

  return (
    <Card className="p-6 max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Ride Fare Calculator</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Set Source Location */}
          <div className="flex items-center gap-4">
            <Button onClick={handleSetSourceLocation}>
              <MapPin className="w-4 h-4" />
              Set Source Location
            </Button>
            {sourceLocation && (
              <div className="flex items-center gap-2 text-sm">
                <span>
                  Source: {sourceLocation.lat.toFixed(4)},{" "}
                  {sourceLocation.lng.toFixed(4)}
                </span>
              </div>
            )}
          </div>

          {/* Search Bar */}
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Enter destination"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full"
              />
            </div>
            <Button
              onClick={handleSearchWithCustomSource}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <Navigation className="w-4 h-4" />
              Calculate Fare
            </Button>
          </div>

          {/* Map */}
          <div id="map" className="bg-gray-100 h-96 rounded-lg" />

          {/* Results */}
          {distance !== null && fare !== null && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-lg">
                <Navigation className="w-5 h-5" />
                <span>Distance: {distance.toFixed(2)} km</span>
              </div>
              <div className="flex items-center gap-2 text-lg">
                <DollarSign className="w-5 h-5" />
                <span>Estimated Fare: ${fare.toFixed(2)}</span>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RideFareCalculator;
