import { AuthenticateStep, AuthService } from "aurelia-authentication";
import { Notification } from "aurelia-notification";
import { autoinject, Container } from "aurelia-framework";

import { NotifyService } from "./service";

const NotificationService = Container.instance.get(
  Notification
) as Notification;

// const notifyService = Container.instance.get(NotifyService) as NotifyService;
const duration = 10;
let notifications = [];

export function notify(state, type, message) {
  // notify.open

  const notification = {
    message: message,
    duration: duration,
    id: notifications.length,
    // title: title,
    type: type
  };
  notifications.push(notification);

  return Object.assign({}, state, { notifications: notifications });
}

export function close(state, id) {
  notifications = notifications.slice(id, 1);
  return Object.assign({}, state, { notifications: notifications });
}
