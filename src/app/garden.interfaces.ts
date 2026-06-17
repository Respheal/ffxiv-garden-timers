export interface Crop {
  apiID: number;
  iconPath: string;
  plantedTime: number | null;
  fertilizeCount: number;
  lastFertilizeTime: number | null;
  lastWaterTime: number | null;
}

export interface CropUpdate {
  apiID?: number;
  iconPath?: string;
  plantedTime?: number | null;
  fertilizeCount?: number;
  lastFertilizeTime?: number | null;
  lastWaterTime?: number | null;
}

export interface Plot {
  plotID: number;
  crops: Crop[];
  name: string;
  size: 1 | 4 | 6 | 8;
}

export interface Garden {
  plots: Plot[];
}

export interface APICrop {
  apiID: number;
  name: string;
  growthTime: number; // in hours
  wiltTime: number | null; // in hours
  // icon: string; // ui/icon/025000/025208.tex
  // ffxivgId: number; // seed-details.php?SeedID=17
}

export interface XIVAPIItem {
  fields: {
    Icon: Icon;
  };
}

export interface Icon {
  id: number;
  path: string;
  path_hr1: string;
}
