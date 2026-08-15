import Image from "next/image";

type BodyImagesProps = { current: string; last?: string | null };

function BodyImage({ label, src, priority }: { label: string; src: string; priority?: boolean }) {
  return (
    <figure className="min-w-0">
      <div className="relative aspect-[3/4] overflow-hidden rounded-card border border-border bg-surface-muted">
        <Image fill sizes="(max-width: 640px) 100vw, 40vw" priority={priority} className="object-cover object-top" src={src} alt={`${label} body check-in`} />
      </div>
      <figcaption className="mt-3 text-center text-sm font-semibold text-strong">{label}</figcaption>
    </figure>
  );
}

export default function BodyImages({ current, last }: BodyImagesProps) {
  if (last && last !== current) {
    return <div className="grid gap-4 sm:grid-cols-2"><BodyImage label="Previous" src={last} /><BodyImage label="Current" src={current} priority /></div>;
  }
  return <div className="mx-auto max-w-sm"><BodyImage label="Current check-in" src={current} priority /></div>;
}
