(function( $ ) {

	$.fn.youtubeplayer = function( options ) {
	
		// beállítások eszközölése
		var settings = $.extend( {
			'width': 580,
			'height': 300,
			'aspectratio': true,
			'progressbarMinusWidth': 110,
			'progressbarMinusTop': 25
		}, options );
		
		/**
		 * A youtube video linkje
		 */
		var domain = '';
		
		/**
		 * A youtube video id-je
		 */
		var youtubeid = '';
		
		/**
		 * A YouTube api url-je
		 */
		var youtubeAPI = 'http://gdata.youtube.com/feeds/api/videos?v=2&alt=jsonc';
		
		/**
		 * A youtube-tól visszakapott adatok
		 */
		var data = null;
		
		/**
		 * A video aránya
		 */
		var ratio = 3/4;
		
		/**
		 * Az eredeti elem, amire később tudunk hivatkozni
		 */
		var sender = null;
		
		/**
		 * A lejátszó
		 */
		var player = null;
		
		// beállítjuk a gombokat
		$( '.youtube-button' ).live("click",function(){
			
			var youtubeid = $(this).attr('data-youtubeid');
			
			//console.log( 'Player button click: ' + youtubeid );
			
			// lekérdezzük a flash lejátszót
			player = document.getElementById('youtubeplayer-player-'+youtubeid);
			
			// a lejátszó állapota
			// ez igazából fordítva van a css miatt
			if( $( this ).hasClass('youtube-play') ){

				$( this ).removeClass('youtube-play').addClass('youtube-pause');
				
				player.playVideo();
				
				window.setInterval(function(){
					
					if( $("#youtube-play-" + youtubeid ).hasClass('youtube-pause') ){
						
						//console.log( 'progressbar: ' + youtubeid + ' time: ' + player.getCurrentTime() );
						time = document.getElementById('youtubeplayer-player-'+youtubeid).getCurrentTime();
						
						strtime = YoutubePlayerConvertMillisecondToTime( time );
						
						//console.log( time );
						//console.log( strtime );
						
						$('#youtube-progressbar-status-'+ youtubeid ).width(
							(( time / $('#youtubeplayer-' + youtubeid).attr('data-duration') )*100)+'%'	
						);
				
						
					}
						
					
				},500);
				
				
			} else {

				$( this ).removeClass('youtube-pause').addClass('youtube-play');

				player.pauseVideo();
					
				//window.clearInterval(interval);

				
			}
			
		}); // $( '#youtube-play-' + youtubeid ).click

		
		// végigszaladunk az elemeken
		return this.each(function() {
			
			sender = this;
		
			// Kihámozzuk az url-ből a video id-t
			domain = $(this).attr( 'data-youtube' );
			
			youtubeid = domain.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/user\/\S+|\/ytscreeningroom\?v=|\/sandalsResorts#\w\/\w\/.*\/))([^\/&]{10,12})/);
			
			// ha kiderül, hogy ez nem egy szabványos youtube link, akkor megyünk a következőre
			if( youtubeid == null ){
				
				return this;
				
			}else{

				youtubeid = youtubeid[1];
				
			}
			
			$(this).addClass( 'youtubeplayer youtubeplayer-' + youtubeid );
			$(this).attr( 'id','youtubeplayer-' + youtubeid );

			// Lekérdezzük a videó adatokat a YouTube.com-tól
			$.get( youtubeAPI,{ 'q':youtubeid },function(response){
				
				active_sender = sender;
				
				data = response.data;
				
				if( !data.totalItems ){
					
					// Ha a videó nem található
					return this;
					
				}
				
				//TODO: mi történnyen ha nem engedélyezett a beágyazás?
				// data.items[0].accessControl.embed != 'allowed'
				// Ez itt mi?
				// mostmár megvan minden adat és tuti biztos, hogy használható is a ka1pott értékek
				data = data.items[0];
				
				youtubeid = data.id;
				
				if( settings.aspectratio == true ){
					
					// video képarányainak ellenőrzése
					ratio = 9/16;
					if( data.aspectRatio != "widescreen" ){
						
						ratio = 3/4;
						
					}
					
					// magasság kiszámolása az adott videóhoz
					settings.height = Math.round( settings.width * ratio );
					
				}
				
				// több lejátszó esetén ne kavarodjanak össze a változó nevek
				var str = "";
				
				str += 'function eventListener_' + youtubeid +'(status){';
					
				
					//str += 'console.log( "'+ youtubeid + ' status: " + status );';
					
					str += 'if( status == 0 ){';
					
						str += '$( "#youtube-play-'+ youtubeid +'" ).removeClass("youtube-pause").addClass("youtube-play"); ';
						str += '$( "#youtube-image-'+ youtubeid +'" ).show(); ';
						str += '$( "#youtube-progressbar-status-'+ youtubeid + '" ).width("100%");';
						
					str += '}';
				
					// ha a videó lejátszása elindul, akkor tüntessük el a kezdőképet
					str += 'if( status == 1 ){';
						
						str += '$( "#youtube-image-'+ youtubeid +'" ).hide();';
						
					str += '}';
				
				
				str += '}';
				
				$('head').append('<script type="text/javascript">'+str+'</script>');
				
				//console.log(str);
				
				// beállítjuk a video hosszát
				$( '#youtubeplayer-' + youtubeid ).attr( 'data-duration', data.duration );

				$( '#youtubeplayer-' + youtubeid ).html(''+
						'<div class="youtubeplayer-wrapper" style="width: '+ settings.width +'px; height: '+ settings.height +'px">' +
							'<div id="youtube-play-'+ youtubeid +'" class="youtube-play youtube-button" data-youtubeid="'+ youtubeid +'">' +
							'</div>' +
							'<div id="youtube-progressbar-'+ youtubeid +'" class="youtube-progressbar" style="width: '+ (settings.width - settings.progressbarMinusWidth) +'px; top: '+ (settings.height-settings.progressbarMinusTop) +'px">' +
								'<div id="youtube-progressbar-status-'+ youtubeid +'" class="youtube-progressbar-status">' +
								'</div>' +
							'</div>' +
							'<div id="youtube-image-'+ youtubeid +'" class="youtube-image"style="background-image: url('+ data.thumbnail.hqDefault +'); width: '+ settings.width +'px; height: '+ settings.height +'px">' +
							'</div>'+
							'<object data-youtubeid="'+ youtubeid +'" id="youtubeplayer-player-'+ youtubeid +'" class="youtubeplayer-player" width="'+ settings.width +'" height="'+ settings.height +'" type="application/x-shockwave-flash" data="http://www.youtube.com/v/'+ youtubeid +'?autoplay=0&amp;enablejsapi=1&amp;gestures=0&amp;showinfo=0&amp;version=3&amp;playerapiid='+ youtubeid +'&amp;controls=0&amp;suggestedQuality=highres&amp;showsearch=0" style="visibility: visible; z-index: 1;">'+
								'<param name="allowScriptAccess" value="always">'+
								'<param name="allowFullScreen" value="true">'+
								'<param name="bgcolor" value="#ffffff">'+
								'<param name="wmode" value="opaque">'+
							'</object>' +
						'</div>');
				
			});
			
			
		});
		
	};

})( jQuery );

function onYouTubePlayerReady( playerID ){
		
	
	//console.log( 'onYoutubePlayerReady: ' + playerID );
	
	document.getElementById( 'youtubeplayer-player-' + playerID ).addEventListener( 'onStateChange', 'eventListener_' + playerID, true);

}

function YoutubePlayerConvertMillisecondToTime( sec ){
	
	x = sec;

	minutes = x % 60;
	x /= 60;
	hours = x % 24;
	
	str = Math.floor(minutes);
	
	if( minutes < 10 ){
		
		str = '0' + str;
		
	}
	
	if( Math.floor(hours) >= 0 ){
		
		str = Math.floor(hours) + ':' + str;
		
	}
	
	return str;
}