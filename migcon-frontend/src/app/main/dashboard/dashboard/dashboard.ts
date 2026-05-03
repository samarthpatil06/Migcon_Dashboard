import { Component, OnInit, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { DashboardService, DeviceGroup, AlarmEvent } from '../../../core/services/dashboard.service';
import { SocketService } from '../../../core/services/socket.service';
import { DashboardGroup } from '../components/dashboard-group/dashboard-group';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, DashboardGroup],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class Dashboard implements OnInit, OnDestroy {

  groups: DeviceGroup[] = [];
  networkConnected = false;

  alarmToasts: (AlarmEvent & { id: number })[] = [];
  private toastCounter = 0;
  private subs = new Subscription();

  constructor(
    private dashboardService: DashboardService,
    private socketService: SocketService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {

    // Network status
    this.subs.add(
      this.socketService.onNetworkStatus().subscribe(s => {
        this.networkConnected = s.connected;
        this.cdr.detectChanges();
      })
    );

    // Live device groups — force change detection on every update
    this.subs.add(
      this.dashboardService.getGroups$().subscribe(groups => {
        this.groups = [...groups];   // new array reference triggers Angular binding
        this.cdr.detectChanges();
      })
    );

    // Alarm toast notifications
    this.subs.add(
      this.dashboardService.onAlarmTriggered().subscribe((event: AlarmEvent) => {
        const toast = { ...event, id: ++this.toastCounter };
        this.alarmToasts = [toast, ...this.alarmToasts];
        this.cdr.detectChanges();
        setTimeout(() => {
          this.dismissToast(toast.id);
          this.cdr.detectChanges();
        }, 8000);
      })
    );
  }

  dismissToast(id: number): void {
    this.alarmToasts = this.alarmToasts.filter(t => t.id !== id);
    this.cdr.detectChanges();
  }

  trackByGroup(_: number, g: DeviceGroup): string { return g.name; }
  trackByToast(_: number, t: { id: number }): number { return t.id; }

  ngOnDestroy(): void { this.subs.unsubscribe(); }
}
