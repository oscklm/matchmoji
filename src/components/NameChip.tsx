import { useEffect, useState } from "react";
import { Icons } from "./Icons";
import { Input } from "../ui/Input";

interface Props {
  name: string;
  onChange: (name: string) => void;
}

export function NameChip({ name, onChange }: Props) {
  const [draft, setDraft] = useState(name);

  useEffect(() => setDraft(name), [name]);

  return (
    <div className="relative w-52 max-w-xs">
      <Input
        value={draft}
        placeholder="Your name"
        maxLength={24}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => onChange(draft)}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.currentTarget.blur();
        }}
        className="border-neutral-300 pr-9 text-neutral-500 transition-colors focus:border-black focus:text-black"
      />
      <Icons.Edit
        size={15}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400"
      />
    </div>
  );
}
