import { useState, useEffect } from "react";
import { create } from "zustand";

interface Festival {
  np: string;
  en: string;
  tithi: string;
  event: string;
  day: number;
  specialday: string;
  holiday: boolean;
  month: string;
}

interface Store {
  festivals: Festival[];
  setFestivals: (festivals: Festival[]) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  notes: Record<string, string>;
  setNote: (date: string, note: string) => void;
}

const useStore = create<Store>((set) => ({
  festivals: [],
  setFestivals: (festivals) => set({ festivals }),
  searchQuery: "",
  setSearchQuery: (query) => set({ searchQuery: query }),
  notes: JSON.parse(localStorage.getItem("notes") || "{}"),
  setNote: (date, note) =>
    set((state) => {
      const updatedNotes = { ...state.notes, [date]: note };
      localStorage.setItem("notes", JSON.stringify(updatedNotes));
      return { notes: updatedNotes };
    }),
}));

const FestivalCalendar = () => {
  const {
    festivals,
    setFestivals,
    searchQuery,
    setSearchQuery,
    notes,
    setNote,
  } = useStore();
  const [view, setView] = useState<"calendar" | "list">("calendar");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [noteInput, setNoteInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentYear] = useState(2073);

  useEffect(() => {
    const fetchFestivals = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `https://bibhuticoder.github.io/nepali-calendar-api/api/${currentYear}.json`
        );
        const data = await response.json();

        const filteredFestivals: Festival[] = ["Ashwin", "Kartik"].flatMap(
          (month) =>
            (data[month] || []).map((day: any) => ({
              ...day,
              month,
            }))
        );

        setFestivals(filteredFestivals);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFestivals();
  }, [setFestivals, currentYear]);

  const saveNote = () => {
    if (selectedDate) {
      setNote(selectedDate, noteInput);
      setSelectedDate(null);
      setNoteInput("");
    }
  };
  const getDaysInMonth = (month: string) => {
    return festivals.filter((f) => f.month === month);
  };

  const handleDateClick = (date: string) => {
    setSelectedDate(date);
    setNoteInput(notes[date] || "");
  };
  const filteredFestivals = festivals.filter((festival) => {
    const query = searchQuery.toLowerCase();
    const eventName = festival.event.toLowerCase();
    const dateString = `${festival.month.toLowerCase()} ${festival.day}`;
    return eventName.includes(query) || dateString.includes(query);
  });
  return (
    <div className="p-4 max-w-4xl mx-auto w-full">
      <h1 className="text-2xl font-bold text-center mb-4">
        Nepali Festival Calendar
      </h1>

      <div className="flex flex-col sm:flex-row gap-2 mb-4 justify-between ">
        <div className="flex items-center border rounded overflow-hidden">
          <input
            type="text"
            placeholder="Search festivals..."
            className="w-full p-2 flex-grow outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                setView("list");
              }
            }}
          />
          <button
            className="px-3 text-gray-500"
            onClick={() => {
              setView("list");
            }}
          >
            🔍
          </button>
        </div>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded whitespace-nowrap"
          onClick={() => setView(view === "calendar" ? "list" : "calendar")}
        >
          Toggle {view === "calendar" ? "List" : "Calendar"} View
        </button>
      </div>
      {loading ? (
        <p className="text-center">Loading festival data...</p>
      ) : view === "calendar" ? (
        ["Ashwin", "Kartik"].map((month) => (
          <div key={month} className="mb-6">
            <h2 className="text-xl font-semibold mb-2">{month}</h2>

            <div className="grid grid-cols-7 gap-2 text-center text-sm">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="font-bold hidden md:block">
                  {day}
                </div>
              ))}

              {getDaysInMonth(month).map((day, index) => (
                <div
                  key={index}
                  className={`p-2 border rounded-lg cursor-pointer text-xs sm:text-sm ${
                    day?.holiday
                      ? "bg-red-100 text-red-600"
                      : day.specialday
                      ? "bg-yellow-100"
                      : "bg-white"
                  }`}
                  onClick={() => handleDateClick(`${month}-${day?.np}`)}
                >
                  <p className="font-semibold">{day?.np}</p>
                  <p className="text-xs break-all">{day?.event}</p>
                  <p className="flex justify-end">{day?.en}</p>
                </div>
              ))}
            </div>
          </div>
        ))
      ) : (
        <ul className="space-y-2">
          {filteredFestivals.length > 0 ? (
            filteredFestivals.map((festival) => (
              <li
                key={`${festival.month}-${festival.day}`}
                className={`p-3 rounded-lg border ${
                  festival.holiday ? "bg-red-50 border-red-200" : "bg-white"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p
                      className={`font-semibold ${
                        festival.holiday ? "text-red-600" : ""
                      }`}
                    >
                      {festival.event}
                    </p>
                    <p className="text-sm text-gray-600">
                      {festival.np} ({festival.en})
                    </p>
                  </div>
                  <span className="text-sm text-gray-500 whitespace-nowrap">
                    {festival.month} {festival.day}
                  </span>
                </div>
                {festival.tithi && (
                  <p className="text-xs mt-1 text-gray-500">{festival.tithi}</p>
                )}
              </li>
            ))
          ) : (
            <p className="text-center text-gray-500">No festivals found.</p>
          )}
        </ul>
      )}
      {selectedDate && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white p-4 rounded shadow-lg w-full max-w-md">
            <h2 className="text-lg font-bold mb-2">
              Add Note for {selectedDate}
            </h2>
            <textarea
              className="w-full p-2 border rounded mb-2"
              rows={4}
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                onClick={() => setSelectedDate(null)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600"
                onClick={saveNote}
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FestivalCalendar;
