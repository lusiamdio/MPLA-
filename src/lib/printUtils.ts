/**
 * Safe printing utility designed for iframe & browser environments.
 * Avoids popup blocker errors when window.open() is restricted or blocked.
 */
export function safePrintHtml(htmlContent: string, title = "Impressão Oficial MPLA"): boolean {
  try {
    // Try window.open first
    const printWin = window.open("", "_blank");
    if (printWin) {
      printWin.document.open();
      printWin.document.write(htmlContent);
      printWin.document.close();
      printWin.focus();
      // Allow assets/styles to load then print
      setTimeout(() => {
        try {
          printWin.print();
        } catch (e) {
          console.error("Print call failed on window.open:", e);
        }
      }, 400);
      return true;
    }
  } catch (err) {
    console.warn("window.open blocked, falling back to hidden iframe printing:", err);
  }

  // Fallback: Invisible iframe in document body (iframe-safe)
  try {
    const existingFrame = document.getElementById("__mpla_print_frame__");
    if (existingFrame) {
      existingFrame.remove();
    }

    const iframe = document.createElement("iframe");
    iframe.id = "__mpla_print_frame__";
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    iframe.style.visibility = "hidden";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (doc) {
      doc.open();
      doc.write(htmlContent);
      doc.close();

      setTimeout(() => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        } catch (e) {
          console.error("Iframe print execution failed:", e);
        } finally {
          setTimeout(() => {
            iframe.remove();
          }, 3000);
        }
      }, 500);
      return true;
    }
  } catch (frameErr) {
    console.error("All print methods failed:", frameErr);
  }

  return false;
}
