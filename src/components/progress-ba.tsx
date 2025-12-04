"use client";

import { FC } from "react";
import { Progress } from "./ui/progress";

type ProgressBarProps = {
  progress: number;
  height?: string;
  bgColor?: string;
};

const ProgressBarInfor: FC<ProgressBarProps> = ({
  progress,
  height = "20px",
  bgColor = "blue",
}) => {
  return (
    <div className="pb-4 w-full">
      <Progress
        value={progress}
        className={`h-[${height}] bg-${bgColor}-200`}
      />
    </div>
  );
};

export default ProgressBarInfor;
