import React, { useEffect, useMemo, useState } from 'react'

export type CavernQuestion = {
  prompt?: string
  question?: string
  choices?: string[]
  options?: string[]
  correctAnswer?: string | number
  correct_answer?: string | number
  answer?: string | number
}

type GamePhase = 'appearing' | 'question' | 'attacking' | 'hit' | 'defeated' | 'complete'

type CavernCombatProps = {
  questions: CavernQuestion[]
  onComplete: (score: number, total: number) => void
  onExit?: () => void
  assignmentTitle?: string
}

/*
 * Every beast uses the same animation contract.
 *
 * The artwork can be a completely different sprite sheet for each monster,
 * but every monster supplies these six animation states:
 *
 *   spawn     -> monster enters the battle
 *   idle      -> normal breathing/flying/standing loop
 *   attack    -> monster attacks after a wrong answer
 *   hit       -> monster gets hit after a correct answer
 *   defeated  -> monster's defeat/death sequence
 *   special   -> optional extra effect (projectile, roar, spell, etc.)
 *
 * A frame is just a rectangle on the source sprite sheet.
 * This lets us keep each beast's original sheet intact.
 */
type SpriteFrame = {
  x: number
  y: number
  width: number
  height: number
  duration?: number
}

type BeastAnimations = {
  spawn: SpriteFrame[]
  idle: SpriteFrame[]
  attack: SpriteFrame[]
  hit: SpriteFrame[]
  defeated: SpriteFrame[]
  special: SpriteFrame[]
}

type Beast = {
  name: string
  sheet: string
  sheetWidth: number
  sheetHeight: number
  animations: BeastAnimations
}

/*
 * Giant Radioactive Bat
 *
 * The supplied sheet is 1536 x 1024.
 *
 * We deliberately keep all of the source artwork in one file and crop it
 * at runtime. When the other nine sheets arrive, they only need to provide
 * their own frame rectangles under this exact same animation contract.
 */
const RADIOACTIVE_BAT: Beast = {
  name: 'Giant Radioactive Bat',
  sheet: '/assets/cavern/beasts/radioactive-bat.png',
  sheetWidth: 1536,
  sheetHeight: 1024,

  animations: {
    // Three different bat poses across the top of the sheet.
    spawn: [
      { x: 0, y: 0, width: 500, height: 315, duration: 150 },
      { x: 500, y: 0, width: 540, height: 315, duration: 150 },
      { x: 1040, y: 0, width: 496, height: 315, duration: 180 },
    ],

    // Flying/hovering loop.
    idle: [
      { x: 0, y: 0, width: 500, height: 315, duration: 180 },
      { x: 500, y: 0, width: 540, height: 315, duration: 180 },
      { x: 1040, y: 0, width: 496, height: 315, duration: 180 },
      { x: 0, y: 315, width: 400, height: 285, duration: 180 },
    ],

    // Open-mouth attack poses and radioactive spit.
    attack: [
      { x: 0, y: 585, width: 260, height: 220, duration: 130 },
      { x: 260, y: 585, width: 510, height: 220, duration: 160 },
      { x: 770, y: 585, width: 260, height: 180, duration: 120 },
      { x: 1030, y: 585, width: 300, height: 180, duration: 140 },
    ],

    // Quick damage shake using the frontal poses.
    hit: [
      { x: 0, y: 0, width: 500, height: 315, duration: 100 },
      { x: 500, y: 0, width: 540, height: 315, duration: 100 },
      { x: 0, y: 0, width: 500, height: 315, duration: 100 },
    ],

    // Fallen/dead bat frames + radioactive residue.
    defeated: [
      { x: 250, y: 790, width: 390, height: 220, duration: 180 },
      { x: 600, y: 790, width: 410, height: 220, duration: 180 },
      { x: 1010, y: 790, width: 526, height: 220, duration: 260 },
    ],

    // Radioactive projectile/effect frames.
    special: [
      { x: 700, y: 585, width: 300, height: 190, duration: 110 },
      { x: 900, y: 585, width: 320, height: 190, duration: 110 },
      { x: 1120, y: 585, width: 300, height: 190, duration: 110 },
      { x: 1320, y: 585, width: 216, height: 190, duration: 130 },
    ],
  },
}

/*
 * Add the remaining nine beasts here as we receive their sprite sheets.
 * They use exactly the same animation names:
 *
 * spawn / idle / attack / hit / defeated / special
 *
 * The game itself never needs to know how a particular monster's artwork
 * is arranged.
 */

/*
 * Cavern Spider
 *
 * Supplied sheet: 1536 x 1024.
 * The same six-state contract is used as the bat. The sheet includes
 * several distinct poses, a web attack, small spider/egg effects, and
 * fallen/dead poses, so those are reused to make a complete encounter.
 */
const CAVERN_SPIDER: Beast = {
  name: 'Cavern Spider',
  sheet: '/assets/cavern/beasts/cavern-spider.png',
  sheetWidth: 1536,
  sheetHeight: 1024,

  animations: {
    spawn: [
      { x: 42, y: 28, width: 315, height: 285, duration: 150 },
      { x: 420, y: 18, width: 285, height: 330, duration: 150 },
      { x: 780, y: 70, width: 365, height: 275, duration: 170 },
      { x: 1225, y: 30, width: 285, height: 310, duration: 190 },
    ],

    idle: [
      { x: 42, y: 28, width: 315, height: 285, duration: 180 },
      { x: 420, y: 18, width: 285, height: 330, duration: 180 },
      { x: 780, y: 70, width: 365, height: 275, duration: 180 },
      { x: 42, y: 390, width: 350, height: 235, duration: 180 },
      { x: 430, y: 395, width: 350, height: 220, duration: 180 },
    ],

    attack: [
      { x: 820, y: 355, width: 355, height: 265, duration: 130 },
      { x: 42, y: 390, width: 350, height: 235, duration: 130 },
      { x: 45, y: 625, width: 350, height: 155, duration: 120 },
      { x: 835, y: 625, width: 300, height: 155, duration: 120 },
      { x: 1135, y: 625, width: 180, height: 155, duration: 150 },
    ],

    hit: [
      { x: 820, y: 355, width: 355, height: 265, duration: 90 },
      { x: 42, y: 28, width: 315, height: 285, duration: 90 },
      { x: 820, y: 355, width: 355, height: 265, duration: 110 },
    ],

    defeated: [
      { x: 40, y: 800, width: 315, height: 205, duration: 170 },
      { x: 375, y: 800, width: 285, height: 205, duration: 190 },
      { x: 690, y: 800, width: 390, height: 205, duration: 230 },
    ],

    special: [
      { x: 835, y: 625, width: 300, height: 155, duration: 100 },
      { x: 1120, y: 625, width: 195, height: 155, duration: 100 },
      { x: 1335, y: 800, width: 180, height: 205, duration: 140 },
    ],
  },
}


/*
 * One-Eyed Crawler
 *
 * Supplied sheet: 1536 x 1024.
 * The crawler follows the exact same six-state animation contract as the
 * radioactive bat and cavern spider. The sheet gives us multiple crawling
 * poses, a lunging attack, eye/projectile effects, and several defeated
 * poses.
 */
