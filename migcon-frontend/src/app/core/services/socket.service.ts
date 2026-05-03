import { Injectable, OnDestroy } from '@angular/core';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../environments/environment';

export interface LiveChannel {
  name: string;
  value: string;
  raw: number | null;
}

export interface LiveDevice {
  name: string;
  mac: string;
  macFormatted: string;
  group: string;
  modelCode: string;
  modelName: string;
  status: 'Online' | 'Offline';
  rssi: number | null;
  ipType: string;
  power: boolean;
  batteryVolts: number;
  logging: boolean;
  loggingStatus: 'stopped' | 'logging' | 'pending';
  alarm: boolean;
  alarmCode: string;
  logCount: number;
  channels: LiveChannel[];
  timestamp: number;
  receivedAt: string;
}

export interface NetworkStatus {
  connected: boolean;
}

@Injectable({ providedIn: 'root' })
export class SocketService implements OnDestroy {

  private socket!: Socket;
  private deviceUpdate$  = new Subject<LiveDevice>();
  private networkStatus$ = new BehaviorSubject<NetworkStatus>({ connected: false });

  constructor() {
    this.socket = io(environment.socketUrl, {
      // Allow polling → websocket upgrade (standard Socket.IO handshake)
      // DO NOT force websocket-only — it causes immediate disconnects in dev
      transports: ['polling', 'websocket'],
      reconnectionAttempts: Infinity,
      reconnectionDelay: 3000,
      timeout: 10000,
    });

    this.socket.on('connect', () => {
      console.log('[Socket] Connected — id:', this.socket.id);
      this.networkStatus$.next({ connected: true });
    });

    this.socket.on('disconnect', (reason: string) => {
      console.warn('[Socket] Disconnected:', reason);
      this.networkStatus$.next({ connected: false });
    });

    this.socket.on('connect_error', (err: Error) => {
      console.error('[Socket] Connection error:', err.message);
    });

    this.socket.on('device:update', (payload: LiveDevice) => {
      console.log('[Socket] device:update received:', payload.name, payload.channels);
      this.deviceUpdate$.next(payload);
    });

    this.socket.on('network:status', (status: NetworkStatus) => {
      this.networkStatus$.next(status);
    });
  }

  onDeviceUpdate(): Observable<LiveDevice> {
    return this.deviceUpdate$.asObservable();
  }

  onNetworkStatus(): Observable<NetworkStatus> {
    return this.networkStatus$.asObservable();
  }

  ngOnDestroy(): void {
    this.socket?.disconnect();
    this.deviceUpdate$.complete();
  }
}
