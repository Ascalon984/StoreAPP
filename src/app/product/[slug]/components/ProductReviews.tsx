"use client";

import { useState } from "react";
import {
  Star,
  StarHalf,
  ThumbsUp,
  ThumbsDown,
  Clock,
  ChevronDown,
} from "lucide-react";
import { Review } from "@/lib/types";
import TimeAgo from "@/components/TimeAgo";
import { maskName } from "@/lib/utils";
import { useReviewStore } from "@/store/useReviewStore";

const RATING_COLORS: Record<number, string> = {
  5: "bg-gray-500",
  4: "bg-gray-500",
  3: "bg-gray-500",
  2: "bg-gray-500",
  1: "bg-gray-500",
};

const colors = [
  "bg-red-100 text-red-600",
  "bg-blue-100 text-blue-600",
  "bg-green-100 text-green-600",
  "bg-purple-100 text-purple-600",
  "bg-orange-100 text-orange-600",
  "bg-pink-100 text-pink-600",
];

function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
}

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

// Helper: hitung distribusi rating dari data ulasan
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
  const [votedIds, setVotedIds] = useState<string[]>([]);
  const [votedType, setVotedType] = useState<
    Record<string, "like" | "dislike" | null>
  >({});
  const [thankYouIds, setThankYouIds] = useState<string[]>([]);

  const distribution = getRatingDistribution(allReviews);
  const displayedReviews = allReviews.slice(0, displayCount);

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
  const activeZone =
    safeRating === 0
      ? 0
      : safeRating >= 4
        ? 4
        : safeRating >= 3
          ? 3
          : safeRating >= 2
            ? 2
            : 1;

  return (
    <div className="bg-white px-4 py-2.5 mt-1">
      <div className="flex items-center gap-2">
        <h2 className="text-sm font-medium text-gray-600 tracking-[0.010em]">
          Ulasan Pembeli
        </h2>

        <span className="px-1.5 py-0.5 rounded-full bg-gray-100 text-[10px] font-medium text-gray-500 leading-none">
          {allReviews.length}
        </span>
      </div>

      {/* Gauge + Bar Distribution */}
      <div className="relative rounded-xl px-2 py-1.5 mb-2.5 mt-0.5 bg-white shadow-layer-xs overflow-hidden">
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
              {/* Background track */}
              <path
                d="M5,54 A50,50 0 0,1 105,54"
                fill="none"
                stroke="#d1d5db"
                strokeWidth="8.5"
                strokeLinecap="round"
              />
              {/* Gauge Segments */}
              {[
                {
                  zone: 1,
                  color: "#f87171", // soft red
                  dash: "36.9 147.6",
                  offset: 0,
                },
                {
                  zone: 2,
                  color: "#fb923c", // soft orange
                  dash: "36.9 147.6",
                  offset: 36.9,
                },
                {
                  zone: 3,
                  color: "#facc15", // muted yellow
                  dash: "36.9 147.6",
                  offset: 73.8,
                },
                {
                  zone: 4,
                  color: "#4ade80", // soft green
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

              {/* Jarum Needle Runcing */}
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
                  d="
      M55 2
      L52.8 54
      Q55 50 57.2 54
      Z
    "
                  fill="#374151"
                  opacity="0.90"
                />
              </g>

              {/* Center circle */}
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
              {safeRating === 0
                ? "—"
                : safeRating % 1 === 0
                  ? safeRating
                  : safeRating.toFixed(1)}
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
                distribution.percent[star as keyof typeof distribution.percent];
              return (
                <div key={star} className="flex items-center gap-0.5">
                  <span className="text-[10px] font-semibold text-gray-600 w-2 text-center tabular-nums">
                    {star}
                  </span>
                  <Star
                    size={7}
                    className="text-gray-400 fill-gray-400 flex-shrink-0"
                    strokeWidth={1.5}
                  />
                  <div className="flex-1 h-[7px] bg-gray-200/50 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ease-out ${RATING_COLORS[star]}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-[8.5px] text-gray-400 tabular-nums min-w-[26px] text-right">
                    {pct}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="space-y-0 px-1">
        {displayedReviews.map((review: Review, index: number) => (
          <div
            key={review.id}
            className={index === 0 ? "pt-2 pb-1.5" : "pt-1 pb-1"}
          >
            <div className="flex items-start justify-between mb-0.5">
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shadow-sm ${getAvatarColor(review.name)} opacity-80 flex-shrink-0`}
                >
                  {review.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-1.5 min-w-0">
                    <p className="text-[11.5px] font-semibold text-gray-700 leading-none truncate">
                      {review.name}
                    </p>
                  </div>
                  <div className="flex items-center gap-[1px] mt-[3px]">
                    {[1, 2, 3, 4, 5].map((star) =>
                      renderStar(star, review.rating),
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 text-gray-400 flex-shrink-0 mt-0.5">
                <Clock size={10} strokeWidth={1.5} />
                <span className="text-[10px] font-normal">
                  <TimeAgo date={review.createdAt} />
                </span>
              </div>
            </div>

            <div className="pl-[48px] flex items-end gap-1">
              <p className="text-[11.5px] font-medium text-gray-600 leading-[1.6] break-words flex-1 min-w-0">
                {review.comment}
              </p>

              <div className="flex items-center justify-end flex-shrink-0 mb-0.5">
                {thankYouIds.includes(review.id) ? (
                  <span className="text-[10px] font-bold text-emerald-600 animate-pulse whitespace-nowrap">
                    Terima kasih!
                  </span>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleVote(review.id, "like")}
                      className={`flex items-center gap-1 transition-all duration-300 ${
                        votedType[review.id] === "like"
                          ? "text-gray-700 scale-105"
                          : "text-gray-400"
                      }`}
                    >
                      <ThumbsUp
                        size={14}
                        className={
                          votedType[review.id] === "like"
                            ? "fill-gray-500 text-white"
                            : "fill-none text-gray-400"
                        }
                        strokeWidth={
                          votedType[review.id] === "like" ? 2.2 : 1.8
                        }
                      />

                      <span
                        className={`text-[10px] font-medium ${
                          votedType[review.id] === "like"
                            ? "text-gray-700"
                            : "text-gray-500"
                        }`}
                      >
                        {review.likes || 0}
                      </span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {review.reply && (
              <div className="ml-[46px] mt-2 bg-gray-50 rounded-lg p-1.5 border border-gray-100">
                {/* header */}
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold">
                      CS
                    </div>

                    <div className="min-w-0">
                      <span className="block text-[10px] font-semibold text-gray-600 truncate">
                        {review.reply.adminName}
                      </span>
                    </div>
                  </div>

                  <span className="text-[10px] text-gray-400">
                    <TimeAgo date={review.reply.createdAt} />
                  </span>
                </div>

                {/* content */}
                <p className="text-[11px] text-gray-600 leading-[1.35]">
                  {review.reply.comment}
                </p>
              </div>
            )}

            {/* Divider skip area avatar */}
            {index < displayedReviews.length - 1 && (
              <div className="ml-[48px] border-b border-gray-100 mt-2" />
            )}
          </div>
        ))}
      </div>

      {displayCount < allReviews.length && (
        <button
          onClick={() => setDisplayCount((prev) => prev + 5)}
          className="w-full py-2 mt-2 text-emerald-700 font-bold text-sm border hover:bg-emerald-50 border-emerald-200 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          Lihat ulasan lainnya
          <ChevronDown size={16} strokeWidth={1.5} />
        </button>
      )}
    </div>
  );
}
