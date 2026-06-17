import { Component, inject, input, OnDestroy, OnInit, signal } from '@angular/core';

import { GardenBed } from './garden-bed/garden-bed';
import { GardenService } from '../garden.service';
import { type Plot } from '../garden.interfaces';

@Component({
  selector: 'app-garden-plot',
  imports: [GardenBed],
  templateUrl: './garden-plot.html',
  styleUrls: ['./garden-plot.css'],
})
export class GardenPlot implements OnInit, OnDestroy {
  protected gardenService = inject(GardenService);
  private intervalId: any;
  currentTime = signal<number>(new Date().getTime());
  plot = input.required<Plot>();
  editingName = signal(false);

  ngOnInit() {
    // Update the current time every minute for tracking fertilization
    this.intervalId = setInterval(() => {
      this.currentTime.set(new Date().getTime());
    }, 60000);
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  updatePlotName(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    this.gardenService.updatePlotName(this.plot().plotID, inputElement.value);
  }
}
