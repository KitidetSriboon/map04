import { Component, OnInit } from '@angular/core';
import { FormGroup } from "@angular/forms";
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController, LoadingController, ToastController, AlertController, ActionSheetController } from '@ionic/angular';
import { NavController } from '@ionic/angular';
// import { Subscription } from 'rxjs';
// import { BrdsqlService } from '../service/brdsql.service';

@Component({
  selector: 'app-getqcard',
  templateUrl: './getqcard.page.html',
  styleUrls: ['./getqcard.page.scss'],
})
export class GetqcardPage implements OnInit {

  // frm_qbook!: FormGroup;
  itid?: any;
  // submitted = false;
  // landno?: any;
  // qfree = false;  // ใช้คิวเสรี
  // ckqLost = true; // การตรวจสอบการตกรอบ ตกคิว
  // cpSelect?: any = [];
  // cpQcard?: any = [];
  // qusedCp?: any = [];
  // headGroupData?: any = [];
  // data = JSON.parse(localStorage.getItem('headgroup'))
  // groupcode?: any = localStorage.getItem('groupcode')
  // qtype?: string = this.data.qtype
  // qnow = JSON.parse(localStorage.getItem('qNow'))
  // ref_doc1?: string = this.qnow[0].ref_doc1;
  // @ViewChild(IonModal) modal: IonModal;
  // yearID?: string = ""

  constructor(
    private modalCtrl: ModalController,
    private loadCtrl: LoadingController,
    private alertCtrl: AlertController,
    private actCtr: ActionSheetController,
    private toastCtrl: ToastController,
    // private brdservice: BrdsqlService,
    private route: ActivatedRoute,
    private router: Router,
    // private fb: FormBuilder,
    private navCtrl: NavController

  ) {

    this.itid = this.route.snapshot.paramMap.get('itid');
    console.log('itid getqcard :', this.itid)

    // this.frm_qbook = fb.group({
    //   ref_doc1: ['', [Validators.required]],
    //   q_id: ['', [Validators.required]],
    //   truck_no: ['', [Validators.required]],
    // mobile: ['', [Validators.required, Validators.pattern('^[0-9]+$')]], -- for mobile nuber format
    // email: [
    //   '',
    //   [
    //     Validators.required,
    //     Validators.pattern('[a-z0-9._%+-]+@[a-z0-9.-]+.[a-z]{2,3}$'),
    //   ],
    // ],  // for email format
    // })
  }

  ngOnInit() {
    // let gc: any = localStorage.getItem('groupcode')
    // this.brdservice.getHeadgroupdata(gc).subscribe((res: any) => {
    //   // this.qtype = res.recordset
    //   console.log('headgroup: ', res.recordset[0])
    // })
  }

  submit(f: any) {
    console.log('f :', f)
  }

  close() {
    this.navCtrl.back();
  }

  async presentToast(msg: string, icon: string) {
    const toast = await this.toastCtrl.create({
      message: msg,
      duration: 2000,
      icon: icon,
    });
    toast.present();
  }

  async presentAlert(h: string, s: string, m: string) {
    const alert = await this.alertCtrl.create({
      header: h,
      subHeader: s,
      message: m,
      buttons: ['OK'],
      cssClass: 'custom-alert',
    });
    await alert.present();
  }

  ngOnDestroy(): void {
    // this.subCpGroup.unsubscribe
    // this.subcpQcard.unsubscribe;
    // this.subQusedcp.unsubscribe;
  }

}
