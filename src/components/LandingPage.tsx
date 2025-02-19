import { useState, useEffect } from "react";
import useCalendarStore from "../store/useCalendarStore";
import CustomCalendar from "./CustomCalender";

const LandingPage = () => {
  const {
    festivals,
    setFestivals,
    searchQuery,
    setSearchQuery,
    notes,
    setNote,
  } = useCalendarStore();
  console.log("festivals", festivals);
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

        const filteredFestivals = ["Ashwin", "Kartik"].flatMap((month) =>
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
    const eventNameNp = festival.event.toLowerCase();
    // const eventNameEn = festival.en.toLowerCase();
    const dateString = `${festival.month.toLowerCase()} ${festival.day}`;

    return eventNameNp.includes(query) || dateString.includes(query);
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
          <CustomCalendar
            key={month}
            month={month}
            getDaysInMonth={getDaysInMonth}
            handleDateClick={handleDateClick}
          />
        ))
      ) : (
        <ul className="space-y-2">
          {filteredFestivals.length > 0 ? (
            filteredFestivals
              .filter((festival) => festival.event)
              .map((festival, index) => (
                <li
                  key={`${festival.month}-${festival.day}-${index}`}
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
                      {festival.month}{" "}
                      <p className="capitalize">{festival.day}</p>
                    </span>
                  </div>
                  {festival.tithi && (
                    <p className="text-xs mt-1 text-gray-500">
                      {festival.tithi}
                    </p>
                  )}
                </li>
              ))
          ) : (
            <p className="text-center text-gray-500">No festivals found.</p>
          )}
        </ul>
      )}
      {selectedDate && (
        <div className="fixed inset-0 flex items-center justify-center bg-[rgba(0,0,0,0.4)] p-4">
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

export default LandingPage;
