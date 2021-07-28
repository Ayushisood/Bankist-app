'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data
import 'core-js/stable';

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-05-27T17:01:17.194Z',
    '2020-07-10T23:36:17.929Z',
    '2020-07-11T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-24T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const closeModel = document.querySelector('.close-modal');
const showModel = document.querySelector('.show-modal');
const modal = document.querySelector('.modal');
const overlay = document.querySelector('.overlay');

const addUserName = document.querySelector('.add-user--name');
const addUserUName = document.querySelector('.add-user--Uname');
const addUserPin = document.querySelector('.add-user--pin');
const addUserCurrency = document.querySelector('.add-user--currency');
//const addUserRate = document.querySelector('.add-user--rate');
const addUserBtn = document.querySelector('.addUser__btn');
const addUserFirstDeposit = document.querySelector('.add-user--money');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
// Functions

//generic function for currency
const currencyFunction = function (value, currency) {
  return new Intl.NumberFormat(navigator.language, {
    style: 'currency',
    currency: currency,
  }).format(Math.abs(value));
};

//function for timer
const startTimer = function () {
  //start timer to 5 minutes
  let timer = 5 * 60;

  //function for setInterval
  const tick = function () {
    const min = String(Math.trunc(timer / 60)).padStart(2, 0); //converted to string as textContent takes string as input
    const sec = String(Math.trunc(timer % 60)).padStart(2, 0);

    //in each call print the remaining time to UI
    labelTimer.textContent = `${min}:${sec}`;

    //when reaches to 0 sec, stop the timer and log out
    if (timer === 0) {
      clearInterval(timerOut);
      labelWelcome.textContent = 'Log in to get started';
      containerApp.style.opacity = 0;
    }

    //decrease 1 sec
    timer--;
  };

  //call timer every sec
  tick();
  const timerOut = setInterval(tick, 1000);
  return timerOut;
};

//displaying date
const modifiedMovementDays = function (date) {
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24)); //1000 * 60 * 60 * 24 = it will give the days
  const daysPassed = calcDaysPassed(new Date(), date);

  if (daysPassed === 0) return `Today`;
  if (daysPassed === 1) return `Yesterday`;
  if (daysPassed <= 7) return `${daysPassed} days ago`;
  /*const day = `${date.getDate()}`.padStart(2, 0);
  const month = `${date.getMonth() + 1}`.padStart(2, 0); //month start from 0 therefore +1
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;*/

  return new Intl.DateTimeFormat('pt-PT').format(date); //using Intl API to format date and time, used pt-Pt as it will nicely show the date format with 0's in date and months
};

const displayMovements = function (moves, sort = false) {
  const mov = sort
    ? moves.movements.slice().sort((a, b) => a - b)
    : moves.movements;
  //for empty the container before adding movements
  containerMovements.innerHTML = '';

  mov.forEach(function (move, index) {
    const type = move > 0 ? 'deposit' : 'withdrawal';

    //for displaying date
    const date = new Date(moves.movementsDates[index]);
    const displayDate = modifiedMovementDays(date);

    //displaying currency
    const modifiedCurrency = currencyFunction(move, moves.currency);

    const htmlString = `<div class="movements__row">
    <div class="movements__type movements__type--${type}">${
      index + 1
    } ${type}</div>
    <div class="movements__date">${displayDate}</div>
    <div class="movements__value">${modifiedCurrency}</div>
  </div>`;

    containerMovements.insertAdjacentHTML('afterbegin', htmlString);
  });
};

//displayMovements(account1.movements);

//displaying the username with first letters of the owner name
const userName = function (acc) {
  acc.forEach(function (currentAccount) {
    //used forEach as no need to create new array as adding an property to objects
    const users = currentAccount.owner
      .toLowerCase()
      .split(' ')
      .map(function (currAccount) {
        //used map method on generated array by split method as need to return a  new array of username
        return currAccount[0];
      })
      .join('');
    currentAccount.username = users;
  });
};

userName(accounts);