const ONE_EYED_CRAWLER: Beast = {
  name: 'One-Eyed Crawler',
  sheet: '/assets/cavern/beasts/one-eyed-crawler.png',
  sheetWidth: 1536,
  sheetHeight: 1024,

  animations: {
    // The crawler emerges with a sequence of increasingly aggressive poses.
    spawn: [
      { x: 12, y: 25, width: 305, height: 255, duration: 140 },
      { x: 335, y: 45, width: 325, height: 235, duration: 140 },
      { x: 655, y: 65, width: 315, height: 220, duration: 160 },
      { x: 970, y: 80, width: 305, height: 215, duration: 170 },
      { x: 1280, y: 20, width: 250, height: 275, duration: 190 },
    ],

    // Natural crawling/standing loop.
    idle: [
      { x: 12, y: 25, width: 305, height: 255, duration: 180 },
      { x: 335, y: 45, width: 325, height: 235, duration: 180 },
      { x: 655, y: 65, width: 315, height: 220, duration: 180 },
      { x: 12, y: 285, width: 390, height: 245, duration: 180 },
      { x: 405, y: 285, width: 390, height: 245, duration: 180 },
    ],

    // Lunge forward, then launch the eye projectile.
    attack: [
      { x: 805, y: 285, width: 425, height: 265, duration: 130 },
      { x: 15, y: 535, width: 345, height: 230, duration: 130 },
      { x: 355, y: 530, width: 345, height: 235, duration: 140 },
      { x: 690, y: 535, width: 300, height: 205, duration: 110 },
      { x: 970, y: 535, width: 315, height: 205, duration: 110 },
    ],

    // Quick recoil/flash sequence using the strongest frontal poses.
    hit: [
      { x: 12, y: 25, width: 305, height: 255, duration: 90 },
      { x: 335, y: 45, width: 325, height: 235, duration: 90 },
      { x: 12, y: 25, width: 305, height: 255, duration: 110 },
    ],

    // Fallen crawler, then the collapsed remains / hole-like defeat effect.
    defeated: [
      { x: 15, y: 775, width: 385, height: 245, duration: 170 },
      { x: 390, y: 780, width: 400, height: 225, duration: 190 },
      { x: 780, y: 760, width: 300, height: 265, duration: 220 },
      { x: 1060, y: 760, width: 300, height: 265, duration: 240 },
    ],

    // Eye/projectile sequence unique to the One-Eyed Crawler.
    special: [
      { x: 690, y: 535, width: 300, height: 205, duration: 100 },
      { x: 965, y: 535, width: 315, height: 205, duration: 100 },
      { x: 1280, y: 535, width: 255, height: 230, duration: 130 },
      { x: 1380, y: 760, width: 150, height: 260, duration: 150 },
    ],
  },
}


/*
 * Purple Cave Scorpion
 *
 * Supplied sheet: 1536 x 1024.
 * This sheet is already organized into labeled animation bands:
 * spawn / idle / attack / hit / defeated / special.
 * We keep those bands as individual frame rectangles so the generic
 * combat renderer can use the scorpion without any custom component.
 */
const PURPLE_CAVE_SCORPION: Beast = {
  name: 'Purple Cave Scorpion',
  sheet: '/assets/cavern/beasts/purple-cave-scorpion.png',
  sheetWidth: 1536,
  sheetHeight: 1024,

  animations: {
    // Crystal mound emergence, then the scorpion fully rises.
    spawn: [
      { x: 18, y: 35, width: 185, height: 145, duration: 150 },
      { x: 215, y: 28, width: 220, height: 155, duration: 150 },
      { x: 455, y: 25, width: 225, height: 160, duration: 150 },
      { x: 700, y: 20, width: 255, height: 165, duration: 170 },
      { x: 990, y: 15, width: 230, height: 170, duration: 180 },
      { x: 1250, y: 10, width: 260, height: 180, duration: 200 },
    ],

    // Six-frame idle/crawling loop.
    idle: [
      { x: 8, y: 205, width: 190, height: 145, duration: 180 },
      { x: 210, y: 200, width: 190, height: 150, duration: 180 },
      { x: 420, y: 200, width: 195, height: 150, duration: 180 },
      { x: 630, y: 195, width: 205, height: 155, duration: 180 },
      { x: 850, y: 195, width: 205, height: 155, duration: 180 },
      { x: 1080, y: 195, width: 210, height: 155, duration: 180 },
      { x: 1290, y: 195, width: 225, height: 155, duration: 180 },
    ],

    // Claw/mouth attack poses followed by the charged attack pose.
    attack: [
      { x: 8, y: 375, width: 185, height: 155, duration: 130 },
      { x: 205, y: 370, width: 185, height: 160, duration: 130 },
      { x: 405, y: 365, width: 195, height: 165, duration: 140 },
      { x: 625, y: 365, width: 225, height: 165, duration: 150 },
      { x: 850, y: 360, width: 270, height: 175, duration: 170 },
    ],

    // Recoil poses from the dedicated HIT (DAMAGED) band.
    hit: [
      { x: 8, y: 555, width: 195, height: 150, duration: 90 },
      { x: 225, y: 550, width: 195, height: 155, duration: 90 },
      { x: 450, y: 550, width: 225, height: 155, duration: 100 },
      { x: 715, y: 550, width: 235, height: 155, duration: 110 },
      { x: 980, y: 550, width: 245, height: 155, duration: 100 },
      { x: 1260, y: 550, width: 250, height: 160, duration: 120 },
    ],

    // Collapsed scorpion and crystal-covered remains.
    defeated: [
      { x: 8, y: 720, width: 250, height: 150, duration: 170 },
      { x: 275, y: 720, width: 245, height: 150, duration: 180 },
      { x: 535, y: 720, width: 230, height: 150, duration: 190 },
      { x: 780, y: 720, width: 235, height: 150, duration: 210 },
      { x: 1030, y: 720, width: 250, height: 150, duration: 220 },
      { x: 1290, y: 720, width: 225, height: 150, duration: 250 },
    ],

    // Purple projectile travel followed by the crystal impact/explosion.
    special: [
      { x: 8, y: 875, width: 400, height: 145, duration: 120 },
      { x: 425, y: 900, width: 180, height: 115, duration: 100 },
      { x: 610, y: 900, width: 180, height: 115, duration: 100 },
      { x: 795, y: 900, width: 180, height: 115, duration: 110 },
      { x: 975, y: 865, width: 150, height: 155, duration: 130 },
      { x: 1140, y: 865, width: 190, height: 155, duration: 150 },
      { x: 1350, y: 865, width: 175, height: 155, duration: 170 },
    ],
  },
}

/*
 * Stone Serpent
 *
 * Supplied sheet: 1536 x 1024.
 * The sheet is explicitly divided into the same six labeled bands:
 * SPAWN / IDLE / ATTACK / HIT / DEFEATED / SPECIAL.
 * We use those bands directly, keeping the full PNG intact in public/assets.
 */
const STONE_SERPENT: Beast = {
  name: 'Stone Serpent',
  sheet: '/assets/cavern/beasts/stone-serpent.png',
  sheetWidth: 1536,
  sheetHeight: 1024,

  animations: {
    // Crystal mound emergence, then the serpent rises into view.
    spawn: [
      { x: 10, y: 42, width: 180, height: 140, duration: 140 },
      { x: 195, y: 42, width: 190, height: 140, duration: 140 },
      { x: 390, y: 35, width: 200, height: 150, duration: 150 },
      { x: 595, y: 15, width: 215, height: 170, duration: 160 },
      { x: 815, y: 25, width: 205, height: 160, duration: 170 },
      { x: 1020, y: 15, width: 225, height: 170, duration: 190 },
    ],

    // Coiled breathing/movement loop.
    idle: [
      { x: 8, y: 195, width: 205, height: 155, duration: 180 },
      { x: 220, y: 190, width: 215, height: 160, duration: 180 },
      { x: 445, y: 190, width: 220, height: 160, duration: 180 },
      { x: 675, y: 190, width: 225, height: 160, duration: 180 },
      { x: 910, y: 190, width: 220, height: 160, duration: 180 },
      { x: 1135, y: 190, width: 205, height: 160, duration: 180 },
    ],

    // Forward lunge / bite sequence.
    attack: [
      { x: 8, y: 365, width: 245, height: 165, duration: 120 },
      { x: 275, y: 365, width: 275, height: 165, duration: 130 },
      { x: 570, y: 360, width: 275, height: 175, duration: 140 },
      { x: 850, y: 350, width: 315, height: 185, duration: 150 },
      { x: 1185, y: 350, width: 235, height: 185, duration: 170 },
    ],

    // Dedicated damaged poses.
    hit: [
      { x: 8, y: 535, width: 325, height: 165, duration: 90 },
      { x: 345, y: 535, width: 255, height: 165, duration: 90 },
      { x: 610, y: 535, width: 255, height: 165, duration: 100 },
      { x: 875, y: 535, width: 255, height: 165, duration: 105 },
      { x: 1140, y: 535, width: 180, height: 165, duration: 120 },
    ],

    // Collapse into stone/crystal remains.
    defeated: [
      { x: 8, y: 705, width: 295, height: 150, duration: 170 },
      { x: 315, y: 705, width: 245, height: 150, duration: 180 },
      { x: 570, y: 705, width: 250, height: 150, duration: 190 },
      { x: 825, y: 705, width: 255, height: 150, duration: 210 },
      { x: 1090, y: 705, width: 225, height: 150, duration: 220 },
      { x: 1320, y: 690, width: 210, height: 165, duration: 250 },
    ],

    // Blue stone projectile travel followed by crystal impact frames.
    special: [
      { x: 8, y: 875, width: 390, height: 145, duration: 120 },
      { x: 405, y: 895, width: 175, height: 125, duration: 100 },
      { x: 585, y: 895, width: 175, height: 125, duration: 100 },
      { x: 765, y: 895, width: 175, height: 125, duration: 105 },
      { x: 945, y: 895, width: 175, height: 125, duration: 110 },
      { x: 1125, y: 860, width: 205, height: 160, duration: 140 },
      { x: 1335, y: 860, width: 195, height: 160, duration: 170 },
    ],
  },
}


