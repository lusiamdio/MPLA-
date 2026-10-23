import React, { useState, useEffect } from "react";
import { Member } from "../types";
import { Download, Share2, Shield, CreditCard, CheckCircle, Truck, Package, Clock, Wifi, Printer, FileText, Smartphone, X, Check, Lock, Sparkles, MessageSquare, Image as ImageIcon } from "lucide-react";
import html2canvas from "html2canvas";
import { safePrintHtml } from "../lib/printUtils";
import { showToast } from "../lib/notifications";
import { 
  MPLA_EMBLEM_SVG as MPLA_EMBLEM_SVG_DATA_URI, 
  DEFAULT_MEMBER_AVATAR as FALLBACK_MEMBER_PHOTO,
  LOCAL_JOAO_LOURENCO_IMAGE,
  LOCAL_MPLA_PARTY_LOGO
} from "../images";

interface DigitalCardProps {
  member: Member;
}

export default function DigitalCard({ member }: DigitalCardProps) {
  const [copied, setCopied] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [walletAdded, setWalletAdded] = useState(false);
  const [isExportingImage, setIsExportingImage] = useState(false);
  const [whatsappAlertsEnabled, setWhatsappAlertsEnabled] = useState(true);

  // Live timer for anti-screenshot dynamic watermark
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const shareLink = `https://portal.party.org/verify/${member.membershipNo}`;

  // Download Simulated Apple/Google Wallet Pass file (.pkpass)
  const handleDownloadWalletPass = (walletType: 'apple' | 'google') => {
    setWalletAdded(true);
    const passData = {
      formatVersion: 1,
      passTypeIdentifier: "pass.ao.mpla.militante",
      serialNumber: member.membershipNo,
      teamIdentifier: "MPLA-HQ-ZA",
      organizationName: "MPLA - Partido do Trabalho",
      description: "Cartão Oficial de Militante do MPLA",
      logoText: "MPLA - SEÇÃO DE MILITÂNCIA",
      foregroundColor: "rgb(255, 255, 255)",
      backgroundColor: "rgb(200, 16, 46)",
      labelColor: "rgb(255, 204, 0)",
      generic: {
        primaryFields: [
          { key: "name", label: "MILITANTE", value: member.fullName }
        ],
        secondaryFields: [
          { key: "no", label: "Nº MILITANTE", value: member.membershipNo },
          { key: "wing", label: "ESTRUTURA", value: member.organizationWing || "Militante do MPLA" }
        ],
        auxiliaryFields: [
          { key: "committee", label: "COMITÉ LOCAL", value: member.committee || "Comité do MPLA CAPE" },
          { key: "issued", label: "EMISSÃO", value: currentTime.toLocaleDateString('pt-PT') }
        ]
      },
      barcode: {
        format: "PKBarcodeFormatQR",
        message: shareLink,
        messageEncoding: "iso-8859-1"
      }
    };

    const blob = new Blob([JSON.stringify(passData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cartao_militante_${member.membershipNo.replace(/[^a-zA-Z0-9]/g, '_')}.${walletType === 'apple' ? 'pkpass' : 'json'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setTimeout(() => {
      setWalletAdded(false);
    }, 4000);
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    showToast("Link de validação do cartão copiado!", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  // Direct High-Resolution PNG Image Export
  const handleDownloadPNG = async () => {
    const cardEl = document.getElementById(flipped ? "militant-card-back" : "militant-card-front");
    if (!cardEl) return;
    setIsExportingImage(true);
    try {
      const canvas = await html2canvas(cardEl, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff"
      });
      const imgData = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = imgData;
      a.download = `cartao_militante_${member.membershipNo.replace(/[^a-zA-Z0-9]/g, '_')}_${flipped ? 'verso' : 'frente'}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      showToast(`Imagem PNG do Cartão (${flipped ? 'Verso' : 'Frente'}) transferida com sucesso!`, "success");
    } catch (e) {
      console.error(e);
      showToast("Não foi possível gerar a imagem do cartão.", "error");
    } finally {
      setIsExportingImage(false);
    }
  };

  const handleDownloadPDF = () => {
    const todayDate = new Date().toLocaleDateString("pt-PT", {
      day: "2-digit",
      month: "long",
      year: "numeric"
    });

    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareLink)}`;
    const partyLogoUrl = new URL(LOCAL_MPLA_PARTY_LOGO, window.location.origin).href;
    const memberPhotoUrl = member.photo || FALLBACK_MEMBER_PHOTO;
    const joaoLourencoImgUrl = new URL(LOCAL_JOAO_LOURENCO_IMAGE, window.location.origin).href;
    const memberDobFormatted = member.dob ? member.dob.split("-").reverse().join("/") : "N/D";
    const memberPlaceOfBirth = member.placeOfBirth || "Luanda, Angola";
    const memberOccupation = member.occupation || "N/D";

    const pdfHtml = `
      <!DOCTYPE html>
      <html lang="pt">
        <head>
          <meta charset="UTF-8" />
          <title>Cartão Oficial de Militante - ${member.fullName} (${member.membershipNo})</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 15mm;
            }
            * {
              box-sizing: border-box;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            body {
              font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              color: #1e293b;
              background-color: #ffffff;
              margin: 0;
              padding: 0;
            }
            .header {
              display: flex;
              align-items: center;
              justify-content: space-between;
              border-bottom: 3px solid #000000;
              padding-bottom: 15px;
              margin-bottom: 25px;
            }
            .header-logo {
              display: flex;
              align-items: center;
              gap: 15px;
            }
            .header-logo img {
              height: 58px;
              width: 58px;
              object-fit: contain;
            }
            .header-title h1 {
              font-size: 22px;
              font-weight: 900;
              color: #C8102E;
              margin: 0;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .header-title h2 {
              font-size: 12px;
              font-weight: 700;
              color: #475569;
              margin: 4px 0 0 0;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .header-meta {
              text-align: right;
              font-size: 11px;
              color: #64748b;
              font-family: monospace;
            }
            .header-meta strong {
              color: #0f172a;
            }
            
            .notice-banner {
              background-color: #fef2f2;
              border: 1px solid #fecaca;
              color: #991b1b;
              padding: 10px 15px;
              border-radius: 8px;
              font-size: 11px;
              font-weight: 600;
              margin-bottom: 25px;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }

            .cards-container {
              display: flex;
              flex-direction: column;
              gap: 25px;
              align-items: center;
              margin-bottom: 30px;
            }

            .card-wrapper {
              width: 100%;
              max-width: 480px;
            }

            .card-section-title {
              font-size: 11px;
              font-weight: 800;
              text-transform: uppercase;
              letter-spacing: 1px;
              color: #475569;
              margin-bottom: 8px;
              display: flex;
              align-items: center;
              justify-content: space-between;
            }

            /* Physical Card Front Styling */
            .card-front {
              width: 100%;
              height: 280px;
              background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
              border: 3px double #cbd5e1;
              border-radius: 16px;
              padding: 16px;
              position: relative;
              box-shadow: 0 4px 12px rgba(0,0,0,0.06);
              overflow: hidden;
            }
            .card-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-bottom: 2px solid #000000;
              padding-bottom: 8px;
              margin-bottom: 12px;
            }
            .card-header-brand {
              display: flex;
              align-items: center;
              gap: 10px;
            }
            .card-header-brand img {
              height: 38px;
              width: 38px;
              object-fit: contain;
            }
            .card-header-brand div h3 {
              margin: 0;
              font-size: 15px;
              font-weight: 900;
              color: #0f172a;
              letter-spacing: 0.5px;
              line-height: 1.1;
            }
            .card-header-brand div p {
              margin: 2px 0 0 0;
              font-size: 13px;
              font-weight: 900;
              color: #C8102E;
              letter-spacing: 0.5px;
              line-height: 1.1;
            }
            .card-body {
              display: flex;
              gap: 15px;
              align-items: flex-start;
            }
            .member-photo {
              width: 90px;
              height: 120px;
              object-fit: cover;
              border-radius: 10px;
              border: 2px solid #D4AF37;
              box-shadow: 0 2px 6px rgba(0,0,0,0.1);
            }
            .member-details {
              flex: 1;
            }
            .member-name {
              font-size: 15px;
              font-weight: 900;
              color: #0f172a;
              margin: 0 0 4px 0;
              line-height: 1.2;
            }
            .member-no {
              font-size: 12px;
              font-family: monospace;
              font-weight: 800;
              color: #C8102E;
              margin-bottom: 8px;
              background: #fef2f2;
              padding: 2px 6px;
              border-radius: 4px;
              display: inline-block;
            }
            .detail-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 6px 12px;
              font-size: 10px;
            }
            .detail-item {
              display: flex;
              flex-direction: column;
            }
            .detail-label {
              font-size: 7.5px;
              font-weight: 700;
              color: #64748b;
              text-transform: uppercase;
            }
            .detail-value {
              font-size: 9.5px;
              font-weight: 700;
              color: #1e293b;
            }
            .card-footer {
              position: absolute;
              bottom: 12px;
              left: 16px;
              right: 16px;
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-top: 1px solid #e2e8f0;
              padding-top: 6px;
            }
            .barcode-box {
              font-family: monospace;
              font-size: 8px;
              color: #64748b;
            }

            /* Card Back Styling */
            .card-back {
              width: 100%;
              height: 280px;
              background-color: #ffffff;
              border: 3px double #cbd5e1;
              border-radius: 16px;
              padding: 16px;
              position: relative;
              box-shadow: 0 4px 12px rgba(0,0,0,0.06);
            }
            .mag-stripe {
              background: #1e293b;
              height: 32px;
              margin: -16px -16px 15px -16px;
              border-radius: 13px 13px 0 0;
            }
            .back-content {
              display: grid;
              grid-template-columns: 2fr 1fr;
              gap: 15px;
            }
            .back-info {
              font-size: 10px;
            }
            .sig-box {
              background: #f8fafc;
              border: 1px solid #cbd5e1;
              height: 28px;
              border-radius: 6px;
              display: flex;
              align-items: center;
              padding: 0 10px;
              font-style: italic;
              font-family: Georgia, serif;
              font-weight: bold;
              color: #334155;
              margin-top: 4px;
            }

            .official-summary {
              background: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 12px;
              padding: 16px;
              margin-top: 20px;
            }
            .summary-title {
              font-size: 11px;
              font-weight: 800;
              color: #0f172a;
              text-transform: uppercase;
              margin-bottom: 10px;
              border-bottom: 1px solid #cbd5e1;
              padding-bottom: 5px;
            }
            .summary-grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 10px;
              font-size: 10.5px;
            }

            .footer-legal {
              margin-top: 30px;
              padding-top: 15px;
              border-top: 1px solid #e2e8f0;
              display: flex;
              justify-content: space-between;
              align-items: center;
              font-size: 10px;
              color: #64748b;
            }

            .no-print-bar {
              position: fixed;
              top: 0;
              left: 0;
              right: 0;
              background: #0f172a;
              color: white;
              padding: 12px 24px;
              display: flex;
              justify-content: space-between;
              align-items: center;
              z-index: 9999;
            }
            .no-print-bar button {
              background: #C8102E;
              color: white;
              border: none;
              padding: 8px 18px;
              border-radius: 8px;
              font-weight: bold;
              cursor: pointer;
              font-size: 13px;
            }
            @media print {
              .no-print-bar {
                display: none !important;
              }
              body {
                padding-top: 0 !important;
              }
            }
          </style>
        </head>
        <body style="padding-top: 60px;">
          
          <div class="no-print-bar">
            <span><strong>MPLA CAPE</strong> — Emissão Oficial do Cartão Digital em PDF</span>
            <button onclick="window.print()">🖨️ Imprimir / Guardar como PDF</button>
          </div>

          <div class="header">
            <div class="header-logo">
              <img src="${partyLogoUrl}" alt="Logótipo MPLA" />
              <div class="header-title">
                <h1>MPLA</h1>
                <h2>Cartão de Militante • Credencial Oficial de Identificação</h2>
              </div>
            </div>
            <div class="header-meta">
              <div><strong>Nº Documento:</strong> ${member.membershipNo}</div>
              <div><strong>Data de Emissão:</strong> ${todayDate}</div>
              <div><strong>Estado:</strong> REGISTADO & ATIVO</div>
            </div>
          </div>

          <div class="notice-banner">
            <span>🛡️ Documento de Identificação Oficial de Militante do MPLA gerado e assinado digitalmente.</span>
            <span>Autenticidade Verificada</span>
          </div>

          <div class="cards-container">
            <!-- FRONT OF CARD -->
            <div class="card-wrapper">
              <div class="card-section-title">
                <span>Frente do Cartão</span>
                <span style="font-size: 9px; font-weight: normal; color: #64748b;">(Formato Padrão ISO/IEC 7810)</span>
              </div>
              <div class="card-front">
                <div class="card-header">
                  <div class="card-header-brand" style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <img src="${partyLogoUrl}" alt="MPLA" style="width: 32px; height: 32px; object-fit: contain;" />
                    </div>
                    <div style="text-align: center; flex: 1;">
                      <h3 style="font-size: 15px; font-weight: 900; color: #0f172a; margin: 0; letter-spacing: 1.5px; text-transform: uppercase; line-height: 1.1;">MPLA</h3>
                      <p style="font-size: 14px; font-weight: 900; color: #C8102E; margin: 2px 0 0 0; text-transform: uppercase; letter-spacing: 0.5px; line-height: 1.1;">Cartão do Militante</p>
                    </div>
                    <span style="font-size: 8px; font-weight: 800; background: #dcfce7; color: #166534; padding: 2px 8px; border-radius: 12px; border: 1px solid #bbf7d0;">
                      NFC & QR ATIVO
                    </span>
                  </div>
                </div>
                <div class="card-body">
                  <img src="${memberPhotoUrl}" alt="Foto do Militante" class="member-photo" onerror="this.onerror=null;this.src='${FALLBACK_MEMBER_PHOTO}';" />
                  <div class="member-details">
                    <div class="member-name">${member.fullName}</div>
                    <div class="member-no">${member.membershipNo}</div>
                    <div class="detail-grid">
                      <div class="detail-item">
                        <span class="detail-label">Nº B.I. / Passaporte</span>
                        <span class="detail-value">${member.nationalId || 'N/D'}</span>
                      </div>
                      <div class="detail-item">
                        <span class="detail-label">Data de Nascimento</span>
                        <span class="detail-value">${memberDobFormatted}</span>
                      </div>
                      <div class="detail-item">
                        <span class="detail-label">Categoria / Nível</span>
                        <span class="detail-value">${member.category} (${member.membershipLevel})</span>
                      </div>
                      <div class="detail-item">
                        <span class="detail-label">Província / Círculo</span>
                        <span class="detail-value">${member.province}</span>
                      </div>
                      <div class="detail-item">
                        <span class="detail-label">Comité Local</span>
                        <span class="detail-value">${member.committee || 'Comité do MPLA'}</span>
                      </div>
                      <div class="detail-item">
                        <span class="detail-label">Validade / Estado</span>
                        <span class="detail-value" style="color: #166534; font-weight: 800;">ATIVO (2026-2030)</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="card-footer" style="display: flex; justify-content: space-between; align-items: flex-end;">
                  <div class="barcode-box">
                    ||||| ||| ||||||| |||| ${member.id}
                  </div>
                  <div style="text-align: right;">
                    <div style="font-size: 7px; font-weight: 900; color: #0f172a; text-transform: uppercase; line-height: 1.1;">Paulo Pombolo</div>
                    <div style="font-size: 5.5px; font-weight: 800; color: #C8102E; text-transform: uppercase; font-family: monospace; line-height: 1;">Secretário Geral do MPLA</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- BACK OF CARD -->
            <div class="card-wrapper">
              <div class="card-section-title">
                <span>Verso do Cartão</span>
                <span style="font-size: 9px; font-weight: normal; color: #64748b;">(Assinatura & Dados Biográficos)</span>
              </div>
              <div class="card-back">
                <div class="mag-stripe"></div>
                <div class="back-content">
                  <div class="back-info">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: 6px;">
                      <div>
                        <span class="detail-label">Lugar de Nascimento</span>
                        <div style="font-size: 9.5px; font-weight: bold; color: #0f172a;">
                          ${memberPlaceOfBirth}
                        </div>
                      </div>
                      <div>
                        <span class="detail-label">Data de Nascimento</span>
                        <div style="font-size: 9.5px; font-weight: bold; color: #0f172a;">
                          ${memberDobFormatted}
                        </div>
                      </div>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: 6px;">
                      <div>
                        <span class="detail-label">Profissão</span>
                        <div style="font-size: 9.5px; font-weight: bold; color: #0f172a;">
                          ${memberOccupation}
                        </div>
                      </div>
                      <div>
                        <span class="detail-label">Nº B.I. / Passaporte</span>
                        <div style="font-size: 9.5px; font-family: monospace; font-weight: bold; color: #0f172a;">
                          ${member.nationalId || 'N/D'}
                        </div>
                      </div>
                    </div>

                    <div style="margin-bottom: 6px;">
                      <span class="detail-label">Contacto de Emergência</span>
                      <div style="font-size: 9.5px; font-weight: bold; color: #0f172a;">
                        ${member.emergencyContact?.name || 'Gabinete de Apoio ao Militante'}
                      </div>
                      <div style="font-size: 8.5px; font-family: monospace; color: #475569;">
                        ${member.emergencyContact?.phone || member.mobile}
                      </div>
                    </div>

                    <div>
                      <span class="detail-label">Assinatura do Militante</span>
                      <div class="sig-box">${member.fullName}</div>
                    </div>
                  </div>

                  <div style="text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: space-between; min-width: 90px;">
                    <div>
                      <span class="detail-label" style="display: block; margin-bottom: 2px;">Validação Digital</span>
                      <img src="${qrCodeUrl}" alt="QR Code" style="width: 48px; height: 48px; border: 1px solid #cbd5e1; border-radius: 6px; padding: 2px;" />
                      <span style="font-size: 5.5px; font-family: monospace; color: #64748b; display: block; margin-top: 1px;">SCAN PARA VERIFICAR</span>
                    </div>

                    <!-- João Lourenço Presidente do MPLA (without border lines, name below image) -->
                    <div style="display: flex; flex-direction: column; align-items: center; text-align: center; margin-top: 4px;">
                      <img src="${joaoLourencoImgUrl}" alt="João Lourenço" style="width: 28px; height: 32px; object-fit: contain;" />
                      <div style="margin-top: 2px;">
                        <div style="font-size: 7px; font-weight: 900; color: #0f172a; text-transform: uppercase; line-height: 1.1;">João Lourenço</div>
                        <div style="font-size: 5.5px; font-weight: 800; color: #C8102E; text-transform: uppercase; line-height: 1;">Presidente do MPLA</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="official-summary">
            <div class="summary-title">Resumo da Ficha do Militante (Central de Dados do Partido)</div>
            <div class="summary-grid">
              <div><strong>Nome Completo:</strong> ${member.fullName}</div>
              <div><strong>Nº de Cartão:</strong> ${member.membershipNo}</div>
              <div><strong>Documento B.I.:</strong> ${member.nationalId}</div>
              <div><strong>Lugar de Nascimento:</strong> ${memberPlaceOfBirth}</div>
              <div><strong>Data de Nascimento:</strong> ${memberDobFormatted}</div>
              <div><strong>Profissão:</strong> ${memberOccupation}</div>
              <div><strong>Telefone:</strong> ${member.mobile}</div>
              <div><strong>Email:</strong> ${member.email}</div>
              <div><strong>Município/Comité:</strong> ${member.municipality} / ${member.committee}</div>
              <div><strong>Quota Partidária:</strong> Regularizada (Ativo)</div>
              <div><strong>Data de Emissão PDF:</strong> ${todayDate}</div>
            </div>
          </div>

          <div class="footer-legal">
            <span>© 2026 MPLA AFRICA DO SUL. Todos os direitos reservados. Em conformidade com a Carta Constitucional.</span>
            <span>Developed by NeuroGrowth Labs <a href="https://www.neurogrowthlabs.co.za" target="_blank" style="color: #C8102E; text-decoration: none; font-weight: bold;">www.neurogrowthlabs.co.za</a> • Portal ID: M-1791641184163-SSL-2026</span>
          </div>

          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 400);
            };
          </script>
        </body>
      </html>
    `;
    safePrintHtml(pdfHtml, `Cartão Oficial - ${member.fullName}`);
    showToast("Documento de emissão do cartão preparado com sucesso!", "success");
  };

  // Physical card pipeline steps (Portuguese labels)
  const steps = [
    { key: "Submitted", label: "Submetido", icon: Clock },
    { key: "Verification", label: "Verificação", icon: Shield },
    { key: "Approved", label: "Aprovado", icon: CheckCircle },
    { key: "Printing", label: "Impressão", icon: CreditCard },
    { key: "Quality Check", label: "Controlo", icon: Shield },
    { key: "Ready for Dispatch", label: "Expedido", icon: Package },
    { key: "In Transit", label: "Em Trânsito", icon: Truck },
    { key: "Available for Collection", label: "Pronto", icon: CheckCircle },
    { key: "Collected", label: "Entregue", icon: CheckCircle },
  ];

  const currentStepIndex = steps.findIndex(s => s.key === member.physicalCardStatus);

  // Security pattern SVGs for premium government card look
  const GuillochePattern = () => (
    <svg className="absolute inset-0 w-full h-full opacity-[0.08] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="guilloche" width="60" height="60" patternUnits="userSpaceOnUse">
          <path d="M0 30 C 15 15, 45 15, 60 30 C 45 45, 15 45, 0 30 Z" fill="none" stroke="#B5121B" strokeWidth="0.4" />
          <path d="M0 30 C 15 5, 45 5, 60 30 C 45 55, 15 55, 0 30 Z" fill="none" stroke="#D4AF37" strokeWidth="0.4" />
          <circle cx="30" cy="30" r="22" fill="none" stroke="#1A1A1A" strokeWidth="0.4" strokeDasharray="1,2" />
          <path d="M30 0 L30 60 M0 30 L60 30" stroke="#B5121B" strokeWidth="0.2" opacity="0.4" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#guilloche)" />
    </svg>
  );

  const HolographicStrip = () => (
    <div className="absolute top-0 right-[22%] w-8 h-full bg-gradient-to-r from-teal-300/15 via-indigo-300/25 to-amber-300/15 opacity-85 mix-blend-color-dodge blur-[0.3px] pointer-events-none border-l border-r border-white/5 flex flex-col justify-around items-center py-4 text-[6px] text-white/40 font-mono tracking-widest uppercase select-none">
      <span>S</span>
      <span>E</span>
      <span>G</span>
      <span>U</span>
      <span>R</span>
      <span>O</span>
    </div>
  );

  // Card perspective styling to support browser-neutral 3D flip cleanly
  const cardStyle = {
    perspective: "1200px",
  };

  const cardInnerStyle = {
    transition: "transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)",
    transformStyle: "preserve-3d" as const,
    transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
  };

  const cardFaceStyle = {
    backfaceVisibility: "hidden" as const,
    WebkitBackfaceVisibility: "hidden" as const,
  };

  const cardBackFaceStyle = {
    backfaceVisibility: "hidden" as const,
    WebkitBackfaceVisibility: "hidden" as const,
    transform: "rotateY(180deg)",
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="digital-card-section">
      
      {/* Visual Digital Card */}
      <div className="lg:col-span-5 flex flex-col items-center">
        <div className="flex justify-between items-center w-full max-w-[440px] mb-4">
          <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest font-mono">
            Cartão Oficial do Militante
          </h3>
          <span className="text-[10px] bg-[#B5121B]/10 text-[#B5121B] font-mono font-bold px-2.5 py-1 rounded-full flex items-center gap-1 border border-[#B5121B]/20">
            <span className="w-1.5 h-1.5 bg-[#B5121B] rounded-full animate-ping" />
            Emissão Segura
          </span>
        </div>

        {/* 3D Premium Card Element */}
        <div 
          className="relative w-full max-w-[440px] aspect-[85.60/53.98] rounded-3xl cursor-pointer select-none group"
          style={cardStyle}
          onClick={() => setFlipped(!flipped)}
        >
          <div 
            className="absolute inset-0 w-full h-full rounded-2xl shadow-2xl transition-all duration-500"
            style={cardInnerStyle}
          >
            
            {/* FRONT SIDE */}
            <div 
              id="militant-card-front"
              className="absolute inset-0 w-full h-full p-4 flex flex-col justify-between bg-white text-[#1A1A1A] rounded-2xl border-[2px] border-slate-300 overflow-hidden shadow-xl"
              style={cardFaceStyle}
            >
              {/* Fine Microtext-inspired anti-counterfeit outer border */}
              <div className="absolute inset-1 border border-black/20 rounded-xl pointer-events-none z-10" />
              
              {/* Background Security patterns */}
              <GuillochePattern />
              <HolographicStrip />

              {/* Dynamic Real-Time Anti-Screenshot Watermark */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-[14deg] pointer-events-none z-30 select-none">
                <div className="bg-red-600/15 backdrop-blur-[1px] border border-red-500/30 px-3.5 py-1 rounded-full text-[#991b1b] font-mono font-black text-[9px] uppercase tracking-wider shadow-xs flex items-center gap-1.5 whitespace-nowrap">
                  <Shield className="w-3 h-3 text-[#C8102E] animate-pulse" />
                  ACREDITAÇÃO AO VIVO • {currentTime.toLocaleDateString('pt-PT')} {currentTime.toLocaleTimeString('pt-PT')}
                </div>
              </div>

              {/* Header section with MPLA Logo and centered title */}
              <div className="relative z-10 flex justify-between items-center border-b border-black/80 pb-1.5">
                <div className="flex items-center gap-2">
                  <img 
                    src={LOCAL_MPLA_PARTY_LOGO} 
                    alt="MPLA Logo" 
                    className="w-8 h-8 object-contain drop-shadow-2xs"
                  />
                </div>

                <div className="text-center flex-1 px-1">
                  <h2 className="text-sm sm:text-base font-display font-black tracking-widest text-[#1A1A1A] uppercase leading-tight">
                    MPLA
                  </h2>
                  <p className="text-xs sm:text-sm font-display font-black tracking-wide text-[#C8102E] uppercase mt-0.5 leading-tight">
                    Cartão do Militante
                  </p>
                </div>

                <div className="text-right">
                  <span className="px-2 py-0.5 rounded text-[8px] font-mono tracking-wider font-black bg-emerald-600 text-white border border-emerald-700 shadow-2xs">
                    ATIVO
                  </span>
                </div>
              </div>

              {/* Main Card Grid */}
              <div className="relative z-10 grid grid-cols-12 gap-2.5 items-center flex-1 my-1">
                
                {/* Photo with fine holographic seal and micro-border */}
                <div className="col-span-4 flex flex-col items-center justify-center relative">
                  <div className="relative p-0.5 bg-gradient-to-br from-[#B5121B] via-[#D4AF37] to-[#1A1A1A] rounded-lg shadow-sm">
                    <img 
                      src={member.photo || FALLBACK_MEMBER_PHOTO} 
                      alt={member.fullName} 
                      className="w-16 h-20 sm:w-18 sm:h-22 object-cover rounded-md"
                      style={{
                        objectPosition: `${member.photoPositionX ?? 50}% ${member.photoPositionY ?? 50}%`
                      }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = FALLBACK_MEMBER_PHOTO;
                      }}
                    />
                    {/* Simulated UV Overlay */}
                    <div className="absolute inset-0 bg-yellow-300/10 mix-blend-overlay pointer-events-none rounded-md" />
                  </div>
                  
                  {/* NFC Chip Indicator */}
                  <div className="absolute -bottom-1 -left-1 bg-amber-400/95 border border-[#D4AF37] w-4.5 h-3.5 rounded-xs flex flex-col justify-between p-0.5 shadow-2xs">
                    <div className="flex justify-between"><div className="w-1 h-0.5 bg-amber-900/60 rounded-full" /><div className="w-1 h-0.5 bg-amber-900/60 rounded-full" /></div>
                    <div className="h-0.5 bg-amber-900/60 w-full rounded-xs" />
                    <div className="flex justify-between"><div className="w-1 h-0.5 bg-amber-900/60 rounded-full" /><div className="w-1 h-0.5 bg-amber-900/60 rounded-full" /></div>
                  </div>
                </div>

                {/* Secure Details Layout - Aligned grid with no overlaps */}
                <div className="col-span-8 grid grid-cols-2 gap-x-2 gap-y-1 text-left">
                  <div className="col-span-2">
                    <p className="text-[6px] uppercase tracking-wider text-slate-400 font-mono font-bold leading-none">Nome do Militante</p>
                    <p className="text-[10px] sm:text-[11px] font-black text-slate-900 font-sans tracking-tight uppercase truncate mt-0.5 leading-snug">
                      {member.fullName}
                    </p>
                  </div>

                  <div className="col-span-2">
                    <p className="text-[6px] uppercase tracking-wider text-slate-400 font-mono font-bold leading-none">Nº de Cartão / Código</p>
                    <p className="text-[9px] font-mono font-black text-[#B5121B] tracking-wider mt-0.5 leading-none">
                      {member.membershipNo}
                    </p>
                  </div>

                  <div>
                    <p className="text-[6px] uppercase tracking-wider text-slate-400 font-mono font-bold leading-none">B.I. / Passaporte</p>
                    <p className="text-[8px] font-mono font-bold text-slate-800 truncate mt-0.5 leading-none">
                      {member.nationalId}
                    </p>
                  </div>

                  <div>
                    <p className="text-[6px] uppercase tracking-wider text-slate-400 font-mono font-bold leading-none">Data de Nascimento</p>
                    <p className="text-[8px] font-mono font-bold text-slate-800 truncate mt-0.5 leading-none">
                      {member.dob ? member.dob.split("-").reverse().join("/") : "N/D"}
                    </p>
                  </div>

                  <div>
                    <p className="text-[6px] uppercase tracking-wider text-slate-400 font-mono font-bold leading-none">Província Consular</p>
                    <p className="text-[8px] font-sans font-bold text-slate-800 truncate mt-0.5 leading-none">
                      {member.province}
                    </p>
                  </div>

                  <div>
                    <p className="text-[6px] uppercase tracking-wider text-slate-400 font-mono font-bold leading-none">Comité Local</p>
                    <p className="text-[8px] font-sans font-bold text-slate-800 truncate mt-0.5 leading-none">
                      {member.committee || "Comité do MPLA"}
                    </p>
                  </div>

                  <div className="col-span-2">
                    <p className="text-[6px] uppercase tracking-wider text-slate-400 font-mono font-bold leading-none">Nível / Categoria</p>
                    <p className="text-[8px] font-mono font-bold text-slate-800 uppercase truncate mt-0.5 leading-none">
                      {member.category} • {member.membershipLevel || "Standard"}
                    </p>
                  </div>
                </div>

              </div>

              {/* Footer containing Barcode, Secretary General Paulo Pombolo, and QR verification */}
              <div className="relative z-10 flex justify-between items-end border-t border-slate-200 pt-1">
                {/* Barcode representation along bottom edge */}
                <div className="flex flex-col items-start gap-0.5">
                  <div className="h-2.5 w-24 sm:w-28 bg-slate-900/10 rounded flex items-center justify-around p-0.5 overflow-hidden">
                    <div className="flex gap-[1px] items-stretch h-full w-full">
                      {[...Array(24)].map((_, i) => (
                        <div 
                          key={i} 
                          className="bg-slate-900" 
                          style={{ width: `${(i % 5 === 0 ? 2 : i % 3 === 0 ? 0.8 : 1.2)}px` }} 
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-[5px] font-mono font-bold tracking-widest text-slate-500">
                    ID-{member.id}-{member.membershipNo}
                  </p>
                </div>

                {/* Secretário Geral do MPLA Paulo Pombolo on the front of the card */}
                <div className="text-center px-1">
                  <p className="text-[6.5px] sm:text-[7px] font-black text-slate-900 uppercase tracking-tight leading-tight font-display">
                    Paulo Pombolo
                  </p>
                  <p className="text-[5px] sm:text-[5.5px] font-extrabold text-[#C8102E] uppercase font-mono tracking-tighter leading-none mt-0.5">
                    Secretário Geral do MPLA
                  </p>
                </div>

                {/* Small QR Code and Contactless Graphic */}
                <div className="flex items-center gap-1.5">
                  <div className="flex flex-col items-center">
                    <Wifi className="w-2.5 h-2.5 text-slate-400 rotate-90" />
                    <span className="text-[5px] font-mono text-slate-400 uppercase font-bold">NFC</span>
                  </div>
                  <div className="bg-white p-0.5 rounded border border-slate-300 shadow-2xs">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=50x50&data=${shareLink}`} 
                      alt="QR de Verificação" 
                      className="w-5.5 h-5.5 sm:w-6 sm:h-6"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* BACK SIDE */}
            <div 
              id="militant-card-back"
              className="absolute inset-0 w-full h-full p-4 flex flex-col justify-between bg-[#FDFDFD] text-[#1A1A1A] rounded-2xl border-[3px] border-double border-slate-300 overflow-hidden shadow-2xl"
              style={cardBackFaceStyle}
            >
              {/* Fine border */}
              <div className="absolute inset-1.5 border border-black/20 rounded-xl pointer-events-none" />
              
              <GuillochePattern />

              {/* Magnetic Strip along top */}
              <div className="absolute top-2.5 left-0 right-0 h-7 bg-gradient-to-b from-[#1A1A1A] to-slate-950" />
              
              <div className="relative z-10 pt-6 flex flex-col justify-between flex-1">
                
                <div className="grid grid-cols-12 gap-2 items-start mt-0.5">
                  
                  {/* Left Side: Biographic Data & Signature */}
                  <div className="col-span-7 space-y-1 text-left">
                    <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                      <div>
                        <p className="text-[5.5px] font-mono font-bold text-slate-400 uppercase tracking-wider leading-none">Lugar de Nascimento</p>
                        <p className="text-[7.5px] font-sans font-black text-slate-800 leading-tight truncate mt-0.5">
                          {member.placeOfBirth || "Luanda, Angola"}
                        </p>
                      </div>

                      <div>
                        <p className="text-[5.5px] font-mono font-bold text-slate-400 uppercase tracking-wider leading-none">Data de Nascimento</p>
                        <p className="text-[7.5px] font-mono font-bold text-slate-800 leading-tight truncate mt-0.5">
                          {member.dob ? member.dob.split("-").reverse().join("/") : "N/D"}
                        </p>
                      </div>

                      <div>
                        <p className="text-[5.5px] font-mono font-bold text-slate-400 uppercase tracking-wider leading-none">Profissão</p>
                        <p className="text-[7.5px] font-sans font-bold text-slate-800 leading-tight truncate mt-0.5">
                          {member.occupation || "N/D"}
                        </p>
                      </div>

                      <div>
                        <p className="text-[5.5px] font-mono font-bold text-slate-400 uppercase tracking-wider leading-none">B.I. / Passaporte</p>
                        <p className="text-[7.5px] font-mono font-bold text-slate-800 leading-tight truncate mt-0.5">
                          {member.nationalId}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-[5.5px] font-mono font-bold text-slate-400 uppercase tracking-wider leading-none">Contacto de Emergência</p>
                      <p className="text-[7.5px] font-sans font-bold text-slate-800 leading-tight truncate mt-0.5">
                        {member.emergencyContact?.name || "Contacto de Emergência"} • {member.emergencyContact?.phone || member.mobile}
                      </p>
                    </div>

                    {/* Signature Panel */}
                    <div className="space-y-0.5">
                      <label className="block text-[5px] uppercase font-mono font-bold text-slate-400 leading-none">Assinatura do Militante</label>
                      <div className="bg-slate-100/80 border border-slate-200 p-0.5 rounded-md h-4.5 flex items-center justify-center">
                        <span className="font-serif italic text-slate-700 text-[8px] select-none font-semibold truncate">
                          {member.fullName}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Side: QR Code & President João Lourenço (no border, text below image) */}
                  <div className="col-span-5 flex flex-col items-center justify-between h-full text-center space-y-1">
                    <div className="flex items-center gap-1.5 justify-center w-full">
                      <div className="bg-white p-0.5 rounded-md border border-slate-200 shadow-2xs">
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent("https://diaspora.mpla.ao/verificar")}`} 
                          alt="QR de Verificação" 
                          className="w-6.5 h-6.5 sm:w-7 sm:h-7"
                        />
                      </div>
                      <div className="text-left">
                        <p className="text-[5px] font-mono font-black text-slate-500 uppercase tracking-tight leading-tight">Validação</p>
                        <span className="text-[4px] font-mono text-slate-400 uppercase font-bold leading-none block">diaspora.mpla.ao</span>
                      </div>
                    </div>

                    {/* President of MPLA João Lourenço Portrait with name below image, no border lines */}
                    <div className="flex flex-col items-center justify-center text-center w-full pt-1">
                      <img 
                        src={LOCAL_JOAO_LOURENCO_IMAGE} 
                        alt="João Lourenço - Presidente do MPLA" 
                        className="w-7 h-8 sm:w-8 sm:h-9 object-contain object-bottom drop-shadow-xs"
                      />
                      <div className="text-center mt-0.5">
                        <p className="text-[6.5px] sm:text-[7px] font-black text-slate-900 leading-tight uppercase font-display">
                          João Lourenço
                        </p>
                        <p className="text-[4.5px] sm:text-[5px] font-extrabold text-[#C8102E] leading-none uppercase font-mono mt-0.5">
                          Presidente do MPLA
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Back Footer Area */}
                <div className="border-t border-slate-200 pt-1 flex justify-between items-center text-[5.5px] font-mono text-slate-400 font-bold">
                  <span>DIASPORA.MPLA.AO</span>
                  <span>AUTENTICAÇÃO OFICIAL</span>
                  <span>VERIFICADO</span>
                </div>

              </div>
            </div>

          </div>
        </div>

        <p className="text-[11px] text-slate-400 mt-3 text-center font-semibold italic flex items-center gap-1.5 justify-center">
          <Share2 className="w-3.5 h-3.5" />
          Clique no cartão para girar e ver o QR-Code e assinaturas.
        </p>

        {/* Quick Actions for Digital Card */}
        <div className="flex flex-col sm:flex-row gap-2 mt-4 w-full max-w-[480px]">
          <button 
            onClick={handleDownloadPDF}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 bg-[#C8102E] text-white rounded-xl text-xs font-bold hover:bg-[#a60c24] transition shadow-sm cursor-pointer"
          >
            <Printer className="w-4 h-4 text-white" />
            PDF Oficial
          </button>

          <button 
            onClick={handleDownloadPNG}
            disabled={isExportingImage}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-950" />
            {isExportingImage ? "A exportar..." : "Baixar PNG"}
          </button>
          
          <button
            onClick={() => setShowWalletModal(true)}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer border border-slate-800"
          >
            <Smartphone className="w-4 h-4 text-[#FFCC00]" />
            Wallet
          </button>

          <button 
            onClick={copyShareLink}
            className="px-3 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-200 transition shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
            title="Copiar Link de Validação"
          >
            <Share2 className="w-4 h-4 text-slate-600" />
            {copied ? "Copiado!" : "Partilhar"}
          </button>
        </div>
      </div>

      {/* Wallet Pass Modal */}
      {showWalletModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 text-white rounded-3xl p-6 max-w-md w-full border border-slate-700 shadow-2xl relative space-y-5 animate-scale-in">
            <button 
              onClick={() => setShowWalletModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#C8102E] rounded-xl flex items-center justify-center text-white shadow-md">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-white">Adicionar ao Wallet Digital</h3>
                <p className="text-xs text-slate-400">Exporte a sua credencial para Apple Wallet ou Google Wallet.</p>
              </div>
            </div>

            {/* Wallet Pass Preview Card */}
            <div className="bg-gradient-to-br from-[#C8102E] via-[#8B0000] to-[#0f172a] rounded-2xl p-4 border border-[#FFCC00]/40 shadow-xl text-white space-y-3.5 relative overflow-hidden">
              <div className="flex justify-between items-center border-b border-white/15 pb-2">
                <span className="text-[10px] font-mono font-black text-[#FFCC00] uppercase tracking-wider">PASSE DE MILITANTE • MPLA</span>
                <span className="text-[9px] font-mono bg-white/10 px-2 py-0.5 rounded text-white font-bold">OFFICIAL PASS</span>
              </div>

              <div className="flex items-center gap-3.5">
                <img 
                  src={member.photo || FALLBACK_MEMBER_PHOTO} 
                  alt="Pass avatar" 
                  className="w-14 h-16 rounded-xl object-cover border-2 border-white/40 shadow-sm"
                />
                <div>
                  <p className="text-sm font-black text-white leading-tight">{member.fullName}</p>
                  <p className="text-xs font-mono text-[#FFCC00] font-bold mt-0.5">{member.membershipNo}</p>
                  <span className="inline-block mt-1 text-[10px] bg-white/15 px-2 py-0.5 rounded font-mono font-bold text-slate-200">
                    {member.organizationWing || "Militante do MPLA"}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-white/15 flex justify-between items-center text-[9.5px] font-mono text-slate-300">
                <span>COMITÉ: {member.committee || "CAPE TOWN"}</span>
                <span>DATA: {currentTime.toLocaleDateString('pt-PT')}</span>
              </div>
            </div>

            {/* Export Buttons */}
            <div className="space-y-2.5 pt-1">
              <button
                onClick={() => handleDownloadWalletPass('apple')}
                className="w-full py-3 px-4 bg-white hover:bg-slate-100 text-slate-900 rounded-xl text-xs font-bold cursor-pointer transition flex items-center justify-center gap-2 shadow-sm"
              >
                <span className="font-black text-base"></span> Adicionar ao Apple Wallet (.pkpass)
              </button>

              <button
                onClick={() => handleDownloadWalletPass('google')}
                className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold cursor-pointer transition flex items-center justify-center gap-2 border border-slate-700 shadow-sm"
              >
                <span className="font-black text-amber-400 text-base">G</span> Guardar no Google Wallet
              </button>
            </div>

            {walletAdded && (
              <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fade-in">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                Passe exportado com sucesso! O descarregamento do ficheiro foi concluído.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Physical Card Delivery Tracker */}
      <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start mb-4 border-b border-slate-100 pb-3">
            <div>
              <h4 className="font-display font-extrabold text-slate-900 text-sm">Estado do Cartão Físico</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">Acompanhe a produção e logística de entrega do seu cartão oficial.</p>
            </div>
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-50 border border-red-100 rounded-full text-[10px] font-mono font-bold text-[#B5121B] uppercase shrink-0">
              <CreditCard className="w-3.5 h-3.5" />
              EST: 4 DIAS ÚTEIS
            </span>
          </div>

          {/* Desktop/Mobile Status Pipeline */}
          <div className="relative mt-8 mb-6 pl-6 border-l-2 border-slate-100 space-y-6 md:space-y-0 md:border-l-0 md:border-t-2 md:border-slate-100 md:flex md:justify-between md:pl-0 md:pt-6">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const isPast = index < currentStepIndex;
              const isCurrent = index === currentStepIndex;

              return (
                <div key={step.key} className="relative flex items-center md:flex-col md:text-center md:flex-1">
                  {/* Point Marker */}
                  <div className={`absolute -left-[31px] md:relative md:left-0 md:-top-[34px] w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                    isPast ? "bg-[#B5121B] border-[#B5121B]" :
                    isCurrent ? "bg-[#B5121B] border-[#B5121B] scale-125 shadow-md shadow-red-200 ring-2 ring-[#B5121B] animate-pulse" :
                    "bg-white border-slate-200"
                  }`}>
                    {isPast && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                    {isCurrent && <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />}
                  </div>

                  {/* Icon & Label */}
                  <div className="flex items-center gap-3 md:flex-col md:gap-1 pl-4 md:pl-0 mt-[-4px] md:mt-0">
                    <StepIcon className={`w-4 h-4 ${
                      isCurrent ? "text-[#B5121B] font-bold animate-bounce" :
                      isPast ? "text-slate-600" : "text-slate-300"
                    }`} />
                    <p className={`text-[10px] leading-tight font-bold ${
                      isCurrent ? "text-[#B5121B]" :
                      isPast ? "text-slate-700" : "text-slate-400"
                    }`}>
                      {step.label}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detailed status summary */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mt-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-red-50 text-[#B5121B] rounded-lg mt-0.5">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">
                Etapa de Logística Actual: {steps[currentStepIndex]?.label || member.physicalCardStatus}
              </p>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                {member.physicalCardStatus === "Submitted" && "O seu pedido de segunda via foi registado na base de dados. O secretário de verificação local irá autenticar os seus dados de identificação nacional."}
                {member.physicalCardStatus === "Verification" && "A sua ficha oficial de filiação partidária está sob auditoria da delegação provincial do comité nacional do partido."}
                {member.physicalCardStatus === "Approved" && "Parabéns, a sua conta foi verificada com sucesso. Os dados criptográficos do chip foram exportados para o centro nacional emissor."}
                {member.physicalCardStatus === "Printing" && "O seu cartão físico entrou em processo de gravação física. A impressora central emitiu a requisição de cunho holográfico."}
                {member.physicalCardStatus === "Quality Check" && "O cartão já foi emitido e encontra-se na fase final de controlo de integridade magnética, gravação de chips e autenticação de holograma de segurança."}
                {member.physicalCardStatus === "Ready for Dispatch" && "O cartão passou todos os testes de segurança. Foi selado em envelope blindado de transporte e encaminhado para os correios expressos."}
                {member.physicalCardStatus === "In Transit" && "O seu lote de identificação oficial de militante encontra-se em trânsito logístico internacional da central emissora para o Comité de Círculo Local."}
                {member.physicalCardStatus === "Available for Collection" && "O seu cartão físico de membro já está disponível para levantamento presencial no secretariado do Comité do MPLA CAPE. Por favor, apresente o seu B.I. ou documento de identificação física."}
                {member.physicalCardStatus === "Collected" && "Excelente! Confirmou presencialmente a receção oficial e activação do seu cartão físico de membro. Obrigado pela sua participação democrática!"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
