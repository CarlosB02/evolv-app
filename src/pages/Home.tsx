import { Header } from '../components/Header';
import { CheckInWeek } from '../components/CheckInWeek';
import { GoalStrategyCard } from '../components/GoalStrategyCard';
import { NextWorkout } from '../components/NextWorkout';
import { Indicators } from '../components/Indicators';
import { Motivation } from '../components/Motivation';
import { 
  mockStudent, 
  mockCheckIns, 
  mockWeeklySummary, 
  mockGoalStrategy,
  mockNextWorkout,
  mockIndicators,
  mockMotivation
} from '../data';

interface HomeProps {
  onGoToWorkout?: () => void;
}

export function Home({ onGoToWorkout }: HomeProps) {
  return (
    <>
      <Header student={mockStudent} />
      <main className="flex flex-col gap-2">
        <CheckInWeek checkIns={mockCheckIns} summary={mockWeeklySummary} />
        <GoalStrategyCard data={mockGoalStrategy} />
        <NextWorkout workout={mockNextWorkout} onGoToWorkout={onGoToWorkout} />
        <Indicators indicators={mockIndicators} />
        <Motivation message={mockMotivation} />
      </main>
    </>
  );
}