/*
 * Yellow Glowworm Beast
 *
 * Supplied sheet: 1254 x 1254.
 * This sheet is explicitly divided into the six labeled bands:
 * SPAWN / IDLE / ATTACK / HIT (DAMAGED) / DEFEATED / SPECIAL.
 *
 * The glowworm's special is a ranged glowing projectile followed by a
 * yellow cave-pool/crystal impact, so those frames are used for the
 * special state rather than trying to reuse ordinary attack poses.
 */
const YELLOW_GLOWWORM_BEAST: Beast = {
  name: 'Yellow Glowworm Beast',
  sheet: '/assets/cavern/beasts/yellow-glowworm-beast.png',
  sheetWidth: 1254,
  sheetHeight: 1254,

  animations: {
    // Emerges from the glowing cave mound and rises into its full form.
    spawn: [
      { x: 10, y: 35, width: 185, height: 155, duration: 140 },
      { x: 195, y: 35, width: 185, height: 155, duration: 140 },
      { x: 385, y: 25, width: 175, height: 165, duration: 150 },
      { x: 565, y: 18, width: 195, height: 175, duration: 160 },
      { x: 765, y: 12, width: 205, height: 180, duration: 170 },
      { x: 975, y: 8, width: 270, height: 185, duration: 190 },
    ],

    // Five-frame glowing crawl/breathing loop.
    idle: [
      { x: 8, y: 210, width: 250, height: 175, duration: 180 },
      { x: 265, y: 210, width: 250, height: 175, duration: 180 },
      { x: 520, y: 210, width: 250, height: 175, duration: 180 },
      { x: 775, y: 210, width: 250, height: 175, duration: 180 },
      { x: 1030, y: 205, width: 220, height: 180, duration: 200 },
    ],

    // Forward lunge / mouth attack poses.
    attack: [
      { x: 8, y: 405, width: 285, height: 180, duration: 130 },
      { x: 300, y: 405, width: 285, height: 180, duration: 130 },
      { x: 595, y: 395, width: 300, height: 190, duration: 150 },
      { x: 905, y: 405, width: 335, height: 180, duration: 170 },
    ],

    // Dedicated damaged/recoil poses.
    hit: [
      { x: 8, y: 620, width: 245, height: 175, duration: 90 },
      { x: 265, y: 620, width: 250, height: 175, duration: 90 },
      { x: 525, y: 615, width: 255, height: 180, duration: 100 },
      { x: 790, y: 615, width: 250, height: 180, duration: 105 },
      { x: 1050, y: 610, width: 195, height: 185, duration: 120 },
    ],

    // Collapse, dissolve, and leave behind a glowing cave mound.
    defeated: [
      { x: 8, y: 815, width: 250, height: 175, duration: 170 },
      { x: 270, y: 815, width: 250, height: 175, duration: 180 },
      { x: 530, y: 815, width: 255, height: 175, duration: 190 },
      { x: 795, y: 815, width: 245, height: 175, duration: 210 },
      { x: 1050, y: 810, width: 195, height: 180, duration: 250 },
    ],

    // Glowworm projectile travel followed by yellow impact/effect frames.
    special: [
      { x: 8, y: 1025, width: 275, height: 220, duration: 120 },
      { x: 285, y: 1045, width: 160, height: 155, duration: 100 },
      { x: 450, y: 1045, width: 160, height: 155, duration: 100 },
      { x: 615, y: 1045, width: 160, height: 155, duration: 105 },
      { x: 785, y: 1025, width: 250, height: 220, duration: 140 },
      { x: 1040, y: 1025, width: 205, height: 220, duration: 170 },
    ],
  },
}



/*
 * Magma Lizard
 *
 * Supplied sheet: 1536 x 1024.
 * The sheet is explicitly divided into:
 * SPAWN / IDLE / ATTACK / HIT (DAMAGED) / DEFEATED / SPECIAL.
 *
 * The special sequence contains the lizard's fire projectile followed by
 * a fiery impact/crater effect, so it is kept as the dedicated special
 * animation instead of being mixed into the normal attack.
 */
const MAGMA_LIZARD: Beast = {
  name: 'Magma Lizard',
  sheet: '/assets/cavern/beasts/magma-lizard.png',
  sheetWidth: 1536,
  sheetHeight: 1024,

  animations: {
    // Six-frame emergence from a magma/crystal mound.
    spawn: [
      { x: 12, y: 38, width: 180, height: 150, duration: 140 },
      { x: 205, y: 35, width: 180, height: 150, duration: 140 },
      { x: 395, y: 28, width: 190, height: 160, duration: 150 },
      { x: 595, y: 20, width: 205, height: 170, duration: 160 },
      { x: 810, y: 18, width: 235, height: 172, duration: 170 },
      { x: 1045, y: 12, width: 265, height: 180, duration: 190 },
    ],

    // Five-frame fiery breathing/crawling loop.
    idle: [
      { x: 10, y: 210, width: 275, height: 165, duration: 180 },
      { x: 300, y: 210, width: 275, height: 165, duration: 180 },
      { x: 590, y: 205, width: 285, height: 170, duration: 180 },
      { x: 890, y: 205, width: 285, height: 170, duration: 180 },
      { x: 1190, y: 205, width: 330, height: 170, duration: 200 },
    ],

    // Bite/lunge sequence, ending with the long fire-breath frame.
    attack: [
      { x: 10, y: 385, width: 300, height: 170, duration: 120 },
      { x: 315, y: 385, width: 300, height: 170, duration: 130 },
      { x: 620, y: 375, width: 305, height: 180, duration: 140 },
      { x: 930, y: 375, width: 300, height: 180, duration: 150 },
      { x: 1235, y: 365, width: 300, height: 190, duration: 210 },
    ],

    // Dedicated damaged/recoil poses.
    hit: [
      { x: 10, y: 555, width: 285, height: 155, duration: 90 },
      { x: 305, y: 550, width: 285, height: 160, duration: 90 },
      { x: 600, y: 545, width: 300, height: 165, duration: 100 },
      { x: 915, y: 545, width: 300, height: 165, duration: 105 },
      { x: 1230, y: 545, width: 300, height: 165, duration: 120 },
    ],

    // Collapse into a smoldering body, then a fading magma mound.
    defeated: [
      { x: 10, y: 720, width: 275, height: 150, duration: 170 },
      { x: 300, y: 720, width: 275, height: 150, duration: 180 },
      { x: 590, y: 715, width: 275, height: 155, duration: 190 },
      { x: 880, y: 715, width: 275, height: 155, duration: 210 },
      { x: 1170, y: 715, width: 345, height: 155, duration: 250 },
    ],

    // Fire projectile travel followed by fiery crater/impact effects.
    special: [
      { x: 10, y: 875, width: 430, height: 145, duration: 120 },
      { x: 450, y: 885, width: 150, height: 120, duration: 95 },
      { x: 610, y: 885, width: 150, height: 120, duration: 95 },
      { x: 770, y: 885, width: 150, height: 120, duration: 100 },
      { x: 930, y: 875, width: 200, height: 145, duration: 120 },
      { x: 1135, y: 855, width: 190, height: 165, duration: 140 },
      { x: 1330, y: 855, width: 195, height: 165, duration: 170 },
    ],
  },
}



/*
 * Pink Rock Goblin
 *
 * Supplied sheet: 1254 x 1254.
 * The sheet is explicitly divided into the same six labeled phases:
 * SPAWN / IDLE / ATTACK / HIT (DAMAGED) / DEFEATED / SPECIAL.
 *
 * The goblin's special is a pink rock/energy projectile followed by
 * crystal-impact effects, so those frames are kept in the special state.
 */
