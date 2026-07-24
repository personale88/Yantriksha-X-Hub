'use client';

import { useState, useEffect } from 'react';

interface EventItem {
  id: number;
  title: string;
  description: string;
  category: string;
  event_date: string;
  status: string;
}

export default function Events() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/events')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setEvents(data.events || []);
        }
      })
      .catch((err) => console.error('Failed to load events:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section id="events" className="bg-slate-950 py-20 text-white relative overflow-hidden">
      {/* Decorative gradients */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest mb-6">
            ✦ Calendar
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
            Upcoming{" "}
            <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              Innovation Events
            </span>
          </h2>
          <p className="text-gray-400 mt-4 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
            Stay updated with the latest ideathons, hackathons, bootcamps, and Quality Review schedules.
          </p>
        </div>

        {/* Loading / Content Stack */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500" />
          </div>
        ) : events.length === 0 ? (
          /* Empty State - Completely empty/no fake data as requested */
          <div className="max-w-xl mx-auto glass-card rounded-3xl p-8 md:p-10 border border-slate-900 text-center space-y-4 shadow-[0_0_50px_rgba(37,99,235,0.02)]">
            <span className="text-5xl block animate-pulse">📅</span>
            <h3 className="text-lg font-bold text-white">No Scheduled Events</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              All training programs, bootcamps, and quality reviews have concluded for this cohort. Upcoming workshops, hackathons, and demo days will be posted here as they are scheduled.
            </p>
          </div>
        ) : (
          /* Events Grid layout */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event) => (
              <div
                key={event.id}
                className="glass-card rounded-3xl p-6 border border-slate-900 hover:border-slate-800/80 transition-all duration-300 flex flex-col justify-between group shadow-lg shadow-black/40 hover:-translate-y-1"
              >
                <div>
                  {/* Category & Date badge */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest bg-blue-950/40 border border-blue-900/30 px-2.5 py-1 rounded-lg">
                      {event.category}
                    </span>
                    <span className="text-[11px] text-gray-500 font-medium">
                      {new Date(event.event_date).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors leading-snug">
                    {event.title}
                  </h3>

                  <p className="text-gray-400 text-xs mt-3 leading-relaxed">
                    {event.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-900/60 flex items-center justify-between text-[11px] font-bold">
                  <span className="text-gray-500 uppercase tracking-wider">Status</span>
                  <span className="text-amber-400 uppercase tracking-wider animate-pulse">
                    Upcoming
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
