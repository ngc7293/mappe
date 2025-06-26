import type { GeoJSON } from "geojson";

export interface LayerData {
    name: string;
    data: GeoJSON,
    polygon: boolean;
    visible: boolean;
    color: string;
}