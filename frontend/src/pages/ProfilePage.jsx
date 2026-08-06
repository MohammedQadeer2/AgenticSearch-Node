import { useEffect, useState } from "react";
import { ArrowLeft, CalendarDays, Mail, UserRound } from "lucide-react";

export default function ProfilePage({ onBack }) {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    async function loadProfile() {
      if (!userId) {
        setError("Please sign in to view your profile.");
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`http://localhost:3001/api/auth/profile/${userId}`);

        if (!response.ok) {
          throw new Error("Could not load profile");
        }

        const data = await response.json();
        setUser(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    }

    loadProfile();
  }, [userId]);

  return (
    <main className="min-h-screen bg-[#0b1324] px-5 py-8 font-sans text-slate-100 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <button onClick={onBack} className="mb-8 flex items-center gap-2 text-sm text-slate-400 hover:text-white">
          <ArrowLeft className="h-4 w-4" />
          Back to chat
        </button>

        <section className="overflow-hidden rounded-3xl border border-slate-700/70 bg-[#111b30] shadow-xl shadow-black/20">
          <div className="h-32 bg-gradient-to-r from-indigo-600 to-purple-600" />
          <div className="px-6 pb-8 sm:px-10">
            <div className="-mt-12 grid h-24 w-24 place-items-center rounded-full border-4 border-[#111b30] bg-gradient-to-br from-indigo-400 to-purple-500 text-2xl font-bold text-white">
              {user?.name?.slice(0, 2).toUpperCase() || "QA"}
            </div>

            {isLoading && <p className="mt-6 text-slate-400">Loading profile...</p>}
            {!isLoading && error && <p className="mt-6 text-red-300">{error}</p>}

            {!isLoading && user && (
              <>
                <h1 className="mt-5 text-3xl font-semibold">{user.name}</h1>
                <p className="mt-1 text-slate-400">Your Qadeer.AI account</p>

                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-700 bg-[#0c1527] p-4">
                    <div className="flex items-center gap-2 text-sm text-slate-400"><Mail className="h-4 w-4" />Email address</div>
                    <p className="mt-2 break-all text-sm text-slate-100">{user.email}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-700 bg-[#0c1527] p-4">
                    <div className="flex items-center gap-2 text-sm text-slate-400"><CalendarDays className="h-4 w-4" />Member since</div>
                    <p className="mt-2 text-sm text-slate-100">{new Date(user.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-700 bg-[#0c1527] p-4 sm:col-span-2">
                    <div className="flex items-center gap-2 text-sm text-slate-400"><UserRound className="h-4 w-4" />User ID</div>
                    <p className="mt-2 break-all font-mono text-sm text-slate-100">{user._id}</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
