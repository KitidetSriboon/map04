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
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';

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

  frm_qbook!: FormGroup;

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

    this.frm_qbook = fb.group({
      groupcode: '',
    })
  }

  ngOnInit() {
    setTimeout(() => {
      this.getCpSelect(this.itid)
    }, 1000);
    setTimeout(() => {
      this.getQsetup()
    }, 1000);
    setTimeout(() => {
      this.getMapdata()
    }, 1000);
    setTimeout(() => {
      this.getGeolocation()
    }, 3000);
    setTimeout(() => {
      this.getCpQcard();
    }, 1000);
    setTimeout(() => {
      this.ckCutStatusinDB();
    }, 1000);
  }

  ngAfterViewInit() {

  }

  async getCpSelect(itidpara: string) {
    console.log('ititpara :', itidpara)
    // let itidpara1 = itidpara
    // let itidpara1 = '-NH2nJEiWOmHR9WfIpp4'
    // console.log('itidpara fix :', itidpara1)
    let data: any;
    let data1 = []
    data = localStorage.getItem('cpgroupsql')
    data1 = JSON.parse(data)
    this.cpselect = data1.filter((o: any) => o.itid === itidpara)
    this.cpselect = this.cpselect[0];
    // console.log('cpselect :', this.cpselect)
  }

  // +++++++++++ code1 from https://edupala.com/ionic-capacitor-geolocation-for-getting-location-data/

  async requestPermissions() {
    // not work for web
    const permResult = await Geolocation.requestPermissions();
    this.presentToast('requestPermissions :' + permResult, 'locate')
    console.log('requestPermissions : ', permResult);
  }

  // get user location
  async getGeolocation() {
    this.presentToast('กำลังเรียกพิกัดของคุณ...', 'locate')
    // this.geosv.getCurrentCoordinate()
    this.geosv.getCurrentCoordinate().then((res: any) => {
      // console.log('user position res :', res)
      this.upos.lat = res.coords.latitude
      this.upos.lng = res.coords.longitude
    }).catch((e: any) => {
      console.log('error :', e)
    }).finally(() => {
      this.loadmap()
      // console.log('getGeolocation finished')
    })
  }

  getCurrentCoordinate() {
    if (!Capacitor.isPluginAvailable('Geolocation')) {
      console.log('Plugin geolocation not available');
      this.presentAlert('Error', 'Plugin geolocation not available', 'Plugin ใช้งานไม่ได้')
      return;
    }
    let options = { maximumAge: 0, timeout: 10000, enableHighAccuracy: true };
    Geolocation.getCurrentPosition(options).then(data => {
      this.coordinate = {
        latitude: data.coords.latitude,
        longitude: data.coords.longitude,
        accuracy: data.coords.accuracy
      };
      this.upos.lat = data.coords.latitude
      this.upos.lng = data.coords.longitude
      console.log('coordinate work with :', this.coordinate);
      this.presentToast('coordinate work with :' + this.coordinate, 'locate')
      // this.loadmap()
    }).catch(err => {
      console.error(err);
      this.presentAlert('Error', 'Error get postion :' + err, 'ตรวจสอบการเปิด GPS หรือ การอนุญาตให้แอพใช้ GPS')
    }).finally(() => {
      this.loadmap()
    });
  }

  watchPosition() {
    let options = { maximumAge: 3000, timeout: 30000, enableHighAccuracy: true };
    try {
      this.watchId = Geolocation.watchPosition(options, (position, err) => {
        console.log('Watch', position);
        this.zone.run(() => {
          this.watchCoordinate = {
            latitude: position!.coords.latitude,
            longitude: position!.coords.longitude,
          };
          this.upos.lat = position!.coords.latitude
          this.upos.lng = position!.coords.longitude
        });
      });
      console.log('WatchId :', this.watchId)
      this.presentToast('WatchId :' + this.watchId, 'locate')
      this.loadmap()
    } catch (e) {
      console.error(e);
      this.presentAlert('Error', 'Error watch postion :' + e, 'ตรวจสอบการเปิด GPS หรือ การอนุญาตให้แอพใช้ GPS')
    }
  }

  clearWatch() {
    if (this.watchId != null) {
      Geolocation.clearWatch({ id: this.watchId });
      console.log('!Stop WatchId :', this.watchId)
      this.presentToast('!Stop WatchId :' + this.watchId, 'locate')
    }
  }


  // +++++++++++++++ End code 1 +++++++++++++++++++++++++++

  start() {
    setTimeout(() => {
      this.getGeolocation()
    }, 1000);
    setTimeout(() => {
      this.getMapdata()
    }, 1000);
    // setTimeout(() => {
    //   this.loadmap()
    // }, 1000);
    // setTimeout(() => {
    //   this.isWithinPoly()
    // }, 1000);
    setTimeout(() => {
      this.upostocp_distance()
    }, 1000)
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

    // console.log('1.getMapdata')

    let mapFbdata: any = []
    mapFbdata = localStorage.getItem('mapcpgroup')
    mapFbdata = JSON.parse(mapFbdata)
    this.macpselect = mapFbdata.filter((x: { key: any; }) => x.key == this.itid)
    this.macpselect = this.macpselect[0];
    // กำหนดตำแหน่งแปลงอ้อย
    this.cppolygon = this.macpselect.coordinates
    this.cppos = this.macpselect.coordinatesCenter
    // console.log('cppos :', this.cppos)
    // this.isWithinPoly(this.upos, this.cppolygon)
    // function isWithinPoly(x: any, y:any) {
    //   console.log('3.isWithinPoly')
    //   // const isWithinPolygon = google.maps.geometry.poly.containsLocation(x, y);
    //   const isWithinPolygon = google.maps.geometry.poly.containsLocation(x,y)
    //     ? "true"
    //     : "false";
    //   return isWithinPolygon;
    // }
    // console.log('isWithinPolygon :' ,isWithinPoly(this.upos, this.cppolygon))
    // console.log('isWithinPolygon :', this.isInCp);
  }

  // get user location
  async getGeolocation1() {

    // console.log('2.getGeolocation')
    this.upos = { lat: 0, lng: 0 };
    this.presentToast('กำลังเรียกพิกัดของคุณ...', 'locate')
    // this.geosv.getCurrentCoordinate()
    await this.geosv.getCurrentCoordinate().then((res: any) => {
      console.log('geolocation res :', res)
      this.upos.lat = res.coords.latitude
      this.upos.lng = res.coords.longitude
    }).catch((e: any) => {
      console.log('error :', e)
    }).finally(() => {
      // console.log('getGeolocation finished')
      this.loadmap()
    })
  }

  async loadmap() {

    console.log('3.loadmap')

    await this.loader.load().then(() => {
      // 1. Create Map
      const map = new google.maps.Map(document.getElementById('map1') as HTMLElement, {
        center: this.upos,
        zoom: 12,
        mapTypeId: 'roadmap',
        mapTypeControl: true,
        mapTypeControlOptions: {
          style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
          mapTypeIds: ["roadmap", "terrain", "satellite", "hybrid"],
        },
      });

      // 2. Create InfoWindow.
      let label: string = "<ion-icon name='person-outline' color='danger'></ion-icon> <ion-label color='primary'> คุณอยู่ที่นี่ </ion-label>"
      let infoWindow = new google.maps.InfoWindow({
        content: label,
        position: this.upos,
      });
      infoWindow.open(map);

      // 3. Create polygon
      let cp = this.cppolygon
      const cpselect = new google.maps.Polygon({
        paths: cp,
        fillColor: "#FFFFFF",
        strokeColor: "#FF0000",
        strokeWeight: 3,
        fillOpacity: 0.35,
      });
      cpselect.setMap(map);

      // แปลงที่บ้าน
      // let cphome = [
      //   { lat: 15.282145312522779, lng: 103.00065768586899 },
      //   { lat: 15.282265176649526, lng: 103.00067680248044 },
      //   { lat: 15.28215222776273, lng: 103.00103523894536 },
      //   { lat: 15.282050804220699, lng: 103.00101134318103 },
      // ]

      // แปลงที่สน.
      // let cpoffice = [
      //   { lat: 15.232624314794599, lng: 103.0767562464381 },
      //   { lat: 15.232494916002734, lng: 103.07740534097553 },
      //   { lat: 15.231878976662559, lng: 103.07731414587523 },
      //   { lat: 15.23199284793693, lng: 103.07659531390813 },
      // ]

      // const cpH = new google.maps.Polygon({
      //   paths: cphome,
      //   fillColor: "#FFFFFF",
      //   strokeColor: "#FF0000",
      //   strokeWeight: 3,
      //   fillOpacity: 0.35,
      // });
      // cpH.setMap(map);

      // ทดสอบกับแปลงที่บ้าน
      // let x = this.upos
      // let y = new google.maps.Polyline({
      //   path: cphome
      // });
      // let z = this.qsetup.toleranceInMeters

      // this.isNearHome = this.getDistanctPolygon(x, y, z)
      // console.log('GPS กับ บ้าน ', this.getDistanctPolygon(x, y, z))

      // ตรวจสอบตำแหน่งอยู่ที่แปลงอ้อยหรือไม่
      let upos = this.upos;
      let cplot = new google.maps.Polygon({ paths: cp });
      let isWithinPolygon = google.maps.geometry.poly.containsLocation(upos, cplot)
      this.isInCp = isWithinPolygon
      console.log('isWithinPolygon :', isWithinPolygon);

      // ตรวจสอบว่า อยู่ในระยะที่กำหนด จากพิกัด ถึง จุดใดจุดหนึ่งของแปลง หรือไม่ ใช้ฟังก์ชั่น isLocationOnEdge
      console.log('isNearCp check');
      let location = this.upos
      let polyline = new google.maps.Polyline({
        path: this.cppolygon
      });
      let toleranceInMeters: number = this.qsetup.toleranceInMeters  //  0.001 = 100 เมตร
      console.log('toleranceInMeters :', toleranceInMeters)
      let isLocationNear = google.maps.geometry.poly.isLocationOnEdge(location, polyline, toleranceInMeters);
      this.isNearCp = isLocationNear

      // 4. create marker
      const marker = new google.maps.Marker({
        position: this.cppos,
        map,
        label: "แปลงอ้อย",
        // icon: 'assets/icon/truck48.png',
        // animation: google.maps.Animation.BOUNCE,
      });
      // marker.setMap(map)

      // add circle
      const circle = new google.maps.Circle({
        center: this.upos,
        map,
        strokeWeight: 2,
        strokeColor: '#FF992C',
        fillColor: '#F5F8B4',
        fillOpacity: 0.35,
        radius: 100,  // รัศมีเป็นเมตร
      })

    })

    this.upostocp_distance()
    this.ckCangetQ()

  }  // End loadmap

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
    console.log('ตำแหน่งคุณกับแปลงอ้อย =', d.toFixed(2) + ' ม.')
    // let x = d*1000
    if (d > this.limit) {
      this.canGetq = false
    } else {
      this.canGetq = true
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

  async ckCutStatusinDB() {
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

  // บันทึกสถานะการตัดจาก การเปิดแปลง
  async setCutstatus(cutstatus: string) {

    let cutstart = ""
    let cutstop = ""
    let cutstill = ""
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
        cutstill = this.setDate()
        cutstop = ""
        cutstill = ""
        dateupdate = this.setDate()
        break;
      default:
        break;
    }

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
      lc_mapfb = lc_mapfb.filter((el: any) => el.fmdata.cutstatus === 'Y')
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

    // อัพเดตสถานะการตัดไป firebase child fmdata
    // if (ckplotY == false) {
    //   await this.fbservice.setCutstatus(this.yearCr, this.itid, cutstatus, cutstart, cutstop, cutstill, dateupdate)
    //     .then((res: any) => {
    //       console.log('firebase res:', res)
    //     })
    // }
    //เช็คที่ firebase เพื่ออัพเดตสถานะการตัด เพื่อให้ปุ่มสถานะการตัด ทำงานที่อัพเดต
    // this.ckCutStatusinDB()

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

  // การใช้ใบคิวของแปลงอ้อย
  getCpQcard() {
    this.brdservice.getCpQcard(this.itid).subscribe((res: any) => {
      this.cpgetQcard = res.recordset[0]
      // console.log('cpgetQcard:', this.cpgetQcard)
    })
  }

  submit(f: any) {
    console.log('Form :', f)
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

  // แจ้งเตือนว่ามีแปลงที่สถานะตัด Y ในกลุ่ม เพื่อปิดแปลงนั้นก่อน จึงจะเปิดแปลงที่เลือกได้
  async showPlotDesc(data: any) {
    console.log('cpmap data: ', data)
    let dt = data[0]
    console.log('cpmap data[0]: ', dt)
    if (dt !== undefined) {
      const actionSheet = await this.actCtr.create({
        header: 'พบว่าแปลง ' + dt.bnm_profile.name + ' ' + dt.bnm_profile.surname,
        subHeader: `${dt.DetailPlant.CaneTypeName} พท. ${dt.DetailPlant.AreaPre} ไร่ อยู่ระหว่างตัด หากเปิดแปลงใหม่ จะทำการปิดแปลงนี้ โดยอัตโนมัติ`,
        cssClass: 'my-custom-class',
        buttons: [
          {
            text: 'ตกลง/ปิดแปลง',
            role: 'destructive',
            data: {
              action: 'add',
            },
            handler: () => {
              this.actionsheetOK();
            }
          },
          // {
          //   text: 'Share',
          //   data: {
          //     action: 'share',
          //   },
          // },
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

  actionsheetOK() {
    this.presentAlert('เลือก', 'ตกลง', 'ทดสอบ')
  }

}
