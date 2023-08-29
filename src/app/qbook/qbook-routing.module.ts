import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { QbookPage } from './qbook.page';

const routes: Routes = [
  {
    path: '',
    component: QbookPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class QbookPageRoutingModule {}
