import type { OrderTimestamps } from '../types';

interface TimelineStep {
  label: string;
  key: keyof OrderTimestamps;
}

const steps: TimelineStep[] = [
  { label: 'Created', key: 'createdAt' },
  { label: 'Approved', key: 'approvedAt' },
  { label: 'Accepted', key: 'acceptedAt' },
  { label: 'Preparing', key: 'readyForPickupAt' },
  { label: 'Picked Up', key: 'pickedUpAt' },
  { label: 'Delivered', key: 'deliveredAt' },
];

function formatDate(iso?: string) {
  if (!iso) return null;
  return new Date(iso).toLocaleString();
}

export default function OrderTimeline({ timestamps }: { timestamps: OrderTimestamps }) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Timeline</h3>
      <ol className="relative border-l-2 border-gray-200 ml-3">
        {steps.map((step) => {
          const time = timestamps[step.key];
          const done = !!time;
          return (
            <li key={step.key} className="mb-6 ml-6">
              <span
                className={`absolute -left-2.5 flex h-5 w-5 items-center justify-center rounded-full ring-4 ring-white ${
                  done ? 'bg-[#ff6b35]' : 'bg-gray-300'
                }`}
              >
                {done && (
                  <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </span>
              <h4 className={`text-sm font-medium ${done ? 'text-gray-900' : 'text-gray-400'}`}>
                {step.label}
              </h4>
              {done && (
                <p className="text-xs text-gray-500">{formatDate(time)}</p>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
