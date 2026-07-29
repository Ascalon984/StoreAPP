import React from "react";
import { AvatarCircle } from "@/components/ProfileComponents";
import { SquarePen } from "lucide-react";

interface UserProfile {
  name: string;
  username: string;
}

interface ProfileHeaderProps {
  user: UserProfile;
  avatarPreview: string | null;
  onEditProfile: () => void;
}

export default function ProfileHeader({
  user,
  avatarPreview,
  onEditProfile,
}: ProfileHeaderProps) {
  return (
    <div className="relative">
      {/* HEADER BACKGROUND (SAMA DENGAN HOME NAVBAR) */}
      <div
        className="absolute top-0 left-0 w-full z-0 bg-gradient-to-br from-[#0E9F6E] via-[#047857] to-[#065F46] rounded-b-[12px]"
        style={{ height: "calc(238px + env(safe-area-inset-top))" }}
      />

      {/* CONTENT */}
      <div
        className="relative z-10 px-4 pb-0 flex items-start justify-between gap-3 translate-x-[2px]"
        style={{ paddingTop: "calc(16px + env(safe-area-inset-top))" }}
      >
        <div className="flex flex-1 min-w-0 items-start gap-3">
          <div className="relative flex-shrink-0">
            <AvatarCircle name={user.name} src={avatarPreview} size={54} />
          </div>

          <div className="flex flex-col leading-tight min-w-0">
            <div className="flex items-center gap-1.5 min-w-0">
              <h1 className="flex-1 truncate text-[15.5px] font-semibold text-white tracking-tight">
                {user.name || "Pengguna"}
              </h1>

              <button
                onClick={onEditProfile}
                className="shrink-0 p-0.5 active:scale-90 transition-transform"
                aria-label="Edit profil"
              >
                <SquarePen
                  size={13}
                  strokeWidth={2.7}
                  className="text-white/80 hover:text-white"
                />
              </button>
            </div>
            <p className="mt-1 truncate text-[11.5px] font-medium tracking-wide text-white/80">
              {user.username}
            </p>
          </div>
        </div>
        {/* RIGHT */}
        <button
          className="
            shrink-0
            h-7
            px-2.5
            rounded-[10px]
            bg-gradient-to-t
            from-amber-400
            to-orange-500
            active:scale-95
            transition-all
            flex items-center gap-1
          "
        >
          <span
            className="text-[10.5px] font-semibold text-white tracking-[0.01em]"
            style={{
              WebkitTextStroke: "0.9px black",
              paintOrder: "stroke fill",
              textShadow: "0 1px 1px rgba(0,0,0,.25)",
            }}
          >
            Jual Barang
          </span>
        </button>
      </div>

      {/* spacing bawah agar overlap card tetap enak */}
      <div className="h-[50px]" />
    </div>
  );
}
