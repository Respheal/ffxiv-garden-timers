import { Injectable, signal, effect } from '@angular/core';
import xivapi from '@xivapi/js';

import { Garden, Plot, CropUpdate, XIVAPIItem } from './garden.interfaces';

@Injectable({ providedIn: 'root' })
export class GardenService {
  garden = signal<Garden>(this.loadGarden());

  constructor() {
    effect(() => {
      localStorage.setItem('ffxiv-garden', JSON.stringify(this.garden()));
    });
  }

  private loadGarden(): Garden {
    const gardenData = localStorage.getItem('ffxiv-garden');
    if (gardenData) return JSON.parse(gardenData) as Garden;
    return { plots: [] };
  }

  initializePlot(plotID: number, size: 1 | 4 | 6 | 8): Plot {
    const placeholderCrop = {
      plotID: plotID,
      apiID: 0,
      fertilizeCount: 0,
      lastFertilizeTime: null,
      lastWaterTime: null,
    };
    const crops = Array(size).fill(placeholderCrop);
    if (size === 8) {
      // Size 8 is actually a 3x3 with a blank in the middle for the scarecrow
      crops[4] = { ...placeholderCrop, apiID: -1 };
      // Add an extra crop to make it 9 total, since the middle is empty
      crops.push({ ...placeholderCrop });
    }
    return {
      plotID: plotID,
      name: `Plot ${plotID}`,
      size: size,
      crops: crops,
    };
  }

  addPlot(size: Plot['size']) {
    this.garden.update((garden) => ({
      ...garden,
      plots: [...garden.plots, this.initializePlot(Date.now(), size)],
    }));
  }

  removePlot(plotID: number) {
    this.garden.update((garden) => ({
      ...garden,
      plots: garden.plots.filter((plot) => plot.plotID !== plotID),
    }));
  }

  updatePlotName(plotID: number, newName: string) {
    this.garden.update((garden) => {
      const updatedPlots = garden.plots.map((plot) =>
        plot.plotID === plotID ? { ...plot, name: newName } : plot,
      );
      return { ...garden, plots: updatedPlots };
    });
  }

  waterCrop(plotID: number, cropIndex: number) {
    this.updateCrop(plotID, cropIndex, { lastWaterTime: new Date().getTime() });
  }

  waterEntirePlot(plot: Plot) {
    plot.crops.forEach((_, index) => {
      this.waterCrop(plot.plotID, index);
    });
  }

  waterEntireGarden() {
    this.garden().plots.forEach((plot) => {
      this.waterEntirePlot(plot);
    });
  }

  fertilizeCrop(plotID: number, cropIndex: number, fertCount: number) {
    this.updateCrop(plotID, cropIndex, {
      fertilizeCount: fertCount + 1,
      lastFertilizeTime: new Date().getTime(),
    });
  }

  fertilizeEntirePlot(plot: Plot) {
    plot.crops.forEach((crop, index) => {
      this.fertilizeCrop(plot.plotID, index, crop.fertilizeCount || 0);
    });
  }

  fertilizeEntireGarden() {
    this.garden().plots.forEach((plot) => {
      this.fertilizeEntirePlot(plot);
    });
  }

  selectCrop(plotID: number, cropIndex: number, newApiID: number) {
    this.getCropIconPath(newApiID).then((iconPath) => {
      this.updateCrop(plotID, cropIndex, {
        apiID: newApiID,
        iconPath: iconPath,
        plantedTime: new Date().getTime(),
      });
    });
  }

  clearCrop(plotID: number, cropIndex: number) {
    this.updateCrop(plotID, cropIndex, {
      apiID: 0,
      fertilizeCount: 0,
      lastFertilizeTime: null,
      lastWaterTime: null,
      plantedTime: null,
    });
  }

  updateCrop(plotID: number, cropIndex: number, update: CropUpdate) {
    this.garden.update((garden) => {
      // Find the plot by ID
      const plot = garden.plots.find((p) => p.plotID === plotID);
      if (!plot) return garden;

      // Overwrite the crop with the partial update data
      const plotCrops = [...plot.crops];
      plotCrops[cropIndex] = { ...plotCrops[cropIndex], ...update };

      // Update the plot with the modified crops
      const updatedPlot: Plot = { ...plot, crops: plotCrops };
      const updatedPlots = garden.plots.map((p) =>
        p.plotID === plotID ? updatedPlot : p,
      );

      // Return the updated garden with the modified plot
      return { ...garden, plots: updatedPlots };
    });
  }

  async getCropIconPath(apiID: number): Promise<string> {
    // TODO: Consider adding language support here
    const xiv = new xivapi();
    const item = xiv.items.get(apiID, { fields: 'Icon' }) as Promise<XIVAPIItem>;
    return item
      .then((result) => {
        if (result) {
          return result.fields.Icon.path;
        }
        return '';
      })
      .catch((error) => {
        console.error('Error fetching XIVAPI item:', error);
        return '';
      });
  }
}
