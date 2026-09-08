// Opening-hours helpers. Google's Places API (New) returns `periods` as a
// list of { open: {day, hour, minute}, close: {day, hour, minute} } where
// day is 0 (Sunday) through 6 (Saturday). We use this to make a best-effort
// guess at whether a place is likely open during a plan's typical time slot.
//
// This is inherently approximate — it doesn't account for holidays or
// special hours, and plans don't currently ask for an exact time, just
// "day" or "evening" — so isOpenAt only ever returns `false` when the data
// clearly says closed. Missing or ambiguous data returns `null`, and the
// plan generator treats `null` as "don't exclude it," so a place without
// hours info (e.g. added manually) never gets penalized.

// Representative time-of-day (in minutes since midnight) used to check
// each category slot.
const SLOT_CHECK_TIME = {
  breakfast: 9 * 60,
  'activity-day': 14 * 60,
  drinks: 18 * 60,
  dinner: 20 * 60,
  'activity-night': 22 * 60
};

function toMinutes(day, hour, minute) {
  return day * 24 * 60 + (hour ?? 0) * 60 + (minute ?? 0);
}

export function hasHoursData(place) {
  return Array.isArray(place.openingHours?.periods) && place.openingHours.periods.length > 0;
}

/**
 * Returns true/false if we can tell whether `place` is likely open at the
 * representative time for `category`, or null if we don't have enough
 * data to say either way.
 */
export function isOpenAt(place, category, referenceDate = new Date()) {
  if (!hasHoursData(place)) return null;

  const checkTime = SLOT_CHECK_TIME[category];
  if (checkTime == null) return null;

  const day = referenceDate.getDay();
  const target = day * 24 * 60 + checkTime;

  for (const period of place.openingHours.periods) {
    if (!period.open) continue;
    const openMins = toMinutes(period.open.day, period.open.hour, period.open.minute);

    // No close time means it never closes — always open.
    if (!period.close) return true;

    let closeMins = toMinutes(period.close.day, period.close.hour, period.close.minute);
    // Handle overnight ranges (e.g. Fri 18:00 -> Sat 02:00) by extending
    // the window forward so the comparison below works normally.
    if (closeMins <= openMins) closeMins += 7 * 24 * 60;

    // Check the target time and the same time shifted a week either way,
    // so ranges that wrap around the week boundary are still caught.
    for (const t of [target, target + 7 * 24 * 60, target - 7 * 24 * 60]) {
      if (t >= openMins && t <= closeMins) return true;
    }
  }
  return false;
}

// General "open right now" check (not tied to a plan category), used for
// a small status hint on saved-place cards.
export function isOpenNow(place, now = new Date()) {
  if (!hasHoursData(place)) return null;
  const day = now.getDay();
  const target = day * 24 * 60 + now.getHours() * 60 + now.getMinutes();

  for (const period of place.openingHours.periods) {
    if (!period.open) continue;
    const openMins = toMinutes(period.open.day, period.open.hour, period.open.minute);
    if (!period.close) return true;
    let closeMins = toMinutes(period.close.day, period.close.hour, period.close.minute);
    if (closeMins <= openMins) closeMins += 7 * 24 * 60;
    for (const t of [target, target + 7 * 24 * 60, target - 7 * 24 * 60]) {
      if (t >= openMins && t <= closeMins) return true;
    }
  }
  return false;
}

// Short human-readable hint for a card, e.g. "closed at this time" — only
// returned when we're confident, never guessed from partial data.
export function hoursHint(place, category) {
  const open = isOpenAt(place, category);
  if (open === false) return 'likely closed at this time';
  return null;
}
