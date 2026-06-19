import { Component, computed, inject, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

import { GardenService } from '../../garden.service';
import APICrops from '../../data/crops';
import { type APICrop, type Crop } from '../../garden.interfaces';

@Component({
  selector: 'app-garden-bed',
  imports: [DatePipe],
  templateUrl: './garden-bed.html',
  styleUrls: ['./garden-bed.css'],
})
export class GardenBed {
  private gardenService = inject(GardenService);
  crop = input.required<Crop>();
  apiCrops = APICrops;
  plotID = input.required<number>();
  cropIndex = input.required<number>();
  currentTime = input.required<number>();

  cropData = computed(() => {
    // Collect the growth and wilt times for the crop
    return this.apiCrops.find((apiCrop: APICrop) => apiCrop.apiID === this.crop().apiID);
  });

  canFertilize = computed(() => {
    // A crop can only be fertilized once an hour
    if (!this.crop().lastFertilizeTime || this.crop().lastFertilizeTime === null) {
      return true;
    }
    const hoursSinceLastFertilize =
      (this.currentTime() - this.crop().lastFertilizeTime!) / (1000 * 60 * 60);
    return hoursSinceLastFertilize >= 1;
  });

  harvestTime = computed(() => {
    if (!this.cropData()) return null;
    const growthTime = this.cropData()!.growthTime;
    const harvestTime = new Date(
      this.crop().plantedTime! + growthTime * 24 * 60 * 60 * 1000,
    );
    // Every time the crop is fertilized, reduce the remaining growth time by one hour
    harvestTime.setHours(harvestTime.getHours() - this.crop().fertilizeCount);
    return harvestTime;
  });

  wiltTime = computed(() => {
    if (!this.cropData() || this.cropData()!.wiltTime === null) return null;
    let computedWiltTime = null;
    if (!this.crop().lastWaterTime || this.crop().lastWaterTime === null) {
      // Crop has never been watered, so calculate wilt time from initial planting time
      computedWiltTime = new Date(
        this.crop().plantedTime! + this.cropData()!.wiltTime! * 60 * 60 * 1000,
      );
    } else {
      // Watering a crop resets the wilt timer
      computedWiltTime = new Date(
        this.crop().lastWaterTime! + this.cropData()!.wiltTime! * 60 * 60 * 1000,
      );
    }
    // If the crop is harvestable before the wilt time, set the wilt time to null
    if (this.harvestTime() && computedWiltTime > this.harvestTime()!) {
      return null;
    }
    return computedWiltTime;
  });

  isWilted = computed(() => {
    if (!this.wiltTime()) return false;
    return this.currentTime() > this.wiltTime()!.getTime();
  });

  deadTime = computed(() => {
    // Crops die 24 hours after wilting, unless they're harvestable before then
    if (
      this.wiltTime() === null ||
      (this.harvestTime() && this.wiltTime()! > this.harvestTime()!)
    )
      return null;
    return new Date(this.wiltTime()!.getTime() + 24 * 60 * 60 * 1000);
  });

  fertilizeCrop() {
    this.gardenService.fertilizeCrop(
      this.plotID(),
      this.cropIndex(),
      this.crop().fertilizeCount,
    );
  }

  waterCrop() {
    this.gardenService.waterCrop(this.plotID(), this.cropIndex());
  }

  selectCrop(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    this.gardenService.selectCrop(
      this.plotID(),
      this.cropIndex(),
      Number(selectElement.value),
    );
  }

  clearCrop() {
    this.gardenService.clearCrop(this.plotID(), this.cropIndex());
  }

  formatRelativeTime(time: Date | null): string {
    if (!time) return 'N/A';
    dayjs.extend(relativeTime);
    return dayjs(time).fromNow();
  }
}
