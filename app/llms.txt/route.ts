import { getLLMIndex } from '@/lib/source';

export const revalidate = false;

export function GET() {
  return new Response(getLLMIndex(), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}
