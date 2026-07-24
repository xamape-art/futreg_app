import { useState } from 'react';

interface LoginScreenProps {
  primary: string;
  /** Error que trajo de vuelta el enlace del email, si lo hubo. */
  authError: string | null;
  onSignIn: (email: string) => Promise<void>;
  onSkip: () => void;
}

export function LoginScreen({ primary, authError, onSignIn, onSkip }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || busy) return;
    setBusy(true);
    setError(null);
    try {
      await onSignIn(trimmed);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo enviar el enlace');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="absolute inset-0 flex flex-col justify-center bg-[#10131a] px-[30px]">
      <div
        className="mb-5 flex h-[54px] w-[54px] items-center justify-center rounded-[15px] font-condensed text-[26px] font-extrabold text-white"
        style={{ background: primary }}
      >
        R
      </div>

      <div className="font-condensed text-[28px] font-extrabold leading-tight">Registro Partido</div>
      <div className="mt-1.5 text-[13px] font-medium leading-relaxed text-[#7f8794]">
        Entra con tu email para guardar los partidos en la nube y verlos desde cualquier dispositivo.
      </div>

      {authError && !sent && (
        <div className="mt-5 rounded-[14px] border border-[#4a2b2b] bg-[#1d1416] p-3.5">
          <div className="text-[13px] font-bold text-[#ff6b6b]">El enlace no funciono</div>
          <div className="mt-1 text-[12px] font-medium leading-relaxed text-[#a98d8d]">{authError}</div>
          <div className="mt-1.5 text-[11px] font-medium leading-relaxed text-[#7f8794]">
            Los enlaces son de un solo uso y caducan. Pide uno nuevo y abrelo en este mismo navegador.
          </div>
        </div>
      )}

      {sent ? (
        <div className="mt-7 rounded-[14px] border border-[#2b3038] bg-[#141922] p-4">
          <div className="text-[14px] font-bold text-[#eef1f5]">Revisa tu correo</div>
          <div className="mt-1.5 text-[12px] font-medium leading-relaxed text-[#7f8794]">
            Enviado un enlace de acceso a <span className="text-[#aeb6c2]">{email.trim()}</span>. Abrelo en este
            mismo dispositivo.
          </div>
          <button
            type="button"
            onClick={() => setSent(false)}
            className="mt-3 text-[12px] font-bold text-[#7f8794] underline"
          >
            Usar otro email
          </button>
        </div>
      ) : (
        <form onSubmit={submit} className="mt-7">
          <label className="mb-[5px] block text-[9px] font-bold uppercase tracking-[.4px] text-[#6b7280]">
            Email
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            autoComplete="email"
            className="h-[46px] w-full rounded-[12px] border border-[#262c37] bg-[#161b23] px-3.5 text-[15px] font-semibold text-[#eef1f5] outline-none placeholder:text-[#4b525e]"
          />
          {error && <div className="mt-2 text-[12px] font-semibold text-[#ff6b6b]">{error}</div>}
          <button
            type="submit"
            disabled={busy}
            className="mt-3.5 h-[46px] w-full rounded-[12px] font-condensed text-[17px] font-extrabold text-[#111] disabled:opacity-50"
            style={{ background: primary }}
          >
            {busy ? 'Enviando...' : 'Enviar enlace'}
          </button>
        </form>
      )}

      <button
        type="button"
        onClick={onSkip}
        className="mt-6 text-[12px] font-bold text-[#6b7280] underline"
      >
        Seguir sin cuenta (solo en este dispositivo)
      </button>
    </div>
  );
}
