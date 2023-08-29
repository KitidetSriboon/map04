import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GlobalConstants } from 'src/global-constants';
import { BrdsqlService } from '../service/brdsql.service';

@Component({
  selector: 'app-faq',
  templateUrl: './faq.page.html',
  styleUrls: ['./faq.page.scss'],
})
export class FaqPage implements OnInit {

  qsetup?: any = []
  yearTh = GlobalConstants.yearTh

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private brdsql: BrdsqlService,
  ) { }

  ngOnInit() {
    this.getQsetup();
  }

  getQsetup() {
    this.brdsql.getQsetup().subscribe((res:any) => {
      this.qsetup = res.recordset[0]
      console.log('qsetup res :' ,this.qsetup)
    })
  }

}
