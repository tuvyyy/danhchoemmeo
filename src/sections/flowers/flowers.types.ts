export interface BloomFrameConfig {
  src: string;
  label: string;
  x: number; // percentage or px offset
  y: number;
  scale: number;
  rotation: number;
}

export interface WindLayerConfig {
  duration: number;
  rotation: number;
  x: number;
  skewX: number;
  delay: number;
}
