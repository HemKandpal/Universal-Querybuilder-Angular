import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';

import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { QueryBuilderModule } from '../query-builder//public-api';
import { UniversalQueryBuilderComponent } from '../query-builder/universal-query-builder/universal-query-builder.component';

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    NoopAnimationsModule,
    QueryBuilderModule
  ],
  declarations: [AppComponent, UniversalQueryBuilderComponent],
  bootstrap: [AppComponent]
})
export class AppModule {
}
