import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from '../header/header';
import { BottomNav } from '../bottom-nav/bottom-nav';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, Header, BottomNav],
  templateUrl: './layout.html',
  styleUrls: ['./layout.css']
})
export class Layout {}
