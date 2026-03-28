import {
  CreditCard,
  Landmark,
  Wallet,
  type LucideProps,
} from 'lucide-react';
import type { ReactNode } from 'react';

export type PaymentMethod = 'bank_transfer' | 'e_wallet' | 'cash';

export type PaymentProviderMeta = {
  label: string;
  logo?: string;
};

export const bankOptions = [
  { value: 'bca', label: 'BCA' },
  { value: 'bri', label: 'BRI' },
  { value: 'mandiri', label: 'Mandiri' },
  { value: 'bni', label: 'BNI' },
  { value: 'seabank', label: 'SeaBank' },
  { value: 'cimb_niaga', label: 'CIMB Niaga' },
  { value: 'permata', label: 'Permata' },
  { value: 'btn', label: 'BTN' },
  { value: 'danamon', label: 'Danamon' },
  { value: 'bsi', label: 'BSI' },
] as const;

export const eWalletOptions = [
  { value: 'gopay', label: 'GoPay' },
  { value: 'ovo', label: 'OVO' },
  { value: 'shopeepay', label: 'ShopeePay' },
  { value: 'dana', label: 'DANA' },
  { value: 'linkaja', label: 'LinkAja' },
] as const;

export const paymentProviderMeta: Record<string, PaymentProviderMeta> = {
  bca: { label: 'BCA', logo: '/logo/bank-central-asia-(bca)-logo.svg' },
  bri: { label: 'BRI', logo: '/logo/bank-rakyat-indonesia-(bri)-logo.png' },
  mandiri: { label: 'Mandiri', logo: '/logo/bank-mandiri-logo.svg' },
  bni: {
    label: 'BNI',
    logo: '/logo/bank-negara-indonesia-(bni)-logo.png',
  },
  seabank: { label: 'SeaBank', logo: '/logo/seabank-logo.png' },
  cimb_niaga: {
    label: 'CIMB Niaga',
    logo: '/logo/bank-cimb-niaga-logo.svg',
  },
  permata: { label: 'Permata', logo: '/logo/bank-permata-logo.png' },
  btn: { label: 'BTN', logo: '/logo/bank-btn-logo.png' },
  danamon: { label: 'Danamon', logo: '/logo/bank-danamon-logo.svg' },
  bsi: { label: 'BSI', logo: '/logo/bank-bsi-logo.png' },

  gopay: { label: 'GoPay', logo: '/logo/gopay-logo.png' },
  ovo: { label: 'OVO', logo: '/logo/ovo-logo.png' },
  shopeepay: { label: 'ShopeePay', logo: '/logo/shopeepay-logo.png' },
  dana: { label: 'DANA', logo: '/logo/dana-logo.png' },
  linkaja: { label: 'LinkAja', logo: '/logo/linkaja-logo.png' },
};

export function getPaymentProviderMeta(provider?: string | null) {
  if (!provider) return null;
  return paymentProviderMeta[provider] ?? { label: provider };
}

export function getPaymentMethodLabel(
  method?: PaymentMethod | null,
  provider?: string | null
) {
  if (!method) return 'Pembayaran belum dipilih';
  if (method === 'cash') return 'Cash';

  const providerMeta = getPaymentProviderMeta(provider);
  const providerLabel = providerMeta?.label ?? '';

  if (method === 'bank_transfer') {
    return providerLabel ? `Transfer Bank - ${providerLabel}` : 'Transfer Bank';
  }

  if (method === 'e_wallet') {
    return providerLabel ? `E-Wallet - ${providerLabel}` : 'E-Wallet';
  }

  return 'Pembayaran belum dipilih';
}

export function getPaymentShortLabel(
  method?: PaymentMethod | null,
  provider?: string | null
) {
  if (!method) return 'Belum dipilih';
  if (method === 'cash') return 'Cash';

  const providerMeta = getPaymentProviderMeta(provider);
  return providerMeta?.label ?? (method === 'bank_transfer' ? 'Transfer Bank' : 'E-Wallet');
}

export function renderPaymentMethodIcon(
  method?: PaymentMethod | null,
  className = 'h-4 w-4'
): ReactNode {
  const props: LucideProps = { className };

  if (method === 'bank_transfer') return <Landmark {...props} />;
  if (method === 'e_wallet' || method === 'cash') return <Wallet {...props} />;
  return <CreditCard {...props} />;
}