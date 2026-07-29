"use client";

import { useState, useRef, useEffect } from "react";

import { useRouter } from "next/navigation";

import ReactCrop, {
  type Crop,
  centerCrop,
  makeAspectCrop,
} from "react-image-crop";

import { X } from "lucide-react";

import ProfileHeader from "./components/ProfileHeader";

import ProfileContent, { type UserProfile } from "./components/ProfileContent";

import AddressPage from "./components/AddressPage";

import PaymentMethodPage from "./components/PaymentMethodPage";

import LastSeenPage from "./components/LastSeenPage";

// ── Mock data ──

const mockUser: UserProfile = {
  name: "Pengguna",

  username: "pengguna1",

  email: "user_1@email.com",

  phone: "081-234-5678",

  avatar: null,
};

const mockPoints = {
  total: 12450,

  transactionPoints: 11250,

  checkinPoints: 1200,

  dailyStreak: 4,

  checkedInToday: false,

  rewardStreakPoints: 100,
};

// ── Main Page ──

export default function ProfilePage() {
  const router = useRouter();

  const [user, setUser] = useState(mockUser);

  const [pointsInfoOpen, setPointsInfoOpen] = useState(false);

  const [activeSubPage, setActiveSubPage] = useState<string | null>(null);

  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    user.avatar,
  );

  const [cropSrc, setCropSrc] = useState<string | null>(null);

  const [crop, setCrop] = useState<Crop>();

  const [completedCrop, setCompletedCrop] = useState<Crop>();

  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (cropSrc) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [cropSrc]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setCropSrc(URL.createObjectURL(file));
  };

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;

    setCrop(
      centerCrop(
        makeAspectCrop({ unit: "%", width: 80 }, 1, width, height),

        width,

        height,
      ),
    );
  };

  const handleCropConfirm = async () => {
    if (!imgRef.current || !completedCrop) return;

    const canvas = document.createElement("canvas");

    const scaleX = imgRef.current.naturalWidth / imgRef.current.width;

    const scaleY = imgRef.current.naturalHeight / imgRef.current.height;

    canvas.width = 200;

    canvas.height = 200;

    const ctx = canvas.getContext("2d")!;

    ctx.drawImage(
      imgRef.current,

      completedCrop.x * scaleX,

      completedCrop.y * scaleY,

      completedCrop.width * scaleX,

      completedCrop.height * scaleY,

      0,

      0,

      200,

      200,
    );

    canvas.toBlob(
      (blob) => {
        if (!blob) return;

        setAvatarPreview(URL.createObjectURL(blob));

        setCropSrc(null);
      },

      "image/jpeg",

      0.9,
    );
  };

  return (
    <div className="min-h-screen bg-gray-50/80 pb-24">
      <ProfileHeader
        user={user}
        avatarPreview={avatarPreview}
        onAvatarChange={handleAvatarChange}
      />

      <ProfileContent
        user={user}
        setUser={setUser}
        points={mockPoints}
        onOpenPointsInfo={() => setPointsInfoOpen(true)}
        onOpenSubPage={setActiveSubPage}
      />

      {/* Modal Crop */}

      {cropSrc && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-3">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setCropSrc(null)}
          />

          <div className="relative z-10 w-full max-w-[360px] h-[520px] max-h-[90vh] bg-white rounded-xl shadow-xl flex flex-col overflow-hidden">
            <div className="flex-shrink-0 px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <p className="text-[13.5px] font-bold text-gray-800">
                Sesuaikan Foto
              </p>

              <button
                onClick={() => setCropSrc(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-200 active:scale-90 transition-all"
              >
                <X size={18} strokeWidth={2.5} />
              </button>
            </div>

            <div className="flex-1 min-h-0 bg-white overflow-y-auto overflow-x-hidden crop-scroll">
              <div className="min-h-full flex items-center justify-center pr-2 pl-2">
                <ReactCrop
                  crop={crop}
                  onChange={(c) => setCrop(c)}
                  onComplete={(c) => setCompletedCrop(c)}
                  aspect={1}
                  circularCrop
                  minWidth={60}
                >
                  <img
                    ref={imgRef}
                    src={cropSrc}
                    alt="Crop preview"
                    onLoad={onImageLoad}
                    className="block max-w-full h-auto"
                  />
                </ReactCrop>
              </div>
            </div>

            <div className="flex-shrink-0 px-3.5 py-3 border-t border-gray-100 -translate-x-[4px]">
              <button
                onClick={handleCropConfirm}
                className="w-full py-2.5 rounded-lg bg-emerald-600 text-[13.5px] font-bold text-white hover:bg-emerald-700 active:scale-95 transition-all"
              >
                Gunakan Foto Ini
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── POINTS INFO MODAL ── */}

      {pointsInfoOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-5">
          {/* BACKDROP */}

          <div
            className="absolute inset-0 bg-black/35 backdrop-blur-[2px]"
            onClick={() => setPointsInfoOpen(false)}
          />

          {/* MODAL */}

          <div className="relative w-full max-w-[320px] rounded-3xl bg-white shadow-2xl ring-1 ring-black/5 animate-in zoom-in-95 duration-200">
            {/* CLOSE */}

            <button
              onClick={() => setPointsInfoOpen(false)}
              className="absolute top-3 right-3 w-8 h-8 rounded-full hover:bg-gray-100 active:scale-90 transition-all flex items-center justify-center"
            >
              <X size={15} className="text-gray-400" strokeWidth={2.5} />
            </button>

            {/* CONTENT */}

            <div className="px-5 pt-5 pb-5">
              <div className="flex items-center gap-2">
                <img src="/icons/poin.svg" alt="Poin" className="w-5 h-5" />

                <h3 className="text-[15px] font-bold text-gray-900">
                  Cara Mendapatkan Poin
                </h3>
              </div>

              <p className="mt-2 text-[12px] leading-relaxed text-gray-500">
                Poin kamu didapat dari transaksi dan aktivitas check-in harian.
                Semakin sering kamu bertransaksi dan menjaga streak check-in,
                semakin banyak poin yang terkumpul.
              </p>

              {/* LIST */}

              <div className="mt-5 space-y-3">
                {[
                  "Dapatkan poin setiap kali melakukan transaksi.",

                  "Bonus poin bertambah saat kamu check-in berturut-turut.",

                  "Streak check-in meningkatkan total reward mingguan kamu.",
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />

                    <p className="text-[11px] leading-relaxed text-gray-600">
                      {item}
                    </p>
                  </div>
                ))}

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-start gap-2">
                    <img
                      src="/icons/Tips.png"
                      alt="Tips"
                      className="w-4 h-4 flex-shrink-0 mt-0.5"
                    />

                    <p className="text-[11px] leading-relaxed text-gray-500">
                      Pertahankan streak check-in untuk bonus poin maksimal.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── SUB PAGES ── */}

      {activeSubPage === "alamat" && (
        <AddressPage onClose={() => setActiveSubPage(null)} />
      )}

      {activeSubPage === "pembayaran" && (
        <PaymentMethodPage onClose={() => setActiveSubPage(null)} />
      )}

      {activeSubPage === "terakhir" && (
        <LastSeenPage onClose={() => setActiveSubPage(null)} />
      )}
    </div>
  );
}
