import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrdersCreateComponent } from './orders-create.component';

describe('OrdersCreateComponent', () => {
  let component: OrdersCreateComponent;
  let fixture: ComponentFixture<OrdersCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrdersCreateComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrdersCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
