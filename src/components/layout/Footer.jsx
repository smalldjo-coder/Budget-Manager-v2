import { Download, Upload, PiggyBank, Smartphone } from "lucide-react";

export const Footer = ({ fileInputRef, iComptaInputRef, livretsInputRef, exportToCSV }) => (
  <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-3 lg:gap-4 pb-8">
    <button 
      onClick={() => fileInputRef.current?.click()}
      className="card p-4 flex flex-col items-center justify-center gap-2 text-text-muted hover:text-white transition-all card-hover group"
    >
      <Upload className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
      <span className="text-[10px] font-bold uppercase tracking-widest mt-1">IMPORT CSV</span>
    </button>
    
    <button 
      onClick={() => iComptaInputRef.current?.click()}
      className="card p-4 flex flex-col items-center justify-center gap-2 text-text-muted hover:text-white transition-all card-hover group"
    >
      <Smartphone className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
      <span className="text-[10px] font-bold uppercase tracking-widest mt-1">ICOMPTA</span>
    </button>
    
    <button 
      onClick={() => livretsInputRef.current?.click()}
      className="card p-4 flex flex-col items-center justify-center gap-2 text-text-muted hover:text-white transition-all card-hover group"
    >
      <PiggyBank className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
      <span className="text-[10px] font-bold uppercase tracking-widest mt-1">IMPORT LIVRETS</span>
    </button>
    
    <button 
      onClick={exportToCSV}
      className="card p-4 flex flex-col items-center justify-center gap-2 text-text-muted hover:text-white transition-all card-hover group"
    >
      <Download className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
      <span className="text-[10px] font-bold uppercase tracking-widest mt-1">EXPORT CSV</span>
    </button>
  </div>
);
