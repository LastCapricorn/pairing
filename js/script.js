"use strict";

document.addEventListener('DOMContentLoaded', () => {


  const settings = document.querySelectorAll('header img');
  const pomodoro = document.querySelectorAll('.pkt_digit');
  const controls = document.querySelectorAll('.control');
  const labels = document.querySelectorAll('#controls label');
  let isNotDefault = false;

  const timeOfDay = setInterval( () => {
    const clock = document.querySelectorAll(".clock.digit");
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    const weekDays = [["Sunday", "Sonntag"], ["Monday", "Montag"], ["Tuesday", "Dienstag"], ["Wednesday", "Mittwoch"], ["Thursday", "Donnerstag"], ["Friday", "Freitag"], ["Saturday", "Samstag"]];
    const monthNames = [["January", "Januar"], ["February", "Februar"], ["March", "März"], ["April", "April"], ["May", "Mai"], ["June", "Juni"], ["July", "Juli"], ["August", "August"], ["September", "September"], ["October", "Oktober"], ["November", "November"], ["December", "Dezember"]];
    const dateString = `${weekDays[now.getDay()][0]}, ${now.getDate()}. ${monthNames[now.getMonth()][0]} ${now.getFullYear()}`
    document.querySelector('.side1 p').textContent = dateString;

    clock[0].src = `image/digits/d${(hours - hours % 10) / 10}.png`;
    clock[1].src = `image/digits/d${hours % 10}.png`;
    clock[2].src = `image/digits/d${(minutes - minutes % 10) / 10}.png`;
    clock[3].src = `image/digits/d${minutes % 10}.png`;
    clock[4].src = `image/digits/d${(seconds-seconds % 10) / 10}.png`;
    clock[5].src = `image/digits/d${seconds % 10}.png`;
  }, 1000);

  function setTimes(ev) {
    ev.preventDefault();
    if (ev.type === 'click' && ev.button === 0 || ev.type === 'mousewheel' && ev.wheelDelta > 0) {
      if (ev.target.dataset.value < ev.target.dataset.max) {
        ev.target.dataset.value++;
      }
    } else if (ev.type === 'contextmenu' || ev.type === 'mousewheel' && ev.wheelDelta < 0) {
      if (ev.target.dataset.value > 0) {
        ev.target.dataset.value--;
      }
    }
    ev.target.src = `image/digits/d${ev.target.dataset.value}.png`;
    pomodoro[0].src = `image/digits/d${settings[0].dataset.value}.png`;
    pomodoro[1].src = `image/digits/d${settings[1].dataset.value}.png`;
    controls[2].classList.add('active');
    controls[2].addEventListener('click', reset);
    isNotDefault = true;
  }

  function reset(all = true) {
    if (all) {
      controls[2].removeEventListener('click', reset);
      controls[2].classList.remove('active');
      settings.forEach( (set) => {
        set.dataset.value = set.dataset.default;
        set.src = `image/digits/d${set.dataset.value}.png`;
      } );
      isNotDefault = false;
    }
    pomodoro[0].src = `image/digits/d${settings[0].dataset.value}.png`;
    pomodoro[1].src = `image/digits/d${settings[1].dataset.value}.png`;
    pomodoro[3].src = `image/digits/d0.png`;
    pomodoro[4].src = `image/digits/d0.png`;
  }

  function activateSettings() {
    settings.forEach( (setting) => setting.addEventListener('contextmenu', setTimes) );
    settings.forEach( (setting) => setting.addEventListener('click', setTimes) );
    settings.forEach( (setting) => setting.addEventListener('mousewheel', setTimes) );
    document.querySelector('header').classList.remove('off');
  }

  function deActivateSettings() {
    settings.forEach( (setting) => setting.removeEventListener('contextmenu', setTimes) );
    settings.forEach( (setting) => setting.removeEventListener('click', setTimes) );
    settings.forEach( (setting) => setting.removeEventListener('mousewheel', setTimes) );
    document.querySelector('header').classList.add('off');
  }

  function changeStatus() {
    controls[0].dataset.status === 'Start' ? controls[0].dataset.status = 'Pause' : controls[0].dataset.status = 'Start';
    labels[0].textContent = controls[0].dataset.status;
    controls[0].dataset.status === 'Start' ? document.querySelector('#start').innerHTML = '&#9205;' : document.querySelector('#start').innerHTML = '&#9208;';
  }

  function startPomodoro(ev) {
    deActivateSettings();
    if(isNotDefault) {
      controls[2].removeEventListener('click', reset);
      controls[2].classList.remove('active');
    }
    controls[1].addEventListener('click', stopPomodoro);
    controls[1].classList.add('active');
    changeStatus();
    activePomodoro();
  }

  function stopPomodoro() {
    clearInterval(countDown);
    activateSettings();
    controls[1].removeEventListener('click', stopPomodoro);
    controls[1].classList.remove('active');
    if (controls[0].dataset.status === 'Pause') changeStatus();
    if(isNotDefault) {
      controls[2].addEventListener('click', reset);
      controls[2].classList.add('active');
    }
    reset(false);
  }

  function activePomodoro() {

    document.querySelector('#cube').style.transform = 'rotateX(90deg)';

    const endTime = Date.now() + (parseInt(settings[0].dataset.value + settings[1].dataset.value) * 60 * 1000);

    const countDown = setInterval( () => {
      const timeRemaining = new Date(endTime - Date.now());
      const remMinHi = (timeRemaining.getMinutes() - timeRemaining.getMinutes() % 10) / 10;
      const remMinLo = timeRemaining.getMinutes() % 10;
      const remSecHi = (timeRemaining.getSeconds() - timeRemaining.getSeconds() % 10) / 10;
      const remSecLo = timeRemaining.getSeconds() % 10;
      pomodoro[0].src = `image/digits/d${remMinHi}.png`;
      pomodoro[1].src = `image/digits/d${remMinLo}.png`;
      pomodoro[3].src = `image/digits/d${remSecHi}.png`;
      pomodoro[4].src = `image/digits/d${remSecLo}.png`;
    }, 990 );

  };

  activateSettings();
  controls[0].addEventListener('click', startPomodoro);

});
