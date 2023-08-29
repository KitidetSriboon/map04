import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule} from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { QbookPageRoutingModule } from './qbook-routing.module';

import { QbookPage } from './qbook.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    QbookPageRoutingModule
  ],
  declarations: [QbookPage]
})
export class QbookPageModule {}
