type AvatarProps = {
  name: string;
  src?: string | null;
  size: number;
  color?: string;
};

function initialsOf(name: string) {
  return name.trim().split(/\s+/).map((part) => part[0] ?? '').join('').slice(0, 2).toUpperCase() || '?';
}

export default function Avatar({ name, src, size, color }: AvatarProps) {
  const style = { width: size, height: size, fontSize: Math.round(size * 0.36), background: color };
  if (src) return <img className="avatar" src={src} alt={name} style={style} />;
  return <span className="avatar" style={style} aria-label={name}>{initialsOf(name)}</span>;
}
