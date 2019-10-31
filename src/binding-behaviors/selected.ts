import {
  customAttribute,
  inject,
  bindingMode
}
from 'aurelia-framework';

@customAttribute('selected', bindingMode.twoWay)
@inject(Element)
export class Selected {

  private element: Element;

  valueChanged(newValue: any) {

    if (newValue) {
      this.element.classList.add('selected');
    }
    else {
      this.element.classList.remove('selected');
    }
  }
}
