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

  controller: DialogController;

  config = null;

  constructor(controller) {
    this.controller = controller;
    this.controller.settings.lock = false;
  }

  activate(config) {
    this.config = config;
  }
}
