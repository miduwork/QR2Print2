"use client";

import { useCallback, useEffect, useState } from "react";
import {
  type AdminOrdersColumnVisibility,
  defaultAdminOrdersColumnVisibility,
  loadAdminOrdersColumnVisibility,
  saveAdminOrdersColumnVisibility,
} from "@/lib/admin/adminOrdersColumnConfig";

export function useAdminOrdersColumnVisibility(): {
  visible: AdminOrdersColumnVisibility;
  setVisible: (v: AdminOrdersColumnVisibility) => void;
  setOne: (id: keyof AdminOrdersColumnVisibility, value: boolean) => void;
} {
  const [visible, setVisibleState] = useState<AdminOrdersColumnVisibility>(
    defaultAdminOrdersColumnVisibility,
  );

  useEffect(() => {
    setVisibleState(loadAdminOrdersColumnVisibility());
  }, []);

  const setVisible = useCallback((v: AdminOrdersColumnVisibility) => {
    setVisibleState(v);
    saveAdminOrdersColumnVisibility(v);
  }, []);

  const setOne = useCallback(
    (id: keyof AdminOrdersColumnVisibility, value: boolean) => {
      setVisibleState((prev) => {
        const next = { ...prev, [id]: value };
        saveAdminOrdersColumnVisibility(next);
        return next;
      });
    },
    [],
  );

  return { visible, setVisible, setOne };
}
