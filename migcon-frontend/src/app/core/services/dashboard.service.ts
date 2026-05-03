import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs';
import { GroupService } from './group.service';
import { SocketService, LiveDevice } from './socket.service';

export interface Channel {
  name: string;
  value: string;
}

export interface Device {
  name: string;
  mac: string;
  status: 'Online' | 'Offline' | 'Alarm';
  menuOpen?: boolean;
  channels: Channel[];
  rssi?: number | null;
  power?: boolean;
  logging?: boolean;
  loggingStatus?: string;
  alarm?: boolean;
  alarmCode?: string;
  batteryVolts?: number;
  receivedAt?: string;
  group?: string;
  // Set to true when alarm bit flips from 0→1 on a new message
  // Dashboard reads this to flash/toast, then clears it
  newAlarm?: boolean;
  lastMessageTime?: number;   // Date.now() when last MQTT msg arrived
  elapsedSeconds?: number;    // seconds since last message, updated every 1s
}

export interface DeviceGroup {
  name: string;
  devices: Device[];
}

/** Fired whenever a device transitions into alarm state */
export interface AlarmEvent {
  deviceName: string;
  mac: string;
  alarmCode: string;
  receivedAt: string;
}

const OFFLINE_TIMEOUT_SEC = 180;  // 3 minutes

@Injectable({ providedIn: 'root' })
export class DashboardService implements OnDestroy {

  private deviceMap  = new Map<string, Device>();
  private devices$   = new BehaviorSubject<Device[]>([]);

  /** Emits once every time a device alarm bit flips 0 → 1 */
  private alarmEvent$ = new Subject<AlarmEvent>();

  private sub!: Subscription;
  private ticker: any;

  constructor(
    private groupService: GroupService,
    private socketService: SocketService,
  ) {
    this.subscribeToLiveUpdates();
    this.startTicker();
  }

  // ── Live update handler ────────────────────────────────────────────────────

  private subscribeToLiveUpdates(): void {
    this.sub = this.socketService.onDeviceUpdate().subscribe((live: LiveDevice) => {
      const existing = this.deviceMap.get(live.mac);

      // Detect alarm TRANSITION: was clear before, is active now
      const alarmJustTriggered = live.alarm && !existing?.alarm;

      const device: Device = {
        name:          live.name,
        mac:           live.macFormatted,
        status:        live.alarm ? 'Alarm' : 'Online',
        menuOpen:      existing?.menuOpen ?? false,
        group:         live.group,
        channels:      live.channels.map(ch => ({ name: ch.name, value: ch.value })),
        rssi:          live.rssi,
        power:         live.power,
        logging:       live.logging,
        loggingStatus: live.loggingStatus,
        alarm:         live.alarm,
        alarmCode:     live.alarmCode,
        batteryVolts:  live.batteryVolts,
         receivedAt:      live.receivedAt,
        newAlarm:        alarmJustTriggered,
        lastMessageTime: Date.now(),
        elapsedSeconds:  0,
      };

      this.deviceMap.set(live.mac, device);
      this.emit();

      // Emit the alarm event so any subscriber (dashboard, toast service, etc.) can react
      if (alarmJustTriggered) {
        this.alarmEvent$.next({
          deviceName: live.name,
          mac:        live.macFormatted,
          alarmCode:  live.alarmCode,
          receivedAt: live.receivedAt,
        });
      }
    });
  }

  // ── Offline watcher ────────────────────────────────────────────────────────

  private startTicker(): void {
    this.ticker = setInterval(() => {
      const now = Date.now();
      let changed = false;

      this.deviceMap.forEach((device, mac) => {
        if (device.lastMessageTime == null) return;

        const elapsed = Math.floor((now - device.lastMessageTime) / 1000);

        let newStatus = device.status;
        if (elapsed >= OFFLINE_TIMEOUT_SEC && device.status !== 'Offline') {
          newStatus = 'Offline';
        }

        if (elapsed !== device.elapsedSeconds || newStatus !== device.status) {
          this.deviceMap.set(mac, { ...device, elapsedSeconds: elapsed, status: newStatus });
          changed = true;
        }
      });

      if (changed) this.emit();
    }, 1000);
  }

  private emit(): void {
    this.devices$.next(Array.from(this.deviceMap.values()));
  }

  // ── Public API ─────────────────────────────────────────────────────────────

  getGroups(): DeviceGroup[] {
    const allDevices = this.devices$.getValue();
    return this.groupService.getGroups().map(g => ({
      name:    g.name,
      devices: allDevices.filter(d => d.group === g.name),
    }));
  }

  getGroups$(): Observable<DeviceGroup[]> {
    return new Observable(observer => {
      const s = this.devices$.subscribe(() => observer.next(this.getGroups()));
      return () => s.unsubscribe();
    });
  }

  /**
   * Observable that fires ONLY when a device alarm bit transitions 0→1.
   * Subscribe in dashboard.ts to show a toast / banner.
   */
  onAlarmTriggered(): Observable<AlarmEvent> {
    return this.alarmEvent$.asObservable();
  }

  /** Call this after the UI has acknowledged a newAlarm flag */
  clearNewAlarm(mac: string): void {
    const device = this.deviceMap.get(mac);
    if (device) {
      this.deviceMap.set(mac, { ...device, newAlarm: false });
      this.emit();
    }
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    clearInterval(this.ticker);
    this.alarmEvent$.complete();
  }
}
