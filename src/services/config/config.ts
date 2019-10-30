import { inject, PLATFORM } from "aurelia-framework";

import { AureliaConfiguration } from "aurelia-configuration";

import { EntityManager } from "aurelia-orm";

@inject(EntityManager, AureliaConfiguration)
export class Config {
  config: AureliaConfiguration;
  settings: any;
  general: any;

  entityManager: EntityManager;

  constructor(EntityManager, AureliaConfiguration) {
    this.entityManager = EntityManager;
    this.settings = this.entityManager.getRepository("setting");
    this.config = AureliaConfiguration;
  }

  get() {
    return this.settings.find({ name: "general" }).then(settings => {
      this.general = settings[0];
      // console.log(this.settings);
      // console.log(settings[0].value);
      // console.log(JSON.parse(settings[0].value).establishment);
      return JSON.parse(settings[0].value);
      // return JSON.parse(settings[0].value)
    });
  }

  set(settings) {
    this.general.value = JSON.stringify(settings);
    // console.log(this.general);
    return this.general.save();
    // console.log(this.config.get("settings"));
    // // console.log(settings)
    // // console.log(JSON.stringify(settings));
    // this.settings = this.config.set("settings", JSON.stringify(settings));
    // this.settings = this.config.set("settings", "123");
    // console.log(this.config.get("settings"));
  }
}
