export type Entity = {
  id: string;
};

export type SpatialEntity = Entity & {
  posX: number;
  posY: number;
};
