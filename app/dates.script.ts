import { DateTime } from 'luxon';

function testDates() {
  // const sessionDate = new Date('2024-11-14T23:30:47.175Z');
  // const reminderDate = new Date('2024-11-14T23:20:47.175Z');
  // console.log({ sessionDate, reminderDate });

  const timezone = 'America/New_York';
  // //   convert this date to Europe/Berlin timezone
  // const berlinDate = DateTime.fromJSDate(sessionDate, {
  //   zone: timezone,
  // });

  // const sessionDateUTC = DateTime.fromJSDate(sessionDate, {
  //   zone: timezone,
  // }).toFormat('cccc, LLL dd yyyy');
  // const sessionTime = DateTime.fromJSDate(sessionDate, {
  //   zone: timezone,
  // }).toFormat('HH:mm'); // Only hours and minutes

  // const reminderDateUTC = DateTime.fromJSDate(reminderDate, {
  //   zone: timezone,
  // });
  // const sessionStart = DateTime.fromJSDate(sessionDate, {
  //   zone: timezone,
  // });

  // const minutesUntilSession = Math.floor(
  //   sessionStart.diff(reminderDateUTC, 'minutes').minutes,
  // );

  const dateUTC = new Date('2024-11-16T04:59:59.999Z');
  console.log('Original UTC Date:', dateUTC);

  // Convert to America/New_York timezone
  const newYorkDateTime = DateTime.fromJSDate(dateUTC, {
    zone: 'America/New_York',
  });
  console.log('New York DateTime:', newYorkDateTime.toString());

  // Convert to Europe/Berlin timezone
  const berlinDateTime = newYorkDateTime.setZone('Europe/Berlin');
  console.log('Berlin DateTime:', berlinDateTime.toString());

  // Convert back to JS Date
  const backToJSDate = berlinDateTime.toJSDate();
  console.log('Back to JS Date (UTC):', backToJSDate);
}

const toTimezone = DateTime.fromJSDate(new Date('2024-11-19T10:09:00.000Z'))
  .setZone('America/New_York')
  .toString();
console.log(toTimezone);
console.log(new Date(toTimezone).toISOString());
const sessionDate = new Date('2024-11-19T11:00:47.175Z');
const timezone = 'Africa/Lagos';
const sessionDateFormat = DateTime.fromJSDate(sessionDate, {
  zone: timezone,
}).toFormat('cccc, LLL dd yyyy');

const reminderDate = new Date('2024-11-19T11:45:47.175Z');
const sessionTime = DateTime.fromJSDate(sessionDate, {
  zone: timezone,
}).toFormat('HH:mm'); // Only hours and minutes

console.log({ sessionDate, sessionDateFormat, reminderDate, sessionTime });
