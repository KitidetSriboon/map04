import { Component, OnInit, Input, NgZone } from '@angular/core';
import { ModalController, LoadingController, ToastController, AlertController, ActionSheetController } from '@ionic/angular';
import { GeolocationService } from '../service/geolocation.service';
import { GlobalConstants } from 'src/global-constants';
import { Loader } from '@googlemaps/js-api-loader';
import { FirebaseService } from '../service/firebase.service';
import { BrdsqlService } from '../service/brdsql.service';
// geolocation in this page
import { CallbackID, Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-qbook',
  templateUrl: './qbook.page.html',
  styleUrls: ['./qbook.page.scss'],
})
export class QbookPage implements OnInit {

  // code1
  coordinate: any;
  watchCoordinate: any;
  watchId: any;

  @Input() data: any;
  testmode = GlobalConstants.testmode
  groupcode = localStorage.getItem('groupcode')
  cpselect?: any = [];
  cpFBSelect?: any = [];
  qsetup?: any = [];
  macpselect?: any = [];
  itid?: any = ""
  yearCr = GlobalConstants.yearCr
  ckfillY?: string = "clear"
  ckfillF?: string = "clear"
  ckfillN?: string = "clear"
  cutStatus?: string = "";
  upos = { lat: 0, lng: 0 };
  cppolygon = [];
  cppos = { lat: 0, lng: 0 }
  isInCp?: boolean;
  isNearCp?: boolean;
  isNearHome?: boolean;
  uposdistanct = 0
  canGetq?: boolean;
  getQMethod?: string = ''
  cpgetQcard?: any = []
  limit = 100
  loader = new Loader({
    apiKey: GlobalConstants.gmap.mapkey,
    version: GlobalConstants.gmap.version,
    libraries: ["places"],
  });
  fmdata = {
    "cutstatus": "",
    "cutstart": "",
    "cutstop": "",
    "cutstill": ""
  }
  public alertButtons = [
    {
      text: 'OK',
      role: 'confirm',
      handler: (data: any) => {
        this.setCutstatus('S', data.cutstill)
        console.log('input: ', data.cutstill);
      },
    },
  ];
  public alertInputs = [
    {
      name: 'cutstill',
      type: 'textarea',
      placeholder: 'เหตุผลการหยุดตัดชั่วคราว',
    },
  ];
  public altCancletest = [
    {
      text: 'Cancel',
      role: 'cancel',
      handler: () => {
        console.log('Alert canceled');
      },
    },
    {
      text: 'OK',
      role: 'confirm',
      handler: () => {
        this.cancleTest()
        // console.log('Alert confirmed');
      },
    },
  ];

  constructor(
    private modalCtrl: ModalController,
    private loadCtrl: LoadingController,
    private alertCtrl: AlertController,
    private actCtr: ActionSheetController,
    private geosv: GeolocationService,
    private toastCtrl: ToastController,
    private fbservice: FirebaseService,
    private brdservice: BrdsqlService,
    private zone: NgZone,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,

  ) {
    this.itid = this.route.snapshot.paramMap.get('itid');
    console.log('itid in qbook constructor :', this.itid)
  }

  ngOnInit() {
    this.getMapdata()
    this.getCpSelect(this.itid)
    this.getQsetup()
    this.getCpQcard();
    this.ckCutStatusinDB();
  }

  ngAfterViewInit() {
    this.getGeolocation()
  }

  setResult(ev: any) {
    console.log(`Dismissed with role: ${ev.detail.role}`);
  }

  cancleTest() {
    this.fbservice.cancleTest(this.yearCr, this.itid).then((res) => {
      console.log('fb res cancleTest:', res)
      this.ckCutStatusinDB();
    })
  }

  async getCpSelect(itidpara: string) {
    // console.log('ititpara :', itidpara)
    let data: any;
    let data1 = []
    data = localStorage.getItem('cpgroupsql')
    data1 = JSON.parse(data)
    this.cpselect = data1.filter((o: any) => o.itid === itidpara)
    this.cpselect = this.cpselect[0];
  }

  // เรียกการตั้งค่าระบบคิว
  async getQsetup() {
    await this.brdservice.getQsetup().subscribe({
      next: (res: any) => {
        if (!res) {
          this.presentToast('!! มีข้อผิดพลาดในการเรียกการตั้งค่าระบบคิวอ้อย กรุณาลองใหม่อีกครั้ง', 'alert')
        } else {
          this.qsetup = res.recordset[0];
          // console.log('qsetup :', this.qsetup)
          // console.log('toleranceInMeters :', this.qsetup.toleranceInMeters)
        }
      }
    })
  }