const PINK_ROCK_GOBLIN: Beast = {
  name: 'Pink Rock Goblin',
  sheet: '/assets/cavern/beasts/pink-rock-goblin.png',
  sheetWidth: 1254,
  sheetHeight: 1254,

  animations: {
    // Crystal mound opens and the goblin climbs out.
    spawn: [
      { x: 8, y: 35, width: 195, height: 180, duration: 140 },
      { x: 210, y: 35, width: 205, height: 180, duration: 140 },
      { x: 425, y: 25, width: 205, height: 190, duration: 150 },
      { x: 640, y: 20, width: 210, height: 195, duration: 160 },
      { x: 860, y: 18, width: 205, height: 200, duration: 170 },
      { x: 1070, y: 5, width: 175, height: 215, duration: 190 },
    ],

    // Six-frame idle breathing/menacing loop.
    idle: [
      { x: 8, y: 235, width: 195, height: 190, duration: 180 },
      { x: 220, y: 235, width: 195, height: 190, duration: 180 },
      { x: 430, y: 235, width: 195, height: 190, duration: 180 },
      { x: 640, y: 235, width: 195, height: 190, duration: 180 },
      { x: 850, y: 235, width: 195, height: 190, duration: 180 },
      { x: 1060, y: 230, width: 190, height: 200, duration: 200 },
    ],

    // Goblin charges, swings, then unleashes the large pink rock wave.
    attack: [
      { x: 8, y: 445, width: 205, height: 185, duration: 120 },
      { x: 220, y: 445, width: 205, height: 185, duration: 130 },
      { x: 435, y: 440, width: 210, height: 190, duration: 140 },
      { x: 650, y: 435, width: 215, height: 195, duration: 150 },
      { x: 870, y: 430, width: 370, height: 205, duration: 220 },
    ],

    // Dedicated damaged/recoil poses.
    hit: [
      { x: 8, y: 650, width: 205, height: 185, duration: 90 },
      { x: 220, y: 645, width: 205, height: 190, duration: 90 },
      { x: 435, y: 645, width: 205, height: 190, duration: 100 },
      { x: 650, y: 640, width: 215, height: 195, duration: 105 },
      { x: 875, y: 640, width: 205, height: 195, duration: 115 },
      { x: 1085, y: 635, width: 160, height: 200, duration: 125 },
    ],

    // Goblin collapses, then becomes a pink crystal mound.
    defeated: [
      { x: 8, y: 850, width: 205, height: 165, duration: 170 },
      { x: 220, y: 850, width: 205, height: 165, duration: 180 },
      { x: 435, y: 850, width: 210, height: 165, duration: 190 },
      { x: 650, y: 850, width: 205, height: 165, duration: 210 },
      { x: 865, y: 850, width: 190, height: 165, duration: 220 },
      { x: 1065, y: 850, width: 180, height: 165, duration: 250 },
    ],

    // Pink energy/rock projectile travel followed by crystal impact.
    special: [
      { x: 8, y: 1040, width: 300, height: 205, duration: 120 },
      { x: 315, y: 1050, width: 175, height: 170, duration: 95 },
      { x: 500, y: 1050, width: 175, height: 170, duration: 95 },
      { x: 685, y: 1050, width: 175, height: 170, duration: 100 },
      { x: 870, y: 1040, width: 180, height: 205, duration: 140 },
      { x: 1060, y: 1040, width: 185, height: 205, duration: 170 },
    ],
  },
}


/*
 * Ice Tiger
 *
 * Supplied sheet: 1536 x 1024.
 * The sheet is explicitly divided into the six labeled phases:
 * SPAWN / IDLE / ATTACK / HIT (DAMAGED) / DEFEATED / SPECIAL.
 *
 * The Ice Tiger's special is a fast ice projectile followed by large
 * crystalline impact frames, so those frames stay isolated in `special`.
 */
const ICE_TIGER: Beast = {
  name: 'Ice Tiger',
  sheet: '/assets/cavern/beasts/ice-tiger.png',
  sheetWidth: 1536,
  sheetHeight: 1024,

  animations: {
    // Crystal mound -> spectral tiger -> fully emerged tiger.
    spawn: [
      { x: 8, y: 32, width: 165, height: 145, duration: 140 },
      { x: 185, y: 30, width: 175, height: 145, duration: 140 },
      { x: 370, y: 25, width: 185, height: 150, duration: 150 },
      { x: 565, y: 20, width: 215, height: 160, duration: 160 },
      { x: 795, y: 10, width: 255, height: 175, duration: 175 },
      { x: 1065, y: 5, width: 225, height: 180, duration: 185 },
      { x: 1300, y: 0, width: 230, height: 190, duration: 200 },
    ],

    // Six-frame icy stalking loop.
    idle: [
      { x: 10, y: 190, width: 300, height: 155, duration: 180 },
      { x: 320, y: 190, width: 260, height: 155, duration: 180 },
      { x: 590, y: 190, width: 250, height: 155, duration: 180 },
      { x: 850, y: 190, width: 245, height: 155, duration: 180 },
      { x: 1105, y: 190, width: 185, height: 155, duration: 180 },
      { x: 1300, y: 185, width: 225, height: 165, duration: 200 },
    ],

    // Leap/lunge sequence ending in the sweeping ice attack.
    attack: [
      { x: 8, y: 355, width: 300, height: 155, duration: 120 },
      { x: 320, y: 350, width: 275, height: 160, duration: 130 },
      { x: 605, y: 345, width: 285, height: 165, duration: 140 },
      { x: 900, y: 345, width: 290, height: 170, duration: 150 },
      { x: 1195, y: 335, width: 335, height: 180, duration: 210 },
    ],

    // Dedicated damaged/recoil poses.
    hit: [
      { x: 8, y: 525, width: 275, height: 165, duration: 90 },
      { x: 295, y: 525, width: 270, height: 165, duration: 90 },
      { x: 575, y: 520, width: 260, height: 170, duration: 100 },
      { x: 850, y: 520, width: 265, height: 170, duration: 105 },
      { x: 1125, y: 515, width: 205, height: 175, duration: 115 },
      { x: 1340, y: 515, width: 195, height: 175, duration: 125 },
    ],

    // Tiger collapses, freezes, and leaves an ice/crystal mound behind.
    defeated: [
      { x: 8, y: 705, width: 280, height: 145, duration: 170 },
      { x: 295, y: 705, width: 270, height: 145, duration: 180 },
      { x: 575, y: 705, width: 260, height: 145, duration: 190 },
      { x: 850, y: 705, width: 245, height: 145, duration: 210 },
      { x: 1110, y: 705, width: 230, height: 145, duration: 225 },
      { x: 1350, y: 700, width: 180, height: 150, duration: 250 },
    ],

    // Ice projectile travel followed by crystalline impact/explosion.
    special: [
      { x: 8, y: 865, width: 435, height: 155, duration: 120 },
      { x: 455, y: 875, width: 205, height: 145, duration: 95 },
      { x: 670, y: 875, width: 165, height: 145, duration: 95 },
      { x: 845, y: 875, width: 145, height: 145, duration: 100 },
      { x: 1000, y: 875, width: 125, height: 145, duration: 110 },
      { x: 1140, y: 855, width: 225, height: 165, duration: 140 },
      { x: 1375, y: 855, width: 160, height: 165, duration: 170 },
    ],
  },
}


/*
 * Corrupted Nature Guardian
 *
 * Supplied sheet: 1254 x 1254.
 * The artwork is explicitly divided into:
 * SPAWN / IDLE / ATTACK / HIT (DAMAGED) / DEFEATED / SPECIAL.
 *
 * This guardian is the final cavern beast and uses the same universal
 * animation contract as every earlier encounter.
 */
