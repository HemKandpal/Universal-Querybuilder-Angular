import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UniversalQueryBuilderComponent } from './universal-query-builder.component';

describe('UniversalQueryBuilderComponent', () => {
  let component: UniversalQueryBuilderComponent;
  let fixture: ComponentFixture<UniversalQueryBuilderComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UniversalQueryBuilderComponent]
    });
    fixture = TestBed.createComponent(UniversalQueryBuilderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
