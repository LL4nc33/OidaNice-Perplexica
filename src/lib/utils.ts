import clsx, { ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const cn = (...classes: ClassValue[]) => twMerge(clsx(...classes));

export const formatTimeDifference = (
  date1: Date | string,
  date2: Date | string,
  t: (key: string) => string,
): string => {
  date1 = new Date(date1);
  date2 = new Date(date2);

  const diffInSeconds = Math.floor(
    Math.abs(date2.getTime() - date1.getTime()) / 1000,
  );

  if (diffInSeconds < 60) {
    const unit = diffInSeconds === 1 ? t('time.second') : t('time.seconds');
    return `${diffInSeconds} ${unit}`;
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    const unit = minutes === 1 ? t('time.minute') : t('time.minutes');
    return `${minutes} ${unit}`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    const unit = hours === 1 ? t('time.hour') : t('time.hours');
    return `${hours} ${unit}`;
  } else if (diffInSeconds < 31536000) {
    const days = Math.floor(diffInSeconds / 86400);
    const unit = days === 1 ? t('time.day') : t('time.days');
    return `${days} ${unit}`;
  } else {
    const years = Math.floor(diffInSeconds / 31536000);
    const unit = years === 1 ? t('time.year') : t('time.years');
    return `${years} ${unit}`;
  }
};
