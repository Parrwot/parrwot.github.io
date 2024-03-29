export default class Timer{
    constructor(root){
    root.innerHTML = Timer.getHTML();

    this.el = {
        minutes: root.querySelector(".timer__part--minutes"),
        seconds: root.querySelector(".timer__part--seconds"),
        stopStart: root.querySelector(".timer__btn--start"),
        reset: root.querySelector(".timer__btn--reset")
    };

    this.interval = null;
    this.remainingSeconds = 1500;

    this.el.stopStart.addEventListener("click", () => {
        if (this.interval === null) {
            this.start();
        } else {
            this.stop();
        }
    });

    this.el.reset.addEventListener("click", () => {
        location.reload()
    });


}

udpateInterfaceTime() {
    const minutes = Math.floor(this.remainingSeconds / 60);
    const seconds = this.remainingSeconds % 60;

    this.el.minutes.textContent = minutes.toString().padStart(2, "0")
    this.el.seconds.textContent = seconds.toString().padStart(2, "0")
}

updateInterfaceControls() {
    if (this.interval === null) {
        this.el.stopStart.innerHTML = `<span class="material-symbols-rounded">play_arrow</span>`;
        this.el.stopStart.classList.add("timer__btn--start");
        this.el.stopStart.classList.remove("timer__btn--stop");
    } else {
        this.el.stopStart.innerHTML = `<span class="material-symbols-rounded">pause</span>`;
        this.el.stopStart.classList.add("timer__btn--stop");
        this.el.stopStart.classList.remove("timer__btn--start");
    }
}
start() {
    if (this.remainingSeconds === 0) return;

    this.interval = setInterval(() => {
    this.remainingSeconds--;
    this.udpateInterfaceTime();

    if (this.remainingSeconds === 0) {
        this.stop();
    }
    }, 1000);

    this.updateInterfaceControls();
}
stop() {
    clearInterval(this.interval);

    this.interval = null;

    this.updateInterfaceControls();
}

    static getHTML() {
        return `
            <span class="timer__part timer__part--minutes">00</span>
            <span class="timer__part">:</span>
            <span class="timer__part timer__part--seconds">00</span>
            <button type="button" class="timer__btn timer__btn--start">
                <span class="material-symbols-rounded">play_arrow</span>
            </button>
            <button type="button" class="timer__btn timer__btn--reset">
                <span class="material-symbols-rounded">refresh</span>
            </button>
            `;
    }
}