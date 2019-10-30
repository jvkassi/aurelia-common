import { AuthService } from 'aurelia-authentication';
import { autoinject } from 'aurelia-framework';

@autoinject()
export class User {

  private user: any;
  constructor(private AuthService: AuthService) {}

  private getInfos(): any {
    this.user = this.AuthService.getTokenPayload();
    return this.user && this.user.user;
  }

  private logout(): void {
    this.AuthService.logout();
  }
}
