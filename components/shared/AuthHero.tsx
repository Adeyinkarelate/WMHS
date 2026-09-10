import { Logo } from "@/components/shared/Logo";

export function AuthHero({
  image,
  title,
  body,
}: {
  image: string;
  title: string;
  body: string;
}) {
  return (
    <div className="relative hidden h-full overflow-hidden bg-primary lg:block">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/75 to-navy/35" />
      <div className="relative flex h-full min-h-full flex-col justify-between p-8 text-white xl:p-10">
        <Logo dark />
        <div className="max-w-md">
          <p className="font-heading text-xs font-semibold uppercase tracking-[0.18em] text-white/60">WMHS</p>
          <h1 className="mt-3 font-heading text-4xl leading-tight">{title}</h1>
          <p className="mt-4 text-base leading-relaxed text-white/75">{body}</p>
        </div>
      </div>
    </div>
  );
}
