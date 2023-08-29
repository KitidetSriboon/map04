import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
// import { GlobalConstants } from 'src/global-constants';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class BrdsqlService {

  baseUrlSelect = "https://asia-southeast2-brr-farmluck.cloudfunctions.net/dbcps/select_s_f_w?"

  constructor(private http: HttpClient,) { }

  // ข้อมูลแปลงอ้อยในกลุ่ม
  getCpinGroup(year: string, groupcode: string): Observable<any[]> {
    const url = this.baseUrlSelect
      + "s=*"
      + "&f=CPS6263.dbo.v_cp_data&w=year=" + year + " and groupcode='" + groupcode
      + "' order by intlandno"
    return this.http.get<any[]>(url);
  }

  // ข้อมูลการตั้งค่า ระบบคิวอ้อย
  getQsetup(): Observable<any[]> {
    const url = this.baseUrlSelect
      + "s=*"
      + "&f=dbQBRD.dbo.setup"
      + "&w=1=1"
    return this.http.get<any[]>(url);
  }

}
