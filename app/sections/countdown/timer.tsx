import type {
  HydrogenComponentProps,
  HydrogenComponentSchema,
} from '@weaverse/hydrogen';
import type {CSSProperties} from 'react';
import {useState, useEffect, forwardRef} from 'react';

interface CountDownTimerProps extends HydrogenComponentProps {
  textColor: string;
  startDate: number;
}

let CountdownTimer = forwardRef<HTMLDivElement, CountDownTimerProps>(
  (props, ref) => {
    let {textColor, startDate, ...rest} = props;
    const [timeRemaining, setTimeRemaining] = useState(
      calculateTimeRemaining(startDate),
    );
    useEffect(() => {
      const intervalId = setInterval(() => {
        const updatedTimeRemaining = calculateTimeRemaining(startDate);
        setTimeRemaining(updatedTimeRemaining);
        if (
          updatedTimeRemaining.days <= 0 &&
          updatedTimeRemaining.hours <= 0 &&
          updatedTimeRemaining.minutes <= 0 &&
          updatedTimeRemaining.seconds <= 0
        ) {
          clearInterval(intervalId);
        }
      }, 1000);
      return () => clearInterval(intervalId);
    }, [startDate]);

    function calculateTimeRemaining(startTime: number) {
      let now = new Date().getTime();
      let difference = startTime - now;
      if (difference <= 0) {
        return {
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
        };
      }

      let days = Math.floor(difference / (1000 * 60 * 60 * 24));
      let hours = Math.floor(
        (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
      );
      let minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      let seconds = Math.floor((difference % (1000 * 60)) / 1000);
      return {
        days,
        hours,
        minutes,
        seconds,
      };
    }

    let timerStyle: CSSProperties = {
      '--timer-text-color': textColor,
    } as CSSProperties;

    return (
      <div
        ref={ref}
        {...rest}
        className="flex justify-center gap-5 text-[var(--timer-text-color)] sm-max:gap-2"
        style={timerStyle}
      >
        <div className="">
          <p className="text-5xl font-medium leading-tight sm-max:text-4xl">
            {timeRemaining?.days || 0}
          </p>
          <p className="text-base font-normal sm-max:text-sm">DAYS</p>
        </div>
        <div className="bg-black w-px h-7 mt-4 sm-max:mt-2" />
        <div className="">
          <p className="text-5xl font-medium leading-tight sm-max:text-4xl">
            {timeRemaining?.hours || 0}
          </p>
          <p className="text-base font-normal sm-max:text-sm">HOURS</p>
        </div>
        <div className="bg-black w-px h-7 mt-4 sm-max:mt-2" />
        <div className="">
          <p className="text-5xl font-medium leading-tight sm-max:text-4xl">
            {timeRemaining?.minutes || 0}
          </p>
          <p className="text-base font-normal sm-max:text-sm">MINUTES</p>
        </div>
        <div className="bg-black w-px h-7 mt-4 sm-max:mt-2" />
        <div className="">
          <p className="text-5xl font-medium leading-tight sm-max:text-4xl">
            {timeRemaining?.seconds || 0}
          </p>
          <p className="text-base font-normal sm-max:text-sm">SECONDS</p>
        </div>
      </div>
    );
  },
);

export default CountdownTimer;

export let schema: HydrogenComponentSchema = {
  type: 'countdown--timer',
  title: 'Timer',
  toolbar: ['general-settings', ['duplicate', 'delete']],
  inspector: [
    {
      group: 'Timer',
      inputs: [
        {
          type: 'color',
          name: 'textColor',
          label: 'Color',
          defaultValue: '#000000',
        },
        {
          type: 'datepicker',
          label: 'Start date',
          name: 'startDate',
          defaultValue: '2024-01-01',
        },
      ],
    },
  ],
};
