const BADGES = [
  { title: "Secure checkout", detail: "Bank transfer or card, verified every time" },
  { title: "Nationwide delivery", detail: "Shipped from Nigeria to your door" },
  { title: "Easy exchanges", detail: "Wrong size or fit? We'll sort it out" },
];

export default function TrustBadges() {
  return (
    <div className="grid grid-cols-1 gap-6 border-y border-line py-8 text-center md:grid-cols-3">
      {BADGES.map((badge) => (
        <div key={badge.title}>
          <p className="text-sm">{badge.title}</p>
          <p className="mt-1 text-xs text-muted">{badge.detail}</p>
        </div>
      ))}
    </div>
  );
}