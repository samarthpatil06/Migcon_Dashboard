import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {

  loginForm: FormGroup;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: [''],
      password: ['']
    });
  }

  onLogin() {
    const { email, password } = this.loginForm.value;

    if (email === 'admin@migcon.com' && password === '123456') {
      localStorage.setItem('token', 'loggedIn');
      this.router.navigate(['/dashboard']);
    } else {
      this.errorMessage = 'Invalid email or password';
    }
  }
}
