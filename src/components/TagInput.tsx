import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { X, Plus } from "lucide-react";

interface TagInputProps {
  label: string;
  tags: string[];
  onAdd: (tag: string) => void;
  onRemove: (tag: string) => void;
  placeholder?: string;
}

const TagInput = ({ label, tags, onAdd, onRemove, placeholder }: TagInputProps) => {
  const [value, setValue] = useState("");

  const add = () => {
    if (!value.trim()) return;
    onAdd(value.trim());
    setValue("");
  };

  return (
    <div>
      <Label>{label}</Label>
      <div className="flex flex-wrap gap-1.5 mt-2 mb-2">
        {tags.map((tag) => (
          <Badge key={tag} variant="secondary" className="gap-1">
            {tag}
            <button onClick={() => onRemove(tag)} className="hover:text-destructive"><X className="h-3 w-3" /></button>
          </Badge>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
          placeholder={placeholder}
          className="flex-1"
        />
        <Button variant="outline" size="sm" onClick={add}><Plus className="h-4 w-4" /></Button>
      </div>
    </div>
  );
};

export default TagInput;
