import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { GetqcardPageRoutingModule } from './getqcard-routing.module';

import { GetqcardPage } from './getqcard.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    GetqcardPageRoutingModule
  ],
  declarations: [GetqcardPage]
})
export class GetqcardPageModule { }
