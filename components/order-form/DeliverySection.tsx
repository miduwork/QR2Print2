import {
  DELIVERY_CITY,
  DELIVERY_WARDS,
  getFreeshipHintText,
} from "@/lib/config/orderForm";
import type { DeliveryMethod } from "@/lib/orders/delivery";
import {
  DELIVERY_METHOD_LABEL,
  SHIPPING_FEE_DELIVERY,
  getShippingFee,
} from "@/lib/orders/delivery";
import { ChoiceRadioGroup } from "./ChoiceRadioGroup";
import { inputClass, labelClass, selectClass } from "./formStyles";

type Props = {
  deliveryMethod: DeliveryMethod;
  deliveryDistrict: string;
  deliveryDetail: string;
  onDeliveryMethodChange: (m: DeliveryMethod) => void;
  onDeliveryDistrictChange: (v: string) => void;
  onDeliveryDetailChange: (v: string) => void;
  disabled: boolean;
};

export function DeliverySection({
  deliveryMethod,
  deliveryDistrict,
  deliveryDetail,
  onDeliveryMethodChange,
  onDeliveryDistrictChange,
  onDeliveryDetailChange,
  disabled,
}: Props) {
  const shippingFee = getShippingFee(deliveryMethod);
  const deliveryMethods = Object.keys(
    DELIVERY_METHOD_LABEL,
  ) as DeliveryMethod[];

  return (
    <div>
      <ChoiceRadioGroup
        label="Nhận hàng"
        options={deliveryMethods}
        value={deliveryMethod}
        onChange={onDeliveryMethodChange}
        getOptionLabel={(m) => DELIVERY_METHOD_LABEL[m]}
        disabled={disabled}
        labelClassName="mb-1 block text-sm font-medium text-foreground-muted"
      />
      {deliveryMethod === "delivery" && (
        <div className="mt-3">
          <div className="grid gap-2 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Tỉnh/Thành phố</label>
              <p className="rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-800">
                {DELIVERY_CITY}
              </p>
            </div>
            <div>
              <label
                htmlFor="delivery-district"
                className={labelClass}
              >
                Xã/Phường <span className="text-red-500">*</span>
              </label>
              <select
                id="delivery-district"
                value={deliveryDistrict}
                onChange={(e) => onDeliveryDistrictChange(e.target.value)}
                className={selectClass}
                disabled={disabled}
              >
                {DELIVERY_WARDS.map((ward) => (
                  <option key={ward} value={ward}>
                    {ward}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-2">
            <label htmlFor="delivery-detail" className={labelClass}>
              Địa chỉ chi tiết <span className="text-red-500">*</span>
            </label>
            <input
              id="delivery-detail"
              type="text"
              value={deliveryDetail}
              onChange={(e) => onDeliveryDetailChange(e.target.value)}
              placeholder="Số nhà, tên đường, tên toà nhà..."
              className={inputClass}
              disabled={disabled}
            />
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Phí vận chuyển:{" "}
            {SHIPPING_FEE_DELIVERY.toLocaleString("vi-VN")} VNĐ ·{" "}
            {getFreeshipHintText()}
          </p>
        </div>
      )}
      {deliveryMethod === "pickup" && (
        <p className="mt-2 text-xs text-slate-500">
          Phí vận chuyển: {shippingFee.toLocaleString("vi-VN")} VNĐ
        </p>
      )}
    </div>
  );
}