  getMapdata() {
    let mapFbdata: any = []
    mapFbdata = localStorage.getItem('mapcpgroup')
    mapFbdata = JSON.parse(mapFbdata)
    this.macpselect = mapFbdata.filter((x: { key: any; }) => x.key == this.itid)
    this.macpselect = this.macpselect[0];
    // กำหนดตำแหน่งแปลงอ้อย
    this.cppolygon = this.macpselect.coordinates
    this.cppos = this.macpselect.coordinatesCenter
  }

  // การใช้ใบคิวของแปลงอ้อย
  getCpQcard() {
    this.brdservice.getCpQcard(this.itid).subscribe((res: any) => {
      this.cpgetQcard = res.recordset[0]
      // console.log('cpgetQcard:', this.cpgetQcard)
    })
  }

  async ckCutStatusinDB() {
    // console.log('ckCutStatusinDB')
    // check current cutstatus in db
    await this.fbservice.getMapByitid(this.yearCr, this.itid)
      .then((res: any) => {
        // console.log('cpFBSelect: ', res)
        this.cpFBSelect = res;
        let cutstatusfb = this.cpFBSelect.fmdata
        if (!cutstatusfb) {
          // แปลงยังไม่บันทึกสถานะการตัดจากชร. ยังไม่มี fmdata child
          this.fmdata.cutstatus = 'N'
          this.fmdata.cutstart = ''
          this.fmdata.cutstop = ''
          this.fmdata.cutstill = ''
        } else {
          this.fmdata.cutstatus = cutstatusfb.cutstatus
          this.fmdata.cutstart = cutstatusfb.cutstart
          this.fmdata.cutstop = cutstatusfb.cutstop
          this.fmdata.cutstill = cutstatusfb.cutstill
        }
        console.log('fmdat fb :', cutstatusfb)
      })
      .catch((e) => {
        console.error(e)
      })
      .finally(() => {

      })
  }

  // get user location
  async getGeolocation() {
    this.presentToast('กำลังเรียกพิกัดของคุณ...', 'locate')
    this.geosv.getCurrentCoordinate().then((res: any) => {
      this.upos.lat = res.coords.latitude
      this.upos.lng = res.coords.longitude
    }).catch((e: any) => {
      console.log('error :', e)
    }).finally(() => {
      this.loadmap()
    })
  }

  async loadmap() {

    let cppolygon = this.cppolygon
    let cppos = this.cppos
    let upos = this.upos

    await this.loader.load().then(() => {
      // 1. Create Map
      const map = new google.maps.Map(document.getElementById('map1') as HTMLElement, {
        center: upos,
        zoom: 16,
        panControl: true,
        mapTypeId: 'roadmap',
        mapTypeControl: true,
        mapTypeControlOptions: {
          style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
          mapTypeIds: ["roadmap", "terrain", "satellite", "hybrid"],
        },
      });

      // 2. Create marker
      let label: string = "<ion-icon name='person-outline' color='danger'></ion-icon> <ion-label color='primary'> คุณอยู่ที่นี่ </ion-label>"
      const marker = new google.maps.Marker({
        position: upos,
        map,
        label: "",
        icon: 'assets/icon/fm64.png',
        // animation: google.maps.Animation.BOUNCE,  // ไอคอนเด้งขึ้นลง
      });

      // 3. Create circle
      const circle = new google.maps.Circle({
        center: upos,
        map,
        strokeWeight: 2,
        strokeColor: '#FF992C',
        fillColor: '#F5F8B4',
        fillOpacity: 0.35,
        radius: 100,  // รัศมีเป็นเมตร
      })

      // 4. Create InfoWindow.
      let infoWindow = new google.maps.InfoWindow({
        content: label,
        position: upos,
      });
      infoWindow.open(map);

      // 5. Create polygon
      const cpselect = new google.maps.Polygon({
        paths: cppolygon,
        fillColor: "#7FB5FF",
        strokeColor: "#FF0000",
        strokeWeight: 3,
        fillOpacity: 0.35,
      });
      cpselect.setMap(map);

      // 6. create marker
      const markercp = new google.maps.Marker({
        position: cppos,
        map,
        label: "แปลงอ้อย",
        icon: 'assets/icon/truck48.png',
        animation: google.maps.Animation.BOUNCE,
      });
      markercp.setMap(map)

      setTimeout(() => {
        this.ckIsincp()
        this.ckLocationonEdge();
        this.upostocp_distance();
        this.ckCangetQ();
      }, 1000);

    })
  }  // End loadmap

