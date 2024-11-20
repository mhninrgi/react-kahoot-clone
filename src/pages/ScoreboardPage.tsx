import { lazy } from 'react';

const Scoreboard = lazy(() => import('../components/Scoreboard'));

export default function QuestionsPage() {
  return (
    <>
      <Scoreboard />
    </>
  );
}
