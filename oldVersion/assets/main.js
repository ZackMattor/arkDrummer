$(document).ready(init);

var drummer = null;

/* on page load we run the init function */
function init() {
  /* The first thing we have to do is make sure the browser supports the audio 
   * context... if it doesn't we should probably let the user know they need
   * to upgrade their browser */
  try {
    // Fix up for prefixing
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    audioContext = new AudioContext();
  }
  catch(e) {
    alert('Web Audio API is not supported in this browser');
  }

  var kitData = [[{name: 'Snare', filePath: 'assets/kit/CYCdh_Kurz01-Snr01.wav', image: 'snare.png'},
                 {name: 'Open High Hat', filePath: 'assets/kit/CYCdh_Kurz01-OpHat01.wav', image: 'hho.png'},
                 {name: 'Closed High Hat', filePath: 'assets/kit/CYCdh_Kurz01-ClHat.wav', image: 'hho.png'},
                 {name: 'Low Tom', filePath: 'assets/kit/CYCdh_Kurz01-Tom01.wav', image: 'hho.png'},
                 {name: 'Mid Tom', filePath: 'assets/kit/CYCdh_Kurz01-Tom02.wav', image: 'hho.png'},
                 {name: 'High Tom', filePath: 'assets/kit/CYCdh_Kurz01-Tom03.wav', image: 'hho.png'},
                 {name: 'Kick', filePath: 'assets/kit/CYCdh_Kurz01-Kick01.wav', image: 'hho.png'},]];

  drummer = new arkDrum(audioContext, kitData)

  loadCanvas();

  $('.drum-cell').click(setCellActive);
  $('#clear-button').click(clearFrames);
  $('#bpm-input').keyup(setBPM);
  frameTimer = setInterval(processFrame, 200);
}

var frameTimer;
var frames = 8;
var frameIndex = 0;
var kit = [{name: 'Snare', file: 'snare.wav', image: 'snare.png'},
           {name: 'Open High Hat', file: 'snare.wav', image: 'hho.png'},
           {name: 'Closed High Hat', file: 'snare.wav', image: 'hho.png'},
           {name: 'Low Tom', file: 'snare.wav', image: 'hho.png'},
           {name: 'Mid Tom', file: 'snare.wav', image: 'hho.png'},
           {name: 'High Tom', file: 'snare.wav', image: 'hho.png'},
           {name: 'Kick', file: 'snare.wav', image: 'hho.png'},];

function loadCanvas() {
  /* var i, j;

  var $drumCell = $('<div></div>').addClass('drum-cell');
  var $drumFrame = $('<div></div>').addClass('frame');

  for(i=0; i<frames; i++) {
    var $currentFrame = $drumFrame.clone();
    $('.drum-canvas').append($currentFrame);

    for(j=0; j<kit.length; j++) {
      $currentFrame.append($drumCell.clone()).show();
    }
  }

  $('.frame').css({'width': 637/frames-10+'px'});
  $('.drum-cell').css({'height': 637/frames-10+'px'}); */
}

function setCellActive() {
  $(this).toggleClass('active');
}

function processFrame() {
  $('.frame').removeClass('active');
  $('.frame').eq(frameIndex).addClass('active');


  $('.frame.active .drum-cell.active').each(function(i, e) {
    console.log(kit[$(e).index()].name + ": triggered");
  });

  frameIndex++;
  
  if(frameIndex == $('.frame').length) {
    frameIndex = 0;
  }
}

function clearFrames() {
  $('.drum-cell.active').removeClass('active');
}

function setBPM() {
  var bpm = parseInt($(this).val());
  var frameTime = 1/(bpm/60)*500;
  if(bpm) {
    clearInterval(frameTimer);
    frameTimer = setInterval(processFrame, frameTime < 20 ? 100 : frameTime)
  }
}

function arkDrum(context, kitsData, startBPM) {
  this.bpm = startBPM || 120;
  this.currentKit = null;
  this.kitsData = kitsData;
  this.sequenceFrames = 8;
  this.audioContext = context;
  this.sequences = this.blankSequences();
  this.setActiveKit(0);

  //init the GUI and set up callback events
  this.GUI = new arkDrumGUI();
  this.GUI.onSequenceSelect = this.setSequence; 
  this.GUI.initSequences(this.sequences);
  this.GUI.initSequencer(this.kitsData[this.currentKit], this.sequenceFrames);
}

