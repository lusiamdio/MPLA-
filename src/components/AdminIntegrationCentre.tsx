import React, { useState, useEffect } from "react";
import { 
  Network, CheckCircle, Link2, Settings, Activity, Wifi, RefreshCw, Play, 
  Fingerprint, MessageSquare, Mail, CreditCard, QrCode, HardDrive, MapPin, 
  Layers2, Users2, BarChart, AlertCircle, ShieldAlert, Cpu, DollarSign
} from "lucide-react";

export default function AdminIntegrationCentre() {
  const [integrations, setIntegrations] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [testingKey, setTestingKey] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ [key: string]: string }>({});
  const [saving, setSaving] = useState(false);

  // Load integrations from backend
  const fetchIntegrations = async () => {
    try {
      const res = await fetch("/api/system/integrations");
      if (res.ok) {
        const data = await res.json();
        setIntegrations(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIntegrations();
  }, []);

  // Update integration state on the backend
  const handleUpdateIntegration = async (updatedData: any) => {
    setSaving(true);
    try {
      const res = await fetch("/api/system/integrations", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData)
      });
      if (res.ok) {
        const data = await res.json();
        setIntegrations(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleChange = (key: string) => {
    const updated = {
      ...integrations,
      [key]: {
        ...integrations[key],
        enabled: !integrations[key].enabled
      }
    };
    setIntegrations(updated);
    handleUpdateIntegration(updated);
  };

  const handleFieldChange = (key: string, field: string, value: string) => {
    setIntegrations({
      ...integrations,
      [key]: {
        ...integrations[key],
        [field]: value
      }
    });
  };

  const handleSaveField = (key: string) => {
    handleUpdateIntegration(integrations);
  };

  // Test integration connection invoking server ping endpoint
  const testConnection = async (key: string) => {
    setTestingKey(key);
    try {
      const res = await fetch("/api/system/test-integration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key,
          provider: integrations[key].provider
        })
      });
      if (res.ok) {
        const data = await res.json();
        setTestResult(prev => ({
          ...prev,
          [key]: data.message
        }));
      }
    } catch (e) {
      console.error(e);
      setTestResult(prev => ({
        ...prev,
        [key]: "Comunicação com o Gateway falhou. Verifique as credenciais e firewalls de rede."
      }));
    } finally {
      setTestingKey(null);
    }
  };

  if (loading || !integrations) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-400 space-y-3">
        <RefreshCw className="w-8 h-8 text-[#D3122A] animate-spin" />
        <p className="text-xs font-mono font-bold uppercase tracking-wider">A carregar estado dos gateways de integração...</p>
      </div>
    );
  }

  // Configurations mapping for UI Cards
  const integrationSchema = [
    {
      key: "supabase",
      label: "Supabase Base de Dados & Autenticação",
      icon: HardDrive,
      description: "Infraestrutura de nuvem, autenticação de utilizadores e base de dados relacional para o MPLA Cape Town.",
      fields: [
        { label: "Nome do Projecto", name: "projectName", type: "text" },
        { label: "ID do Projecto", name: "projectId", type: "text" },
        { label: "URL Endpoint Supabase", name: "url", type: "text" },
        { label: "Publishable Key", name: "publishableKey", type: "text" },
        { label: "Anon Key / JWT", name: "anonKey", type: "password" }
      ]
    },
    {
      key: "nationalIdVerification",
      label: "Verificação de B.I. / Passaporte",
      icon: Fingerprint,
      description: "Ponte direta de verificação com o Registo de Identidade Civil do Estado.",
      fields: [
        { label: "Nome do Fornecedor de API", name: "provider", type: "text" },
        { label: "URL Endpoint do Gateway Seguro", name: "endpoint", type: "text" },
        { label: "Chave Privada de Autorização API", name: "apiKey", type: "password" }
      ]
    },
    {
      key: "smsProvider",
      label: "Gateway de SMS Móvel",
      icon: MessageSquare,
      description: "Envia códigos OTP de segurança e notificações de entrega aos militantes por SMS.",
      fields: [
        { label: "Fornecedor de SMS", name: "provider", type: "text" },
        { label: "Identificador de Remetente (Alfa-numérico)", name: "senderId", type: "text" },
        { label: "Chave de Acesso / Account SID", name: "apiKey", type: "text" },
        { label: "Chave Secreta de Autorização API", name: "apiSecret", type: "password" }
      ]
    },
    {
      key: "emailService",
      label: "Serviço de E-mail SMTP & Transacional",
      icon: Mail,
      description: "Sequências automáticas de e-mail de verificação HTML e certificados de militância.",
      fields: [
        { label: "Fornecedor de E-mail", name: "provider", type: "text" },
        { label: "Servidor Relay SMTP", name: "host", type: "text" },
        { label: "Porta", name: "port", type: "number" },
        { label: "Utilizador de Autenticação", name: "username", type: "text" },
        { label: "Palavra-passe de Acesso", name: "password", type: "password" }
      ]
    },
    {
      key: "paymentGateway",
      label: "Gateway de Pagamento de Quotas",
      icon: CreditCard,
      description: "Processa pagamentos digitais, renovações de quotas e contribuições de militantes.",
      fields: [
        { label: "Processador de Pagamentos", name: "provider", type: "text" },
        { label: "ID do Comerciante / Merchant ID", name: "merchantId", type: "text" },
        { label: "Chave de Encriptação Privada", name: "secretKey", type: "password" }
      ]
    },
    {
      key: "qrVerification",
      label: "Verificação de Tokens QR",
      icon: QrCode,
      description: "Permite que os delegados verifiquem a autenticidade dos cartões digitais por código QR.",
      fields: [
        { label: "Motor de Validação", name: "provider", type: "text" },
        { label: "URL do Webhook de Validação", name: "validationEndpoint", type: "text" }
      ]
    },
    {
      key: "cloudStorage",
      label: "Armazenamento na Nuvem Encriptado",
      icon: HardDrive,
      description: "Armazena em segurança documentos de identificação, fotos de perfil e comprovativos.",
      fields: [
        { label: "Provedor de Nuvem", name: "provider", type: "text" },
        { label: "Nome do Bucket Seguro", name: "bucketName", type: "text" },
        { label: "Região do Servidor", name: "region", type: "text" }
      ]
    },
    {
      key: "gisMapping",
      label: "Motor Geográfico e Mapeamento GIS",
      icon: MapPin,
      description: "Utiliza coordenadas para associar automaticamente os militantes aos seus comités.",
      fields: [
        { label: "Fornecedor de Dados Geográficos", name: "provider", type: "text" },
        { label: "Chave da API de Mapas", name: "mapsApiKey", type: "password" }
      ]
    },
    {
      key: "erpSystem",
      label: "Sincronização com Sistema Financeiro ERP",
      icon: Layers2,
      description: "Sincroniza receitas de quotas com sistemas financeiros centrais.",
      fields: [
        { label: "Sistema ERP Corporativo", name: "provider", type: "text" },
        { label: "URL do Webhook de Sincronização", name: "endpointUrl", type: "text" }
      ]
    },
    {
      key: "crmSystem",
      label: "Integração CRM de Comunicação",
      icon: Users2,
      description: "Sincroniza dados de engajamento e perfis de contacto com plataformas de campanha.",
      fields: [
        { label: "Plataforma CRM", name: "provider", type: "text" },
        { label: "Chave Client ID da Aplicação", name: "clientId", type: "text" }
      ]
    },
    {
      key: "biPlatform",
      label: "Plataforma de Relatórios BI",
      icon: BarChart,
      description: "Fornece métricas e estatísticas demográficas para relatórios executivos.",
      fields: [
        { label: "Suíte de Visualização BI", name: "provider", type: "text" },
        { label: "Link do Painel Embutido", name: "dashboardUrl", type: "text" }
      ]
    },
    {
      key: "openRouter",
      label: "OpenRouter Gateway de IA",
      icon: Cpu,
      description: "Gateway unificado de modelos de Inteligência Artificial para análise estratégica.",
      fields: [
        { label: "Gateway de IA", name: "provider", type: "text" },
        { label: "Chave API Secreta OpenRouter", name: "apiKey", type: "password" },
        { label: "Estado do Serviço", name: "status", type: "text" }
      ]
    },
    {
      key: "whopPayment",
      label: "Whop Digital Payments & Subscriptions",
      icon: DollarSign,
      description: "Processamento de pagamentos digitais, quotas e assinaturas corporativas da empresa.",
      fields: [
        { label: "Provedor de Pagamentos", name: "provider", type: "text" },
        { label: "Chave API Secreta Whop", name: "apiKey", type: "password" },
        { label: "Empresa Autenticada", name: "status", type: "text" }
      ]
    },
    {
      key: "absaPay",
      label: "Absa Open Banking & Absa Pay Gateway",
      icon: CreditCard,
      description: "API bancária aberta oficial do Absa Bank para liquidação Instant EFT, SureCheck e Débito Automático DebiCheck.",
      fields: [
        { label: "Fornecedor / API Standard", name: "provider", type: "text" },
        { label: "Endpoint Absa Gateway", name: "endpoint", type: "text" },
        { label: "Absa Client ID", name: "clientId", type: "text" },
        { label: "Absa Client Secret", name: "clientSecret", type: "password" },
        { label: "Conta Beneficiária (MPLA SA)", name: "merchantAccountNumber", type: "text" }
      ]
    }
  ];

  return (
    <div className="space-y-6" id="integration-centre">
      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-display font-extrabold text-slate-900 flex items-center gap-2">
            <Network className="w-6 h-6 text-[#D3122A] animate-pulse" />
            Centro de Integrações & Serviços Externos
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Configure credenciais para gateways de pagamento, envio de SMS, e-mails, validações biométricas e serviços na nuvem.
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 font-mono font-bold text-[10px] rounded-lg tracking-wider uppercase">
          <Wifi className="w-3.5 h-3.5" />
          Serviços: 100% Operacionais
        </div>
      </div>

      {/* SYSTEM TOPOLOGY GRAPHICS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-900 text-white p-6 rounded-xl border border-slate-950 shadow-md">
        <div className="lg:col-span-8 space-y-4">
          <div>
            <span className="text-[9px] uppercase tracking-widest font-mono font-bold text-red-400">Diagrama da Arquitetura</span>
            <h3 className="font-display font-bold text-sm text-slate-100">Topologia de Integrações Sincronizadas</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              O servidor do partido encaminha tarefas de forma assíncrona para serviços externos autorizados. Encriptação TLS ativa em todas as transmissões.
            </p>
          </div>

          {/* Visual topology connector lines */}
          <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 flex flex-wrap justify-center items-center gap-4 py-8">
            <div className="px-3 py-2 bg-slate-900 border border-slate-700 rounded text-[10px] font-mono text-center font-bold">
              <Fingerprint className="w-4 h-4 mx-auto mb-1 text-red-400" />
              API Registo Civil
            </div>
            <span className="text-slate-600 font-mono">──</span>
            <div className="px-4 py-3 bg-[#D3122A] border-red-500 rounded text-xs text-center font-extrabold shadow-md shadow-red-500/20">
              <Activity className="w-5 h-5 mx-auto mb-1 text-white animate-pulse" />
              Nó Central do Partido
            </div>
            <span className="text-slate-600 font-mono">──</span>
            <div className="px-3 py-2 bg-slate-900 border border-slate-700 rounded text-[10px] font-mono text-center font-bold">
              <Mail className="w-4 h-4 mx-auto mb-1 text-yellow-400" />
              Servidor SMTP
            </div>
            <div className="w-full flex justify-center mt-2">
              <div className="flex flex-col items-center">
                <span className="text-slate-600 font-mono text-xs">│</span>
                <div className="px-3 py-2 bg-slate-900 border border-slate-700 rounded text-[10px] font-mono text-center font-bold inline-block">
                  <CreditCard className="w-4 h-4 mx-auto mb-1 text-emerald-400" />
                  Gateway de Quotas
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 bg-slate-950/50 p-4 rounded-lg border border-slate-800/80 space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider font-mono text-slate-300">Registo de Tráfego API em Tempo Real</h4>
            <div className="space-y-1.5 font-mono text-[10px] text-slate-400 leading-normal">
              <p className="text-green-400">⚡ [09:12] Verificação de B.I.: CONFIRMADO (960312508...)</p>
              <p className="text-slate-500">📥 [10:45] Envio de SMS concluído via Twilio S2</p>
              <p className="text-slate-500">📎 [11:15] Foto de perfil enviada para o servidor na nuvem</p>
              <p className="text-slate-500">💳 [12:30] Webhook recebido: Renovação de quota de militante</p>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-[11px] text-slate-500 font-mono">
            <span>Latência Média</span>
            <span className="text-red-400 font-bold">14ms (Excelente)</span>
          </div>
        </div>
      </div>

      {/* CORE INTEGRATIONS MANAGEMENT CARDS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {integrationSchema.map((item) => {
          const config = integrations[item.key] || { enabled: false, provider: "" };
          const isEnabled = config.enabled;
          const pingResult = testResult[item.key];
          
          return (
            <div 
              key={item.key} 
              className={`bg-white rounded-xl border p-6 space-y-5 transition shadow-xs hover:shadow-sm ${
                isEnabled ? "border-red-200" : "border-slate-200"
              }`}
            >
              {/* Header block with switch */}
              <div className="flex justify-between items-start gap-4">
                <div className="flex gap-3">
                  <div className={`p-2.5 rounded-lg ${
                    isEnabled ? "bg-red-50 text-[#D3122A]" : "bg-slate-100 text-slate-400"
                  }`}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                      {item.label}
                      {isEnabled ? (
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                      ) : (
                        <span className="w-1.5 h-1.5 bg-slate-300 rounded-full" />
                      )}
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{item.description}</p>
                  </div>
                </div>

                {/* iOS Style Custom Toggle Switch */}
                <button
                  onClick={() => handleToggleChange(item.key)}
                  className={`w-11 h-6 rounded-full transition-colors relative shrink-0 cursor-pointer ${
                    isEnabled ? "bg-[#D3122A]" : "bg-slate-200"
                  }`}
                >
                  <span 
                    className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform shadow-xs ${
                      isEnabled ? "translate-x-5.5" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>

              {/* Form Config Fields */}
              {isEnabled ? (
                <div className="space-y-3 pt-2">
                  <div className="grid grid-cols-1 gap-3.5">
                    {item.fields.map((fld) => (
                      <div key={fld.name} className="space-y-1">
                        <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-extrabold">
                          {fld.label}
                        </label>
                        <input
                          type={fld.type}
                          value={config[fld.name] || ""}
                          onChange={(e) => handleFieldChange(item.key, fld.name, e.target.value)}
                          onBlur={() => handleSaveField(item.key)}
                          placeholder={`Introduza ${fld.label.toLowerCase()}`}
                          className="w-full text-xs font-mono px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-[#D3122A] outline-none"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Test button & Ping feedback */}
                  <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <button
                      onClick={() => testConnection(item.key)}
                      disabled={testingKey !== null}
                      className="px-4 py-2 bg-slate-900 text-white font-bold text-[10px] rounded-lg tracking-wider uppercase hover:bg-slate-800 disabled:bg-slate-100 disabled:text-slate-400 transition cursor-pointer flex items-center gap-1.5"
                    >
                      {testingKey === item.key ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Play className="w-3.5 h-3.5" />
                      )}
                      Testar Conexão do Serviço
                    </button>
                    {saving && (
                      <span className="text-[10px] font-mono font-bold text-[#D3122A] animate-pulse">
                        ● A guardar alterações...
                      </span>
                    )}
                  </div>

                  {pingResult && (
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-[10px] text-slate-600 leading-normal font-mono relative">
                      <p>{pingResult}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 bg-slate-50/50 border border-dashed border-slate-200 rounded-lg text-center text-xs text-slate-400 font-mono">
                  Gateway Desativado. Ative a caixa acima para configurar credenciais e testar conexões.
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
