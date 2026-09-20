import { Link } from 'wouter';
import { ArrowLeft, Leaf } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="page-grid flex min-h-[calc(100dvh-68px)] items-center justify-center px-5">
      <div className="max-w-md text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-secondary text-primary"><Leaf size={28} /></div>
        <p className="mt-7 font-mono text-[10px] uppercase tracking-[.2em] text-accent">Record not found</p>
        <h1 className="mt-2 font-serif text-4xl tracking-[-.04em] text-primary">That path isn’t in the grove.</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">The page may have moved, or this record has not been added to your workspace yet.</p>
        <Link href="/dashboard" data-testid="link-not-found-dashboard" className="mt-7 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"><ArrowLeft size={15} /> Back to overview</Link>
      </div>
    </div>
  );
}
