// Adapted from https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Asynchronous/Timeouts_and_intervals

window.onload = function () {
  const smile = document.querySelector('div');
  let rotateCount = 0;
  let startTime = null;

  function draw(timestamp) {
    if (!startTime) {
      startTime = timestamp;
     }

    rotateCount = (timestamp - startTime) / 3;
    rotateCount %= 360;

    smile.style.transform = `rotate(${rotateCount}deg)`;

    requestAnimationFrame(draw);
  }

  draw();
}