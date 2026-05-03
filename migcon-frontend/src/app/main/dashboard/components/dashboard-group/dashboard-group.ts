import { Component, Input, OnChanges, OnInit, OnDestroy, HostListener, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Device } from '../../../../core/services/dashboard.service';

@Component({
  selector: 'app-dashboard-group',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-group.html',
  styleUrls: ['./dashboard-group.css'],
})
export class DashboardGroup implements OnInit, OnChanges, OnDestroy {
  @Input() groupName!: string;
  @Input() devices: Device[] = [];

  isOpen = true;
  private uiTicker: any;

  constructor(private cdr: ChangeDetectorRef) {}

  // Fires every time parent pushes new devices[] — forces re-render
  ngOnInit(): void {
    this.uiTicker = setInterval(() => this.cdr.detectChanges(), 1000);
  }

  ngOnChanges(): void {
    this.cdr.detectChanges();
  }

  ngOnDestroy(): void {
    clearInterval(this.uiTicker);
  }

  toggle() { this.isOpen = !this.isOpen; }

  toggleMenu(device: Device, event: Event) {
    event.stopPropagation();
    this.devices.forEach(d => { if (d !== device) d.menuOpen = false; });
    device.menuOpen = !device.menuOpen;
    this.cdr.detectChanges();
  }

  @HostListener('document:click')
  closeMenus() {
    this.devices.forEach(d => d.menuOpen = false);
    this.cdr.detectChanges();
  }

  getOnlineCount() { return this.devices.filter(d => d.status === 'Online').length; }
  getAlarmCount()  { return this.devices.filter(d => d.status === 'Alarm').length; }

  alarmLabel(device: Device): string {
    return device.alarm ? `Alarm active (code: ${device.alarmCode ?? '--'})` : 'No alarm';
  }

  rssiLabel(device: Device): string {
    return device.rssi != null ? `Signal: ${device.rssi} dBm` : 'Signal: --';
  }

  elapsedLabel(device: Device): string {
    const sec = device.elapsedSeconds ?? (
      device.receivedAt
        ? Math.floor((Date.now() - new Date(device.receivedAt).getTime()) / 1000)
        : null
    );
    if (sec == null) return 'Waiting for data…';
    if (sec < 5)    return 'Just updated';
    if (sec < 60)   return `${sec}s ago`;
    if (sec < 3600) return `${Math.floor(sec / 60)}m ${sec % 60}s ago`;
    return `${Math.floor(sec / 3600)}h ago`;
  }
}
