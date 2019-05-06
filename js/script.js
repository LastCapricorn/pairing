"use strict";

document.addEventListener('DOMContentLoaded', () => {

  const convert = (value) => value.toString().length < 2 ? ('0' + value.toString()).split('') : value.toString().split('');

  const timeOfDay = setInterval( () => {

    const weekDays = ["Sun", "Mon", "Tues", "Wednes", "Thurs", "Fri", "Satur"];

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const clock = document.querySelectorAll(".clock.digit");
    const now = new Date();
    const hours = convert(now.getHours());
    const minutes = convert(now.getMinutes());
    const seconds = convert(now.getSeconds());

    const dateString = [`${weekDays[now.getDay()]}day,`, `${now.getDate()}. ${monthNames[now.getMonth()]}`, `${now.getFullYear()}`];

    for (let i = 0; i < 3; i++) {
      document.querySelectorAll('.side4 p')[i].textContent = dateString[i];
    }

    clock[0].src = `image/digits/d${hours[0]}.png`;
    clock[1].src = `image/digits/d${hours[1]}.png`;
    clock[2].src = `image/digits/d${minutes[0]}.png`;
    clock[3].src = `image/digits/d${minutes[1]}.png`;
    clock[4].src = `image/digits/d${seconds[0]}.png`;
    clock[5].src = `image/digits/d${seconds[1]}.png`;

  }, 1000);

  const toDigits = (value) => {
    return [
      parseInt((value / 60) / 10),
      parseInt((value / 60) % 10),
      parseInt((value % 60) / 10),
      parseInt((value % 60) % 10)
    ];
  };

  const times = new class {
    defaults = {
      pomo : 25 * 60,
      short : 5 * 60,
      long : 15 * 60
    };
    max = {
      pomo : 90 * 60,
      short : 30 * 60,
      long : 60 * 60
    };
    sets = {...this.defaults};
    currents = {...this.defaults};
  };

  const text = {
    pomo : ["Session","Time","It's","Development","For"],
    short : ["Short Break","Have","Let's","Coffee","Some"],
    long : ["Long Break","Time","Isn't it","Lunch??","For"]
  };

  const sequence = ["pomo", "short", "pomo", "short", "pomo", "short", "pomo", "long"];

  const settings = document.querySelectorAll('.settings');
  const pomoDigits = document.querySelectorAll('.pomoDigits');
  const controls = document.querySelectorAll('.control');
  let isDefault = true;
  let isRunning = false;
  let isPaused = false;
  let pomoCount = 0;
  let countDown = null;

  function activateSettings() {
    settings.forEach( (setting) => {
      setting.addEventListener('contextmenu', setTimes);
      setting.addEventListener('click', setTimes);
      setting.addEventListener('mousewheel', setTimes);
    } );
    document.querySelector('header').classList.remove('off');
  }

  function deActivateSettings() {
    settings.forEach( (setting) => {
    setting.removeEventListener('contextmenu', setTimes);
    setting.removeEventListener('click', setTimes);
    setting.removeEventListener('mousewheel', setTimes);
    } );
    document.querySelector('header').classList.add('off');
  }

  function setTimerDisplay(name) {
    let digits = toDigits(times.currents[name]);
    for (let i = 0; i < 4; i++) {
      pomoDigits[i].src = `image/digits/d${digits[i]}.png`;
    }
  }

  function changeText() {
    document.querySelector('#timerName').textContent = text[sequence[pomoCount]][0];
    for (let i = 0; i < 4; i++) {
      document.querySelectorAll('.text')[i].textContent = text[sequence[pomoCount]][i + 1];
    }
  }

  function setTimes(ev) {

    ev.preventDefault();
    const target = ev.currentTarget.id;

    if (ev.type === 'click' && ev.button === 0 || ev.type === 'mousewheel' && ev.wheelDelta > 0) {
      if (times.sets[target] < times.max[target]) {
        times.sets[target] += 1 * 60;
      }
    } else if (ev.type === 'contextmenu' || ev.type === 'mousewheel' && ev.wheelDelta < 0) {
      if (times.sets[target] > 1 * 60) {
        times.sets[target] -= 1 * 60;
      }
    }

    document.querySelectorAll(`#${target} img`)[0].src = `image/digits/d${toDigits(times.sets[target])[0]}.png`;
    document.querySelectorAll(`#${target} img`)[1].src = `image/digits/d${toDigits(times.sets[target])[1]}.png`;

    times.currents = {...times.sets};
    setTimerDisplay('pomo');

    isDefault = false;
    controls[2].classList.add('active');
    controls[2].addEventListener('click', reset);

  }

  function reset(all = true) {

    if (all) {
      times.sets = {...times.defaults};

      settings.forEach( (set) => {
        set.querySelectorAll('img')[0].src = `image/digits/d${toDigits(times.sets[set.id])[0]}.png`;
        set.querySelectorAll('img')[1].src = `image/digits/d${toDigits(times.sets[set.id])[1]}.png`;
      } );

      isDefault = true;
      controls[2].classList.remove('active');
      controls[2].removeEventListener('click', reset);
    }

    isRunning = false;
    isPaused = false;
    pomoCount = 0;
    times.currents = {...times.sets};
    changeText();
    setTimerDisplay('pomo');

  }

  function changeStatus() {
    controls[0].dataset.status = isRunning ? isPaused ? 'Continue' : 'Pause' : 'Start';
    document.querySelector('#start').innerHTML = isRunning ? isPaused ? '&#9205;' : '&#9208;' : '&#9205';
    document.querySelector('#start_text').textContent = controls[0].dataset.status;
  }

  function pomodoro() {
    isRunning ? isPaused ? continuePomo() : pausePomo() : startPomo();
  }

  function startPomo() {

    deActivateSettings();

    if(!isDefault) {
      controls[2].removeEventListener('click', reset);
      controls[2].classList.remove('active');
    }

    controls[1].addEventListener('click', stopPomo);
    controls[1].classList.add('active');

    isRunning = true;
    changeStatus();
    document.querySelector('#cube').classList.add('animated');
    continuePomo();

  }

  function continuePomo() {

    if (isPaused) {
      isPaused = false;
      changeStatus();
    }

    if (times.currents[sequence[pomoCount]] <= 0) {
      clearInterval(countDown);
      times.currents = {...times.sets};
      pomoCount++;
    };

    if (pomoCount <= 7) {
      setTimerDisplay(sequence[pomoCount]);
      changeText();
      countDown = setInterval( () => {
        if (times.currents[sequence[pomoCount]] > 0) {
          times.currents[sequence[pomoCount]]--;
          setTimerDisplay(sequence[pomoCount]);
        } else {
          clearInterval(countDown);
          continuePomo();
        }
      }, 1000);
    } else {
      times.currents = {...times.sets};
      stopPomo();
    }

  };

  function pausePomo() {
    clearInterval(countDown);
    isPaused = true;
    changeStatus();
  }

  function stopPomo() {
    clearInterval(countDown);
    reset(false);
    changeStatus();
    document.querySelector('#cube').classList.remove('animated');
    activateSettings();
    controls[1].removeEventListener('click', stopPomo);
    controls[1].classList.remove('active');
    if(!isDefault) {
      controls[2].addEventListener('click', reset);
      controls[2].classList.add('active');
    }
  }

  activateSettings();
  controls[0].addEventListener('click', pomodoro);

});
