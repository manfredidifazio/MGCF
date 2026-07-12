import { useEffect, useMemo, useRef, useState } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { ArrowDownCircle, ArrowUpCircle, Calculator, CheckSquare, PieChart, TrendingUp } from "lucide-react";

import Logo from "../../components/ui/Logo";
import { getAccounts } from "../../services/accountService";
import { getAccountStatements } from "../../services/accountStatementService";
import { getAccredits } from "../../services/accreditService";

const currency = new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" });
const monthLabels = [
  "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
  "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre",
];

function parseAmount(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value !== "string") return 0;
  const trimmed = value.trim();
  if (!trimmed) return 0;

  let normalized = trimmed;
  if (trimmed.includes(",")) {
    normalized = trimmed.replace(/\./g, "").replace(",", ".");
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function periodKey(year, month, accountId) {
  return `${year}-${month}-${accountId}`;
}

function formatDate(date) {
  return new Intl.DateTimeFormat("it-IT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function formatGeneratedDate(date) {
  const day = String(date.getDate()).padStart(2, "0");
  const monthName = monthLabels[date.getMonth()]?.toUpperCase() ?? "";
  return `${day}/${monthName}/${date.getFullYear()}`;
}

function monthLabel(monthKey) {
  return monthLabels[Number(monthKey) - 1] ?? monthKey;
}

function tableAmount(value) {
  if (value == null || value === 0) return "-";
  return currency.format(value);
}

function PrintMetric({ label, value, tone, Icon, numericValue }) {
  const toneClass =
    tone === "yellow"
      ? "bg-amber-400 text-amber-950"
      : tone === "red"
        ? "bg-red-600 text-white"
        : tone === "blue"
          ? "bg-blue-500 text-white"
          : "bg-emerald-600 text-white";

  const valueClass = Number(numericValue) < 0 ? "text-red-600" : "";

  return (
    <div className={`grid grid-cols-[52px_1fr] rounded-none ${toneClass}`}>
      <div className="flex items-center justify-center bg-white/15">
        <Icon className="h-7 w-7" strokeWidth={2.2} />
      </div>
      <div className="px-3 py-2.5 text-center">
        <div className="text-[10px] font-semibold uppercase tracking-wide opacity-90">{label}</div>
        <div className={`mt-1 text-base font-bold leading-tight ${valueClass}`}>{value}</div>
      </div>
    </div>
  );
}

function SectionTitle({ title, tone, Icon }) {
  const textClass =
    tone === "rose"
      ? "text-rose-700"
      : tone === "sky"
        ? "text-sky-700"
        : "text-emerald-700";

  return (
    <div className="flex items-center gap-3">
      <div className={`flex h-10 w-10 items-center justify-center bg-white/80 ${textClass}`}>
        <Icon className="h-6 w-6" strokeWidth={2.2} />
      </div>
      <div className={`text-base font-semibold uppercase tracking-wide ${textClass}`}>{title}</div>
    </div>
  );
}

function downloadPdfFile(pdf, fileName) {
  const blob = pdf.output("blob");
  const blobUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
}

async function captureReportCanvas(card) {
  const width = Math.max(card.scrollWidth || 0, card.offsetWidth || 0, 1120);
  const height = Math.max(card.scrollHeight || 0, card.offsetHeight || 0, 800);
  const maxPixels = 12000000;
  const baseScale = Math.min(2, Math.sqrt(maxPixels / (width * height)));
  const candidateScales = [baseScale, 1.5, 1.2, 1].filter((scale, index, list) => scale > 0.75 && list.indexOf(scale) === index);

  let lastError = null;

  for (const scale of candidateScales) {
    try {
      const canvas = await html2canvas(card, {
        scale,
        backgroundColor: "#ffffff",
        useCORS: true,
        logging: false,
        windowWidth: width,
        windowHeight: height,
      });
      return canvas;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError ?? new Error("Impossibile creare il canvas del report");
}

function getCanvasImageData(canvas) {
  try {
    return { data: canvas.toDataURL("image/png", 1.0), format: "PNG" };
  } catch (pngError) {
    try {
      return { data: canvas.toDataURL("image/jpeg", 0.92), format: "JPEG" };
    } catch (jpegError) {
      console.warn("Impossibile convertire il canvas in immagine", jpegError ?? pngError);
      return null;
    }
  }
}

export default function ResocontoContabilePrintPage() {
  const [accounts, setAccounts] = useState([]);
  const [accredits, setAccredits] = useState([]);
  const [statements, setStatements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [headerSnapshot, setHeaderSnapshot] = useState(null);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [exportError, setExportError] = useState("");
  const reportCardRef = useRef(null);

  useEffect(() => {
    let active = true;

    Promise.all([getAccounts(), getAccredits(), getAccountStatements()])
      .then(([accountData, accreditData, statementData]) => {
        if (!active) return;
        setAccounts(accountData);
        setAccredits(accreditData);
        setStatements(statementData);
      })
      .catch((error) => {
        if (!active) return;
        setMessage(error.response?.data?.message ?? "Impossibile caricare il resoconto contabile.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const accountColumns = useMemo(() => {
    const map = new Map();

    accounts.forEach((account) => {
      map.set(String(account.id), { id: account.id, name: account.name, color: account.color });
    });

    accredits.forEach((item) => {
      const key = String(item.accountId ?? "");
      if (!key || map.has(key)) return;
      map.set(key, { id: item.accountId, name: item.accountName ?? `Conto ${key}`, color: item.accountColor ?? "#64748b" });
    });

    statements.forEach((item) => {
      const key = String(item.accountId ?? "");
      if (!key || map.has(key)) return;
      map.set(key, { id: item.accountId, name: item.accountName ?? `Conto ${key}`, color: item.accountColor ?? "#64748b" });
    });

    return [...map.values()].sort((first, second) => String(first.name).localeCompare(String(second.name), "it"));
  }, [accounts, accredits, statements]);

  const periods = useMemo(() => {
    return [...new Set([
      ...accredits.map((item) => String(item.movementDate).slice(0, 7)),
      ...statements.map((item) => String(item.period).slice(0, 7)),
    ].filter(Boolean))].sort((first, second) => String(second).localeCompare(String(first)));
  }, [accredits, statements]);

  const availableYears = useMemo(() => {
    return [...new Set(periods.map((period) => period.slice(0, 4)).filter(Boolean))].sort((first, second) => Number(second) - Number(first));
  }, [periods]);

  const monthsForSelectedYear = useMemo(() => {
    if (!selectedYear) return [];
    return periods.filter((period) => period.startsWith(selectedYear)).map((period) => period.slice(5, 7));
  }, [periods, selectedYear]);

  useEffect(() => {
    if (!periods.length) return;
    if (selectedYear && selectedMonth) return;

    const latestPeriod = periods[0];
    const latestYear = latestPeriod.slice(0, 4);
    const latestMonth = latestPeriod.slice(5, 7);

    setSelectedYear((current) => current || latestYear);
    setSelectedMonth((current) => current || latestMonth);
  }, [periods, selectedMonth, selectedYear]);

  useEffect(() => {
    if (!selectedYear) return;
    if (selectedMonth && monthsForSelectedYear.includes(selectedMonth)) return;
    setSelectedMonth(monthsForSelectedYear[0] ?? "");
  }, [monthsForSelectedYear, selectedMonth, selectedYear]);

  const currentPeriod = selectedYear && selectedMonth ? `${selectedYear}-${selectedMonth}` : "";

  useEffect(() => {
    if (!currentPeriod) {
      setHeaderSnapshot(null);
      return;
    }

    const [year, month] = currentPeriod.split("-");
    setHeaderSnapshot((current) => {
      if (current?.period === currentPeriod) return current;
      return { period: currentPeriod, year, month, generatedAt: new Date() };
    });
  }, [currentPeriod]);

  const currentPeriodAccredits = useMemo(() => {
    if (!currentPeriod) return [];
    return accredits
      .filter((item) => String(item.movementDate).slice(0, 7) === currentPeriod)
      .sort((first, second) => String(first.movementDate).localeCompare(String(second.movementDate)) || Number(first.id ?? 0) - Number(second.id ?? 0));
  }, [accredits, currentPeriod]);

  const statementRevenueByPeriod = useMemo(() => {
    const map = {};

    statements.forEach((item) => {
      const period = String(item.period).slice(0, 7);
      const year = period.slice(0, 4);
      const month = period.slice(5, 7);
      const accountId = String(item.accountId ?? "");
      if (!year || !month || !accountId) return;

      const currentBalance = parseAmount(item.currentBalance);
      const previousBalance = parseAmount(item.previousBalance);
      map[periodKey(year, month, accountId)] = currentBalance - previousBalance;
    });

    return map;
  }, [statements]);

  const accreditsByPeriod = useMemo(() => {
    const map = {};

    accredits.forEach((item) => {
      const movementDate = String(item.movementDate);
      const year = movementDate.slice(0, 4);
      const month = movementDate.slice(5, 7);
      const accountId = String(item.accountId ?? "");
      if (!year || !month || !accountId) return;
      const key = periodKey(year, month, accountId);
      map[key] = (map[key] ?? 0) + parseAmount(item.amount);
    });

    return map;
  }, [accredits]);

  const monthData = useMemo(() => {
    const byAccount = {};
    let income = 0;
    let net = 0;
    let saldo = 0;

    accountColumns.forEach((account) => {
      const accountKey = String(account.id);
      const key = periodKey(currentPeriod.slice(0, 4), currentPeriod.slice(5, 7), accountKey);
      const accountRevenue = statementRevenueByPeriod[key];
      const accountAccredits = accreditsByPeriod[key] ?? 0;
      const statement = statements.find((item) => String(item.accountId) === accountKey && String(item.period).slice(0, 7) === currentPeriod);
      const currentBalance = statement ? parseAmount(statement.currentBalance) : null;

      if (currentBalance != null) {
        saldo += currentBalance;
      }
      income += accountAccredits;

      if (accountRevenue === undefined) {
        byAccount[accountKey] = { currentBalance, revenue: null, credits: accountAccredits, count: 0 };
        return;
      }

      net += accountRevenue;
      byAccount[accountKey] = {
        currentBalance,
        revenue: accountRevenue,
        credits: accountAccredits,
        count: currentPeriodAccredits.filter((item) => String(item.accountId) === accountKey).length,
      };
    });

    return {
      byAccount,
      income,
      net,
      expense: income - net,
      saldo,
      totalCredits: currentPeriodAccredits.length,
    };
  }, [accountColumns, accreditsByPeriod, currentPeriod, currentPeriodAccredits, statements, statementRevenueByPeriod]);

  const generatedDate = useMemo(() => {
    if (!headerSnapshot?.generatedAt) return "";
    return formatGeneratedDate(headerSnapshot.generatedAt);
  }, [headerSnapshot]);

  const periodRange = useMemo(() => {
    if (!headerSnapshot?.period) return "";
    const [year, month] = headerSnapshot.period.split("-");
    const start = new Date(Number(year), Number(month) - 1, 1);
    const end = new Date(Number(year), Number(month), 0);
    return `${formatDate(start)} - ${formatDate(end)}`;
  }, [headerSnapshot]);

  const handlePrint = async () => {
    if (!currentPeriod || exportingPdf) return;
    const [year, month] = currentPeriod.split("-");
    setHeaderSnapshot({ period: currentPeriod, year, month, generatedAt: new Date() });
    setExportError("");

    try {
      setExportingPdf(true);
      await new Promise((resolve) => window.setTimeout(resolve, 60));
      if (document.fonts?.ready) {
        await document.fonts.ready.catch(() => undefined);
      }

      const card = reportCardRef.current;
      if (!card) {
        throw new Error("Anteprima non disponibile");
      }

      const canvas = await captureReportCanvas(card);
      const fileName = `resoconto-contabile-${currentPeriod}.pdf`;

      // Stable path: export on A4 by slicing the canvas page-by-page.
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const pageCanvasHeightPx = Math.max(1, Math.floor((canvas.width * pageHeight) / pageWidth));
      let startY = 0;
      let pageIndex = 0;

      while (startY < canvas.height) {
        const sliceHeight = Math.min(pageCanvasHeightPx, canvas.height - startY);
        const sliceCanvas = document.createElement("canvas");
        sliceCanvas.width = canvas.width;
        sliceCanvas.height = sliceHeight;

        const ctx = sliceCanvas.getContext("2d");
        if (!ctx) {
          throw new Error("Impossibile preparare una pagina PDF");
        }

        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
        ctx.drawImage(canvas, 0, startY, canvas.width, sliceHeight, 0, 0, canvas.width, sliceHeight);

        const imagePayload = getCanvasImageData(sliceCanvas);
        if (!imagePayload) {
          throw new Error("Conversione canvas non disponibile nel browser corrente");
        }
        const { data: imageData, format: imageFormat } = imagePayload;

        const sliceHeightMm = (sliceHeight * pageWidth) / canvas.width;

        if (pageIndex > 0) {
          pdf.addPage();
        }
        pdf.addImage(imageData, imageFormat, 0, 0, pageWidth, sliceHeightMm, undefined, "FAST");

        startY += sliceHeight;
        pageIndex += 1;
      }

      downloadPdfFile(pdf, fileName);
    } catch (error) {
      console.error("Errore generazione PDF", error);
      try {
        window.print();
        setExportError(`Export PDF non disponibile (${error?.message ?? "errore sconosciuto"}). Aperta la stampa standard.`);
      } catch {
        setExportError(`Impossibile generare il PDF (${error?.message ?? "errore sconosciuto"}).`);
      }
    } finally {
      setExportingPdf(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-100 px-6 py-10 text-slate-500">Caricamento anteprima stampa...</div>;
  }

  if (message) {
    return <div className="min-h-screen bg-slate-100 px-6 py-10 text-red-600">{message}</div>;
  }

  const year = headerSnapshot?.year ?? "";
  const month = headerSnapshot?.month ?? "";
  const totalBalance = currency.format(monthData.saldo);

  return (
    <div className="mgcf-print-shell min-h-screen bg-slate-100 px-4 py-4 text-slate-900">
      <style>{`
        @page {
          size: A4 portrait;
          margin: 5mm;
        }

        @media print {
          html, body, #root {
            width: 100% !important;
            height: auto !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: visible !important;
            background: white !important;
          }

          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .mgcf-app-shell > aside,
          .mgcf-app-shell .mgcf-app-topbar,
          .mgcf-app-shell .mgcf-app-main > :not(.mgcf-print-shell) {
            display: none !important;
          }

          .mgcf-print-shell {
            display: block !important;
            width: 100% !important;
            min-height: auto !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }

          .mgcf-app-shell .mgcf-app-main {
            margin: 0 !important;
            padding: 0 !important;
          }

          .mgcf-app-shell .mgcf-app-main > .mgcf-print-shell {
            display: block !important;
          }

          .mgcf-print-controls {
            display: none !important;
          }

          .mgcf-print-card {
            display: block !important;
            box-shadow: none !important;
            border: none !important;
            width: 100% !important;
            max-width: none !important;
            margin: 0 !important;
            transform: none !important;
          }

          .mgcf-report-icon,
          .mgcf-print-spacer {
            display: none !important;
          }
        }
      `}</style>
      <div className="mgcf-print-controls mx-auto mb-4 w-full max-w-[1120px] rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="text-sm font-semibold uppercase tracking-wide text-slate-500">Stampa resoconto contabile</div>
            <p className="mt-1 text-sm text-slate-600">Seleziona anno e mese, poi premi il pulsante per aprire la maschera di stampa.</p>
          </div>
          <button
            type="button"
            onClick={handlePrint}
            disabled={!currentPeriod || exportingPdf}
            className="inline-flex items-center justify-center rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-orange-500 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {exportingPdf ? "Generazione PDF..." : "Genera PDF"}
          </button>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          <label className="text-sm font-medium text-slate-700">
            Anno
            <select
              value={selectedYear}
              onChange={(event) => setSelectedYear(event.target.value)}
              className="mt-2 w-full rounded-md border border-slate-300 bg-white px-4 py-2 outline-none focus:border-orange-500"
            >
              <option value="">Seleziona anno</option>
              {availableYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium text-slate-700">
            Mese
            <select
              value={selectedMonth}
              onChange={(event) => setSelectedMonth(event.target.value)}
              className="mt-2 w-full rounded-md border border-slate-300 bg-white px-4 py-2 outline-none focus:border-orange-500"
            >
              <option value="">Seleziona mese</option>
              {monthsForSelectedYear.map((monthNumber) => (
                <option key={monthNumber} value={monthNumber}>
                  {monthLabel(monthNumber)}
                </option>
              ))}
            </select>
          </label>
          <div className="flex items-end text-sm text-slate-500">
            Periodo selezionato: <span className="ml-1 font-semibold text-slate-700">{currentPeriod || "nessuno"}</span>
          </div>
        </div>
        {exportError ? (
          <p className="mt-3 text-sm font-semibold text-red-600">{exportError}</p>
        ) : null}
      </div>
      {currentPeriod ? (
        <div ref={reportCardRef} className="mgcf-print-card mx-auto w-full max-w-[1120px] overflow-hidden border border-slate-300 bg-white shadow-xl">
          <header className="grid min-h-[120px] gap-0 grid-cols-[180px_1fr_250px]">
          <div className="flex h-full items-center justify-start px-3 py-3">
            <div className="mgcf-print-logo">
              <Logo compact />
            </div>
          </div>

          <div className="flex h-full items-center justify-center px-2 py-3 text-center">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">Resoconto contabile mensile</div>
              <div className="mt-1 text-2xl font-bold tracking-tight text-slate-900">{monthLabel(month).toUpperCase()} • {year}</div>
            </div>
          </div>

          <div className="mt-2 mr-3 mb-2 flex h-full flex-col justify-center bg-transparent px-4 py-3 text-right text-slate-900">
            <div className="text-[9px] font-semibold uppercase tracking-[0.22em] text-slate-900">Periodo di riferimento</div>
            <div className="mt-1 text-sm font-semibold text-slate-900">{periodRange}</div>
            <div className="mt-3 text-[9px] font-semibold uppercase tracking-[0.22em] text-slate-900">Documento generato il</div>
            <div className="mt-1 text-sm font-semibold text-slate-900">{generatedDate}</div>
          </div>
        </header>

        <div className="mt-3 border border-slate-300/40">
        <section className="bg-rose-50 px-4 py-2.5">
          <SectionTitle title="Lista accrediti per conto" tone="rose" Icon={CheckSquare} />

          <div className="mt-2 overflow-hidden rounded-none border border-slate-300/40 bg-white">
            <div className="grid grid-cols-[100px_150px_1fr_110px] gap-0 border-b border-slate-300/40 bg-slate-50 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              <span>Data</span>
              <span>Conto</span>
              <span>Causale</span>
              <span className="text-right">Importo</span>
            </div>
            <div className="divide-y divide-slate-300/40">
              {currentPeriodAccredits.map((item) => (
                <div key={item.id ?? `${item.movementDate}-${item.accountId}-${item.amount}`} className="grid grid-cols-[100px_150px_1fr_110px] gap-0 px-3 py-1.5 text-[11px]">
                  <span className="tabular-nums text-slate-500">{formatDate(new Date(`${String(item.movementDate).slice(0, 10)}T00:00:00`))}</span>
                  <span className="min-w-0 truncate font-semibold" style={{ color: item.accountColor || "#475569" }}>{item.accountName ?? "-"}</span>
                  <span className="min-w-0 truncate text-slate-700">{item.causeName ?? item.notes ?? "-"}</span>
                  <span className="text-right font-semibold tabular-nums text-slate-900">{currency.format(parseAmount(item.amount))}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-slate-300/40 bg-sky-50 px-4 py-2.5">
          <SectionTitle title="Parziale saldo ricavo e accrediti" tone="sky" Icon={PieChart} />

          <div className="mt-2 grid grid-cols-[1fr_110px] overflow-hidden rounded-none border border-slate-300/40 bg-white">
            <div className="min-w-0 border-r border-slate-300/40">
              <div className="grid grid-cols-[1.35fr_1.1fr_1.1fr_1.1fr_0.9fr] gap-0 border-b border-slate-300/40 bg-slate-50 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                <span>Conto</span>
                <span className="text-right">Saldo corrente</span>
                <span className="text-right">Ricavo del mese</span>
                <span className="text-right">Importo accrediti</span>
                <span className="text-right">Numero accrediti</span>
              </div>
              <div className="divide-y divide-slate-300/40">
                {accountColumns.map((account) => {
                  const data = monthData.byAccount[String(account.id)] ?? {};
                  return (
                    <div key={account.id} className="grid grid-cols-[1.35fr_1.1fr_1.1fr_1.1fr_0.9fr] gap-0 px-4 py-1.5 text-[11px]">
                      <span className="min-w-0 truncate font-semibold" style={{ color: account.color || "#475569" }}>{account.name}</span>
                      <span className="text-right tabular-nums text-slate-700">{data.currentBalance == null ? "-" : currency.format(data.currentBalance)}</span>
                      <span className={`text-right tabular-nums ${data.revenue == null ? "text-slate-400" : data.revenue < 0 ? "text-red-600 font-semibold" : "text-slate-900"}`}>{data.revenue == null ? "-" : currency.format(data.revenue)}</span>
                      <span className="text-right tabular-nums text-slate-700">{data.credits ? currency.format(data.credits) : "-"}</span>
                      <span className="text-right tabular-nums text-slate-700">{data.count || "-"}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col items-center justify-center px-2 py-2 text-center text-sky-700">
              <div className="text-[9px] font-semibold uppercase tracking-wide text-slate-500">Numero totale accrediti</div>
              <div className="mt-1 text-5xl font-bold leading-none tabular-nums">{monthData.totalCredits}</div>
            </div>
          </div>
        </section>

        <section className="border-t border-slate-300/40 bg-emerald-50 px-4 py-2.5">
          <SectionTitle title="Rendiconto generale contabile" tone="emerald" Icon={TrendingUp} />

          <div className="mt-2 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
            <PrintMetric label="Totale accrediti del mese" value={currency.format(monthData.income)} tone="yellow" Icon={ArrowUpCircle} numericValue={monthData.income} />
            <PrintMetric label="Totale uscite del mese" value={currency.format(monthData.expense)} tone="red" Icon={ArrowDownCircle} numericValue={monthData.expense} />
            <PrintMetric label="Totale ricavo del mese" value={currency.format(monthData.net)} tone="blue" Icon={PieChart} numericValue={monthData.net} />
            <PrintMetric label="Totale saldo del mese" value={totalBalance} tone="green" Icon={Calculator} numericValue={monthData.saldo} />
          </div>
        </section>
        </div>
        </div>
      ) : (
        <div className="mx-auto w-full max-w-[1120px] rounded-xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center text-slate-500 shadow-sm">
          Seleziona anno e mese per vedere il resoconto e aprire la maschera di stampa.
        </div>
      )}
    </div>
  );
}