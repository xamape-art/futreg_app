import { useState } from 'react';
import { LoginScreen } from './components/auth/LoginScreen';
import { HistorialScreen } from './components/historial/HistorialScreen';
import { AssignModal } from './components/modal/AssignModal';
import { CrearPartidoModal } from './components/modal/CrearPartidoModal';
import { PartidoScreen } from './components/partido/PartidoScreen';
import { PlantillaScreen } from './components/plantilla/PlantillaScreen';
import { SummaryOverlay } from './components/summary/SummaryOverlay';
import { SyncBadge } from './components/SyncBadge';
import { TabBar } from './components/TabBar';
import { useCloud } from './hooks/useCloud';
import { useMatchStore } from './hooks/useMatchStore';

function App() {
  const { state, dispatch, setCopiedWithTimeout } = useMatchStore();
  const cloud = useCloud(state, dispatch);
  const [skippedLogin, setSkippedLogin] = useState(false);

  // Solo se pide login cuando hay nube configurada y el usuario no ha elegido
  // seguir en local. Sin credenciales la app se comporta como siempre.
  const needsLogin = cloud.enabled && !cloud.session && !skippedLogin;

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-[#20242c] p-0 sm:p-5">
      <div
        className="relative h-[100dvh] w-full overflow-hidden bg-[#10131a] text-[#eef1f5] sm:h-[844px] sm:max-h-[844px] sm:w-[390px] sm:rounded-[44px]"
        style={{ boxShadow: '0 30px 80px rgba(0,0,0,.5), inset 0 0 0 2px #2b3038' }}
      >
        {needsLogin ? (
          <LoginScreen
            primary={state.primary}
            authError={cloud.authError}
            onSignIn={cloud.signIn}
            onSkip={() => setSkippedLogin(true)}
          />
        ) : (
          <>
            {state.tab === 'partido' && <PartidoScreen state={state} dispatch={dispatch} />}
            {state.tab === 'plantilla' && (
              <PlantillaScreen state={state} dispatch={dispatch} onPhoto={cloud.setPhoto} />
            )}
            {state.tab === 'historial' && (
              <HistorialScreen cloud={cloud} currentMatchId={state.matchId} />
            )}

            <AssignModal state={state} dispatch={dispatch} />
            <CrearPartidoModal state={state} dispatch={dispatch} />
            <SummaryOverlay state={state} dispatch={dispatch} onCopy={setCopiedWithTimeout} />

            <SyncBadge status={cloud.status} error={cloud.error} />
            <TabBar tab={state.tab} primary={state.primary} onChange={(tab) => dispatch({ type: 'SET_TAB', tab })} />
          </>
        )}
      </div>
    </div>
  );
}

export default App;
