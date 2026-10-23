/**
 * Clean In-App Toast & Notification Helper
 * Replaces window.alert() with smooth, non-blocking notification banners
 */

type ToastType = "success" | "error" | "info" | "warning";

export function showToast(message: string, type: ToastType = "info", duration = 3500) {
  if (typeof document === "undefined") return;

  const containerId = "__mpla_toast_container__";
  let container = document.getElementById(containerId);

  if (!container) {
    container = document.createElement("div");
    container.id = containerId;
    container.style.position = "fixed";
    container.style.top = "20px";
    container.style.right = "20px";
    container.style.zIndex = "99999";
    container.style.display = "flex";
    container.style.flexDirection = "column";
    container.style.gap = "8px";
    container.style.maxWidth = "380px";
    container.style.width = "calc(100vw - 40px)";
    container.style.pointerEvents = "none";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.style.pointerEvents = "auto";
  toast.style.padding = "12px 16px";
  toast.style.borderRadius = "12px";
  toast.style.fontSize = "12px";
  toast.style.fontWeight = "600";
  toast.style.boxShadow = "0 8px 24px rgba(0,0,0,0.15)";
  toast.style.display = "flex";
  toast.style.alignItems = "center";
  toast.style.gap = "10px";
  toast.style.transition = "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)";
  toast.style.transform = "translateY(-10px)";
  toast.style.opacity = "0";
  toast.style.fontFamily = "system-ui, -apple-system, sans-serif";

  // Colors based on type
  if (type === "success") {
    toast.style.backgroundColor = "#065f46";
    toast.style.color = "#ffffff";
    toast.innerHTML = `<span style="font-size:16px;">✓</span> <span>${message}</span>`;
  } else if (type === "error") {
    toast.style.backgroundColor = "#991b1b";
    toast.style.color = "#ffffff";
    toast.innerHTML = `<span style="font-size:16px;">⚠</span> <span>${message}</span>`;
  } else if (type === "warning") {
    toast.style.backgroundColor = "#92400e";
    toast.style.color = "#ffffff";
    toast.innerHTML = `<span style="font-size:16px;">⚡</span> <span>${message}</span>`;
  } else {
    toast.style.backgroundColor = "#1e293b";
    toast.style.color = "#ffffff";
    toast.innerHTML = `<span style="font-size:16px;">ℹ</span> <span>${message}</span>`;
  }

  container.appendChild(toast);

  // Animate in
  requestAnimationFrame(() => {
    toast.style.transform = "translateY(0)";
    toast.style.opacity = "1";
  });

  // Remove after duration
  setTimeout(() => {
    toast.style.transform = "translateY(-10px)";
    toast.style.opacity = "0";
    setTimeout(() => {
      toast.remove();
      if (container && container.children.length === 0) {
        container.remove();
      }
    }, 300);
  }, duration);
}
