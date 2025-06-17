export interface RouteInput {
  origin: string;
  destination: string;
  weather: 'Calm' | 'Moderate' | 'Stormy';
  cargoKg: number;
}

export interface OptimizedRoute {
  etaHours: number;
  distanceKm: number;
  suggestedSpeedKph: number;
  route: string[];
  warnings: string[];
} 
export default function planRoute(input: RouteInput): OptimizedRoute {
    const warnings: string[] = [];

    const baseDistance = (input.origin.length + input.destination.length) * 50;
    const distanceKm = Math.max(500, baseDistance); 

    const baseSpeedKph = 40; 
    let effectiveSpeedKph = baseSpeedKph;

    if (input.weather === 'Stormy') {
      effectiveSpeedKph *= 0.75; 
      warnings.push('Stormy weather will significantly increase travel time.');
    } else if (input.weather === 'Moderate') {
      effectiveSpeedKph *= 0.9; 
    }

    const cargoFactor = 1 - (input.cargoKg / 1000000); 
    effectiveSpeedKph *= Math.max(0.8, cargoFactor); 

    const etaHours = distanceKm / effectiveSpeedKph;

    return {
      etaHours: parseFloat(etaHours.toFixed(2)),
      distanceKm: distanceKm,
      suggestedSpeedKph: parseFloat(effectiveSpeedKph.toFixed(2)),
      route: [input.origin, 'Waypoint-A', 'Waypoint-B', input.destination], 
      warnings,
    };
  }
