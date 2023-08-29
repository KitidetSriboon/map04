import { Injectable } from '@angular/core';
import { Loader, LoaderOptions } from '@googlemaps/js-api-loader';
import { GlobalConstants } from 'src/global-constants';

@Injectable({
  providedIn: 'root'
})
export class GmapService {

  loader = new Loader({
    apiKey: GlobalConstants.gmap.mapkey,
    version: GlobalConstants.gmap.version,
    libraries: ["places"],
  })
  // main location BRR 15.228585889567173, 103.07183475522888
  upos = { lat: 0, lng: 0 };  // user location
  cppos = { lat: 0, lng: 0 };  // caneplot location
  map?: any

  constructor() {
    this.getGeolocation()
   }

  getGeolocation() {

    // Try HTML5 geolocation.
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position: GeolocationPosition) => {
          console.log('user Location :', position.coords)
          this.upos.lat = position.coords.latitude
          this.upos.lng = position.coords.longitude
          this.cppos.lat = position.coords.latitude
          this.cppos.lng = position.coords.longitude
        },
        () => {
          console.log('Error: The Geolocation service failed ')
          // handleLocationError(true, infoWindow, map.getCenter()!);
          // get BRR location
          this.upos.lat = 15.228585889567173
          this.upos.lng = 103.07183475522888
        }
      );
    } else {
      // Browser doesn't support Geolocation
      console.log('Error: Your browser does not support geolocation')
      // handleLocationError(false, infoWindow, this.map.getCenter()!);
    }

    setTimeout(() => {
      // console.log('create map in gmap service')
      // this.map = new google.maps.Map(this.map, {
      //   center: this.upos,
      //   zoom: 16,
      //   rotateControl: true,
      //   rotateControlOptions: {
      //   },
      //   mapTypeId: 'roadmap',
      //   mapTypeControl: true,
      //   mapTypeControlOptions: {
      //     style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
      //     mapTypeIds: ["roadmap", "terrain", "satellite", "hybrid"],
      //   },
      // });
    }, 1000);

  }
  

}
