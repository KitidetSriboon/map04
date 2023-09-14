import { Injectable } from '@angular/core';
import firebase from 'firebase/app';
import 'firebase/database';

@Injectable({
  providedIn: 'root'
})
export class FirebasedbService {

  constructor() {
    const firebaseConfig = {
      apiKey: 'AIzaSyBZsYUysd48zNos0iLgzzdU9wBLLoytCN0',
      authDomain: 'brr-farmluck.firebaseapp.com',
      // databaseURL: 'https://brr-farmluck.firebaseio.com/',
      databaseURL: 'https://brd-farmluck.firebaseio.com/',
      projectId: 'brr-farmluck',
      storageBucket: 'brr-farmluck.appspot.com',
      messagingSenderId: '377337176311',
      appId: '1:377337176311:web:12f9331898ef0b92f6b3f2',
      measurementId: 'G-KT5XJF8TNH'
    };

    firebase.initializeApp(firebaseConfig);

  }

  ckfmdata() {
    // const database = firebase.database();
    // const childPath = 'inst1/tx/2324/areas/fmdata'; // Replace with the path to your child node
    // // Reference the child node
    // const childRef = database.ref(childPath);

    // return new Promise((res, rej) => { 
    //   // Check if the child node exists
    //   childRef.once('value')
    //     .then((snapshot: any) => {
    //       if (snapshot.exists()) {
    //         console.log('Child node exists.');
    //       } else {
    //         console.log('Child node does not exist.');
    //       }
    //     })
    //     .catch((error: any) => {
    //       console.error('Error checking child node existence:', error);
    //     });
    // }
  }
}
