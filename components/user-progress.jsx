import { InfinityIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export const UserProgress = ({
  activeCourse,
  hearts,
  points,
  hasActiveSubscription,
}) => {
  return (
    <div className="flex w-full items-center justify-between gap-x-2">
      <Link href="/courses">
        <Button variant="ghost">
          <Image
            src={activeCourse.imageSrc}
            alt={activeCourse.title}
            className="rounded-md border"
            width={32}
            height={32}
          />
        </Button>
      </Link>

      <Button variant="ghost" className="text-orange-500">
        <Image
          src="/points.svg"
          height={28}
          width={28}
          alt="Points"
          className="mr-2"
        />
        {points}
      </Button>

      <Button variant="ghost" className="text-rose-500">
        <Image
          src="/heart.svg"
          height={22}
          width={22}
          alt="Hearts"
          className="mr-2"
        />
        {hasActiveSubscription ? (
          <InfinityIcon className="stroke-3 h-4 w-4" />
        ) : (
          hearts
        )}
      </Button>
    </div>
  );
};
