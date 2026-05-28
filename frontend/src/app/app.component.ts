import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent],
  templateUrl: './app.html', // Kažemo mu da gleda onaj spoljni fajl u src folderu
  styleUrl: './app.css'     // Povezujemo ga sa globalnim stilom
})
export class AppComponent { }