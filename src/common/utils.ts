import { startOfISOWeek, endOfISOWeek } from 'date-fns';
import { zonedTimeToUtc } from 'date-fns-tz';

interface GetTimezonedIsoWeekProps {
  date: Date;
  timezone: string;
}
export const getTimezonedStartOfISOWeek = ({
  date,
  timezone,
}: GetTimezonedIsoWeekProps): Date => {
  return zonedTimeToUtc(startOfISOWeek(date), timezone);
};

export const getTimezonedEndOfISOWeek = ({
  date,
  timezone,
}: GetTimezonedIsoWeekProps): Date => {
  return zonedTimeToUtc(endOfISOWeek(date), timezone);
};
