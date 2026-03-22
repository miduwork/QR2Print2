"use client";

import { OrderFileLinks } from "@/components/admin/orders/OrderFileLinks";
import { OrderPrintSpec } from "@/components/admin/orders/OrderPrintSpec";
import { OrderPrioritySelect } from "@/components/admin/orders/OrderPrioritySelect";
import { OrderRowActions } from "@/components/admin/orders/OrderRowActions";
import { OrderStatusBadge } from "@/components/admin/orders/OrderStatusBadge";
import {
  adminEmptyStateCardClass,
  adminMainContentClass,
  adminMobileCardClass,
  adminTableContainerClass,
  adminTableTheadCellClass,
  linkAccentClass,
  tableRowClass,
} from "@/components/order-form/formStyles";
import { useOrdersList } from "@/hooks/useOrdersList";
import { getRelativeTime, formatDateTime } from "@/lib/utils/relativeTime";

export default function AdminPage() {
  const {
    orders,
    loading,
    error,
    updatingId,
    handleRetry,
    updateOrderStatus,
    updateOrderPriority,
  } = useOrdersList();

  if (loading) {
    return (
      <main className={adminMainContentClass}>
        <div className="flex items-center justify-center py-20">
          <span className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-focusRing border-t-transparent" />
          <span className="ml-3 text-muted-foreground">Đang tải đơn hàng...</span>
        </div>
      </main>
    );
  }

  if (error) {
    const isNetworkError = /failed to fetch|network|load/i.test(error);
    return (
      <main className={adminMainContentClass}>
        <div className="rounded-xl border border-red-200 bg-danger p-5 text-danger-foreground">
          <p className="font-medium">Lỗi tải dữ liệu</p>
          <p className="mt-1 text-sm">{error}</p>
          {isNetworkError && (
            <ul className="mt-3 list-inside list-disc text-sm opacity-90">
              <li>Kiểm tra kết nối mạng.</li>
              <li>Vào Supabase Dashboard → Project đang dùng có bị tạm dừng (paused) không — nếu có, bấm Restore.</li>
              <li>Kiểm tra lại <code className="rounded bg-red-100 px-1">.env.local</code> (NEXT_PUBLIC_SUPABASE_URL và NEXT_PUBLIC_SUPABASE_ANON_KEY).</li>
            </ul>
          )}
          <button
            type="button"
            onClick={handleRetry}
            className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Thử lại
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className={adminMainContentClass}>
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Quản lý đơn hàng</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Tự động cập nhật mỗi 30 giây · {orders.length} đơn
          </p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className={adminEmptyStateCardClass}>
          Chưa có đơn hàng nào.
        </div>
      ) : (
        <>
          <div className={adminTableContainerClass}>
            <table className="w-full text-left text-sm">
              <thead>
                <tr>
                  <th className={`${adminTableTheadCellClass} w-[1%] whitespace-nowrap px-3 py-3`}>Tạo đơn</th>
                  <th className={`${adminTableTheadCellClass} w-[1%] whitespace-nowrap px-3 py-3`}>Hoàn thành</th>
                  <th className={`${adminTableTheadCellClass} w-[1%] whitespace-nowrap px-3 py-3`}>Giao hàng</th>
                  <th className={`${adminTableTheadCellClass} whitespace-nowrap px-3 py-3`}>Khách hàng</th>
                  <th className={`${adminTableTheadCellClass} whitespace-nowrap px-3 py-3`}>In</th>
                  <th className={`${adminTableTheadCellClass} min-w-[200px] px-4 py-3`}>Ghi chú</th>
                  <th className={`${adminTableTheadCellClass} px-4 py-3`}>SĐT</th>
                  <th className={`${adminTableTheadCellClass} px-4 py-3`}>File</th>
                  <th className={`${adminTableTheadCellClass} w-[1%] whitespace-nowrap px-3 py-3`}>
                    Trang × Bản
                  </th>
                  <th className={`${adminTableTheadCellClass} px-4 py-3`}>Nhận hàng</th>
                  <th className={`${adminTableTheadCellClass} px-4 py-3`}>Ưu tiên</th>
                  <th className={`${adminTableTheadCellClass} px-4 py-3`}>Trạng thái</th>
                  <th className={`${adminTableTheadCellClass} px-4 py-3`}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className={tableRowClass}>
                    <td className="w-[1%] whitespace-nowrap px-3 py-3 text-muted-foreground">
                      <span className="block text-xs">{getRelativeTime(order.created_at)}</span>
                      <span className="block text-xs opacity-80">{formatDateTime(order.created_at)}</span>
                    </td>
                    <td className="w-[1%] whitespace-nowrap px-3 py-3 text-muted-foreground">
                      {order.completed_at ? (
                        <>
                          <span className="block text-xs">{getRelativeTime(order.completed_at)}</span>
                          <span className="block text-xs opacity-80">{formatDateTime(order.completed_at)}</span>
                        </>
                      ) : (
                        <span className="text-placeholder">—</span>
                      )}
                    </td>
                    <td className="w-[1%] whitespace-nowrap px-3 py-3 text-muted-foreground">
                      {order.delivered_at ? (
                        <>
                          <span className="block text-xs">{getRelativeTime(order.delivered_at)}</span>
                          <span className="block text-xs opacity-80">{formatDateTime(order.delivered_at)}</span>
                        </>
                      ) : (
                        <span className="text-placeholder">—</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3">
                      <span className="font-medium text-foreground">{order.customer_name}</span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-xs text-muted-foreground">
                      <OrderPrintSpec order={order} />
                    </td>
                    <td className="min-w-[200px] px-4 py-3">
                      {order.note ? (
                        <p className="text-xs text-muted-foreground" title={order.note}>
                          {order.note}
                        </p>
                      ) : (
                        <span className="text-placeholder">—</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <a href={`tel:${order.phone_number}`} className={linkAccentClass}>
                        {order.phone_number}
                      </a>
                    </td>
                    <td className="px-4 py-3">
                      <OrderFileLinks
                        fileUrl={order.file_url}
                        fileName={order.file_name}
                        variant="compact"
                      />
                    </td>
                    <td className="w-[1%] whitespace-nowrap px-3 py-3 text-center text-muted-foreground">
                      {order.page_count != null ? (
                        <span className="text-xs">
                          {order.page_count} × {order.copies ?? 1}
                        </span>
                      ) : (
                        <span className="text-placeholder">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      <span className="text-xs">
                        {order.delivery_method === "delivery" ? "Giao tận nhà" : "Đến lấy"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <OrderPrioritySelect
                        order={order}
                        updatingId={updatingId}
                        onPriorityChange={updateOrderPriority}
                        variant="table"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        <OrderRowActions
                          order={order}
                          updatingId={updatingId}
                          onUpdateStatus={updateOrderStatus}
                          size="table"
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-4 md:hidden">
            {orders.map((order) => (
              <div key={order.id} className={adminMobileCardClass}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-placeholder">
                      Tạo đơn: {getRelativeTime(order.created_at)} · {formatDateTime(order.created_at)}
                    </p>
                    {order.completed_at && (
                      <p className="text-xs text-placeholder">
                        Hoàn thành: {getRelativeTime(order.completed_at)} · {formatDateTime(order.completed_at)}
                      </p>
                    )}
                    {order.delivered_at && (
                      <p className="text-xs text-placeholder">
                        Giao hàng: {getRelativeTime(order.delivered_at)} · {formatDateTime(order.delivered_at)}
                      </p>
                    )}
                    <p className="font-medium text-foreground">{order.customer_name}</p>
                    <a
                      href={`tel:${order.phone_number}`}
                      className={`text-sm ${linkAccentClass}`}
                    >
                      {order.phone_number}
                    </a>
                  </div>
                  <OrderStatusBadge status={order.status} />
                </div>

                {order.note && (
                  <div className="mt-3 rounded-lg border border-border bg-muted/80 px-3 py-2">
                    <p className="text-xs font-medium text-placeholder">Ghi chú</p>
                    <p className="mt-0.5 text-sm text-foreground-muted">{order.note}</p>
                  </div>
                )}

                <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3">
                  {(order.page_count != null || order.file_url) && (
                    <>
                      {order.page_count != null && (
                        <span className="text-xs text-placeholder">
                          Số trang:{" "}
                          <strong className="text-foreground-muted">
                            {order.page_count}
                          </strong>
                        </span>
                      )}
                      {order.copies != null && (
                        <span className="text-xs text-placeholder">
                          Số bản:{" "}
                          <strong className="text-foreground-muted">
                            {order.copies}
                          </strong>
                        </span>
                      )}
                      <span className="text-xs text-placeholder">
                        In:{" "}
                        <strong className="text-foreground-muted">
                          <OrderPrintSpec order={order} />
                        </strong>
                      </span>
                      <span className="text-xs text-placeholder">
                        Nhận:{" "}
                        <strong className="text-foreground-muted">
                          {order.delivery_method === "delivery" ? "Giao tận nhà" : "Đến lấy"}
                        </strong>
                      </span>
                      {order.file_url && (
                        <OrderFileLinks
                          fileUrl={order.file_url}
                          fileName={order.file_name}
                          variant="verbose"
                          linkClassName={`text-sm ${linkAccentClass}`}
                          wrapperClassName="flex gap-2"
                        />
                      )}
                    </>
                  )}
                  <OrderPrioritySelect
                    order={order}
                    updatingId={updatingId}
                    onPriorityChange={updateOrderPriority}
                    variant="card"
                  />
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <OrderRowActions
                    order={order}
                    updatingId={updatingId}
                    onUpdateStatus={updateOrderStatus}
                    size="card"
                  />
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </main>
  );
}
