import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { GroupService, Group } from '../../core/services/group.service';
import { DeviceService, Device } from '../../core/services/device.service';

@Component({
  selector: 'app-groups',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './groups.html',
  styleUrls: ['./groups.css']
})
export class Groups {

  groups: Group[] = [];
  openGroup: string | null = null;

  constructor(
    private groupService: GroupService,
    private deviceService: DeviceService
  ) {
    console.log("NEW GROUPS COMPONENT LOADED");
    this.groups = this.groupService.getGroups();
  }

  toggleGroup(groupName: string) {
    this.openGroup =
      this.openGroup === groupName ? null : groupName;
  }

  getDeviceCount(groupName: string) {
    return this.deviceService
      .getDevices()
      .filter(d => d.group === groupName).length;
  }

  getDevices(groupName: string) {
    return this.deviceService
      .getDevices()
      .filter(d => d.group === groupName);
  }

}