const CORRUPTED_NATURE_GUARDIAN: Beast = {
  name: 'Corrupted Nature Guardian',
  sheet: '/assets/cavern/beasts/corrupted-nature-guardian.png',
  sheetWidth: 1254,
  sheetHeight: 1254,

  animations: {
    // Corrupted crystal growth -> guardian rises out of the cavern.
    spawn: [
      { x: 5, y: 30, width: 190, height: 185, duration: 140 },
      { x: 165, y: 25, width: 225, height: 190, duration: 140 },
      { x: 355, y: 20, width: 255, height: 195, duration: 150 },
      { x: 565, y: 15, width: 250, height: 200, duration: 160 },
      { x: 770, y: 5, width: 285, height: 210, duration: 175 },
      { x: 1020, y: 0, width: 230, height: 215, duration: 190 },
    ],

    // Six-frame corrupted guardian breathing/stance loop.
    idle: [
      { x: 5, y: 215, width: 250, height: 220, duration: 180 },
      { x: 245, y: 215, width: 260, height: 220, duration: 180 },
      { x: 495, y: 215, width: 260, height: 220, duration: 180 },
      { x: 745, y: 215, width: 255, height: 220, duration: 180 },
      { x: 995, y: 215, width: 255, height: 220, duration: 180 },
    ],

    // Guardian lunges forward and releases a sweeping corrupted-energy attack.
    attack: [
      { x: 5, y: 425, width: 235, height: 245, duration: 120 },
      { x: 225, y: 425, width: 245, height: 245, duration: 130 },
      { x: 455, y: 425, width: 250, height: 245, duration: 140 },
      { x: 690, y: 425, width: 270, height: 245, duration: 150 },
      { x: 935, y: 425, width: 315, height: 245, duration: 210 },
    ],

    // Dedicated damaged/recoil frames.
    hit: [
      { x: 5, y: 660, width: 220, height: 205, duration: 90 },
      { x: 215, y: 660, width: 240, height: 205, duration: 90 },
      { x: 445, y: 660, width: 225, height: 205, duration: 100 },
      { x: 660, y: 660, width: 220, height: 205, duration: 105 },
      { x: 870, y: 660, width: 220, height: 205, duration: 110 },
      { x: 1075, y: 660, width: 175, height: 205, duration: 120 },
    ],

    // Guardian collapses into corrupted growth and leaves a crystal remnant.
    defeated: [
      { x: 5, y: 850, width: 220, height: 185, duration: 170 },
      { x: 215, y: 850, width: 230, height: 185, duration: 180 },
      { x: 435, y: 850, width: 235, height: 185, duration: 190 },
      { x: 660, y: 850, width: 220, height: 185, duration: 210 },
      { x: 870, y: 850, width: 220, height: 185, duration: 225 },
      { x: 1070, y: 850, width: 180, height: 185, duration: 250 },
    ],

    // Corrupted nature projectile followed by purple crystal impacts.
    special: [
      { x: 5, y: 1030, width: 260, height: 220, duration: 120 },
      { x: 255, y: 1030, width: 195, height: 220, duration: 100 },
      { x: 440, y: 1030, width: 180, height: 220, duration: 100 },
      { x: 610, y: 1030, width: 175, height: 220, duration: 100 },
      { x: 775, y: 1030, width: 150, height: 220, duration: 105 },
      { x: 910, y: 1030, width: 175, height: 220, duration: 140 },
      { x: 1060, y: 1030, width: 194, height: 220, duration: 170 },
    ],
  },
}

const BEASTS: Beast[] = [
  RADIOACTIVE_BAT,
  CAVERN_SPIDER,
  ONE_EYED_CRAWLER,
  PURPLE_CAVE_SCORPION,
  STONE_SERPENT,
  YELLOW_GLOWWORM_BEAST,
  MAGMA_LIZARD,
  PINK_ROCK_GOBLIN,
  ICE_TIGER,
  CORRUPTED_NATURE_GUARDIAN,
]

const WIZARD_SHEET = '/assets/cavern/beasts/wizard.png'
const CAVERN_BACKDROP = '/assets/cavern/backgrounds/cavern-backdrop.png'
const CAVERN_ESCAPED = '/assets/cavern/backgrounds/cavern-escaped.png'

const BACKGROUNDS = [CAVERN_BACKDROP]

const getPrompt = (q: CavernQuestion) => q.prompt ?? q.question ?? ''

const getChoices = (q: CavernQuestion) =>
  q.choices ?? q.options ?? []

const getCorrectIndex = (q: CavernQuestion, choices: string[]) => {
  const answer = q.correctAnswer ?? q.correct_answer ?? q.answer

  if (typeof answer === 'number') {
    return answer >= 0 && answer < choices.length ? answer : -1
  }

  if (typeof answer === 'string') {
    const exact = choices.findIndex(choice => choice === answer)
    if (exact !== -1) return exact

    const normalized = answer.trim().toLowerCase()
    return choices.findIndex(choice => choice.trim().toLowerCase() === normalized)
  }

  return -1
}

type SpriteProps = {
  beast: Beast
  animation: keyof BeastAnimations
  playing?: boolean
  className?: string
}

/*
 * Generic sprite-sheet renderer.
 *
 * Every beast gets rendered through this component, so once we add the
 * other nine sheets we do not need to write nine separate animation systems.
 */
function BeastSprite({
  beast,
  animation,
  playing = true,
}: SpriteProps) {
  const frames = beast.animations[animation]
  const [frameIndex, setFrameIndex] = useState(0)

  useEffect(() => {
    setFrameIndex(0)

    if (!playing || frames.length <= 1) return

    let cancelled = false
    let timer: number | undefined

    const advance = (index: number) => {
      const duration = frames[index]?.duration ?? 160

      timer = window.setTimeout(() => {
        if (cancelled) return

        const next = (index + 1) % frames.length
        setFrameIndex(next)
        advance(next)
      }, duration)
    }

    advance(0)

    return () => {
      cancelled = true
      if (timer) window.clearTimeout(timer)
    }
  }, [animation, beast.name, frames, playing])

  const frame = frames[Math.min(frameIndex, frames.length - 1)]

  /*
   * Give every crop a tiny safety gutter. The supplied sheets place some
   * frames very close together, so this prevents a neighbouring sprite or
   * phase label from bleeding into the battle area.
   */
  // The sheets sit very close to one another, and several of them have
  // phase labels immediately above the first frame. A larger safety gutter
  // keeps neighbouring art/labels out of the visible crop.
  const crop = Math.min(10, Math.floor(frame.width / 8), Math.floor(frame.height / 8))
  const cropX = frame.x + crop
  const cropY = frame.y + crop
  const cropWidth = Math.max(1, frame.width - crop * 2)
  const cropHeight = Math.max(1, frame.height - crop * 2)
  const beastFacesLeft = beast.name !== 'Giant Radioactive Bat'

  /*
   * Scale the cropped frame into a consistent 250 x 220 battle area while
   * keeping its aspect ratio.
   */
  const scale = Math.min(240 / cropWidth, 205 / cropHeight)
  const displayWidth = Math.max(1, cropWidth * scale)
  const displayHeight = Math.max(1, cropHeight * scale)

  return (
    <div
      aria-label={beast.name}
      role="img"
      style={{
        width: displayWidth,
        height: displayHeight,
        overflow: 'hidden',
        position: 'relative',
        flex: '0 0 auto',
      }}
    >
      <div
        style={{
          position: 'absolute',
          width: beast.sheetWidth * scale,
          height: beast.sheetHeight * scale,
          left: -cropX * scale,
          top: -cropY * scale,
          backgroundImage: `url("${beast.sheet}")`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: `${beast.sheetWidth * scale}px ${beast.sheetHeight * scale}px`,
          backgroundPosition: '0 0',
          transform: beastFacesLeft ? 'scaleX(-1)' : undefined,
          transformOrigin: 'center',
        }}
      />
    </div>
  )
}



type WizardAnimation = 'idle' | 'attack' | 'hit' | 'victory'

type WizardFrame = {
  x: number
  y: number
  width: number
  height: number
  duration?: number
}

const WIZARD_ANIMATIONS: Record<WizardAnimation, WizardFrame[]> = {
  // The label on the left of the sheet is intentionally excluded from every crop.
  idle: [
    { x: 171, y: 10, width: 145, height: 198, duration: 180 },
    { x: 357, y: 10, width: 142, height: 198, duration: 180 },
    { x: 542, y: 9, width: 123, height: 199, duration: 180 },
    { x: 700, y: 10, width: 152, height: 197, duration: 180 },
    { x: 882, y: 10, width: 150, height: 198, duration: 180 },
    { x: 1054, y: 14, width: 152, height: 193, duration: 180 },
    { x: 1229, y: 10, width: 145, height: 198, duration: 200 },
  ],
  attack: [
    { x: 165, y: 210, width: 200, height: 195, duration: 120 },
    { x: 385, y: 210, width: 190, height: 195, duration: 130 },
    { x: 600, y: 210, width: 205, height: 195, duration: 140 },
    { x: 820, y: 210, width: 205, height: 195, duration: 150 },
    { x: 1045, y: 210, width: 205, height: 195, duration: 160 },
    { x: 1270, y: 210, width: 265, height: 195, duration: 190 },
  ],
  hit: [
    { x: 171, y: 412, width: 145, height: 174, duration: 110 },
    { x: 391, y: 405, width: 172, height: 185, duration: 110 },
    { x: 634, y: 445, width: 174, height: 139, duration: 120 },
    { x: 874, y: 473, width: 208, height: 117, duration: 120 },
    { x: 1111, y: 415, width: 141, height: 172, duration: 130 },
  ],
  victory: [
    { x: 160, y: 600, width: 210, height: 220, duration: 150 },
    { x: 371, y: 612, width: 188, height: 201, duration: 150 },
    { x: 639, y: 597, width: 190, height: 217, duration: 160 },
    { x: 896, y: 592, width: 220, height: 224, duration: 170 },
    { x: 1114, y: 598, width: 167, height: 214, duration: 200 },
  ],
}

