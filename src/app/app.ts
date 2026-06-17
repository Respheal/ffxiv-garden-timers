import { Component, inject } from '@angular/core';

import { GardenPlot } from './garden-plot/garden-plot';
import { GardenService } from './garden.service';
import { type Garden } from './garden.interfaces';

@Component({
  selector: 'app-root',
  imports: [GardenPlot],
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
})
export class App {
  protected gardenService = inject(GardenService);

  exportGarden() {
    // Create a JSON file from the garden data and trigger a download
    const gardenData = JSON.stringify(this.gardenService.garden());
    const blob = new Blob([gardenData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ffxiv-garden.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  importGarden(event: Event) {
    // Read the selected file and load into the garden signal
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const gardenData = e.target?.result as string;
          const garden = JSON.parse(gardenData) as Garden;
          this.gardenService.garden.set(garden);
        } catch (error) {
          console.error('Error importing garden:', error);
        }
      };
      reader.readAsText(file);
    }
  }
}
