import { Injectable, NgZone } from '@angular/core';
// import { Geolocation, Position } from '@capacitor/geolocation';
// import { Observable } from 'rxjs';
// import { Capacitor, Plugins } from "@capacitor/core";

// for 1 code
import { CallbackID, Capacitor } from '@capacitor/core';
import { Geolocation, Position } from '@capacitor/geolocation';

// for 2 code
// import { LocationAccuracy } from '@ionic-native/location-accuracy';
// import { Plugins } from "@capacitor/core";
// const { Geolocation} = Plugins;


@Injectable({
  providedIn: 'root'
})
export class GeolocationService {

  // coordinate: any;
  // watchCoordinate: any;
  watchId: any;

  constructor(
    private zone: NgZone,
  ) { }

  // +++++++++++++ 1 code from https://edupala.com/ionic-capacitor-geolocation-for-getting-location-data/
  // https://gist.github.com/enappd/2fb0ac1e76a2d292100ff45bba97406f#file-full-home-page-ts
  async requestPermissions() {
    const permResult = await Geolocation.requestPermissions();
    console.log('Perm request result: ', permResult);
    return permResult.location
  }

  async getCurrentCoordinate() {
    return await new Promise((res, rej) => {
      if (!Capacitor.isPluginAvailable('Geolocation')) {
        console.log('Plugin geolocation not available');
        return
      }
      Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }).then((data) => {
        res(data)
      }).catch(err => {
        rej(err)
        console.error(err);
      });
    })
  }

  watchPosition() {
    return new Promise((res, rej) => {
      try {
        this.watchId = Geolocation.watchPosition({
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 1,
        }, (position: any, err) => {
          console.log('Watch', position);
          this.zone.run(() => {
            res(position)
            // this.watchCoordinate = {
            //   latitude: position.coords.latitude,
            //   longitude: position.coords.longitude,
            // };
          });
        });
      } catch (e) {
        rej(e)
        console.error(e);
      }
    })

  }

  clearWatch() {
    if (this.watchId != null) {
      console.log('watchId to clear :', this.watchId)
      Geolocation.clearWatch({ id: this.watchId });
    }
  }
  // +++++++++ End 1 code

  // ++++++++++++++++ 2 code
  // https://enappd.com/blog/ionic-5-complete-guide-on-geolocation/141/

  // async askToTurnOnGPS(): Promise<boolean> {
  //   return await new Promise((resolve, reject) => {
  //     LocationAccuracy.canRequest().then((canRequest: boolean) => {
  //       if (canRequest) {
  //         // the accuracy option will be ignored by iOS
  //         LocationAccuracy.request(LocationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY).then(
  //           () => {
  //             resolve(true);
  //           },
  //           error => {
  //             resolve(false);
  //           }
  //         );
  //       }
  //       else { resolve(false); }
  //     });
  //   })
  // }

  // Check if application having GPS access permission
  // async checkGPSPermission(): Promise<boolean> {
  // return await new Promise((resolve, reject) => {
  //   if (Capacitor.isNative) {
  //     AndroidPermissions.checkPermission(AndroidPermissions.PERMISSION.ACCESS_FINE_LOCATION).then(
  //       (result: { hasPermission: any; }) => {
  //         if (result.hasPermission) {
  //           // If having permission show 'Turn On GPS' dialogue
  //           resolve(true);
  //         } else {
  //           // If not having permission ask for permission
  //           resolve(false);
  //         }
  //       },
  //       (err: any) => { alert(err); }
  //     );
  //   }
  //   else { resolve(true); }
  //   })
  // }

  // async requestGPSPermission(): Promise < string > {
  //     return await new Promise((resolve, reject) => {
  // LocationAccuracy.canRequest().then((canRequest: boolean) => {
  //   if (canRequest) {
  //     resolve('CAN_REQUEST');
  //   } else {
  //     // Show 'GPS Permission Request' dialogue
  //     AndroidPermissions.requestPermission(AndroidPermissions.PERMISSION.ACCESS_FINE_LOCATION)
  //       .then(
  //         (result: { hasPermission: any; }) => {
  //           if (result.hasPermission) {
  //             // call method to turn on GPS
  //             resolve('GOT_PERMISSION');
  //           } else {
  //             resolve('DENIED_PERMISSION');
  //           }
  //         },
  //         (error: string) => {
  //           // Show alert if user click on 'No Thanks'
  //           alert('requestPermission Error requesting location permissions ' + error);
  //         });
  //   }
  // });
  //   })
  // }
  // ++++++++++++++++ end 2 code

  // 1. get user location
  // async getUserLocation() {
  //   const coordinates: Position = await Geolocation.getCurrentPosition();
  //   console.log('Current position:', coordinates);
  //   return coordinates
  // }

  // async postGPSPermission(canUseGPS: boolean) {
  //   if (canUseGPS) { this.watchPosition(); }
  //   else {
  //     await this.presentToast('ต้องเปิดGPS ก่อนเพื่อความแม่นยำ')
  //   }
  // }

  // watchPosition(options: PositionOptions, callback: WatchPositionCallback) => Promise<CallbackID>
  // async watchPosition() {
  //   setTimeout(() => {
  //     this.getUserLocation().then(() => {
  //       this.watchId = Geolocation.watchPosition(
  //         {
  //           enableHighAccuracy: true,
  //           maximumAge: 0
  //         },
  //         (data) => {
  //           try {
  //             // do something with data
  //             console.log('data watchposition :', data)
  //             console.log('watchId :', this.watchId)
  //           } catch (e) {
  //             // do something with error
  //             console.log('Error :', e)
  //           }

  //         }
  //       );
  //     })
  //   }, 1000);

  // }

  // stopWatchPosition() {
  //   if (this.watchId != null) {
  //     console.log('watchId in stopWatch :', this.watchId)
  //     Geolocation.clearWatch({ id: this.watchId });
  //     console.log('watch position stop')
  //   }
  // }

  // getUserLocation1() {
  //   return new Promise((res, rej) => {
  //     const printCurrentPosition = async () => {
  //       const coordinates = await Geolocation.getCurrentPosition()
  //       console.log('Current position:', coordinates);
  //       res(coordinates)
  //     }
  //   }).catch((e) => {
  //     rej(e)
  //   }).finally(() => {
  //     console.log('getGeolocation finished')
  //   })
  // }

  // function rej(e: any) {
  //   throw new Error(e);
  // }

  // url สำหรับการขออนุญาตใช้งาน GPS
  // https://enappd.com/blog/ionic-5-complete-guide-on-geolocation/141/

}


