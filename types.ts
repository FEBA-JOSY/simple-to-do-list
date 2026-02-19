
export interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

export interface AppState {
  tasks: Task[];
  isCoachLoading: boolean;
  motivation: string;
}
