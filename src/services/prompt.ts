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
  private controller: DialogController;
  private config: { title: string; label: string; type: string; value: any };

  constructor(controller: DialogController) {
    this.controller = controller;
  }

  activate(params: { title: string; label: string; type: string; value: any }) {
    this.config = params;
  }
}
