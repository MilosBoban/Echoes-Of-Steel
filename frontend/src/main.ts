import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component'; // Uvođenje komponente koju smo napravili

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));