  // ตรวจสอบตำแหน่งอยู่ที่แปลงอ้อยหรือไม่
  async ckIsincp() {
    let cppolygon = this.cppolygon
    let upos = this.upos
    let cplot = new google.maps.Polygon({ paths: cppolygon });
    let isWithinPolygon = google.maps.geometry.poly.containsLocation(upos, cplot)
    // this.isInCp = isWithinPolygon
    this.isInCp = true  // สำหรับใช้ทดสอบ
    console.log('isWithinPolygon :', isWithinPolygon);
    console.log('isInCp :', this.isInCp);
  }

  // ตรวจสอบตำแหน่งอยู่ใกล้แปลงอ้อยกี่เมตร 
  async ckLocationonEdge() {
    let upos = this.upos
    let cppolygon = this.cppolygon
    // ตรวจสอบว่า อยู่ในระยะที่กำหนด จากพิกัด ถึง จุดใดจุดหนึ่งของแปลง หรือไม่ ใช้ฟังก์ชั่น isLocationOnEdge
    // console.log('isNearCp check');
    let polyline = new google.maps.Polyline({
      path: cppolygon
    });
    let toleranceInMeters: number = this.qsetup.toleranceInMeters  //  0.001 = 100 เมตร
    let isLocationNear = google.maps.geometry.poly.isLocationOnEdge(upos, polyline, toleranceInMeters);
    this.isNearCp = isLocationNear
    // console.log('ห่างจากแปลง100ม. :', this.isNearCp)
  }

  // คำนวณระยะห่างระหว่าง พิกัด GPS และ แปลงอ้อย แบบ Point to point
  upostocp_distance() {

    // console.log('4.upostocp_distance')
    // console.log('upos :', this.upos)
    // console.log('cppos :', this.cppos)

    let mk1: any, mk2: any
    mk1 = this.upos
    mk2 = this.cppos
    // mk2 = this.cppolygon 
    let R = 6371000; // Radius of the Earth in meters 6,371,000
    // var R = 6371; // Radius of the Earth in kilometers
    let rlat1 = mk1.lat * (Math.PI / 180); // Convert degrees to radians
    let rlat2 = mk2.lat * (Math.PI / 180); // Convert degrees to radian
    let difflat = rlat2 - rlat1; // Radian difference (latitudes)
    let difflon = (mk2.lng - mk1.lng) * (Math.PI / 180); // Radian difference (longitudes)
    let d = 2 * R * Math.asin(Math.sqrt(Math.sin(difflat / 2) * Math.sin(difflat / 2) + Math.cos(rlat1) * Math.cos(rlat2) * Math.sin(difflon / 2) * Math.sin(difflon / 2)))
    // return d;
    this.uposdistanct = d
    // this.cptogps = d.toFixed(2)
    // console.log('ตำแหน่งคุณกับแปลงอ้อย =', d.toFixed(2) + ' ม.')
    // let x = d*1000
    if (d > this.limit) {
      // this.canGetq = false
    } else {
      // this.canGetq = true
    }
  }

  // คำนวณระยะห่างระหว่าง พิกัด GPS และ แปลงอ้อย แบบ Point to any Polygon
  getDistanctPolygon1(location: any, polyline: any, toleranceInMeters: number) {
    // code from stackoverflow https://stackoverflow.com/questions/28783685/islocationonedge-tolerance-calculation-in-terms-of-km

    for (var leg of polyline.getPath().b) {
      if (google.maps.geometry.spherical.computeDistanceBetween(location, leg) <= toleranceInMeters) {
        console.log('100 ม.= true')
        return true;
      }
    }
    console.log('100 ม.= false')
    return false;

  }

  // คำนวณระยะห่างระหว่าง แปลงอ้อย และ พิกัด GPS แบบ point to Polygon โดยใช้ function isLocationOnEdge()
  getDistanctPolygon(location: any, polyline: any, toleranceInMeters: number) {
    // code from google map js api
    console.log('พิกัดกับแปลงที่บ้าน 100 เมตร')
    // 0.001 คือ 100 เมตร
    let isLocationNear = google.maps.geometry.poly.isLocationOnEdge(location, polyline, toleranceInMeters);
    return isLocationNear
  }

