import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home';
import { ShopComponent } from './pages/shop/shop';
import { EduComponent } from './pages/edu/edu';
import { AuthComponent } from './pages/auth/auth';

export const routes: Routes = [
  { path: '', component: HomeComponent },         
  { path: 'shop', component: ShopComponent },     
  { path: 'edu', component: EduComponent },       
  { path: 'auth', component: AuthComponent },     
  { path: '**', redirectTo: '', pathMatch: 'full' } 
];