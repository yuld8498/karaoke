let playMusic = document.querySelector("#player");
let stopper = document.querySelector("#stopper");
let audio = document.getElementById("audio");
let slider = document.querySelector("#slider");
let duration = document.querySelector("#duration");
let currentTime = document.querySelector("#currentTime");
let lyricsTag = document.querySelector("#lyrics");
let subLyricsTag = document.querySelector("#sublyrics");

let lyricsList = [];
let IntervalRender;
let thisListLyrics = [];
let charList = [];
let subLyrics;
let thisLyrics;
let firstList = [];
let secondList = [];

class Lyrics {
  constructor(time, lyricsData) {
    this.time = time;
    this.lyricsData = lyricsData;
  }
}

class CharLyrics {
  constructor(time, char) {
    this.time = time;
    this.char = char;
  }
}

let xmlText = "";
fetch("lyrics.xml").then((resp) => {
  resp.text().then((xml) => {
    xmlText = xml;
    let parser = new DOMParser();
    let xmlDOM = parser.parseFromString(xmlText, "application/xml");
    let lyrics = xmlDOM.querySelectorAll("data");

    lyrics.forEach((lyricsXmlParam) => {
      for (let i = 0; i < lyricsXmlParam.children.length; i++) {
        let sizeParam =
          lyricsXmlParam.children[i].getElementsByTagName("i").length;
        let lyricsParam = new Lyrics();
        var lyricsChart = [];

        for (let j = 0; j < sizeParam; j++) {
          let chartLyric = new CharLyrics();

          chartLyric.time = lyricsXmlParam.children[i]
            .getElementsByTagName("i")
            [j].getAttribute("va");

          chartLyric.char =
            lyricsXmlParam.children[i].getElementsByTagName("i")[j].textContent;
          lyricsChart.push(chartLyric);
          charList.push(chartLyric);
        }

        lyricsParam.time = lyricsXmlParam.children[i]
          .getElementsByTagName("i")[0]
          .getAttribute("va");
        lyricsParam.lyricsData = lyricsChart;
        lyricsList.push(lyricsParam);
      }
    });
  });
});

playMusic.addEventListener("click", () => {
  audio.play();
  stopper.removeAttribute("hidden");
  playMusic.setAttribute("hidden", true);
});

stopper.addEventListener("click", () => {
  audio.pause();
  playMusic.removeAttribute("hidden");
  stopper.setAttribute("hidden", true);
});

const getElementIndexLyrics = (timer) => {
  firstList = [];
  secondList = [];
  for (let i = 0; i < lyricsList.length; i++) {
    if (
      i < lyricsList.length - 1 &&
      lyricsList[i].time < timer &&
      lyricsList[i + 1].time > timer
    ) {
      firstList = [];
      secondList = [];
      lyricsList[i].lyricsData.forEach((element) => {
        firstList.push(element);
      });
      lyricsList[i + 1].lyricsData.forEach((element) => {
        secondList.push(element);
      });
    }
    if (
      timer >
      Number(
        lyricsList[lyricsList.length - 1].lyricsData[
          lyricsList[lyricsList.length - 1].lyricsData.length - 1
        ].time
      )
    ) {
      firstList = [];
      secondList = [];
      lyricsList[i].lyricsData.forEach((element) => {
        firstList.push(element);
      });
      secondList.push(new Lyrics(audio.duration - 500, "..."));
    }
  }
};

const NumToTime = (num) => {
  let hours = Math.floor(num / (60 * 60));
  let minutes = Math.floor((num - hours * 60 * 60) / 60);
  let seconds = Math.ceil(num % 60);
  hours < 10 ? (hours = `0${hours}`) : hours;
  minutes < 10 ? (minutes = `0${minutes}`) : minutes;
  seconds < 10 ? (seconds = `0${seconds}`) : seconds;
  if (num >= 60 * 60) {
    return `${hours}:${minutes}:${seconds}`;
  }
  return `${minutes}:${seconds}`;
};

