import { Component, OnInit } from '@angular/core';
import { GmapService } from '../service/gmap.service';
// import * as spdata from '../gps/sample.json';
import spdata from '../gps/sample.json';
// import * as spdata from '../gps/sample'
import { GlobalConstants } from 'src/global-constants';
import { Router } from '@angular/router';

@Component({
  selector: 'app-gps',
  templateUrl: './gps.page.html',
  styleUrls: ['./gps.page.scss'],
})
export class GpsPage implements OnInit {

  usertocp?: any;

  constructor(
    private gmap: GmapService,
    public router: Router
  ) {
    // setTimeout(() => {
    //   this.loadMap()
    // }, 1000);
    // this.upos = this.gmap.
  }


  ngOnInit() {
    // this.start()
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.loadMap()
    }, 1000);
  }

  async start() {
    await this.loadMap()
  }

  async loadMap() {
    await this.gmap.loader.load().then(() => {
      // add map
      const map = new google.maps.Map(document.getElementById('mapgps') as HTMLElement, {
        center: this.gmap.upos,
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

      // add InfoWindow.
      const infoWindow = new google.maps.InfoWindow({
        // content: label,
        // position: this.upos,
      });
      let content = "<ion-icon name='person-outline' color='danger'></ion-icon> <ion-label color='primary'> ตำแหน่งคุณ </ion-label>"
      infoWindow.setPosition(this.gmap.upos);
      infoWindow.setContent(content);
      infoWindow.open(map);
      map.setCenter(this.gmap.upos);

      const locationButton = document.createElement("button");
      locationButton.textContent = "ตำแหน่งคุณ";
      locationButton.classList.add("custom-map-control-button");
      map.controls[google.maps.ControlPosition.LEFT_BOTTOM].push(locationButton);
      locationButton.addEventListener("click", () => {
        // Try HTML5 geolocation.
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position: GeolocationPosition) => {
              const pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              };
              infoWindow.setPosition(this.gmap.upos);
              infoWindow.setContent(content);
              infoWindow.open(map);
              map.setCenter(this.gmap.upos);
            },
            () => {
              handleLocationError(true, infoWindow, map.getCenter()!);
            }
          );
        } else {
          // Browser doesn't support Geolocation
          handleLocationError(false, infoWindow, map.getCenter()!);
        }
      });

      function handleLocationError(
        browserHasGeolocation: boolean,
        infoWindow: google.maps.InfoWindow,
        pos: google.maps.LatLng
      ) {
        infoWindow.setPosition(pos);
        infoWindow.setContent(
          browserHasGeolocation
            ? "ผิดพลาด: ไม่สามารถระบุตำแหน่งบนอุปกรณ์นี้ได้"
            : "Error: Your browser doesn't support geolocation."
        );
        infoWindow.open(map);
      }

      //add circle
      const circle = new google.maps.Circle({
        center: this.gmap.upos,
        map,
        strokeWeight: 2,
        strokeColor: '#FF992C',
        fillColor: '#F5F8B4',
        fillOpacity: 0.35,
        radius: 100,  // รัศมีเป็นเมตร
      })

      // add cpgroup polygon
      for (let i = 0; i < spdata.length; i++) {

        // const cutStatus = spdata[i].cutstatus
        const fillColor = "#09FD0C";
        // if (cutStatus == 'Y') {
        //   fillColor = "#E5F708"
        // } else if (cutStatus == 'F') {
        //   fillColor = "#09FD0C"
        // } else {
        //   fillColor = "#7FB5FF"
        // }

        const triangleCoords = spdata[i].coordinates;
        let itid = spdata[i].key
        let cppos = spdata[i].coordinatesCenter
        const cpg = new google.maps.Polygon({
          paths: triangleCoords,
          strokeColor: '#FEFEFD',
          strokeWeight: 2,
          fillColor: fillColor,
          fillOpacity: 0.35,
          editable: false,
          // zIndex: 1,
          // tag: itid,
        })
        cpg.setMap(map)

        //Add the click listener g
        google.maps.event.addListener(cpg, 'click', () => {
          this.getDistance(this.gmap.upos,cppos)
        });

      }

      // add polygon
      // ktd home
      let x = [
        { lat: 15.282145312522779, lng: 103.00065768586899 },
        { lat: 15.282265176649526, lng: 103.00067680248044 },
        { lat: 15.28215222776273, lng: 103.00103523894536 },
        { lat: 15.282050804220699, lng: 103.00101134318103 },
      ]
      // itbrd
      let x1 = [
        { lat: 15.232624314794599, lng: 103.0767562464381 },
        { lat: 15.232494916002734, lng: 103.07740534097553 },
        { lat: 15.231878976662559, lng: 103.07731414587523 },
        { lat: 15.23199284793693, lng: 103.07659531390813 },
      ]
      const testcp = new google.maps.Polygon({
        paths: x1,
        fillColor: "#FFFFFF",
        strokeColor: "#FF0000",
        strokeWeight: 5,
        fillOpacity: 0.35,
      });
      testcp.setMap(map);

    })
  }

  // คำนวณระยะห่างระหว่าง พิกัด GPS และ แปลงอ้อย
  getDistance(mk1: any, mk2: any) {
    let R = 6371; // Radius of the Earth in kilometers
    let rlat1 = mk1.lat * (Math.PI / 180); // Convert degrees to radians
    let rlat2 = mk2.lat * (Math.PI / 180); // Convert degrees to radian
    let difflat = rlat2 - rlat1; // Radian difference (latitudes)
    let difflon = (mk2.lng - mk1.lng) * (Math.PI / 180); // Radian difference (longitudes)
    let d = 2 * R * Math.asin(Math.sqrt(Math.sin(difflat / 2) * Math.sin(difflat / 2) + Math.cos(rlat1) * Math.cos(rlat2) * Math.sin(difflon / 2) * Math.sin(difflon / 2)))
    // return d;
    this.usertocp = d.toFixed(2)
    // console.log('ตำแหน่งคุณกับแปลงอ้อย =', d.toFixed(2) + ' กม.')
  }

}
