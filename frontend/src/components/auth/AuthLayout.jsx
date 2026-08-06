export default function AuthLayout({ children }) {
  return (
    <main className="min-h-screen bg-[#0b1324] p-5 font-sans text-slate-100 sm:p-8">
      <div className="mx-auto grid min-h-[calc(100vh-40px)] max-w-6xl overflow-hidden rounded-3xl border border-slate-700/60 bg-[#111b30] shadow-2xl shadow-black/30 lg:grid-cols-2">
        <section className="relative hidden overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-[#172554] p-12 lg:flex lg:flex-col">
          <h1 className="relative z-10 text-2xl font-bold">
            Qadeer<span className="text-indigo-200">.AI</span>
          </h1>
          <div className="relative z-10 my-auto max-w-md">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-indigo-200">
              Your AI workspace
            </p>
            <h2 className="mt-4 text-4xl font-semibold leading-tight">
              Turn your ideas into meaningful conversations.
            </h2>
            <p className="mt-5 text-base leading-7 text-indigo-100">
              A focused place to chat, learn, and explore your company knowledge.
            </p>
          </div>
          <div className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-purple-400/30 blur-3xl" />
        </section>
        <section className="flex flex-col justify-center px-5 py-10 sm:px-12 lg:px-16">
          <h1 className="mb-10 text-xl font-bold lg:hidden">
            Qadeer<span className="text-indigo-300">.AI</span>
          </h1>
          {children}
        </section>
      </div>
    </main>
  );
}
