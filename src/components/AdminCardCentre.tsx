import React, { useState } from "react";
import { Member, InventoryStats } from "../types";
import { safePrintHtml } from "../lib/printUtils";
import { showToast } from "../lib/notifications";
import { 
  CreditCard, Truck, Settings, RefreshCw, AlertTriangle, 
  CheckCircle, Play, Package, ShieldCheck, ShoppingCart, 
  Layers, HardDrive, Printer, FileText, QrCode, CheckSquare, 
  Square, Eye, Download, Send
} from "lucide-react";
import { LOCAL_JOAO_LOURENCO_IMAGE } from "../images";

interface AdminCardCentreProps {
  members: Member[];
  inventory: InventoryStats;
  onUpdateMember: (id: string, updatedData: Partial<Member>) => void;
  onUpdateInventory: (updatedInv: Partial<InventoryStats>) => void;
  onOpenScanner?: () => void;
}

export default function AdminCardCentre({
  members,
  inventory,
  onUpdateMember,
  onUpdateInventory,
  onOpenScanner
}: AdminCardCentreProps) {
  const [printingBatch, setPrintingBatch] = useState(false);
  const [printingMessage, setPrintingMessage] = useState("");
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);

  const queue = members.filter(m => 
    m.physicalCardStatus === "Submitted" || 
    m.physicalCardStatus === "Verification" ||
    m.physicalCardStatus === "Approved" ||
    m.physicalCardStatus === "Printing" ||
    m.physicalCardStatus === "Quality Check" ||
    m.physicalCardStatus === "Ready for Dispatch" ||
    m.physicalCardStatus === "In Transit" ||
    m.physicalCardStatus === "Available for Collection"
  );

  const pendingPrints = members.filter(m => m.physicalCardStatus === "Printing" || m.physicalCardStatus === "Approved");

  const toggleSelectAll = () => {
    if (selectedMemberIds.length === queue.length) {
      setSelectedMemberIds([]);
    } else {
      setSelectedMemberIds(queue.map(m => m.id));
    }
  };

  const toggleSelectMember = (id: string) => {
    setSelectedMemberIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Trigger simulated card print batch run
  const runPrintRun = () => {
    const targets = selectedMemberIds.length > 0 
      ? members.filter(m => selectedMemberIds.includes(m.id))
      : pendingPrints;

    if (targets.length === 0) {
      showToast("Nenhum cartão selecionado ou pendente na fila de impressão.", "warning");
      return;
    }
    if (inventory.blankCards < targets.length) {
      showToast("Stock de cartões virgens insuficiente! Por favor, faça a reposição do stock de fornecedores.", "error");
      return;
    }

    setPrintingBatch(true);
    setPrintingMessage("A inicializar motor térmico de impressão CR80 (PVC 300 DPI)...");

    setTimeout(() => {
      setPrintingMessage("A gravar faixas magnéticas e a aplicar película holográfica...");
      setTimeout(() => {
        setPrintingMessage("A concluir controlo de qualidade e registo de despacho...");
        setTimeout(() => {
          // Update members
          targets.forEach(m => {
            onUpdateMember(m.id, {
              physicalCardStatus: "Available for Collection",
              physicalCardEstDate: new Date().toISOString().split("T")[0]
            });
          });

          // Decrement stock
          onUpdateInventory({
            blankCards: Math.max(0, inventory.blankCards - targets.length),
            inkPercent: Math.max(10, inventory.inkPercent - (targets.length * 2)),
            ribbonPercent: Math.max(12, inventory.ribbonPercent - (targets.length * 1.5)),
            holograms: Math.max(0, inventory.holograms - targets.length)
          });

          setPrintingBatch(false);
          setPrintingMessage("");
          setSelectedMemberIds([]);
        }, 1200);
      }, 1200);
    }, 1200);
  };

  // Generate multi-page batch PVC print sheet
  const handleBatchPVCExport = () => {
    const targets = selectedMemberIds.length > 0
      ? members.filter(m => selectedMemberIds.includes(m.id))
      : queue.slice(0, 10);

    if (targets.length === 0) {
      showToast("Selecione pelo menos um militante para gerar a folha de impressão em lote.", "warning");
      return;
    }

    const cardsHtml = targets.map((m, idx) => `
      <div class="card-pair-container">
        <!-- FRONT -->
        <div class="card card-front">
          <div class="card-header">
            <div style="display:flex; align-items:center; gap:8px;">
              <div style="background:#fff; padding:2px; border-radius:4px; border:1px solid #FFCC00; width:22px; height:22px; display:flex; align-items:center; justify-content:center;">
                <img src="https://upload.wikimedia.org/wikipedia/en/thumb/6/69/MPLA_Party_logo.svg/250px-MPLA_Party_logo.svg.png" style="width:16px; height:16px;" />
              </div>
              <div>
                <div style="font-size:12px; font-weight:900; color:#FFCC00; line-height:1;">MPLA</div>
                <div style="font-size:7px; font-weight:900; color:#FFCC00; letter-spacing:1px;">MPLA SEDE SA</div>
              </div>
            </div>
            <div style="background:#166534; color:#fff; font-size:7px; font-weight:bold; padding:2px 6px; border-radius:10px;">ATIVO</div>
          </div>

          <div class="card-body">
            <img src="${m.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop'}" class="avatar" />
            <div class="info">
              <div class="name">${m.fullName}</div>
              <div class="num">${m.membershipNo}</div>
              <div class="dob">Nasc: ${m.dob ? m.dob.split('-').reverse().join('/') : 'N/D'}</div>
              <div class="comm">${m.committee}</div>
            </div>
          </div>

          <div class="card-footer">
            <div>PROVÍNCIA: <strong>${m.province}</strong></div>
            <div>ESTRUTURA: <strong>${m.category}</strong></div>
          </div>
        </div>

        <!-- BACK -->
        <div class="card card-back">
          <div class="mag-stripe"></div>
          <div class="back-body">
            <div class="back-text">
              <div style="font-size:7px; color:#64748b; font-weight:bold; text-transform:uppercase;">Contacto de Emergência</div>
              <div style="font-size:9px; font-weight:bold; color:#0f172a;">${m.emergencyContact?.name || "Next of Kin"} (${m.emergencyContact?.phone || m.mobile})</div>
              
              <div style="font-size:7px; color:#64748b; font-weight:bold; text-transform:uppercase; margin-top:4px;">B.I. Nacional</div>
              <div style="font-size:9px; font-family:monospace; font-weight:bold; color:#0f172a;">${m.nationalId}</div>

              <div style="font-size:7px; color:#64748b; font-weight:bold; text-transform:uppercase; margin-top:4px;">Validação Oficial</div>
              <div style="font-size:7px; font-family:monospace; color:#64748b;">diaspora.mpla.ao/verificar</div>
            </div>

            <div class="qr-col">
              <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=https://diaspora.mpla.ao/verificar" class="qr-img" />
              <div class="pres-box">
                <img src="${window.location.origin + LOCAL_JOAO_LOURENCO_IMAGE}" class="pres-img" />
                <div style="font-size:5px; font-weight:bold; text-transform:uppercase; line-height:1; margin-top:2px;">S.E. João Lourenço</div>
                <div style="font-size:4px; font-weight:bold; color:#C8102E; text-transform:uppercase; line-height:1;">Presidente MPLA</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `).join("");

    const sheetHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Lote de Impressão PVC CR80 - MPLA Diáspora (${targets.length} Cartões)</title>
          <style>
            @page { size: A4; margin: 10mm; }
            body { font-family: system-ui, -apple-system, sans-serif; background: #f1f5f9; padding: 20px; }
            .no-print-bar { background: #0f172a; color: white; padding: 12px 20px; border-radius: 12px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
            .btn { background: #C8102E; color: white; border: none; padding: 8px 16px; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 13px; }
            .grid-sheet { display: grid; grid-template-columns: 1fr; gap: 20px; max-width: 800px; margin: 0 auto; }
            .card-pair-container { display: flex; gap: 15px; justify-content: center; background: white; padding: 15px; border-radius: 12px; border: 1px dashed #cbd5e1; page-break-inside: avoid; }
            
            /* CR80 Standard ISO 7810 85.60 x 53.98 mm */
            .card { width: 324px; height: 204px; border-radius: 12px; position: relative; box-sizing: border-box; overflow: hidden; }
            .card-front { background: linear-gradient(135deg, #C8102E 0%, #990B21 60%, #0f172a 100%); color: white; padding: 12px; display: flex; flex-direction: column; justify-content: space-between; border: 1px solid #FFCC00; }
            .card-header { display: flex; justify-content: space-between; align-items: center; }
            .card-body { display: flex; gap: 10px; align-items: center; }
            .avatar { width: 50px; height: 50px; border-radius: 50%; border: 2px solid #FFCC00; object-cover; background: #1e293b; }
            .info .name { font-size: 12px; font-weight: bold; }
            .info .num { font-size: 10px; color: #FFCC00; font-family: monospace; }
            .info .dob { font-size: 8px; color: #e2e8f0; font-family: monospace; }
            .info .comm { font-size: 8px; color: #cbd5e1; }
            .card-footer { border-top: 1px solid rgba(255,255,255,0.2); padding-top: 6px; display: flex; justify-content: space-between; font-size: 7.5px; }

            .card-back { background: #ffffff; border: 1px solid #cbd5e1; display: flex; flex-direction: column; }
            .mag-stripe { height: 24px; background: #0f172a; width: 100%; }
            .back-body { padding: 10px; display: flex; justify-content: space-between; gap: 10px; flex: 1; align-items: center; }
            .back-text { flex: 1; }
            .qr-col { display: flex; flex-direction: column; align-items: center; }
            .qr-img { width: 44px; height: 44px; border: 1px solid #e2e8f0; border-radius: 4px; padding: 2px; }
            .pres-box { display: flex; flex-direction: column; align-items: center; margin-top: 3px; }
            .pres-img { width: 22px; height: 22px; border-radius: 50%; border: 1px solid #FFCC00; object-fit: cover; }

            @media print {
              body { background: white; padding: 0; }
              .no-print-bar { display: none; }
              .card-pair-container { border: 1px dashed #94a3b8; }
            }
          </style>
        </head>
        <body>
          <div class="no-print-bar">
            <div>
              <strong style="font-size:15px;">Lote de Impressão Térmica CR80 • MPLA Diáspora</strong>
              <div style="font-size:11px; opacity:0.8;">Total: ${targets.length} Cartões Prontos para Impressão PVC (Frente & Verso)</div>
            </div>
            <button class="btn" onclick="window.print()">Imprimir Lote PVC</button>
          </div>

          <div class="grid-sheet">
            ${cardsHtml}
          </div>
        </body>
      </html>
    `;
    safePrintHtml(sheetHtml, `Lote de Impressão PVC CR80 (${targets.length} Cartões)`);
  };

  // Generate Shipping Manifest & Dispatch Labels
  const handleExportManifest = () => {
    const targets = queue.filter(m => ["Ready for Dispatch", "In Transit", "Available for Collection"].includes(m.physicalCardStatus));
    const list = targets.length > 0 ? targets : queue;

    const manifestHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Manifesto de Expedição Consular - MPLA Diáspora</title>
          <style>
            body { font-family: system-ui, sans-serif; padding: 30px; color: #0f172a; }
            h2 { color: #C8102E; margin-bottom: 4px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 11px; }
            th, td { border: 1px solid #cbd5e1; padding: 8px 10px; text-align: left; }
            th { background: #f8fafc; text-transform: uppercase; font-size: 9px; color: #64748b; }
            .badge { background: #dbeafe; color: #1e40af; font-weight: bold; padding: 2px 6px; border-radius: 4px; font-size: 9px; }
            .btn { background: #0f172a; color: white; padding: 8px 16px; border-radius: 6px; border: none; font-weight: bold; cursor: pointer; }
          </style>
        </head>
        <body>
          <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #C8102E; padding-bottom:15px;">
            <div>
              <h2>MPLA • GUIA DE EXPEDIÇÃO E DESPACHO CONSULAR</h2>
              <div style="font-size:12px; color:#64748b;">Lote de Entrega de Cartões de Militantes Recenseados</div>
            </div>
            <button class="btn" onclick="window.print()">Imprimir Manifesto</button>
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:15px; margin-top:20px; font-size:12px;">
            <div style="background:#f8fafc; padding:10px; border-radius:8px;">
              <strong>Data de Emissão:</strong> ${new Date().toLocaleDateString('pt-PT')}
            </div>
            <div style="background:#f8fafc; padding:10px; border-radius:8px;">
              <strong>Origem:</strong> Sede Central do MPLA CAPE
            </div>
            <div style="background:#f8fafc; padding:10px; border-radius:8px;">
              <strong>Volume Total:</strong> ${list.length} Envelopes Selados
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Nº Registo</th>
                <th>Militante</th>
                <th>B.I. / Passaporte</th>
                <th>Província Consular</th>
                <th>Comité de Destino</th>
                <th>Estado</th>
                <th>Assinatura de Receção</th>
              </tr>
            </thead>
            <tbody>
              ${list.map(m => `
                <tr>
                  <td style="font-family:monospace; font-weight:bold;">${m.membershipNo}</td>
                  <td><strong>${m.fullName}</strong></td>
                  <td>${m.nationalId}</td>
                  <td>${m.province}</td>
                  <td>${m.committee}</td>
                  <td><span class="badge">${m.physicalCardStatus}</span></td>
                  <td style="width:120px; border-bottom:1px dotted #94a3b8;"></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;
    safePrintHtml(manifestHtml, "Manifesto de Expedição Consular - MPLA Diáspora");
  };

  const handleRestock = () => {
    onUpdateInventory({
      blankCards: 5000,
      inkPercent: 100,
      ribbonPercent: 100,
      packagingEnvelopes: 15000,
      holograms: 5000
    });
    showToast("Stock de cartões virgens PVC, fita térmica e envelopes reabastecidos com sucesso!", "success");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="card-centre-panel">
      {/* Visual Industrial Print Controller */}
      <div className="lg:col-span-8 space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4">
            <div>
              <h3 className="font-display font-bold text-slate-900 text-base flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[#C8102E]" />
                Centro de Emissão & Impressão de Cartões PVC
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Gestão de lotes de impressão industrial (CR80), gravação de dados biométricos e expedição consular.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {onOpenScanner && (
                <button 
                  onClick={onOpenScanner}
                  className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <QrCode className="w-3.5 h-3.5 text-[#FFCC00]" /> Validar Cartão
                </button>
              )}
              <span className="px-3 py-1.5 bg-amber-50 rounded-xl text-xs font-mono font-bold text-amber-700 flex items-center gap-1.5 border border-amber-200">
                <HardDrive className="w-3.5 h-3.5" /> Fila: {pendingPrints.length}
              </span>
            </div>
          </div>

          {/* Action Hub */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button 
              onClick={handleBatchPVCExport}
              className="p-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-xl hover:from-slate-800 hover:to-slate-700 transition flex items-center justify-between text-left shadow-md cursor-pointer group"
            >
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#FFCC00]">Impressão em Lote PVC</p>
                <p className="text-[11px] text-slate-300 mt-0.5">Gerar folha CR80 (Zebra / Evolis / Fargo)</p>
              </div>
              <Printer className="w-5 h-5 text-slate-300 group-hover:scale-110 transition" />
            </button>

            <button 
              onClick={handleExportManifest}
              className="p-4 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-xl transition flex items-center justify-between text-left cursor-pointer group"
            >
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-800">Manifesto de Despacho</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Guia de remessa e etiquetas de envio</p>
              </div>
              <FileText className="w-5 h-5 text-slate-600 group-hover:scale-110 transition" />
            </button>
          </div>

          {printingBatch ? (
            /* PRINT RUN LOADER */
            <div className="py-12 text-center bg-slate-950 text-white rounded-2xl border border-slate-900 p-6 space-y-4 animate-pulse">
              <RefreshCw className="w-12 h-12 text-[#FFCC00] mx-auto animate-spin" />
              <div>
                <p className="text-sm font-semibold tracking-wide font-display">{printingMessage}</p>
                <p className="text-xs text-slate-400 font-mono mt-1">A processar lote de cartões de militantes...</p>
              </div>
            </div>
          ) : (
            /* CONTROL BLOCK */
            <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-5">
              <div className="space-y-1 text-center sm:text-left">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">Motor Térmico de Impressão</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Inicie a gravação e impressão física para os militantes selecionados ({selectedMemberIds.length > 0 ? `${selectedMemberIds.length} selecionados` : `${pendingPrints.length} pendentes`}).
                </p>
              </div>
              <button
                onClick={runPrintRun}
                disabled={pendingPrints.length === 0 && selectedMemberIds.length === 0}
                className="px-5 py-3 bg-[#C8102E] hover:bg-red-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 shadow-md shadow-red-100 cursor-pointer"
              >
                <Play className="w-4 h-4" /> Executar Lote de Impressão
              </button>
            </div>
          )}

          {/* Members Card Dispatch List */}
          <div className="space-y-3 pt-2">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
                Matriz de Expedição & Rastreio de Cartões
              </h4>
              <button 
                onClick={toggleSelectAll}
                className="text-[11px] font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
              >
                {selectedMemberIds.length === queue.length ? (
                  <>
                    <CheckSquare className="w-3.5 h-3.5 text-[#C8102E]" /> Desmarcar Todos
                  </>
                ) : (
                  <>
                    <Square className="w-3.5 h-3.5" /> Selecionar Todos ({queue.length})
                  </>
                )}
              </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 uppercase font-mono font-bold">
                    <th className="p-3 w-8"></th>
                    <th className="p-3">Militante</th>
                    <th className="p-3">Nº Cartão</th>
                    <th className="p-3">Província / Comité</th>
                    <th className="p-3">Estado Atual</th>
                    <th className="p-3 text-right">Alterar Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {queue.map((m) => (
                    <tr 
                      key={m.id} 
                      className={`hover:bg-slate-50/70 transition ${selectedMemberIds.includes(m.id) ? "bg-red-50/40" : ""}`}
                    >
                      <td className="p-3">
                        <input 
                          type="checkbox"
                          checked={selectedMemberIds.includes(m.id)}
                          onChange={() => toggleSelectMember(m.id)}
                          className="rounded border-slate-300 text-[#C8102E] focus:ring-[#C8102E] cursor-pointer"
                        />
                      </td>
                      <td className="p-3">
                        <div className="font-bold text-slate-900">{m.fullName}</div>
                        <div className="text-[10px] text-slate-500 font-mono">B.I. {m.nationalId}</div>
                      </td>
                      <td className="p-3 font-mono font-bold text-slate-700">{m.membershipNo}</td>
                      <td className="p-3 font-mono text-[11px] text-slate-600">{m.province}</td>
                      <td className="p-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold font-mono ${
                          m.physicalCardStatus === "Available for Collection" || m.physicalCardStatus === "Collected"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : m.physicalCardStatus === "In Transit" || m.physicalCardStatus === "Ready for Dispatch"
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}>
                          {m.physicalCardStatus}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <select
                          value={m.physicalCardStatus}
                          onChange={(e) => onUpdateMember(m.id, { physicalCardStatus: e.target.value as any })}
                          className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-[#C8102E] cursor-pointer"
                        >
                          <option value="Submitted">Submetido</option>
                          <option value="Verification">Em Verificação</option>
                          <option value="Approved">Aprovado</option>
                          <option value="Printing">Em Impressão</option>
                          <option value="Quality Check">Controlo de Qualidade</option>
                          <option value="Ready for Dispatch">Pronto para Envio</option>
                          <option value="In Transit">Em Trânsito</option>
                          <option value="Available for Collection">Disponível p/ Levantamento</option>
                          <option value="Collected">Levantado</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Warehouse stocks and print metrics */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
          <div className="flex justify-between items-center border-b border-slate-200 pb-3">
            <h3 className="font-display font-bold text-slate-900 text-sm flex items-center gap-2">
              <Layers className="w-4.5 h-4.5 text-[#C8102E]" />
              Stock de Materiais de Impressão
            </h3>
            <button 
              onClick={handleRestock}
              className="text-[10px] font-bold text-[#C8102E] flex items-center gap-1 bg-red-50 px-2.5 py-1 rounded-lg hover:bg-red-100 transition cursor-pointer"
            >
              <ShoppingCart className="w-3.5 h-3.5" /> Reabastecer
            </button>
          </div>

          <div className="space-y-4">
            {/* Blank Cardstock bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-700 font-semibold">
                <span>Cartões Virgens (PVC CR80)</span>
                <span className="font-mono">{inventory.blankCards} un.</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    inventory.blankCards < 500 ? "bg-rose-500" : "bg-emerald-500"
                  }`} 
                  style={{ width: `${Math.min(100, (inventory.blankCards / 5000) * 100)}%` }} 
                />
              </div>
              {inventory.blankCards < 500 && (
                <p className="text-[9px] text-rose-500 font-bold flex items-center gap-1 font-mono">
                  <AlertTriangle className="w-3 h-3" /> Alerta de Stock Crítico
                </p>
              )}
            </div>

            {/* Thermal ribbon bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-700 font-semibold">
                <span>Toner / Fita Térmica YMCKO</span>
                <span className="font-mono">{inventory.inkPercent}%</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    inventory.inkPercent < 25 ? "bg-rose-500" : "bg-[#C8102E]"
                  }`} 
                  style={{ width: `${inventory.inkPercent}%` }} 
                />
              </div>
            </div>

            {/* Printing Ribbons bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-700 font-semibold">
                <span>Película Holográfica Anti-Cópia</span>
                <span className="font-mono">{inventory.holograms} un.</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full bg-[#FFCC00] transition-all duration-500" 
                  style={{ width: `${Math.min(100, (inventory.holograms / 5000) * 100)}%` }} 
                />
              </div>
            </div>

            {/* Packaging envelopes bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-700 font-semibold">
                <span>Envelopes Consulares de Segurança</span>
                <span className="font-mono">{inventory.packagingEnvelopes} un.</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full bg-slate-800 transition-all duration-500" 
                  style={{ width: `${Math.min(100, (inventory.packagingEnvelopes / 15000) * 100)}%` }} 
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
