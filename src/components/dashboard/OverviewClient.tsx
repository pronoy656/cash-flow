'use client';
import dynamic from 'next/dynamic';

const Overview = dynamic(() => import('@/components/dashboard/Overview'), {
  ssr: false,
});

export default function OverviewClient() {
  return <Overview />;
}

