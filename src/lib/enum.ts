export enum BasemapType {
  MapboxStreets = 1,
  MapboxSatellite = 2,
  OpenStreetMap = 3,
}

export type MapboxStyle =
  | BasemapType.MapboxStreets
  | BasemapType.MapboxSatellite;
