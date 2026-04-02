import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useEventsStore, type Event } from '../store/eventsStore';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';

const FILTERS: Array<{ value: FilterStatus; label: string }> = [
  { value: 'all', label: 'Tous' },
  { value: 'PLANNED', label: 'Planifiés' },
  { value: 'CONFIRMED', label: 'Confirmés' },
  { value: 'CANCELLED', label: 'Annulés' },
  { value: 'COMPLETED', label: 'Terminés' },
];

type FilterStatus = 'all' | 'PLANNED' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

const statusStyles: Record<string, string> = {
  PLANNED: 'bg-amber-500/10 border-amber-400/40 text-amber-200',
  CONFIRMED: 'bg-emerald-500/10 border-emerald-400/40 text-emerald-200',
  CANCELLED: 'bg-red-500/10 border-red-400/40 text-red-200',
  COMPLETED: 'bg-sky-500/10 border-sky-400/40 text-sky-200',
};

const formatDate = (input: string) => {
  try {
    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date(input));
  } catch {
    return 'Date à confirmer';
  }
};

const formatTime = (input: string) => {
  try {
    return new Intl.DateTimeFormat('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(input));
  } catch {
    return '';
  }
};

const getMemberCount = (event: Event) => {
  if (Array.isArray(event.members)) return event.members.length;
  return event._count?.members ?? 0;
};

const API_BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) || 'http://localhost:3000/api';
const BACKEND_ORIGIN = (() => {
  try {
    return new URL(API_BASE_URL).origin;
  } catch {
    return API_BASE_URL.replace(/\/api\/?$/, '') || 'http://localhost:3000';
  }
})();

const resolveEventImageUrl = (imageUrl?: string) => {
  if (!imageUrl) return undefined;
  if (/^https?:\/\//.test(imageUrl)) return imageUrl;
  return `${BACKEND_ORIGIN}${imageUrl}`;
};

const EventsListPage: React.FC = () => {
  const { events, isLoading, error, fetchEvents, setError } = useEventsStore();
  const [filter, setFilter] = useState<FilterStatus>('all');

  useEffect(() => {
    if (events.length === 0 && !isLoading) {
      fetchEvents().catch(() => undefined);
    }
  }, [events.length, fetchEvents, isLoading]);

  const filteredEvents = useMemo(() => {
    if (filter === 'all') return events;
    return events.filter((event) => event.status === filter);
  }, [events, filter]);

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-16">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-3">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Explorateur d'événements</p>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-white sm:text-4xl">Tous les événements</h1>
              <p className="text-slate-400">Parcourez les soirées disponibles, filtrez selon le statut et plongez dans les détails.</p>
            </div>
            <Link
              to="/"
              className="ml-auto inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:border-white hover:bg-white/10 transition"
            >
              ← Retour à l'accueil
            </Link>
          </div>
        </header>

        <section className="flex flex-wrap gap-2">
          {FILTERS.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setFilter(item.value)}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                filter === item.value
                  ? 'border-white bg-white/10 text-white'
                  : 'border-white/10 text-slate-300 hover:border-white/40 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </section>

        {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

        {isLoading && events.length === 0 ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {filteredEvents.length === 0 ? (
              <div className="col-span-full rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-slate-300">
                <p className="text-xl font-semibold text-white">Aucun événement trouvé</p>
                <p className="text-sm text-slate-400">Changez de filtre ou créez un nouvel événement sur la page d'accueil.</p>
              </div>
            ) : (
              filteredEvents.map((event) => {
                const imageSrc = resolveEventImageUrl(event.imageUrl);
                return (
                  <article
                    key={event.id}
                    className="flex min-h-[220px] flex-col justify-between rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/80 to-slate-900/40 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.4)]"
                  >
                    <div className="mb-4 overflow-hidden rounded-2xl border border-white/5 bg-slate-900/60">
                      {imageSrc ? (
                        <img
                          src={imageSrc}
                          alt={event.title}
                          className="h-40 w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-40 w-full items-center justify-center text-3xl text-white/40">
                          🎲
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <h2 className="text-xl font-semibold text-white">{event.title}</h2>
                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider ${
                            statusStyles[event.status] ?? 'border-white/20 text-white'
                          }`}
                        >
                          {event.status ?? 'Non défini'}
                        </span>
                      </div>
                      <p className="text-sm text-slate-300 line-clamp-2">{event.description ?? 'Aucune description disponible.'}</p>
                      <div className="text-sm text-slate-400">
                        <p>{formatDate(event.date)}</p>
                        <p>{formatTime(event.date)} · {event.location}</p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-300">
                      <span>
                        Participants : {getMemberCount(event)}{event.maxParticipants ? ` / ${event.maxParticipants}` : ''}
                      </span>
                      <Link
                        to={`/events/${event.id}`}
                        className="rounded-full border border-purple-500/60 bg-purple-500/20 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-purple-100 transition hover:border-purple-400 hover:bg-purple-400/30"
                      >
                        Voir les détails
                      </Link>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventsListPage;
