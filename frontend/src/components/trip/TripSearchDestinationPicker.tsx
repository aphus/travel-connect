"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Check, ChevronsUpDown, Compass, MapPin, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  getProvinceDestinations,
  VIETNAM_PROVINCES,
} from "@/lib/vietnam-destinations";

type TripSearchDestinationPickerProps = {
  province: string;
  destinationPlace: string;
  onProvinceChange: (province: string) => void;
  onDestinationPlaceChange: (destinationPlace: string) => void;
  className?: string;
  compact?: boolean;
};

export function TripSearchDestinationPicker({
  province,
  destinationPlace,
  onProvinceChange,
  onDestinationPlaceChange,
  className,
  compact = false,
}: TripSearchDestinationPickerProps) {
  const [provinceOpen, setProvinceOpen] = useState(false);
  const [destinationOpen, setDestinationOpen] = useState(false);
  const destinationOptions = useMemo(
    () => getProvinceDestinations(province),
    [province],
  );

  const handleProvinceChange = (nextProvince: string) => {
    if (destinationPlace) onDestinationPlaceChange("");
    onProvinceChange(nextProvince);
    setProvinceOpen(false);
    setDestinationOpen(false);
  };

  const clearProvince = () => {
    if (destinationPlace) onDestinationPlaceChange("");
    onProvinceChange("");
    setProvinceOpen(false);
    setDestinationOpen(false);
  };

  const handleDestinationOpenChange = (nextOpen: boolean) => {
    if (!province) {
      setDestinationOpen(false);
      return;
    }

    setDestinationOpen(nextOpen);
  };

  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-6 md:grid-cols-2",
        compact && "gap-3",
        className,
      )}
    >
      <ComboboxField
        label="Tỉnh/thành phố"
        icon={<MapPin className="mr-2 h-4 w-4 shrink-0 text-slate-400" />}
        open={provinceOpen}
        onOpenChange={setProvinceOpen}
        value={province}
        placeholder="Chọn tỉnh/thành phố"
        searchPlaceholder="Gõ để lọc tỉnh/thành phố..."
        emptyMessage="Không tìm thấy tỉnh/thành phố nào."
        options={VIETNAM_PROVINCES}
        selectedValue={province}
        onSelect={handleProvinceChange}
        onClear={province ? clearProvince : undefined}
        hideLabel={compact}
        compact={compact}
      />

      <ComboboxField
        label="Địa điểm đến"
        icon={<Compass className="mr-2 h-4 w-4 shrink-0 text-slate-400" />}
        open={destinationOpen}
        onOpenChange={handleDestinationOpenChange}
        value={destinationPlace}
        placeholder="Địa điểm đến"
        searchPlaceholder="Gõ để lọc địa điểm..."
        emptyMessage={
          province
            ? "Không tìm thấy địa điểm nào."
            : "Vui lòng chọn tỉnh/thành phố"
        }
        options={destinationOptions}
        selectedValue={destinationPlace}
        onSelect={(nextDestinationPlace) => {
          if (!province) return;
          onDestinationPlaceChange(nextDestinationPlace);
          setDestinationOpen(false);
        }}
        onClear={
          destinationPlace ? () => onDestinationPlaceChange("") : undefined
        }
        hideLabel={compact}
        muted={!province}
        hint={!province ? "Vui lòng chọn tỉnh/thành phố" : undefined}
        compact={compact}
      />
    </div>
  );
}

type ComboboxFieldProps = {
  label: string;
  icon: ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: string;
  placeholder: string;
  searchPlaceholder: string;
  emptyMessage: string;
  options: string[];
  selectedValue: string;
  onSelect: (value: string) => void;
  onClear?: () => void;
  disabled?: boolean;
  hideLabel?: boolean;
  muted?: boolean;
  hint?: string;
  compact?: boolean;
};

function ComboboxField({
  label,
  icon,
  open,
  onOpenChange,
  value,
  placeholder,
  searchPlaceholder,
  emptyMessage,
  options,
  selectedValue,
  onSelect,
  onClear,
  disabled = false,
  hideLabel = false,
  muted = false,
  hint,
  compact = false,
}: ComboboxFieldProps) {
  return (
    <div className={cn("group relative", hideLabel ? "space-y-0" : "space-y-2")}>
      <label
        className={cn(
          "font-bold uppercase text-slate-500",
          hideLabel && "sr-only",
          compact ? "text-[10px]" : "text-xs",
        )}
      >
        {label}
      </label>
      <Popover open={open} onOpenChange={onOpenChange}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-disabled={muted || disabled}
            disabled={disabled}
            className={cn(
              "w-full justify-between overflow-hidden border-slate-200 bg-white text-left font-normal hover:bg-white",
              compact ? "h-11 px-3 text-sm" : "h-12 px-3",
              !value && "text-slate-500",
              muted &&
                !value &&
                "cursor-help border-slate-300 bg-slate-100 text-slate-500 hover:bg-slate-100 hover:text-slate-500 focus:bg-slate-100 active:bg-slate-100",
              disabled && "cursor-not-allowed bg-slate-50 opacity-70",
            )}
          >
            <span className="flex min-w-0 flex-1 items-center">
              {icon}
              <span className="truncate">{value || placeholder}</span>
            </span>
            <span className="ml-2 flex shrink-0 items-center gap-1">
              {onClear && !disabled && (
                <span
                  role="button"
                  tabIndex={0}
                  aria-label={`Xóa ${label.toLowerCase()}`}
                  className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    onClear();
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      event.stopPropagation();
                      onClear();
                    }
                  }}
                >
                  <X className="h-3.5 w-3.5" />
                </span>
              )}
              <ChevronsUpDown className="h-4 w-4 opacity-50" />
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="p-0"
          style={{ width: "var(--radix-popover-trigger-width)" }}
        >
          <Command filter={filterComboboxOption}>
            <CommandInput placeholder={searchPlaceholder} />
            <CommandList className="max-h-[260px]">
              <CommandEmpty>{emptyMessage}</CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option}
                    value={option}
                    onSelect={() => onSelect(option)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        option === selectedValue
                          ? "text-blue-600 opacity-100"
                          : "opacity-0",
                      )}
                    />
                    <span className="truncate">{option}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {hint && (
        <span className="pointer-events-none absolute left-3 top-[calc(100%+8px)] z-50 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700 opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
          {hint}
        </span>
      )}
    </div>
  );
}

function filterComboboxOption(value: string, search: string) {
  const normalizedValue = normalizeComboboxText(value);
  const normalizedSearch = normalizeComboboxText(search);

  if (!normalizedSearch) return 1;
  if (normalizedValue === normalizedSearch) return 1;
  if (normalizedValue.startsWith(normalizedSearch)) return 0.95;
  if (normalizedValue.includes(normalizedSearch)) return 0.75;

  return 0;
}

function normalizeComboboxText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}
