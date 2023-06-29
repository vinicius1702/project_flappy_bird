function attPage(){
    location.reload()
}

function newElement(tagName, className){
    const element = document.createElement(tagName)
    element.className = className
    return element
}

function Barrier(reverse = false){
    this.element = newElement('div', 'barrier')

    const barrierBorder = newElement('div', 'border')
    const barrierBody = newElement('div', 'body')

    this.element.appendChild(reverse ? barrierBody : barrierBorder)
    this.element.appendChild(reverse ? barrierBorder : barrierBody)

    this.setHeight = height => barrierBody.style.height = `${height}px`
}

function BothBarriers(height, opening, left){
    this.element = newElement('div', 'both-barriers')

    this.top = new Barrier(true)
    this.bottom = new Barrier(false)

    this.element.appendChild(this.top.element)
    this.element.appendChild(this.bottom.element)

    this.randomOpening = () => {
        const topHeight = Math.random() * (height - opening)
        const bottomHeight = height - opening - topHeight
        this.top.setHeight(topHeight)
        this.bottom.setHeight(bottomHeight)
    }

    this.getLeft = () => parseInt(this.element.style.left.split('px')[0])
    this.setLeft = left => this.element.style.left = `${left}px`
    this.getWidth = () => this.element.clientWidth

    this.randomOpening()
    this.setLeft(left)
}

function Barriers(height, width, opening, space, score){
    this.barriers = [
        new BothBarriers(height, opening, width),
        new BothBarriers(height, opening, width + space),
        new BothBarriers(height, opening, width + space * 2),
        new BothBarriers(height, opening, width + space * 3)
    ]

    const move = 1
    this.moving = () => {
        this.barriers.forEach(barrier => {
            barrier.setLeft(barrier.getLeft() - move)

            if(barrier.getLeft() < -barrier.getWidth()){
                barrier.setLeft(barrier.getLeft() + space * this.barriers.length)
                barrier.randomOpening()
            }

            const middle = width / 2
            const passMiddle = barrier.getLeft() + move >= middle && barrier.getLeft() < middle
            if(passMiddle)score()
        })
    }
}

function Bird(gameHeight){
    let flying = false

    this.element = newElement('img', 'bird')
    this.element.src = 'imgs/bird.png'

    this.getBottom = () => parseInt(this.element.style.bottom.split('px')[0])
    this.setBottom = bottom => this.element.style.bottom = `${bottom}px`

    window.onmousedown = e => flying = true
    window.onmouseup = e => flying = false
    window.onkeydown = e => flying = true
    window.onkeyup = e => flying = false
    window.ontouchstart = e => flying = true
    window.ontouchend = e => flying = false

    this.moving = () => {
        const newBottom = this.getBottom() + (flying ? 2 : -2)
        const maxHeight = gameHeight - this.element.clientHeight

        if(newBottom <= 0){
            this.setBottom(0)
        } else if(newBottom >= maxHeight){
            this.setBottom(maxHeight)
        } else {
            this.setBottom(newBottom)
        }
    }

    this.setBottom(gameHeight / 2)
}

function Progress(){
    this.element = newElement('span', 'progress')
    this.attScore = score => this.element.innerHTML = score
    this.attScore(0)
}

function positionCompare(aElement, bElement){
    const a = aElement.getBoundingClientRect()
    const b = bElement.getBoundingClientRect()

    const xAxis = a.left + a.width >= b.left && b.left + b.width >= a.left
    const yAxis = a.top + a.height >= b.top && b.top + b.height >= a.top
    return xAxis && yAxis
}

function collide(bird, barrier){
    let collide = false
    barrier.barriers.forEach(barriers => {
        if(!collide){
            const topBarrier = barriers.top.element
            const bottomBarrier = barriers.bottom.element
            collide = positionCompare(bird.element, topBarrier) || positionCompare(bird.element, bottomBarrier)
        }
    })
    return collide
}

function FlappyBird(){
    let score = 0

    const gameArea = document.querySelector('[wm-flappy]')
    const height = gameArea.clientHeight
    const width = gameArea.clientWidth
    const gameOver = document.querySelector('.game-over')

    const progress = new Progress()
    const barrierss = new Barriers(height, width, 250, 400,
        () => progress.attScore(++score))
    const bird = new Bird(height)

    gameArea.appendChild(progress.element)
    gameArea.appendChild(bird.element)
    barrierss.barriers.forEach(barriers => gameArea.appendChild(barriers.element))

    this.start = () => {
        const loop = setInterval(() => {
            barrierss.moving()
            bird.moving()
            if(collide(bird, barrierss)){
                gameOver.style.display = 'flex'
                clearInterval(loop)
            }
        }, 1)
    }
}

new FlappyBird().start()