function WizardSprite({ animation }: { animation: WizardAnimation }) {
  const frames = WIZARD_ANIMATIONS[animation]
  const [frameIndex, setFrameIndex] = useState(0)

  useEffect(() => {
    setFrameIndex(0)
    if (frames.length <= 1) return

    let cancelled = false
    let timer: number | undefined

    const advance = (index: number) => {
      timer = window.setTimeout(() => {
        if (cancelled) return
        const next = (index + 1) % frames.length
        setFrameIndex(next)
        advance(next)
      }, frames[index]?.duration ?? 160)
    }

    advance(0)
    return () => {
      cancelled = true
      if (timer) window.clearTimeout(timer)
    }
  }, [animation, frames])

  const frame = frames[Math.min(frameIndex, frames.length - 1)]
  const crop = Math.min(6, Math.floor(frame.width / 10), Math.floor(frame.height / 10))
  const cropX = frame.x + crop
  const cropY = frame.y + crop
  const cropWidth = Math.max(1, frame.width - crop * 2)
  const cropHeight = Math.max(1, frame.height - crop * 2)
  const scale = Math.min(190 / cropWidth, 205 / cropHeight)
  const displayWidth = Math.max(1, cropWidth * scale)
  const displayHeight = Math.max(1, cropHeight * scale)

  return (
    <div
      aria-label="Wizard"
      role="img"
      style={{
        width: displayWidth,
        height: displayHeight,
        overflow: 'hidden',
        position: 'relative',
        flex: '0 0 auto',
        filter: 'drop-shadow(0 12px 16px rgba(0,0,0,.7))',
      }}
    >
      <div
        style={{
          position: 'absolute',
          width: 1536 * scale,
          height: 1024 * scale,
          left: -cropX * scale,
          top: -cropY * scale,
          backgroundImage: `url("${WIZARD_SHEET}")`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: `${1536 * scale}px ${1024 * scale}px`,
          backgroundPosition: '0 0',
        }}
      />
    </div>
  )
}

