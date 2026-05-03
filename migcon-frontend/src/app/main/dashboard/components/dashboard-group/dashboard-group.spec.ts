import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardGroup } from './dashboard-group';

describe('DashboardGroup', () => {
  let component: DashboardGroup;
  let fixture: ComponentFixture<DashboardGroup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardGroup]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardGroup);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
