'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Share } from './Share';

type Campaign = {
  signatureCount: number;
  goal: number;
};

const fmt = (n: number) => new Intl.NumberFormat('en-US').format(n);

export function HomeClient() {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [signed, setSigned] = useState(false);
  const [signing, setSigning] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const load = () => {
    fetch('/api/campaign')
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => j && setCampaign(j.data))
      .catch(() => {});
  };

  useEffect(() => {
    load();
    const i = setInterval(load, 15000);
    if (typeof window !== 'undefined') {
      setSigned(localStorage.getItem('io_signed') === 'true');
    }
    return () => clearInterval(i);
  }, []);

  const count = campaign?.signatureCount;
  const goal = campaign?.goal || 5000000;
  const pct = Math.min(100, ((count || 0) / goal) * 100);

  async function handleSign() {
    if (signed || signing) return;
    setErrorMsg('Petition closed');
    return;
    try {
      let deviceId = localStorage.getItem('io_device_id');
      if (!deviceId) {
        deviceId =
          typeof window !== 'undefined' &&
          window.crypto &&
          typeof window.crypto.randomUUID === 'function'
            ? window.crypto.randomUUID()
            : Math.random().toString(36).substring(2, 15) +
              Math.random().toString(36).substring(2, 15);
        localStorage.setItem('io_device_id', deviceId);
      }

      const r = await fetch('/api/signatures', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ deviceId }),
      });
      const j = await r.json();

      if (r.ok) {
        localStorage.setItem('io_signed', 'true');
        setSigned(true);
        load();
      } else {
        if (j.error?.code === 'ALREADY_SIGNED') {
          localStorage.setItem('io_signed', 'true');
          setSigned(true);
        } else {
          setErrorMsg(j.error?.message || 'Unable to sign the petition.');
        }
      }
    } catch {
      setErrorMsg('An unexpected error occurred. Please try again.');
    } finally {
      setSigning(false);
    }
  }

  return (
    <>
      <main>
        {/* Hero & Petition Section */}
        <section className="relative min-h-screen overflow-hidden bg-black text-white">
          <Image
            src="/images/infantino-out-graphic.jpg"
            alt="Infantino Out Campaign Graphic"
            fill
            priority
            className="object-cover object-center opacity-40"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/95" />
          <div className="noise absolute inset-0 opacity-50" />

          <div className="container relative z-10 flex min-h-screen flex-col justify-center gap-8 py-10 lg:flex-row lg:items-center lg:gap-12 lg:py-20">

            {/* Signature card */}
            <div className="order-last w-full max-w-md mx-auto lg:mx-0 lg:flex-shrink-0">
              <div className="rounded-2xl bg-white/10 p-6 backdrop-blur-md border border-white/20 shadow-2xl sm:p-8">
                <p className="eyebrow text-white/70">Verified supporters</p>
                <div
                  className="mt-2 text-5xl font-black tracking-tighter sm:text-6xl"
                  aria-live="polite"
                >
                  {count === undefined ? '—' : fmt(count)}
                </div>
                <p className="mt-1 text-xs font-black tracking-[.16em] text-campaign">
                  SIGNATURES
                </p>
                <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/20">
                  <div
                    className="h-full rounded-full bg-campaign transition-all duration-1000"
                    style={{ width: `${Math.max(count ? 1 : 0, pct)}%` }}
                  />
                </div>
                <div className="mt-3 flex justify-between text-xs font-bold text-white/60">
                  <span>{pct.toFixed(2)}% complete</span>
                  <span>Goal: {fmt(goal)}</span>
                </div>
                <button
                  onClick={handleSign}
                  disabled={signing || signed}
                  className="btn btn-red mt-6 w-full !py-4 disabled:opacity-75 disabled:cursor-not-allowed text-lg font-black tracking-wide"
                >
                  {signed ? 'Signed ✓' : signing ? 'Signing...' : 'Sign the petition'}
                </button>
                {errorMsg && (
                  <p className="mt-3 text-center text-sm text-red-500 font-bold">{errorMsg}</p>
                )}
                <div className="mt-5 flex justify-center">
                  <Share compact />
                </div>
                <p className="mt-4 text-center text-xs text-white/50">
                  One signature allowed per device.
                </p>
              </div>
            </div>

            {/* Text content */}
            <div className="order-first flex-1">
              <p className="eyebrow mb-4 flex items-center gap-3 text-white/70">
                <span className="h-px w-10 bg-campaign" /> Global supporter campaign
              </p>
              <h1 className="display text-[clamp(3rem,9vw,7rem)] leading-none mb-6">
                INFANTINO
                <br />
                <span className="text-campaign">OUT.</span>
              </h1>
              <h2 className="mt-4 max-w-2xl text-2xl font-bold leading-tight sm:text-4xl">
                Remove Gianni Infantino — FIFA Needs Accountability
              </h2>
              <p className="mt-4 max-w-xl text-base leading-7 text-white/70">
                Football belongs to the fans. This campaign calls for greater accountability,
                transparency, and leadership that puts football, players, and supporters first.
              </p>
            </div>
          </div>
        </section>

        {/* Marquee */}
        <section className="bg-campaign py-4 text-white">
          <div className="marquee font-black uppercase tracking-[.16em]">
            <span>
              Football belongs to the fans&nbsp;&nbsp; • &nbsp;&nbsp;Accountability
              now&nbsp;&nbsp; • &nbsp;&nbsp;Transparency in leadership&nbsp;&nbsp; •
              &nbsp;&nbsp;Football belongs to the fans&nbsp;&nbsp; • &nbsp;&nbsp;Accountability
              now&nbsp;&nbsp; • &nbsp;&nbsp;Transparency in leadership&nbsp;&nbsp; •
              &nbsp;&nbsp;
            </span>
          </div>
        </section>


      </main>

      {/* Footer */}
      <footer className="bg-black py-10 text-white">
        <div className="container flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <p className="font-black tracking-widest">INFANTINO OUT</p>
            <p className="mt-2 max-w-md text-xs leading-5 text-white/50">
              An independent supporter campaign for transparency and accountability in football.
            </p>
          </div>
          <div className="flex flex-wrap gap-4 text-[10px] font-bold uppercase tracking-wider text-white/60">
            <a href="/privacy">Privacy</a>
            <a href="/terms">Terms</a>
            <a href="/cookies">Cookies</a>
            <a href="/admin">Admin</a>
          </div>
        </div>
      </footer>
    </>
  );
}
