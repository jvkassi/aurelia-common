import { AuthenticateStep, AuthService } from "aurelia-authentication";

export async function login(
  state,
  creds: { username: string; password: string },
  auth: AuthService
) {
  return auth.login(creds).then(data => {
    return Object.assign({}, state, {
      user: data
    });
  });
}
