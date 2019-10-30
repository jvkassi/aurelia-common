import { AuthService } from 'aurelia-authentication';
import { autoinject } from 'aurelia-framework';

@autoinject()
export class UserService {
  user: any;
  constructor(private AuthService: AuthService) {}

  public getInfos() {
    this.user = this.AuthService.getTokenPayload();
    return this.user && this.user.user;
  }

  public logout() {
    this.AuthService.logout();
  }
}
