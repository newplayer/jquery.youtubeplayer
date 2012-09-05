(function( $ ) {

	$.fn.youtubeplayer = function( options ) {
	
		// beállítások eszközölése
		var settings = $.extend( {
			'width': 580,
			'height': 300,
			'aspectratio': true
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
		
		// végigszaladunk az elemeken
		return this.each(function() {
			
			sender = this;
		
			// Kihámozzuk az url-ből a video id-t
			domain = $(this).attr( 'data-youtube' );
			
			youtubeid = domain.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/user\/\S+|\/ytscreeningroom\?v=|\/sandalsResorts#\w\/\w\/.*\/))([^\/&]{10,12})/)
			
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
				
				$( '#youtubeplayer-' + youtubeid ).html(''+
					'<div class="youtubeplayer-wrapper" style="background-image: url(\'' + data.thumbnail.hqDefault + '\'); width: '+ settings.width +'px; height: '+ settings.height +'px">' +
						'<div id="youtube-play-'+ youtubeid +'" class="youtube-play">' +
						'</div>' +
						'<div id="youtube-progressbar-'+ youtubeid +'" class="youtube-progressbar">' +
						'</div>' +
						'<object id="youtubeplayer-player-'+ youtubeid +'" width="'+ settings.width +'" height="'+ settings.height +'" type="application/x-shockwave-flash" id="ytplayer-'+ youtubeid +'" data="http://www.youtube.com/v/'+ youtubeid +'?autoplay=0&amp;enablejsapi=1&amp;gestures=0&amp;rel=0&amp;showinfo=0&amp;version=3&amp;playerapiid='+ youtubeid +'&amp;controls=0" style="visibility: visible; z-index: 1;">'+
							'<param name="allowScriptAccess" value="always">'+
							'<param name="allowFullScreen" value="true">'+
							'<param name="bgcolor" value="#ffffff">'+
							'<param name="wmode" value="opaque">'+
						'</object>' +
					'</div>');
				
				// kimentjük a lejátszót egy változóba
				player = $( '#youtubeplayer-player-' + youtubeid ).flash().get();
				

				var initialized = false;
				
				// Creating a global event listening function for the video
				// (required by YouTube's player API):
				
				window[ 'eventListener_' + youtubeid ] = function(status){
					
					if(status==-1)	// video is loaded
					{
						if(!initialized)
						{
							// Listen for a click on the control button:
							
							//console.log( youtubeid );
							
							$( '#youtube-play-' + youtubeid ).click(function(){
								
								//console.log('click play');
								
								player = document.getElementById('youtubeplayer-player-'+youtubeid);
								
								//if(!elements.container.hasClass('playing')){
								if( $( this ).hasClass('play') ){
									
									// If the video is not currently playing, start it:

									$( this ).removeClass('play').addClass('pause');
									//elements.container.addClass('playing');
									player.pauseVideo();
									
									/*
									if(settings.progressBar){
										interval = window.setInterval(function(){
											elements.elapsed.width(
												((elements.player.getCurrentTime()/data.duration)*100)+'%'
											);
										},1000);
									}
									*/
									
								} else {
									
									// If the video is currently playing, pause it:
									
									//elements.control.removeClass('pause').addClass('play');
									$( this ).removeClass('pause').addClass('play');
									//elements.container.removeClass('playing');
									player.playVideo();
									
									/*
									if(settings.progressBar){
										window.clearInterval(interval);
									}
									*/
								}
							});
							
							initialized = true;
						}
						else{
							// This will happen if the user has clicked on the
							// YouTube logo and has been redirected to youtube.com

							if(elements.container.hasClass('playing'))
							{
								elements.control.click();
							}
						}
					}
					
					if(status==0){ // video has ended
						//elements.control.removeClass('pause').addClass('replay');
						//elements.container.removeClass('playing');
					}
				}

				
			});
			
			
		});
		
	};

})( jQuery );

function onYouTubePlayerReady( playerID ){
		
	console.log(playerID);
	
	document.getElementById('youtubeplayer-player-'+playerID).addEventListener('onStateChange','eventListener_'+playerID);

}