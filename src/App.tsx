import { useEffect, useState } from 'react'
import { DIFFICULTIES, type Difficulty } from '../shared/difficulty'
import { getDeviceId, getName, saveName } from './identity'
import { useSingleplayer } from './net/useSingleplayer'
import { useMultiplayer } from './net/useMultiplayer'
import { Home } from './screens/Home'
import { Lobby } from './screens/Lobby'
import { GameScreen } from './screens/GameScreen'
import { Results } from './screens/Results'

type Route =
  | { kind: 'home' }
  | { kind: 'sp'; difficulty: Difficulty }
  | { kind: 'mp'; difficulty: Difficulty }

function Stage({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full items-center justify-center bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 p-4">
      {children}
    </div>
  )
}

export function App() {
  const [me] = useState(getDeviceId)
  const [name, setName] = useState(getName)
  const [route, setRoute] = useState<Route>({ kind: 'home' })

  const onName = (n: string) => setName(saveName(n))
  const goHome = () => setRoute({ kind: 'home' })

  if (route.kind === 'sp') {
    return (
      <Stage>
        <SinglePlayerFlow difficulty={route.difficulty} me={me} onHome={goHome} />
      </Stage>
    )
  }

  if (route.kind === 'mp') {
    return (
      <Stage>
        <MultiplayerFlow me={me} name={name} defaultDifficulty={route.difficulty} onHome={goHome} />
      </Stage>
    )
  }

  return (
    <Stage>
      <Home
        name={name}
        onName={onName}
        onSingleplayer={(d) => setRoute({ kind: 'sp', difficulty: d })}
        onMultiplayer={(d) => setRoute({ kind: 'mp', difficulty: d })}
      />
    </Stage>
  )
}

function SinglePlayerFlow({
  difficulty,
  me,
  onHome,
}: {
  difficulty: Difficulty
  me: string
  onHome: () => void
}) {
  const sp = useSingleplayer(difficulty, me)

  if (sp.over) {
    return (
      <Results
        outcome={sp.over}
        me={me}
        rematchVotes={[]}
        onPlayAgain={sp.restart}
        onRematch={sp.restart}
        onHome={onHome}
      />
    )
  }

  return (
    <GameScreen
      config={sp.config}
      me={me}
      players={[{ id: me, name: 'You' }]}
      view={sp.view}
      endTime={sp.endTime}
      countdown={sp.countdown}
      onFlip={sp.flip}
      onQuit={onHome}
    />
  )
}

function MultiplayerFlow({
  me,
  name,
  defaultDifficulty,
  onHome,
}: {
  me: string
  name: string
  defaultDifficulty: Difficulty
  onHome: () => void
}) {
  const mp = useMultiplayer(me, name)

  const quit = () => {
    mp.leave()
    onHome()
  }

  useEffect(() => {
    // Leave the room if the component unmounts (back to home).
    return () => {
      mp.leave()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (mp.phase === 'over' && mp.over) {
    return (
      <Results
        outcome={mp.over}
        me={me}
        rematchVotes={mp.rematchVotes}
        onPlayAgain={mp.rematch}
        onRematch={mp.rematch}
        onHome={quit}
      />
    )
  }

  if (mp.phase === 'playing' || mp.phase === 'countdown') {
    return (
      <GameScreen
        config={DIFFICULTIES[mp.difficulty]}
        me={me}
        players={mp.players}
        view={mp.view}
        endTime={mp.endTime}
        countdown={mp.countdown}
        onFlip={mp.flip}
        onQuit={quit}
      />
    )
  }

  return (
    <Lobby
      phase={mp.phase}
      code={mp.code}
      players={mp.players}
      difficulty={mp.difficulty}
      defaultDifficulty={defaultDifficulty}
      error={mp.error}
      onCreate={mp.createRoom}
      onJoin={mp.joinRoom}
      onBack={quit}
    />
  )
}
