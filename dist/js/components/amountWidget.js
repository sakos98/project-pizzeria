import { settings, select } from '../settings.js';

class amountWidget {
  constructor(element) {
    const thisWidget = this;

    thisWidget.getElements(element);
    thisWidget.setValue(thisWidget.input.value);
    thisWidget.initActions();
  }

  getElements(element) {
    const thisWidget = this;

    thisWidget.element = element;
    thisWidget.value = settings.amountWidget.defaultValue;
    thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
    thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
    thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
  }

  setValue(value) {
    const thisWidget = this;
    const newValue = parseInt(value);

    /* TODO: Add validation */
    if (thisWidget.value !== newValue && !isNaN(newValue)) {
      if (newValue >= settings.amountWidget.defaultMin) {
        if (newValue <= settings.amountWidget.defaultMax) {
          thisWidget.value = newValue;
        }
      }
    }
    thisWidget.input.value = thisWidget.value;
    thisWidget.announce();
  }

  announce() {
    const thisWidget = this;
    const event = new CustomEvent('updated', {
      bubbles: true
    });
    thisWidget.element.dispatchEvent(event);
  }

  initActions() {
    const thisWidget = this;

    thisWidget.input.addEventListener('change', function () {
      thisWidget.setValue(thisWidget.input.value);
    });
    thisWidget.linkDecrease.addEventListener('click', function (event) {
      event.preventDefault();
      thisWidget.setValue(--thisWidget.input.value);
    });
    thisWidget.linkIncrease.addEventListener('click', function (event) {
      event.preventDefault();
      thisWidget.setValue(++thisWidget.input.value);
    });
  }
}

export default amountWidget;