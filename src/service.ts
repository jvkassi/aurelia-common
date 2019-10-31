import { EntityManager } from "aurelia-orm";
import { autoinject } from "aurelia-framework";

@autoinject
export class Service {
  protected entity: string = "";

  constructor(protected EntityManager: EntityManager) {}

  public get(id = undefined): any {
    if (id) {
      return this.EntityManager.getRepository(this.entity).find(id);
    }
    return this.EntityManager.getRepository(this.entity).find();
  }

  public getAll(filters = {}): any {
    return this.EntityManager.getRepository(this.entity).find(filters);
  }
}
