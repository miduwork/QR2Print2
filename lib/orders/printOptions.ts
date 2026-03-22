/** In đen trắng (mặc định) hoặc in màu */
export type PrintColor = "bw" | "color";

/** In 2 mặt (mặc định) hoặc in 1 mặt */
export type PrintSides = "double" | "single";

export const PRINT_COLOR_LABEL: Record<PrintColor, string> = {
  bw: "In đen trắng",
  color: "In màu",
};

export const PRINT_SIDES_LABEL: Record<PrintSides, string> = {
  double: "In 2 mặt",
  single: "In 1 mặt",
};
