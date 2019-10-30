import { PLATFORM, autoinject } from "aurelia-framework";

// PLATFORM.moduleName('./notify')
import "./notify.css";

@autoinject()
export class NotifyService {
  duration = 2500;
  notifications = [];

  constructor(private Notification: Notification) {}

  // open(type, text) {
  //   this.Notification.error("asdf");
  //   this.Notification.success("asdf");
  // }

  open(message, duration, title, type) {
    const notification = {
      message: message,
      duration: duration,
      id: this.notifications.length,
      title: title,
      type: type
    };
    // setTimeout(() => {
    //   this.close(notification.id);
    // }, notification.duration);

    // this.notifications.push(notification);
  }

  close(id) {
    this.notifications.splice(id, 1);
  }

  show(message, duration = this.duration, title = "") {
    this.open(message, duration, title, "");
  }

  info(message, duration = this.duration, title = "") {
    this.open(message, duration, title, "info");
  }

  success(message, duration = this.duration, title = "") {
    this.open(message, duration, title, "sucess");
  }

  warning(message, duration = this.duration, title = "") {
    this.open(message, duration, title, "");
  }

  error(message, duration = this.duration, title = "") {
    this.open(message, duration, title, "danger");
  }
}
