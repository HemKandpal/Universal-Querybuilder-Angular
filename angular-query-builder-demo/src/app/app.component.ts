import { Component } from '@angular/core';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  public onElasticSearchCallback: any;
  public rawQuery: any;
  //renderView = false;

  constructor() {
    //############ TODO ########## (handle using promise in future)
    // setTimeout(() => {
    //   this.renderView = true;
    // }, 1000);
  }

}
