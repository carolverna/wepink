interface OptionGroupProps {
  label: string;
  options: string[];
  selected: number;
  onSelect: (index: number) => void;
}

export default function OptionGroup({ label, options, selected, onSelect }: OptionGroupProps) {
  return (
    <div className="opt" role="group" aria-label={label}>
      {options.map((option, index) => (
        <button key={option} aria-pressed={selected === index} onClick={() => onSelect(index)}>
          {option}
        </button>
      ))}
    </div>
  );
}
