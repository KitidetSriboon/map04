import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule ,ReactiveFormsModule } from '@angular/forms';
import { HomePage } from './home.page';
import { NavigationExtras, Router ,RouterLinkWithHref } from '@angular/router';

import { HomePageRoutingModule } from './home-routing.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    RouterLinkWithHref,
    HomePageRoutingModule
  ],
  declarations: [HomePage]
})
export class HomePageModule {}
