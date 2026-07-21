import React from "react";
import { AvatarCircle } from "@/components/ProfileComponents";
import { Camera, Pencil } from "lucide-react";

interface UserProfile {
  name: string;
  username: string;
}

interface ProfileHeaderProps {
  user: UserProfile;
  avatarPreview: string | null;
  onAvatarChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function ProfileHeader({ user, avatarPreview, onAvatarChange }: ProfileHeaderProps) {
  return (
    <div className="relative">
      {/* HEADER BACKGROUND (SAMA DENGAN HOME NAVBAR) */}
      <div
        className="absolute top-0 left-0 w-full z-0 bg-gradient-to-br from-[#0E9F6E] via-[#047857] to-[#065F46] rounded-b-[12px]"
        style={{ height: "calc(238px + env(safe-area-inset-top))" }}
      />

      {/* CONTENT */}
      <div
        className="relative z-10 px-4 pb-0 flex items-start justify-between"
        style={{ paddingTop: "calc(16px + env(safe-area-inset-top))" }}
      >
        {/* LEFT: AVATAR + NAME */}
        <div className="flex items-start gap-3.5">
          <div className="relative flex-shrink-0">
            <AvatarCircle name={user.name} src={avatarPreview} size={48} />
            <label className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-white border border-white flex items-center justify-center shadow-sm active:scale-90 transition-all cursor-pointer">
              {avatarPreview ? (
                <Pencil
                  size={10.5}
                  strokeWidth={2.5}
                  className="text-gray-700"
                />
              ) : (
                <Camera
                  size={10.5}
                  strokeWidth={2.5}
                  className="text-gray-700"
                />
              )}

              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onAvatarChange}
              />
            </label>
          </div>

          <div className="flex flex-col leading-tight">
            <h1 className="text-[16px] font-bold text-white tracking-tight">
              {user.name || "Pengguna"}
            </h1>
            <p className="text-[11px] text-white/85 font-medium tracking-wide mt-1.5">
              @{user.username}
            </p>
          </div>
        </div>
        {/* RIGHT */}
        <button
          className="
            shrink-0
            h-7
            px-2.5
            rounded-[12px]
            bg-gradient-to-r
            from-amber-300
            to-orange-400
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
            Buka Toko
          </span>
        </button>
      </div>

      {/* spacing bawah agar overlap card tetap enak */}
      <div className="h-[55px]" />
    </div>
  );
}
