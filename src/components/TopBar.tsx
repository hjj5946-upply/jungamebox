import { useNavigate } from "react-router-dom";
import logo from '/favicon.png';

export default function TopBar() {
  const navigate = useNavigate();

  return (
    <header onClick={() => navigate("/")} 
    className="h-12 flex items-center justify-center px-4 bg-slate-800 border-b border-slate-700 shadow-sm text-xl font-semibold text-white cursor-pointer select-none hover:bg-slate-700 transition-colors"
    >
      <img src={logo} alt="logo" className="w-6 h-6 mr-2" />
      J GameBox
    </header>
  );
}