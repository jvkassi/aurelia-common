import { EntityManager } from "aurelia-orm";
import { autoinject } from "aurelia-framework";

@autoinject
export class Service {

  protected entity: string = '';

  constructor(protected EntityManager: EntityManager) {}

  protected get(id = undefined) : any {
    if (id) {
      return this.EntityManager.getRepository(this.entity).find(id);
    }
    return this.EntityManager.getRepository(this.entity).find();
  }

  protected getAll(filters = {}) : any {
    return this.EntityManager.getRepository(this.entity).find(filters);
  }
}