  close() {
    this.modalCtrl.dismiss();
  }

  ckCangetQ() {
    let getqMethod: string = this.qsetup.getqMethod
    console.log('getqMethod :', getqMethod)
    switch (getqMethod) {
      case "1":  // จองคิวแบบอยู่ตรงไหนก็ได้
        this.canGetq = true;
        this.getQMethod = 'อยู่ที่ไหนก็ได้'
        break;
      case "2":  // จองคิวแบบอยู่ในแปลงอ้อยเท่านั้น
        if (this.isInCp) { this.canGetq = true }
        this.getQMethod = 'อยู่ในเขตแปลงอ้อยเท่านั้น'
        break;
      case "3":  // จองคิวแบบอยู่ใกล้แปลงในรัศมีที่กำหนด
        if (this.isNearCp) { this.canGetq = true }
        this.getQMethod = 'อยู่ใกล้แปลงในระยะที่กำหนด'
        break;
      default:
        this.canGetq = false;
        this.getQMethod = ''
        break;
    }
    console.log('cangetQ :', this.canGetq)
  }

  // บันทึกสถานะการตัดจาก การเปิดแปลง
  async setCutstatus(cutstatus: string, cutstill: string) {

    // ตรวจสอบแปลงในกลุ่ม หากมีแปลงสถานะเป็น Y ให้แจ้งเตือนการปิดแปลงที่สถานะเป็น Y และยืนยันการเปิดแปลงปัจจุบัน
    let lc_mapfb: any = []
    let ckplotY = false;
    lc_mapfb = localStorage.getItem('mapcpgroup')
    lc_mapfb = JSON.parse(lc_mapfb)
    // แปลงที่มีการบันทึกกิจกรรมจากชร.แล้ว
    lc_mapfb = lc_mapfb.filter((el: any) => el.fmdata)
    console.log('filter fmdata :', lc_mapfb)

    if (lc_mapfb.length === 0) {
      console.log('ยังไม่มีแปลงบันทึกกิจกรรมจากชาวไร่ ในกลุ่ม')
      ckplotY = false;
    } else {
      // มีการบันทึกกิจกรรมแปลงจากชาวไร่ ตรวจแปลงสถานะตัด Y ในกลุ่ม
      lc_mapfb = lc_mapfb.filter((el: any) => el.fmdata.cutstatus === 'Y' && el.fmdata.key !== this.itid)
      if (lc_mapfb.length === 0) {
        console.log('ยังไม่มีแปลง cutstatus=Y')
        ckplotY = false;
      } else {
        // พบแปลงสถานะการตัดเป็น Y แจ้งให้ทราบเพื่อจะปิดแปลงนั้นๆ ก่อน เปิดแปลงปัจจุบัน
        console.log('พบแปลงสถานะตัด=Y', lc_mapfb)
        ckplotY = true;
        this.showPlotDesc(lc_mapfb)
      }
    }

    console.log('ckplotY:', ckplotY)
    let cutstart = ""
    let cutstop = ""
    let dateupdate = ""
    switch (cutstatus) {
      case 'Y':
        cutstart = this.setDate()
        cutstop = ""
        cutstill = ""
        dateupdate = this.setDate()
        break;
      case 'F':
        cutstop = this.setDate()
        cutstill = ""
        dateupdate = this.setDate()
        break;
      case 'S':
        cutstop = ""
        cutstill = cutstill
        dateupdate = this.setDate()
        break;
      default:
        break;
    }


    // อัพเดตสถานะการตัดไป firebase child fmdata
    if (ckplotY == false) {
      switch (cutstatus) {
        case 'Y':
          await this.fbservice.saveCutY(this.yearCr, this.itid, cutstart, dateupdate)
            .then((res: any) => {
              console.log('firebase res:', res)
            })
          break;
        case 'S':
          await this.fbservice.saveCutStill(this.yearCr, this.itid, cutstill, dateupdate)
            .then((res: any) => {
              console.log('firebase res:', res)
            })
          break;
        case 'F':
          await this.fbservice.saveCuted(this.yearCr, this.itid, cutstop, dateupdate)
            .then((res: any) => {
              console.log('firebase res:', res)
            })
          break;
        default:
          break;
      }

    }
    //เช็คที่ firebase เพื่ออัพเดตสถานะการตัด เพื่อให้ปุ่มสถานะการตัด ทำงานที่อัพเดต
    this.ckCutStatusinDB()

  }

