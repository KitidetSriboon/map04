import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QbookPage } from './qbook.page';

describe('QbookPage', () => {
  let component: QbookPage;
  let fixture: ComponentFixture<QbookPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(QbookPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
