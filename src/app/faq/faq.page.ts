import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GlobalConstants } from 'src/global-constants';
import { BrdsqlService } from '../service/brdsql.service';
import { FirebaseService } from '../service/firebase.service';
import { LoadingController } from '@ionic/angular';
import { Subscription } from 'rxjs';

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
    private firebasedb: FirebaseService,
    private loadCtrl: LoadingController
  ) { }

  ngOnInit() {
    this.getQsetup();
  }

  getQsetup() {
    this.brdsql.getQsetup().subscribe((res: any) => {
      this.qsetup = res.recordset[0]
      console.log('qsetup res :', this.qsetup)
    })
  }

  // เชคแปลงที่มีการบันทึกกิจกรรม
  async ckFmdata() {
    console.log('ckFmdata')
    this.presentLoading('โหลดแปลง fmdata')

    await this.firebasedb.ckFmdata().then((res: any) => {
      console.log('fb res: ', res)
      this.closeLoading();
    })

  }

  async presentLoading(msg: string) {
    const loading = await this.loadCtrl.create({
      cssClass: 'load',
      message: msg,
    });
    await loading.present();
    // const { role, data } = await loading.onDidDismiss();
  }

  async closeLoading() {
    await this.loadCtrl.dismiss();
    // console.log('Loading dismissed!');
  }

}
