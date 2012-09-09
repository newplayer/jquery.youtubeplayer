(function( $ ) {

	$.fn.youtubeplayer = function( options ) {
	
		// beállítások eszközölése
		var settings = $.extend( {
			'width': 580,
			'height': 300,
			'aspectratio': true,
			'progressbarMinusWidth': 210,
			'progressbarMinusTop': 25,
			'quality': 'hd720'
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
				player.setPlaybackQuality(settings.quality);
				
				window.setInterval(function(){
					
					if( $("#youtube-play-" + youtubeid ).hasClass('youtube-pause') ){
						
						time = document.getElementById('youtubeplayer-player-'+youtubeid).getCurrentTime();
						
						strtime = YoutubePlayerConvertMillisecondToTime( time );
						
						$('#youtube-progressbar-bubble-time-'+ youtubeid ).html( strtime );
						
						$('#youtube-progressbar-status-'+ youtubeid ).width(
							(( time / $('#youtubeplayer-' + youtubeid).attr('data-duration') )*100)+'%'	
						);
						
						var p = $( '#youtube-progressbar-status-'+ youtubeid ).offset();
						
						$('#youtube-progressbar-bubble-'+ youtubeid).css('left', p.left + $('#youtube-progressbar-status-'+ youtubeid ).width() - ( $('#youtube-progressbar-bubble-'+ youtubeid).width() / 2 ) - 8 );
				
						
					}
						
					
				},500);
				
				
			} else {

				$( this ).removeClass('youtube-pause').addClass('youtube-play');

				player.pauseVideo();
					
				//window.clearInterval(interval);

				
			}
			
		}); // $( '#youtube-play-' + youtubeid ).click
		
		
		// videóba csavaráshoz
		$('.youtube-progressbar').live('click',function(e){
			
				var youtubeid = $(this).attr('data-youtubeid');
		        
		        var videoLength = $('#youtubeplayer-' + youtubeid).attr('data-duration');
		        
		        var barLength = $('#youtube-progressbar-'+ youtubeid ).width();
		        
		        var clickPosition = e.pageX - $(this).offset().left;	
		        
		        var barPercent = clickPosition / barLength * 100;
		        
		        var time = videoLength / 100 * barPercent;
		        
		        document.getElementById('youtubeplayer-player-'+youtubeid).seekTo(time); 
		        
		});

		
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
				
				//console.log( data );
				
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
							'<div id="youtube-progressbar-bubble-'+ youtubeid +'" class="youtube-progressbar-bubble">' +
								'<div id="youtube-progressbar-bubble-time-'+ youtubeid +'"  class="youtube-progressbar-bubble-time">' +
									'00:00' +
								'</div>' +
							'</div>' +
							'<div id="youtube-progressbar-'+ youtubeid +'" data-youtubeid="'+ youtubeid +'" class="youtube-progressbar" style="width: '+ (settings.width - settings.progressbarMinusWidth) +'px; top: '+ (settings.height-settings.progressbarMinusTop) +'px">' +
								'<div id="youtube-progressbar-status-'+ youtubeid +'" class="youtube-progressbar-status">' +
								'</div>' +
							'</div>' +
							'<div id="youtube-image-'+ youtubeid +'" class="youtube-image"style="background-image: url('+ data.thumbnail.hqDefault +'); width: '+ settings.width +'px; height: '+ settings.height +'px">' +
							'</div>'+
							'<object data-youtubeid="'+ youtubeid +'" id="youtubeplayer-player-'+ youtubeid +'" class="youtubeplayer-player" width="'+ settings.width +'" height="'+ settings.height +'" type="application/x-shockwave-flash" data="http://www.youtube.com/apiplayer?video_id='+ youtubeid +'&amp;autoplay=0&amp;enablejsapi=1&amp;disablekb=1&amp;showinfo=0&amp;version=3&amp;playerapiid='+ youtubeid +'&amp;controls=0&amp;suggestedQuality=highres&amp;showsearch=0&amp;modestbranding=0" style="visibility: visible; z-index: 1;">'+
								'<param name="allowScriptAccess" value="always">'+
								'<param name="allowFullScreen" value="true">'+
								'<param name="bgcolor" value="#ffffff">'+
								'<param name="wmode" value="opaque">'+
							'</object>' +
						'</div>');
				
				/*
				 * 
				 *  +
						'<div class="">' +
							'<a href="http://youtu.be/'+ youtubeid +'">' +
								'http://youtu.be/'+ youtubeid +
							'</a>' +
						'</div>'
				 * 
				 */
				
				// méretek beállítása
				
				//progressbar bubble
				$('#youtube-progressbar-bubble-'+ youtubeid).css('top', settings.height-settings.progressbarMinusTop - $('#youtube-progressbar-bubble-'+ youtubeid).outerHeight() - 2 );
				
				var p = $( '#youtube-progressbar-status-'+ youtubeid ).offset();
				
				$('#youtube-progressbar-bubble-'+ youtubeid).css('left', p.left - ( $('#youtube-progressbar-bubble-'+ youtubeid).width() / 2 ) - 8 );
				
			});
			
			
		});
		
	};

})( jQuery );

function onYouTubePlayerReady( playerID ){
		
	
	//console.log( 'onYoutubePlayerReady: ' + playerID );
	
	document.getElementById( 'youtubeplayer-player-' + playerID ).addEventListener( 'onStateChange', 'eventListener_' + playerID, true);

}

function YoutubePlayerConvertMillisecondToTime( secs ){
	
    var hours = Math.floor(secs / (60 * 60));
    
    var divisor_for_minutes = secs % (60 * 60);
    var minutes = Math.floor(divisor_for_minutes / 60);
 
    var divisor_for_seconds = divisor_for_minutes % 60;
    var seconds = Math.ceil(divisor_for_seconds);
    
	if( seconds < 10 ){
		
		str = '0' + seconds;
		
	}else{
		
		str = seconds;
		
	}
	
	if( minutes>0 ){
		
		if( minutes< 10 ){
			
			str = '0' + minutes + ':' + str;
			
		}else{
			
			str = minutes + ':' + str;
			
		}
		
	}else{
		
		str = '00:' + str;
		
	}
	
	if( hours > 0 ){
		
		str = hours + ':' + str;
		
	}
	
	return str;
}