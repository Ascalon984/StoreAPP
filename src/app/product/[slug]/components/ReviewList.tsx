"use client";

import { Star, StarHalf, ThumbsUp, Clock } from "lucide-react";
import { Review } from "@/lib/types";
import { MOCK_SELLERS } from "@/lib/mockSellers";
import TimeAgo from "@/components/TimeAgo";

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

interface ReviewListProps {
  filteredReviews: Review[];
  displayedReviews: Review[];
  displayCount: number;
  activeFilter: number | "all";
  votedType: Record<string, "like" | "dislike" | null>;
  thankYouIds: string[];
  onVote: (reviewId: string, type: "like" | "dislike") => void;
  onResetFilter: () => void;
  onLoadMore: () => void;
}

export default function ReviewList({
  filteredReviews,
  displayedReviews,
  displayCount,
  activeFilter,
  votedType,
  thankYouIds,
  onVote,
  onResetFilter,
  onLoadMore,
}: ReviewListProps) {
  return (
    <>
      {/* Reviews list */}
      <div className="space-y-0 px-1">
        {filteredReviews.length === 0 ? (
          <div className="py-8 text-center">
            <div className="flex justify-center mb-2.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  size={16}
                  strokeWidth={1.5}
                  className={
                    s <= (activeFilter as number)
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-gray-200"
                  }
                />
              ))}
            </div>
            <p className="text-[11px] text-gray-400 mb-2">
              Belum ada ulasan bintang {activeFilter}
            </p>
            <button
              type="button"
              onClick={onResetFilter}
              className="text-[10px] text-emerald-600 font-semibold hover:underline"
            >
              Lihat semua ulasan →
            </button>
          </div>
        ) : (
          displayedReviews.map((review: Review, index: number) => (
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
                        onClick={() => onVote(review.id, "like")}
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
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold">
                        {MOCK_SELLERS.find((s) => s.id === review.sellerId)
                          ?.name?.substring(0, 2)
                          .toUpperCase() || "CS"}
                      </div>
                      <div className="min-w-0">
                        <span className="block text-[10px] font-semibold text-gray-600 truncate">
                          {MOCK_SELLERS.find((s) => s.id === review.sellerId)
                            ?.name || review.reply.adminName}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] text-gray-400">
                      <TimeAgo date={review.reply.createdAt} />
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-600 leading-[1.35]">
                    {review.reply.comment}
                  </p>
                </div>
              )}

              {index < displayedReviews.length - 1 && (
                <div className="ml-[48px] border-b border-gray-100 mt-2" />
              )}
            </div>
          ))
        )}
      </div>

      {filteredReviews.length > 0 && displayCount < filteredReviews.length && (
        <button
          onClick={onLoadMore}
          className="w-full py-2 mt-2 text-emerald-700 font-bold text-sm border hover:bg-emerald-50 border-emerald-200 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          {activeFilter === "all"
            ? "Lihat ulasan lainnya"
            : `Lihat ulasan ${activeFilter}★ lainnya`}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      )}
    </>
  );
}
