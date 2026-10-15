(function () {
  'use strict';

  /* Chapter examples remain fully readable until controls are initialized. */
  function initWalkthroughs() {
    document.querySelectorAll('.walkthrough:not([data-ready])').forEach(function (root) {
      var scenarios = Array.from(root.querySelectorAll(':scope > [data-scenario]'));
      if (!scenarios.length) return;
      var steps = scenarios.map(function (scenario) {
        return Array.from(scenario.querySelectorAll('.walkthrough-steps > li'));
      });
      if (steps.some(function (items) { return !items.length; })) return;

      var scenarioIndex = 0;
      var stepIndex = 0;
      var controls = document.createElement('div');
      controls.className = 'walkthrough-controls';
      var label = document.createElement('label');
      label.textContent = 'Scenario ';
      var select = document.createElement('select');
      scenarios.forEach(function (scenario, index) {
        select.add(new Option(scenario.dataset.scenario, String(index)));
      });
      label.append(select);
      controls.append(label);

      function button(text, action) {
        var element = document.createElement('button');
        element.type = 'button';
        element.textContent = text;
        element.addEventListener('click', action);
        controls.append(element);
        return element;
      }
      var previous = button('Previous', function () { stepIndex--; render(); });
      var next = button('Next step', function () { stepIndex++; render(); });
      button('Reset', function () { stepIndex = 0; render(); });
      var status = document.createElement('p');
      status.className = 'walkthrough-status';
      status.setAttribute('role', 'status');
      status.setAttribute('aria-atomic', 'true');

      function render() {
        scenarios.forEach(function (scenario, index) {
          scenario.hidden = index !== scenarioIndex;
          steps[index].forEach(function (step, position) {
            step.hidden = position !== stepIndex;
            step.removeAttribute('aria-current');
          });
        });
        var current = steps[scenarioIndex][stepIndex];
        current.setAttribute('aria-current', 'step');
        current.value = stepIndex + 1;
        previous.disabled = stepIndex === 0;
        next.disabled = stepIndex === steps[scenarioIndex].length - 1;
        var heading = current.querySelector(':scope > strong');
        status.textContent = 'Step ' + (stepIndex + 1) + ' of ' + steps[scenarioIndex].length +
          ': ' + (heading ? heading.textContent.trim() : '');
      }
      select.addEventListener('change', function () {
        scenarioIndex = select.selectedIndex;
        stepIndex = 0;
        render();
      });
      root.prepend(controls);
      root.append(status);
      root.dataset.ready = 'true';
      render();
    });
  }

  function initPoolBudgets() {
    document.querySelectorAll('.pool-budget:not([data-ready])').forEach(function (root) {
      var form = root.querySelector('form');
      var output = root.querySelector('output');
      var fields = Array.from(form.querySelectorAll('input'));
      function calculate() {
        if (!fields.every(function (field) { return field.validity.valid; })) {
          output.textContent = 'Enter whole numbers within the displayed limits.';
          return;
        }
        var values = new FormData(form);
        var replicas = Number(values.get('replicas'));
        var surge = Number(values.get('surge'));
        var pool = Number(values.get('pool'));
        var budget = Number(values.get('budget'));
        var demand = (replicas + surge) * pool;
        var remaining = budget - demand;
        output.textContent = '(' + replicas + ' + ' + surge + ') × ' + pool + ' = ' + demand +
          ' possible connections. ' + (remaining >= 0 ? remaining + ' connections remain in the application budget.' :
          'Exceeds the application budget by ' + -remaining + ' connections.');
      }
      form.addEventListener('submit', function (event) { event.preventDefault(); calculate(); });
      form.addEventListener('input', calculate);
      root.dataset.ready = 'true';
      calculate();
      form.hidden = false;
    });
  }

  initWalkthroughs();
  initPoolBudgets();
})();
