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

  return (
    <div className="bg-white px-4 py-3 mt-1">
      <h2 className="text-sm font-bold text-gray-800 tracking-tight">
        Ulasan Pembeli ({allReviews.length})
      </h2>

      {/* Gauge + Bar Distribution */}
      <div className="bg-gray-50/70 rounded-xl p-4 mb-4 shadow-layer-sm mt-2">
        <div className="flex items-center gap-0">
          {/* Gauge — 40% */}
          <div
            className="flex flex-col items-center justify-center border-r border-gray-200/60 pr-3"
            style={{ width: "40%" }}
          >
            <svg
              width="100"
              height="54"
              viewBox="0 0 110 62"
              role="img"
              aria-label={`Rating ${liveRating} dari 5`}
            >
              <defs>
                <linearGradient
                  id="gaugeGrad"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="0%"
                >
                  <stop offset="0%" stopColor="#ef4444" /> {/* 1★ */}
                  <stop offset="25%" stopColor="#fb923c" /> {/* 2★ */}
                  <stop offset="50%" stopColor="#facc15" /> {/* 3★ */}
                  <stop offset="75%" stopColor="#4ade80" /> {/* 4★ */}
                  <stop offset="100%" stopColor="#10b981" /> {/* 5★ */}
                </linearGradient>
              </defs>
              <path
                d="M5,54 A50,50 0 0,1 105,54"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="8"
                strokeLinecap="round"
              />
              <path
                d="M5,54 A50,50 0 0,1 105,54"
                fill="none"
                stroke="url(#gaugeGrad)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray="157.08"
                strokeDashoffset={
                  safeRating > 0 ? 157.08 * (1 - (safeRating - 1) / 4) : 157.08
                }
              />
              <circle cx="55" cy="54" r="3" fill="#374151" />
              <line
                x1="55"
                y1="54"
                x2="55"
                y2="18"
                stroke="#374151"
                strokeWidth="1.8"
                strokeLinecap="round"
                transform={
                  safeRating > 0
                    ? `rotate(${-90 + ((safeRating - 1) / 4) * 180}, 55, 54)`
                    : `rotate(-90, 55, 54)`
                }
              />
            </svg>

            <span className="text-xl font-extrabold text-gray-800 leading-none -mt-0.5">
              {(safeRating || 0).toFixed(1)}
            </span>
            <div className="flex gap-0.5 my-0.5">
              {hasReview &&
                [1, 2, 3, 4, 5].map((i) => renderStar(i, safeRating))}
            </div>
            <span
              className={`text-[10px] font-bold ${getRatingColor(safeRating)}`}
            >
              {hasReview ? getRatingLabel(safeRating) : "Belum ada ulasan"}
            </span>
          </div>

          {/* Bar Distribution — 60% */}
          <div
            className="flex flex-col gap-[5px] pl-3"
            style={{ width: "60%" }}
          >
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
                  <span className="text-[9px] text-gray-400 tabular-nums min-w-[26px] text-right">
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
          <div key={review.id} className="py-2.5">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shadow-sm ${getAvatarColor(review.name)} opacity-80 flex-shrink-0`}
                >
                  {review.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-1.5 min-w-0">
                    <p className="text-[13px] font-bold text-gray-800 tracking-tight leading-none truncate">
                      {maskName(review.name)}
                    </p>
                  </div>
                  <div className="flex items-center gap-0.5 mt-1">
                    {[1, 2, 3, 4, 5].map((star) =>
                      renderStar(star, review.rating),
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 text-gray-600 flex-shrink-0 mt-0.5">
                <Clock size={10} strokeWidth={1.5} />
                <span className="text-[11px] font-medium">
                  <TimeAgo date={review.createdAt} />
                </span>
              </div>
            </div>

            <div className="pl-[48px] flex items-end justify-between gap-4">
              <p className="text-[13px] text-gray-600 leading-snug flex-1 break-words min-w-0">
                {review.comment}
              </p>

              <div className="flex-shrink-0 mb-0.5 w-[76px] flex items-center justify-end">
                {thankYouIds.includes(review.id) ? (
                  <span className="text-[10px] font-bold text-emerald-600 animate-pulse whitespace-nowrap">
                    Terima kasih!
                  </span>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleVote(review.id, "like")}
                      className={`flex items-center gap-1 transition-all duration-300 ${votedType[review.id] === "like" ? "text-emerald-700 scale-110" : "text-gray-500"}`}
                    >
                      <ThumbsUp
                        size={13}
                        className={`${votedType[review.id] === "like" ? "fill-emerald-500/20" : "fill-none"}`}
                        strokeWidth={
                          votedType[review.id] === "like" ? 2.5 : 1.8
                        }
                      />
                      <span
                        className={`text-[11px] font-bold ${votedType[review.id] === "like" ? "text-emerald-700" : "text-gray-600"}`}
                      >
                        {review.likes || 0}
                      </span>
                    </button>
                    <button
                      onClick={() => handleVote(review.id, "dislike")}
                      className={`flex items-center gap-1 transition-all duration-300 ${votedType[review.id] === "dislike" ? "text-rose-700 scale-110" : "text-gray-500"}`}
                    >
                      <ThumbsDown
                        size={13}
                        className={`${votedType[review.id] === "dislike" ? "fill-rose-500/20" : "fill-none"}`}
                        strokeWidth={
                          votedType[review.id] === "dislike" ? 2.5 : 1.5
                        }
                      />
                      <span
                        className={`text-[11px] font-bold ${votedType[review.id] === "dislike" ? "text-rose-700" : "text-gray-600"}`}
                      >
                        {review.dislikes || 0}
                      </span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {review.reply && (
              <div className="ml-[48px] mt-3 bg-gray-50 rounded-xl p-3 border border-gray-100">
                {/* header */}
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold">
                      CS
                    </div>

                    <div className="min-w-0">
                      <span className="block text-[11px] font-bold text-gray-800 truncate">
                        {review.reply.adminName}
                      </span>
                    </div>
                  </div>

                  <span className="text-[10px] text-gray-400">
                    <TimeAgo date={review.reply.createdAt} />
                  </span>
                </div>

                {/* content */}
                <p className="text-[12px] text-gray-600 leading-snug">
                  {review.reply.comment}
                </p>
              </div>
            )}

            {/* Divider skip area avatar */}
            {index < displayedReviews.length - 1 && (
              <div className="ml-[48px] border-b border-gray-100 mt-2.5" />
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
