import { Component, inject, signal } from '@angular/core';

import { GardenService } from '../garden.service';
import APICrops from '../data/crops';

@Component({
  selector: 'app-favorites-manager',
  templateUrl: './favorites-manager.html',
  styleUrls: ['./favorites-manager.css'],
})
export class FavoritesManager {
  protected gardenService = inject(GardenService);
  isOpen = signal(false);
  apiCrops = APICrops.filter((apiCrop) => apiCrop.apiID > 0);

  open() {
    this.isOpen.set(true);
  }

  close() {
    this.isOpen.set(false);
  }

  toggleFavorite(apiID: number) {
    this.gardenService.toggleFavoriteCrop(apiID);
  }
}
