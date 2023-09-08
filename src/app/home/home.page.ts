import { Component } from '@angular/core';
import { Loader, LoaderOptions } from '@googlemaps/js-api-loader';
import { FirebaseService } from '../service/firebase.service';
import { BrdsqlService } from '../service/brdsql.service';
import {
  AlertController,
  LoadingController,
  ActionSheetController,
  ToastController,
  ModalController,
  MenuController
} from '@ionic/angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavigationExtras, Router, RouterLinkWithHref } from '@angular/router';
import { BehaviorSubject, Subscription } from 'rxjs'
import { GlobalConstants } from 'src/global-constants';
import { QbookPage } from '../qbook/qbook.page';
import { GpsPage } from '../gps/gps.page';
// import { UpdatePage } from '../update/update.page';
// import { Geolocation ,Position } from '@capacitor/geolocation';
import { GeolocationService } from '../service/geolocation.service';
import { CallbackID, Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';

interface points {
  lat: number;
  lng: number;
}

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  // upos = { lat: 0, lng: 0 }; 15.228581111646495, 103.07182686761979
  upos = { lat: 15.228581111646495, lng: 103.07182686761979 };
  cppos = { lat: 0, lng: 0 };  // Polyline
  mapGroup?: any = [];
  cpdatagroup?: any = [];
  subcpdatagroup!: Subscription;
  cpselect?: any = [];
  yearCr = ""
  yearData?:any = []
  groupcode?: string = ""
  frm_search: FormGroup;
  loader = new Loader({
    apiKey: GlobalConstants.gmap.mapkey,
    version: GlobalConstants.gmap.version,
    libraries: ["places"],
  });
  choice = 'Credit Card';
  itid?: string = ""
  isincaneplot?: boolean;
  testisincaneplot?: boolean;
  cptogps?: number = 0;
  uGeolocation?: any
  lat: any;
  lng: any;
  watchId: any;
  coordinate: any;
  watchCoordinate: any;
  gpsstatus?: boolean

  constructor(
    private firebase: FirebaseService,
    private brdsql: BrdsqlService,
    private geosv: GeolocationService,
    private altCtr: AlertController,
    private ldCtr: LoadingController,
    private modalCtrl: ModalController,
    private menuCtrl: MenuController,
    private toastCtrl: ToastController,
    private actCtr: ActionSheetController,
    private fb: FormBuilder,
    private router: Router,
  ) {

    let gc = localStorage.getItem('groupcode')
    if (gc) {
      this.groupcode = gc
    }

    this.frm_search = fb.group({
      groupcode: this.groupcode,
    })
  }

  ngOnInit() {
    this.getYear()
    this.loadmap()
  }

  ngAfterViewInit() {

  }

  getYear() {
    this.brdsql.getYear().subscribe((res:any) => {
      this.yearData = res.recordset[0]
      this.yearCr = this.yearData.yearCr
      // console.log('year res:' ,this.yearData)
    })
  }

  // แผนที่แปลงอ้อยจาก firebase ตามกลุ่มตัด
  async getMapByGroup(f: any) {

    console.log('f: ',f)
    let gc = ''

    if(f.groupcode == 'x') {
      let ckgroup:any = localStorage.getItem('groupcode')
      this.groupcode = ckgroup
      localStorage.setItem('groupcode', ckgroup)
      gc = ckgroup
    } else {
      this.groupcode = f.groupcode
      localStorage.setItem('groupcode', f.groupcode)
      gc = f.groupcode
    }

    this.mapGroup = [];
    this.cpdatagroup = []
    localStorage.removeItem('mapcpgroup')
    localStorage.removeItem('cpgroupsql')

    this.presentLoading('กำลังโหลดแผนที่แปลงอ้อยในกลุ่ม...')
    await this.firebase.getMapByGroup(this.yearCr, gc).then((result: any) => {
      this.mapGroup = result;
      if (result.length == 0) {
        console.log('!!ไม่พบข้อมูลแปลงอ้อยในกลุ่มจาก firebase')
        this.presentAlert('แจ้งเตือน', '!!ไม่พบข้อมูลแผนที่แปลงอ้อยกลุ่ม..' + gc, 'กรุณาตรวจสอบรหัสกลุ่มตัดอีกครั้ง')
      } else {
        let cp = JSON.stringify(this.mapGroup)
        localStorage.setItem('mapcpgroup', cp)
        // console.log('firebase res: ', result)
        this.presentToast('พบข้อมูลแปลงอ้อย ' + result.length + ' แปลง', 'leaf')
      }
    });

    await this.brdsql.getCpinGroup(this.yearCr, gc).subscribe((data: any) => {
      // console.log('cpsql res: ',data)
      if(data.recordset.length == 0) {
        this.cpdatagroup = []
        this.presentAlert('แจ้งเตือน', '!!ไม่พบข้อมูลแปลงอ้อยกลุ่ม..' + gc, 'กรุณาตรวจสอบรหัสกลุ่มตัดอีกครั้ง')
      } else {
        this.cpdatagroup = data.recordset
        // console.log('res cpgroupsql :', this.cpdatagroup);
        let x = JSON.stringify(this.cpdatagroup)
        localStorage.setItem('cpgroupsql', x)
      }

    });

    this.closeLoading()
    setTimeout(() => {
      this.loadmapGroup()
    }, 500);
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
      // console.log('getGeolocation finished')
    })
  }

  // check gps permission
  async requestPermissions() {
    this.geosv.requestPermissions().then((res: any) => {
      this.gpsstatus = res
      console.log('res requestpermission :', res)
    })
  }

  async loadmap() {

    setTimeout(() => {
      this.getGeolocation()
    }, 1000);

    // console.log('user location :', this.upos)

    await this.loader.load().then(() => {
      // 1. Create Map
      const map = new google.maps.Map(document.getElementById('map') as HTMLElement, {
        center: this.upos,
        zoom: 16,
        panControl: true,

        // rotateControl: true,
        // rotateControlOptions: {
        // },
        mapTypeId: 'roadmap',
        mapTypeControl: true,
        mapTypeControlOptions: {
          style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
          mapTypeIds: ["roadmap", "terrain", "satellite", "hybrid"],
        },
      });

      // +++++++++++++++++++++++ ปุ่มตำแหน่งคุณ บนแผนที่
      let locationButton = document.createElement('button');
      locationButton.style.cursor = 'pointer';
      locationButton.style.backgroundImage = "assets/icon/location.png";
      locationButton.style.height = '28px';
      locationButton.style.width = '25px';
      // locationButton.style.top = '11px';
      // locationButton.style.left = '120px';
      locationButton.title = 'แสดงตำแหน่งของคุณ';

      // const locationButton = document.createElement("button");
      // // locationButton.textContent = "ตำแหน่งคุณ";
      // locationButton.
      // locationButton.classList.add("custom-map-control-button");
      map.controls[google.maps.ControlPosition.LEFT_BOTTOM].push(locationButton);
      locationButton.addEventListener("click", () => {
        this.loadmap()
      })

      // 2. Create marker
      let label: string = "<ion-icon name='person-outline' color='danger'></ion-icon> <ion-label color='primary'> คุณอยู่ที่นี่ </ion-label>"
      const marker = new google.maps.Marker({
        position: this.upos,
        map,
        label: "",
        icon: 'assets/icon/truck48.png',
        animation: google.maps.Animation.BOUNCE,
      });

      // 3. Create circle
      const circle = new google.maps.Circle({
        center: this.upos,
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
        position: this.upos,
      });
      infoWindow.open(map);

      // 5. Create polygon ทดสอบพิกัดอยู่ในแปลงอ้อย
      // let x1 = [
      //   { lat: 15.232624314794599, lng: 103.0767562464381 },
      //   { lat: 15.232494916002734, lng: 103.07740534097553 },
      //   { lat: 15.231878976662559, lng: 103.07731414587523 },
      //   { lat: 15.23199284793693, lng: 103.07659531390813 },
      // ]
      // let x = [
      //   { lat: 15.282145312522779, lng: 103.00065768586899 },
      //   { lat: 15.282265176649526, lng: 103.00067680248044 },
      //   { lat: 15.28215222776273, lng: 103.00103523894536 },
      //   { lat: 15.282050804220699, lng: 103.00101134318103 },
      // ]
      // const testcp = new google.maps.Polygon({
      //   paths: x,
      //   fillColor: "#FFFFFF",
      //   strokeColor: "#FF0000",
      //   strokeWeight: 5,
      //   fillOpacity: 0.35,
      // });
      // testcp.setMap(map);

      // 6. Configure the click listener.
      map.addListener("click", (mapsMouseEvent: any) => {
        // Close the current InfoWindow.
        infoWindow.close();

        // Create a new InfoWindow.
        infoWindow = new google.maps.InfoWindow({
          position: mapsMouseEvent.latLng,
        });
        let x = JSON.stringify(mapsMouseEvent.latLng.toJSON(), null, 2)
        let y = JSON.parse(x)
        console.log('stringify location :', x)
        console.log('parse location :', y)
        infoWindow.setContent(
          JSON.stringify(mapsMouseEvent.latLng.toJSON(), null, 2)
        );
        infoWindow.open(map);
      });

    })

  }  // End loadmap

  // ตรวจสอบแปลงกำลังตัดของกลุ่ม
  async ckCpcutnow() {

  }

  // โหลดแผนที่แปลงตามกลุ่ม
  async loadmapGroup() {

    setTimeout(() => {
      this.getGeolocation();
    }, 1000);

    let mapdata = this.mapGroup
    let ck_cpcutnow = mapdata.fmdata
    if(ck_cpcutnow) {
      let mapcutnow:any = mapdata.filter((o:any) => o.fmdata.cutstatus === 'Y')
      console.log('cp cuted now:' ,mapcutnow)
    }

    await this.loader.load().then(() => {
      // main map
      const map = new google.maps.Map(document.getElementById('map') as HTMLElement, {
        center: this.upos,
        zoom: 16,
        rotateControl: true,
        rotateControlOptions: {
        },
        mapTypeId: 'roadmap',
        mapTypeControl: true,
        mapTypeControlOptions: {
          style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
          mapTypeIds: ["roadmap", "terrain", "satellite", "hybrid"],
        },
      });

      // +++++++++++++++++++++++ ปุ่มตำแหน่งคุณ บนแผนที่
      const locationButton = document.createElement("button");
      // locationButton.textContent = "ตำแหน่งคุณ";
      locationButton.classList.add("custom-map-control-button");
      map.controls[google.maps.ControlPosition.LEFT_BOTTOM].push(locationButton);
      locationButton.addEventListener("click", () => {
        this.loadmapGroup()
      })

      // add marker
      let label: string = "<ion-icon name='person-outline' color='danger'></ion-icon> <ion-label color='primary'> คุณอยู่ที่นี่ </ion-label>"
      // let label: string = "คุณอยู่ตรงนี้"
      const marker = new google.maps.Marker({
        position: this.upos,
        map,
        label: "",
        icon: 'assets/icon/truck48.png',
        animation: google.maps.Animation.BOUNCE,
      });

      // add InfoWindow.
      let infoWindow = new google.maps.InfoWindow({
        content: label,
        position: this.upos,
      });
      infoWindow.open(map);

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

      // Add polygon
      for (let i = 0; i < mapdata.length; i++) {
        let ckcut = mapdata[i].fmdata
        let fillColor = "#7FB5FF";
        if(ckcut) {
          const cutStatus = mapdata[i].fmdata.cutstatus
          if (cutStatus == 'Y') {
            fillColor = "#E5F708"
          } else if (cutStatus == 'F') {
            fillColor = "#09FD0C"
          } else {
            fillColor = "#7FB5FF"
          }
        }

        const triangleCoords = mapdata[i].coordinates;
        let itid = mapdata[i].key
        let cppos = mapdata[i].coordinatesCenter
        const caneplot = new google.maps.Polygon({
          paths: triangleCoords,
          strokeColor: '#FEFEFD',
          strokeWeight: 2,
          fillColor: fillColor,
          fillOpacity: 0.35,
          editable: false,
          zIndex: itid,
          // tag: itid,
        })
        // Handle polygon click
        caneplot.addListener('click', () => {
          this.openQbookPage(itid)
        })
        caneplot.setMap(map);

      }
    })

  }  // End loadmapGroup  

  getCpSelect(itid: any) {
    console.log('itid in homepage :', itid)
    this.openQbookPage(itid);

  //   let data: any;
  //   let mapFbdata: any;  // map from firebase
  //   data = localStorage.getItem('cpgroupsql')
  //   data = JSON.parse(data)
  //   if (data) {
  //     this.cpselect = data.filter((x: { itid: any; }) => x.itid == itid)
  //     this.cpselect = this.cpselect[0];
  //     this.itid = itid
  //     // console.log('cpselect :' ,this.cpselect)
  //     // this.presentModal(this.cpselect)
  //     this.openQbookPage(itid);
  //   }
  }

  // เปิดหน้า จองคิวแปลงอ้อย แบบ router
  async openQbookPage(itid: string) {
    let navigationExtras: NavigationExtras = {
      queryParams: {
        special: itid
      }
    };
    this.router.navigate(['/qbook', itid], navigationExtras);
  }

  // ตรวจสอบพิกัดอยู่ในแปลงอ้อย
  ckInPlot() {
    // let coordinate = new google.maps.LatLng(40, -90);                                                                                                                                                                                                       
    // let polygon = new google.maps.Polygon([], "#000000", 1, 1, "#336699", 0.3);
    // let isWithinPolygon = polygon.containsLatLng(coordinate);
  }


  toFirebase() {
    let itid = this.itid
    let navigationExtras: NavigationExtras = {
      queryParams: {
        special: itid
      }
    };
    this.router.navigate(['/update', itid], navigationExtras);
  }

  // async askToTurnOnGPS() {
  //   await this.geosv.askToTurnOnGPS().then((res:any) => {
  //     console.log('asktoturnon GPS :' ,res)
  //     this.gpsstatus = res
  //   })
  // }

  async presentModal(cpselect: any) {
    // const mySubject = new BehaviorSubject(cpselect);
    console.log('cpSelect in presentModal: ', cpselect)
    const modal = await this.modalCtrl.create({
      component: QbookPage,
      breakpoints: [0, 0.3, 0.5, 0.8],
      initialBreakpoint: 1,
      handle: false,
      componentProps: {
        data: cpselect
      }
    });
    await modal.present();
  }

  // ข้อมูลแปลงที่เลือก
  async showPlotDesc(data: any) {
    const actionSheet = await this.actCtr.create({
      header: data.fmname,
      subHeader: `${data.CaneTypeName} พท. ${data.landvalue} ไร่ ${data.seedname} อายุ ${data.caneage} วัน`,
      cssClass: 'my-custom-class',
      buttons: [
        {
          text: 'จองคิว',
          role: 'destructive',
          data: {
            action: 'add',
          },
        },
        // {
        //   text: 'Share',
        //   data: {
        //     action: 'share',
        //   },
        // },
        {
          text: 'ปิด',
          role: 'cancel',
          data: {
            action: 'cancel',
          },
        },
      ],
    });
    actionSheet.present();
  }

  async presentAlert(h: string, s: string, m: string) {
    const alert = await this.altCtr.create({
      header: h,
      subHeader: s,
      message: m,
      buttons: ['OK'],
      cssClass: 'custom-alert',
    });
    await alert.present();
  }

  async closeLoading() {
    await this.ldCtr.dismiss();
    // console.log('Loading dismissed!');
  }

  async presentLoading(msg: string) {
    const loading = await this.ldCtr.create({
      cssClass: 'load',
      message: msg,
    });
    await loading.present();
    // const { role, data } = await loading.onDidDismiss();
  }

  async presentToast(msg: string, icon: string) {
    const toast = await this.toastCtrl.create({
      message: msg,
      duration: 2000,
      icon: icon,
    });
    toast.present();
  }

  openUserMenu() {
    this.menuCtrl.open('user');
  }

  // เชคว่าตำแหน่งอยู่ที่แปลงอ้อยหรือไม่
  isWithinPoly(ugps: any, cp: any) {
    console.log(`ugps :${ugps} cp :${cp}`)
    var isWithinPolygon = google.maps.geometry.poly.containsLocation(ugps, cp);
    console.log('isWithinPolygon :', isWithinPolygon);
    return isWithinPolygon;
  }

  // คำนวณพื้นที่
  newAreaNumber: number = 0;
  calArea(area: number) {
    this.newAreaNumber = area;
    area = area * 1600;
    let rai = Math.floor(area / 1600);
    area = area - rai * 1600;
    let ngan = Math.floor(area / 400);
    area = area - ngan * 400;
    return rai + " ไร่ " + ngan + " งาน " + area.toFixed(2) + " ตารางวา";
  }

  newArea?: string;
  polygon: any;
  newCalArea() {
    let area = google.maps.geometry.spherical.computeArea(
      this.polygon.getPath()
    );
    this.newAreaNumber = area / 1600;
    let rai = Math.floor(area / 1600);
    area = area - rai * 1600;
    let ngan = Math.floor(area / 400);
    area = area - ngan * 400;
    this.newArea =
      rai + " ไร่ " + ngan + " งาน " + area.toFixed(2) + " ตารางวา";
  }

  ngOnDestroy() {
    // คืน Memory
    this.subcpdatagroup.unsubscribe()
  }

  routerSetting() {
    // this.router.navigateByUrl('/setting');
  }

  toFaqpage() {
    this.router.navigateByUrl('/faq');
  }

  // +++++++++++++++++++++++ ปุ่มตำแหน่งคุณ บนแผนที่
  // const locationButton = document.createElement("button");
  // locationButton.textContent = "ตำแหน่งคุณ";
  // locationButton.classList.add("custom-map-control-button");
  // map.controls[google.maps.ControlPosition.LEFT_BOTTOM].push(locationButton);
  // locationButton.addEventListener("click", () => {
  //   // Try HTML5 geolocation.
  //   if (navigator.geolocation) {
  //     navigator.geolocation.getCurrentPosition(
  //       (position: GeolocationPosition) => {
  //         const pos = {
  //           lat: position.coords.latitude,
  //           lng: position.coords.longitude,
  //         };

  //         let content = "<ion-icon name='person-outline' color='danger'></ion-icon> <ion-label color='primary'> ตำแหน่งคุณ </ion-label>"
  //         infoWindow.setPosition(pos);
  //         infoWindow.setContent(content);
  //         infoWindow.open(map);
  //         map.setCenter(pos);
  //       },
  //       () => {
  //         handleLocationError(true, infoWindow, map.getCenter()!);
  //       }
  //     );
  //   } else {
  //     // Browser doesn't support Geolocation
  //     handleLocationError(false, infoWindow, map.getCenter()!);
  //   }
  // });

  // function handleLocationError(
  //   browserHasGeolocation: boolean,
  //   infoWindow: google.maps.InfoWindow,
  //   pos: google.maps.LatLng
  // ) {
  //   infoWindow.setPosition(pos);
  //   infoWindow.setContent(
  //     browserHasGeolocation
  //       ? "ผิดพลาด: ไม่สามารถระบุตำแหน่งบนอุปกรณ์นี้ได้"
  //       : "Error: Your browser doesn't support geolocation."
  //   );
  //   infoWindow.open(map);
  // }


  // +++++++++++++ เชคว่าตำแหน่งอยู่ที่แปลงอ้อยหรือไม่ 
  // setTimeout(() => {
  //   this.testisincaneplot = isWithinPoly(this.upos)
  // }, 1000);

  // function isWithinPoly(event: any) {
  //   let coordinate = event;
  //   let polygon = testcp;
  //   let isWithinPolygon = google.maps.geometry.poly.containsLocation(coordinate, polygon);
  //   return isWithinPolygon;
  // }

  // +++++++++++++++++++ โค้ดยังไม่ได้ใช้
  // let userpos = this.upos
  // caneplot.addListener("click", () => {

  // ตรวจสอบตำแหน่งอยู่ที่แปลงอ้อย
  // this.isincaneplot = isWithinPoly(userpos)
  // ตรวจสอบระยะห่างของตำแหน่ง และ แปลงอ้อย
  // this.cptogps = haversine_distance(userpos, cppos);
  // ข้อมูลแปลงที่เลือก
  // this.cpselect(itid)

  // Add Polyline
  // let uposttocp = [
  //   this.upos,
  //   this.upos,
  // ];
  // let flightPath = new google.maps.Polyline({
  //   path: uposttocp,
  //   geodesic: true,
  //   strokeColor: "#FF0000",
  //   strokeOpacity: 1.0,
  //   strokeWeight: 2,
  // });

  // flightPath.setMap(null);

  // clear old polyline
  // flightPath.setMap(null);
  //create new polyline
  // flightPath = new google.maps.Polyline({
  //   path: [this.upos, cppos],
  //   geodesic: true,
  //   strokeColor: "#FF0000",
  //   strokeOpacity: 1.0,
  //   strokeWeight: 2,
  // });
  // flightPath.setMap(map);
  // })

  // dbclick บนแผนที่เคลียร์เส้น
  // map.addListener('dblclick', function () {
  //   flightPath.setMap(null);
  // });

  // เชคว่าตำแหน่งอยู่ที่แปลงอ้อยหรือไม่
  // function isWithinPoly(event: any) {
  //   var isWithinPolygon = google.maps.geometry.poly.containsLocation(event, caneplot);
  //   console.log('isWithinPolygon :', isWithinPolygon);
  //   return isWithinPolygon;
  // }

  // Add marker on each mapplot
  // const marker = new google.maps.Marker({
  //   position: mapdata[i].coordinatesCenter,
  //   map,
  //   label: mapdata[i].key,
  // })

  // const btn_removePolyline = document.createElement("button");
  // btn_removePolyline.textContent = "ลบเส้น";
  // btn_removePolyline.classList.add("custom-map-control-button");
  // map.controls[google.maps.ControlPosition.LEFT_BOTTOM].push(btn_removePolyline);
  // locationButton.addEventListener("click", () => {
  //   // flightPath.setMap(null);
  // });

  // Configure the click listener.
  // map.addListener("click", (mapsMouseEvent: any) => {
  // Close the current InfoWindow.
  // infoWindow.close();
  // Create a new InfoWindow.
  // infoWindow = new google.maps.InfoWindow({
  //   position: mapsMouseEvent.latLng,
  // });
  // let x = JSON.stringify(mapsMouseEvent.latLng.toJSON(), null, 2)
  // let y = JSON.parse(x)
  // isWithinPoly(x)
  // console.log('stringify location :', x)
  // console.log('parse location :', y)
  // this.cppos.lat = y.lat
  // this.cppos.lng = y.lng
  // console.log('cpos on map click', this.cppos)
  // infoWindow.setContent(x);
  // infoWindow.open(map);

  // เชคว่าตำแหน่งอยู่ที่แปลงอ้อยหรือไม่
  // function isWithinPoly(event: any) {
  //   console.log('map click position :', event)
  //   var isWithinPolygon = google.maps.geometry.poly.containsLocation(event, caneplot);
  //   console.log('isWithinPolygon :', isWithinPolygon);
  // }
  // });  

  // getGeolocation1() {
  //   // Try HTML5 geolocation.
  //   if (navigator.geolocation) {
  //     navigator.geolocation.getCurrentPosition(
  //       (position: GeolocationPosition) => {
  //         console.log('Location1 :', position.coords)
  //         this.upos.lat = position.coords.latitude
  //         this.upos.lng = position.coords.longitude
  //         this.cppos.lat = position.coords.latitude
  //         this.cppos.lng = position.coords.longitude
  //       },
  //       () => {
  //         console.log('Error: The Geolocation service failed ')
  //         // handleLocationError(true, infoWindow, map.getCenter()!);
  //       }
  //     );
  //   } else {
  //     // Browser doesn't support Geolocation
  //     console.log('Error: Your browser does not support geolocation')
  //     // handleLocationError(false, infoWindow, this.map.getCenter()!);
  //   }
  // }




}
