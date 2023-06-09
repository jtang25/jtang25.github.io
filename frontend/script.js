window.addEventListener('DOMContentLoaded', (event) => {
    function scramble(oldWord){
        let word = oldWord;
        let newWord = '';
        for (let i = 0; i < oldWord.length; i++){
            let rand = Math.floor(Math.random() * word.length);
            newWord += word[rand];
            word = word.replace(word[rand], '');
        }
        return newWord;
    }

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async function botMakeMove() {
      console.log("botMakeMove");
        let move = await fetch('https://tangjason.com:4567/botMakeMove', {
            method:'GET',
            credentials:'include',
            headers: {
                'sessionId': sessionId
            }})
        .then(response => response.text())
        .catch(error => console.log('Erorr: ', error));
        waiting=false;
        return move;
    }

    async function checkGameOver (){
        let isOver = await fetch('https://tangjason.com:4567/checkGameOver', {
            method:'GET',
            credentials:'include',
            headers: {
                'sessionId': sessionId
            }})
        .then(response => response.text())
        .catch(error => console.log('Erorr: ', error));
        waiting=false;
        return isOver;
    }

    async function startUp() {
      const message1 = await fetch(`https://tangjason.com:4567/connect`, {
        method:'GET',
        credentials:'include'
      });
      const message1Text = await message1.text();
      const message2 = await fetch(`https://tangjason.com:4567/getSessionId`, {
        method:'GET',
        credentials:'include',
        headers: {
          'sessionId': message1Text
        }
      });
      const message2Text = await message2.text();
      const message3 = await fetch(`https://tangjason.com:4567/creategame?${queryString}`, {
        method:'GET',
        credentials:'include',
        headers: {
          'sessionId': message1Text
        }
      });
      const message3Text = await message3.text();
      console.log("Session ID (In call): "+message1Text);
      return message1Text;
    }

    let gameCode = '';
    let waiting = false;
    let gameOver = 'false';
    let turn = 1;
    const gameDifficulties = ['Easy', 'Medium', 'Hard', 'Adaptive', 'Random'];
    let difficultyElem = gameDifficulties[0];
    let playerCount = 1;
    let titleElem = document.querySelector('.title');
    let sessionId = '';
    startUp().then(sessionIdValue => {
      sessionId = sessionIdValue;
      console.log("Session Id: "+sessionId);
    });

    const params = {
      boardSize: 16,
      winLength: 4,
      difficulty: difficultyElem,
      players: playerCount,
      maxDepth: 5
    };
    const queryString = new URLSearchParams(params).toString();
    
    titleElem.addEventListener("mouseover", async ()=>{
        await sleep(50);
        titleElem.innerHTML = scramble(titleElem.innerHTML);
        await sleep(125);
        titleElem.innerHTML = scramble(titleElem.innerHTML);
        await sleep(200);
        titleElem.innerHTML = scramble(titleElem.innerHTML);
        await sleep(300);
        titleElem.innerHTML = scramble(titleElem.innerHTML);
        await sleep(400);
        titleElem.innerHTML = scramble(titleElem.innerHTML);
        await sleep(500);
        titleElem.innerHTML = scramble(titleElem.innerHTML);
        await sleep(600);
        titleElem.innerHTML = scramble(titleElem.innerHTML);
    });

    let newButtonElem = document.querySelector('.new-button');
    newButtonElem.addEventListener('click', () => {
        const squares = document.querySelectorAll('.square');
        gameOver='false';
        fetch(`https://tangjason.com:4567/clearBoard?${queryString}`, {
            method:'GET',
            credentials:'include',
            headers: {
                'sessionId': sessionId
            }})
            .then(response => response.text())
            .then(message => console.log(message))
            .catch(error => console.log('Erorr: ', error));
        squares.forEach((square) => { 
            const className = square.id.slice(-2);
            const img = document.querySelector(`.image.img${className}`);
            img.src = 'https://jtang25.github.io/images/space-holder.png';
            img.style.visibility = 'hidden';
            turn = 1;
        });
    });

    let playerCountButtonElem = document.querySelector('.player-button');
    playerCountButtonElem.addEventListener('click', () => {
        playerCount++;
        playerCount = (playerCount)%3;
        playerCountButtonElem.innerHTML = parseInt(playerCount) + ' Player';
    });

    let difficultyButtonElem = document.querySelector('.difficulty-button');

    difficultyButtonElem.addEventListener('click', () => {
        let difficultyIndex = gameDifficulties.indexOf(difficultyElem);
        difficultyIndex =  difficultyElem == 'Random' ? 0 : difficultyIndex + 1;
        difficultyElem = gameDifficulties[difficultyIndex];
        difficultyButtonElem.innerHTML = difficultyElem;
        if (difficultyElem == 'Random'){
            difficultyButtonElem.style.fontSize = 14 + 'px';
        }
        else {
            difficultyButtonElem.style.fontSize = 14 + difficultyIndex*5 + 'px';
        }
        const squares = document.querySelectorAll('.square');
        fetch(`https://tangjason.com:4567/changeDifficulty?newDifficulty=${difficultyElem}`, {
          method:'GET',
          credentials:'include',
          headers: {
            'sessionId': sessionId
            }})
            .then(response => response.text())
            .then(message => console.log(message))
            .catch(error => console.log('Erorr: ', error));
        gameOver='false';
        fetch(`https://tangjason.com:4567/clearBoard?${queryString}`, {
            method:'GET',
            credentials:'include',
            headers: {
                'sessionId': sessionId
            }})
            .then(response => response.text())
            .then(message => console.log(message))
            .catch(error => console.log('Erorr: ', error));
        squares.forEach((square) => { 
            const className = square.id.slice(-2);
            const img = document.querySelector(`.image.img${className}`);
            img.src = 'https://jtang25.github.io/images/space-holder.png';
            img.style.visibility = 'hidden';
            turn = 1;
        });
        console.log(difficultyElem);
    });

  async function handleClick() {
    if(gameOver=='false' && !waiting){
      waiting=true;
      const className = this.id.slice(-2);
      let img = null;
      img = document.querySelector(`.image.img${className}`);
      try {
        const response = await fetch('https://tangjason.com:4567/makeMove?position=' + className, {
            mode: 'cors',
            method:'GET',
            credentials:'include',
            headers: {
                'sessionId': sessionId
            }})
          .then(response => response.text())
          .then(message => gameOver = message)
          .catch(error => console.log('Erorr: ', error));
        if (img.src.slice(-('https://jtang25.github.io/images/space-holder.png').length) == 'https://jtang25.github.io/images/space-holder.png') {
          if (turn % 2 == 0) {
            img.src = 'https://jtang25.github.io/images/circle.png';
          } else {
            img.src = 'https://jtang25.github.io/images/cross.png';
          }
          img.style.visibility = 'visible';
          turn++;
          console.log('Game Over '+gameOver);
          if (gameOver=='true') {
            waiting=true;
          } else {
            let botmove = parseInt(await botMakeMove());
            let img = null;
            if(botmove<10){
              img = document.querySelector(`.image.img0${botmove}`);
            }
            else{
              img = document.querySelector(`.image.img${botmove}`);
            }
            if (turn % 2 == 0) {
              img.src = 'https://jtang25.github.io/images/circle.png';
            } else {
              img.src = 'https://jtang25.github.io/images/cross.png';
            }
            img.style.visibility = 'visible';
            turn++;
            gameOver = await checkGameOver();
            waiting=false;
            if(gameOver){
              waiting=true;
            }
          }
        }
      } catch (error) {
        console.log('Error:', error);
        waiting=false;
      }
    }
    waiting=false;
  }

  const squares = document.querySelectorAll('.square');
  squares.forEach((square) => {
    square.addEventListener('click', handleClick);
  });
});
