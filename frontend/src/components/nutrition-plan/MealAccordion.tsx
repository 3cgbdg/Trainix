"use client";

import { useMutation } from "@tanstack/react-query";
import { Check, ChevronDown, Clock3, Soup, Timer } from "lucide-react";
import Image from "next/image";
import { memo, useId, type Dispatch, type SetStateAction } from "react";
import { api } from "@/api/axiosInstance";
import { Button } from "@/components/ui/Button";
import { useAppDispatch } from "@/hooks/reduxHooks";
import { cn } from "@/lib/cn";
import { changeStatus } from "@/redux/nutritionDaySlice";
import type { IMeal } from "@/types/types";

type MealAccordionProps = {
  dayNumber: number;
  idx: number;
  meal: IMeal;
  isOpen: string | null;
  setIsOpen: Dispatch<SetStateAction<string | null>>;
};

function MealAccordion({ meal, isOpen, setIsOpen, dayNumber, idx }: MealAccordionProps) {
  const dispatch = useAppDispatch();
  const contentId = useId();
  const expanded = isOpen === meal.mealTitle;
  const mutation = useMutation({
    mutationFn: ({ planDay, index }: { planDay: number; index: number }) =>
      api.patch(`/api/nutrition-plan/nutrition-plans/days/${planDay}/meal/status`, { index }).then((response) => response.data),
    onSuccess: () => dispatch(changeStatus(idx)),
  });

  return (
    <article className="overflow-hidden rounded-card border border-border bg-surface">
      <div className="relative aspect-[16/7] min-h-44 overflow-hidden bg-surface-muted">
        <Image
          priority={idx < 2}
          fill
          sizes="(max-width: 768px) 100vw, 55vw"
          className="object-cover"
          src={meal.imageUrl === "food-placeholder.jpg" ? "/food-placeholder.jpg" : meal.imageUrl}
          alt={`${meal.mealTitle} meal`}
        />
        <span className="absolute left-3 top-3 rounded-full bg-surface/90 px-3 py-1 text-xs font-bold text-strong shadow-sm backdrop-blur">{meal.foodIntake}</span>
        {meal.status === "eaten" ? <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-brand px-3 py-1 text-xs font-bold text-on-brand"><Check size={13} /> Eaten</span> : null}
      </div>

      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="text-lg font-bold text-strong">{meal.mealTitle}</h3>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-medium text-muted">
              <span className="inline-flex items-center gap-1.5"><Clock3 size={14} /> {meal.time}</span>
              <span>{meal.mealCalories} kcal</span>
              <span>{meal.mealProtein}g protein</span>
            </div>
          </div>
          <button
            type="button"
            aria-expanded={expanded}
            aria-controls={contentId}
            aria-label={`${expanded ? "Hide" : "Show"} ${meal.mealTitle} details`}
            onClick={() => setIsOpen((current) => current === meal.mealTitle ? null : meal.mealTitle)}
            className="flex size-11 shrink-0 items-center justify-center rounded-control text-muted hover:bg-surface-muted hover:text-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
          >
            <ChevronDown className={cn("transition-transform", expanded && "rotate-180")} />
          </button>
        </div>

        <p className="mt-4 text-sm leading-6 text-muted">{meal.description}</p>
        {meal.status !== "eaten" ? (
          <Button
            variant="secondary"
            className="mt-5 w-full sm:w-auto"
            leadingIcon={<Check size={17} />}
            loading={mutation.isPending}
            loadingLabel="Saving…"
            onClick={() => mutation.mutate({ planDay: dayNumber - 1, index: idx })}
          >
            Mark as eaten
          </Button>
        ) : null}

        {expanded ? (
          <div id={contentId} className="mt-5 grid gap-5 border-t border-border pt-5 sm:grid-cols-2">
            <div>
              <h4 className="flex items-center gap-2 text-sm font-bold text-strong"><Soup size={16} className="text-brand" /> Ingredients</h4>
              <ul className="mt-3 space-y-1.5 text-sm leading-5 text-muted">
                {meal.ingredients.map((ingredient) => <li key={ingredient}>• {ingredient}</li>)}
              </ul>
            </div>
            <div>
              <h4 className="flex items-center gap-2 text-sm font-bold text-strong"><Timer size={16} className="text-brand" /> Preparation</h4>
              <ol className="mt-3 space-y-1.5 text-sm leading-5 text-muted">
                {meal.preparation.split(".").filter(Boolean).map((step, index) => <li key={`${step}-${index}`}>{index + 1}. {step.trim()}</li>)}
              </ol>
            </div>
          </div>
        ) : null}
      </div>
    </article>
  );
}

export default memo(MealAccordion);
