import { api } from '../api-client';

export interface WeekScheduleSchool {
  schoolId: string;
  porsiCount: number;
  status: string;
  arrivedAt: string | null;
  completedAt: string | null;
}

export interface WeekScheduleDay {
  date: string;
  dayName: string;
  dayNum: number;
  isToday: boolean;
  totalPorsi: number;
  hasData: boolean;
  schools: WeekScheduleSchool[];
  assignedSchools: string[];
}

export const deliveryService = {
  getMyWeekSchedule(): Promise<{ days: WeekScheduleDay[] }> {
    return api.get('/delivery/my/week-schedule');
  },
};
