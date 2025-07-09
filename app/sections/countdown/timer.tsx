import { createSchema, type HydrogenComponentProps } from "@weaverse/hydrogen";
import type { CSSProperties } from "react";
import { forwardRef, useEffect, useState } from "react";

const ONE_SEC = 1000;
const ONE_MIN = ONE_SEC * 60;
const ONE_HOUR = ONE_MIN * 60;
const ONE_DAY = ONE_HOUR * 24;

function calculateRemainingTime(endTime: number) {
  const now = Date.now();
  const diff = endTime - now;
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }
  return {
    days: Math.floor(diff / ONE_DAY),
    hours: Math.floor((diff % ONE_DAY) / ONE_HOUR),
    minutes: Math.floor((diff % ONE_HOUR) / ONE_MIN),
    seconds: Math.floor((diff % ONE_MIN) / ONE_SEC),
  };
}

type CountDownTimerData = {
  textColor: string;
  endTime: number;
};

const CountdownTimer = forwardRef<
  HTMLDivElement,
  CountDownTimerData & HydrogenComponentProps
>((props, ref) => {
  const { textColor, endTime, ...rest } = props;
  const [remainingTime, setRemainingTime] = useState(
    calculateRemainingTime(endTime),
  );

  useEffect(() => {
    const intervalId = setInterval(() => {
      const updatedTimeRemaining = calculateRemainingTime(endTime);
      setRemainingTime(updatedTimeRemaining);
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
  }, [endTime]);

  const timerStyle: CSSProperties = {
    "--timer-color": textColor,
  } as CSSProperties;

  return (
    <div
      ref={ref}
      {...rest}
      className="countdown--timer flex py-3 text-(--timer-color) sm:py-0"
      data-motion="fade-up"
      style={timerStyle}
    >
      <div className="space-y-1">
        <div className="flex items-center font-medium text-4xl leading-tight md:text-5xl">
          <div className="px-6">{remainingTime?.days || 0}</div>
          <div className="h-6 border-(--timer-color) border-r" />
        </div>
        <div className="text-center text-sm capitalize md:text-base">Days</div>
      </div>
      <div className="space-y-1">
        <div className="flex items-center font-medium text-4xl leading-tight md:text-5xl">
          <div className="px-6">{remainingTime?.hours || 0}</div>
          <div className="h-6 border-(--timer-color) border-r" />
        </div>
        <div className="text-center text-sm capitalize md:text-base">hours</div>
      </div>
      <div className="space-y-1">
        <div className="flex items-center font-medium text-4xl leading-tight md:text-5xl">
          <div className="px-6">{remainingTime?.minutes || 0}</div>
          <div className="h-6 border-(--timer-color) border-r" />
        </div>
        <div className="text-center text-sm capitalize md:text-base">
          minutes
        </div>
      </div>
      <div className="space-y-1">
        <div className="flex items-center font-medium text-4xl leading-tight md:text-5xl">
          <div className="px-6">{remainingTime?.seconds || 0}</div>
        </div>
        <div className="text-center text-sm capitalize md:text-base">
          seconds
        </div>
      </div>
    </div>
  );
});

export default CountdownTimer;

const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);

export const schema = createSchema({
  type: "countdown--timer",
  title: "Timer",
  settings: [
    {
      group: "Timer",
      inputs: [
        {
          type: "datepicker",
          label: "End time",
          name: "endTime",
          defaultValue: tomorrow.getTime(),
        },
        {
          type: "color",
          name: "textColor",
          label: "Text color",
        },
      ],
    },
  ],
});
