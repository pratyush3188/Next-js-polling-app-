import { create } from 'zustand';

interface User {
  id: string;
  username: string;
}

interface Poll {
  id: string;
  title: string;
  options: PollOption[];
  creatorId: string;
  createdAt: string;
  closed: boolean;
}

interface PollOption {
  id: string;
  text: string;
  votes: number;
}

interface Store {
  user: User | null;
  polls: Poll[];
  setUser: (user: User | null) => void;
  setPolls: (polls: Poll[]) => void;
  addPoll: (poll: Poll) => void;
}

export const useStore = create<Store>((set) => ({
  user: null,
  polls: [],
  setUser: (user) => set({ user }),
  setPolls: (polls) => set({ polls }),
  addPoll: (poll) => set((state) => ({ polls: [...state.polls, poll] })),
}));

