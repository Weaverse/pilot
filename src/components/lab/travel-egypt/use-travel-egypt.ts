import { useEffect, useReducer, useRef, useState } from 'react'
import { GameAudio, MUSIC } from '~/lib/lab/travel-egypt/audio'
import {
  canMove,
  isWin,
  shuffleBoard,
  slide,
  tileForDirection,
} from '~/lib/lab/travel-egypt/board'
import { SHUFFLE_MOVES, TOTAL_LEVELS } from '~/lib/lab/travel-egypt/constants'
import { getLevel } from '~/lib/lab/travel-egypt/levels'
import type {
  Board,
  Mode,
  Phase,
  RunStats,
  SlideDirection,
} from '~/lib/lab/travel-egypt/types'

interface State {
  phase: Phase
  /** 1-based current level. */
  levelNo: number
  /** Highest unlocked level; gates the Next button. */
  reachedLevel: number
  mode: Mode
  board: Board
  /** Moves made on the current level (shown in the HUD). */
  levelMoves: number
  /** Moves made across the whole run (shown on the ending card). */
  totalMoves: number
  /** `performance.now()` when the run began. */
  runStartedAt: number
  /** Finalized once the run is won. */
  stats: RunStats | null
}

type Action =
  | { type: 'start' }
  | { type: 'select-mode'; mode: Mode }
  | { type: 'tap'; index: number }
  | { type: 'goto-level'; no: number }
  | { type: 'restart' }
  | { type: 'finish-ending' }
  | { type: 'play-again' }
  | { type: 'quit' }

function createInitialState(): State {
  return {
    phase: 'welcome',
    levelNo: 1,
    reachedLevel: 1,
    mode: 'easy',
    board: [],
    levelMoves: 0,
    totalMoves: 0,
    runStartedAt: 0,
    stats: null,
  }
}

function freshBoard(no: number, mode: Mode): Board {
  const { size } = getLevel(no)
  return shuffleBoard(size, SHUFFLE_MOVES[size][mode])
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'start':
      return { ...state, phase: 'mode-select' }

    case 'select-mode':
      return {
        ...state,
        phase: 'playing',
        mode: action.mode,
        levelNo: 1,
        reachedLevel: 1,
        board: freshBoard(1, action.mode),
        levelMoves: 0,
        totalMoves: 0,
        runStartedAt: performance.now(),
        stats: null,
      }

    case 'tap': {
      if (state.phase !== 'playing') return state
      const { size } = getLevel(state.levelNo)
      const next = slide(state.board, action.index, size)
      if (next === state.board) return state
      const levelMoves = state.levelMoves + 1
      const totalMoves = state.totalMoves + 1
      if (isWin(next)) {
        if (state.levelNo >= TOTAL_LEVELS) {
          return {
            ...state,
            board: next,
            levelMoves,
            totalMoves,
            phase: 'ending',
            stats: {
              moves: totalMoves,
              elapsedMs: performance.now() - state.runStartedAt,
            },
          }
        }
        return {
          ...state,
          board: next,
          levelMoves,
          totalMoves,
          phase: 'level-cleared',
          reachedLevel: Math.max(state.reachedLevel, state.levelNo + 1),
        }
      }
      return { ...state, board: next, levelMoves, totalMoves }
    }

    case 'goto-level': {
      const no = action.no
      if (no < 1 || no > TOTAL_LEVELS) return state
      return {
        ...state,
        phase: 'playing',
        levelNo: no,
        board: freshBoard(no, state.mode),
        levelMoves: 0,
        reachedLevel: Math.max(state.reachedLevel, no),
      }
    }

    case 'restart':
      return {
        ...state,
        phase: 'playing',
        board: freshBoard(state.levelNo, state.mode),
        levelMoves: 0,
      }

    case 'finish-ending':
      return { ...state, phase: 'done' }

    case 'play-again':
      return { ...createInitialState(), phase: 'mode-select' }

    case 'quit':
      return createInitialState()
  }
}

export function useTravelEgypt() {
  const audioRef = useRef<GameAudio | null>(null)
  if (audioRef.current === null) audioRef.current = new GameAudio()
  const audio = audioRef.current

  const [state, dispatch] = useReducer(reducer, undefined, createInitialState)
  // Muted by default; the player can turn the music on from the HUD.
  const [muted, setMuted] = useState(true)

  const { phase, levelNo } = state
  const level = getLevel(levelNo)
  const size = level.size

  // Music follows the phase/level. The first sound is unlocked by the `start`
  // gesture below, so these effect-driven plays are not blocked by autoplay.
  useEffect(() => {
    if (phase === 'mode-select') audio.playMusic(MUSIC.menu)
    else if (phase === 'playing') audio.playMusic(level.music)
    else if (phase === 'level-cleared')
      audio.playMusic(MUSIC.levelPass, { loop: false })
    else if (phase === 'welcome' || phase === 'ending' || phase === 'done')
      audio.stopMusic()
  }, [phase, level.music, audio])

  useEffect(() => {
    audio.setMuted(muted)
  }, [muted, audio])

  useEffect(() => () => audio.dispose(), [audio])

  const canGoNext =
    state.levelNo < state.reachedLevel && state.levelNo < TOTAL_LEVELS
  const canGoPrev = state.levelNo > 1

  function start() {
    audio.sfxPlay('start')
    dispatch({ type: 'start' })
  }

  function selectMode(mode: Mode) {
    audio.sfxPlay('select')
    dispatch({ type: 'select-mode', mode })
  }

  function tapTile(index: number) {
    if (state.phase !== 'playing') return
    if (!canMove(state.board, index, size)) {
      audio.sfxPlay('nope')
      return
    }
    audio.sfxPlay('move')
    dispatch({ type: 'tap', index })
  }

  function slideDir(direction: SlideDirection) {
    if (state.phase !== 'playing') return
    const target = tileForDirection(state.board, direction, size)
    if (target === null) return
    audio.sfxPlay('move')
    dispatch({ type: 'tap', index: target })
  }

  function nextLevel() {
    if (!canGoNext) {
      audio.sfxPlay('nope')
      return
    }
    audio.sfxPlay('nav')
    dispatch({ type: 'goto-level', no: state.levelNo + 1 })
  }

  function prevLevel() {
    if (!canGoPrev) {
      audio.sfxPlay('nope')
      return
    }
    audio.sfxPlay('nav')
    dispatch({ type: 'goto-level', no: state.levelNo - 1 })
  }

  function restartLevel() {
    audio.sfxPlay('nav')
    dispatch({ type: 'restart' })
  }

  function finishEnding() {
    dispatch({ type: 'finish-ending' })
  }

  function playAgain() {
    audio.sfxPlay('select')
    dispatch({ type: 'play-again' })
  }

  function quit() {
    audio.sfxPlay('nav')
    dispatch({ type: 'quit' })
  }

  function toggleMute() {
    setMuted((m) => !m)
  }

  return {
    phase,
    audio,
    level,
    levelNo,
    reachedLevel: state.reachedLevel,
    mode: state.mode,
    board: state.board,
    levelMoves: state.levelMoves,
    stats: state.stats,
    muted,
    canGoNext,
    canGoPrev,
    start,
    selectMode,
    tapTile,
    slideDir,
    nextLevel,
    prevLevel,
    restartLevel,
    finishEnding,
    playAgain,
    quit,
    toggleMute,
  }
}
