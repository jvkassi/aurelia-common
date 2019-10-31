import { Prompt } from "./prompt";
import { Confirm } from "./confirm";
import { DialogService } from "aurelia-dialog";
import { autoinject } from "aurelia-framework";

@autoinject()
export class Dialog {
         private dialog: DialogService;

         public confirm(
           title: string = '',
           text: string = 'Vous devez confirmer cette action'
         ) {
           return new Promise((resolve, reject) => {
             this.dialog
               .open({
                 viewModel: Confirm,
                 model: {
                   title: title,
                   text: text
                 }
               })
               .whenClosed(response => {
                 // console.log(response)
                 if (response.wasCancelled) {
                   reject("cancelled");
                 }
                 resolve(response);
               });
           });
         }

         public prompt({
           label,
           title = "Prompt",
           type = "text",
           text = "Vous devez remplir cette information"
         }: {
           label: string;
           title?: string;
           type?: string;
           text?: string;
         }) {
           return new Promise((resolve, reject) => {
             this.dialog
               .open({
                 viewModel: Prompt,
                 model: {
                   type: type,
                   title: title,
                   lable: label,
                   text: text
                 }
               })
               .whenClosed(response => {
                 // console.log(response)
                 if (response.wasCancelled) {
                   reject("cancelled");
                 }

                 resolve(response);
               });
           });
         }
       }
