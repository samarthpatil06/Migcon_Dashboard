import { Injectable } from '@angular/core';

export interface Device {
  name: string;
  mac: string;
  id: string;
  location: string;
  group: string;   // IMPORTANT (used for group linking)
}

@Injectable({
  providedIn: 'root'
})
export class DeviceService {

  private devices: Device[] = [
    {
      name: 'Device1',
      mac: '00:F8:3C:98:4B:6A',
      id: 'ID001',
      location: 'Farm',
      group: 'THI Device'
    },
    {
      name: 'Device2',
      mac: '00:F0:CA:20:DE:25',
      id: 'ID002',
      location: 'Farm',
      group: 'THI Device'
    },
    {
      name: 'E0C0',
      mac: '00:E0:C0:61:F8:1F',
      id: 'E0C0',
      location: 'Office',
      group: 'THI Device'
    },
    {
      name: 'Floor',
      mac: '00:DA:A7:A6:72:AD',
      id: 'ID0004',
      location: 'Factory Floor 1',
      group: 'Workshop Floor'
    }
  ];

  getDevices(): Device[] {
    return this.devices;
  }

  addDevice(device: Device) {
    this.devices.push(device);
  }

}
