import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { GroupService } from '../../../core/services/group.service';

@Component({
  selector: 'app-add-group',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-groups.html',
  styleUrls: ['./add-groups.css']
})
export class AddGroup {

  name: string = '';
  location: string = '';
  description: string = '';

  constructor(
    private groupService: GroupService,
    private router: Router
  ) {}

  addGroup() {
    if (!this.name || !this.location || !this.description) return;

    this.groupService.addGroup({
      name: this.name,
      location: this.location,
      description: this.description
    });

    this.router.navigate(['/groups']);
  }

  cancel() {          // ✅ ADD THIS
    this.router.navigate(['/groups']);
  }

}
