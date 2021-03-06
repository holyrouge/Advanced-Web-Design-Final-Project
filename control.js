// variables for html elementss
            var container = document.getElementById("container");
            var canvas = document.getElementById("gameScreen");
            var ctx = canvas.getContext("2d");
            
	        var enterToPlay = document.getElementById("enterToPlay");
	        
	        var spaceInvaders = document.getElementById("spaceinvaders");
	        
            // variables for the player
            var player;
            var playerImg = "images/player-ship.gif";
            var playerX = 5;
            var playerY = canvas.height/2;
            var shipRadius = 10;
            var dx = 5;
            var dy = 5;
            var hp = 3;
            // player movement variables
            var upPressed = false;
            var downPressed = false;
            var leftPressed = false;
            var rightPressed = false;
            // background image variables
            var map = "images/game-background.jpg";
            var endPage1 = "images/end_screen1.jpg";
            var endPage2 = "images/end_screen2.jpg";
            // variables for bullets
            var bullet = "images/player-bullet.png";
            var bullets = [];
            var bulletSpeed = 8;
            // variables for enemies
            var enemy = "images/human-ship1.png";
            var enemies = [];
            var enemySpeed = 1;
            // timer to increase enemy spawn rate over time
            var time = 30;
            // enemy sn apawrmte tie
            var spawnTime = 2500;
            // variables for explosion of enemy ships
            var explosion = [];
            var explosionImg = "images/explosion.png";
            
            // variables for score and planet lives
            var score = 0;
            var lives = 10;
            // variable for pause/unpause
            var paused = false;
            // event listener to start game
            window.addEventListener("keydown", EnterPlay);
            // event listeners for player movement
            window.addEventListener("keydown", MoveHandler);
            window.addEventListener("keyup", StopHandler);
            
            // event listener to create bullets
            window.addEventListener("keydown", crtBullet);
            // pause & unpause
            window.addEventListener("keydown", pauseGame);
            window.addEventListener("keydown", unpauseGame);
            
            function timer() { // timer to increase spawn rate over time
                time--;
                if (time < 1) {
                    time = 30;
                    if  (spawnTime > 1000) { // decreases the spawnTime over time so that enemies spawn faster
                        spawnTime -= 50;
                    }
                }
            }
            
            function MoveHandler(e) { // uses event listeners to set the value (true or false) of movement variables that signal the player to move in a certain direction
                if (e.keyCode === 38) {
                    upPressed = true;
                }
                else if (e.keyCode === 40) {
                    downPressed = true;
                }
                else if (e.keyCode === 37) {
                    leftPressed = true;
                }
                else if (e.keyCode === 39) {
                    rightPressed = true;
                }
            }
            function StopHandler(e) { // uses event listeners to set the value (true or false) of movement variables that signal the player to stop moving in a certain direction
                if (e.keyCode === 38) {
                    upPressed = false;
                }
                else if (e.keyCode === 40) {
                    downPressed = false;
                }
                else if (e.keyCode === 37) {
                    leftPressed = false;
                }
                else if (e.keyCode === 39) {
                    rightPressed = false;
                }
            }
            function movePlayer() { // changes the x and y values of the player depending on the values (true or false) of movement variables
                if (upPressed) {
                    if ( (playerY - shipRadius) > 0) {
                        playerY -= dy;
                    }
                }
                else if (downPressed) {
                    if ( (playerY + shipRadius) < canvas.height - 50) {
                        playerY += dy;
                    }
                }
                else if (rightPressed) {
                    if ( (playerX + shipRadius) < canvas.width - 400) {
                        playerX += dx;
                    }
                }
                else if (leftPressed) {
                    if ( (playerX - shipRadius) > 0) {
                        playerX -= dx;
                    }
                }
            }
            function drawPlayer() { // draws the player again after the canvas is cleared every time renderLoop() is run
                ctx.drawImage(player, playerX, playerY, 100, 60);
            }
            
            function playerEnemyIntersect() { // if the player and an enemy intersect, it decreases the health of the player and destroys the enemy
                var eLen = enemies.length;
                var i = 0;
                while (i < eLen && enemies[i] != null) { // while loop checks player x and y values with enemy x and y values
                    if (playerX + 70 >= enemies[i].x && playerY + 20 >= enemies[i].y && playerY - 50 <= enemies[i].y) {
                        
                        explode(i); // explode function used to remove that specific enemy
                        
                        eLen--;
                        enemies.splice(i, 1); // takes the enemy out of the loop
                        
                        hp--; // decreases player hp
                    }
                    
                    i++;
                }
            }
            function explode(i) { // enemy explode function for enemies
                var e = new Image(); // creates a new image that takes the place of the enemy
                e.src = explosionImg;
                thisexplosion = {img:e, time:30, x:enemies[i].x, y:enemies[i].y}; // explosion stays on canvas for a certain time set using the time attribute of the explosion
                explosion.push(thisexplosion); // adds the explosion to the explosion array
            }
            function drawExplosion(i) { // draws each explosion that's in the array
                ctx.drawImage(explosion[i].img, explosion[i].x, explosion[i].y);
            }
            function explosionTimer() { // draws the explosion until the timer hits 0 and then it removes the explosion
                var eLen = explosion.length;
                var i = 0;
                while (i < eLen && explosion[i] != null){ // while loop used to go through each explosion in the array
                    drawExplosion(i); // draws the explosion
                    explosion[i].time -= 1; // decreases the t ime
                    
                    if (explosion[i].time < 1) { // removes the explosion
                        eLen--;
                        explosion.splice(i, 1);
                    }                
                    
                    i++;
                }                
            }
            
            function killEnemy(n) { // removes the enemy if the bullet and the enemy x and y values are the same
                var eLen = enemies.length;
                var hasKilled = false;
                var i = 0;
                while (i < eLen && hasKilled === false &&  enemies[i] != null) { // while loop compares the x and y values of the nth bullet in the array (the n value is inputted into the function) and the x and y values of every enemy in the array
                    if ((bullets[n].x >= enemies[i].x-10) && (bullets[n].x <= enemies[i].x+10) && (bullets[n].y >= enemies[i].y-10) && (bullets[n].y <= enemies[i].y+30)) {
                        explode(i); // explodes the enemy and adds the explosion image in the enemy's location
                        
                        eLen--;
                        enemies.splice(i, 1); // removes the enemy from the array, which removes the enemy from the screen
                        hasKilled = true;
                        score += 10; // increases the score per enemy killed
                    }
                    i++;
                }
                return hasKilled; // returns true or false depending on if the enemy is killed            
            }
            function useBullets() { // removes bullets if they intersect with an enemy
                var bLen = bullets.length;
                var i = 0;
                while (i < bLen && enemies[i] != null && bullets[i] != null) {
                    if (killEnemy(i) === true) { // if the enemy is killed in killEnemy function, it removes the bullet
                        bLen--;
                        bullets.splice(i, 1);
                    }
                    
                    i++;
                }  
            }
            function crtBullet(e) { // creates bullets if the space bar is pressed
                if ((e.keyCode === 32) && (player != "undefined") ) {
                    var b = new Image(); // creates a new image with the bullet image and then sets its x and y values
                    b.src = bullet;
                    var thisbullet = {img:b, x:playerX + player.width/2 - 10, y:playerY};
                    bullets.push(thisbullet); // adds the bullet to the player
                }
            }
            
            function drawBullet(i) { // draws the bullet
                ctx.drawImage(bullets[i].img, bullets[i].x, bullets[i].y, 15, 10);
            }
            
            function moveBullets() { // uses a while loop to change the x coordinates of each bullet and thus moves it forward
                var bLen = bullets.length;
                var i = 0;
                while (i < bLen) {
                    drawBullet(i);
                    bullets[i].x += bulletSpeed;
                    if (bullets[i].x > 800) { // if the bullet goes past the length of the canvas, it is removed.
                        bLen--;
                        bullets.splice(i,1);
                    } 
                    else {
                        i++;
                    }
                }
            }
            
            function crtEnemy() { // creates enemies
                var e = new Image(); // creates a new image 
                e.src = enemy;
                var enemyY = Math.floor(Math.random()*500)+30; // random y value so that it spawns across the width of the canvas
                var thisenemy = {img:e, x:800, y:enemyY}; // uses the new image and coordinates to create enemy 
                enemies.push(thisenemy); // adds enemy to enemies array
            }
            
            function drawEnemy(i) { // draws the enemy that corresponds to the number inputted
                ctx.drawImage(enemies[i].img, enemies[i].x, enemies[i].y, 80, 30);
            }
            
            function moveEnemy() { // moves the enemy by changing its x value
                var eLen = enemies.length;
                var i = 0;
                while (i < eLen) {
                    drawEnemy(i); // draws the enemy
                    enemies[i].x -= enemySpeed;
                    if (enemies[i].x < -10) { // removes the enemy if its past the length of the canvas
                        lives -= 1;
                        eLen--;
                        enemies.splice(i,1);
                    } 
                    else {
                        i++; 
                    }
                }
            }
            
            function renderLoop() { // main function that runs the game
                if (paused === false) { // if the game is not paused, it runs the functions
                    ctx.clearRect(0, 0, canvas.width, canvas.height); // clears the canvas each time
                    drawPlayer();
                    movePlayer();
                    moveBullets();
                    useBullets();
                    moveEnemy();
                    playerEnemyIntersect();
                    explosionTimer();
                    // draw score, lives and hp of player
                    drawScore();
                    drawLives();
                    drawHP();
                    // end game
                    endGame();
                    window.requestAnimationFrame(renderLoop); // redoes the renderLoop function each time
                }
            }
            
            function Start() { // starts function that sets up the game screen
	            // makes the opening text that is created using HTML disappear
	            enterToPlay.style.opacity = "0";
	            spaceInvaders.style.opacity = "0";
	            
                canvas.style.background = "url(" + map + ")";
                // Load player image
                player = new Image();
                player.src = playerImg;
                player.onload = function() {
                    ctx.drawImage(player, playerX, playerY, 100, 60);
                };
                // run game
                renderLoop();
                // creates an enemy after some time
                setInterval(crtEnemy, spawnTime);
                // updates the time each second
                setInterval(timer, 1000);
            }
            
            function EnterPlay(e) {
                // This lets the player start the game
	            if(e.keyCode === 13) {
	                Start();
                    window.removeEventListener("keydown", EnterPlay);
                }
            }
            function endGame() { // displays the end game screen
                if (lives < 1) {
                    ctx.clearRect(0, 0, canvas.width, canvas.height); // clears the canvas
                    
                    canvas.style.background = "url(" + endPage1 + ")";
                    
                    window.cancelAnimationFrame(renderLoop); // stops the renderLoop
                    // removes the event listeners for movement
                    window.removeEventListener("keydown", MoveHandler);
                    window.removeEventListener("keyup", StopHandler);
                    // removes the event listener for creatin a bullet
                    window.removeEventListener("keydown", crtBullet);
                    
                    // adds the event listener to reload the game
                    window.addEventListener("keydown", endGameReload);
                    
                    // displays the score
                    ctx.font = "32px Arial";
                    ctx.fillStyle = "yellow";
                    ctx.fillText(score, 400, 385);
                    
                    // display the play again text
                    ctx.font = "24px Arial";
                    ctx.fillStyle = "yellow";
                    ctx.fillText("Press Enter to Play Again!", 270, 450);
                }
                else if (hp < 1) {
                    ctx.clearRect(0, 0, canvas.width, canvas.height); // clears the canvas
                    
                    canvas.style.background = "url(" + endPage2 + ")";
                    
                    window.cancelAnimationFrame(renderLoop); // stops the renderLoop
                    // removes the event listeners for movement
                    window.removeEventListener("keydown", MoveHandler);
                    window.removeEventListener("keyup", StopHandler);
                    // removes the event listener for creating a bullet
                    window.removeEventListener("keydown", crtBullet);
                    
                    // adds the event listener to reload the game
                    window.addEventListener("keydown", endGameReload);
                    
                    // displays the score
                    ctx.font = "32px Arial";
                    ctx.fillStyle = "yellow";
                    ctx.fillText(score, 400, 385);
                    
                    // display the play again text
                    ctx.font = "24px Arial";
                    ctx.fillStyle = "yellow";
                    ctx.fillText("Press Enter to Play Again!", 270, 450);
                }
            }
            function endGameReload(e) { // reloads the game at the end screen and takes u back to the start screen if enter is pressed
                if(e.keyCode === 13) {
                    location.reload();
                }
            }
            function pauseGame(e) { // pauses the game if the 'P' key is pressed
                if (e.keyCode === 80 && paused === false){
                    paused = true;
                    // removes the event listeners
                    window.removeEventListener("keydown", MoveHandler);
                    window.removeEventListener("keyup", StopHandler);
                    window.removeEventListener("keydown", crtBullet);
                }
            }
            function unpauseGame(e) { // unpauses the game if the 'O' key is pressed
                if (e.keyCode === 79 && paused === true){
                    paused = false;
                    // readds the event listeners
                    window.addEventListener("keydown", MoveHandler);
                    window.addEventListener("keyup", StopHandler);
                    window.addEventListener("keydown", crtBullet);
                    // runs the game
                    renderLoop();
                }
            }       
            
             function drawScore() { // displays he score
                ctx.font = "16px Arial";
                ctx.fillStyle = "#fff";
                ctx.fillText("Score: " + score, 10, 20);
            }
            
            function drawLives() { // displays the planet's lives
                ctx.font = "16px Arial";
                ctx.fillStyle= "#fff";
                ctx.fillText("Planet Lives: " + lives, 10, 40);
            }
            
            function drawHP() { // displays the hp of the player
                ctx.font = "16px Arial";
                ctx.fillStyle= "#fff";
                ctx.fillText("Player HP: " + hp, 10, 60);
            }