const getLyrics = (currTime) => {
  for (let i = 0; i < lyricsList.length; i++) {
    if (i < Number(lyricsList.length - 1)) {
        if (
        Number(lyricsList[i].time) < currTime &&
        Number(lyricsList[i + 1].time) > currTime
        ) {
        return lyricsList[i].lyricsData;
        }
        if (Number(lyricsList[i].time) > currTime) {
        return lyricsList[0].lyricsData;
        }
    } else {
      return lyricsList[lyricsList.length - 1].lyricsData;
    }
  }
};

const getSubLyrics = (currTime) => {
  for (let i = 0; i < lyricsList.length; i++) {
    if (i < Number(lyricsList.length - 1)) {
      if (
        Number(lyricsList[i].time) < currTime &&
        Number(lyricsList[i + 1].time) > currTime
      ) {
        return lyricsList[i + 1].lyricsData;
      }
      if (Number(lyricsList[i].time) > currTime) {
        return lyricsList[1].lyricsData;
      }
    } else {
      return [". ", ". ", "."];
    }
  }
};

const getChar = (currTime) => {
  for (let i = 0; i < charList.length; i++) {
    if (i < Number(charList.length - 1)) {
      if (
        Number(charList[i].time) < currTime.toFixed(2) &&
        Number(charList[i + 1].time) > currTime.toFixed(2)
      ) {
        return charList[i + 1];
      }
      if (Number(charList[i].time) > currTime.toFixed(2)) {
        return charList[0];
      }
    } else {
      return charList[charList.length - 1];
    }
  }
};

let handleCheckColor = setInterval(() => {
  let element = document.getElementById(`${audio.currentTime.toFixed(2)}lyricsTag`);
  element ? element.style.color = "red": "";
}, 3);

const renderLyrics = (lyrics, nextTime, tagName) => {
  let showLyrics = ``;
  let timeLine = "";
  thisListLyrics = [];

  for (let i = 0; i < lyrics.length; i++) {
    if (i + 1 < lyrics.length) {
      timeLine = Number(lyrics[i + 1].time) - Number(lyrics[i].time);
    } else {
      timeLine = +(Number(lyrics[i].time)+0.5) - Number(lyrics[i].time);
    }

    if (lyrics[i].char && tagName == lyricsTag  ) {
      for (let j = 0; j < lyrics[i].char.length; j++) {
        thisListLyrics.push(
          new CharLyrics(Number(lyrics[i].time), lyrics[i].char[j])
        );

        let timeId = Number(lyrics[i].time).toFixed(2);

        if (timeId < audio.currentTime) {
          let thisLyricsChar = `<span va='${Number(timeLine).toFixed(2)}' id='${(
            Number(timeId) +
            Number(timeLine / lyrics[i].char.length) * j
          ).toFixed(2)}lyricsTag' style="color:red">${lyrics[i].char[j]}</span>`;
          showLyrics += thisLyricsChar;

          let thisElement = document.getElementById(
            `${lyrics[i].char[j]}${timeId}`
          );
          if (thisElement) {
            thisElement.replaceWith(thisLyricsChar);
          }
        } else {
          showLyrics += `<span va='${Number(timeLine).toFixed(2)}' id='${(
            Number(timeId) +
            Number(timeLine / lyrics[i].char.length) * j
          ).toFixed(2)}lyricsTag'>${lyrics[i].char[j]}</span>`;
        }
      }
    }else{
        for (let j = 0; j < lyrics[i].char.length; j++) {
            thisListLyrics.push(
              new CharLyrics(Number(lyrics[i].time), lyrics[i].char[j])
            );
    
            let timeId = Number(lyrics[i].time).toFixed(2);
    
            if (timeId < audio.currentTime) {
              let thisLyricsChar = `<span va='${Number(timeLine).toFixed(2)}' id='${(
                Number(timeId) +
                Number(timeLine / lyrics[i].char.length) * j
              ).toFixed(2)}' style="color:red">${lyrics[i].char[j]}</span>`;
              showLyrics += thisLyricsChar;
    
              let thisElement = document.getElementById(
                `${lyrics[i].char[j]}${timeId}`
              );
              if (thisElement) {
                thisElement.replaceWith(thisLyricsChar);
              }
            } else {
              showLyrics += `<span va='${Number(timeLine).toFixed(2)}' id='${(
                Number(timeId) +
                Number(timeLine / lyrics[i].char.length) * j
              ).toFixed(2)}'>${lyrics[i].char[j]}</span>`;
            }
          }
    }
    tagName.innerHTML = showLyrics;
  }
};

