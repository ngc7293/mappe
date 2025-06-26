import type { GeoJSON } from "geojson";

export interface LayerData {
    name: string;
    data: GeoJSON,
    visible: boolean;
    color: string;
}