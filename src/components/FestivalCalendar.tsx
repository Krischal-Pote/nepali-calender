import { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { create } from "zustand";
import NepaliDate from "nepali-date-converter";

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
  console.log("festivals", festivals);

  const [view, setView] = useState("calendar");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [noteInput, setNoteInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentYear, setCurrentYear] = useState(2082);
  const [currentMonth, setCurrentMonth] = useState(6);

  useEffect(() => {
    const fetchFestivals = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          "https://bibhuticoder.github.io/nepali-calendar-api/api/2073.json"
        );
        const data = await response.json();

        const months = ["Ashwin", "Kartik"];
        const filteredFestivals: Festival[] = months.flatMap((month) =>
          (data[month] || []).map((day: any) => ({
            np: day.np,
            en: day.en,
            tithi: day.tithi,
            event: day.event,
            day: day.day,
            specialday: day.specialday,
            holiday: day.holiday,
            month,
          }))
        );

        console.log("Fetched Festivals:", filteredFestivals);
        setFestivals(filteredFestivals);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFestivals();
  }, [setFestivals]);

  const handleDayClick = (date: Date) => {
    const dateKey = date.toISOString().split("T")[0];
    setSelectedDate(dateKey);
    setNoteInput(notes[dateKey] || "");
  };

  const saveNote = () => {
    if (selectedDate) {
      setNote(selectedDate, noteInput);
      setSelectedDate(null);
      setNoteInput("");
    }
  };
  const nepaliMonths = [
    "Baishakh",
    "Jestha",
    "Ashadh",
    "Shrawan",
    "Bhadra",
    "Ashwin",
    "Kartik",
    "Mangsir",
    "Poush",
    "Magh",
    "Falgun",
    "Chaitra",
  ];
  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-center mb-4">
        Nepali Festival Calendar
      </h1>
      <input
        type="text"
        placeholder="Search festivals..."
        className="w-full p-2 border rounded mb-4"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
        onClick={() => setView(view === "calendar" ? "list" : "calendar")}
      >
        Toggle {view === "calendar" ? "List" : "Calendar"} View
      </button>

      {loading ? (
        <p>Loading festival data...</p>
      ) : view === "calendar" ? (
        <Calendar
          onClickDay={handleDayClick}
          activeStartDate={new NepaliDate(
            currentYear,
            currentMonth,
            1
          ).toJsDate()} // Start from Ashwin
          onActiveStartDateChange={({ activeStartDate }) => {
            const nepaliDate = new NepaliDate(activeStartDate);
            setCurrentYear(nepaliDate.getYear());
            setCurrentMonth(nepaliDate.getMonth());
          }}
          tileContent={({ date }) => {
            // Convert A.D. to B.S.
            const nepaliDate = new NepaliDate(date);
            const nepaliDay = nepaliDate.getDate();
            const nepaliMonth = nepaliMonths[nepaliDate.getMonth()];

            // Show only festivals in Ashwin and Kartik
            const festival = festivals.find(
              (f) =>
                f.day === nepaliDay &&
                (f.month === "Ashwin" || f.month === "Kartik")
            );

            return festival ? (
              <p
                className={
                  festival.holiday ? "text-red-500 font-bold" : "text-gray-800"
                }
              >
                {festival.event}
              </p>
            ) : null;
          }}
        />
      ) : (
        <ul>
          {festivals.length === 0 ? (
            <p>No festivals found.</p>
          ) : (
            festivals
              .filter((festival) =>
                festival.en.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((festival) => (
                <li
                  key={`${festival.month}-${festival.day}`}
                  className={`border-b p-2 ${
                    festival.holiday ? "text-red-500 font-bold" : ""
                  }`}
                >
                  <strong>
                    {festival.np} ({festival.en})
                  </strong>{" "}
                  - {festival.event}
                  <p className="text-sm">
                    {festival.tithi} | {festival.specialday}
                  </p>
                </li>
              ))
          )}
        </ul>
      )}

      {selectedDate && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-4 rounded shadow-lg w-96">
            <h2 className="text-lg font-bold">Add Note for {selectedDate}</h2>
            <textarea
              className="w-full p-2 border rounded mt-2"
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
            />
            <div className="flex justify-end mt-2">
              <button
                className="bg-gray-300 px-4 py-2 rounded mr-2"
                onClick={() => setSelectedDate(null)}
              >
                Cancel
              </button>
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded"
                onClick={saveNote}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FestivalCalendar;