arkDrum.prototype.blankSequences = function() {
  return [{name: "seq1"}, {name: "seq2"}]
}

arkDrum.prototype.setSequence = function(sequence) {
  console.log('arkDrum: Setting Sequence to - ' + sequence);
}

arkDrum.prototype.setActiveKit = function(index) {
  this.currentKit = index;
  this.loadActiveKit();
}

arkDrum.prototype.loadActiveKit = function() {
  console.log("arkDrum: loadActiveKit()");
  _this = this;

  loader = new kitLoader(this.audioContext, this.kitsData[this.currentKit], function(bufferList) {
    // We need to load the buffers into audio context so we can start playing them
    for(var i = 0; i < bufferList.length; i++) {
      _this.kitsData[_this.currentKit][i].buffer = bufferList[i];
    }
  },
  function(errMsg) {
    console.log("#From kitLoader.onErr -- " + errMsg); 
  });

  loader.load();
}

arkDrum.prototype.playHit = function(id) {
  var source = this.audioContext.createBufferSource();
  source.connect(this.audioContext.destination);
  source.buffer = this.kitsData[_this.currentKit][id].buffer;
  source.start(0);
}


/***************/
/** GUI class **/
/***************/
function arkDrumGUI() {
}

/* Events */
arkDrumGUI.prototype.onSequenceSelect = null; 

arkDrumGUI.prototype.initSequences = function(sequences) {
  $sequenceHolder = $('#sequences');
  for(var i = 0; i < sequences.length; i++) {
    $sequenceItem = $('<div></div>').addClass('sequenceItem').append(sequences[i].name);
    _this = this;

    //need to use an anon function to preserve self
    $sequenceItem.click(function(){
      $('#sequences .sequenceItem').removeClass('active');
      $(this).addClass('active');
      console.log('Emiting event: onSequenceSelect() -> ' + $(this).index());
      if(_this.onSequenceSelect) _this.onSequenceSelect($(this).index());
    });

    $sequenceHolder.append($sequenceItem);
  }
}

arkDrumGUI.prototype.initSequencer = function(kit, frames) {
  var i, j;

  var $drumCell = $('<div></div>').addClass('drum-cell');
  var $drumFrame = $('<div></div>').addClass('frame');

  for(i=0; i<frames; i++) {
    var $currentFrame = $drumFrame.clone();
    $('.drum-canvas').append($currentFrame);

    for(j=0; j<kit.length; j++) {
      $currentFrame.append($drumCell.clone()).show();
    }
  }

  $('.frame').css({'width': 637/frames-10+'px'});
  $('.drum-cell').css({'height': 637/frames-10+'px'});
}

/*********************/
/** kitLoader class **/
/*********************/
function kitLoader(context, kitData, success, error) {
  this.context = context;
  this.kitData = kitData;
  this.onload = success;
  this.onError = error;
  this.bufferList = new Array();
  this.loadCount = 0;
}

kitLoader.prototype.loadBuffer = function(url, index) {
  // Load buffer asynchronously
  var request = new XMLHttpRequest();
  request.open("GET", url, true);
  request.responseType = "arraybuffer";

  var loader = this;

  request.onload = function() {
    // Asynchronously decode the audio file data in request.response
    loader.context.decodeAudioData(
      request.response,
      function(buffer) {
        if (!buffer) {
          loader.onError('error decoding file data: ' + url);
          return;
        }
        loader.bufferList[index] = buffer;
        if (++loader.loadCount == loader.kitData.length)
          loader.onload(loader.bufferList);
      },
      function(error) {
        console.error('decodeAudioData error', error);
      }
    );
  }

  request.onerror = function() {
    this.onError('kitLoader: XHR error (can not open path?)');
  }

  request.send();
}

kitLoader.prototype.load = function() {
  for (var i = 0; i < this.kitData.length; ++i) {
    this.loadBuffer(this.kitData[i].filePath, i);
  }
}

/*********************/
/*********************/
/*********************/
