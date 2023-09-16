import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
// import { GlobalConstants } from 'src/global-constants';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class BrdsqlService {

  baseUrlSelect = "https://asia-southeast2-brr-farmluck.cloudfunctions.net/dbcps/select_s_f_w?"
  baseUrlUpdate = "https://asia-southeast2-brr-farmluck.cloudfunctions.net/dbcps/update_t_s_w?"
  baseUrlInsert = "https://asia-southeast2-brr-farmluck.cloudfunctions.net/dbcps/insert_t_c_v?"

  constructor(private http: HttpClient,) { }

  // ข้ออมูลหัวหน้ากลุ่มตัด
  getHeadgroupdata(groupcode: any): Observable<any[]> {
    const url = this.baseUrlSelect
      + "s=*&f=CPS6263.dbo.vw_headGroupCutting&w=groupcode='" + groupcode + "'";
    // console.log('url addLogin:', url)
    return this.http.get<any[]>(url);
  }

  // ค้นชื่อหัวหน้ากลุ่ม
  searchHeadgroup(fmname: string) {
    const url = this.baseUrlSelect
      + "s=*&f=CPS6263.dbo.[fnc_searchHeadgroupName]('" + fmname + "')&"
      + "w=1=1 order by fmname"
    // console.log('url', url)
    return this.http.get<any[]>(url);
  }

  // ข้อมูลแปลงอ้อยในกลุ่ม
  getCpinGroup(year: string, groupcode: string): Observable<any[]> {
    const url = this.baseUrlSelect
      + "s=*"
      + "&f=CPS6263.dbo.v_cp_data&w=year='" + year + "' and groupcode='" + groupcode
      + "' order by intlandno"
    // console.log('url:' ,url)
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

  // ข้อมูลปีการผลิตที่ Active
  getYear(): Observable<any[]> {
    const url = this.baseUrlSelect
      + "s=*"
      + "&f=cps6263.dbo.yearid"
      + "&w=setActive='Y'"
    return this.http.get<any[]>(url);
  }

  // ข้อมูลบัตรคิวที่ได้รับ ใช้ไป คงเหลือ ของแปลง
  getCpQcard(itid: string): Observable<any[]> {
    const url = this.baseUrlSelect
      + "s=top 1 *&f=dbQBRD.dbo.ck_itid_in_qcard&w=itid='" + itid + "'";
    return this.http.get<any[]>(url);
  }

  // การเรียกคิว รถสถานะแต่ละคิว
  async qNow(): Promise<Observable<any[]>> {
    const url = this.baseUrlSelect
      + "s=*&f=dbqbrd.dbo.fnc_qnow('')&w=1=1";
    return this.http.get<any[]>(url);
  }

  // รอบสำหรับในตัวเลือก
  async qloop() {
    const url = this.baseUrlSelect
      + "s=loop as ref_doc1&f=dbqbrd.dbo.loopq&w=1=1 order by iddata";
    return this.http.get<any[]>(url)
  }

  // ข้อมูลรถตัด รถคีบ รถบรรทุก หน้าจองคิว แบบทั้งหมด
  async getCarQ(groupcode: string) {
    try {
      const url1 = "https://asia-southeast2-brr-farmluck.cloudfunctions.net/dbcps/select_s_f_w?s=carcutId,groupcode,h_fmname fmname,carReg,wgt_net&f=vw_carcut&w=1=1 order by fmname,carReg"; // ข้อมูลรถตัดทั้งหมด
      const url2 = "https://asia-southeast2-brr-farmluck.cloudfunctions.net/dbcps/select_s_f_w?s=truck_no,carduid,fmcode_b1,fmname,groupcode,REGTRUCK&f=dbQBRD.dbo.truckBRR&w=carduid is not null and truck_type <>'X' and supzone between '01' and '10.2' order by fmname,regtruck";   // ข้อมูลรถบรรทุกโซนในทั้งหมด   
      const url3 = "https://asia-southeast2-brr-farmluck.cloudfunctions.net/dbcps/select_s_f_w?s=keep_no,owncode_keep fmcode,fmname,groupcode&f=dbQBRD.dbo.Car_keep&w=dataok='1' order by fmname,keep_no"; // ข้อมูลรถคีบทั้งหมด
      const url4 = "https://asia-southeast2-brr-farmluck.cloudfunctions.net/dbcps/select_s_f_w?s=carcutId,groupcode,h_fmname fmname,carReg&f=vw_carcut&w=groupcode='" + groupcode + "' order by carReg"; // รถตัดในกลุ่ม
      const url5 = "https://asia-southeast2-brr-farmluck.cloudfunctions.net/dbcps/select_s_f_w?s=truck_no,carduid,fmcode_b1,fmname,groupcode,REGTRUCK&f=dbQBRD.dbo.truckBRR&w=groupcode='" + groupcode + "' and carduid is not null and truck_type <>'X' and supzone between '01' and '10.2' order by regtruck";   // รถบรรทุกในกลุ่ม   
      const url6 = "https://asia-southeast2-brr-farmluck.cloudfunctions.net/dbcps/select_s_f_w?s=keep_no,owncode_keep fmcode,fmname,groupcode&f=dbQBRD.dbo.Car_keep&w=groupcode='" + groupcode + "' and dataok='1' order by keep_no";  // รถคีบในกลุ่ม
      // const url7 = "https://asia-southeast2-brr-farmluck.cloudfunctions.net/dbcps/select_s_f_w?s=*&f=dbQBRD.dbo.ckQusedGroup('"+groupcode+"','"+loop+"')&w=1=1 order by q_id";  // คิวได้รับในกลุ่ม

      const results = await Promise.all([
        fetch(url1),
        fetch(url2),
        fetch(url3),
        fetch(url4),
        fetch(url5),
        fetch(url6),
        // fetch(url7),
      ])
      const dataPromises = await results.map(result => result.json())
      const finalData = Promise.all(dataPromises);
      return finalData;
    } catch (err) {
      console.log(err)
      return err;
    }
  }

  // ข้อมูลรถตัด รถคีบ รถบรรทุก หน้าจองคิว แบบแค่ในกลุ่ม
  async getCarGroup(groupcode: string) {
    try {
      const url1 = this.baseUrlSelect + "s=carcutId,groupcode,h_fmname fmname,carReg&f=vw_carcut&w=groupcode='" + groupcode + "' order by carReg"; // รถตัดในกลุ่ม
      const url2 = this.baseUrlSelect + "s=truck_no,carduid,fmcode_b1,fmname,groupcode,REGTRUCK&f=dbQBRD.dbo.truckBRR&w=groupcode='" + groupcode + "' and carduid is not null and truck_type <>'X' and supzone between '01' and '10.2' order by regtruck";   // รถบรรทุกในกลุ่ม   
      const url3 = this.baseUrlSelect + "s=keep_no,owncode_keep fmcode,fmname,groupcode&f=dbQBRD.dbo.Car_keep&w=groupcode='" + groupcode + "' and dataok='1' order by keep_no";  // รถคีบในกลุ่ม

      const results = await Promise.all([
        fetch(url1),
        fetch(url2),
        fetch(url3),
      ])
      const dataPromises = await results.map(result => result.json())
      const finalData = Promise.all(dataPromises);
      return finalData;
    } catch (err) {
      console.log(err)
      return err;
    }
  }

  // ข้อมูลคิวที่ใช้ในกลุ่ม ในรอบ
  qUsedGroupLoop(groupcode: string, loop: string, qtype: string): Observable<any[]> {
    let url = ""
    if (loop == "00") {
      url = this.baseUrlSelect
        + "s=*&f=dbQBRD.dbo.v_qcard6566&w=groupcode='" + groupcode + "' and ref_doc1='00' and booking='Y' order by booktime desc";
    } else {
      let table: string = ""
      if (qtype == '1')
        table = "ckQusedGroup1"
      else if (qtype == '2')
        table = "ckQusedGroup2"
      else if (qtype == '3')
        table = "ckQusedGroup3"
      else
        table = ""
      url = this.baseUrlSelect
        + "s=*&f=dbQBRD.dbo." + table + "('" + groupcode + "','" + loop + "')&w=1=1 order by q_id";
    }
    return this.http.get<any[]>(url);
  }

  // ข้อมูลใบคิวที่ใช้ในกลุ่ม ในรอบ
  getQusedGroup(groupcode: string, loop: string, qtype: string): Observable<any[]> {
    let url = ""
    if (loop == "00") {
      url = this.baseUrlSelect
        + "s=*&f=dbQBRD.dbo.v_qcard6566&w=groupcode='" + groupcode + "' and ref_doc1='00' and booking='Y' order by booktime desc";
    } else {
      url = this.baseUrlSelect
        + "s=*&f=dbQBRD.dbo.v_qcard6566&w=qtype='" + qtype + "' and groupcode='" + groupcode + "' and ref_doc1='" + loop + "' and booking='Y' order by q_id";
    }
    return this.http.get<any[]>(url);
  }

  // ข้อมูลการใช้คิวของแปลงอ้อย
  getQusedCP(year: any, itid: string): Observable<any[]> {
    let url = this.baseUrlSelect
      + "s=truck_q,ref_doc1,q_id,regtruck,q_desc,reportdate,wgt_net,ccs_value&f=dbQBRD.dbo.v_qcard" + + "6&w=itid='" + itid + "' and print_q <> '0' order by reportdate,regtruck";
    return this.http.get<any[]>(url);
  }

  // ข้อมูลบัตรคิว สำหรับพรีวิว บัตรคิวอ้อย 
  qcardPreview(truck_q: string): Observable<any[]> {
    let url = this.baseUrlSelect
      + "s=top 1 *&f=dbQBRD.dbo.v_qcard6566"
      + "&w=truck_q='" + truck_q + "' "
    return this.http.get<any[]>(url)
  }

  // บันทึกการแจ้งคิว
  saveQbook(f: any): Observable<any[]> {
    console.log('form:', f)
    // const cutMethod = f.cutMethod
    // if (cutMethod == '1') {
    //   const url = "https://asia-southeast2-brr-farmluck.cloudfunctions.net/dbcps/update_t_s_w?t=[dbQBRD].[dbo].[qcard_6566]&"
    //     + "s=print_q='1',booking='Y',booktime=getdate(),ref_doc1='" + f.ref_doc1 + "',q_id=" + f.q_id + ",truck_no='" + f.truck_no + "',cut_no='" + f.carcutId + "'&"
    //     + "w=truck_q='" + f.truck_q + "' and print_q = '0' "
    //   return this.http.get<any[]>(url)
    // } else {
    //   const url = "https://asia-southeast2-brr-farmluck.cloudfunctions.net/dbcps/update_t_s_w?t=[dbQBRD].[dbo].[qcard_6566]&"
    //     + "s=print_q='1',booking='Y',booktime=getdate(),ref_doc1='" + f.ref_doc1 + "',q_id=" + f.q_id + ",truck_no='" + f.truck_no + "',keep_no='" + f.keep_no + "'&"
    //     + "w=truck_q='" + f.truck_q + "' and print_q = '0' "
    //   return this.http.get<any[]>(url)
    // }

    const url = "https://asia-southeast2-brr-farmluck.cloudfunctions.net/dbcps/update_t_s_w?t=[dbQBRD].[dbo].[qcard_6566]&"
      + "s=print_q='1',booking='Y',booktime=getdate(),ref_doc1='" + f.ref_doc1 + "',q_id=" + f.q_id + ",truck_no='" + f.truck_no + "',cut_no='" + f.carcutId + "',keep_no='" + f.keep_no + "'&"
      + "w=truck_q='" + f.truck_q + "' and print_q = '0' "
    return this.http.get<any[]>(url)

  }

  // บันทึกการขอเพิ่มคิวจาก กลุ่มตัด
  saveGetmoreQ(f: any): Observable<any[]> {
    let url1 = " https://asia-southeast2-brr-farmluck.cloudfunctions.net/app_farmer/insert_request_qcard?"
    let url2 = "itid='" + f.itid + "'&year_id='" + f.year_id + "'&landno='" + f.landno + "'&qtype='" + f.qtype
      + "'&num_qcard=" + f.num_qcard + "&Requester='" + f.requester + "'&comment='" + f.comment + "'"
    // console.log('form:', f)
    const url = url1 + url2
    return this.http.get<any[]>(url)
  }

  // รายการขอเพิ่มบัตรคิว
  getMoreQcardList(yearid: string, groupcode: string): Observable<any[]> {
    const url = this.baseUrlSelect
      + "s=*&"
      + "f=dbQBRD.dbo.v_request_qcard&"
      + "w=year_id='" + yearid + "' and groupcode = '" + groupcode + "' order by dateadd desc "
    return this.http.get<any[]>(url)
  }

  // เช็ครถบรรทุกกำลังใช้คิวอยู่หรือไม่
  ckTruckInQ(truck_no: string): Observable<any[]> {
    const url = this.baseUrlSelect
      + "s=truck_q,truck_no,ref_doc1,q_id,fmname,regtruck,q_desc,print_q&"
      + "f=dbQBRD.dbo.v_qcard6566&"
      + "w=truck_no = '" + truck_no + "' and print_q in (1,2,3,4)"
    return this.http.get<any[]>(url)
  }

  // สืบค้นข้อมูลรถบรรทุกอ้อย
  searchTruck(regtruck: string): Observable<any[]> {
    const url = this.baseUrlSelect
      + "s=*&"
      + "f=dbQBRD.dbo.fnc_searchtruckbrr('" + regtruck + "')&"
      + "w=1=1 order by booktime desc"
    // console.log('url ' ,url)
    return this.http.get<any[]>(url)
  }

  // ข้อมูลรถบรรทุกในกลุ่ม น้ำหนักอ้อยสะสม
  truckSummary(groupcode: string): Observable<any[]> {
    const url = this.baseUrlSelect
      + "s=*&"
      + "f=dbQBRD.dbo.fnc_truckGroup('" + groupcode + "')&"
      + "w=1=1 order by regtruck"
    return this.http.get<any[]>(url)
  }

  // รถบรรทุกที่ลานของกลุ่ม
  ckTruckOnBrr(groupcode: string): Observable<any[]> {
    const url = this.baseUrlSelect
      + "s=truck_q,ref_doc1,q_id,fmname,regtruck,q_desc,print_q&"
      + "f=dbQBRD.dbo.v_qcard6566&"
      + "w=groupcode = '" + groupcode + "' and print_q in (2,3,4)"
    return this.http.get<any[]>(url)
  }

  // ยกเลิกการจองคิวอ้อย กรณียังไม่ได้แจ้งคิว
  cancleQ(truck_q: string): Observable<any[]> {
    const url = this.baseUrlUpdate
      + "t=dbQBRD.dbo.qcard_6566&"
      + "s=truck_no=null,cut_no=null,keep_no=null,ref_doc1='00',q_id=0,booking='N',booktime=null,print_q='0',canceled_time=getdate()&"
      + "w=truck_q='" + truck_q + "' and print_q='1' "
    console.log('url to cancleQ ', url)
    return this.http.get<any[]>(url)
  }

  // ข้อมูลปีการผลิต
  yearId(): Observable<any[]> {
    const url = this.baseUrlSelect
      + "s=*&f=yearID&w=1=1 order by yearTh"
    return this.http.get<any[]>(url)
  }

  // ข้อมูลแปลงอ้อยที่เลือก
  getCpdataSelect(yearTh: string, itid: string) {
    let url = this.baseUrlSelect
      + "s=itid,intlandno,fmcode,fmname,CaneTypeName,landvalue,qcard_about,Qtype,assess&"
      + "f=cps6263.dbo.v_cp" + yearTh + "_basic&"
      + "w=itid='" + itid + "'"
    return this.http.get<any[]>(url)
  }

  // คิวได้รับในกลุ่ม
  qingroup(groupcode: string, qtype: string) {

    let tb = ""
    if (qtype == '1') {
      tb = "q_id"
    } else if (qtype == '3') {
      tb = "q_fc"
    } else {
      tb = "q_fc"
    }

    let url = this.baseUrlSelect
      + "s=*&"
      + "f=dbQBRD.dbo." + tb + "&"
      + "w=groupcode='" + groupcode + "' order by q_id"
    return this.http.get<any[]>(url)
  }

  // ข้อมูลกลุ่มตัดสำหรับ select list
  groupcode(qtype: string): Observable<any[]> {
    const url = this.baseUrlSelect
      + "s=groupcode,CONCAT(groupcode,' ',fmname) as fmname&"
      + "f=vw_headGroupCutting&"
      + "w=qtype = '" + qtype + "' order by groupcode"
    return this.http.get<any[]>(url)
  }

  // บันทึกการโอนคิวระหว่างกลุ่ม โดยชาวไร่
  saveMoveQ(f: any): Observable<any[]> {

    let tb = ""
    if (f.groupType == '1') {
      tb = "q_id"
    } else if (f.groupType == '3') {
      tb = "q_fc"
    } else {
      tb = "q_fc"
    }
    const url = this.baseUrlUpdate
      + "t=dbQBRD.dbo." + tb + "&"
      + "s=groupcode='" + f.groupcode2 + "' ,booking = getdate()&"
      + "w=q_id=" + f.q_id
    return this.http.get<any[]>(url)
  }

  // บันทึก log การโอนย้ายคิวของชาวไร่
  saveMoveQtoLog(f: any): Observable<any[]> {
    const url = this.baseUrlInsert
      + "t=[dbQBRD].[dbo].[t_logMoveQ]&c=groupcodeFrom,groupcodeTo,q_id&v='" + f.groupcode1 + "','" + f.groupcode2 + "', " + f.q_id
    return this.http.get<any[]>(url)
  }

  // ประวัติการโอนคิวของกลุ่ม
  moveqData(groupcode: string): Observable<any[]> {
    const url = this.baseUrlSelect
      + "s=*&"
      + "f=dbQBRD.dbo.t_logMoveQ&"
      + "w=groupcodeFrom = '" + groupcode + "' order by dateadd desc"
    return this.http.get<any[]>(url)
  }



}
