import type { Metadata } from 'next';
import QuizFlow from '@/components/quiz/QuizFlow';

export const metadata: Metadata = {
  title: 'Find your style',
  description: 'Answer a few quick questions — for you or your little girl — and we’ll curate a personal edit of couture pieces.',
  alternates: { canonical: '/style-quiz' },
};

export default function StyleQuizPage() {
  return <QuizFlow />;
}
