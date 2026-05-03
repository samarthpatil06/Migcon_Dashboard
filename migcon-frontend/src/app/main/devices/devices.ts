import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DeviceService, Device } from '../../core/services/device.service';
import { GroupService } from '../../core/services/group.service';

@Component({
  selector: 'app-devices',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './devices.html',
  styleUrls: ['./devices.css']
})
export class Devices {

  openGroups: string[] = [];

  constructor(
    private deviceService: DeviceService,
    private groupService: GroupService
  ) {}

  get devices(): Device[] {
    return this.deviceService.getDevices();
  }

  get groups(): string[] {
    return this.groupService.getGroups().map(g => g.name);
  }

  toggleGroup(group: string) {
    if (this.openGroups.includes(group)) {
      this.openGroups = this.openGroups.filter(g => g !== group);
    } else {
      this.openGroups.push(group);
    }
  }

  getDevicesByGroup(group: string) {
    return this.devices.filter(d => d.group === group);
  }

}
