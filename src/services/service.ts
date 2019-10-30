import { EntityManager } from "aurelia-orm";
import { autoinject } from "aurelia-framework";
@autoinject
export class AppService {
  protected entity = "";

  constructor(protected EntityManager: EntityManager) {}

  get(id = undefined) {
    if (id) {
      return this.EntityManager.getRepository(this.entity).find(id);
    }
    return this.EntityManager.getRepository(this.entity).find();
  }

  getAll(filters = {}) {
    return this.EntityManager.getRepository(this.entity).find(filters);
  }
}
