import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-create-user',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-user.html',
  styleUrls: ['./create-user.css']
})
export class CreateUser {

  fullName = '';
  email = '';
  password = '';
  mobile = '';
  role = 'User';

  constructor(
    private userService: UserService,
    private router: Router
  ) {}

  createUser() {
    if (!this.fullName || !this.email || !this.password) return;

    this.userService.addUser({
      fullName: this.fullName,
      email: this.email,
      password: this.password,
      mobile: this.mobile,
      role: this.role
    });

    this.router.navigate(['/profile']);
  }

  cancel() {
    this.router.navigate(['/profile']);
  }
}
