// Invitations use the venue's Istanbul timezone, independent of the guest's device.
export function weddingDate(date, time) {
  let day = /^\d{4}-\d{2}-\d{2}$/.test(date || '') ? date : '2027-06-29';
  const checked = new Date(`${day}T12:00:00Z`);
  if (!Number.isFinite(checked.valueOf()) || checked.toISOString().slice(0, 10) !== day) day = '2027-06-29';
  const clock = /^([01]\d|2[0-3]):[0-5]\d$/.test(time || '') ? time : '18:00';
  return {date: day, time: clock, instant: new Date(`${day}T${clock}:00+03:00`)};
}
