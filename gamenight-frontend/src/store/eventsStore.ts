import { create } from 'zustand';
import api from '../services/api';

export type Event = {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  date: string;              // ← pas scheduledDate
  location: string;
  maxParticipants?: number;
  status: 'PLANNED' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'; // ← pas isConfirmed
  hostId: string;
  winningGameId?: string;
  createdAt: string;

  // Relations
  host?: {
    id: string;
    name: string;            // ← pas username
    email: string;
  };
  members?: Array<{          // ← pas participants
    id: string;
    userId: string;          // ← important pour le filtre
    eventId: string;
    joinedAt: string;
    user?: { id: string; name: string; email: string };
  }>;
  games?: Array<{
    id: string;
    name: string;
    proposedById: string;
    eventId: string;
    proposedBy?: { id: string; name: string };
    votes?: Array<{ userId: string }>;
    _count?: { votes: number };
    hasVoted?: boolean;
  }>;
  winningGame?: {
    id: string;
    name: string;
  };
  _count?: {
    members: number;
    games: number;
  };
};
interface EventsStore {
  events: Event[];
  currentEvent: Event | null;
  isLoading: boolean;
  error: string | null;

  setEvents: (events: Event[]) => void;
  setCurrentEvent: (event: Event | null) => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;

  fetchEvents: () => Promise<void>;
  fetchEventById: (id: string) => Promise<void>;
  createEvent: (data: any) => Promise<string>;
  updateEvent: (id: string, data: any) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  joinEvent: (id: string) => Promise<void>;
  leaveEvent: (id: string) => Promise<void>;
  confirmEvent: (id: string) => Promise<void>;
  proposeGame: (eventId: string, gameName: string) => Promise<void>;
  voteGame: (gameId: string) => Promise<void>;
  removeVote: (gameId: string) => Promise<void>;
}

export const useEventsStore = create<EventsStore>((set, get) => ({
  events: [],
  currentEvent: null,
  isLoading: false,
  error: null,

  setEvents: (events) => set({ events }),
  setCurrentEvent: (event) => set({ currentEvent: event }),
  setError: (error) => set({ error }),
  setLoading: (loading) => set({ isLoading: loading }),

  fetchEvents: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/events');
      const payload = response.data?.data;
      const events = Array.isArray(payload) ? payload : [];
      set({ events, isLoading: false });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch events';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  fetchEventById: async (id: string) => {
    console.log('[EventsStore] Fetching event:', id);
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/events/${id}`);
      set({ currentEvent: response.data?.data ?? null, isLoading: false });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch event';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  createEvent: async (data: any) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/events', data);
      const newEvent = response.data?.data;
      if (!newEvent) {
        throw new Error('Empty event payload');
      }
      set((state) => ({
        events: [...state.events, newEvent],
        isLoading: false,
      }));
      return newEvent.id;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to create event';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  updateEvent: async (id: string, data: any) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.put(`/events/${id}`, data);
      const updatedEvent = response.data?.data;
      if (!updatedEvent) {
        throw new Error('Invalid update response');
      }
      set((state) => ({
        events: state.events.map((e) => (e.id === id ? updatedEvent : e)),
        currentEvent: state.currentEvent?.id === id ? updatedEvent : state.currentEvent,
        isLoading: false,
      }));
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update event';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  deleteEvent: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/events/${id}`);
      set((state) => ({
        events: state.events.filter((e) => e.id !== id),
        isLoading: false,
      }));
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to delete event';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  joinEvent: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await api.post(`/events/${id}/join`);
      await get().fetchEvents();
      if (get().currentEvent?.id === id) {
        await get().fetchEventById(id);
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to join event';
      set({ error: message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  leaveEvent: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await api.post(`/events/${id}/leave`);
      await get().fetchEvents();
      if (get().currentEvent?.id === id) {
        await get().fetchEventById(id);
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to leave event';
      set({ error: message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  confirmEvent: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post(`/events/${id}/confirm`);
      const confirmedEvent = response.data?.data;
      if (!confirmedEvent) {
        throw new Error('Invalid confirm response');
      }
      set((state) => ({
        events: state.events.map((e) => (e.id === id ? confirmedEvent : e)),
        currentEvent: state.currentEvent?.id === id ? confirmedEvent : state.currentEvent,
        isLoading: false,
      }));
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to confirm event';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  proposeGame: async (eventId: string, gameName: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post(`/events/${eventId}/games`, { name: gameName });
      const game = response.data?.data;
      if (!game) {
        throw new Error('Invalid game response');
      }
      set((state) => ({
        currentEvent: state.currentEvent?.id === eventId
          ? { ...state.currentEvent, games: [...(state.currentEvent?.games || []), game] }
          : state.currentEvent,
        isLoading: false,
      }));
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to propose game';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  voteGame: async (gameId: string) => {
    set({ error: null });
    try {
      await api.post(`/games/${gameId}/vote`);
      set((state) => {
        if (state.currentEvent && state.currentEvent.games) {
          return {
            currentEvent: {
              ...state.currentEvent,
              games: state.currentEvent.games.map((g) =>
                g.id === gameId ? { ...g, _count: { votes: (g._count?.votes || 0) + 1 }, hasVoted: true } : g
              ),
            },
          };
        }
        return state;
      });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to vote';
      set({ error: message });
      throw error;
    }
  },

  removeVote: async (gameId: string) => {
    set({ error: null });
    try {
      await api.delete(`/games/${gameId}/vote`);
      set((state) => {
        if (state.currentEvent && state.currentEvent.games) {
          return {
            currentEvent: {
              ...state.currentEvent,
              games: state.currentEvent.games.map((g) =>
                g.id === gameId ? { ...g, _count: { votes: Math.max(0, (g._count?.votes || 0) - 1) }, hasVoted: false } : g
              ),
            },
          };
        }
        return state;
      });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to remove vote';
      set({ error: message });
      throw error;
    }
  },
}));
