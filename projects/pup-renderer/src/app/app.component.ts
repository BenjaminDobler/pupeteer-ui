import { Component } from '@angular/core';
import { remote } from 'electron';
import { Remotes } from './services/remotes';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'pup-renderer';

  constructor(public remotes: Remotes) {
    console.log(remote.app.getAppPath());
  }

  addRemote(port) {
    this.remotes.addRemote(port);
  }
}
