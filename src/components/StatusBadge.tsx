import type { OrderState } from '../types';

const stateStyles: Record<OrderState, string> = {
  APPROVAL_PENDING: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-blue-100 text-blue-800',
  REJECTED: 'bg-red-100 text-red-800',
  CANCELLED: 'bg-gray-100 text-gray-800',
  ACCEPTED: 'bg-indigo-100 text-indigo-800',
  PREPARING: 'bg-purple-100 text-purple-800',
  READY_FOR_PICKUP: 'bg-orange-100 text-orange-800',
  PICKED_UP: 'bg-cyan-100 text-cyan-800',
  DELIVERED: 'bg-green-100 text-green-800',
};

const stateLabels: Record<OrderState, string> = {
  APPROVAL_PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  CANCELLED: 'Cancelled',
  ACCEPTED: 'Accepted',
  PREPARING: 'Preparing',
  READY_FOR_PICKUP: 'Ready',
  PICKED_UP: 'Picked Up',
  DELIVERED: 'Delivered',
};

export default function StatusBadge({ state }: { state: OrderState }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${stateStyles[state] ?? 'bg-gray-100 text-gray-800'}`}
    >
      {stateLabels[state] ?? state}
    </span>
  );
}
