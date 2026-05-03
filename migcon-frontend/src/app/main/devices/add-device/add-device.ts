import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DeviceService, Device } from '../../../core/services/device.service';
import { GroupService } from '../../../core/services/group.service';

@Component({
  selector: 'app-add-device',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-device.html',
  styleUrls: ['./add-device.css']
})
export class AddDevice {

  mac: string = '';
  name: string = '';
  group: string = '';
  model: string = '';
  id: string = '';
  location: string = '';

  groups: string[] = [];

  constructor(
    private deviceService: DeviceService,
    private groupService: GroupService,
    private router: Router
  ) {
    this.groups = this.groupService
      .getGroups()
      .map(g => g.name);
  }

  addDevice() {

    if (!this.mac || !this.name || !this.group) return;

    const newDevice: Device = {
      mac: this.mac,
      name: this.name,
      group: this.group,
      id: this.id,
      location: this.location
    };

    this.deviceService.addDevice(newDevice);

    this.router.navigate(['/devices']);
  }

  cancel() {
    this.router.navigate(['/devices']);
  }

}
