import "./notify.css";
export declare class NotifyService {
    private Notification;
    duration: number;
    notifications: never[];
    constructor(Notification: Notification);
    open(message: any, duration: any, title: any, type: any): void;
    close(id: any): void;
    show(message: any, duration?: number, title?: string): void;
    info(message: any, duration?: number, title?: string): void;
    success(message: any, duration?: number, title?: string): void;
    warning(message: any, duration?: number, title?: string): void;
    error(message: any, duration?: number, title?: string): void;
}
