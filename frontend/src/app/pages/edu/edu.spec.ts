import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EduComponent } from './edu';

describe('Edu', () => {
  let component: EduComponent;
  let fixture: ComponentFixture<EduComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EduComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EduComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
