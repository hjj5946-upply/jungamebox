import logo from '/favicon.png';

export default function TopBar() {
  return (
    <header className="h-12 flex items-center justify-center px-4 bg-slate-800 border-b border-slate-700 shadow-sm text-xl font-semibold text-white">
      <img src={logo} alt="logo" className="w-6 h-6 mr-2" />
      J GameBox
    </header>
  );
}