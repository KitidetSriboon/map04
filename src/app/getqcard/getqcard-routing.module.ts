import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { GetqcardPage } from './getqcard.page';

const routes: Routes = [
  {
    path: '',
    component: GetqcardPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GetqcardPageRoutingModule {}
