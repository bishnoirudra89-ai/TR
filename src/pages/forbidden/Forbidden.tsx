import React, { useEffect, useState } from 'react';

function secondsToClock(sec: number) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

export default function Forbidden() {
  const [now, setNow] = useState<Date>(new Date());
  const [allowed, setAllowed] = useState(false);
  const [secondsToOpen, setSecondsToOpen] = useState<number | null>(null);

  useEffect(() => {
    function compute() {
      const d = new Date();
      setNow(d);
      const hour = d.getHours();
      const min = d.getMinutes();
      const sec = d.getSeconds();

      // allowed if between 20:00 and 21:00 local
      if (hour === 20) {
        setAllowed(true);
        setSecondsToOpen(null);
      } else {
        setAllowed(false);
        let target = new Date(d);
        // if before 20:00 today
        if (hour < 20) {
          target.setHours(20, 0, 0, 0);
        } else {
          // after 21:00 -> next day 20:00
          target.setDate(d.getDate() + 1);
          target.setHours(20, 0, 0, 0);
        }
        setSecondsToOpen(Math.max(0, Math.floor((target.getTime() - d.getTime()) / 1000)));
      }
    }

    compute();
    const id = setInterval(compute, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md rounded bg-white p-6 text-center">
        {allowed ? (
          <>
            <h1 className="text-2xl font-bold">Welcome to the Forbidden Land</h1>
            <p className="mt-4 text-gray-700">You are visiting within the special hour. Enjoy responsibly.</p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold">Forbidden Land — Closed</h1>
            <p className="mt-4 text-gray-700">This area is only accessible between 8:00 PM and 9:00 PM.</p>
            {secondsToOpen !== null && (
              <p className="mt-4 text-lg font-mono">Opens in: {secondsToClock(secondsToOpen)}</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
