import Wormhole from './wormhole/Wormhole'
import { gsap } from 'gsap'

export default class Sequencer {
  constructor (scene, library, parameters, grid, camera) {
    this.scene = scene
    this.library = library
    this.parameters = parameters
    this.grid = grid
    this.camera = camera

    this.active = false

    this.wormhole = new Wormhole(this.scene, this.library, this.parameters)
  }

  async launchNextSequence (skipped = false) {
    switch (window.currentUniverse) {
      case 0:
        await this.chapterOneSequence(skipped)
        break

      case 1:
        await this.chapterTwoSequence(skipped)
        break

      case 2:
        await this.chapterThreeSequence(skipped)
        break

      case 3:
        await this.epiphanySequence(skipped)
        break

      default:
        // TODO - you are not supposed to be here, as a matter of fact, you're not
        break
    }
  }

  async chapterOneSequence (skipped = false) {
    if (skipped) {
      this.camera.rotation.z = 0
      this.fadeOutWallById('#blackwall', 0)
    } else {
      this.stopAllSounds()
      this.library.audio['transcendent'].play()
      this.library.audio['transcendent'].on('end', () => {
        this.library.audio['ghosts'].play()
        this.library.audio['ghosts'].loop(true)
      })

      await this.asyncWaitFor(2000)
      gsap.to(this.camera.rotation, { duration: 40, ease: 'Power0.easeNone', z: 0 })

      await this.fadeOutWallById('#blackwall', 10, 'Power0.easeNone')
      await this.showThenHideStory(this.parameters.story.chapterone[0])
      await this.showThenHideStory(this.parameters.story.chapterone[1], 0)
      await this.showThenHideStory(this.parameters.story.chapterone[2], 0)
      await this.showThenHideStory(this.parameters.story.chapterone[3], 0)
    }

    this.active = false
  }

  async chapterTwoSequence (skipped = false) {
    window.currentUniverse++

    this.resetScene()
    this.active = true

    if (skipped) {
      sequencer.fadeOutWallById('#whitewall', 0)
    } else {
      this.stopAllSounds()
      this.library.audio['ghosts'].play()
      this.library.audio['ghosts'].on('end', () => {
        this.library.audio['ghosts'].play()
        this.library.audio['ghosts'].loop(true)
      })

      await this.asyncWaitFor(2000)
      gsap.to(this.camera.rotation, { duration: 40, ease: 'Power0.easeNone', z: 0 })

      await this.fadeOutWallById('#whitewall', 10, 'Power0.easeNone')
      await this.showThenHideStory(this.parameters.story.chapterone[0])
      await this.showThenHideStory(this.parameters.story.chapterone[1], 0)
      await this.showThenHideStory(this.parameters.story.chapterone[2], 0)
      await this.showThenHideStory(this.parameters.story.chapterone[3], 0)
    }

    this.active = false
  }

  async chapterThreeSequence (skipped = false) {
    window.currentUniverse++

    this.active = false
  }

  async epiphanySequence (skipped = false) {
    window.currentUniverse++

    this.active = false
  }

  async wormholeSequence () {
    this.stopAllSounds()

    await this.fadeInWallById('#blackwall', 0.2)

    this.resetScene()

    this.camera.near = 0.01
    this.camera.updateProjectionMatrix()

    this.wormhole.generate()
    this.wormhole.active()

    this.startSoundByTitle('wormhole')
    this.fadeOutWallById('#blackwall', 0.5)

    await this.wormhole.animate()

    await this.fadeInWallById('#whitewall', 1)

    this.camera.near = 100
    this.camera.updateProjectionMatrix()

    this.wormhole.dispose()

    await this.launchNextSequence()
  }

  async fadeInWallById (id, duration = 2, ease = 'power2.out') {
    const element = document.querySelector(id)

    element.style.opacity = 0
    element.style.zIndex = 9

    return gsap.to(element.style, {
      duration: duration,
      ease: ease,
      opacity: 1
    }).then(() => true)
  }

  async fadeOutWallById (id, duration = 2, ease = 'power2.out') {
    const element = document.querySelector(id)

    element.style.opacity = 1

    return gsap.to(element.style, {
      duration: duration,
      ease: ease,
      opacity: 0
    }).then(() => {
      element.style.zIndex = 7
      return true
    })
  }

  stopAllSounds () {
    Object.keys(this.library.audio).forEach(key => this.library.audio[key].stop())
  }

  startSoundByTitle (title) {
    this.library.audio[title].play()
  }

  async showThenHideStory (story, delay=3, type='text') {
    const element = document.querySelector("#story")

    element.style.opacity = 0
    element.style.zIndex = 10

    if (type==='image')
      story = `<img src='${story}' alt='' />`

    element.innerHTML = story

    const chapterOneTimeline = gsap.timeline()
    chapterOneTimeline
      .delay(delay)
      .to(element.style, { duration: 3, opacity: 1 })
      .to(element.style, { duration: 3, opacity: 0 }, 6)

    return chapterOneTimeline.then(() => {
      element.style.zIndex = 7
      element.innerHTML = ''

      return true
    })
  }

  async asyncWaitFor (milliseconds) {
    await new Promise(resolve => setTimeout(resolve, milliseconds))
  }

  resetScene () {
    const arrayActiveClusters = Array.from(this.grid.activeClusters.keys())

    this.grid.disposeClusters(arrayActiveClusters)

    this.camera.position.set(0, 0, 0)
  }
}