  setDate(): string {
    const today = new Date();
    const yyyy = today.getFullYear();
    let mm: any = today.getMonth() + 1; // Months start at 0!
    let mm1: any = today.getMonth() + 1; // Months start at 0!
    let dd: any = today.getDate();
    if (dd < 10) dd = '0' + dd;
    if (mm < 10) mm = '0' + mm;
    let timex = today.getHours() + ':' + today.getMinutes() + ':' + today.getSeconds()
    const formattedToday = yyyy + '-' + mm + '-' + dd + ' ' + timex;
    return formattedToday
    // console.log('data to fb:', formattedToday )
  }

  ckCut(cutstatus: string) {
    switch (cutstatus) {
      case 'N':
        this.ckfillN = 'solid'
        this.cutStatus = 'N'
        break;
      case 'Y':
        if (this.ckfillY = 'clear') {
          this.ckfillY = 'solid'
        }
        this.cutStatus = "Y"
        // var date = new Date();
        const cutstart = new Date().toLocaleDateString('en-GB');
        console.log('cutstart :', cutstart)
        console.log('ckfillY :', this.ckfillY)
        // let todate = new Date().toString()
        // console.log('todate :' ,todate)
        this.fbservice.setCutstatus1(this.yearCr, this.itid, 'Y', cutstart).then((res) => {
          console.log('fb update res :', res)
        })
        break;
      case 'F':
        this.ckfillF = 'solid'
        this.cutStatus = 'F'
        break;
      default:
        this.ckfillN = 'clear'
        this.cutStatus = 'N'
        break;
    }
  }

  // แจ้งเตือนว่ามีแปลงที่สถานะตัด Y ในกลุ่ม เพื่อปิดแปลงนั้นก่อน จึงจะเปิดแปลงที่เลือกได้
  async showPlotDesc(data: any) {
    // console.log('cpmap data: ', data)
    let dt = data[0]
    // console.log('cpmap data[0]: ', dt)
    if (dt !== undefined) {
      const actionSheet = await this.actCtr.create({
        header: 'พบว่าแปลง ' + dt.bnm_profile.name + ' ' + dt.bnm_profile.surname,
        subHeader: dt.DetailPlant.CaneTypeName + ' พท.' + parseFloat(dt.DetailPlant.AreaPre).toFixed(2) + ' ไร่ อยู่ระหว่างตัด หากเปิดแปลงใหม่ จะทำการปิดแปลงนี้ โดยอัตโนมัติ',
        cssClass: 'my-custom-class',
        buttons: [
          {
            text: 'ตกลง/ปิดแปลง',
            role: 'destructive',
            data: {
              action: 'add',
            },
            handler: () => {
              this.confirmSaveCuted(dt.key);
            }
          },
          {
            text: 'ยกเลิก',
            role: 'cancel',
            data: {
              action: 'cancel',
            },
          },
        ],
      });
      actionSheet.present();
    } else {
      this.presentAlert('แจ้งเตือน', 'ข้อมูลแปลงที่สถานะตัดY', '!!ไม่มีข้อมูลเข้ามา')
    }
  }

  async confirmSaveCuted(key: string) {
    // this.presentAlert('เลือก', 'ตกลง', 'ทดสอบ')
    // อัพเดตสถานะการตัดไป firebase child fmdata
    await this.fbservice.saveCuted(this.yearCr, key, this.setDate(), this.setDate())
      .then((res: any) => {
        console.log('firebase res:', res)
      })
    this.presentToast('บันทึก ปิดแปลงแล้ว', 'checkmark-done')

    // เมื่อบันทึก ปิดแปลงแล้ว ให้อัพเดตการ เปิดแปลงปัจจุบัน
    await this.fbservice.saveCutY(this.yearCr, this.itid, this.setDate(), this.setDate())
      .then((res: any) => {
        console.log('firebase res:', res)
      })
    this.presentToast('บันทึก เปิดแปลงแล้ว', 'walk')

    //เช็คที่ firebase เพื่ออัพเดตสถานะการตัด เพื่อให้ปุ่มสถานะการตัด ทำงานที่อัพเดต
    this.ckCutStatusinDB()
  }

  submit(f: any) {
    console.log('Form :', f)
  }

  toGetqcard(itid: string) {
    let navigationExtras: NavigationExtras = {
      queryParams: {
        special: itid
      }
    };
    this.router.navigate(['/getqcard', itid], navigationExtras);
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


}
