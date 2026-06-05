"use client";

import { useMemo, useState } from "react";
import { Check, ChevronsUpDown, Compass, MapPin } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  getProvinceDestinations,
  OTHER_DESTINATION_OPTION,
  VIETNAM_PROVINCES,
} from "@/lib/vietnam-destinations";

type TripDestinationPickerProps = {
  province: string;
  destinationPlace: string;
  customDestination: string;
  provinceError?: string;
  destinationPlaceError?: string;
  customDestinationError?: string;
  onProvinceChange: (province: string) => void;
  onDestinationPlaceChange: (destinationPlace: string) => void;
  onCustomDestinationChange: (customDestination: string) => void;
};

export function TripDestinationPicker({
  province,
  destinationPlace,
  customDestination,
  provinceError,
  destinationPlaceError,
  customDestinationError,
  onProvinceChange,
  onDestinationPlaceChange,
  onCustomDestinationChange,
}: TripDestinationPickerProps) {
  const [provinceOpen, setProvinceOpen] = useState(false);
  const [destinationOpen, setDestinationOpen] = useState(false);
  const destinationOptions = useMemo(
    () => getProvinceDestinations(province),
    [province],
  );
  const showCustomDestination = destinationPlace === OTHER_DESTINATION_OPTION;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="province" className="flex items-center gap-2 font-semibold text-slate-700">
          Tỉnh/thành phố <span className="text-red-500">*</span>
        </Label>
        <Popover open={provinceOpen} onOpenChange={setProvinceOpen}>
          <PopoverTrigger asChild>
            <Button
              id="province"
              type="button"
              variant="outline"
              role="combobox"
              aria-expanded={provinceOpen}
              aria-invalid={Boolean(provinceError)}
              className={cn(
                "h-12 w-full justify-between overflow-hidden border-slate-200 bg-slate-50 text-base font-normal hover:bg-white",
                !province && "text-slate-500",
                provinceError && "border-red-500",
              )}
            >
              <span className="flex min-w-0 flex-1 items-center">
                <MapPin className="mr-2 h-5 w-5 shrink-0 text-slate-400" />
                <span className="truncate text-left">
                  {province || "Chọn tỉnh/thành phố bạn muốn đến..."}
                </span>
              </span>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align="start"
            className="p-0"
            style={{ width: "var(--radix-popover-trigger-width)" }}
          >
            <Command>
              <CommandInput placeholder="Gõ tên tỉnh/thành phố..." />
              <CommandList className="max-h-[250px]">
                <CommandEmpty>Không tìm thấy tỉnh/thành phố nào.</CommandEmpty>
                <CommandGroup>
                  {VIETNAM_PROVINCES.map((provinceOption) => (
                    <CommandItem
                      key={provinceOption}
                      value={provinceOption}
                      onSelect={() => {
                        onProvinceChange(provinceOption);
                        setProvinceOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          provinceOption === province
                            ? "opacity-100 text-blue-600"
                            : "opacity-0",
                        )}
                      />
                      <span className="truncate">{provinceOption}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        <FieldError message={provinceError} />
      </div>

      {province && (
        <div className="space-y-2">
          <Label htmlFor="destinationPlace" className="flex items-center gap-2 font-semibold text-slate-700">
            Điểm đến cụ thể <span className="text-red-500">*</span>
          </Label>
          <Popover open={destinationOpen} onOpenChange={setDestinationOpen}>
            <PopoverTrigger asChild>
              <Button
                id="destinationPlace"
                type="button"
                variant="outline"
                role="combobox"
                aria-expanded={destinationOpen}
                aria-invalid={Boolean(destinationPlaceError)}
                className={cn(
                  "h-12 w-full justify-between overflow-hidden border-slate-200 bg-slate-50 text-base font-normal hover:bg-white",
                  !destinationPlace && "text-slate-500",
                  destinationPlaceError && "border-red-500",
                )}
              >
                <span className="flex min-w-0 flex-1 items-center">
                  <Compass className="mr-2 h-5 w-5 shrink-0 text-slate-400" />
                  <span className="truncate text-left">
                    {destinationPlace || `Chọn điểm đến tại ${province}...`}
                  </span>
                </span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              align="start"
              className="p-0"
              style={{ width: "var(--radix-popover-trigger-width)" }}
            >
              <Command>
                <CommandInput placeholder="Gõ tên điểm đến..." />
                <CommandList className="max-h-[250px]">
                  <CommandEmpty>Không tìm thấy điểm đến nào.</CommandEmpty>
                  <CommandGroup>
                    {destinationOptions.map((destinationOption) => (
                      <CommandItem
                        key={destinationOption}
                        value={destinationOption}
                        onSelect={() => {
                          onDestinationPlaceChange(destinationOption);
                          setDestinationOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            destinationOption === destinationPlace
                              ? "opacity-100 text-blue-600"
                              : "opacity-0",
                          )}
                        />
                        <span className="truncate">{destinationOption}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                  <CommandSeparator />
                  <CommandGroup>
                    <CommandItem
                      value={OTHER_DESTINATION_OPTION}
                      onSelect={() => {
                        onDestinationPlaceChange(OTHER_DESTINATION_OPTION);
                        setDestinationOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          showCustomDestination
                            ? "opacity-100 text-blue-600"
                            : "opacity-0",
                        )}
                      />
                      {OTHER_DESTINATION_OPTION}
                    </CommandItem>
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          <FieldError message={destinationPlaceError} />
        </div>
      )}

      {province && showCustomDestination && (
        <div className="space-y-2">
          <Label htmlFor="customDestination" className="font-semibold text-slate-700">
            Điểm đến khác <span className="text-red-500">*</span>
          </Label>
          <Input
            id="customDestination"
            value={customDestination}
            onChange={(event) => onCustomDestinationChange(event.target.value)}
            placeholder="VD: Biển Nha Trang"
            aria-invalid={Boolean(customDestinationError)}
            className={cn(
              "h-12 bg-slate-50 text-base transition-all focus:bg-white",
              customDestinationError && "border-red-500",
            )}
          />
          <FieldError message={customDestinationError} />
        </div>
      )}
    </div>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;

  return <p className="text-sm font-medium text-red-500">{message}</p>;
}
