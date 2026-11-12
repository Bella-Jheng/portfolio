'use client';

import { useCallback } from 'react';
import { useMapsLibrary } from '@vis.gl/react-google-maps';
import { MAPS_KEY } from '../components/Providers';

export type Geocode = (address: string) => Promise<{ lat: number; lng: number } | null>;

const noop: Geocode = async () => null;

/** 地址 → 座標。沒有 Maps key 時永遠回 null */
export function useGeocode(): Geocode {
  // MAPS_KEY 是 build-time 常數，每次 render 走同一條路，hook 呼叫順序不會變
  return MAPS_KEY ? useGoogleGeocode() : noop;
}

function useGoogleGeocode(): Geocode {
  const lib = useMapsLibrary('geocoding');
  return useCallback(
    async (address: string) => {
      if (!lib || !address.trim()) return null;
      try {
        const { results } = await new lib.Geocoder().geocode({ address, region: 'TW' });
        const loc = results[0]?.geometry.location;
        return loc ? { lat: loc.lat(), lng: loc.lng() } : null;
      } catch {
        return null;
      }
    },
    [lib],
  );
}
