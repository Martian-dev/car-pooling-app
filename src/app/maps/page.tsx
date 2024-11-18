"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { ExternalLink, MapPin } from "lucide-react";
import { toast } from "sonner";

const FARE_PER_KM = 15; // Fare in currency units per kilometer

type Location = { lat: number; lng: number };

const MapVisualization = ({
  source,
  destination,
}: {
  source: Location;
  destination: Location;
}) => {
  return (
    <svg
      viewBox="0 0 800 600"
      className="w-full h-full"
      style={{ background: "#f0f0f0" }}
    >
      {/* Grid lines for map-like appearance */}
      {Array.from({ length: 20 }, (_, i) => (
        <React.Fragment key={`grid-${i}`}>
          <line
            x1={i * 40}
            y1="0"
            x2={i * 40}
            y2="600"
            stroke="#e0e0e0"
            strokeWidth="1"
          />
          <line
            x1="0"
            y1={i * 30}
            x2="800"
            y2={i * 30}
            stroke="#e0e0e0"
            strokeWidth="1"
          />
        </React.Fragment>
      ))}

      {/* Source marker */}
      <g transform="translate(240, 300)">
        <circle r="8" fill="#3b82f6" />
        <text
          y="-15"
          textAnchor="middle"
          fill="#3b82f6"
          className="text-sm font-medium"
        >
          Source
        </text>
      </g>

      {/* Destination marker and route line */}
      {destination && (
        <>
          <line
            x1="240"
            y1="300"
            x2="560"
            y2="300"
            stroke="#6b7280"
            strokeWidth="2"
            strokeDasharray="4"
          />
          <g transform="translate(560, 300)">
            <circle r="8" fill="#ef4444" />
            <text
              y="-15"
              textAnchor="middle"
              fill="#ef4444"
              className="text-sm font-medium"
            >
              Destination
            </text>
          </g>
        </>
      )}
    </svg>
  );
};

const RideCalculator = () => {
  const [source, setSource] = useState({ lat: 13.02, lng: 80.57 }); // Default to London
  const [destination, setDestination] = useState<Location>();
  const [distance, setDistance] = useState(0);
  const [destinationQuery, setDestinationQuery] = useState("");
  const [error, setError] = useState("");
  const [members, setMembers] = useState(2);
  const [members1, setMembers1] = useState(3);
  const [members2, setMembers2] = useState(2);
  const [members3, setMembers3] = useState(1);

  useEffect(() => {
    // Get user's current location if they allow it
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setSource({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {
          setError("Unable to get your location. Using default location.");
        },
      );
    }
  }, []);

  const searchDestination = async () => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          destinationQuery,
        )}`,
      );
      const data = await response.json();

      if (data && data[0]) {
        const newDest = {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
        };
        setDestination(newDest);
        calculateDistance(source, newDest);
      } else {
        setError("Location not found. Please try a different search.");
      }
    } catch (err) {
      setError("Error searching for location.");
    }
  };

  const calculateDistance = (from: Location, to: Location) => {
    // Calculate distance using Haversine formula
    const R = 6371; // Earth's radius in km
    const dLat = toRad(to.lat - from.lat);
    const dLon = toRad(to.lng - from.lng);
    const lat1 = toRad(from.lat);
    const lat2 = toRad(to.lat);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    setDistance(distance);
  };

  const toRad = (value: number) => {
    return (value * Math.PI) / 180;
  };

  const fare = (distance * FARE_PER_KM).toFixed(2);

  // Generate directions URL for OpenStreetMap
  const getDirectionsUrl = () => {
    if (!destination) return "";
    return `https://www.openstreetmap.org/directions?from=${source.lat},${source.lng}&to=${destination.lat},${destination.lng}`;
  };

  return (
    <div className="bg-black p-4 flex flex-col gap-2">
      <Card className="max-w-4xl text-white mx-auto bg-black border-gray-50 border-solid border-2">
        <CardHeader>
          <CardTitle className="text-white">Ride Fare Calculator</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-4">
              <Input
                type="text"
                placeholder="Enter destination"
                value={destinationQuery}
                onChange={(e) => setDestinationQuery(e.target.value)}
                className="flex-grow"
              />
              <Button onClick={searchDestination}>Search</Button>
            </div>

            <div className="h-96 relative bg-gray-100 rounded-lg overflow-hidden">
              <MapVisualization source={source} destination={destination!} />
            </div>

            {destination && (
              <div className="mt-4 space-y-2">
                <p className="text-lg">
                  Source: {source.lat.toFixed(4)}, {source.lng.toFixed(4)}
                </p>
                <p className="text-lg">
                  Destination: {destination.lat.toFixed(4)},{" "}
                  {destination.lng.toFixed(4)}
                </p>
                <p className="text-lg">Distance: {distance.toFixed(2)} km</p>
                <p className="text-lg font-semibold">
                  Estimated Fare: Rs. {fare}
                </p>
                <a
                  href={getDirectionsUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-blue-500 hover:text-blue-600"
                >
                  View directions on OpenStreetMap{" "}
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            )}
          </div>

          <div>
            <p>Members in ride: {members}</p>
            <Button onClick={() => setMembers(members + 1)}>Join ride</Button>
          </div>
        </CardContent>
      </Card>
      <Card className="max-w-4xl text-white mx-auto bg-black border-gray-50 border-solid border-2">
        <CardHeader>Available Rides</CardHeader>
        <CardContent className="flex flex-auto gap-4">
          <Card className="w-auto p-3 text-white mx-auto bg-black border-gray-50 border-solid border-2">
            <div>
              <p>From: Chennai airport</p>
              <p>To: Chennai central</p>
              <p>estimated fare: 300</p>
              <p>Member count: {members1}</p>
              <Button
                className="m-4"
                onClick={() => {
                  toast("Your ride will arrive shortly");
                  setMembers1(members1 + 1);
                }}
              >
                Join ride
              </Button>
            </div>
          </Card>
          <Card className="w-auto p-3 text-white mx-auto bg-black border-gray-50 border-solid border-2">
            <div>
              <p>From: marina mall chennai</p>
              <p>To: beasant nagar</p>
              <p>estimated fare: 330</p>
              <p>Member count: {members2}</p>
              <Button
                className="m-4"
                onClick={() => {
                  toast("Your ride will arrive shortly");
                  setMembers2(members2 + 1);
                }}
              >
                Join ride
              </Button>
            </div>
          </Card>
          <Card className="w-auto p-3 text-white mx-auto bg-black border-gray-50 border-solid border-2">
            <div>
              <p>From: vandalur zoo</p>
              <p>To: alandur metro</p>
              <p>estimated fare: 330</p>
              <p>Member count: {members3}</p>
              <Button
                className="m-4"
                onClick={() => {
                  toast("Your ride will arrive shortly");
                  setMembers3(members3 + 1);
                }}
              >
                Join ride
              </Button>
            </div>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};

export default RideCalculator;
