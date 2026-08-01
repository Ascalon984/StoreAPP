import React from "react";
import { LogOut } from "lucide-react";
import PointsCard from "@/components/PointsCard";
import ProfileQuickActions from "./ProfileQuickActions";

import ProfileNotification from "./ProfileNotification";
import ProfileSecurity from "./ProfileSecurity";
import ProfilePrivacy from "./ProfilePrivacy";
import ProfileCSChat from "./ProfileCSChat";
import ProfileSuggestionBox from "./ProfileSuggestionBox";
import ProfilePolicy from "./ProfilePolicy";
import ProfileAbout from "./ProfileAbout";

export interface UserProfile {
  name: string;
  username: string;
  email: string;
  phone: string;
  avatar: string | null;
}

interface ProfileContentProps {
  user: UserProfile;
  setUser: React.Dispatch<React.SetStateAction<UserProfile>>;
  points: any;
  onOpenPointsInfo: () => void;
  onOpenSubPage: (page: string) => void;
}

export default function ProfileContent({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  user: _user,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setUser: _setUser,
  points,
  onOpenPointsInfo,
  onOpenSubPage,
}: ProfileContentProps) {
  return (
    <div className="relative z-10 -mt-[45px]">
      <PointsCard points={points} onOpenInfo={onOpenPointsInfo} />

      {/* ── QUICK ACCESS ROW ── */}
      <ProfileQuickActions onActionClick={onOpenSubPage} />

      {/* ── PENGATURAN ── */}
      <div className="mx-2 mt-5 bg-white rounded-lg overflow-hidden">
        <div className="px-4 pt-3.5 pb-1">
          <p className="text-[11px] font-bold text-gray-500 tracking-wide uppercase">
            Pengaturan
          </p>
        </div>
        <ProfileNotification />
        <div className="ml-[60px] border-t border-gray-100/80" />
        <ProfileSecurity />
        <div className="ml-[60px] border-t border-gray-100/80" />
        <ProfilePrivacy />
      </div>

      {/* ── BANTUAN & DUKUNGAN ── */}
      <div className="mx-2 mt-3 bg-white rounded-lg overflow-hidden">
        <div className="px-4 pt-3.5 pb-1">
          <p className="text-[11px] font-bold text-gray-500 tracking-wide uppercase">
            Bantuan &amp; Dukungan
          </p>
        </div>
        <ProfileCSChat />
        <div className="ml-[60px] border-t border-gray-100/80" />
        <ProfileSuggestionBox />
        <div className="ml-[60px] border-t border-gray-100/80" />
        <ProfilePolicy />
        <div className="ml-[60px] border-t border-gray-100/80" />
        <ProfileAbout />
      </div>

      {/* ── CTA Logout ── */}
      <div className="mx-3 mt-4 mb-2">
        <button className="group w-full py-3.5 px-4 rounded-xl border border-red-200 hover:border-red-400 hover:bg-red-500 active:scale-[0.96] transition-all duration-200 flex items-center justify-center gap-2">
          <LogOut
            size={15}
            strokeWidth={2}
            className="text-red-400 group-hover:text-white transition-colors duration-200"
          />
          <span className="font-semibold text-[13px] text-red-400 group-hover:text-white transition-colors duration-200">
            Keluar Akun
          </span>
        </button>
      </div>
    </div>
  );
}
