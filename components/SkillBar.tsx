export default function SkillBar({
  nombre,
  nivel,
  highlighted = false,
}: {
  nombre: string;
  nivel: number;
  highlighted?: boolean;
}) {
  return (
    <div
      id={`skill-${nombre}`}
      className={`mb-4 rounded-xl transition-colors duration-500 ${
        highlighted ? "bg-ios-blue/10 ring-1 ring-ios-blue/40 px-2 py-1.5 -mx-2" : ""
      }`}
    >
      <div className="flex justify-between text-[13.5px] mb-1.5">
        <span className="font-medium text-ios-text dark:text-white">{nombre}</span>
        <span className="text-ios-textSub dark:text-white/50">{nivel}%</span>
      </div>
      <div className="h-2 rounded-full bg-black/10 dark:bg-white/15 overflow-hidden">
        <div
          className="h-full rounded-full bg-ios-blue transition-all duration-700"
          style={{ width: `${nivel}%` }}
        />
      </div>
    </div>
  );
}