//balance using reduce method as it will loop over the array and returns the final single value anfd in the callback function, it can have 4 parameters including accumlator,currentElement , index , type i.e array
const balances = function (acc) {
  acc.balance = acc.movements.reduce(
    function (accumulator, currentEl) {
      return accumulator + currentEl;
    },
    0 //initial value of accumulator/counter
  );
  labelBalance.textContent = currencyFunction(acc.balance, acc.currency);
};
//balances(account1.movements);

//calaculate the summary
const calcSummary = function (moves) {
  const totalIn = moves.movements
    .filter(currentEl => currentEl > 0)
    .reduce((accumulator, currentEl) => accumulator + currentEl, 0);

  //labelSumIn.textContent = `${totalIn.toFixed(2)}€`;
  labelSumIn.textContent = currencyFunction(totalIn, moves.currency);

  const totalOut = Math.abs(
    moves.movements
      .filter(currentEl => currentEl < 0)
      .reduce((accumulator, currentEl) => accumulator + currentEl, 0)
  );

  //labelSumOut.textContent = `${totalOut.toFixed(2)}€`;
  labelSumOut.textContent = currencyFunction(totalOut, moves.currency);

  const totalInterest = moves.movements
    .filter(currentEl => currentEl > 0)
    .map(depositInterest => (depositInterest * moves.interestRate) / 100)
    .reduce((accumulator, currentEl) => accumulator + currentEl, 0);

  //labelSumInterest.textContent = `${totalInterest.toFixed(2)}€`;
  labelSumInterest.textContent = currencyFunction(
    totalInterest,
    moves.currency
  );
};
//calcSummary(account1.movements);

const updateUI = function (acc) {
  balances(acc);
  calcSummary(acc);
  displayMovements(acc);
};

//login page event handlers
let currentAccount, timerOut;

btnLogin.addEventListener('click', function (event) {
  //to prevent html element to performing it defined default functionality
  event.preventDefault();

  currentAccount = accounts.find(function (acct) {
    return acct.username === inputLoginUsername.value;
  });

  //console.log(currentAccount);

  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    //display UI
    containerApp.style.opacity = 100;

    //restart the timer
    if (timerOut) clearInterval(timerOut);
    timerOut = startTimer();

    //display username
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    //display balance, summary, movements
    updateUI(currentAccount);
  } else {
    labelWelcome.textContent = `Wrong Username or Password!`;
    showModel.style.opacity = 100;
    setTimeout(function () {
      labelWelcome.textContent = `Log in to get started`;
      showModel.style.opacity = 0;
    }, 3000);
  }
  //clearing input fields after logged in
  inputLoginPin.value = inputLoginUsername.value = '';
  inputLoginPin.blur(); //for loosing the focus of blinking cursor
});

//add new user window appears/disappers
const showHiddenWindow = function () {
  modal.classList.remove('hidden');
  overlay.classList.remove('hidden');
};

showModel.addEventListener('click', showHiddenWindow);

const closeHiddenWindow = function () {
  modal.classList.add('hidden');
  overlay.classList.add('hidden');

  addUserName.value =
    addUserPin.value =
    addUserCurrency.value =
    addUserUName.value =
    addUserFirstDeposit.value =
      '';
};

closeModel.addEventListener('click', closeHiddenWindow);
overlay.addEventListener('click', closeHiddenWindow);

//when Esc key is pressed
document.addEventListener('keydown', function (event) {
  if (event.key === 'Escape') closeHiddenWindow();
});

//store new user credentials to objects
addUserBtn.addEventListener('click', function (event) {
  event.preventDefault();
  const accountNew = {
    owner: addUserName.value,
    movements: [Number(addUserFirstDeposit.value)],
    interestRate: 1.2,
    pin: Number(addUserPin.value),
    username: addUserUName.value,

    movementsDates: [new Date().toISOString()],
    currency: addUserCurrency.value,
  };
  accounts.push(accountNew);
  closeHiddenWindow();
  console.log(accounts);
});

