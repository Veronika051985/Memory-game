const CARD_VALUES = ['Bat', 'Bones', 'Cauldron', 'Eye', 'Skull', 'Pumpkin', 'Ghost', 'Dracula'];

class AudioController {
    constructor() {
        this.bgMusic = new Audio('Assets/creepy.mp3');
        this.flipSound = new Audio('Assets/flip.wav');
        this.matchSound = new Audio('Assets/match.wav');
        this.victorySound = new Audio('Assets/victory.wav');
        this.gameOverSound = new Audio('Assets/gameOver.wav');
        this.bgMusic.volume = 0.5;
        this.bgMusic.loop = true;
    }
    play(sound) {
        // play() returns a promise that rejects if the browser blocks
        // autoplay or the user has no interacted with the page yet.
        sound.currentTime = 0;
        sound.play().catch(() => {});
    }
    startMusic() {
        this.bgMusic.play().catch(() => {});
    }
    stopMusic() {
        this.bgMusic.pause();
        this.bgMusic.currentTime = 0;
    }
    flip() {
        this.play(this.flipSound);
    }
    match() {
        this.play(this.matchSound);
    }
    victory() {
        this.stopMusic();
        this.play(this.victorySound);
    }
    gameOver() {
        this.stopMusic();
        this.play(this.gameOverSound);
    }
}

class MixOrMatch {
    constructor(totalTime, cards) {
        this.cardsArray = cards;
        this.totalTime = totalTime;
        this.timeRemaining = totalTime;
        this.timer = document.getElementById('time-remaining')
        this.ticker = document.getElementById('flips');
        this.audioController = new AudioController();
    }
//game start
    startGame() {
        this.totalClicks = 0;
        this.timeRemaining = this.totalTime;
        this.cardToCheck = null;
        this.matchedCards = [];
        this.busy = true;
        setTimeout(() => {
            this.audioController.startMusic();
            this.shuffleCards(this.cardsArray);
            this.countdown = this.startCountdown();
            this.busy = false;
        }, 500)
        this.hideCards();
        this.timer.innerText = this.timeRemaining;
        this.ticker.innerText = this.totalClicks;
    }
    //countdown
    startCountdown() {
        return setInterval(() => {
            this.timeRemaining--;
            this.timer.innerText = this.timeRemaining;
            if(this.timeRemaining === 0)
                this.gameOver();
        }, 1000);
    }
    //game over
    gameOver() {
        clearInterval(this.countdown);
        this.audioController.gameOver();
        document.getElementById('game-over-text').classList.add('visible');
    }
    //victory
    victory() {
        clearInterval(this.countdown);
        this.audioController.victory();
        document.getElementById('victory-text').classList.add('visible');
    }
    //cards array
    hideCards() {
        this.cardsArray.forEach(card => {
            card.classList.remove('visible');
            card.classList.remove('matched');
        });
    }
    //flip cards
    flipCard(card) {
        if(this.canFlipCard(card)) {
            this.audioController.flip();
            this.totalClicks++;
            this.ticker.innerText = this.totalClicks;
            card.classList.add('visible');

            if(this.cardToCheck) {
                this.checkForCardMatch(card);
            } else {
                this.cardToCheck = card;
            }
        }
    }
    //check for matching cards
    checkForCardMatch(card) {
        if(this.getCardType(card) === this.getCardType(this.cardToCheck))
            this.cardMatch(card, this.cardToCheck);
        else
            this.cardMismatch(card, this.cardToCheck);

        this.cardToCheck = null;
    }
    //matching the cards
    cardMatch(card1, card2) {
        this.matchedCards.push(card1);
        this.matchedCards.push(card2);
        card1.classList.add('matched');
        card2.classList.add('matched');
        this.audioController.match();
        if(this.matchedCards.length === this.cardsArray.length)
            this.victory();
    }
    //cards mismatch
    cardMismatch(card1, card2) {
        this.busy = true;
        setTimeout(() => {
            card1.classList.remove('visible');
            card2.classList.remove('visible');
            this.busy = false;
        }, 1000);
    }
    shuffleCards(cardsArray) { // Fisher-Yates Shuffle Algorithm.
        for (let i = cardsArray.length - 1; i > 0; i--) {
            let randIndex = Math.floor(Math.random() * (i + 1));
            cardsArray[randIndex].style.order = i;
            cardsArray[i].style.order = randIndex;
        }
    }
    getCardType(card) {
        return card.getElementsByClassName('card-value')[0].src;
    }
    canFlipCard(card) {
        return !this.busy && !this.matchedCards.includes(card) && card !== this.cardToCheck;
    }
}

// Builds the card grid from CARD_VALUES instead of duplicating markup
// for every card in index.html.
function buildCards() {
    const grid = document.getElementById('card-grid');
    const template = document.getElementById('card-template');
    const values = [...CARD_VALUES, ...CARD_VALUES];

    values.forEach(value => {
        const card = template.content.cloneNode(true).firstElementChild;
        const image = card.querySelector('.card-value');
        image.src = `Assets/images/${value}.png`;
        image.alt = '';
        grid.appendChild(card);
    });

    return Array.from(grid.getElementsByClassName('card'));
}

function activateOnEnterOrSpace(handler) {
    return event => {
        if(event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            handler();
        }
    };
}

if (document.readyState == 'loading') {
    document.addEventListener('DOMContentLoaded', ready);
} else {
    ready();
}

function ready() {
    let overlays = Array.from(document.getElementsByClassName('overlay-text'));
    let cards = buildCards();
    let game = new MixOrMatch(100, cards);

    overlays.forEach(overlay => {
        const start = () => {
            overlay.classList.remove('visible');
            game.startGame();
        };
        overlay.addEventListener('click', start);
        overlay.addEventListener('keydown', activateOnEnterOrSpace(start));
    });

    cards.forEach(card => {
        const flip = () => game.flipCard(card);
        card.addEventListener('click', flip);
        card.addEventListener('keydown', activateOnEnterOrSpace(flip));
    });
}
