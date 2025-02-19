import React from "react";
import useCalendarStore from "../store/useCalendarStore";

interface Day {
  np: string;
  en: string;
  event: string;
  tithi: string;
  specialday?: string;
  holiday?: boolean;
}

interface MonthCalendarProps {
  month: string;
  getDaysInMonth: (month: string) => Day[];
  handleDateClick: (date: string) => void;
}

const CustomCalendar: React.FC<MonthCalendarProps> = ({
  month,
  getDaysInMonth,
  handleDateClick,
}) => {
  const { notes } = useCalendarStore();

  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold mb-2">{month}</h2>
      <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 text-center text-sm">
        {getDaysInMonth(month).map((day, index) => {
          const dateKey = `${month}-${day?.np}`;
          const hasNote = notes[dateKey];
          return (
            <div
              key={index}
              className={`p-2 sm:p-3 text-xs sm:text-sm border rounded-lg cursor-pointer relative group ${
                day?.holiday
                  ? "bg-red-100 text-red-600"
                  : day.specialday
                  ? "bg-yellow-100"
                  : "bg-white"
              }`}
              onClick={() => handleDateClick(dateKey)}
              title="Click to add note"
            >
              <p className="font-semibold">{day?.np}</p>
              <p className="text-sm">{day?.event}</p>
              <p className="text-xs">{day?.tithi}</p>
              <p className="flex justify-end">{day?.en}</p>
              {hasNote && (
                <span className="absolute top-1 right-1 text-blue-500 text-lg">
                  📝
                </span>
              )}

              {/* <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-6 right-0 bg-gray-800 text-white text-xs rounded px-2 py-1 shadow-lg z-10">
                Double click to open note
              </div> */}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CustomCalendar;
