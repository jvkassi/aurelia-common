import { DialogController } from "aurelia-dialog";
import { inject, PLATFORM } from "aurelia-framework";

PLATFORM.moduleName("./confirm");

@inject(DialogController)
export class Confirm {
  controller = null;
  confirm = null;

  constructor(controller) {
    this.controller = controller;
  }

  activate(params) {
    this.confirm = params;
  }
}
