"use client";

import { useState } from "react";
import { Star, StarHalf, ChevronDown } from "lucide-react";
import { Review } from "@/lib/types";
import { useReviewStore } from "@/store/useReviewStore";
import ReviewList from "./ReviewList";

function renderStar(i: number, rating: number) {
  const diff = rating - (i - 1);
  if (diff >= 0.75) {
    return (
      <Star key={i} size={9} className="text-yellow-500 fill-yellow-500" />
    );
  }
  if (diff >= 0.25) {
    return (
      <StarHalf key={i} size={9} className="text-yellow-500 fill-yellow-500" />
    );
  }
  return <Star key={i} size={9} className="text-gray-200" />;
}

function getRatingDistribution(reviews: { rating: number }[]) {
  const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach((r) => {
    if (dist[r.rating as keyof typeof dist] !== undefined) {
      dist[r.rating as keyof typeof dist]++;
    }
  });
  const total = reviews.length || 1;
  return {
    raw: dist,
    percent: {
      5: Math.round((dist[5] / total) * 100),
      4: Math.round((dist[4] / total) * 100),
      3: Math.round((dist[3] / total) * 100),
      2: Math.round((dist[2] / total) * 100),
      1: Math.round((dist[1] / total) * 100),
    },
  };
}

export default function ProductReviews({
  allReviews,
  liveRating,
}: {
  allReviews: Review[];
  liveRating: number;
}) {
  const { triggerRefresh } = useReviewStore();
  const [displayCount, setDisplayCount] = useState(5);
  const [isRatingOpen, setIsRatingOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<number | "all">("all");
  const [votedIds, setVotedIds] = useState<string[]>([]);
  const [votedType, setVotedType] = useState<
    Record<string, "like" | "dislike" | null>
  >({});
  const [thankYouIds, setThankYouIds] = useState<string[]>([]);

  const distribution = getRatingDistribution(allReviews);

  const filteredReviews =
    activeFilter === "all"
      ? allReviews
      : allReviews.filter((r) => r.rating === activeFilter);

  const displayedReviews = filteredReviews.slice(0, displayCount);

  const handleFilterChange = (filter: number | "all", e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveFilter(filter);
    setDisplayCount(5);
  };

  const getRatingLabel = (rating: number) => {
    if (rating === 0) return "Belum ada rating";
    if (rating >= 4.7) return "Sangat Bagus";
    if (rating >= 4.0) return "Bagus";
    if (rating >= 3.0) return "Cukup";
    if (rating >= 2.0) return "Kurang";
    return "Buruk";
  };

  const getRatingColor = (rating: number) => {
    if (rating === 0) return "text-gray-600";
    if (rating >= 4.7) return "text-emerald-700";
    if (rating >= 4.0) return "text-emerald-700";
    if (rating >= 3.0) return "text-amber-700";
    if (rating >= 2.0) return "text-orange-700";
    return "text-rose-700";
  };

  const handleVote = async (reviewId: string, type: "like" | "dislike") => {
    if (votedIds.includes(reviewId)) return;

    setVotedIds((prev) => [...prev, reviewId]);
    setVotedType((prev) => ({ ...prev, [reviewId]: type }));
    setThankYouIds((prev) => [...prev, reviewId]);

    try {
      const response = await fetch(`/api/public/reviews/${reviewId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });

      if (!response.ok) {
        throw new Error("Gagal mengupdate vote");
      }

      triggerRefresh();

      setTimeout(() => {
        setThankYouIds((prev) => prev.filter((id) => id !== reviewId));
      }, 2000);
    } catch (error) {
      console.error("Vote error:", error);
      setVotedIds((prev) => prev.filter((id) => id !== reviewId));
      setVotedType((prev) => {
        const newState = { ...prev };
        delete newState[reviewId];
        return newState;
      });
      setThankYouIds((prev) => prev.filter((id) => id !== reviewId));
    }
  };

  const hasReview = allReviews.length > 0;
  const safeRating =
    Number.isFinite(liveRating) && liveRating > 0 ? liveRating : 0;
  const displayRatingValue =
    safeRating === 0
      ? "—"
      : safeRating % 1 === 0
        ? safeRating
        : safeRating.toFixed(1);

  return (
    <div className="bg-white px-4 py-2.5 mt-1">
      {/* Header */}
      <button
        type="button"
        onClick={() => setIsRatingOpen((prev) => !prev)}
        className="w-full flex items-center gap-3 h-7"
      >
        {/* Judul - selalu tetap */}
        <h2 className="text-sm font-medium text-gray-700 shrink-0">
          Penilaian Produk
        </h2>

        {/* Area kanan */}
        <div className="flex-1 min-w-0 flex items-center justify-end h-full">
          {!isRatingOpen ? (
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-500 font-medium whitespace-nowrap">
                {allReviews.length} ulasan
              </span>

              <span className="w-px h-3 bg-gray-200" />

              <Star
                size={12}
                className="fill-yellow-500 text-yellow-500"
                strokeWidth={2}
              />

              <span className="text-[12px] font-semibold text-gray-700 tabular-nums">
                {displayRatingValue}
              </span>

              <ChevronDown
                size={17}
                className={`ml-1 flex-shrink-0 transition-transform duration-300 ${
                  isRatingOpen ? "rotate-180" : ""
                }`}
              />
            </div>
          ) : (
            <div className="flex items-center justify-end w-full min-w-0">
              <div className="relative flex-1 overflow-hidden">
                <div className="overflow-x-auto scrollbar-hide">
                  <div className="flex w-max items-center gap-1 pr-1">
                    <button
                      onClick={(e) => handleFilterChange("all", e)}
                      className={`h-[22px] px-2.5 rounded-[7px] border text-[9px] font-semibold whitespace-nowrap transition-colors ${
                        activeFilter === "all"
                          ? "bg-emerald-500 text-white"
                          : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      Semua
                    </button>

                    {[5, 4, 3, 2, 1].map((star) => {
                      const count =
                        distribution.raw[star as keyof typeof distribution.raw];

                      const disabled = count === 0 && activeFilter !== star;

                      return (
                        <button
                          key={star}
                          onClick={(e) => handleFilterChange(star, e)}
                          disabled={disabled}
                          className={`h-[22px] px-2.5 rounded-[7px] border text-[9px] font-semibold whitespace-nowrap flex items-center gap-1 transition-colors ${
                            activeFilter === star
                              ? "bg-emerald-500 text-white"
                              : disabled
                                ? "bg-gray-50 border-gray-100 text-gray-300 cursor-default"
                                : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
                          }`}
                        >
                          <span>{star}</span>

                          <Star
                            size={8}
                            strokeWidth={1.5}
                            className={
                              activeFilter === star
                                ? "fill-white text-white"
                                : disabled
                                  ? "fill-gray-300 text-gray-300"
                                  : "fill-yellow-400 text-yellow-400"
                            }
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Fade di sisi kiri */}
                <div
                  className="absolute left-0 top-0 h-full w-1 pointer-events-none"
                  style={{
                    background: "linear-gradient(to left, transparent, white)",
                  }}
                />
              </div>

              <ChevronDown
                size={17}
                className={`ml-1 flex-shrink-0 transition-transform duration-300 ${
                  isRatingOpen ? "rotate-180" : ""
                }`}
              />
            </div>
          )}
        </div>
      </button>

      {/* Gauge + Bar Distribution — collapsible */}
      <div
        className="mt-1.5 overflow-hidden transition-all duration-300 ease-in-out"
        style={{
          maxHeight: isRatingOpen ? "220px" : "0px",
          opacity: isRatingOpen ? 1 : 0,
        }}
      >
        <div className="relative rounded-xl px-2 py-1.5 mb-2.5 bg-white shadow-layer-xs overflow-hidden">
          <div className="absolute inset-x-4 top-0 h-px bg-white/60" />
          <div className="flex items-center gap-0">
            {/* Gauge — 40% */}
            <div
              className="flex flex-col items-center justify-center border-r border-gray-200/60 pr-3 pb-0.5"
              style={{ width: "40%" }}
            >
              <svg
                width="100"
                height="50"
                viewBox="0 0 110 60"
                role="img"
                aria-label={`Rating ${liveRating} dari 5`}
              >
                <path
                  d="M5,54 A50,50 0 0,1 105,54"
                  fill="none"
                  stroke="#d1d5db"
                  strokeWidth="8.5"
                  strokeLinecap="round"
                />
                {[
                  {
                    color: "#f87171",
                    dash: "36.9 147.6",
                    offset: 0,
                  },
                  {
                    color: "#fb923c",
                    dash: "36.9 147.6",
                    offset: 36.9,
                  },
                  {
                    color: "#facc15",
                    dash: "36.9 147.6",
                    offset: 73.8,
                  },
                  {
                    color: "#4ade80",
                    dash: "36.9 147.6",
                    offset: 110.7,
                  },
                ].map(({ color, dash, offset }, i) => (
                  <path
                    key={i}
                    d="M8,54 A47,47 0 0,1 102,54"
                    fill="none"
                    stroke={color}
                    strokeWidth="8.5"
                    strokeLinecap="butt"
                    strokeDasharray={dash}
                    strokeDashoffset={-offset}
                    className="transition-all duration-500"
                  />
                ))}

                <circle cx="8" cy="54" r="4.25" fill="#f87171" />
                <circle cx="102" cy="54" r="4.25" fill="#4ade80" />

                <g
                  opacity={safeRating === 0 ? 0.45 : 1}
                  className="transition-opacity duration-500"
                  transform={
                    safeRating > 0
                      ? `rotate(${-90 + ((safeRating - 1) / 4) * 180}, 55, 54)`
                      : `rotate(0, 55, 54)`
                  }
                >
                  <path
                    d="M55 2 L52.8 54 Q55 50 57.2 54 Z"
                    fill="#374151"
                    opacity="0.90"
                  />
                </g>

                <circle
                  cx="55"
                  cy="54"
                  r="3.5"
                  fill="#374151"
                  opacity={safeRating === 0 ? 0.45 : 1}
                  className="transition-opacity duration-500"
                />
              </svg>

              <span
                className={`text-[16.5px] leading-none -mt-0.7 ${
                  safeRating === 0
                    ? "font-semibold text-gray-500"
                    : "font-semibold text-gray-600"
                }`}
              >
                {displayRatingValue}
              </span>
              <div className="flex gap-0.5 mt-[1px] mb-[1px]">
                {hasReview &&
                  [1, 2, 3, 4, 5].map((i) => renderStar(i, safeRating))}
              </div>
              <span
                className={`text-[10px] font-medium tracking-[0.010em] ${getRatingColor(safeRating)}`}
              >
                {hasReview ? getRatingLabel(safeRating) : "Belum ada ulasan"}
              </span>
            </div>

            {/* Bar Distribution — 60% */}
            <div className="flex flex-col gap-1 pl-3" style={{ width: "60%" }}>
              {[5, 4, 3, 2, 1].map((star) => {
                const pct =
                  distribution.percent[
                    star as keyof typeof distribution.percent
                  ];
                const count =
                  distribution.raw[star as keyof typeof distribution.raw];
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => {
                      if (count === 0) return;
                      setActiveFilter(star);
                      setDisplayCount(5);
                    }}
                    className={`flex items-center gap-0.5 rounded-md px-1 py-px transition-colors ${
                      count > 0 ? "hover:bg-gray-50" : ""
                    }`}
                  >
                    <span className="text-[10px] font-semibold text-gray-600 w-2 text-center tabular-nums">
                      {star}
                    </span>
                    <Star
                      size={7}
                      className={`flex-shrink-0 ${
                        count === 0
                          ? "text-gray-300 fill-gray-300"
                          : "text-gray-400 fill-gray-400"
                      }`}
                      strokeWidth={1.5}
                    />
                    <div className="flex-1 h-[7px] bg-gray-200/50 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gray-500 transition-all duration-700 ease-out"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span
                      className={`flex justify-center min-w-[26px] text-[8.5px] tabular-nums ${
                        count > 0
                          ? "justify-end text-gray-400"
                          : "justify-center text-gray-300"
                      }`}
                    >
                      {count > 0 ? `${pct}%` : "—"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <ReviewList
        filteredReviews={filteredReviews}
        displayedReviews={displayedReviews}
        displayCount={displayCount}
        activeFilter={activeFilter}
        votedType={votedType}
        thankYouIds={thankYouIds}
        onVote={handleVote}
        onResetFilter={() => {
          setActiveFilter("all");
          setDisplayCount(5);
        }}
        onLoadMore={() => setDisplayCount((prev) => prev + 5)}
      />
    </div>
  );
}
