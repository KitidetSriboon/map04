import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { AngularFireDatabase } from '@angular/fire/compat/database';
// import { AngularFireStorage } from '@angular/fire/compat/storage';
import firebase from 'firebase/app';
import 'firebase/database';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  constructor(
    private http: HttpClient,
    private firebase: AngularFireDatabase,
    // private fbstorage: AngularFireStorage,
  ) { }

  // แผนที่แปลงอ้อยตามกลุ่มตัด
  getMapByGroup(year: string, groupcode: string) {
    return new Promise((res, rej) => {
      this.firebase
        .list('inst1/tx/' + year + '/areas')
        .query.orderByChild('groupCode')
        .equalTo(groupcode)
        .once('value')
        .then((snapshots) => {
          const maps: any[] = [];
          snapshots.forEach((snapshots => {
            const rec = {
              key: snapshots.key,
              ...snapshots.val()
            };
            // filter หมายเลขแปลงต้องไม่ว่าง (landno) และ ไม่เอาแปลงที่เป็น OT (CaneTypeId) และ ต้องได้รับอนุมัติแล้ว (approveSts)
            if (rec.landno !== '' && rec.DetailPlant.CaneTypeId !== 'OT' && rec.approveSts === 1) {
              maps.push(rec);
            }
          }));
          res(maps);
        })
        .catch((e) => {
          rej(e);
        });
    });
  }

  // ข้อมูลแปลงจาก firebase by itit work but no key
  getplantbyItid(year: string, itid: string) {
    return new Promise((res, rej) => {
      this.firebase.object("inst1/tx/" + year + "/areas/" + itid)
        .valueChanges()
        .subscribe((res) => {
          console.log('fb res:', res)
        })
    })
  }

  // ข้อมูลแปลงตาม itid on firebase work with key
  getMapByitid(year: string, itid: string) {
    return new Promise((res, rej) => {
      this.firebase
        .list('inst1/tx/' + year + '/areas/')
        .query.orderByKey()
        .equalTo(itid)
        .once('value')
        .then((snapshots) => {
          let mapdt;
          snapshots.forEach((snapshot) => {
            mapdt = {
              key: snapshot.key,
              ...snapshot.val(),
            };
          });
          res(mapdt);
        })
        .catch((e) => {
          rej(e);
        });
    });
  }

  // private handleError<T>(operation = 'operation', result?: T) {
  //   return (error: any): Observable<T> => {
  //     console.error(error);
  //     console.log(`${operation} failed: ${error.message}`);
  //     return of(result as T);
  //   };
  // }

  // อัพเดตกลุ่มตัด
  async updateGroupcode(year: string, key: string, data: string) {
    const local = this.firebase.list('inst1/tx/' + year + '/areas/');
    local.update(key, { groupCode: data });
  }

  // อัพเดต สถานะการตัด วันเริ่มตัด
  async setCutstatus(year: string, key: any, cutstatus: string, cutstart: string, cutstop: string, cutstill: string, dateupdate: string) {

    console.log('value to firebase :', year + key + cutstatus + cutstart + cutstop + cutstill)

    return new Promise((res, rej) => {
      const local = this.firebase.list('inst1/tx/' + year + '/areas/' + key + '/');
      local.update('fmdata', { cutstatus: cutstatus, cutstart: cutstart, cutstop: cutstop, cutstill: cutstill, dateupdate: dateupdate });
      res(local)
    }).catch((e) => { console.log('firebase error:', e) })
  }

  // เปิดแปลง
  async saveCutY(year: string, key: any, cutstart: string, dateupdate: string) {
    return new Promise((res, rej) => {
      const local = this.firebase.list('inst1/tx/' + year + '/areas/' + key + '/');
      local.update('fmdata', { cutstatus: 'Y', cutstart: cutstart, dateupdate: dateupdate });
      res(local)
    }).catch((e) => { console.log('firebase error:', e) })
  }

  // หยุดตัดชั่วคราว
  async saveCutStill(year: string, key: any, cutstill: string, dateupdate: string) {
    return new Promise((res, rej) => {
      const local = this.firebase.list('inst1/tx/' + year + '/areas/' + key + '/');
      local.update('fmdata', { cutstatus: 'S', cutstill: cutstill, dateupdate: dateupdate });
      res(local)
    }).catch((e) => { console.log('firebase error:', e) })
  }

  // ปิดแปลง
  async saveCuted(year: string, key: any, cutstop: string, dateupdate: string) {
    return new Promise((res, rej) => {
      const local = this.firebase.list('inst1/tx/' + year + '/areas/' + key + '/');
      local.update('fmdata', { cutstatus: 'F', cutstop: cutstop, dateupdate: dateupdate });
      res(local)
    }).catch((e) => { console.log('firebase error:', e) })
  }

  // สร้างชายใหม่
  async setCutstatus1(year: string, key: any, cutstatus: string, cutstart: string) {
    return new Promise((res, rej) => {
      const local = this.firebase.list('inst1/tx/' + year + '/areas/' + key + '/');
      local.update('cutevent', { cutstatus: cutstatus, cutstart: cutstart });
      res(local)
    }).catch((e) => { console.log('firebase error:', e) })

  }

  // ยกเลิกวันตัดเสร็จ
  cancleTest(year: string, key: any) {
    return new Promise((res, rej) => {
      const local = this.firebase.list('inst1/tx/' + year + '/areas/' + key);
      local.remove("fmdata");
      res(local)
    }).catch((e) => { console.log('fb error: ', e) })
  }

  // แผนที่แปลงอ้อยตามกลุ่มตัด
  ckFmdata() {
    return new Promise((res, rej) => {
      this.firebase
        .list('inst1/tx/2324/areas/')
        .query
        .orderByChild("fmdata")
        // .equalTo('01.1')
        // .equalTo("fmdata")
        .once('value')
        .then((snapshots) => {
          const maps: any[] = [];
          snapshots.forEach((snapshots => {
            const rec = {
              key: snapshots.key,
              ...snapshots.val()
            };
            // filter หมายเลขแปลงต้องไม่ว่าง (landno) และ ไม่เอาแปลงที่เป็น OT (CaneTypeId) และ ต้องได้รับอนุมัติแล้ว (approveSts)
            if (rec.landno !== '' && rec.DetailPlant.CaneTypeId !== 'OT' && rec.approveSts === 1) {
              maps.push(rec);
            }
          }));
          res(maps);
        })
        .catch((e) => {
          rej(e);
        });
    });
  }
  // ตรวจสอบแปลงที่มีการคีย์ สถานะการตัดจากชาวไร่
  async ckFmdatax(year: string) {

    // const childPath = 'inst1/tx/2324/areas/'; // Replace with the path to your child node
    // // Reference the child node
    // const childRef = database.ref(childPath);
    // // Check if the child node exists
    // childRef.once('value')
    //   .then((snapshot) => {
    //     if (snapshot.exists()) {
    //       console.log('Child node exists.');
    //     } else {
    //       console.log('Child node does not exist.');
    //     }
    //   })
    //   .catch((error) => {
    //     console.error('Error checking child node existence:', error);
    //   });

  }

}

function getDatabase() {
  throw new Error('Function not implemented.');
}

