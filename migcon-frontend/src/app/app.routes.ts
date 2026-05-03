import { Routes } from '@angular/router';
import { Login } from './main/login/login';
import { Layout } from './shared/components/layout/layout';
import { Dashboard } from './main/dashboard/dashboard/dashboard';
import { Groups } from './main/groups/groups';
import { AddGroup } from './main/groups/add-groups/add-groups';
import { Devices } from './main/devices/devices';
import { AddDevice } from './main/devices/add-device/add-device';
import { Profile } from './main/profile/profile';
import { CreateUser } from './main/profile/create-user/create-user';
import { AuthGuard } from './core/guards/auth-guard';

export const routes: Routes = [

  // Default → Login
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // Login route (NO GUARD)
  { path: 'login', component: Login },

  // Protected Layout Routes
  {
    path: '',
    component: Layout,
    canActivate: [AuthGuard],
    children: [
      { path: 'dashboard', component: Dashboard },
      { path: 'groups', component: Groups },
      { path: 'groups/add', component: AddGroup },
      { path: 'devices', component: Devices },
      { path: 'devices/add', component: AddDevice },
      { path: 'profile', component: Profile },
      { path: 'users/create', component: CreateUser }
    ]
  },

  // Wildcard MUST be last
  { path: '**', redirectTo: 'login' }

];
