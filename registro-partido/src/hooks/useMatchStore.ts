import { useEffect, useReducer, useRef } from 'react';
import { createInitialState, reducer } from '../state';
import { saveActions, saveMatch, saveMatchInfo, saveRoster } from '../storage';

export function useMatchStore() {
  const [state, dispatch] = useReducer(reducer, undefined, createInitialState);

  useEffect(() => {
    const iv = setInterval(() => dispatch({ type: 'TICK' }), 1000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    saveRoster(state.roster);
  }, [state.roster]);

  useEffect(() => {
    saveActions(state.actions);
  }, [state.actions]);

  useEffect(() => {
    saveMatch({ phase: state.phase, seconds: state.seconds, half: state.half });
  }, [state.phase, state.seconds, state.half]);

  useEffect(() => {
    saveMatchInfo({ date: state.matchDate, local: state.local, visitante: state.visitante });
  }, [state.matchDate, state.local, state.visitante]);

  const copyTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    return () => {
      if (copyTimeout.current) clearTimeout(copyTimeout.current);
    };
  }, []);

  const setCopiedWithTimeout = () => {
    dispatch({ type: 'SET_COPIED', copied: true });
    if (copyTimeout.current) clearTimeout(copyTimeout.current);
    copyTimeout.current = setTimeout(() => dispatch({ type: 'SET_COPIED', copied: false }), 1800);
  };

  return { state, dispatch, setCopiedWithTimeout };
}
