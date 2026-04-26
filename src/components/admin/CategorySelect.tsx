import { Check, ChevronsUpDown, ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { Category } from "@/shared/types";

type CategorySelectProps = {
  categories: Category[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  allLabel?: string;
  disabled?: boolean;
};

export const CategorySelect = ({
  categories,
  value,
  onChange,
  placeholder,
  allLabel,
  disabled = false,
}: CategorySelectProps) => {
  const selectedCategory = categories.find(category => category.id === value);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className="h-11 w-full justify-between rounded-xl border-border/80 bg-card/70 px-3 text-left font-normal shadow-[0_8px_20px_rgba(15,23,42,0.04)] hover:bg-card"
        >
          <span className="flex min-w-0 items-center gap-3">
            {selectedCategory ? (
              <>
                <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted">
                  {selectedCategory.image ? (
                    <img src={selectedCategory.image} alt={selectedCategory.name} className="h-full w-full object-cover" />
                  ) : (
                    <ImagePlus size={14} className="text-muted-foreground" />
                  )}
                </span>
                <span className="truncate text-sm text-foreground">{selectedCategory.name}</span>
              </>
            ) : (
              <span className="truncate text-sm text-muted-foreground">{value === "" && allLabel ? allLabel : placeholder}</span>
            )}
          </span>
          <ChevronsUpDown size={16} className="shrink-0 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[320px] p-0">
        <Command>
          <CommandInput placeholder={placeholder} />
          <CommandList>
            <CommandEmpty>No category found.</CommandEmpty>
            <CommandGroup>
              {allLabel && (
                <CommandItem value={allLabel} onSelect={() => onChange("")} className="gap-3 rounded-lg px-3 py-2.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-muted text-xs font-semibold text-muted-foreground">
                    All
                  </span>
                  <span className="flex-1 text-sm">{allLabel}</span>
                  <Check className={cn("h-4 w-4", value === "" ? "opacity-100" : "opacity-0")} />
                </CommandItem>
              )}
              {categories.map(category => (
                <CommandItem
                  key={category.id}
                  value={`${category.name} ${category.id}`}
                  onSelect={() => onChange(category.id)}
                  className="gap-3 rounded-lg px-3 py-2.5"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted">
                    {category.image ? (
                      <img src={category.image} alt={category.name} className="h-full w-full object-cover" />
                    ) : (
                      <ImagePlus size={14} className="text-muted-foreground" />
                    )}
                  </span>
                  <span className="flex-1 truncate text-sm">{category.name}</span>
                  <Check className={cn("h-4 w-4", value === category.id ? "opacity-100" : "opacity-0")} />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