//implementing tranfer functionality of app
btnTransfer.addEventListener('click', function (event) {
  event.preventDefault();

  const transferAccount = accounts.find(function (acct) {
    return acct.username === inputTransferTo.value;
  });

  const amount = Number(inputTransferAmount.value);

  //checking for valid conditions
  if (
    amount > 0 &&
    transferAccount &&
    currentAccount.balance >= amount &&
    currentAccount.username !== transferAccount.username
  ) {
    //doing the transfer
    currentAccount.movements.push(-amount);
    transferAccount.movements.push(amount);

    //add the tranfer date
    currentAccount.movementsDates.push(new Date().toISOString());
    transferAccount.movementsDates.push(new Date().toISOString());

    //update the UI
    updateUI(currentAccount);
  } else {
    document.querySelector('.operation--transfer h2').textContent =
      'Wrong Username!';
    setTimeout(function () {
      document.querySelector('.operation--transfer h2').textContent =
        'Transfer money';
    }, 2000);
  }
  //console.log(transferAccount);
  inputTransferAmount.value = inputTransferTo.value = '';

  //restart the timer
  clearInterval(timerOut);
  timerOut = startTimer();
});

//deleting an account
btnClose.addEventListener('click', function (event) {
  event.preventDefault();

  if (
    currentAccount.username === inputCloseUsername.value &&
    currentAccount.pin === Number(inputClosePin.value)
  ) {
    const findIndexObject = accounts.findIndex(function (acc) {
      return acc.username === currentAccount.username;
    });
    //console.log(findIndexObject);
    accounts.splice(findIndexObject, 1);

    //hide the UI as account is deleted
    containerApp.style.opacity = 0;
    labelWelcome.textContent = 'Log in to get started';
  } else {
    document.querySelector('.operation--close h2').textContent =
      'Wrong Inputs!';
    setTimeout(function () {
      document.querySelector('.operation--close h2').textContent =
        'Close account';
    }, 2000);
  }

  inputClosePin.value = inputCloseUsername.value = '';
});

//implementing the loan functionality
btnLoan.addEventListener('click', function (event) {
  event.preventDefault();

  const loanAmount = Math.floor(inputLoanAmount.value);
  if (
    loanAmount > 0 &&
    currentAccount.movements.some(function (acc) {
      return acc > 0 && acc >= 0.1 * loanAmount;
    })
  ) {
    setTimeout(function () {
      document.querySelector('.operation--loan h2').textContent =
        'Loan Approved!';
    }, 1000);
    setTimeout(function () {
      //add positive amount to currentAccount
      currentAccount.movements.push(loanAmount);

      //add laon date
      currentAccount.movementsDates.push(new Date().toISOString());

      //update UI
      updateUI(currentAccount);
      document.querySelector('.operation--loan h2').textContent =
        'Request loan';
    }, 3000);
  } else {
    document.querySelector('.operation--loan h2').textContent =
      'Conditions not met!';
    setTimeout(function () {
      document.querySelector('.operation--loan h2').textContent =
        'Request loan';
    }, 2000);
  }
  inputLoanAmount.value = '';

  //restart the timer
  clearInterval(timerOut);
  timerOut = startTimer();
});

//implementing sort functionality
let sorted = false;
btnSort.addEventListener('click', function (event) {
  event.preventDefault();

  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
});

//displaying current date and time
const nowDate = new Date();
/*const day = `${nowDate.getDate()}`.padStart(2, 0);
const month = `${nowDate.getMonth() + 1}`.padStart(2, 0); //month start from 0 therefore +1
const year = nowDate.getFullYear();
const hour = `${nowDate.getHours()}`.padStart(2, 0);
const minutes = `${nowDate.getMinutes()}`.padStart(2, 0);
labelDate.textContent = `${day}/${month}/${year} , ${hour}:${minutes}`;*/

const options = {
  hour: 'numeric',
  minute: 'numeric',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
};
labelDate.textContent = new Intl.DateTimeFormat(
  navigator.language,
  options
).format(nowDate);

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

/*const nowDate = new Date();
console.log(nowDate);

console.log(nowDate.getFullYear(), nowDate.getMonth());
console.log(Date.now());
*/
