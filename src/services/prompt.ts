import {
  DialogController
}
from 'aurelia-dialog';

import {
  inject
}
from 'aurelia-framework';

@inject(DialogController)
export class Prompt {

  private controller: DialogController
  private config: { title: string, label: string, type: string, value: any};

  activate(config: { title: string; label: string; type: string; value: any; }) {
    this.config = config;
  }
}
