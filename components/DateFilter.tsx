'use client';

interface DateFilterProps {
  selectedDate: string | null;
  onDateChange: (date: string | null) => void;
}

export default function DateFilter({ selectedDate, onDateChange }: DateFilterProps) {
  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Filter by Date
      </label>
      <input
        type="date"
        value={selectedDate || ''}
        onChange={(e) => onDateChange(e.target.value || null)}
        className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
      />
    </div>
  );
}

