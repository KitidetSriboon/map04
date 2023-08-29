import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder ,FormGroup } from '@angular/forms';

@Component({
  selector: 'app-update',
  templateUrl: './update.page.html',
  styleUrls: ['./update.page.scss'],
})
export class UpdatePage implements OnInit {

  itid : any;
  frm_update: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
  ) {
    this.itid = this.route.snapshot.paramMap.get('itid');
    console.log('itid in update :', this.itid)
  
    this.frm_update = fb.group({
      groupcode: '',
    })

  }

  ngOnInit() {
  }

  submit(f:any) {
    console.log('Form :' ,f)
  }

}
