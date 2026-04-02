import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEventsStore } from '../store/eventsStore';
import { useAuthStore } from '../store/authStore';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';
import Button from '../components/Button';
import Input from '../components/Input';

const API_BASE_URL =
  (import.meta.env.VITE_API_URL as string | undefined) || 'http://localhost:3000/api';

const resolveEventImageUrl = (imageUrl?: string) => {
  if (!imageUrl) return undefined;
  if (/^https?:\/\//.test(imageUrl)) return imageUrl;
  return `${new URL(API_BASE_URL).origin}${imageUrl}`;
};

const formatDate = (value: string) => {
  try {
    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date(value));
  } catch {
    return 'Date à confirmer';
  }
};

const formatTime = (value: string) => {
  try {
    return new Intl.DateTimeFormat('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(value));
  } catch {
    return '';
  }
};

const statusVariants: Record<string, { label: string; cls: string; color: string }> = {
  PLANNED: {
    label: 'Planifié',
    cls: 'bg-amber-500/20 text-amber-200 border-amber-400/40',
    color: 'amber',
  },
  CONFIRMED: {
    label: 'Confirmé',
    cls: 'bg-emerald-500/20 text-emerald-200 border-emerald-400/40',
    color: 'emerald',
  },
  CANCELLED: {
    label: 'Annulé',
    cls: 'bg-red-500/20 text-red-200 border-red-400/40',
    color: 'red',
  },
  COMPLETED: {
    label: 'Terminé',
    cls: 'bg-sky-500/20 text-sky-200 border-sky-400/40',
    color: 'sky',
  },
};

export const EventDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    currentEvent,
    isLoading,
    error,
    fetchEventById,
    setError,
    joinEvent,
    leaveEvent,
    proposeGame,
    voteGame,
    removeVote,
    confirmEvent,
  } = useEventsStore();

  const [gameInput, setGameInput] = useState('');
  const [proposingGame, setProposingGame] = useState(false);

  useEffect(() => {
    if (id) {
      fetchEventById(id);
    }
  }, [id, fetchEventById]);

  const handleBack = () => navigate(-1);

  if (!id) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/30 to-slate-950 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 bg-slate-800/50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">🎲</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Événement introuvable</h2>
          <p className="text-slate-400 mb-8">L'événement demandé n'existe pas ou a été supprimé.</p>
          <Button onClick={handleBack} variant="secondary" className="w-full sm:w-auto">
            ← Retour
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading && !currentEvent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/30 to-slate-950 flex items-center justify-center p-4">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!currentEvent || error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/30 to-slate-950 flex flex-col items-center justify-center p-4 text-center">
        <div className="w-24 h-24 bg-slate-800/50 rounded-2xl flex items-center justify-center mb-6">
          <span className="text-3xl">🎲</span>
        </div>
        <h2 className="text-2xl font-bold text-white mb-4">
          {error ? 'Erreur de chargement' : 'Événement introuvable'}
        </h2>
        <p className="text-slate-400 mb-8 max-w-md">
          {error || 'Impossible de charger les détails de cet événement.'}
        </p>
        {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}
        <div className="flex gap-3">
          <Button onClick={() => fetchEventById(id)} variant="secondary">
            Réessayer
          </Button>
          <Button onClick={handleBack}>Retour</Button>
        </div>
      </div>
    );
  }

  const members = Array.isArray(currentEvent.members) ? currentEvent.members : [];
  const participantCount = members.length || (currentEvent._count?.members ?? 0);
  const isHost = user?.id === currentEvent.hostId;
  const isParticipant = Boolean(user && members.some((member: any) => member.userId === user.id));

  // FIX 1 : != null pour ne pas traiter maxParticipants=0 comme falsy
  const isEventFull =
    currentEvent.maxParticipants != null && participantCount >= currentEvent.maxParticipants;

  const canJoin = currentEvent.status === 'PLANNED' && !isParticipant && !isEventFull && !isHost;
  const canProposeGame = isParticipant && currentEvent.status === 'PLANNED';
  const games = Array.isArray(currentEvent.games) ? currentEvent.games : [];

  const sortedGames = useMemo(() => {
    return [...games].sort((a: any, b: any) => {
      const votesA = a._count?.votes ?? a.votes?.length ?? 0;
      const votesB = b._count?.votes ?? b.votes?.length ?? 0;
      return votesB - votesA;
    });
  }, [games]);

  const imageUrl = resolveEventImageUrl(currentEvent.imageUrl);
  const status = statusVariants[currentEvent.status ?? 'PLANNED'];

  const handleVoteToggle = async (gameId: string, hasVoted: boolean) => {
    try {
      if (hasVoted) await removeVote(gameId);
      else await voteGame(gameId);
    } catch {
      console.error('Vote failed');
    }
  };

  // FIX 5 : garde explicite sur id
  const handleProposeGame = async () => {
    if (!gameInput.trim() || !id) return;
    setProposingGame(true);
    try {
      await proposeGame(id, gameInput.trim());
      setGameInput('');
    } catch (err) {
      console.error('Propose game error:', err);
    } finally {
      setProposingGame(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/30 to-slate-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <Button
          onClick={handleBack}
          variant="ghost"
          size="sm"
          className="mb-8 inline-flex items-center gap-2 text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Retour aux événements
        </Button>

        {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

        {/* Hero Section */}
        <section className="bg-slate-900/80 backdrop-blur-md border border-slate-800/50 rounded-3xl p-8 lg:p-12 shadow-2xl mb-8 overflow-hidden">
          {/* FIX 4 : ajout de "group" sur le conteneur image */}
          {imageUrl ? (
            <div className="group relative w-full h-64 lg:h-80 mb-8 rounded-2xl overflow-hidden bg-slate-800/50">
              <img
                src={imageUrl}
                alt={currentEvent.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </div>
          ) : (
            <div className="w-full h-64 lg:h-80 mb-8 rounded-2xl bg-gradient-to-br from-slate-800 to-purple-900/50 flex items-center justify-center">
              <span className="text-5xl opacity-75">🎲</span>
            </div>
          )}

          <div className="space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="text-xs uppercase tracking-widest text-slate-500 font-mono mb-2">
                  Fiche complète
                </p>
                {/* FIX 3 : badge statut sorti du bloc image, affiché ici dans tous les cas */}
                <div className="flex items-center gap-3 mb-3">
                  <h1 className="text-4xl lg:text-5xl font-black bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent leading-tight">
                    {currentEvent.title}
                  </h1>
                  {status && (
                    <span
                      className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold border-2 ${status.cls}`}
                    >
                      {status.label}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400 mb-4">
                  <span>📅 {formatDate(currentEvent.date)} à {formatTime(currentEvent.date)}</span>
                  {currentEvent.location && <span>📍 {currentEvent.location}</span>}
                  <span>
                    👥 {participantCount}
                    {currentEvent.maxParticipants ? ` / ${currentEvent.maxParticipants}` : ''}
                  </span>
                </div>
                <p className="text-slate-400 text-lg">
                  Organisé par{' '}
                  <span className="font-semibold text-white">
                    {currentEvent.host?.name ?? 'un organisateur'}
                  </span>
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 min-w-fit">
                {isHost && currentEvent.status === 'PLANNED' && (
                  <Button variant="primary" isLoading={isLoading} onClick={() => confirmEvent(id)}>
                    Confirmer
                  </Button>
                )}
                {!isHost && (
                  <>
                    {canJoin && (
                      <Button
                        variant="primary"
                        isLoading={isLoading}
                        onClick={() => joinEvent(id)}
                      >
                        Rejoindre l'événement
                      </Button>
                    )}
                    {isParticipant && (
                      <Button
                        variant="secondary"
                        isLoading={isLoading}
                        onClick={() => leaveEvent(id)}
                      >
                        Quitter
                      </Button>
                    )}
                    {/* FIX 2 : "Complet" uniquement si non participant */}
                    {isEventFull && !isParticipant && (
                      <Button
                        variant="secondary"
                        disabled
                        className="bg-red-500/20 border-red-500/40 text-red-300"
                      >
                        Complet
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>

            {currentEvent.description && (
              <div className="prose prose-slate max-w-none">
                <p className="text-lg text-slate-300 leading-relaxed">{currentEvent.description}</p>
              </div>
            )}

            {currentEvent.winningGame && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-emerald-200 mb-2 flex items-center gap-2">
                  🏆 Jeu gagnant
                </h3>
                <p className="text-2xl font-black text-emerald-100">
                  {currentEvent.winningGame.name}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Participants & Propose Game */}
        <div className="grid gap-8 lg:grid-cols-2 mb-8">
          <section className="bg-slate-900/80 backdrop-blur-md border border-slate-800/50 rounded-3xl p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Participants</h2>
                <p className="text-slate-500">Joueurs inscrits ({participantCount})</p>
              </div>
              <span className="text-2xl font-black text-slate-200">
                {participantCount}
                {currentEvent.maxParticipants ? ` / ${currentEvent.maxParticipants}` : ''}
              </span>
            </div>
            <div className="flex flex-wrap gap-3">
              {members.length === 0 ? (
                <p className="text-slate-500 col-span-full">Aucun participant pour le moment.</p>
              ) : (
                // FIX 7 : clé React plus défensive avec index en fallback
                members.slice(0, 12).map((member: any, index: number) => (
                  <span
                    key={member.userId ?? member.id ?? index}
                    className="px-4 py-2 bg-slate-800/60 border border-slate-700/50 rounded-xl text-sm hover:bg-slate-700/50 transition-all"
                  >
                    {member.user?.name ?? 'Joueur'}
                  </span>
                ))
              )}
              {participantCount > 12 && (
                <span className="px-4 py-2 bg-slate-800/60 border border-slate-700/50 rounded-xl text-sm">
                  +{participantCount - 12} autres…
                </span>
              )}
            </div>
          </section>

          <section className="bg-slate-900/80 backdrop-blur-md border border-slate-800/50 rounded-3xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Proposer un jeu</h2>
            {canProposeGame ? (
              <div className="space-y-4">
                <Input
                  value={gameInput}
                  onChange={(e) => setGameInput(e.target.value)}
                  placeholder="Nom du jeu (ex: Carcassonne, 7 Wonders…)"
                  disabled={proposingGame}
                />
                <Button
                  isLoading={proposingGame}
                  onClick={handleProposeGame}
                  disabled={!gameInput.trim()}
                  className="w-full"
                >
                  💡 Proposer ce jeu
                </Button>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-slate-800/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🎮</span>
                </div>
                <p className="text-slate-500 mb-2">
                  {currentEvent.status !== 'PLANNED'
                    ? 'Les propositions sont fermées'
                    : !isParticipant
                    ? 'Rejoignez pour proposer des jeux'
                    : 'Événement complet'}
                </p>
              </div>
            )}
          </section>
        </div>

        {/* Games List */}
        <section className="bg-slate-900/80 backdrop-blur-md border border-slate-800/50 rounded-3xl p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Jeux proposés ({games.length})
              </h2>
              <p className="text-slate-500">Triés par popularité. Un vote par personne.</p>
            </div>
          </div>

          {sortedGames.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-slate-800/50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">🎲</span>
              </div>
              <h3 className="text-xl font-semibold text-slate-400 mb-2">Aucune proposition</h3>
              <p className="text-slate-500">Soyez le premier à suggérer un jeu !</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedGames.map((game: any) => {
                const voteCount = game._count?.votes ?? game.votes?.length ?? 0;
                const hasVoted =
                  Boolean(game.hasVoted) ||
                  Boolean(user?.id && game.votes?.some((v: any) => v.userId === user.id));
                return (
                  <article
                    key={game.id}
                    className="group bg-slate-900/50 border border-slate-800/50 rounded-2xl p-6 hover:border-slate-700/70 hover:bg-slate-900/70 transition-all overflow-hidden"
                  >
                    <div className="flex items-start justify-between gap-6 pb-6 border-b border-slate-800/50 mb-6">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors mb-1 truncate">
                          {game.name}
                        </h3>
                        <p className="text-sm text-slate-500">
                          Proposé par {game.proposedBy?.name ?? 'un joueur'}
                        </p>
                      </div>
                      <div className="text-right flex flex-col items-end gap-1 shrink-0">
                        <span className="text-3xl lg:text-4xl font-black bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent drop-shadow-lg">
                          {voteCount}
                        </span>
                        <span className="text-xs uppercase tracking-widest text-slate-500 font-mono">
                          votes
                        </span>
                      </div>
                    </div>

                    {canProposeGame && (
                      <Button
                        variant={hasVoted ? 'danger' : 'secondary'}
                        size="sm"
                        className="w-full sm:w-auto"
                        onClick={() => handleVoteToggle(game.id, hasVoted)}
                        isLoading={isLoading}
                      >
                        {hasVoted ? 'Retirer mon vote' : 'Voter pour ce jeu'}
                      </Button>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default EventDetailPage;
