import { DialogController } from "aurelia-dialog";
import { inject, PLATFORM, autoinject } from "aurelia-framework";

PLATFORM.moduleName("./confirm");

@autoinject
export class Confirm {
  private controller: DialogController;
  private confirm = {
    title: '',
    text: ''
  }

  constructor(controller: DialogController) {
    this.controller = controller;
  }

  activate(params: { title: string;  text: string }) {
    this.confirm = params;
  }
}
