import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useEventsStore, type Event } from '../store/eventsStore';
import { useAuthStore } from '../store/authStore';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';

// ─── Helpers (FIXED) ──────────────────────────────────────────────────────────

const formatDate = (dateString: string) => {
  try {
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(dateString));
  } catch {
    return 'Date TBD';
  }
};

const formatTime = (dateString: string) => {
  try {
    return new Intl.DateTimeFormat('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString));
  } catch {
    return '';
  }
};

// FIX: backend returns host.name, not host.username
const getHostName = (event: Event) => event.host?.name ?? 'Unknown host';
const getHostId   = (event: Event) => event.hostId ?? event.host?.id;

// FIX: backend returns members[], not participants[]
const getMembers = (event: Event) =>
  Array.isArray(event.members) ? event.members : [];

// FIX: use event.status, not event.isConfirmed
const isConfirmed  = (event: Event) => event.status === 'CONFIRMED';
const isCancelled  = (event: Event) => event.status === 'CANCELLED';
const isCompleted  = (event: Event) => event.status === 'COMPLETED';

const statusVariants: Record<string, { label: string; cls: string }> = {
  CONFIRMED:  { label: 'Confirmed',  cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
  CANCELLED:  { label: 'Cancelled',  cls: 'bg-red-500/15 text-red-400 border-red-500/30' },
  COMPLETED:  { label: 'Completed',  cls: 'bg-sky-500/15 text-sky-400 border-sky-500/30' },
  PLANNED:    { label: 'Planned',    cls: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
};

// ─── Status Badge ─────────────────────────────────────────────────────────────

const StatusBadge: React.FC<{ event: Event }> = ({ event }) => {
  const cfg = statusVariants[event.status] ?? statusVariants.PLANNED;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cfg.cls}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {cfg.label}
    </span>
  );
};

// ─── Event Card ───────────────────────────────────────────────────────────────

const EventCard: React.FC<{
  event: Event;
  isHosted: boolean;
  onDelete: (id: string) => Promise<void>;
  deleteLoading: string | null;
  onConfirm: (id: string) => Promise<void>;
  confirmLoading: string | null;
  onViewDetails?: (event: Event) => void;
}> = ({ event, isHosted, onDelete, deleteLoading, onConfirm, confirmLoading, onViewDetails }) => {
  const members     = getMembers(event);
  const memberCount = members.length > 0 ? members.length : (event._count?.members ?? 0);
  const max         = event.maxParticipants;
  const fillPct     = max ? Math.min((memberCount / max) * 100, 100) : 0;
  const isFull      = max ? memberCount >= max : false;
  return (
    <div
      className="group relative flex flex-col bg-[#0f1117] border border-white/[0.06] rounded-2xl overflow-hidden
                 transition-all duration-300 hover:border-white/[0.14] hover:shadow-[0_0_40px_rgba(139,92,246,0.08)]"
    >
      {/* Top accent bar based on status */}
      <div
        className={`h-0.5 w-full ${
          isConfirmed(event) ? 'bg-gradient-to-r from-emerald-500 to-teal-400' :
          isCancelled(event) ? 'bg-gradient-to-r from-red-500 to-rose-400' :
          isCompleted(event) ? 'bg-gradient-to-r from-sky-500 to-blue-400' :
          'bg-gradient-to-r from-violet-500 to-purple-400'
        }`}
      />

      <div className="flex flex-col flex-1 p-6 gap-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-bold text-lg leading-snug truncate group-hover:text-violet-300 transition-colors">
              {event.title}
            </h3>
            <p className="text-white/40 text-sm mt-0.5">
              {isHosted ? '🎲 Hosted by you' : `by ${getHostName(event)}`}
            </p>
          </div>
          <StatusBadge event={event} />
        </div>

        {/* Description */}
        {event.description && (
          <p className="text-white/50 text-sm leading-relaxed line-clamp-2">
            {event.description}
          </p>
        )}

        {/* Meta grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/[0.03] rounded-xl p-3 border border-white/[0.05]">
            <p className="text-white/30 text-[10px] uppercase tracking-widest mb-1">Date</p>
            {/* FIX: event.date instead of event.scheduledDate */}
            <p className="text-white/80 text-sm font-medium">{formatDate(event.date)}</p>
            <p className="text-white/30 text-xs">{formatTime(event.date)}</p>
          </div>
          <div className="bg-white/[0.03] rounded-xl p-3 border border-white/[0.05]">
            <p className="text-white/30 text-[10px] uppercase tracking-widest mb-1">Location</p>
            <p className="text-white/80 text-sm font-medium truncate">{event.location}</p>
          </div>
        </div>

        {/* Participants bar */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-white/30 text-[10px] uppercase tracking-widest">Participants</span>
            <span className={`text-xs font-semibold ${isFull ? 'text-red-400' : 'text-white/60'}`}>
              {memberCount}{max ? `/${max}` : ''} {isFull && '· Full'}
            </span>
          </div>
          {max && (
            <div className="h-1 w-full bg-white/[0.06] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  fillPct >= 100 ? 'bg-red-500' :
                  fillPct >= 75  ? 'bg-amber-500' :
                  'bg-violet-500'
                }`}
                style={{ width: `${fillPct}%` }}
              />
            </div>
          )}
        </div>

        {/* Winning game (if confirmed) */}
        {isConfirmed(event) && event.winningGame && (
          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2">
            <span className="text-lg">🏆</span>
            <div>
              <p className="text-emerald-400 text-[10px] uppercase tracking-widest">Tonight's game</p>
              <p className="text-emerald-300 text-sm font-semibold">{event.winningGame.name}</p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 mt-auto pt-2">
          <button
            type="button"
            onClick={() => onViewDetails?.(event)}
            className="w-full py-2.5 px-4 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold
                               transition-all duration-200 hover:shadow-[0_0_20px_rgba(139,92,246,0.4)]"
          >
            View Details
          </button>
          {isHosted && event.status === 'PLANNED' && (
            <button
              onClick={() => onConfirm(event.id)}
              disabled={
                confirmLoading === event.id ||
                deleteLoading === event.id
              }
              className="px-3.5 py-2.5 rounded-xl bg-amber-400 text-dark-900 font-semibold text-sm transition-all duration-200 hover:bg-amber-300
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {confirmLoading === event.id ? (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
              ) : (
                'Confirmer'
              )}
            </button>
          )}
          {isHosted && (
            <button
              onClick={() => onDelete(event.id)}
              disabled={deleteLoading === event.id}
              className="px-3.5 py-2.5 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10
                         transition-all duration-200 text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {deleteLoading === event.id ? (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const EventPoster: React.FC<{ event: Event; onClose: () => void }> = ({ event, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const members = getMembers(event);
  const participantCount = members.length > 0 ? members.length : (event._count?.members ?? 0);
  const badge = statusVariants[event.status] ?? statusVariants.PLANNED;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full max-w-3xl overflow-hidden rounded-[32px] border border-white/10
                   bg-gradient-to-br from-slate-900/90 via-slate-950/80 to-black/90 p-8 text-white shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby={`poster-title-${event.id}`}
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -right-16 h-60 w-60 rounded-full bg-violet-500/30 blur-3xl" />
          <div className="absolute bottom-0 -left-8 h-56 w-56 rounded-full bg-amber-400/20 blur-3xl" />
        </div>
        <div className="relative flex flex-col gap-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.6em] text-white/60 mb-1">Affiche</p>
              <h2 id={`poster-title-${event.id}`} className="text-4xl font-black leading-tight">
                {event.title}
              </h2>
              <p className="text-sm text-white/60">Hosted by {getHostName(event)}</p>
            </div>
            <span className={`px-4 py-1.5 text-xs font-semibold rounded-full border ${badge.cls}`}>
              {badge.label}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-6 text-sm text-white/80">
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-[0.4em] text-white/40">Date &amp; heure</p>
              <p className="text-lg font-semibold text-white">{formatDate(event.date)}</p>
              <p className="text-xs">{formatTime(event.date)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-[0.4em] text-white/40">Location</p>
              <p className="text-lg font-semibold text-white">{event.location}</p>
              <p className="text-xs">
                {participantCount} participant{participantCount === 1 ? '' : 's'}
              </p>
            </div>
          </div>
          {event.description && (
            <p className="text-white/60 text-sm leading-relaxed">{event.description}</p>
          )}
          <div className="flex flex-wrap gap-3 pt-4">
            <Link
              to={`/events/${event.id}`}
              onClick={onClose}
              className="flex-1 min-w-[160px] rounded-xl border border-white/20 bg-white/10 px-4 py-2.5
                         text-center text-sm font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-white/20"
            >
              Voir la page complète
            </Link>
            <button
              type="button"
              onClick={onClose}
              className="min-w-[160px] rounded-xl border border-transparent bg-transparent px-4 py-2.5 text-sm font-semibold
                         uppercase tracking-[0.3em] text-white/80 transition hover:text-white"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Empty State ──────────────────────────────────────────────────────────────

const EmptyState: React.FC<{ tab: 'hosted' | 'joined' }> = ({ tab }) => (
  <div className="flex flex-col items-center justify-center py-20 px-4">
    <div className="w-20 h-20 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-6 text-4xl">
      {tab === 'hosted' ? '🎲' : '🃏'}
    </div>
    <h3 className="text-white/80 text-xl font-bold mb-2">
      {tab === 'hosted' ? "No events hosted yet" : "No events joined yet"}
    </h3>
    <p className="text-white/30 text-sm text-center max-w-xs mb-8">
      {tab === 'hosted'
        ? "Create your first game night and invite your friends!"
        : "Browse upcoming events and join the fun."}
    </p>
    <Link to={tab === 'hosted' ? '/create-event' : '/'}>
      <button className="px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm
                         transition-all duration-200 hover:shadow-[0_0_20px_rgba(139,92,246,0.35)]">
        {tab === 'hosted' ? '+ Create an Event' : 'Browse Events'}
      </button>
    </Link>
  </div>
);

// ─── Dashboard Page ───────────────────────────────────────────────────────────

export const DashboardPage: React.FC = () => {
  const {
    events,
    isLoading,
    error,
    fetchEvents,
    setError,
    deleteEvent,
    confirmEvent,
  } = useEventsStore();
  const { user, isAuthenticated, isInitialized } = useAuthStore();
  const [tab, setTab]             = useState<'hosted' | 'joined'>('hosted');
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState<string | null>(null);
  const [posterEvent, setPosterEvent] = useState<Event | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    let isActive = true;
    setIsFetching(true);
    fetchEvents()
      .catch((err) => console.error('[Dashboard] fetchEvents error:', err))
      .finally(() => { if (isActive) setIsFetching(false); });
    return () => { isActive = false; };
  }, [isAuthenticated, fetchEvents]);

  const userId = user?.id ?? null;

  const hostedEvents = useMemo(
    () => (userId ? events.filter((e) => getHostId(e) === userId) : []),
    [events, userId]
  );

  const joinedEvents = useMemo(
    () =>
      userId
        ? events.filter((e) => {
            // FIX: members[] contains { userId, user } — not participants[]
            const members = getMembers(e);
            const isMember = members.some((m) => m.userId === userId);
            return isMember && getHostId(e) !== userId;
          })
        : [],
    [events, userId]
  );

  const handleDelete = async (eventId: string) => {
    if (!confirm('Delete this event? This action cannot be undone.')) return;
    setDeleteLoading(eventId);
    try {
      await deleteEvent(eventId);
    } catch (err) {
      console.error('Error deleting event:', err);
    } finally {
      setDeleteLoading((current) => (current === eventId ? null : current));
    }
  };

  const handleConfirm = async (eventId: string) => {
    setConfirmLoading(eventId);
    try {
      await confirmEvent(eventId);
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Failed to confirm event';
      setError(message);
      console.error('[Dashboard] confirmEvent error:', err);
    } finally {
      setConfirmLoading((current) => (current === eventId ? null : current));
    }
  };

  const openPoster = (event: Event) => setPosterEvent(event);
  const closePoster = () => setPosterEvent(null);

  // ── Guards ──

  if (!isInitialized) return <LoadingSpinner fullScreen />;

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-[#080a0f] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-6xl mb-6">🔒</div>
          <h2 className="text-2xl font-bold text-white mb-3">Authentication Required</h2>
          <p className="text-white/40 mb-8">Please log in to access your dashboard.</p>
          <Link to="/login">
            <button className="px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold transition-all">
              Go to Login
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const displayEvents    = tab === 'hosted' ? hostedEvents : joinedEvents;
  const showSpinner      = isFetching || (isLoading && events.length === 0);

  return (
    <div
      className="min-h-screen bg-[#080a0f]"
      style={{
        backgroundImage: "url('/4.jpeg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Subtle background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-violet-600/5 blur-3xl" />
        <div className="absolute top-1/2 -right-40 w-80 h-80 rounded-full bg-purple-600/5 blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <p className="text-violet-400 text-sm font-medium mb-1 tracking-wide uppercase">
              Welcome back, {user.name} 👋
            </p>
            <h1 className="text-4xl font-black text-white tracking-tight">Dashboard</h1>
            <p className="text-white/30 mt-1 text-sm">Manage your game night events</p>
          </div>
          <Link to="/create-event">
            <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500
                               text-white text-sm font-semibold transition-all duration-200
                               hover:shadow-[0_0_24px_rgba(139,92,246,0.4)]">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
              </svg>
              New Event
            </button>
          </Link>
        </div>

        {/* ── Error ── */}
        {error && (
          <div className="mb-6">
            <ErrorAlert message={error} onDismiss={() => setError(null)} />
          </div>
        )}

        {/* ── Stats row ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { label: 'Hosted',    value: hostedEvents.length,                    icon: '🎲' },
            { label: 'Joined',    value: joinedEvents.length,                    icon: '🃏' },
            { label: 'Confirmed', value: hostedEvents.filter(isConfirmed).length, icon: '✅' },
            { label: 'Total',     value: events.length,                          icon: '📋' },
          ].map(({ label, value, icon }) => (
            <div key={label}
              className="bg-white/[0.03] border border-white/[0.06] rounded-2xl px-4 py-4 flex items-center gap-3">
              <span className="text-2xl">{icon}</span>
              <div>
                <p className="text-2xl font-black text-white leading-none">{value}</p>
                <p className="text-white/30 text-xs mt-0.5">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Tabs ── */}
        <div className="flex gap-1 p-1 bg-white/[0.04] border border-white/[0.06] rounded-xl w-fit mb-8">
          {(['hosted', 'joined'] as const).map((t) => {
            const count = t === 'hosted' ? hostedEvents.length : joinedEvents.length;
            const active = tab === t;
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  active
                    ? 'bg-violet-600 text-white shadow-[0_0_16px_rgba(139,92,246,0.35)]'
                    : 'text-white/40 hover:text-white/70'
                }`}
              >
                {t === 'hosted' ? 'I Host' : 'I Joined'}
                <span className={`text-xs px-1.5 py-0.5 rounded-md font-bold ${
                  active ? 'bg-white/20 text-white' : 'bg-white/[0.06] text-white/40'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* ── Content ── */}
        {showSpinner ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : displayEvents.length === 0 ? (
          <EmptyState tab={tab} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {displayEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                isHosted={tab === 'hosted'}
                onDelete={handleDelete}
                deleteLoading={deleteLoading}
                onConfirm={handleConfirm}
                confirmLoading={confirmLoading}
                onViewDetails={openPoster}
              />
            ))}
          </div>
        )}
        {posterEvent && <EventPoster event={posterEvent} onClose={closePoster} />}
      </div>
    </div>
  );
};

export default DashboardPage;
