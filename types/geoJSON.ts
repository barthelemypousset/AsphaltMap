export type Coords = [number, number];

export type GeoJSONPoint = {
  type: "Point";
  coordinates: [number, number];
};

export type GeoJSONLineString = {
  type: 'LineString';
  coordinates: [[number, number], [number, number], ...[number, number][]];
};
