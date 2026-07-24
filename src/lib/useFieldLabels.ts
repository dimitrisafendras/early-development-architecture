/**
 * Localized props for the shared form controls.
 *
 * The pickers and the stepper live in `components/ui` and stay i18n-agnostic,
 * so every call site feeds them the active language's labels from here rather
 * than repeating the same keys.
 */
import { useT } from '../i18n'
import { useDateLocale } from './dates'

export function useFieldLabels() {
  const t = useT()
  const locale = useDateLocale()
  const f = t.fields

  const calendar = {
    previousMonth: f.previousMonth,
    nextMonth: f.nextMonth,
    today: f.today,
    yesterday: f.yesterday,
  }
  const time = { hours: f.hours, minutes: f.minutes, now: f.now, pickTime: f.pickTime }

  return {
    /** Spread onto `<DatePicker />`. */
    datePicker: {
      locale,
      placeholder: f.pickDate,
      labels: calendar,
    },
    /** Spread onto `<TimePicker />`. */
    timePicker: {
      locale,
      placeholder: f.pickTime,
      labels: time,
    },
    /** Spread onto `<DateTimePicker />`. */
    dateTimePicker: {
      locale,
      placeholder: f.pickDateTime,
      labels: {
        ...calendar,
        ...time,
        minutesAgo: f.minutesAgo,
        hourAgo: f.hourAgo,
        pickDateTime: f.pickDateTime,
      },
    },
    /** Spread onto `<NumberInput />`. */
    stepper: {
      decrementLabel: f.decrease,
      incrementLabel: f.increase,
    },
  }
}
