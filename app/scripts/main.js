let draws = null;
const threeBallAmount = 25;

const $inputNumbersContainer = $('.input-numbers-container');
const $calculatingContainer = $('.calculating-container');
const $resultsContainer = $('.results-container');
const $winningsContainer = $('.winnings-container');
const $looserContainer = $('.looser-container');
const $winningsTableBody = $('.winnings-table tbody');
const $calculateButton = $('.calculate-button');
const $resetButton = $('.reset-button');
const $inputs = $('.input-list input');
const $numbersList = $('.numbers-list');
const $luckyDips = $('.lucky-dips');
const $numbersError = $('.numbers-error');

$(document).on('ready', function() {
  // Parse data
  fetch('scripts/draws.json')
    .then(response => response.json())
    .then(json => draws = json);
})

$inputs.on('keydown input', function(e) {
  // Hide the error message when typing
  $numbersError.hide();

  // Allow key strokes for numbers, tab, return, backspace, delete
  const allowedKeys = [8,9,13,46,48,49,50,51,52,53,54,55,56,57];
  if (allowedKeys.indexOf(e.keyCode) < 0) {
    e.preventDefault();
  }
  // Try to calculate on return
  if (e.keyCode === 13) {
    calculate();
  }
});

$resetButton.on('click', function() {
  // Reset everything
  $inputs.each(function() {
    $(this).val('');
  });
  $numbersList.empty();
  $winningsTableBody.empty();
  $inputNumbersContainer.show();
  $resultsContainer.hide();
  $winningsContainer.hide();
  $looserContainer.hide();
  $(this).hide();
});

$calculateButton.on('click', function() {
  calculate();
});

function calculate() {
  // Only get numbers between 1 and 59
  let numbers = [];
  $inputs.each(function() {
    if ($(this).val() > 0 && $(this).val() < 60) {
      numbers.push(+$(this).val());
    }
  });

  if (numbers.length < 7) {
    // Show error message if not enough or incorrect numbers
    $numbersError.show();
  } else {
    // Populate inputed numbers list
    numbers.forEach((number) => {
      $numbersList.append(`<li>${number}</li>`);
    })

    // Not really necessary to show/hide the loading screen as finding mathces is really quick
    // $calculatingContainer.show();
    $inputNumbersContainer.hide();
    let luckyDips = 0;
    let totalWinnings = 0;

    // Check each draw against current numbers
    draws.forEach((result, i) => {
      // Make a set with the draw results and the B number
      const resultSet = new Set(result['Results']).add(result['B']);
      // New array with only the numbers that match
      const matches = [...new Set(numbers.filter(n => resultSet.has(n)))];

      // Splitting the date in components (day, month, year)
      const dateComponents = result['Draw date'].split('/');
      // Creating a new Date object in the right order (month/date/year)
      const jsDate = new Date(`${dateComponents[1]}/${dateComponents[0]}/${dateComponents[2]}`);
      const days = ['sun','mon','tue','wed','thu','fri','sat'];
      // Checking which day of the week the current date is
      const weekDay = days[jsDate.getDay()];

      if (matches.length === 7) {
        // Populate the winnigs table with the jackpot
        $winningsTableBody.append(`<tr><td>${weekDay} ${result['Draw date']}</td><td>£${result['Jackpot']}</td></tr>`);
        // Increase the totalWinnings with the jackpot amount (removing ,)
        totalWinnings += +result['Jackpot'].replace(/,/g , '');
      } else if (matches.length === 3) {
        // Populate the winnings table with all three ball winnings (for at least 3 numbers matched)
        $winningsTableBody.append(`<tr><td>${weekDay} ${result['Draw date']}</td><td>£${threeBallAmount}</td></tr>`);
        // Increase the totalWinnings with threeBallAmount
        totalWinnings += threeBallAmount;
      } else if (matches.length === 2) {
        // Increase the number of lucky dips (for at least 2 numbers matched)
        luckyDips++;
      }
    });

    // Not really necessary to show/hide the loading screen as finding mathces is really quick
    // $calculatingContainer.fadeOut();
    $resultsContainer.fadeIn();
    $resetButton.fadeIn();

    if (luckyDips > 0) {
      // Show lucky dips message if there are any
      $luckyDips.find('span').text(luckyDips);
      $luckyDips.show();
    }
    if (totalWinnings > 0) {
      // Update total & show the winning section
      $('.winnings-total').text(`£${totalWinnings.toLocaleString()}`);
      $winningsContainer.show();
    } else {
      // Show the loosing section
      $looserContainer.show();
    }
  }
}
