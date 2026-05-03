import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Group {
  name: string;
  location: string;
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class GroupService {

  private groupsSource = new BehaviorSubject<Group[]>([
    { name: 'THI Device', location: 'Precision Farm', description: 'Farm sensors' },
    { name: 'Workshop Floor', location: 'Workshop Building', description: 'Factory floor devices' }
  ]);

  groups$ = this.groupsSource.asObservable();

  getGroups() {
    return this.groupsSource.value;
  }

  addGroup(group: Group) {
    const updated = [...this.groupsSource.value, group];
    this.groupsSource.next(updated);
  }

}