let changeColorInt;
const handleChangeColor = (list, srdList, time) => {
  let timeOutChangeColor;
  for (let i = 0; i < list.length; i++) {
    if (
      i < list.length - 1 &&
      Number(list[i].time) < time &&
      Number(list[i + 1].time) > time
    ) {
      let delayTimeChange =
        Number(+list[i + 1].time - +list[i].time) / Number(list[i].char.length);

      for (let j = 0; j < list[i].char.length; j++) {
        let itemId = list[i].char[j] + Number(list[i].time).toFixed(2);
        let element = document.getElementById(itemId);
        element.style.color = "red";
      }
    } else if (time > Number(list[list.length - 1].time)) {
  
    }
  }
};

setInterval(() => {
  slider.value = audio.currentTime;
}, 1000);

audio.addEventListener("play", () => {

  IntervalRender = setInterval(() => {
    getElementIndexLyrics(audio.currentTime);
    currentTime.innerText = NumToTime(Math.ceil(audio.currentTime));
    for (let i = 0; i < lyricsList.length; i++) {
      thisLyrics = getLyrics(audio.currentTime);
      subLyrics = getSubLyrics(audio.currentTime);
      if (i < lyricsList.length - 1) {
        renderLyrics(thisLyrics, lyricsList[i + 1].time, lyricsTag);
        renderLyrics(subLyrics, lyricsList[i + 1].time, subLyricsTag);
        return;
      } else {
        renderLyrics(thisLyrics, lyricsList[i].time, lyricsTag);
        renderLyrics(subLyrics, lyricsList[i + 1].time, subLyricsTag);
        return;
      }
    }
    if (audio.ended) {
      playMusic.removeAttribute("hidden");
      stopper.setAttribute("hidden", true);
      audio.currentTime = 0;
      currentTime.innerText = NumToTime(Math.ceil(audio.currentTime));
      slider.value = audio.currentTime;
      clearInterval(changeColorInt);
      clearInterval(IntervalRender);
      clearInterval(handleCheckColor);
    }
  }, 1050);
});

slider.addEventListener("change", () => {
  if (audio.paused) {
    clearInterval(changeColorInt);
    clearInterval(IntervalRender);
  }
  getElementIndexLyrics(slider.value);
  audio.currentTime = slider.value;
  currentTime.innerText = NumToTime(Math.ceil(slider.value));
  for (let i = 0; i < lyricsList.length; i++) {
    let thisLyrics = getLyrics(audio.currentTime);
    subLyrics = getSubLyrics(audio.currentTime);
    if (i < lyricsList.length - 1) {
      renderLyrics(thisLyrics, lyricsList[i + 1].time, lyricsTag);
      renderLyrics(subLyrics, lyricsList[i + 1].time, subLyricsTag);
      return;
    } else {
      renderLyrics(thisLyrics, lyricsList[i].time, lyricsTag);
      renderLyrics(subLyrics, lyricsList[i + 1].time, subLyricsTag);
      return;
    }
  }

  if (audio.ended) {
    playMusic.removeAttribute("hidden");
    stopper.setAttribute("hidden", true);
    audio.currentTime = 0;
    currentTime.innerText = NumToTime(Math.ceil(audio.currentTime));
    slider.value = audio.currentTime;
    clearInterval(changeColorInt);
    clearInterval(IntervalRender);
  }
});

audio.addEventListener("pause", () => {
  if (audio.ended) {
    playMusic.removeAttribute("hidden");
    stopper.setAttribute("hidden", true);
    audio.currentTime = 0;
    currentTime.innerText = NumToTime(Math.ceil(audio.currentTime));
    slider.value = audio.currentTime;
    clearInterval(changeColorInt);
    clearInterval(IntervalRender);
    clearInterval(handleCheckColor);
  }
  clearInterval(IntervalRender);
});

window.onload = () => {
  duration.innerText = NumToTime(Math.ceil(audio.duration));
  currentTime.innerText = NumToTime(Math.ceil(audio.currentTime));
  slider.setAttribute("max", audio.duration);
};
