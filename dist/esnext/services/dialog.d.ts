export declare class Dialog {
    private dialog;
    confirm(title?: string, text?: string): Promise<{}>;
    prompt({ label, title, type, text }: {
        label: string;
        title?: string;
        type?: string;
        text?: string;
    }): Promise<{}>;
}
