import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { UserService, User } from '../../core/services/user.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class Profile {

  users: User[] = [];

  constructor(
    private router: Router,
    private userService: UserService
  ) {
    this.users = this.userService.getUsers();
  }

  goToCreateUser() {
    this.router.navigate(['/users/create']);
  }

  goToChangePassword() {
    alert('Change Password Module');
  }
}
