function init_ui() {
  var format;
  var formats = {
    mp3: { mime: "audio/mpeg",  ext: "mp3"},
    wav: { mime: "audio/x-wav", ext: "wav"}
  };

  var audio_capability_check;
  for( format in formats ) {
    format = formats[format];

    var audioTagSupport = !!((audio_capability_check = document.createElement('audio')).canPlayType);
    format.canPlayTag = audioTagSupport ? audio_capability_check.canPlayType(format.mime) : "undefined";
    if( format.canPlayTag ) {
      $("#buttons a audio").each(
        function() {
          $(this).parent().click( function() {
            var a = $("audio", this);
            a[0].play();
            var slug = $(this).attr( "id" );
            window.history.pushState( slug, slug, "#" + slug );
          });
        }
      );
      if( window.location.hash )
        play_on_load( window.location.hash.replace( /#/, '' ));
      return;
    }

  }
  alert( "You're using a web browser that doesn't support audio. Try Chrome, Safari, or Firefox." );
}

function play_on_load(sound) {
  if( ! sound ) return;
  // FIXME: handle concurrency: https://stackoverflow.com/questions/28579701/check-if-audio-is-playing-without-html5-tag
  var audio_div_ref = $('#' + sound + ' audio');
  audio_div_ref[0].play();
  return;
}

init_ui();