export default function CavernCombat({
  questions,
  onComplete,
  assignmentTitle = 'Cavern Combat',
  onExit,
}: CavernCombatProps) {
  const safeQuestions = Array.isArray(questions) ? questions : []

  const [questionIndex, setQuestionIndex] = useState(0)
  const [score, setScore] = useState(0)
    const [phase, setPhase] = useState<GamePhase>('appearing')
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null)

  const question = safeQuestions[questionIndex]
  const choices = useMemo(() => getChoices(question ?? {}), [question])

  /*
   * The 10-question run cycles through the 10-beast roster.
   * Once the other nine are added, this becomes:
   *
   * question 1  -> beast 1
   * question 2  -> beast 2
   * ...
   * question 10 -> beast 10
   * question 11 -> beast 1 again
   */
  const beast = BEASTS[questionIndex % BEASTS.length]
  const background =
    BACKGROUNDS[Math.floor(questionIndex / 3) % BACKGROUNDS.length]

  useEffect(() => {
    if (!question) return

    setPhase('appearing')
    setSelectedIndex(null)
    setLastCorrect(null)

    const timer = window.setTimeout(() => {
      setPhase('question')
    }, 1500)

    return () => window.clearTimeout(timer)
  }, [questionIndex, question])

  useEffect(() => {
    if (phase !== 'attacking') return

    /*
     * Wrong answer:
     * the monster gets its attack animation, then we return to the
     * question. The player does NOT lose the question.
     */
    const timer = window.setTimeout(() => {
      setPhase('question')
      setSelectedIndex(null)
      setLastCorrect(null)
    }, 1150)

    return () => window.clearTimeout(timer)
  }, [phase])

  useEffect(() => {
    if (phase !== 'hit') return

    const timer = window.setTimeout(() => {
      setPhase('defeated')
    }, 800)

    return () => window.clearTimeout(timer)
  }, [phase])

  useEffect(() => {
    if (phase !== 'defeated') return

    const timer = window.setTimeout(() => {
      if (questionIndex >= safeQuestions.length - 1) {
        setPhase('complete')
        onComplete(score, safeQuestions.length)
      } else {
        setQuestionIndex(current => current + 1)
      }
    }, 1050)

    return () => window.clearTimeout(timer)
  }, [phase, questionIndex, safeQuestions.length, score, onComplete])

  if (safeQuestions.length === 0) {
    return (
      <div style={styles.empty}>
        <div style={styles.emptyIcon}>⚔️</div>
        <h2>No questions found</h2>
        <p>This cavern is suspiciously empty.</p>
      </div>
    )
  }

  if (phase === 'complete') {
    const accuracy = safeQuestions.length > 0
      ? Math.round((score / safeQuestions.length) * 100)
      : 0

    return (
      <div
        className="cavern-combat"
        style={{
          ...styles.shell,
          ...styles.finishShell,
          backgroundImage: `linear-gradient(rgba(4, 5, 15, .25), rgba(4, 5, 15, .82)), url("${CAVERN_ESCAPED}")`,
        }}
      >
        <div style={styles.finishCard}>
          <div style={styles.finishIcon}><WizardSprite animation="victory" /></div>
          <div style={styles.finishKicker}>CAVERN ESCAPED</div>
          <h1 style={styles.finishTitle}>YOU MADE IT OUT!</h1>
          <p style={styles.finishText}>The cavern falls silent behind you.</p>

          <div style={styles.finishStats}>
            <div style={styles.finishStat}>
              <span style={styles.finishStatLabel}>SCORE</span>
              <strong style={styles.finishStatValue}>{score}/{safeQuestions.length}</strong>
            </div>
            <div style={styles.finishStat}>
              <span style={styles.finishStatLabel}>ACCURACY</span>
              <strong style={styles.finishStatValue}>{accuracy}%</strong>
            </div>
          </div>

          <div style={styles.finishActions}>
            <button
              type="button"
              onClick={() => {
                setQuestionIndex(0)
                setScore(0)
                setSelectedIndex(null)
                setLastCorrect(null)
                setPhase('appearing')
              }}
              style={{ ...styles.finishButton, ...styles.finishPrimary }}
            >
              ⚔️ PLAY AGAIN
            </button>
            <button
              type="button"
              onClick={() => onExit?.()}
              style={{ ...styles.finishButton, ...styles.finishSecondary }}
            >
              ← BACK TO DASHBOARD
            </button>
          </div>
        </div>
      </div>
    )
  }

  const handleAnswer = (choiceIndex: number) => {
    if (phase !== 'question' || selectedIndex !== null) return

    const correctIndex = getCorrectIndex(question, choices)
    const correct = choiceIndex === correctIndex

    setSelectedIndex(choiceIndex)
    setLastCorrect(correct)

    if (correct) {
      setScore(current => current + 1)
      setPhase('hit')
    } else {
      setPhase('attacking')
    }
  }

  const progress = ((questionIndex + 1) / safeQuestions.length) * 100

  const currentAnimation: keyof BeastAnimations =
    phase === 'appearing'
      ? 'spawn'
      : phase === 'attacking'
        ? 'attack'
        : phase === 'hit'
          ? 'hit'
          : phase === 'defeated'
            ? 'defeated'
            : 'idle'

  return (
    <div
      className="cavern-combat"
      style={{
        ...styles.shell,
        backgroundImage: `linear-gradient(rgba(4, 5, 15, 0.42), rgba(4, 5, 15, 0.82)), url("${background}")`,
      }}
    >
      <style>{`
        @keyframes cavernFadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes wildAppear {
          0% { opacity: 0; transform: scale(.55) translateY(30px); filter: brightness(2) blur(5px); }
          55% { opacity: 1; transform: scale(1.08) translateY(-4px); filter: brightness(1.35) blur(0); }
          100% { opacity: 1; transform: scale(1) translateY(0); filter: brightness(1); }
        }

        @keyframes playerAttack {
          0% { transform: translateX(0) rotate(0); }
          35% { transform: translateX(32px) rotate(-4deg); }
          55% { transform: translateX(-14px) rotate(3deg); }
          100% { transform: translateX(0) rotate(0); }
        }

        @keyframes beastAttack {
          0% { transform: translateX(0) scale(1); }
          28% { transform: translateX(-28px) scale(1.04); }
          52% { transform: translateX(24px) scale(1.08); }
          76% { transform: translateX(-10px) scale(1.02); }
          100% { transform: translateX(0) scale(1); }
        }

        @keyframes hitFlash {
          0%, 100% { filter: brightness(1); }
          25% { filter: brightness(2.2); }
          50% { filter: brightness(.55); }
          75% { filter: brightness(1.8); }
        }

        @keyframes defeatedStage {
          0% { opacity: 1; transform: translateY(0) scale(1); }
          100% { opacity: .35; transform: translateY(12px) scale(.88); filter: grayscale(1); }
        }

        @keyframes slash {
          0% { opacity: 0; transform: scale(.4) rotate(-20deg); }
          30% { opacity: 1; transform: scale(1.1) rotate(8deg); }
          100% { opacity: 0; transform: scale(1.4) rotate(20deg); }
        }

        @keyframes bannerIn {
          0% { opacity: 0; transform: translateX(-50%) scaleX(.4); }
          20% { opacity: 1; transform: translateX(-50%) scaleX(1); }
          75% { opacity: 1; transform: translateX(-50%) scaleX(1); }
          100% { opacity: 0; transform: translateX(-50%) scaleX(1.05); }
        }

        @keyframes answerPop {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .cavern-answer:hover:not(:disabled) {
          transform: translateY(-3px);
          border-color: rgba(177, 140, 255, .95) !important;
          box-shadow: 0 0 22px rgba(124, 92, 255, .22);
        }

        .cavern-answer:disabled {
          cursor: default;
        }
      `}</style>

      <header style={styles.header}>
        <div>
          <div style={styles.kicker}>⚔️ CAVERN COMBAT</div>
          <h1 style={styles.title}>{assignmentTitle}</h1>
        </div>

        <div style={styles.counter}>
          BEAST {questionIndex + 1} / {safeQuestions.length}
        </div>
      </header>

      <div style={styles.progressTrack}>
        <div
          style={{
            ...styles.progressFill,
            width: `${Math.min(progress, 100)}%`,
          }}
        />
      </div>

      <main style={styles.main}>
        <div style={styles.beastStage}>
          <div
            style={{
              ...styles.player,
              animation:
                phase === 'attacking' ? 'playerAttack .7s ease-in-out' : undefined,
            }}
          >
            <div style={styles.playerSprite}><WizardSprite animation={phase === 'attacking' ? 'hit' : phase === 'hit' ? 'attack' : phase === 'defeated' ? 'victory' : 'idle'} /></div>
            <div style={styles.playerLabel}>YOU</div>
          </div>

          <div style={styles.vs}>VS</div>

          <div style={styles.beastWrap}>
            {phase === 'appearing' && (
              <div style={styles.appearBanner}>
                <span>A WILD {beast.name.toUpperCase()} APPEARED!</span>
              </div>
            )}

            {phase === 'hit' && (
              <div style={styles.slash}>⚔️</div>
            )}

            <div
              style={{
                ...styles.beast,
                animation:
                  phase === 'appearing'
                    ? 'wildAppear .9s ease-out both'
                    : phase === 'attacking'
                      ? 'beastAttack .85s ease-in-out'
                      : phase === 'hit'
                        ? 'hitFlash .55s ease-in-out'
                        : phase === 'defeated'
                          ? 'defeatedStage .9s ease-in forwards'
                          : undefined,
              }}
            >
              <BeastSprite
                beast={beast}
                animation={currentAnimation}
                playing
              />
            </div>

            <div style={styles.beastName}>
              {beast.name.toUpperCase()}
            </div>
          </div>
        </div>

        {phase === 'appearing' ? (
          <div style={styles.waiting}>
            <div style={styles.dots}>•••</div>
            <div>Prepare yourself...</div>
          </div>
        ) : phase === 'attacking' ? (
          <div style={styles.defeated}>
            <div style={styles.attackTitle}>☢️ THE BEAST ATTACKS!</div>
            <div>That answer wasn't enough to defeat it...</div>
          </div>
        ) : phase === 'hit' ? (
          <div style={styles.defeated}>
            <div style={styles.hitTitle}>⚡ DIRECT HIT!</div>
            <div>The beast is reeling...</div>
          </div>
        ) : phase === 'defeated' ? (
          <div style={styles.defeated}>
            <div style={styles.defeatedTitle}>⚔️ BEAST DEFEATED!</div>
            <div>Venturing deeper into the cavern...</div>
          </div>
        ) : (
          <section style={styles.questionCard}>
            <div style={styles.questionNumber}>
              ENCOUNTER {questionIndex + 1}
            </div>

            <h2 style={styles.question}>{getPrompt(question)}</h2>

            <div style={styles.answers}>
              {choices.map((choice, index) => {
                const isSelected = selectedIndex === index
                const correctIndex = getCorrectIndex(question, choices)
                const showCorrect =
                  selectedIndex !== null && index === correctIndex
                const showWrong = isSelected && lastCorrect === false

                return (
                  <button
                    key={`${questionIndex}-${index}`}
                    className="cavern-answer"
                    type="button"
                    disabled={selectedIndex !== null}
                    onClick={() => handleAnswer(index)}
                    style={{
                      ...styles.answer,
                      ...(isSelected ? styles.answerSelected : {}),
                      ...(showCorrect ? styles.answerCorrect : {}),
                      ...(showWrong ? styles.answerWrong : {}),
                      animation: 'answerPop .35s ease-out both',
                      animationDelay: `${index * 55}ms`,
                    }}
                  >
                    <span style={styles.answerLetter}>
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span>{choice}</span>
                  </button>
                )
              })}
            </div>
          </section>
        )}
      </main>

      <footer style={styles.footer}>
        <div style={styles.footerProgress}>
          {Array.from({ length: 10 }, (_, index) => {
            const encounter = index + 1
            const completed = encounter <= questionIndex
            const current =
              encounter === (questionIndex % 10) + 1

            return (
              <React.Fragment key={encounter}>
                <div
                  style={{
                    ...styles.pathNode,
                    ...(completed ? styles.pathCompleted : {}),
                    ...(current ? styles.pathCurrent : {}),
                  }}
                >
                  {completed ? '✓' : encounter}
                </div>
                {index < 9 && <div style={styles.pathLine} />}
              </React.Fragment>
            )
          })}
        </div>

        <div style={styles.score}>
          SCORE <strong>{score}/{safeQuestions.length}</strong>
        </div>
      </footer>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  shell: {
    height: '100dvh',
    minHeight: 0,
    width: '100%',
    color: '#f4f1ff',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed',
    fontFamily: 'Arial, sans-serif',
    overflow: 'hidden',
    position: 'relative',
    boxSizing: 'border-box',
    padding: '12px clamp(14px, 3vw, 36px) 10px',
    display: 'flex',
    flexDirection: 'column',
  },

  header: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 20,
    maxWidth: 1180,
    width: '100%',
    margin: '0 auto 6px',
  },

  kicker: {
    color: '#b9a2ff',
    fontSize: 12,
    letterSpacing: 3,
    fontWeight: 800,
  },

  title: {
    margin: '5px 0 0',
    fontSize: 'clamp(20px, 3vw, 32px)',
    letterSpacing: 1,
  },

  counter: {
    padding: '10px 14px',
    border: '1px solid rgba(180, 157, 255, .35)',
    background: 'rgba(8, 7, 22, .72)',
    fontSize: 12,
    letterSpacing: 2,
    fontWeight: 800,
    whiteSpace: 'nowrap',
  },

  progressTrack: {
    maxWidth: 1180,
    width: '100%',
    height: 4,
    margin: '0 auto 8px',
    background: 'rgba(255,255,255,.12)',
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #7c5cff, #e6d9ff)',
    transition: 'width .55s ease',
  },

  main: {
    maxWidth: 1180,
    width: '100%',
    margin: '0 auto',
    flex: '1 1 auto',
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
  },

  beastStage: {
    minHeight: 235,
    height: 235,
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'clamp(20px, 8vw, 120px)',
    padding: '6px 10px 10px',
    animation: 'cavernFadeIn .5s ease-out',
  },

  player: {
    width: 180,
    textAlign: 'center',
    opacity: .9,
  },

  playerSprite: {
    width: 180,
    height: 205,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  playerLabel: {
    marginTop: 4,
    fontSize: 11,
    letterSpacing: 3,
    color: '#cbbcff',
    fontWeight: 800,
  },

  vs: {
    color: 'rgba(255,255,255,.35)',
    fontWeight: 900,
    letterSpacing: 2,
  },

  beastWrap: {
    width: 250,
    minHeight: 225,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  beast: {
    width: 235,
    height: 205,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    filter: 'drop-shadow(0 14px 18px rgba(0,0,0,.7))',
  },

  beastName: {
    marginTop: 4,
    fontSize: 12,
    letterSpacing: 3,
    fontWeight: 900,
    color: '#f3eaff',
    textShadow: '0 2px 10px rgba(0,0,0,.8)',
    textAlign: 'center',
  },

  appearBanner: {
    position: 'absolute',
    top: 5,
    left: '50%',
    width: 'min(92vw, 700px)',
    padding: '14px 18px',
    borderTop: '1px solid rgba(218,203,255,.55)',
    borderBottom: '1px solid rgba(218,203,255,.55)',
    background: 'rgba(7, 6, 19, .88)',
    textAlign: 'center',
    zIndex: 5,
    animation: 'bannerIn 1.5s ease-out both',
    boxSizing: 'border-box',
    fontSize: 13,
    fontWeight: 900,
    letterSpacing: 2,
  },

  slash: {
    position: 'absolute',
    zIndex: 6,
    fontSize: 90,
    animation: 'slash .7s ease-out both',
  },

  waiting: {
    minHeight: 170,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    color: '#cfc7e8',
    letterSpacing: 2,
    fontSize: 13,
    textTransform: 'uppercase',
  },

  dots: {
    fontSize: 26,
    letterSpacing: 8,
    color: '#ad91ff',
  },

  defeated: {
    minHeight: 170,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    animation: 'cavernFadeIn .35s ease-out',
    textTransform: 'uppercase',
    letterSpacing: 2,
    color: '#cfc7e8',
    fontSize: 12,
    textAlign: 'center',
  },

  attackTitle: {
    fontSize: 22,
    fontWeight: 900,
    color: '#ffca8a',
  },

  hitTitle: {
    fontSize: 22,
    fontWeight: 900,
    color: '#9ff5c1',
  },

  defeatedTitle: {
    fontSize: 22,
    fontWeight: 900,
    color: '#e7dcff',
  },

  questionCard: {
    maxWidth: 860,
    width: '100%',
    margin: '0 auto',
    padding: '14px clamp(14px, 3vw, 26px) 16px',
    boxSizing: 'border-box',
    background: 'rgba(7, 6, 19, .88)',
    border: '1px solid rgba(166, 139, 255, .34)',
    boxShadow: '0 18px 50px rgba(0,0,0,.35)',
    animation: 'cavernFadeIn .4s ease-out',
  },

  questionNumber: {
    color: '#a991ef',
    fontSize: 9,
    letterSpacing: 3,
    fontWeight: 900,
    marginBottom: 10,
  },

  question: {
    margin: 0,
    fontSize: 'clamp(17px, 2.4vw, 24px)',
    lineHeight: 1.3,
  },

  answers: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 8,
    marginTop: 14,
  },

  answer: {
    minHeight: 48,
    border: '1px solid rgba(139, 119, 214, .35)',
    background: 'rgba(15, 13, 34, .92)',
    color: '#f1edff',
    padding: '10px 14px',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    textAlign: 'left',
    cursor: 'pointer',
    fontSize: 14,
    transition: 'transform .15s ease, border-color .15s ease, box-shadow .15s ease',
  },

  answerSelected: {
    borderColor: '#b8a0ff',
  },

  answerCorrect: {
    borderColor: '#78e0a3',
    background: 'rgba(44, 112, 73, .3)',
  },

  answerWrong: {
    borderColor: '#ff7272',
    background: 'rgba(120, 36, 36, .3)',
  },

  answerLetter: {
    width: 28,
    height: 28,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid rgba(186, 166, 255, .4)',
    color: '#c8b7ff',
    fontWeight: 900,
    flex: '0 0 auto',
  },

  footer: {
  maxWidth: 1180,
  width: '100%',
  margin: '8px auto 0',
  flex: '0 0 auto',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 20,
},

  footerProgress: {
    display: 'flex',
    minWidth: 0,
    alignItems: 'center',
    flex: 1,
    maxWidth: 900,
    overflow: 'hidden',
  },

  pathNode: {
    width: 23,
    height: 23,
    flex: '0 0 23px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    border: '1px solid rgba(176, 155, 255, .3)',
    background: 'rgba(8, 7, 22, .75)',
    color: 'rgba(255,255,255,.5)',
    fontSize: 10,
    fontWeight: 900,
  },

  pathCompleted: {
    borderColor: 'rgba(140, 235, 177, .7)',
    color: '#9cf1bd',
    background: 'rgba(57, 115, 80, .35)',
  },

  pathCurrent: {
    borderColor: '#c0a9ff',
    color: '#fff',
    boxShadow: '0 0 15px rgba(151, 119, 255, .45)',
  },

  pathLine: {
    height: 1,
    flex: 1,
    minWidth: 5,
    background: 'rgba(176, 155, 255, .22)',
  },

  score: {
    color: '#a99cc6',
    fontSize: 10,
    letterSpacing: 2,
    whiteSpace: 'nowrap',
  },

  finishShell: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '18px 14px',
  },

  finishCard: {
    width: 'min(680px, 100%)',
    padding: '28px clamp(18px, 5vw, 44px)',
    background: 'rgba(7, 6, 19, .9)',
    border: '1px solid rgba(176, 155, 255, .48)',
    boxShadow: '0 0 50px rgba(124, 92, 255, .18), 0 24px 70px rgba(0,0,0,.55)',
    textAlign: 'center',
    animation: 'cavernFadeIn .6s ease-out',
  },

  finishIcon: {
    height: 170,
    marginBottom: 6,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  finishKicker: {
    color: '#b9a2ff',
    fontSize: 11,
    letterSpacing: 4,
    fontWeight: 900,
  },

  finishTitle: {
    margin: '10px 0 8px',
    fontSize: 'clamp(30px, 6vw, 54px)',
    letterSpacing: 2,
    textShadow: '0 0 18px rgba(186, 160, 255, .45)',
  },

  finishText: {
    margin: 0,
    color: '#aaa0c9',
    fontSize: 13,
  },

  finishStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 12,
    margin: '18px auto',
    maxWidth: 420,
  },

  finishStat: {
    padding: '12px 10px',
    border: '1px solid rgba(166, 139, 255, .28)',
    background: 'rgba(15, 13, 34, .8)',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },

  finishStatLabel: {
    color: '#8f83ac',
    fontSize: 9,
    letterSpacing: 3,
    fontWeight: 900,
  },

  finishStatValue: {
    color: '#f3eaff',
    fontSize: 24,
  },

  finishActions: {
    display: 'flex',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 12,
  },

  finishButton: {
    minWidth: 190,
    minHeight: 48,
    padding: '12px 18px',
    cursor: 'pointer',
    fontWeight: 900,
    letterSpacing: 1.5,
    transition: 'transform .15s ease, box-shadow .15s ease',
  },

  finishPrimary: {
    border: '1px solid #b8a0ff',
    background: 'rgba(124, 92, 255, .18)',
    color: '#f3eaff',
    boxShadow: '0 0 18px rgba(124, 92, 255, .2)',
  },

  finishSecondary: {
    border: '1px solid rgba(176, 155, 255, .35)',
    background: 'rgba(15, 13, 34, .75)',
    color: '#b8add2',
  },

  empty: {
    minHeight: 400,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#ddd5f5',
    textAlign: 'center',
    fontFamily: 'Arial, sans-serif',
  },

  emptyIcon: {
    fontSize: 70,
  },
}

export { BEASTS, CAVERN_SPIDER, ONE_EYED_CRAWLER, ICE_TIGER }