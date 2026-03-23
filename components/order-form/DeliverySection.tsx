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
import {
  formFieldHintClass,
  formFieldHintTextClass,
  formReadOnlyBoxClass,
  formRequiredMarkClass,
  inputClass,
  labelClass,
  sectionLabelClass,
  selectClass,
} from "./formStyles";

type Props = {
  deliveryMethod: DeliveryMethod;
  deliveryDistrict: string;
  deliveryDetail: string;
  onDeliveryMethodChange: (m: DeliveryMethod) => void;
  onDeliveryDistrictChange: (v: string) => void;
  onDeliveryDetailChange: (v: string) => void;
  disabled: boolean;
  /** Mặc định từ [lib/config/orderForm.ts] + [delivery.ts] */
  deliveryCity?: string;
  wards?: readonly string[];
  shippingFeeDelivery?: number;
  freeshipHint?: string;
};

export function DeliverySection({
  deliveryMethod,
  deliveryDistrict,
  deliveryDetail,
  onDeliveryMethodChange,
  onDeliveryDistrictChange,
  onDeliveryDetailChange,
  disabled,
  deliveryCity = DELIVERY_CITY,
  wards = DELIVERY_WARDS,
  shippingFeeDelivery = SHIPPING_FEE_DELIVERY,
  freeshipHint,
}: Props) {
  const hint =
    freeshipHint ?? getFreeshipHintText();
  const shippingFee = getShippingFee(deliveryMethod, {
    shippingFeeDelivery,
  });
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
        labelClassName={sectionLabelClass}
      />
      {deliveryMethod === "delivery" && (
        <div className="mt-3">
          <div className="grid gap-2 sm:grid-cols-2">
            <div>
              <p className={labelClass}>Tỉnh/Thành phố</p>
              <p className={formReadOnlyBoxClass}>{deliveryCity}</p>
            </div>
            <div>
              <label
                htmlFor="delivery-district"
                className={labelClass}
              >
                Xã/Phường <span className={formRequiredMarkClass}>*</span>
              </label>
              <select
                id="delivery-district"
                value={deliveryDistrict}
                onChange={(e) => onDeliveryDistrictChange(e.target.value)}
                className={selectClass}
                disabled={disabled}
              >
                {wards.map((ward) => (
                  <option key={ward} value={ward}>
                    {ward}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-2">
            <label htmlFor="delivery-detail" className={labelClass}>
              Địa chỉ chi tiết <span className={formRequiredMarkClass}>*</span>
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
          <p className={formFieldHintClass}>
            Phí vận chuyển:{" "}
            {shippingFeeDelivery.toLocaleString("vi-VN")} VNĐ · {hint}
          </p>
        </div>
      )}
      {deliveryMethod === "pickup" && (
        <p className={`mt-2 ${formFieldHintTextClass}`}>
          Phí vận chuyển: {shippingFee.toLocaleString("vi-VN")} VNĐ
        </p>
      )}
    </div>
  );
}
