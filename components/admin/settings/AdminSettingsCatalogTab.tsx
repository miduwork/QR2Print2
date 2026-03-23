"use client";

import { inputClass, labelClass } from "@/components/admin/adminStyles";
import type { AdminSettingsCatalogTabProps } from "@/components/admin/settings/settingsTabTypes";

export function AdminSettingsCatalogTab({
  config,
  setConfig,
}: AdminSettingsCatalogTabProps) {
  const cat = config.catalog;
  return (
    <div
      className="space-y-4"
      id="admin-settings-panel-catalog"
      role="tabpanel"
      aria-labelledby="admin-settings-tab-catalog"
    >
      <div>
        <p className={labelClass}>Khổ giấy (mỗi dòng một)</p>
        <textarea
          className="mt-1 min-h-[80px] w-full rounded-md border border-border px-3 py-2 font-mono text-sm"
          value={cat.paperSizes.join("\n")}
          onChange={(e) => {
            const paperSizes = e.target.value
              .split("\n")
              .map((s) => s.trim())
              .filter(Boolean);
            setConfig((c) =>
              c
                ? {
                    ...c,
                    catalog: { ...c.catalog, paperSizes },
                  }
                : c,
            );
          }}
        />
      </div>
      <div>
        <p className={labelClass}>Định lượng gsm (mỗi dòng một)</p>
        <textarea
          className="mt-1 min-h-[100px] w-full rounded-md border border-border px-3 py-2 font-mono text-sm"
          value={cat.gsmOptions.join("\n")}
          onChange={(e) => {
            const gsmOptions = e.target.value
              .split("\n")
              .map((s) => s.trim())
              .filter(Boolean);
            setConfig((c) =>
              c
                ? {
                    ...c,
                    catalog: { ...c.catalog, gsmOptions },
                  }
                : c,
            );
          }}
        />
      </div>
      <div>
        <p className={labelClass}>Đóng gáy (label hiển thị)</p>
        <div className="mt-2 space-y-2">
          {cat.bindingOptions.map((b, i) => (
            <div key={b.value} className="flex flex-wrap gap-2">
              <span className="w-28 text-sm text-muted-foreground">{b.value}</span>
              <input
                className={inputClass}
                value={b.label}
                onChange={(e) => {
                  const label = e.target.value;
                  setConfig((c) => {
                    if (!c) return c;
                    const bindingOptions = [...c.catalog.bindingOptions];
                    bindingOptions[i] = { ...bindingOptions[i]!, label };
                    return { ...c, catalog: { ...c.catalog, bindingOptions } };
                  });
                }}
              />
            </div>
          ))}
        </div>
      </div>
      <div>
        <p className={labelClass}>Loại đơn in (nhãn)</p>
        <div className="mt-2 space-y-2">
          {cat.printJobKindOptions.map((o, i) => (
            <div key={o.value} className="flex flex-wrap gap-2">
              <span className="w-28 text-sm text-muted-foreground">{o.value}</span>
              <input
                className={inputClass}
                value={o.label}
                onChange={(e) => {
                  const label = e.target.value;
                  setConfig((c) => {
                    if (!c) return c;
                    const printJobKindOptions = [
                      ...c.catalog.printJobKindOptions,
                    ];
                    printJobKindOptions[i] = {
                      ...printJobKindOptions[i]!,
                      label,
                    };
                    return {
                      ...c,
                      catalog: { ...c.catalog, printJobKindOptions },
                    };
                  });
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
