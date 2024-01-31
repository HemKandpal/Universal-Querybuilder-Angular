import { NgModule, importProvidersFrom } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSidenavModule } from '@angular/material/sidenav';
import { AppRoutingModule } from './app-routing.module';
import { ColorPickerModule } from '@iplab/ngx-color-picker';
import { QueryBuilderModule, UniversalQueryBuilderComponent } from 'src/app/features/query-builder/public-api';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';



@NgModule({
  declarations: [
    AppComponent,
    UniversalQueryBuilderComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MatDialogModule,
    MatSidenavModule,
    AppRoutingModule,
    QueryBuilderModule,
  ],
  providers: [importProvidersFrom(ColorPickerModule)],
  bootstrap: [AppComponent]
})
export class AppModule { }
