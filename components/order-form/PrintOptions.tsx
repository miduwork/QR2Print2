import type { PrintColor, PrintSides } from "@/lib/orders/printOptions";
import {
  PRINT_COLOR_LABEL,
  PRINT_SIDES_LABEL,
} from "@/lib/orders/printOptions";
import { ChoiceRadioGroup } from "./ChoiceRadioGroup";

type Props = {
  printColor: PrintColor;
  printSides: PrintSides;
  onPrintColorChange: (c: PrintColor) => void;
  onPrintSidesChange: (s: PrintSides) => void;
  disabled: boolean;
};

const PRINT_COLORS = Object.keys(PRINT_COLOR_LABEL) as PrintColor[];
const PRINT_SIDES = Object.keys(PRINT_SIDES_LABEL) as PrintSides[];

export function PrintOptions({
  printColor,
  printSides,
  onPrintColorChange,
  onPrintSidesChange,
  disabled,
}: Props) {
  return (
    <>
      <ChoiceRadioGroup
        label="Loại in"
        options={PRINT_COLORS}
        value={printColor}
        onChange={onPrintColorChange}
        getOptionLabel={(c) => PRINT_COLOR_LABEL[c]}
        disabled={disabled}
        hint={
          <p className="mt-1 text-xs text-slate-500">
            Mặc định: in đen trắng · Tạm thời tính giá như nhau
          </p>
        }
      />

      <ChoiceRadioGroup
        label="In 2 mặt / 1 mặt"
        options={PRINT_SIDES}
        value={printSides}
        onChange={onPrintSidesChange}
        getOptionLabel={(s) => PRINT_SIDES_LABEL[s]}
        disabled={disabled}
        hint={
          <p className="mt-1 text-xs text-slate-500">
            Mặc định: in 2 mặt · Tạm thời tính giá như nhau
          </p>
        }
      />
    </>
  );
}
