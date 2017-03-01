"use strict";
$(document).ready(function(){

$(document).ajaxError(function(event, jqxhr, settings, thrownError){
    //console.log(jqxhr);
    noty({
        text        : jqxhr.status + ' ' + jqxhr.statusText,
        type        : 'error',
        timeout     : 700,
        dismissQueue: true,
        closeWith: ['click'],
        layout      : 'topLeft',
        theme       : 'relax',
        animation: {
            open: {height: 'toggle'},
            close: {height: 'toggle'},
            easing: 'swing',
            speed: 500
        }
    });
});

//positions
    var shipx = 400;
    var shipy = 430;

    //constants
    const enemyrowcnt = 11;
    const firew = 65;
    const fireh = 63;
    const beamstep = 15;
    const shipstep = 7;
    const spiderw = 64;
    const spiderh = 64;
    const explw = 100;
    const explh = 85;
    const enemyx = 45;
    const enemyy = 130;
    const scoreboxx = 640;
    const scoreboxy = 20;
    const scoreboxw = 130;
    const scoreboxh = 75;
    const scorelbx = scoreboxx + 15;
    const scorelby = scoreboxy + 22;
    const scorevlx = scoreboxx + 75; 
    const killedlby = scoreboxy + 42;
    const leftlby = scoreboxy + 62;

	//const svcpath = "http://localhost:52606/api/"
	const svcpath = "http://spacespiderssvc01.azurewebsites.net/api/"
    const statusSvc = svcpath + "GameStatus/";
	const colorConfigSvc = svcpath + "ColorConfig/"
	const scoreConfigSvc = svcpath + "ScoreConfig/"

    //refresh rates
    const explosionrr = 25;

    var gameId;

    //scoring
    var score = 0;
    var enemyvalue = 100;
    var missvalue = 50;
    var killed = 0;
    var level = 0;

	//intervals
    var leftInterval;
    var rightInterval;
    var statusInterval;
	var configInterval;

    //images
    var space = new Image();
    var ship = new Image();
    var spiderimg = new Image();
    var fire = new Image();
    var explosionimg = new Image();
    
    //img sources
    ship.src = "img/shipsm.png";
    spiderimg.src = "img/spider-blue.png";
    space.src = "img/galaxy.png";
    fire.src = "img/fire.png";
    explosionimg.src = "img/explosion.png";
	
	//colors
	var beamColor = "red";
        
    //fx
    var boomsound = new Audio();
    boomsound.src = "fx/boom.wav";
    boomsound.volume = .5; 

    //loaded flags
    var spaceloaded = false;

    const INIT = 10;
    const PLAYING = 30;
    const GETID = 15;
    const LOADGAME = 20;

    var gamestatus = INIT;
    
    var log = function(msg){
        $("#log").prepend(new Date() + msg + "</br>")
    }

	var spiders = [];

	
    //check if ID exists
    var query = window.location.search.substring(1);
    var values = query.split("=");
    log("Getting ID from URL");

    if(values[1]){
        gameId = values[1];
        gamestatus = LOADGAME;
        $("#gameid").text(gameId);

        log("Searching form game on server");
        $.ajax({
            url: statusSvc + gameId,
            type: 'GET'
        }).done(function(status){
            if(status){
				log(status);
				var savedStatus = JSON.parse(status);
				score = savedStatus.score;
				level = savedStatus.level;
				killed = savedStatus.killed;
				spiders = [];
				for(var svspider in savedStatus.spiders){
					//console.log(savedStatus.spiders[svspider].x);
					spiders.push(new Spider(savedStatus.spiders[svspider].x,savedStatus.spiders[svspider].y));
				}
            }else{
				levelStart(level);
			}
			gamestatus = PLAYING;
        }).fail(function(){
			log("No game found, starting new one");
			gamestatus = GETID;
			getGameId();
		});  
    }

	var configInterval = setInterval(function(){
		if(gamestatus == PLAYING){
			$.get(colorConfigSvc)
			.done(function(r){ 
				spiderimg.src = "img/spider-" + r.spiderColor + ".png";
				beamColor = r.beamColor;
			});
			
			$.get(scoreConfigSvc)
			.done(function(r){ 
				enemyvalue = r.hitScore;
				missvalue = r.missScore;

			}).fail(function(){

            });
			

			
		}
	}, 1000);


    statusInterval = setInterval(function(){
        if(gamestatus == PLAYING){
			$.ajax({
			  type: "POST",
			  url: statusSvc + gameId,
			  data: {"": JSON.stringify(
                    {
                        spiders: spiders,
                        score: score,
                        killed: killed,
                        level: level,
					})},
			}
            ).done(function(){
                //log("Game status saved");
            }).fail(function(e){
                log("Save game status failed " + e);
            });
        }
    }, 1000);


    var canvas = document.getElementById("canvas");
    var context = canvas.getContext("2d");
    context.fillStyle = "red";
    context.fillRect(0, 0, 500, 300);

    

    //graphics
    var drawLine = function (color, cap, x0,y0,x1,y1){
        context.strokeStyle = color;
        context.lineWidth = 5;
        context.lineCap = cap;
        context.beginPath();
        context.moveTo(x0, y0);
        context.lineTo(x1,y1 -10);
        context.stroke();
        context.closePath();
    }

    space.onload = function(){
        context.drawImage(space, 0, 0);
        spaceloaded = true;
    }

    var drawScreen = function(fire, fw, fh, fs){
        setInterval(function(){

            if(spaceloaded) context.drawImage(space, 0, 0);

            switch(gamestatus){
                case INIT:
                    context.fillStyle = "lightslategray";
                    context.font = "normal lighter 20px monospace";
                    context.fillText("Press enter to start ", 200,300);
                break;
                    case INIT:
                    context.fillStyle = "lightslategray";
                    context.font = "normal lighter 20px monospace";
                    context.fillText("Getting ID", 200,300);
                break;
                case LOADGAME:
                    context.fillStyle = "lightslategray";
                    context.font = "normal lighter 20px monospace";
                    context.fillText("Loading game...", 200,300);
                break;
                case PLAYING:
                    fs++;
                    if(fs == 4){
                        fs = 0;
                    }
                    
                    //ship
                    context.drawImage(ship, shipx, shipy);
                    context.drawImage(fire, fw * fs, 0, fw,fh, shipx + 12, shipy + 111, fw, fh);  

                    //spiders
                    for(var spideri = 0; spideri < spiders.length; spideri++){
                        spiders[spideri].draw();
                    }

                    //score
                    context.strokeStyle = "mediumaquamarine";
                    context.lineWidth = 2;
                    context.strokeRect(scoreboxx,scoreboxy, scoreboxw, scoreboxh);
                    context.font = "normal lighter 15px monospace";
                    context.fillStyle = "steelblue";
                    context.fillText("Score", scorelbx,scorelby);
                    context.fillText("Killed", scorelbx,killedlby);
                    context.fillText("Left", scorelbx,leftlby);
                    context.fillStyle = "mediumslateblue";
                    context.fillText(score, scorevlx,scorelby);
                    context.fillText(killed, scorevlx,killedlby);
                    context.fillText(spiders.length, scorevlx,leftlby);
                    context.fillStyle = "lightslategray";
                    context.font = "normal lighter 20px monospace";
                    context.fillText("Level " + level, 40,42);
                break;
            }

        }, 100);
    }

    ship.onload = function(){
        context.drawImage(ship, shipx, shipy);
        
        fire.onload = function(){
            drawScreen(fire, firew, fireh, 0);
        }
    }

    //Game functionality
    function updateHitScore(x,y){
        killed++;
        score += enemyvalue;
        showEventScore("+" + enemyvalue, x, y + 25);
    }
    function updateMissScore(x,y){
        score -= missvalue;
        showEventScore("-" + missvalue, x, 25);

    }
    function showEventScore(text,x,y){
        var int = 0;
        var interval = setInterval(function(){
            context.font = "normal lighter 15px monospace";
            context.fillStyle = int % 3 == 0 ? "goldenrod" : "brown";
            context.fillText(text,x,y);
            int++;
            if(int > 20){
                clearInterval(interval);
            }
        }, 50);
    }                

    var levelStart = function(newlevel){
		log("Starting level " + newlevel);
        if(newlevel > 2){
            canvas.height += spiderh;
            shipy += spiderh;
        }
        setTimeout(function(){
            for(var i = 0; i <= newlevel; i++){
                for(var spidercnt = 0; spidercnt < enemyrowcnt; spidercnt ++){
					spiders.push(new Spider(enemyx + spidercnt * spiderw,enemyy + spiderh * i));
                }
            }
        },500);
        

    }
    

    function Beam(){
        var self = this;
        var interval;
        this.x = shipx + 42;
        this.y = shipy;
        this.shoot = function(){  
            var i = 0;   
            /*var beamsound = new Audio();
            beamsound.src = "fx/beam.wav";
            beamsound.volume = .5;
            beamsound.play();    */
            interval = setInterval(function(){
                drawLine(beamColor, 5, self.x, self.y +  beamstep, self.x, self.y);
                var hit = self.hitTest();
                
                if(self.y < 0 ){
                    clearInterval(interval);
                    updateMissScore(self.x, self.y);
                }else if(hit >= 0){
                    clearInterval(interval);
                    spiders[hit].die(hit);
                    if(spiders.length == 0){
                        levelStart(++level);
                    }
                    //boomsound.play();
                }
                self.y -= beamstep;
            }, 50);
        }
        this.hitTest = function(){
            for(var spideri = 0; spideri < spiders.length; spideri++){
                    var shrink = 10;
                    var hitx1 = spiders[spideri].x + shrink;
                    var hity1 = spiders[spideri].y + shrink;
                    var hitszx = spiderw;
                    var hitszy = spiderh;
                    var hitx2 = spiders[spideri].x + hitszx - shrink * 2;
                    var hity2 = spiders[spideri].y + spiderh - shrink * 2;
                    //debug hitTest
                    //context.strokeStyle = spideri % 2 == 0 ? "green" : "red";
                    //context.strokeRect(hitx1, hity1, hitszx-shrink * 2, hitszy-shrink*2);

                if((self.x >= hitx1 && self.x <= hitx2)
                    && self.y >= hity1 && self.y <= hity2){
                    //console.log("Colission");
                    return spideri;
                }
            }
            return -1;
        }
    }


    function Spider(x,y){
        var self = this;
        const xvariation = 10;
        this.x = x;
        this.y = y;
        this.step = 0;
        this.shift = 5;
        var direction = 1; 
        this.draw = function(){
			//log("Drawing spider " + self.x + "," + self.y);
            if(this.step >  9){
                this.step = 0;
            }
            context.drawImage(spiderimg, spiderw * this.step++, spiderh * 2, spiderw, spiderh, this.x, this.y, spiderw, spiderh);
        }
        this.die = function(i){
            var explosion = new Explosion(this.x, this.y);
            spiders.splice(i, 1);
            explosion.draw();     
            updateHitScore(this.x, this.y);                   
        }		
    }


    function Explosion(x,y){
        var self = this;
        this.x = x;
        this.y = y;
        this.step = 2;
        this.draw = function(){
            var interval = setInterval(function(){
                //console.log("Explosion");
                context.drawImage(explosionimg, explw * self.step++, 0, explw, explh, self.x, self.y, explw, explh);
                if(self.step > 13){
                    clearInterval(interval);
                }
            }, explosionrr);
        }

    }
    

    var getGameId = function(){
		log("getting game id")
        $.ajax({
            url: statusSvc,
            type: 'PUT'
        }).done(function(id){
			log("Game ID " + id);
            window.location.search = '?id=' + id;
        }).fail(function(e){
			//console.log(e);
		});  
    }

    //controls
    $(window).keydown(function(e){
        //console.log(e.which);
        var key = e.which;
        
        switch(gamestatus){
            case INIT:
                if(key == 13){
                    gamestatus = GETID;
                    getGameId();
                }
            break;
            case PLAYING:
                //left
                if(key == 37 && shipx >0){
                    clearInterval(leftInterval);
                    clearInterval(rightInterval);

                    leftInterval = setInterval(
                        function(){
                            shipx -= (shipstep * (level/2 + 1));
                            if(shipx < 10){
                                clearInterval(leftInterval);
                            }
                        }
                        , 20
                    )
                }
                //right
                if(key ==39 && shipx <= 700){
                    clearInterval(leftInterval);
                    clearInterval(rightInterval);
                    rightInterval = setInterval(
                        function(){
                            shipx += (shipstep * (level/2 + 1));
                            if(shipx > 700){
                                clearInterval(rightInterval);
                            }
                        }
                        , 20
                    )
                }
                //shoot
                if(key==32){
                    var b = new Beam();
                    b.shoot();      
					e.preventDefault();
                }
                break;
        }
    });
});