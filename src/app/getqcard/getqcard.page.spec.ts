import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GetqcardPage } from './getqcard.page';

describe('GetqcardPage', () => {
  let component: GetqcardPage;
  let fixture: ComponentFixture<GetqcardPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(GetqcardPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
